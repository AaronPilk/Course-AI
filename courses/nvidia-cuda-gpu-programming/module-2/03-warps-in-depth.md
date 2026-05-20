---
module: 2
position: 3
title: "Warps — what they are and why they matter"
objective: "See how the GPU schedules work in groups of 32."
estimated_minutes: 8
---

# Warps — what they are and why they matter

## The puzzle

You write CUDA code thinking about individual threads. But the GPU doesn't actually schedule individual threads — it schedules warps of 32. Most of the difference between fast and slow CUDA code comes from understanding this gap.

If Module 1 introduced warps, this lesson goes deep: why 32, how warps actually execute, what warp-level primitives let you do, and the patterns that warp-aware programming unlocks.

## The simple version

A warp is 32 threads that execute together in lockstep. The GPU's smallest scheduling unit. Everything about CUDA performance — branch divergence, memory coalescing, occupancy — happens at the warp level.

Three big ideas:

1. **All 32 threads execute the same instruction** at the same time (with some can be masked off).
2. **Memory accesses combine** across the warp into bigger transactions.
3. **Threads in a warp can directly exchange data** without going through shared memory.

Warp-aware code can be dramatically faster than warp-ignorant code, often by 2-10x.

## The technical version

### Anatomy of a warp

A warp is 32 consecutive threads from a block, identified by their `threadIdx`:

- Warp 0: threads with `threadIdx.x` 0-31.
- Warp 1: threads with `threadIdx.x` 32-63.
- Warp 2: threads with `threadIdx.x` 64-95.
- ...

For a 256-thread block, that's 8 warps. For a 1024-thread block, 32 warps.

In 2D blocks, threads are flattened in `x`-major order: `(x, y)` becomes `y * blockDim.x + x`. A 16×16 block has 8 warps; warp 0 is `y=0`, threads 0-15 + `y=1`, threads 0-15 (split awkwardly across the x-axis for `blockDim.x=16`).

A block of `16×16` is one warp per row only if `blockDim.x = 32`; otherwise warps cross row boundaries. For 2D blocks, `blockDim.x = 32` is often a smart choice so each warp is one row of pixels.

### Warp execution

When a warp issues an instruction:

1. The warp scheduler picks a ready warp.
2. The instruction is fetched once.
3. All 32 threads in the warp execute it together with their own data.
4. Threads that are "masked off" (due to a branch) sit idle but still occupy the slot.

Each SM has multiple warp schedulers (typically 4) — so multiple warps issue instructions per cycle. With enough resident warps, the SM stays busy even when individual warps wait on memory.

### Branch divergence revisited

When threads in a warp need to take different paths:

```cuda
if (threadIdx.x % 2 == 0) {
    a();
} else {
    b();
}
```

Half the threads want `a()`; half want `b()`. The hardware handles this by executing both paths sequentially with masking:

1. Execute `a()` with threads where `threadIdx.x % 2 == 0` active (others masked off).
2. Execute `b()` with threads where `threadIdx.x % 2 != 0` active (others masked off).

Effective throughput: 50% of peak. Both paths run; you pay for both.

**Independent thread scheduling** (Volta and later): modern GPUs can reconverge threads more efficiently and can interleave divergent paths in some cases. But the fundamental cost of divergence remains — your two paths both have to execute.

The fix is to restructure the work:

- Move the branch outside the inner loop.
- Sort/group data so adjacent threads take the same branch.
- Split into two kernels, one per branch.

### Coalesced memory access

When threads in a warp read or write memory, the hardware combines their requests into transactions. The ideal pattern:

- 32 threads each access a 4-byte value (`float`, `int`).
- The 32 addresses are consecutive in memory.
- The starting address is aligned to 128 bytes.

The hardware turns this into ONE 128-byte memory transaction. All 32 threads get their data in a single trip to memory.

If the addresses are scattered or not aligned, the hardware does multiple transactions:

- 32 threads accessing 32 scattered addresses might require 32 separate transactions.
- Effective bandwidth: ~3% of peak.

This is one of the most important performance patterns in CUDA. We'll cover it in detail in Module 3.

### Warp-level primitives

Modern CUDA exposes primitives that operate at the warp level:

**`__shfl_sync()`**: directly exchange register values between threads in a warp.

```cuda
int my_value = ...;
int neighbor_value = __shfl_sync(0xFFFFFFFF, my_value, threadIdx.x ^ 1);
```

This swaps `my_value` with the neighbor whose thread index differs by 1 — entirely in registers, no shared memory, no global memory.

Other primitives:

- `__shfl_sync(mask, val, src_lane)`: get value from arbitrary lane.
- `__shfl_up_sync(mask, val, delta)`: get value from lane `tid - delta`.
- `__shfl_down_sync(mask, val, delta)`: get value from lane `tid + delta`.
- `__ballot_sync(mask, predicate)`: get a 32-bit bitmask of which threads in the warp satisfy a predicate.
- `__any_sync(mask, predicate)` / `__all_sync(mask, predicate)`: aggregate predicates.

These are the building blocks for warp-level reductions, scans, and other patterns.

### Warp-level reduction

The classic example. Sum 32 values across a warp into one value:

```cuda
__inline__ __device__ float warp_reduce_sum(float val) {
    val += __shfl_xor_sync(0xFFFFFFFF, val, 16);
    val += __shfl_xor_sync(0xFFFFFFFF, val, 8);
    val += __shfl_xor_sync(0xFFFFFFFF, val, 4);
    val += __shfl_xor_sync(0xFFFFFFFF, val, 2);
    val += __shfl_xor_sync(0xFFFFFFFF, val, 1);
    return val;        // thread 0 now has the sum; all other threads have partial values
}
```

Five operations, no shared memory, no synchronization. Compared to the older shared-memory reduction (which used `__syncthreads()` at each step), this is faster and simpler.

Warp-level reductions are the foundation of efficient block-wide and grid-wide reductions: each warp reduces internally, then warps combine via shared memory, then blocks combine via global memory.

### The mask parameter

You'll notice the `0xFFFFFFFF` in the warp primitives — that's a 32-bit mask indicating which threads in the warp are "participating." `0xFFFFFFFF` means all 32 threads participate.

In code where some threads have exited (due to a branch), the mask reflects which threads are active. Getting the mask wrong causes undefined behavior. The `_sync` suffix on these functions exists because earlier (non-sync) versions had subtle bugs around divergence; the modern versions force you to be explicit.

A common pattern: `__activemask()` returns the mask of threads currently active in the warp.

### Why 32 specifically

The warp size of 32 has been stable across many NVIDIA generations. The number balances:

- **Hardware cost**: bigger warps need wider scheduling.
- **Memory transaction size**: 32 × 4 bytes = 128 bytes (matches DRAM burst sizes).
- **Branch divergence cost**: smaller warps mean less hardware idling on divergent branches.
- **Software compatibility**: changing it would break a lot of code.

Other GPU vendors use different sizes: AMD uses "wavefronts" of 64 threads historically; recent generations also support 32. Apple's GPUs use SIMD groups of 32. Intel's xPU uses subgroups of varying sizes.

For NVIDIA CUDA, 32 is the magic number. Code that's not aware of it leaves performance on the table.

### Warps and occupancy

Recall from Module 1: occupancy is the ratio of active warps to maximum possible warps per SM.

Concrete numbers for a modern SM (Ampere/Hopper):

- Max warps per SM: 48 or 64 (varies).
- Max threads per SM: 1536 or 2048.
- Register file: 64K-256K registers per SM.
- Shared memory per SM: 100-228 KB depending on configuration.

If your kernel uses 32 registers per thread and 4 KB shared memory per block of 256 threads:
- Register limit: 65536 / (32 × 256) ≈ 8 blocks per SM = 64 warps.
- Shared memory limit: 100000 / 4000 = 25 blocks per SM.
- Block-per-SM hardware limit: ~16-32.

The minimum is the binding constraint. Occupancy = (resident warps) / (max warps).

Higher occupancy generally means better latency hiding. But it's not a one-dial optimization — sometimes 50% occupancy with fast kernels beats 100% with slow ones.

### Persistent threads pattern

A pattern that explicitly uses warp behavior: launch exactly enough threads to fill all SMs, then have each thread (or warp) loop over a queue of work.

```cuda
__global__ void persistent_kernel(int* work_queue, int total_work) {
    int tid = threadIdx.x + blockIdx.x * blockDim.x;
    int stride = blockDim.x * gridDim.x;
    for (int i = tid; i < total_work; i += stride) {
        process(work_queue[i]);
    }
}
```

Instead of launching one thread per work item, you launch a smaller fixed number of threads and have each do many items. Reduces kernel launch overhead and lets you use warp-level coordination more freely.

### Warp-level performance debugging

When optimizing CUDA kernels:

1. **Profile with Nsight** to see warp-level metrics:
   - Warp execution efficiency (% of threads active per instruction).
   - Branch divergence count.
   - Memory transaction efficiency.
   - Stall reasons (memory dependency, sync, etc.).

2. **Check warp efficiency** — if it's not near 100%, you have divergence.

3. **Look at instruction issue rate** — if low, you may have occupancy or scheduling issues.

4. **Watch stall reasons** — memory stalls (need more occupancy or coalescing); sync stalls (too many barriers); execution stalls (compute-bound).

Warp-level metrics are usually where the bottleneck shows up.

### When you can ignore warps

If you're using PyTorch or another framework with pre-built kernels, the warp-aware code is already written for you (by NVIDIA's cuDNN and cuBLAS authors). You can usually treat the framework as a black box.

If you're writing custom kernels, especially performance-critical ones, warp-aware design is essential. The 5-10x speedup of warp-level reductions over naive approaches is too much to leave on the table.

## Three real-world scenarios

**Scenario 1: A poorly-written sum reduction.**
A junior engineer writes a reduction using `atomicAdd` to a single global variable. All threads in a warp serialize through the atomic. Slow. Warp-level reduction first (5 shuffle ops), then one atomic per warp (or block) → 100x faster.

**Scenario 2: Branch divergence in pixel classification.**
A kernel classifies pixels: "is this pixel a face?" Half the pixels are; half aren't. The classification branches diverge. By sorting pixels into "likely face" and "likely not face" lists before launching the kernel, you reduce divergence per warp. Speedup: ~2x.

**Scenario 3: A scan (prefix sum).**
Compute the cumulative sum of an array. Naive sequential algorithm doesn't parallelize. The right approach uses warp-level scans (via shuffles) as the building block, then block-wide scans, then grid-wide. Each level has 5x parallelism over the next, and warp shuffles avoid shared-memory traffic. State-of-the-art GPU scans run at near memory-bandwidth peak.

## Common mistakes to avoid

- **Ignoring warps in custom kernels** — leaves 2-10x performance on the table.
- **Using shared memory when shuffles would work** — shuffles are faster.
- **Wrong sync mask** — undefined behavior, hard to debug.
- **Block size not a multiple of 32** — wasted warp slots.
- **Over-optimizing occupancy** — sometimes register usage matters more.

## Read more

- NVIDIA CUDA C++ Programming Guide — warp-level intrinsics.
- NVIDIA developer blog: warp shuffle posts.
- CUB library (NVIDIA's warp/block/grid primitives in C++).

## Summary

- **A warp is 32 threads** executing in lockstep — the GPU's scheduling unit.
- **Branch divergence** causes serialization of paths.
- **Memory coalescing** combines warp accesses into single transactions.
- **Warp-level primitives** (`__shfl_sync` and friends) enable register-to-register data exchange.
- **Warp reductions** are faster than shared-memory reductions.
- **Block size** should be a multiple of 32.
- **Occupancy** is measured in warps per SM.
- **Frameworks hide warps**; custom kernels can't ignore them.

Next: how to actually move data between CPU and GPU.
