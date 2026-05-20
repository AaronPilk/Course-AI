---
module: 3
position: 4
title: "Occupancy, latency hiding, and bottlenecks"
objective: "Diagnose what's actually slow in a GPU program."
estimated_minutes: 8
---

# Occupancy, latency hiding, and bottlenecks

## The puzzle

You've written a CUDA kernel. It runs, produces correct results, but performance is mediocre. Now what? "Use more threads" might help; might not. "More shared memory" might help; might hurt. Without a model for what's bottlenecking you, optimization is guesswork.

This lesson is about the diagnostic framework: occupancy, latency hiding, and the bottlenecks that limit kernels in practice.

## The simple version

Three things can bottleneck a kernel:

1. **Memory bandwidth**: reading or writing global memory is the limit.
2. **Compute throughput**: the arithmetic units are saturated.
3. **Latency / occupancy**: not enough warps to hide memory and pipeline latency.

Diagnose which one is your bottleneck, then optimize that specific thing. Different bottlenecks need different fixes.

- Memory-bound? Coalesce, reduce traffic via shared memory, use better access patterns.
- Compute-bound? Use Tensor Cores, better algorithms, reduce work.
- Occupancy-limited? Reduce register/shared memory per block to fit more warps per SM.

Profile first, optimize second. NVIDIA Nsight Compute tells you the answer.

## The technical version

### Occupancy defined

Occupancy = (active warps per SM) / (max warps per SM).

Max warps per SM is a hardware constant — typically 48 or 64 on modern NVIDIA GPUs.

If your kernel has 16 active warps per SM, on hardware with max 64, occupancy is 25%.

Higher occupancy generally improves latency hiding (more warps for the scheduler to swap to during stalls). But it's not always the right optimization — sometimes lower occupancy with more per-thread resources is faster.

### What limits occupancy

Three constraints, whichever is binding wins:

**Registers per thread**: SM register file ÷ registers-per-thread ÷ threads-per-block = max blocks per SM.

Example: 64K registers, 32 registers/thread, 256 threads/block → 64000/(32*256) = 7.8 → 7 blocks per SM = 56 warps. Probably full occupancy.

If your kernel uses 80 registers/thread, the number drops: 64000/(80*256) = 3 blocks per SM = 24 warps. Half occupancy.

**Shared memory per block**: SM shared memory ÷ shared-per-block = max blocks per SM (from this constraint).

100KB shared memory, 16KB/block → 6 blocks per SM.
100KB shared memory, 32KB/block → 3 blocks per SM.

**Block size and SM block limit**: SMs have a max blocks-per-SM (typically 16-32). Larger blocks fit fewer.

The binding constraint determines actual occupancy. NVIDIA provides an "Occupancy Calculator" tool (and Nsight reports this directly).

### Why occupancy isn't everything

A common misconception: "higher occupancy = better." Actually:

- Occupancy is a means, not an end. The goal is latency hiding.
- Above some threshold (often ~40-50%), more occupancy gives diminishing returns.
- Sometimes lower occupancy with more per-thread work is faster (per-thread tiling, register reuse).
- For some compute-bound kernels, occupancy doesn't matter — the ALUs are already saturated.

Don't blindly target 100% occupancy. Target the occupancy that maximizes performance for your specific kernel.

### Latency hiding mechanics

Memory loads take ~400-800 cycles. During this wait, the issuing warp can't proceed. If the GPU has many other resident warps, the scheduler switches to them. The original warp's load completes "in the background."

For latency to be fully hidden, you need enough warps in flight that one of them is always ready while others wait. Roughly: latency-cycles × required-warps-per-scheduler / 32 = needed warps.

On Ampere/Hopper: ~400 cycle latency × 1 instruction per cycle = ~400 instructions of work needed to fill the gap. With ~4 schedulers per SM and 32 threads per warp, that's roughly ~13 warps continuously issuing.

Most kernels need 16-32 resident warps per SM (~25-50% occupancy) for reasonable latency hiding. Beyond that, returns diminish.

### Memory bandwidth ceiling

Even with perfect coalescing and high occupancy, you can't exceed the GPU's memory bandwidth. For most simple kernels (element-wise ops, simple reductions), memory bandwidth is the ceiling.

Modern GPUs:

- A100: ~1.5 TB/s.
- H100: ~3 TB/s.
- B100/B200: ~5+ TB/s.

If your kernel achieves ~80% of these numbers, you're memory-bound and at peak. Further optimization requires reducing memory traffic (shared memory tiling) or changing the algorithm.

### Compute ceiling

For high-arithmetic-intensity kernels (like matmul on Tensor Cores), the ceiling is FLOPs:

- A100 (FP16 Tensor Cores): ~312 TFLOPS.
- H100 (FP16/BF16 Tensor Cores): ~989 TFLOPS.
- H100 (FP8 Tensor Cores): ~1979 TFLOPS.

If you hit ~70-80% of these, you're compute-bound and well-tuned.

### Diagnosing the bottleneck

NVIDIA Nsight Compute is the tool. Key metrics:

- **SM Throughput** (% of peak FLOPs): high = compute-bound.
- **Memory Throughput** (% of peak bandwidth): high = memory-bound.
- **Achieved Occupancy**: vs theoretical occupancy.
- **Warp stall reasons**: what's actually stalling.

Common stall reasons:

- **Memory Dependency**: waiting on a global memory access. Suggests memory-bound; try coalescing, shared memory, or more occupancy.
- **Synchronization**: waiting at `__syncthreads()`. Suggests too-fine-grained sync; try larger blocks.
- **Execution Dependency**: waiting on previous instruction. Compute-bound or low ILP.
- **Long Scoreboard**: waiting on long-latency operation. Often memory.

A well-tuned kernel has one dominant stall reason (the bottleneck) and you optimize for that.

### Memory-bound kernel optimization

If memory-bound:

1. **Coalesce all global memory access** (Module 3 Lesson 2).
2. **Reduce memory traffic** via shared memory tiling.
3. **Use read-only cache** (`__ldg`, `const __restrict__`).
4. **Vectorize loads** (`float4` instead of `float`).
5. **Compress data** if feasible (FP16 instead of FP32, INT8 instead of INT32).
6. **Increase occupancy** to hide remaining memory latency.

Goal: get memory bandwidth utilization up to 70-80%+ of peak.

### Compute-bound kernel optimization

If compute-bound:

1. **Use Tensor Cores** for matrix-multiply-heavy work (Module 5).
2. **Reduce work** via algorithmic improvements (better algorithms, less redundant compute).
3. **Use lower precision** (FP16/BF16/FP8) where acceptable.
4. **Improve instruction-level parallelism** within threads.
5. **Use fused multiply-add** (FMA) where possible.

Goal: get arithmetic throughput up to 70-80%+ of peak.

### Occupancy-limited kernel optimization

If occupancy is the limit (insufficient latency hiding):

1. **Reduce registers per thread** (`-maxrregcount` compiler flag, or restructure kernel).
2. **Reduce shared memory per block** (smaller tiles, less per-block scratch).
3. **Smaller block size** (more blocks fit per SM).
4. **Accept some spilling** if it improves occupancy.

Goal: enough resident warps that the scheduler always has work.

### The roofline model

Visualize a kernel as a point on the roofline plot:

- X-axis: arithmetic intensity (FLOPs / byte).
- Y-axis: achieved performance (FLOPs/sec).
- Diagonal: memory-bandwidth ceiling (bandwidth × intensity).
- Horizontal: compute peak.

Your kernel sits at some point. The ceiling depends on where you are:

- Low intensity: bandwidth limits you.
- High intensity: compute limits you.
- The "crossover" is the arithmetic intensity at which the ceilings meet.

If you're below ceiling, you have room to optimize. The bottleneck tells you which optimization to pursue.

### Profiling workflow

A practical CUDA optimization workflow:

1. **Write a working kernel.** Correctness first.
2. **Profile with Nsight Compute.** Get the bottleneck.
3. **Apply the right optimization** for that bottleneck.
4. **Re-profile.** Confirm improvement.
5. **Repeat** until further optimization isn't worth the engineering effort.

Most kernels go through 3-5 iterations of this. Each iteration usually adds 1.5-3x performance.

Stopping criteria: you're within a reasonable factor of peak; the remaining gain doesn't justify more engineering; or you've hit a hardware ceiling you can't go past.

### Common bottleneck-misdiagnosis patterns

Mistakes I've seen many times:

1. **Adding more threads to a memory-bound kernel.** More threads don't help; you're already saturating bandwidth.
2. **Adding shared memory to a memory-bound kernel without reuse.** Shared memory only helps if you reuse data.
3. **Optimizing inside loops when launch overhead dominates.** Many small kernel launches → fix launch frequency first.
4. **Targeting 100% occupancy at all costs.** Often 50% occupancy with more per-thread work is faster.
5. **Hand-tuning when libraries exist.** cuBLAS will beat your custom matmul. Use it.

The instinct that needs developing: profile first, optimize what the profiler shows.

### Tools beyond Nsight Compute

- **Nsight Systems**: timeline view of CPU+GPU interaction (good for finding host-side bottlenecks).
- **`nvprof` / CUDA profiling**: command-line profiling, older but useful.
- **CUPTI**: low-level profiling API for custom tooling.
- **PyTorch profiler**: integrates with PyTorch, shows per-op timing.

For ML workloads, PyTorch's profiler is often more useful than Nsight because it operates at the framework level.

### When the bottleneck isn't on the GPU

Sometimes the GPU is fine but the wall-clock is dominated by:

- Host-device transfers (Module 2).
- CPU preprocessing.
- Kernel launch overhead (many small launches).
- Disk I/O.

Nsight Systems shows the timeline so you can see whether the GPU is doing useful work or waiting. If the GPU shows idle gaps, look at what's happening on the CPU side or in I/O.

### The 80/20 of GPU optimization

Most of the speedup comes from a few changes:

1. **Coalesce memory access** (5-30x improvement on memory-bound kernels).
2. **Tile with shared memory** (3-10x on reuse-heavy kernels).
3. **Use libraries** (cuBLAS/cuDNN: usually 2-5x over custom).
4. **Use lower precision** where acceptable (~2x).
5. **Use Tensor Cores** for matmul-heavy work (~5x over standard).

After these, you're getting into specialized territory. Most production kernels stop after the first few optimizations because the remaining gains aren't worth the engineering.

## Three real-world scenarios

**Scenario 1: A custom training kernel running slow.**
Profile shows 95% memory bandwidth utilization, 20% compute utilization. Diagnosis: memory-bound. Fix: switch to FP16 (half the memory), add shared-memory tiling for the inner loops. Result: 1.7x speedup.

**Scenario 2: A kernel with 100% occupancy but poor performance.**
Compute utilization 30%. Memory bandwidth 30%. Bottleneck unclear at first. Closer look: warp stall reason is "Execution Dependency" — sequential dependencies between instructions. Fix: refactor inner loop to reduce serial chains (more independent work per iteration). Result: 2x speedup. Occupancy was high but instruction-level parallelism was poor.

**Scenario 3: A pipeline with many small kernels.**
GPU utilization in Nsight Systems looks like ~20% — long gaps between kernel launches. The bottleneck isn't any single kernel; it's launch overhead. Fix: fuse small kernels into larger ones (CUDA graphs or manual kernel fusion). Result: 3x speedup.

## Common mistakes to avoid

- **Optimizing without profiling** — guessing wastes time.
- **Targeting occupancy as an end goal** — it's a means.
- **Fixing the wrong bottleneck** — speeds up the non-binding constraint.
- **Hand-tuning what libraries do better** — cuBLAS/cuDNN exist for a reason.
- **Ignoring host-side bottlenecks** — sometimes GPU is fine and CPU is the limit.
- **Stopping too early** or **going too far** — know when "good enough" is good enough.

## Read more

- NVIDIA Nsight Compute documentation.
- NVIDIA CUDA C++ Best Practices Guide — occupancy and tuning chapters.
- Roofline model paper (Williams, Waterman, Patterson).

## Summary

- **Three bottleneck categories**: memory, compute, occupancy/latency.
- **Occupancy** = active warps / max warps per SM. Higher helps latency hiding up to a point.
- **Limited by**: register count, shared memory, block size, max-blocks-per-SM.
- **Don't target 100% occupancy** blindly; aim for the value that maximizes performance.
- **Profile first, optimize second.** Nsight Compute tells you the bottleneck.
- **Different bottlenecks** need different fixes — coalesce for memory, Tensor Cores for compute, reduce per-thread resources for occupancy.
- **Roofline model** visualizes the achievable peak given arithmetic intensity.
- **80/20**: coalescing + shared memory + libraries + lower precision get you most of the way.

That wraps Module 3. Next: the CUDA ecosystem — libraries, profiling tools, and abstractions.
