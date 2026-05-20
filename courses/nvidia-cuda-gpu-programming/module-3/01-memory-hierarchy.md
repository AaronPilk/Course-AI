---
module: 3
position: 1
title: "The CUDA memory hierarchy"
objective: "Map global, shared, register, and constant memory."
estimated_minutes: 8
---

# The CUDA memory hierarchy

## The puzzle

A GPU has multiple kinds of memory at different speeds and sizes. Where your data lives determines how fast your kernel runs. Get the placement right and you're at 80%+ of peak performance. Get it wrong and you're at 5%.

Unlike CPUs (which hide most of the hierarchy with automatic caching), CUDA exposes the memory hierarchy to the programmer. This is a feature, not a bug — explicit control is what makes GPUs fast for the right workloads.

## The simple version

The CUDA memory hierarchy, fastest to slowest:

1. **Registers**: per-thread, fastest, smallest. ~1 cycle to access.
2. **Shared memory**: per-block, on-chip, programmer-managed. ~20-30 cycles.
3. **L1 cache**: per-SM, automatic. ~30 cycles.
4. **L2 cache**: shared across SMs. ~100-200 cycles.
5. **Global memory (HBM/GDDR)**: GPU-wide, large. ~400-800 cycles.
6. **Host memory** (over PCIe): basically don't.

There are also two specialized read-only spaces:
- **Constant memory**: small (64 KB), cached, broadcast-optimized.
- **Texture/Surface memory**: spatial caching, for 2D/3D access patterns.

Fast CUDA code uses registers and shared memory aggressively; global memory accesses are coalesced and minimized.

## The technical version

### Registers

Each thread has its own private registers. Modern GPUs have huge register files — an H100 has 64 KB of registers *per SM* (16K 32-bit registers), shared across all resident threads.

Properties:

- **Per-thread**: each thread sees only its own registers.
- **Fastest**: 1 cycle for most operations.
- **Smallest per thread**: ~32-128 registers per thread typical; affects occupancy.
- **Compiler-managed**: you declare local variables; the compiler allocates registers.

Register pressure is a key tuning factor. If your kernel uses 100 registers per thread, fewer threads fit per SM, lowering occupancy. The compiler reports register usage; nvcc has `-maxrregcount` to cap it.

Register spilling: when a kernel needs more registers than available, the compiler "spills" some to local memory (which is actually in global memory). This is slow. Watch for spills in profiler output.

### Shared memory

Each block has access to a shared memory region — on-chip SRAM, programmer-controlled.

```cuda
__shared__ float scratch[256];
```

Properties:

- **Per-block**: only threads in the same block see it.
- **Fast**: ~100x faster than global memory.
- **Limited size**: 48-228 KB per SM depending on configuration.
- **Programmer-managed**: you decide what goes in.
- **Bank conflicts** possible: shared memory is divided into 32 banks; same-bank accesses serialize.

Used well, shared memory turns memory-bound kernels into compute-bound ones. Used poorly, it limits occupancy without helping.

Common pattern: load a block's worth of data from global into shared, all threads do work using shared, write results to global.

### L1 and L2 caches

Modern GPUs have hardware caches:

- **L1**: per-SM, ~128 KB, holds data and instructions. Configurable as L1 vs shared memory on some hardware.
- **L2**: shared across all SMs, ~40-60 MB on H100. Caches all global memory accesses.

You don't directly control these, but you benefit from them:

- Repeated access to the same data hits the cache.
- Spatial locality (nearby threads accessing nearby data) helps.
- L2 helps when multiple blocks read overlapping regions.

For some access patterns (random scattered reads), L2 hit rate determines performance. NVIDIA's nvprof/Nsight can show L2 hit/miss rates.

### Global memory

The main GPU memory — large, off-chip, slowest.

- **Size**: 24-80+ GB on modern GPUs.
- **Type**: HBM (data-center GPUs) or GDDR (consumer GPUs).
- **Bandwidth**: 1-3 TB/s.
- **Latency**: ~400-800 cycles uncached.

Allocated with `cudaMalloc`. Accessed by all threads in all blocks.

The two big performance considerations:

1. **Coalescing**: when threads in a warp access consecutive addresses, the hardware combines them into one transaction. We'll cover this in the next lesson.
2. **Bandwidth ceiling**: even with perfect coalescing, you can't exceed the GPU's memory bandwidth. Many real kernels are memory-bound.

### Constant memory

A small, special read-only region — 64 KB total, accessible from all threads.

```cuda
__constant__ float coefficients[256];

// From host:
cudaMemcpyToSymbol(coefficients, h_coeffs, sizeof(float) * 256);

// In kernel:
float c = coefficients[i];
```

Properties:

- Cached aggressively (separate from L1/L2).
- **Broadcast-optimized**: if all threads in a warp read the same constant, it's a single broadcast (fast).
- If threads read different constants, accesses serialize.

Used for filter coefficients, lookup tables, configuration parameters — small data that's the same across all threads in a warp.

### Texture and surface memory

Originally for graphics (2D/3D images). Provides:

- **Spatial caching**: optimized for 2D neighborhood access.
- **Hardware interpolation**: linear interpolation for free.
- **Address clamping/wrapping**: out-of-bounds reads handled in hardware.
- **Read-only** (textures) or **read-write** (surfaces).

In modern CUDA, textures are less commonly used outside graphics-adjacent workloads. Some image processing and ML inference codes still use them. We mention them mainly so you recognize them when reading other people's code.

### Local memory (the misleading name)

"Local memory" sounds fast but it's actually slow. It's per-thread storage that the compiler uses when:

- Arrays declared in kernel exceed register capacity.
- Register pressure causes spills.

Local memory lives in global memory. It's "local" in scope (per-thread), not in speed.

Avoid by:

- Using small fixed-size arrays.
- Reducing register pressure.
- Checking compiler output for spills.

### Memory hierarchy diagram (mental model)

```
                                Speed   Size           Scope
Register file                  fastest  64 KB / SM    per-thread
Shared memory / L1             very fast 100-228 KB    per-block (shared) or per-SM (L1)
L2 cache                       fast     40-60 MB       all SMs
Global memory (HBM)            slow     24-80 GB       all threads
Host memory (over PCIe)        slowest  TB              CPU
```

Programming for the GPU means moving data up this hierarchy — into shared memory, then registers — to do as much work as possible at high speed.

### The arithmetic intensity / hierarchy connection

Recall arithmetic intensity = FLOPs / bytes. The hierarchy helps by enabling data reuse:

- Load data from global to shared memory.
- Each thread reads multiple times from shared memory while doing arithmetic.
- Net arithmetic intensity per global-memory byte goes up.
- Compute units stay busy instead of waiting on memory.

The canonical example is matrix multiplication: each input element is used in many output elements. Without shared memory, each element is loaded from global multiple times. With shared memory tiling, each is loaded once and reused. Tens of times more performance.

### Where libraries hide all this

cuBLAS, cuDNN, and other NVIDIA libraries have hand-tuned kernels that use the memory hierarchy expertly. As a user of PyTorch or TensorFlow, you don't see this work — but the framework is calling these libraries under the hood.

When you write custom kernels, you take on responsibility for memory hierarchy management. It's where most CUDA performance work happens.

### Newer features (CUDA 12+)

Recent CUDA versions added:

- **Async copy from global to shared**: lets memory loads happen concurrently with compute (`cuda::memcpy_async`).
- **Tensor memory accelerator (TMA)** on Hopper: hardware unit for bulk async memory transfers.
- **Distributed shared memory**: blocks in the same cluster can share memory.

These are advanced features; we mention them because they're shaping high-performance CUDA code in 2025.

### What this means for your kernels

Practical rules:

1. **Use registers** for per-thread temporaries.
2. **Use shared memory** for data shared by threads in a block.
3. **Coalesce global memory** accesses (next lesson).
4. **Minimize global memory** traffic — reuse data where possible.
5. **Watch register pressure** — too many registers per thread hurts occupancy.
6. **Avoid spilling** to local memory.
7. **Use constant memory** for warp-uniform values.
8. **Don't fight the L1/L2 caches** — they help when access patterns are reasonable.

### The cost of getting this wrong

A naive matrix multiplication kernel that reads every element from global memory repeatedly might achieve 5-10% of peak FLOPS. A well-tuned version with shared memory tiling achieves 70-90%. The difference is the same hardware, the same data — just different memory-hierarchy strategy.

This is why CUDA programming is harder than CPU programming. CPUs forgive poor memory access patterns with their caches and prefetchers. GPUs make you think about memory explicitly.

## Three real-world scenarios

**Scenario 1: A naive matmul on GPU.**
Each thread computes one output element by reading rows and columns from global memory. Each input element is loaded N times. Memory traffic dominates; achieved performance ~5% of peak. The fix is shared-memory tiling.

**Scenario 2: A kernel using a small lookup table.**
A physics simulation uses a 256-element lookup table accessed by all threads. The right move: declare it `__constant__`. Threads that read the same index get a fast broadcast. Avoids burning shared memory on read-only data.

**Scenario 3: Register pressure killing occupancy.**
A complex kernel uses 128 registers per thread. The SM register file (65K) divided by 128 = 512 threads can be resident. With 256 threads per block, only 2 blocks fit per SM (16 warps). Low occupancy means poor latency hiding. Reducing registers (sometimes by introducing shared memory) brings occupancy up.

## Common mistakes to avoid

- **Treating global memory as fast** — it's the slowest GPU memory.
- **Ignoring registers** — the compiler does much but you should know your usage.
- **Over-using shared memory** — costs occupancy if too much per block.
- **Forgetting constant memory exists** — easy win for broadcast data.
- **Mistaking "local memory" for fast** — it lives in global memory.
- **Letting register spills happen** — slows everything.

## Read more

- NVIDIA CUDA C++ Programming Guide — memory hierarchy chapter.
- NVIDIA developer blog: posts on shared memory and tiling.
- *Programming Massively Parallel Processors* — detailed memory chapter.

## Summary

- **Registers**: fastest, per-thread, ~1 cycle. Compiler-managed.
- **Shared memory**: very fast, per-block, programmer-managed. 48-228 KB.
- **L1/L2 caches**: automatic, help with locality.
- **Global memory**: slow but large; the main bandwidth bottleneck.
- **Constant memory**: small, read-only, broadcast-optimized.
- **Texture/surface**: spatial caching for 2D/3D patterns.
- **"Local memory" is misleading** — it lives in global memory.
- **The hierarchy is explicit** — programmer-managed, unlike CPU caches.

Next: how to make global memory access fast — coalescing.
