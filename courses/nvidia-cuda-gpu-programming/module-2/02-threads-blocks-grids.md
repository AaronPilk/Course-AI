---
module: 2
position: 2
title: "Threads, blocks, and grids"
objective: "Understand the hierarchy that organizes GPU work."
estimated_minutes: 8
---

# Threads, blocks, and grids

## The puzzle

When you launch a CUDA kernel with `<<<1024, 256>>>`, you're saying "1024 blocks of 256 threads each." Why two numbers instead of just one? Why not just say "launch 262,144 threads"?

The two-level hierarchy isn't arbitrary. It maps to GPU hardware: threads within a block can cooperate (shared memory, synchronization); threads in different blocks cannot. Designing kernels around the hierarchy is what separates fast GPU code from slow.

## The simple version

CUDA organizes parallelism in three levels:

1. **Thread**: the smallest unit. One thread does one piece of work.
2. **Block**: a group of threads (up to 1024) that can cooperate via shared memory and barriers.
3. **Grid**: a collection of blocks. Blocks don't cooperate; the grid is just a way to launch many blocks at once.

When you write a kernel, you think about what each *thread* does. When you launch, you say how many blocks and how many threads per block.

The block is the key unit. The hardware schedules blocks onto Streaming Multiprocessors (SMs). Threads within a block stay together; they can share memory and synchronize. Threads in different blocks act as if they're in different worlds.

## The technical version

### The three levels in detail

**Thread**: smallest unit. Each thread has its own registers and program counter. Threads can have unique behavior (though they share warps with 31 neighbors). Thread index: `threadIdx`.

**Block**: a group of up to 1024 threads. All threads in a block run on the same SM. They share:
- Shared memory (a small, fast, programmer-controlled scratchpad).
- A barrier primitive (`__syncthreads()`).
- An L1 cache.

Block index: `blockIdx`. Block size: `blockDim`.

**Grid**: a 1D, 2D, or 3D arrangement of blocks. The grid is just an organizational structure for kernel launches. Grid size: `gridDim`.

A kernel launch creates one grid containing many blocks containing many threads.

### Why the hierarchy

A flat "10,000 threads, all equivalent" model would be simpler to understand but worse for hardware:

- **Cooperation**: full cross-thread cooperation requires expensive global synchronization. Limiting cooperation to within-block keeps the hardware tractable.
- **Memory locality**: blocks fit on one SM. Threads in a block can share fast on-chip memory. Threads in different blocks would have to use slow global memory.
- **Scaling**: as long as blocks are independent, you can run more or fewer simultaneously based on hardware. The same kernel works on a small GPU (few SMs) or a huge GPU (many SMs).

The hierarchy is a compromise between programmer flexibility and hardware efficiency.

### 1D, 2D, 3D indexing

For 1D problems (arrays):

```cuda
int i = blockIdx.x * blockDim.x + threadIdx.x;
```

For 2D problems (images, matrices):

```cuda
int x = blockIdx.x * blockDim.x + threadIdx.x;
int y = blockIdx.y * blockDim.y + threadIdx.y;
```

Launched with a 2D grid and 2D blocks:

```cuda
dim3 block(16, 16);                    // 16x16 = 256 threads per block
dim3 grid((W + 15) / 16, (H + 15) / 16);  // enough blocks for W x H image
kernel<<<grid, block>>>(...);
```

For 3D (volumes), add a `z` component. The hardware supports all three; the choice depends on the problem's natural shape.

The mapping is purely organizational. A 1D launch with 1024 blocks × 256 threads is the same total work as a 2D launch with 32×32 blocks × 16×16 threads — but the indexing is cleaner for the natural shape of the problem.

### Block size choice

Block size constraints:

- Maximum 1024 threads per block (hardware limit on modern NVIDIA GPUs).
- Should be a multiple of 32 (warp size).
- Bounded by register and shared memory usage.

Practical block sizes: 128, 256, 512. Most kernels work well with 256.

Why these values:

- 128 threads = 4 warps per block. Good for kernels with high register usage.
- 256 threads = 8 warps. The classic default; balances occupancy and resources.
- 512 threads = 16 warps. Good when blocks do lots of cooperation.
- 1024 threads = 32 warps. Max possible; only useful in specific cases.

For 2D blocks, 16×16 = 256 is common; 32×32 = 1024 less so (uses too many resources for many kernels).

### Block independence

A critical design rule: blocks must not depend on each other. Specifically:

- Blocks can execute in any order.
- Two blocks may run simultaneously, sequentially, or interleaved.
- There's no way to synchronize across blocks within a kernel (except via cooperative-groups grid sync, which has limitations).

This independence is what lets the same kernel scale across GPUs of different sizes. A small GPU with 4 SMs runs blocks 4 at a time; a big GPU with 128 SMs runs blocks 128 at a time. Same code; different parallelism.

If your algorithm requires blocks to share intermediate results, you have to split it into multiple kernel launches, with global memory for inter-launch data.

### Shared memory: the block's superpower

Threads within a block can communicate via shared memory:

```cuda
__global__ void example(...) {
    __shared__ float scratch[256];

    int tid = threadIdx.x;
    scratch[tid] = some_value;
    __syncthreads();                  // wait for all threads in this block
    // Now scratch is fully populated; threads can read each other's values
    ...
}
```

Shared memory is:

- **On-chip**: ~100x faster than global memory.
- **Programmer-managed**: you control what goes in it.
- **Block-scoped**: only visible to threads in the same block.
- **Limited**: typically 48 KB per SM (some configurations allow up to ~228 KB).

Used well, shared memory transforms memory-bound kernels into compute-bound ones. Used poorly, it limits occupancy without helping. We'll cover this in Module 3.

### `__syncthreads()`

The barrier primitive. Every thread in a block must reach `__syncthreads()` before any can proceed past it.

This is the only intra-block synchronization. It's how threads coordinate access to shared memory: write your value, sync, read others' values, sync, continue.

`__syncthreads()` is fast (~tens of cycles) but it's still a synchronization point — using it too often or with too few threads per block hurts performance.

A critical rule: `__syncthreads()` must be reached by all threads in the block. If some threads return early due to a branch, you can deadlock.

### How blocks get scheduled

Hardware perspective: each SM can hold multiple blocks simultaneously (up to a hardware limit, often 16 or 32 blocks per SM). The number of resident blocks per SM is constrained by:

- Register usage per block.
- Shared memory usage per block.
- Maximum threads per SM.
- Maximum blocks per SM.

When a block finishes, the SM picks a new block from the grid. The grid is a queue; the GPU drains it.

For your kernel to use all the GPU, you want enough blocks that every SM has work. On a 132-SM H100, you want at least 132 blocks; ideally several hundred or thousands to allow scheduling flexibility.

### Cooperative groups (modern feature)

CUDA 9+ added "cooperative groups" — explicit programmer-level abstractions for thread groups beyond just blocks. You can synchronize:

- Within a single warp (32 threads).
- Across a "thread block tile" (subset of a block).
- Across all threads in a grid (with restrictions).

Most kernels use just blocks. Cooperative groups become useful for specialized patterns (e.g., custom reductions, certain graph algorithms).

### Multi-dimensional indexing pitfalls

A common bug: using `threadIdx.x` when you meant `threadIdx.x + blockIdx.x * blockDim.x`. The first is the within-block index (0-255 for a 256-thread block); the second is the global index (0 to total_threads-1).

For a 2D launch, you need to compute global x and y separately:

```cuda
int x = blockIdx.x * blockDim.x + threadIdx.x;
int y = blockIdx.y * blockDim.y + threadIdx.y;
int idx = y * width + x;            // row-major linearization
```

Off-by-one and dimension-mix-up bugs in this code are common. Be careful.

### Launching from CPU

Common launch patterns:

```cuda
// 1D launch
add<<<numBlocks, threadsPerBlock>>>(...);

// 2D launch
dim3 block(16, 16);
dim3 grid((W + 15) / 16, (H + 15) / 16);
imageKernel<<<grid, block>>>(...);

// 3D launch (less common)
dim3 block(8, 8, 8);
dim3 grid(X / 8, Y / 8, Z / 8);
volumeKernel<<<grid, block>>>(...);
```

The `dim3` type holds 1-3 dimensions. Unspecified dimensions default to 1.

### Total threads vs useful threads

A common mistake: thinking more threads = faster. The right number of threads depends on the work.

If you launch 1 million threads to do 100 units of work, 999,900 threads do nothing. Total time is determined by the bottleneck (the 100 useful threads). Launching more threads doesn't help.

If you launch 100 threads to do 1 million units of work, each thread does 10,000 units sequentially. The GPU's parallelism is wasted.

Right sizing: total threads should match the natural parallelism of the problem. For "process 1M items," you want ~1M threads. For "compute one result from a small dataset," you want fewer threads.

### Why this matters more than the kernel code

In practice, a lot of CUDA performance is about launch configuration:

- Right block size for occupancy.
- Right grid size to fill the GPU.
- Right access pattern (the indexing) for memory coalescing.
- Right shared-memory cooperation pattern (covered next module).

The kernel body might be simple. Getting the launch and indexing right is the hard part.

## Three real-world scenarios

**Scenario 1: Matrix multiplication launch.**
Multiplying two N×N matrices to produce an N×N result. Natural parallelism: one thread per output element = N×N threads. Launch with 2D blocks (16×16 = 256 threads) and a 2D grid sized to cover the output. Each thread computes one C[i][j].

**Scenario 2: A reduction (sum 1M numbers to 1).**
Can't be done with one thread per element naively — you need a tree-style accumulation. Standard pattern: launch enough threads to cover the data, use shared memory per block to do partial sums, write one partial sum per block to global memory, then launch a second kernel to sum the partial sums.

**Scenario 3: Image filtering.**
Apply a 5×5 kernel to a 1080×1920 image. Launch with 2D blocks (16×16 or 32×8) and a 2D grid. Each thread reads its 5×5 neighborhood from global memory (or cached in shared memory for the block), computes the filter result, writes to output. Common GPU pattern; shared memory helps significantly here.

## Common mistakes to avoid

- **Confusing local and global thread indices** — `threadIdx.x` vs the full computation.
- **Wrong block size** (not multiple of 32, too large for registers/shared memory).
- **Too few blocks** — SMs sit idle.
- **Assuming block ordering** — blocks can run in any order.
- **Inter-block synchronization** — doesn't exist within a kernel.
- **Over-using `__syncthreads()`** — every sync costs cycles.

## Read more

- NVIDIA CUDA C++ Programming Guide — chapter on programming model.
- *Programming Massively Parallel Processors* — chapter on threads/blocks.
- NVIDIA developer blog posts on launch configuration tuning.

## Summary

- **Three-level hierarchy**: thread → block → grid.
- **Threads** are the unit of work; each has unique indices.
- **Blocks** allow cooperation: shared memory + `__syncthreads()`.
- **Grids** are independent blocks; no cross-block sync in a kernel.
- **Block size**: multiple of 32, typically 128-512.
- **Block independence** enables scaling across GPU sizes.
- **`dim3`** holds 1-3 dimensions for natural problem shape.
- **Right-sizing** matters: total threads should match parallelism.

Next: warps in more depth.
