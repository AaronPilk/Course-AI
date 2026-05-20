---
module: 1
position: 2
title: "Throughput vs latency — picking the right tool"
objective: "Understand which workloads suit GPUs."
estimated_minutes: 8
---

# Throughput vs latency — picking the right tool

## The puzzle

If GPUs are so fast, why do people still write code for CPUs? Why doesn't every web request go through a GPU? Why is your laptop's everyday work still done on the CPU?

The answer is that "fast" isn't one thing. There's latency-fast (one thing done quickly) and there's throughput-fast (lots of things done over time). Hardware optimizes for one or the other, and using the wrong tool for the job wastes everything.

## The simple version

- **Latency** = how fast a single operation completes.
- **Throughput** = how many operations complete per second.

CPUs minimize latency. GPUs maximize throughput. They optimize for different shapes of workload.

A useful analogy: a sports car vs. a freight train.
- Sports car: gets one passenger from A to B fast. Bad at moving 1,000 passengers.
- Freight train: slow door-to-door for one passenger. Crushes everything else moving 10,000 tons of cargo.

If your workload is one urgent task, use the sports car (CPU). If it's a mountain of identical work, use the freight train (GPU).

## The technical version

### Defining latency

Latency is the time from "request" to "result" for a single operation. Examples:

- Time to handle one HTTP request.
- Time to execute one database query.
- Time to render one frame of a 3D scene.

CPUs aggressively optimize latency. Out-of-order execution rearranges instructions to keep the pipeline full. Branch prediction guesses outcomes. Big caches keep data close. The goal: this one thread, this one operation, completes as fast as possible.

Typical CPU operation latencies (rough):
- Register access: 1 cycle.
- L1 cache: 3-4 cycles.
- L2 cache: 10-12 cycles.
- DRAM: 200-300 cycles.

The CPU spends huge transistor area to hide these latencies — predicting, speculating, prefetching.

### Defining throughput

Throughput is operations per second across all parallel work. Examples:

- Tokens generated per second across all inference requests.
- Pixels rendered per second across the whole frame.
- Matrix elements computed per second in a matmul.

GPUs aggressively optimize throughput. They run thousands of threads. When one thread stalls (waiting for memory), the GPU just schedules another thread that's ready. With enough threads in flight, the GPU stays busy even though individual threads spend a lot of time waiting.

This trick is called **latency hiding** — the GPU doesn't try to make individual operations fast. It schedules other work during the wait.

### The wait problem

Memory is far away from the compute units, both physically and in time. Accessing DRAM takes hundreds of cycles. If a CPU stalls waiting for memory, it loses hundreds of cycles of work.

CPUs hide this with caches and prefetching — guessing what data you'll need and bringing it close.

GPUs hide this with parallelism — when one thread waits, another thread runs. With 10,000 threads in flight, somebody's always ready.

The two approaches use different transistor budgets to solve the same problem.

### Why latency-critical code is bad for GPUs

If you need a single result quickly, GPUs can be *slower* than CPUs. Reasons:

- **PCIe transfer overhead**: moving data CPU → GPU → CPU costs microseconds.
- **Kernel launch overhead**: kicking off a GPU operation costs ~5-10 microseconds.
- **Lower clock speed**: GPU clocks are ~1.5-2 GHz; CPU clocks are 4-5+ GHz.
- **Simpler per-thread execution**: no out-of-order, no branch prediction.

For a single small calculation, the CPU finishes before the GPU has even started. Only when you have enough work to amortize the overhead does the GPU pay off.

### Where the crossover happens

Rule of thumb: GPUs become advantageous when:

- The work is data-parallel.
- The amount of work is large enough to amortize transfer and launch overhead.
- The arithmetic intensity is high enough to use the GPU's compute units.

A 100x100 matrix multiplication might be slower on GPU than CPU because of overhead. A 10,000x10,000 matmul is dramatically faster on GPU. The breakeven point depends on the specific operation and hardware.

For batch sizes that matter in practice (modern AI workloads with batch sizes of hundreds or thousands), GPUs win clearly.

### The "arithmetic intensity" metric

Arithmetic intensity = (FLOPs performed) / (bytes of data accessed).

High arithmetic intensity: lots of math per byte. Suits GPUs.
Low arithmetic intensity: little math per byte. The bottleneck is memory bandwidth.

Matrix multiplication has high arithmetic intensity (each input byte is used in many operations). Element-wise operations have low arithmetic intensity (each input is used once).

GPUs help most when the arithmetic intensity is high — when the compute units can actually do work without waiting for memory. Lower-intensity workloads bottleneck on memory bandwidth even on GPUs.

### Roofline model

The classic visualization:

- X-axis: arithmetic intensity (FLOPs/byte).
- Y-axis: performance (FLOPs/second).
- Diagonal line: memory-bandwidth-limited region.
- Horizontal line: peak compute (compute-limited region).

Workloads fall under one of the two limits. Memory-bound workloads sit on the diagonal; compute-bound workloads hit the horizontal.

GPUs have very high peak compute AND high memory bandwidth, but they're balanced — for many workloads, memory bandwidth is the actual limit, not compute. Knowing whether your workload is memory-bound or compute-bound tells you where to optimize.

### Examples by workload type

**Matrix multiplication (high intensity, compute-bound)**: GPUs crush. The math repeatedly reuses data; arithmetic units stay busy.

**Element-wise ops like ReLU (low intensity, memory-bound)**: GPUs help but the speedup is limited by memory bandwidth. Same speedup as you'd get from any memory-bandwidth ratio improvement.

**Reductions (medium intensity)**: GPUs help significantly but require careful implementation to avoid bottlenecks.

**Sequential algorithms (no parallelism)**: GPUs lose. Use CPU.

### Why transformer inference is interesting

LLM inference has two phases:

- **Prefill** (processing the input prompt): high arithmetic intensity, lots of parallelism. GPUs shine.
- **Decode** (generating each output token one at a time): low arithmetic intensity for each token, memory-bandwidth-bound. GPUs still win but the speedup is smaller and the workload is wasteful of GPU compute.

This is why optimizations like batching, KV caching, speculative decoding, and tensor parallelism matter so much in production AI. Each is a different way to push the workload toward better arithmetic intensity.

### The PCIe bottleneck

CPUs and GPUs are connected by PCIe (or NVLink for some configurations). PCIe 5.0 bandwidth: ~64 GB/s per direction. Compare to GPU memory bandwidth: 3 TB/s.

Moving data between CPU and GPU is ~50x slower than accessing GPU memory. So:

- Don't move data back and forth needlessly.
- Keep data on the GPU as long as possible.
- Overlap data transfer with compute (using CUDA streams, covered in Module 4).

The PCIe penalty is one reason GPU programs get rewritten to do more work GPU-side. Even if some operation would be slightly faster on CPU, the cost of moving data back can eat the savings.

### When NOT to use a GPU

Don't reach for GPU when:

- The workload is sequential or branchy.
- Data is small (overhead dominates).
- You need single-result low latency.
- The operation is rare (once per second).
- You don't have engineering bandwidth for the GPU programming model.

For these cases, CPU is faster, simpler, and cheaper.

### Cost considerations

GPUs are expensive. An H100 is $25-40K. A high-end CPU is $1-5K. Power consumption: H100 ~700W, CPU ~200-400W.

Use a GPU only when:

- The speedup is enough to justify the cost.
- The workload runs frequently enough to amortize hardware investment.
- The alternative (more CPU machines) is more expensive.

For AI workloads, GPUs are dramatically cheaper per useful operation despite the per-unit cost. For random business logic, CPUs are cheaper.

## Three real-world scenarios

**Scenario 1: A single 1000x1000 matmul.**
On a modern GPU: ~milliseconds including transfer. On a modern CPU: ~10-50ms. GPU wins but the difference isn't huge for one matmul. The real GPU advantage shows up at much larger sizes or when you batch many matmuls.

**Scenario 2: Image generation for stable diffusion.**
Each diffusion step is dominated by matmuls and convolutions on large tensors. High arithmetic intensity, large enough to amortize overhead, batch sizes that fit GPU memory well. GPUs are 100x+ faster than CPUs. The choice isn't even close.

**Scenario 3: A real-time game's AI pathfinding.**
Pathfinding for a single character involves branchy graph search — A* or similar. Inherently sequential, branchy, latency-critical. CPU is the right tool. Even if you parallelize across many characters, the per-character work doesn't benefit from GPU.

## Common mistakes to avoid

- **Conflating latency and throughput** — they measure different things.
- **Putting tiny workloads on GPUs** — overhead dominates.
- **Ignoring arithmetic intensity** — memory bandwidth often limits real workloads.
- **Treating PCIe transfers as free** — they're slow.
- **Forgetting kernel launch overhead** — small kernels can be slower than CPU.

## Read more

- *Computer Architecture: A Quantitative Approach* by Hennessy & Patterson — latency vs throughput foundations.
- NVIDIA's CUDA Best Practices Guide.
- *Programming Massively Parallel Processors* by Hwu — roofline and intensity analysis.

## Summary

- **Latency** = one operation's wall-clock time.
- **Throughput** = operations per second across all parallel work.
- **CPUs**: latency-optimized via out-of-order, branch prediction, big caches.
- **GPUs**: throughput-optimized via latency hiding through massive parallelism.
- **Arithmetic intensity** (FLOPs per byte) determines GPU benefit.
- **PCIe overhead** punishes small data transfers between CPU and GPU.
- **GPU breakeven** depends on workload size, parallelism, and intensity.
- **Use the right tool**: GPU for big parallel arithmetic, CPU for everything else.

Next: how the GPU actually schedules all those threads — SIMT.
