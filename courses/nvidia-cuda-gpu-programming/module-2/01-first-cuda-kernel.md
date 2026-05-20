---
module: 2
position: 1
title: "Your first CUDA kernel"
objective: "Write and launch code that runs on the GPU."
estimated_minutes: 8
---

# Your first CUDA kernel

## The puzzle

CUDA programs look like C++ with a few extra keywords. But what those keywords *do* is run code on a completely different processor — the GPU — using a parallelism model unlike anything in regular C++.

The smallest useful CUDA program is a single kernel that adds two vectors. Once you understand it, every other CUDA program is a variation on the same theme.

## The simple version

A CUDA kernel is a function that:

1. Is marked with `__global__` so the compiler knows it runs on the GPU.
2. Gets launched from CPU code with a special syntax: `kernel<<<blocks, threads>>>(args)`.
3. Each invocation runs once *per thread*, in parallel across thousands of threads.
4. Each thread figures out which piece of data it's responsible for using built-in variables like `threadIdx` and `blockIdx`.

Here's the canonical first kernel: vector addition. Two arrays `a` and `b`, write `a[i] + b[i]` into `c[i]` for every `i`.

```cuda
__global__ void add(const float* a, const float* b, float* c, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) c[i] = a[i] + b[i];
}
```

That's it. The whole kernel is 4 lines. The rest is setup: allocate GPU memory, copy data over, launch the kernel, copy results back.

## The technical version

### The `__global__` qualifier

CUDA C++ adds three function qualifiers:

- `__global__`: function runs on the GPU, can only be launched from CPU code.
- `__device__`: function runs on the GPU, can only be called from other GPU code.
- `__host__`: function runs on the CPU (the default; usually omitted).

You can combine `__host__ __device__` to indicate a function that works on both — useful for utility functions you want to call from kernels and from CPU code.

`__global__` functions must return `void`. Results are produced via output pointers, not return values.

### Built-in variables

Inside a kernel, several variables are automatically available:

- `threadIdx`: the thread's index within its block (a 3-component struct: `.x`, `.y`, `.z`).
- `blockIdx`: the block's index within the grid.
- `blockDim`: the size of each block.
- `gridDim`: the size of the grid.

For a 1D launch, only `.x` matters. For 2D image processing or 3D physics, the `.y` and `.z` components let you naturally map threads to 2D/3D problems.

The classic global thread index calculation:

```cuda
int i = blockIdx.x * blockDim.x + threadIdx.x;
```

This gives every thread a unique integer in `[0, total_threads)`. Use it as your array index.

### The launch configuration

The triple-angle-bracket syntax `<<<blocks, threads>>>` is CUDA-specific:

```cuda
int n = 1'000'000;
int threadsPerBlock = 256;
int blocks = (n + threadsPerBlock - 1) / threadsPerBlock;
add<<<blocks, threadsPerBlock>>>(d_a, d_b, d_c, n);
```

This launches `blocks * threadsPerBlock` threads total. For `n = 1,000,000` and 256 threads per block, that's 3907 blocks × 256 threads = 1,000,192 threads. Slightly more than n; the `if (i < n)` guard inside the kernel discards the excess.

The launch is asynchronous. The kernel starts executing on the GPU while the CPU continues. To wait for it, you call `cudaDeviceSynchronize()` (or rely on the next CUDA call to block).

### The full minimal program

A complete vector-add program:

```cuda
#include <cuda_runtime.h>
#include <cstdio>

__global__ void add(const float* a, const float* b, float* c, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) c[i] = a[i] + b[i];
}

int main() {
    int n = 1 << 20;                       // ~1M elements
    size_t bytes = n * sizeof(float);

    // 1. Host (CPU) allocations
    float *h_a = (float*)malloc(bytes);
    float *h_b = (float*)malloc(bytes);
    float *h_c = (float*)malloc(bytes);
    for (int i = 0; i < n; ++i) { h_a[i] = 1.0f; h_b[i] = 2.0f; }

    // 2. Device (GPU) allocations
    float *d_a, *d_b, *d_c;
    cudaMalloc(&d_a, bytes);
    cudaMalloc(&d_b, bytes);
    cudaMalloc(&d_c, bytes);

    // 3. Copy inputs host -> device
    cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice);
    cudaMemcpy(d_b, h_b, bytes, cudaMemcpyHostToDevice);

    // 4. Launch the kernel
    int threadsPerBlock = 256;
    int blocks = (n + threadsPerBlock - 1) / threadsPerBlock;
    add<<<blocks, threadsPerBlock>>>(d_a, d_b, d_c, n);

    // 5. Copy result device -> host
    cudaMemcpy(h_c, d_c, bytes, cudaMemcpyDeviceToHost);

    // 6. Verify
    printf("c[0] = %f, c[n-1] = %f\n", h_c[0], h_c[n-1]);

    // 7. Cleanup
    cudaFree(d_a); cudaFree(d_b); cudaFree(d_c);
    free(h_a); free(h_b); free(h_c);
    return 0;
}
```

Compile with `nvcc add.cu -o add` and run. Output should be `c[0] = 3.0, c[n-1] = 3.0`.

That's the whole pattern: allocate, transfer in, launch, transfer out, free.

### Why `(n + threadsPerBlock - 1) / threadsPerBlock`

This is the "ceiling division" idiom. For `n = 1,000,000` and `threadsPerBlock = 256`:

- Naive: `n / threadsPerBlock = 3906`. Launches 3906 × 256 = 999,936 threads. Misses the last 64 elements.
- Ceiling: `(n + 255) / 256 = 3907`. Launches 3907 × 256 = 1,000,192 threads. Covers all n, plus a few extra.

The kernel's bounds check (`if (i < n)`) prevents extra threads from writing out of bounds.

This idiom appears in nearly every CUDA program. Memorize it.

### Error handling

CUDA API calls return error codes. In production code, you wrap them:

```cuda
#define CUDA_CHECK(x) do { cudaError_t err = (x); \
    if (err != cudaSuccess) { \
        fprintf(stderr, "CUDA error at %s:%d: %s\n", __FILE__, __LINE__, \
                cudaGetErrorString(err)); exit(1); \
    } } while(0)

CUDA_CHECK(cudaMalloc(&d_a, bytes));
CUDA_CHECK(cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice));
```

For kernel launches (which don't return error codes directly), check `cudaGetLastError()` and `cudaDeviceSynchronize()` after launch.

Real code is full of these checks. Skipping them while learning is fine; skipping them in production is asking for confusing bugs.

### Memory model: host vs device

The CPU and GPU have separate memory. When you call `malloc`, you get CPU memory. When you call `cudaMalloc`, you get GPU memory.

The pointers are different address spaces. A CPU pointer doesn't work on the GPU and vice versa. You explicitly transfer data with `cudaMemcpy`.

CUDA also supports "unified memory" (`cudaMallocManaged`) which presents a single address space and auto-migrates data on demand. Convenient for prototyping but less performant than explicit management for serious code.

### Naming convention

By convention, host pointers are named `h_*` and device pointers are named `d_*` (`h_a`, `d_a`). This prevents you from accidentally passing the wrong pointer to a function.

If you mix them up — pass a `h_a` to a kernel or a `d_a` to a CPU function — you'll get crashes, garbage results, or worse. The naming convention is the cheap defense.

### When the kernel actually runs

The kernel launch is asynchronous. After `add<<<...>>>()` returns, the GPU may or may not have started executing yet. The next CUDA call (often `cudaMemcpy`) implicitly synchronizes.

If you want to measure kernel time accurately, you need `cudaDeviceSynchronize()` (or CUDA events). Wallclock timing of just the launch line gives you nothing useful.

### The first kernel is misleading

Vector addition is the "hello world" of CUDA. It works. It produces a correct answer. It's a useful starting point.

It's also a terrible example of what GPUs are actually good for. Vector addition has the lowest possible arithmetic intensity (one operation per byte loaded). It's memory-bandwidth-bound; the GPU's compute power is mostly idle. Adding more compute capability doesn't help.

The really interesting CUDA kernels do things like matrix multiplication (high arithmetic intensity, compute-bound), where the GPU's compute capability actually pays off. We'll build up to those.

For now, vector addition gets the mechanics right: writing kernels, launching them, moving data, getting results back. The patterns scale.

### Compilation: nvcc

CUDA code is compiled with `nvcc`, NVIDIA's CUDA compiler:

```bash
nvcc add.cu -o add
nvcc -O3 -arch=sm_80 add.cu -o add        # Optimized, for Ampere (A100/RTX 3000-series)
nvcc -O3 -arch=sm_90 add.cu -o add        # For Hopper (H100)
```

The `-arch=sm_XX` flag tells nvcc which GPU architecture to target. Higher values use newer features. Omitting it produces code that works on most GPUs but may not use the latest features.

### Frameworks abstract this away

In practice, most people writing GPU code never touch CUDA C++. They use PyTorch:

```python
a = torch.randn(1000000, device='cuda')
b = torch.randn(1000000, device='cuda')
c = a + b
```

PyTorch's GPU backend (which is CUDA under the hood) handles allocation, transfer, kernel launch, and synchronization. The patterns we just covered happen behind the scenes.

You learn CUDA C++ for the same reason you learn assembly or systems-level C: to understand what the framework is doing, debug performance issues, and write custom kernels when needed.

## Three real-world scenarios

**Scenario 1: A custom PyTorch operator.**
A research team needs a fused operation that PyTorch doesn't have built-in. They write a CUDA kernel, expose it via PyTorch's C++ extension API, and call it from Python like any other PyTorch op. The patterns are the same as the vector add above, just with more complex math.

**Scenario 2: Debugging slow training.**
A training loop is slower than expected. Profiling shows the bottleneck is many tiny CUDA kernel launches with synchronizations between them. The fix: batch operations together into fewer larger kernels. The vector-add pattern (large arrays, single kernel) is what you want; many small operations defeat the GPU model.

**Scenario 3: Memory leak in CUDA code.**
A program runs fine for a while then crashes with out-of-memory. Forgot to `cudaFree` in a loop. CUDA memory leaks are common because the cleanup isn't automatic and the error mode (crash later, far from the leak) is hard to debug. Hence the conventions and tooling.

## Common mistakes to avoid

- **Forgetting bounds check** (`if (i < n)`) — kernels can write out of bounds.
- **Wrong launch config** — not using ceiling division, wrong block size.
- **Pointer mix-up** — passing host pointer where device pointer expected.
- **Forgetting to free** — GPU memory leaks crash programs.
- **Skipping error checks** — silent failures are devastating to debug.
- **Treating vector add as representative** — it's the simplest case, not the typical one.

## Read more

- NVIDIA CUDA C++ Programming Guide — definitive.
- NVIDIA CUDA Samples (GitHub) — many example kernels.
- *Professional CUDA C Programming* by Cheng, Grossman, McKercher — solid intro.

## Summary

- **`__global__`** marks a function as a GPU kernel.
- **`kernel<<<blocks, threads>>>(args)`** launches it.
- **Built-in variables** (`threadIdx`, `blockIdx`, `blockDim`, `gridDim`) identify each thread.
- **Allocate, transfer in, launch, transfer out, free** — the universal pattern.
- **Bounds checks** prevent out-of-bounds writes from extra threads.
- **`nvcc`** compiles CUDA code; `-arch=sm_XX` targets specific GPUs.
- **Frameworks** (PyTorch, etc.) hide most of this — but understanding it matters for optimization.
- **Vector add is too simple** — real kernels have higher arithmetic intensity.

Next: thread/block/grid hierarchy in detail.
