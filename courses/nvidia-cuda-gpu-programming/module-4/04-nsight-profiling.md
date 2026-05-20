---
module: 4
position: 4
title: "Profiling with Nsight and the optimization workflow"
objective: "Use NVIDIA's tools to find and fix bottlenecks."
estimated_minutes: 8
---

# Profiling with Nsight and the optimization workflow

## The puzzle

You wrote a CUDA program. It's slower than expected. Where do you look? Without measurement, optimization is guesswork — and most guesses are wrong. The first rule of GPU optimization is: profile before you optimize.

NVIDIA ships powerful profiling tools. Knowing what they show and how to read it separates effective CUDA work from wasted effort.

## The simple version

NVIDIA's profiling tool stack:

1. **Nsight Systems**: timeline view. Shows what's happening on CPU, GPU, and PCIe over time. Used to find host-side bottlenecks, kernel-launch overhead, and missed concurrency.
2. **Nsight Compute**: per-kernel deep dive. Shows occupancy, memory bandwidth, warp stall reasons, instruction mix. Used to optimize individual kernels.
3. **PyTorch profiler** (`torch.profiler`): framework-level timing. Shows per-op time in PyTorch. Used for ML workloads.
4. **`nvidia-smi`**: high-level GPU utilization. Quick sanity check; not for serious profiling.

A typical workflow: `nvidia-smi` to verify GPU is being used → Nsight Systems to find what's slow at a high level → Nsight Compute to optimize specific kernels → repeat.

## The technical version

### `nvidia-smi` — the first check

Run `nvidia-smi` at the command line:

```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.86.05    Driver Version: 535.86.05    CUDA Version: 12.2     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|=============================================================================|
|   0  NVIDIA H100 80GB HBM3   On| 00000000:01:00.0 Off |                    0 |
| N/A   42C    P0    98W / 700W |  10240MiB / 81920MiB |     45%      Default |
+-------------------------------+----------------------+----------------------+
```

Useful information:

- **GPU-Util**: percentage of time the GPU has at least one kernel running. 45% means the GPU was active 45% of the wall-clock time during the sampling interval. NOT a measure of how well the GPU is being used — a GPU at 100% util might still be running poorly-utilized kernels.
- **Memory-Usage**: how much GPU memory is allocated.
- **Pwr:Usage**: power consumption (rough proxy for actual work being done).
- **Temp**: thermal throttling check.

`nvidia-smi` is the "is anything happening?" check. It doesn't tell you *what* the GPU is doing.

### Nsight Systems — the timeline view

Nsight Systems shows what happens over time across CPU and GPU. Launched via:

```bash
nsys profile --trace=cuda,nvtx -o my_profile python train.py
nsys-ui my_profile.nsys-rep
```

The UI shows multiple "rows" of activity:

- CPU threads.
- CUDA API calls (kernel launches, memcpys).
- GPU compute engine.
- GPU copy engines (H2D, D2H).
- NVTX annotations (programmer-added markers).

What you look for:

- **Gaps in GPU activity**: GPU is idle waiting for CPU or I/O.
- **Lack of stream concurrency**: should-be-parallel operations are serialized.
- **Long PCIe transfers**: data movement is dominating.
- **Many small kernels**: launch overhead may be the issue.
- **Sync points**: where everything stops to wait.

Nsight Systems answers "is the GPU being kept busy doing useful work?"

### Nsight Compute — per-kernel deep dive

For optimizing a specific kernel, use Nsight Compute:

```bash
ncu --set full -o my_kernel python script.py
ncu-ui my_kernel.ncu-rep
```

(There's also `nv-nsight-cu-cli` and the GUI `ncu-ui`. Equivalent for our purposes.)

Per-kernel metrics include:

- **SM utilization**: how busy the compute units are.
- **Memory bandwidth**: % of peak DRAM bandwidth.
- **Achieved occupancy**: warps actively resident vs maximum.
- **Warp stall reasons**: detailed breakdown of why warps aren't issuing.
- **Memory throughput** (load, store, atomic).
- **Instruction mix**: how much is arithmetic vs memory vs control.
- **L1/L2 cache hit rates**.
- **Shared memory bank conflict count**.

Sample output (paraphrased):

```
Kernel: my_kernel
  Duration: 2.4 ms
  SM Throughput: 35.2%
  Memory Throughput: 89.1%
  Achieved Occupancy: 75%
  
  Warp Stall Reasons:
    Memory Dependency: 62%
    Execution Dependency: 18%
    Sync Dependency: 5%
    Other: 15%
```

This tells you: kernel is memory-bound (high memory %, low compute %). Optimization target: reduce memory traffic.

### Stall reason categories

When a warp can't issue an instruction, it stalls. The categories tell you why:

- **Memory Dependency**: waiting for global memory load. Most common; suggests memory-bound.
- **Execution Dependency**: waiting on previous instruction's result. Suggests low ILP within thread.
- **Synchronization**: waiting at `__syncthreads()`.
- **Math Pipe Throttle**: too many in-flight math operations.
- **Long Scoreboard**: waiting on a long-latency operation (often memory).
- **Short Scoreboard**: waiting on shared memory.
- **Constant Dependency**: waiting on constant memory load.
- **Drain**: end of kernel, waiting for outstanding ops.

The dominant stall reason points to the bottleneck. Memory dependencies dominant → focus on memory. Execution dependencies dominant → focus on instruction ordering.

### NVTX — programmer annotations

NVTX (NVIDIA Tools Extension) lets you mark sections of code with named ranges that show up in profiling:

```cpp
#include <nvtx3/nvToolsExt.h>

nvtxRangePush("DataLoading");
load_data(...);
nvtxRangePop();

nvtxRangePush("Forward Pass");
forward_pass(...);
nvtxRangePop();
```

In Nsight Systems, these appear as colored bars on a dedicated row, making it easy to associate timeline gaps with specific code sections. Essential for complex applications.

PyTorch has automatic NVTX annotations via `torch.cuda.nvtx.range_push/pop` or the context manager. Frameworks tag their internal ops.

### PyTorch profiler

For PyTorch workloads, the framework profiler is often more useful than Nsight directly:

```python
import torch.profiler as profiler

with profiler.profile(
    activities=[profiler.ProfilerActivity.CPU, profiler.ProfilerActivity.CUDA],
    record_shapes=True,
    profile_memory=True,
) as prof:
    for batch in train_loader:
        train_step(batch)

print(prof.key_averages().table(sort_by="cuda_time_total"))
```

Output shows per-PyTorch-op time, memory allocations, and CUDA kernel launches. Easier to map to code than raw CUDA profiling because it shows PyTorch ops directly.

You can also export to Chrome's tracing format for visual inspection.

### Common profiling-driven discoveries

Things you typically find:

1. **Many tiny kernel launches**: each costs ~5-10 microseconds in launch overhead. If your kernel itself takes 100 microseconds, 10% of time is launch overhead. Many small kernels means high overhead. Fix: kernel fusion, CUDA Graphs.

2. **Synchronous PyTorch ops blocking the GPU**: `tensor.item()` or `print(tensor)` forces synchronization, making the CPU wait for the GPU. Avoid in hot paths.

3. **CPU-side bottlenecks**: GPU is starved of work. The CPU code (data loading, preprocessing) is the slow part. Fix: more dataloader workers, prefetch, move preprocessing to GPU.

4. **Inefficient memory access patterns**: shows up as low memory throughput despite the kernel being memory-bound. Fix: coalescing, shared memory tiling.

5. **Low occupancy**: shows up as low SM throughput despite memory throughput also being low. Fix: reduce register/shared memory per block.

### The optimization workflow

A practical loop:

1. **Measure baseline.** Time the workload end-to-end.
2. **Identify dominant cost** via Nsight Systems. Is it one kernel? Many small ones? Data transfer? CPU?
3. **Drill into the bottleneck** with Nsight Compute (for kernels) or framework profiler (for end-to-end ops).
4. **Diagnose**: memory-bound, compute-bound, occupancy-limited, launch-overhead-bound, or transfer-bound?
5. **Apply the appropriate optimization.**
6. **Re-profile.** Confirm improvement; new bottleneck has likely emerged.
7. **Repeat** until further effort doesn't pay back.

Typical optimization runs: 3-7 iterations. Each iteration provides 1.5-3x speedup on its specific bottleneck. Total cumulative speedup: 5-30x over the naive starting point is common.

### When optimization isn't worth it

Profile-driven optimization eventually hits diminishing returns:

- Within 80% of peak bandwidth on memory-bound: hard to do better.
- Within 70% of peak FLOPS on compute-bound: hard to do better.
- Within 90% of theoretical: probably done.

Engineering time has a cost too. If you've achieved good performance and further work is days for 5% gains, it's usually not worth it.

The exception: production workloads where 5% means real money or real latency requirements. There, every optimization pays back.

### Profiling gotchas

Common confusions:

- **Profiling overhead changes timing**. Nsight Compute in particular slows execution significantly. Don't rely on absolute numbers from profiled runs.
- **Warmup matters**. CUDA's first kernel launch is slower than steady state. Profile multiple iterations.
- **Variance is real**. Run multiple times; report ranges or distributions, not single values.
- **Hardware differences matter**. An optimization that helps on A100 may not on H100. Profile on the hardware you'll deploy on.

### Building a profiling habit

For research/production work, profile early and often:

- Before optimizing: baseline + identify bottleneck.
- During optimization: confirm each change helps.
- Before claiming "this is fast": validate against the roofline.
- After deployment: monitor production to catch regressions.

Treating profiling as a separate "phase" (or worse, a one-time task) misses the value. It's a continuous practice.

### Tools in the broader landscape

Beyond NVIDIA's tools:

- **AMD ROCm tools** (rocprof, rocprofiler): equivalents for AMD GPUs.
- **Intel oneAPI tools**: for Intel GPUs.
- **Generic GPU profilers**: tools like CUDA's chrome:tracing format, NV-Insight, etc.
- **Cloud provider tools**: AWS CloudWatch GPU metrics, GCP's similar offerings.

For NVIDIA workloads, the Nsight family is canonical. Other tools exist for specific use cases but Nsight covers most needs.

## Three real-world scenarios

**Scenario 1: A training loop running at 30% GPU utilization.**
nvidia-smi shows 30% util — suspicious because the team expected 80%+. Nsight Systems reveals: long gaps between batches. The CPU dataloader is the bottleneck (single worker, no pinned memory). Fix: `num_workers=8, pin_memory=True`. Util jumps to 75%, training speeds up 2x.

**Scenario 2: A custom kernel achieving only 20% of memory bandwidth.**
Nsight Compute shows memory bandwidth at 20% of peak, warp stall reason 'Memory Dependency' dominant. Diagnosis: access pattern isn't coalescing. Examining the indexing reveals a strided access. Fix: restructure data layout. Bandwidth jumps to 75% of peak; kernel is 3x faster.

**Scenario 3: A small-kernel workload at 100% GPU util but slow.**
A signal processing pipeline runs many tiny kernels. nvidia-smi shows 100% util but throughput is low. Nsight Systems reveals kernel launch overhead (each launch ~6 microseconds) dwarfs the kernels themselves. Fix: fuse kernels via CUDA Graphs. Throughput goes up 4x; same hardware, same kernels, just less launch overhead.

## Common mistakes to avoid

- **Optimizing without profiling** — most of the time you're fixing the wrong thing.
- **Reading nvidia-smi as "the GPU is working hard"** — it shows utilization, not quality.
- **Single-run measurements** — variance is significant; measure repeatedly.
- **Ignoring warmup** — first launch is slower.
- **Profiling on wrong hardware** — H100 ≠ A100 ≠ RTX 4090.
- **Profiling with debug builds** — use release builds for performance work.

## Read more

- NVIDIA Nsight Systems user guide.
- NVIDIA Nsight Compute user guide.
- PyTorch profiler documentation.
- *Programming Massively Parallel Processors* — chapter on performance analysis.

## Summary

- **Profile first, optimize second.** Without measurement, you're guessing.
- **`nvidia-smi`**: quick sanity check; not for serious profiling.
- **Nsight Systems**: timeline view for finding bottlenecks across CPU+GPU+PCIe.
- **Nsight Compute**: per-kernel deep dive; metrics, stalls, occupancy.
- **PyTorch profiler**: framework-level for ML workloads.
- **Stall reasons** point to the bottleneck (memory-bound vs compute-bound vs sync).
- **Optimization is iterative**: 3-7 cycles typical; new bottlenecks emerge.
- **Diminishing returns** — know when to stop.

That wraps Module 4. Next: AI workloads and the GPU era.
