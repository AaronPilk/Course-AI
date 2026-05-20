---
module: 3
position: 2
title: "Coalescing and access patterns"
objective: "Understand the access patterns that make memory fast."
estimated_minutes: 8
---

# Coalescing and access patterns

## The puzzle

Two CUDA kernels can have identical compute, identical occupancy, identical block sizes — and one runs 10x faster than the other. The difference is often how they access memory.

GPU memory bandwidth is enormous (~3 TB/s on H100), but only if you access it the right way. The "right way" has a name: coalescing. Understanding it is one of the highest-leverage things you can learn about CUDA performance.

## The simple version

When threads in a warp access global memory, the GPU's memory controller combines their requests into "transactions" — chunks of 32, 64, or 128 bytes.

If 32 threads in a warp each read 4 consecutive bytes (= 128 bytes total) starting at an aligned address, the hardware combines them into ONE 128-byte transaction. All 32 threads get their data in one trip.

If those same 32 threads each read from 32 random addresses, the hardware does many separate transactions. Effective bandwidth: ~3% of what you'd get with coalescing.

The pattern to follow: **adjacent threads should access adjacent memory**.

## The technical version

### What coalescing actually is

A modern GPU memory transaction is 128 bytes (or smaller, 32/64 bytes, depending on the access pattern). The memory controller serves transactions, not individual byte loads.

When a warp issues a load instruction, all 32 threads simultaneously request a memory address. The hardware tries to combine these into as few transactions as possible:

- 32 threads, 32 consecutive 4-byte addresses, 128-byte aligned → **1 transaction of 128 bytes**.
- 32 threads, 32 consecutive 4-byte addresses, misaligned → **2 transactions**.
- 32 threads, 32 scattered addresses → **up to 32 transactions**.

Each extra transaction is wasted bandwidth. The hardware can only serve so many per cycle.

### The coalesced pattern

The canonical coalesced access:

```cuda
__global__ void coalesced(float* x) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    float v = x[idx];                    // thread i reads x[i]
    // ...
}
```

Thread 0 reads `x[0]`, thread 1 reads `x[1]`, thread 31 reads `x[31]`. All 32 reads combine into one transaction. Perfect.

This is why the `int idx = blockIdx.x * blockDim.x + threadIdx.x` pattern is so common — it makes thread-to-data mapping naturally coalesced.

### The strided (anti-)pattern

Strided access kills performance:

```cuda
__global__ void strided(float* x, int stride) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    float v = x[idx * stride];           // each thread skips by `stride`
}
```

If `stride = 32`, thread 0 reads `x[0]`, thread 1 reads `x[32]`, thread 2 reads `x[64]`... The 32 threads in a warp access 32 different 128-byte chunks. 32 transactions instead of 1. Effective bandwidth: ~3% of peak.

Strided access patterns arise naturally from matrix-column iteration, transpositions, and certain algorithmic structures. They are one of the most common performance bugs.

### Coalescing rules in detail

Modern GPUs (Compute Capability 6.0+) coalesce when:

1. All threads in a warp access memory in the same operation.
2. The accesses span as few 128-byte aligned segments as possible.

Specifically:

- 32 threads × 4-byte access = 128 bytes total. If aligned to 128-byte boundary: 1 transaction.
- Misaligned by N bytes: 2 transactions (one for each spanned segment).
- Sparse access spanning K segments: K transactions.

There's no requirement that threads access *in order* within the segment — just that all accesses land in the same 128-byte block.

### Coalescing for different data sizes

The 128-byte transaction can serve:

- 32 threads × 4-byte reads (most common: `float`, `int`).
- 32 threads × 8-byte reads as 2× 128-byte transactions (`double`, `int64`).
- 32 threads × 16-byte reads as 4× 128-byte transactions (`float4`, etc.).

Vector types (`float2`, `float4`) can actually be faster for memory-bound kernels because each thread issues a wider load:

```cuda
float4 v = reinterpret_cast<float4*>(x)[idx];
// v.x, v.y, v.z, v.w are 4 floats loaded together
```

One thread loads 16 bytes; a warp loads 512 bytes per instruction. Higher per-instruction bandwidth, fewer instructions, often faster.

### Two-dimensional layouts

For 2D data (matrices, images), how you lay it out in memory determines coalescing:

**Row-major** (C-style): consecutive elements in the same row are adjacent in memory. Thread (x, y) reads `data[y * width + x]`. Threads varying in x (same y) access consecutive memory — coalesced.

**Column-major** (Fortran-style): consecutive elements in the same column are adjacent. Thread (x, y) reads `data[x * height + y]`. Threads varying in y access consecutive memory.

The launch pattern matters too. For row-major data and a 2D thread block, having the x-dimension (fastest-varying) match the row direction gives coalesced reads.

In matrix operations, sometimes you want one layout for the input and another for the output. Transpose operations are exactly this — and naïve transposes are notoriously slow because either reads or writes are strided. Optimized transposes use shared memory to convert strided to coalesced.

### Misalignment

A subtle pitfall: if your data isn't 128-byte aligned, even consecutive-access patterns may span 2 transactions instead of 1.

`cudaMalloc` returns 256-byte aligned pointers, so allocations are fine. But if you pass a pointer offset (`x + 17`), the offset can break alignment.

Modern hardware is more forgiving than older generations, but alignment still matters for peak performance. Use `__align__(16)` on structs and prefer naturally-aligned offsets.

### Read-only data: `__ldg`

If your data is read-only within a kernel, you can use the texture cache via `__ldg`:

```cuda
float v = __ldg(&x[idx]);              // hint: read-only, use texture cache
```

This routes reads through the read-only cache, which can help when many threads read overlapping data. Effect varies by hardware; on modern GPUs the compiler often does this automatically when it can prove the data is read-only.

Marking pointers with `const __restrict__` lets the compiler infer read-only-ness:

```cuda
__global__ void kernel(const float* __restrict__ x, float* y) { ... }
```

Use this when applicable — it can help the compiler generate better code.

### Atomic operations

Atomic operations (atomicAdd, atomicMax, etc.) ensure that read-modify-write sequences are serialized for the same memory location. Atomics on different addresses are independent.

Atomic bandwidth is much lower than normal global memory bandwidth. If many threads atomic-update the same address, they serialize and performance collapses.

Common pattern: thousand threads doing `atomicAdd(&counter, 1)` to a single global counter → very slow. Fix: each block accumulates locally, one atomic per block at the end. This is the same hierarchical-reduction pattern as before.

### How to detect coalescing issues

NVIDIA Nsight Compute reports:

- **Global memory load efficiency**: 100% = perfectly coalesced; lower = some bytes wasted.
- **Memory transactions per request**: 1 = ideal; higher = pattern issue.
- **L2 cache hit rate**: high helps when access patterns repeat.

For CUDA code review, looking for `idx * stride` or `idx ^ something` patterns is a quick smoke test for non-coalesced access.

### Patterns that defeat coalescing

Common culprits:

- **Array-of-structs**: `struct{a,b,c} arr[N]`. Thread i reads `arr[i].a` — non-consecutive because of the b and c fields between.
- **Column-by-column access on row-major data**: `data[col * width + row]` with threads varying in row.
- **Random scatter/gather**: `output[index[i]] = ...` where `index[i]` is unpredictable.
- **Strided slicing**: accessing every Nth element.

Fixes generally involve:

- Switch to struct-of-arrays: separate arrays for `a`, `b`, `c`. Coalesced access to each.
- Transpose data layout to match access pattern.
- For scatter/gather, use shared memory as a staging area.

### Bank conflicts (shared memory's version)

Shared memory has its own access-pattern rules. It's divided into 32 banks; if two threads in a warp access the same bank simultaneously (different addresses), they serialize.

The classic case: column-by-column access to a 32-wide 2D shared array. Each column maps to one bank; 32 threads accessing the same column = 32-way bank conflict.

Fix: pad the array by 1 element per row (`__shared__ float arr[32][33];` instead of `[32][32]`). This shifts the column mapping so columns now spread across all banks. We'll cover this more in the next lesson.

### Putting it together

A coalesced kernel for vector add:

```cuda
__global__ void add(const float* __restrict__ a, const float* __restrict__ b,
                    float* __restrict__ c, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n) c[idx] = a[idx] + b[idx];  // all 3 accesses are coalesced
}
```

A non-coalesced kernel that does the same logic:

```cuda
__global__ void add_bad(const float* a, const float* b, float* c, int n, int stride) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    int i = idx * stride;                  // strided access
    if (i < n) c[i] = a[i] + b[i];
}
```

Same arithmetic, very different memory bandwidth. Sometimes 10-30x performance difference.

### Why this matters more than algorithmic optimization

For memory-bound kernels (most simple kernels), achieving coalesced access gets you to memory-bandwidth limit. From there, you can't go faster without changing the algorithm.

For compute-bound kernels (well-tuned matmul), coalescing the inputs is necessary but not sufficient. You also need shared-memory tiling, register reuse, etc.

Either way, coalescing is foundational. Kernels with non-coalesced access leave the most performance on the table for the least engineering effort to fix.

## Three real-world scenarios

**Scenario 1: A naive image transpose.**
Read pixel (x, y), write to position (y, x). One direction is coalesced; the other is strided. Naive transpose hits 5-10 GB/s on a GPU capable of ~1 TB/s. Optimized transpose uses shared memory: read coalesced into shared, transpose in shared (cheap), write coalesced out. Gets close to peak bandwidth.

**Scenario 2: An array-of-structs particle system.**
Each particle has position, velocity, mass — stored as `struct Particle { float3 pos; float3 vel; float mass; }`. Threads update positions: `particles[i].pos.x += particles[i].vel.x * dt`. Non-coalesced because struct fields are interleaved in memory. Fix: split into `pos_x[N], pos_y[N], pos_z[N], vel_x[N], ...`. Now each field is contiguous; coalesced access. 5-10x speedup typical.

**Scenario 3: A histogram counting many small bins.**
Many threads atomicAdd to a small set of bin counters. Threads atomically updating the same bin serialize. Fix: per-block local histograms in shared memory, then one atomic per block to global. From ~5% of peak to ~80% of peak.

## Common mistakes to avoid

- **Strided access patterns** — kill bandwidth.
- **Array-of-structs** for hot fields — use struct-of-arrays.
- **Ignoring alignment** — misaligned access doubles transaction count.
- **Naive transpose** — always shared-memory tile it.
- **Heavy atomic contention** — hierarchical reduce first.
- **Not measuring coalescing** — use Nsight to confirm.

## Read more

- NVIDIA CUDA C++ Best Practices Guide — memory chapter.
- NVIDIA developer blog: "How to Access Global Memory Efficiently in CUDA C/C++ Kernels."
- *Programming Massively Parallel Processors* — memory access patterns.

## Summary

- **Coalescing**: combining 32 thread requests into one transaction.
- **Ideal**: 32 consecutive 4-byte reads from 128-byte aligned address.
- **Strided access**: kills bandwidth (3% of peak).
- **Adjacent threads should access adjacent memory** — the universal rule.
- **Struct-of-arrays** beats array-of-structs for hot fields.
- **Layout choice** (row vs column major) interacts with access pattern.
- **Shared memory** is the workaround for inherently bad patterns.
- **Atomics** on contended addresses serialize — use hierarchical patterns.

Next: shared memory and tiling.
