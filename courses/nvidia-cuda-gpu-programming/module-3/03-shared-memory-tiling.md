---
module: 3
position: 3
title: "Shared memory and tiling"
objective: "Use the GPU's on-chip memory for major speedups."
estimated_minutes: 8
---

# Shared memory and tiling

## The puzzle

A naive GPU matrix multiplication kernel reaches maybe 5-10% of the GPU's peak compute. A well-tuned version reaches 70-90%. The difference isn't a smarter algorithm — it's the same multiply-accumulate logic. The difference is shared memory and a pattern called tiling.

If coalescing is about reading efficiently, tiling is about reading *less*. Same data, used more times.

## The simple version

Shared memory is a small on-chip scratchpad — fast, programmer-managed, per-block. The tiling pattern:

1. Each block loads a tile of input data from global memory into shared memory (coalesced, once).
2. Threads in the block reuse the shared data many times to compute many outputs.
3. The block writes its outputs back to global memory.

Effective memory traffic drops by a factor equal to the tile reuse. For matrix multiplication, that's the tile size (typically 16-64x reduction). Compute units stay busy instead of waiting on memory.

## The technical version

### Declaring shared memory

Two ways to declare shared memory:

**Static** (size known at compile time):

```cuda
__global__ void kernel(...) {
    __shared__ float tile[32][32];
    // ...
}
```

**Dynamic** (size set at launch):

```cuda
__global__ void kernel(...) {
    extern __shared__ float scratch[];
    // ...
}

// Launch with explicit shared memory size:
kernel<<<blocks, threads, sizeof(float) * 1024>>>(...);
```

Static is more common; dynamic is useful when the size depends on launch parameters.

Total shared memory per block is limited (typically 48 KB by default, configurable up to ~228 KB on modern hardware via `cudaFuncSetAttribute`).

### The basic tiling pattern

Generic tiled kernel skeleton:

```cuda
__global__ void tiled_kernel(const float* in, float* out, int N) {
    __shared__ float tile[TILE_SIZE];

    int idx = blockIdx.x * blockDim.x + threadIdx.x;

    // 1. Load tile from global to shared, coalesced
    tile[threadIdx.x] = in[idx];
    __syncthreads();

    // 2. Use shared memory for fast access
    float result = compute_using(tile);
    __syncthreads();   // before next iteration if any

    // 3. Write back to global, coalesced
    out[idx] = result;
}
```

The key wins:

- The load from `in[]` is coalesced (adjacent threads, adjacent addresses).
- Subsequent accesses to `tile[]` are fast on-chip.
- If `compute_using` reads `tile[]` many times, you've amortized the global load.

### Tiled matrix multiplication

The textbook example. Compute `C = A * B` where each is N×N.

Naive version: each thread computes one `C[i][j] = sum over k of A[i][k] * B[k][j]`. Each thread reads N elements of A (row i) and N elements of B (column j). Total reads: 2*N per thread, N²×N threads = 2*N³. Each input element used N times.

Tiled version: divide A and B into TILE×TILE sub-matrices. Each block computes one TILE×TILE tile of C. For each step:

1. Load a TILE×TILE tile of A and a TILE×TILE tile of B into shared memory (coalesced).
2. All threads in the block compute partial dot products using shared tiles.
3. Move to next K-tile, repeat.
4. Write final C tile.

Each global memory load of an A or B tile serves TILE threads worth of work. Memory traffic drops by a factor of TILE.

Pseudocode:

```cuda
#define TILE 16
__global__ void matmul_tiled(const float* A, const float* B, float* C, int N) {
    __shared__ float Asub[TILE][TILE];
    __shared__ float Bsub[TILE][TILE];

    int row = blockIdx.y * TILE + threadIdx.y;
    int col = blockIdx.x * TILE + threadIdx.x;
    float sum = 0.0f;

    for (int t = 0; t < N / TILE; ++t) {
        // Each thread loads one element of A and B sub-tiles
        Asub[threadIdx.y][threadIdx.x] = A[row * N + (t * TILE + threadIdx.x)];
        Bsub[threadIdx.y][threadIdx.x] = B[(t * TILE + threadIdx.y) * N + col];
        __syncthreads();

        // Compute partial dot product using shared tiles
        for (int k = 0; k < TILE; ++k)
            sum += Asub[threadIdx.y][k] * Bsub[k][threadIdx.x];
        __syncthreads();
    }
    C[row * N + col] = sum;
}
```

A few details:

- `__syncthreads()` after the loads ensures all threads see fully-loaded tiles.
- The inner k-loop runs entirely in shared memory.
- Second `__syncthreads()` ensures all threads finish with shared tiles before overwriting them.

Performance: this version is ~10x faster than naive for moderate N. Production matmul (cuBLAS) does many more optimizations on top — vectorized loads, Tensor Cores, multi-tile reuse — to hit 70-90% of peak.

### Bank conflicts

Shared memory is divided into 32 banks. If two threads in a warp access the same bank simultaneously (different addresses), they serialize (a "bank conflict").

For 32-bit accesses, bank = address % 32. Consecutive 32-bit elements map to consecutive banks. Thread i reading `shared[i]` accesses bank i — no conflict.

The classic conflict: column access of a `[32][32]` shared array. Thread i reads `shared[i][col]`. All threads have the same `col`, and `shared[i][col]` for `i = 0..31` maps to bank `col`, `col`, `col`, ... — all 32 threads hit the same bank. 32-way conflict, 32x slowdown.

Fix: pad by one element:

```cuda
__shared__ float shared[32][33];   // note: 33, not 32
```

Now `shared[i][col]` has address `i * 33 + col`. Threads i = 0..31 hit banks `(0*33 + col) % 32, (1*33 + col) % 32, ...` = `col, col+1, col+2, ...` — different banks. No conflict.

The "+1 padding" trick is canonical in CUDA tile code. It costs a tiny bit of shared memory but eliminates 32-way conflicts.

### When shared memory doesn't help

Not every kernel benefits from shared memory:

- **Element-wise operations** (vector add): each element used once. Loading into shared adds latency without reuse benefit.
- **Workloads already at memory-bandwidth limit**: shared memory doesn't bypass global memory; it amplifies its reuse. If you're not reusing, shared memory adds nothing.
- **Kernels with tiny per-block data**: overhead of staging through shared memory exceeds the benefit.

Rule of thumb: shared memory helps when input data is reused (multiple times across threads in the block). Without reuse, skip it.

### Shared memory vs L1 cache

Modern NVIDIA GPUs share the same on-chip memory between L1 cache and shared memory. You can configure the split:

```cuda
cudaFuncSetAttribute(myKernel, cudaFuncAttributeMaxDynamicSharedMemorySize, 100 * 1024);
```

More shared memory = less L1 cache, and vice versa. Tuning is workload-dependent. Generally, explicitly-managed shared memory beats automatic L1 caching for predictable patterns.

### Shared memory and occupancy

Shared memory per block affects occupancy. Each SM has a fixed shared memory budget; using more per block means fewer blocks resident per SM.

Concrete example: SM has 100 KB shared memory.
- 8 KB per block → 12 blocks per SM.
- 32 KB per block → 3 blocks per SM.

Fewer resident blocks = less latency hiding. Sometimes you want more shared memory per block (more reuse); sometimes less (more occupancy). Profile to find the sweet spot.

### Async shared memory loads

CUDA 11+ added `cuda::memcpy_async`, which lets the GPU issue a global-to-shared copy that completes in the background while the kernel does compute. This lets you overlap memory loads with compute:

```cuda
__shared__ float tile[TILE];

// Issue async load of next tile while computing on current
cuda::memcpy_async(thread_group, &tile[0], &input[next_idx], sizeof(float) * TILE);
// Compute on previous tile's data (already loaded)
// ...
cuda::memcpy_async::wait();
```

Hopper has a Tensor Memory Accelerator (TMA) that does this even more efficiently for bulk transfers. Modern high-performance kernels use these patterns extensively.

### Distributed shared memory (Hopper+)

On Hopper, blocks can be grouped into "clusters" and share each other's shared memory ("distributed shared memory" or DSMEM). This expands the effective shared memory pool for problems that need more.

```cuda
__cluster_dims__(2, 1, 1)
__global__ void kernel(...) { ... }
```

Cluster-level cooperation is a newer feature; most current code doesn't use it. Mentioned because it's where things are going for very high-performance kernels.

### Real performance progression

For matrix multiplication (N=4096):

| Approach | Time | % of peak FLOPS |
|----------|------|-----------------|
| Naive (no shared) | ~500 ms | ~3% |
| Tiled shared memory | ~50 ms | ~30% |
| Tiled + register tiling | ~25 ms | ~60% |
| Tensor Cores (cuBLAS) | ~5 ms | ~90% |

Each step is more engineering effort. Real production code uses libraries (cuBLAS, cuDNN) that get to the top tier. Custom kernels often stop at "tiled shared memory" because the marginal gains from further optimization don't justify the effort.

### Shared memory beyond tiling

Other uses of shared memory:

- **Reductions**: gather warp/block partial sums.
- **Broadcasts**: one thread loads, many threads read.
- **Inter-thread communication**: producer-consumer within a block.
- **Histogram bins**: per-block local histograms before global atomic.
- **Scratchpad for irregular access**: cache irregular patterns into linear layout.

Shared memory is general-purpose; tiling is just the most common use case.

### Knowing when to use shared memory

Decision rule:

1. **Is data reused across threads?** If no, skip shared memory.
2. **Is the reuse > ~4x?** If yes, shared memory probably wins. If borderline, profile.
3. **Will the shared memory limit occupancy?** If shared memory per block is large, fewer blocks resident — check whether the reuse benefit outweighs the occupancy loss.

These tradeoffs are why shared memory tuning is one of the harder CUDA topics. Profiling with Nsight is the answer to most "should I shared-memory this?" questions.

## Three real-world scenarios

**Scenario 1: A naive matmul kernel.**
Each thread computes one C[i][j] by reading the full row of A and full column of B from global memory. Same elements loaded many times by different threads. Achieves ~5% of peak. Switch to tiled shared memory: ~30% of peak. Real production code uses cuBLAS with Tensor Cores: 90%+ of peak.

**Scenario 2: A 5x5 image filter.**
Each output pixel needs 25 input pixels. Neighboring output pixels share most of those 25 inputs. Naive: each thread reads 25 inputs. Shared memory tiling: block loads a tile (with overlap for the filter's edges), each thread reads from shared. Memory traffic drops by ~5x. Speedup: 3-5x.

**Scenario 3: A histogram with bank conflicts.**
A kernel populates a histogram in shared memory: `shared_hist[bin_index]++`. If many threads in a warp have the same bin_index, they atomic-update the same shared memory location — slow. Fix: pad and stride the histogram so threads land in different banks; or use per-warp histograms; or rely on hardware atomic improvements. Several CUDA techniques exist for fast histograms.

## Common mistakes to avoid

- **Using shared memory without reuse** — adds latency for no gain.
- **Bank conflicts** in stride-32 access patterns — pad by 1.
- **Forgetting `__syncthreads()`** between load and use — race conditions.
- **Over-using shared memory** — kills occupancy.
- **Static + dynamic shared confusion** — pick one strategy.
- **Not measuring** — assumptions about shared memory benefit are often wrong.

## Read more

- NVIDIA CUDA C++ Best Practices Guide — shared memory chapter.
- NVIDIA developer blog: posts on tiled matrix multiplication.
- *Programming Massively Parallel Processors* — chapter on shared memory and tiling.

## Summary

- **Shared memory**: per-block, on-chip, ~100x faster than global.
- **Tiling**: load tile to shared, reuse from shared, write back. Reduces global traffic by tile size.
- **Bank conflicts** in shared memory: stride-32 patterns serialize; pad by 1 to fix.
- **Memory traffic reduction** = arithmetic intensity increase = closer to compute-bound.
- **Shared memory limits occupancy** — tradeoff with reuse benefit.
- **Async loads** (`memcpy_async`) overlap shared loads with compute.
- **Not all kernels benefit** — element-wise ops don't reuse data.
- **Libraries (cuBLAS, cuDNN)** do this all for you in optimized form.

Next: occupancy and latency hiding.
