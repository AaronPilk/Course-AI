---
module: 4
position: 2
title: "Thrust and high-level abstractions"
objective: "Write GPU code without writing kernels."
estimated_minutes: 8
---

# Thrust and high-level abstractions

## The puzzle

Modules 2-3 taught you to write CUDA kernels — blocks, threads, shared memory, coalescing. Module 4 Lesson 1 said "actually, just use libraries." So... when do you write CUDA at all?

The answer is rarely. And when you do write CUDA, you often shouldn't write raw kernels — you should use Thrust, CUB, or framework-level abstractions that take care of the boilerplate. This lesson is about working at the right level for the task.

## The simple version

A spectrum of CUDA abstraction levels:

1. **PyTorch / TensorFlow**: Python; no CUDA visible; for ML workloads. Use 90% of the time.
2. **CuPy**: NumPy-like Python on GPU. For general numerical code in Python.
3. **Thrust**: STL-like C++ templates on GPU. For general numerical code in C++.
4. **CUB**: C++ primitives (warp/block/device reductions, scans, sorts). For composing custom kernels.
5. **Raw CUDA C++**: kernels, blocks, threads. For custom operations not covered above.
6. **PTX assembly**: instruction-level. Almost never needed.

Use the highest abstraction that solves your problem. Drop down only when the abstraction's overhead is the bottleneck or the operation isn't covered.

## The technical version

### CuPy — drop-in NumPy on GPU

For Python developers, CuPy is the most accessible GPU computing. It mirrors NumPy's API:

```python
import cupy as cp
import numpy as np

# NumPy on CPU
x_np = np.random.randn(1_000_000)
y_np = np.sin(x_np) + np.cos(x_np)

# Same code on GPU
x_cp = cp.random.randn(1_000_000)
y_cp = cp.sin(x_cp) + cp.cos(x_cp)
```

Operations execute on GPU; CuPy handles all the kernel launches under the hood. Performance is generally excellent for the common operations because CuPy uses the same NVIDIA libraries (cuBLAS, cuFFT, etc.) PyTorch does.

Use cases: scientific computing in Python, replacing slow NumPy code, prototyping GPU algorithms.

### PyTorch as a CUDA framework

PyTorch is primarily an ML framework, but it's also a general GPU computing library:

```python
import torch

x = torch.randn(1_000_000, device='cuda')
y = torch.sin(x) + torch.cos(x)
z = y @ y.unsqueeze(0)        # outer product
```

PyTorch tensors support most numerical operations. The advantage over CuPy: automatic differentiation (autograd) if you need gradients; the disadvantage: heavier API surface for non-ML use cases.

For machine learning, PyTorch is the default. For general GPU compute, choose based on your team and ecosystem.

### Thrust — C++ STL for CUDA

Thrust is what you reach for in C++ when you don't want to write kernels but need more flexibility than calling pre-built library functions.

Core abstractions:

- `thrust::device_vector<T>` and `thrust::host_vector<T>`: containers.
- `thrust::transform`, `thrust::reduce`, `thrust::sort`, `thrust::scan`, etc.: algorithms.
- Iterators that span host and device.

Example:

```cpp
#include <thrust/device_vector.h>
#include <thrust/transform.h>
#include <thrust/functional.h>

thrust::device_vector<float> a(N), b(N), c(N);
// initialize a, b ...

// c = a * 2 + b, all on GPU
thrust::transform(a.begin(), a.end(), b.begin(), c.begin(),
                  [] __device__ (float ai, float bi) { return ai * 2.0f + bi; });

float total = thrust::reduce(c.begin(), c.end(), 0.0f);
```

This compiles to optimized CUDA kernels under the hood. The performance is usually within ~10% of hand-tuned code for common patterns.

### Thrust patterns

Common Thrust algorithms cover most parallel primitives:

- **Transform**: element-wise operation.
- **Reduce**: aggregate to single value.
- **Inclusive/exclusive scan**: prefix sum.
- **Sort**: parallel sort (radix internally; very fast).
- **Partition / copy_if**: filter based on predicate.
- **Gather / scatter**: indexed access.
- **Unique / set operations**: deduplication and set arithmetic.
- **For_each**: side-effecting per-element work.

Composing these gives you a lot. A workflow like "load data, filter, sort, transform, reduce" can be 4-5 Thrust calls, no kernels written.

### When Thrust isn't enough

Thrust handles separable operations elegantly. It struggles with:

- **Fusion**: doing multiple operations in one kernel pass (Thrust often produces multiple kernels).
- **Stencil patterns**: where threads need to access neighbors.
- **Irregular parallelism**: dynamic work scheduling.
- **Sophisticated shared-memory patterns**.

When Thrust's performance lags, the fix is usually to drop to CUB or raw kernels for the bottleneck section.

### CUB — composable building blocks

CUB exposes warp/block/device primitives directly. It's lower-level than Thrust but more flexible.

```cpp
#include <cub/cub.cuh>

__global__ void my_kernel(float* in, float* out) {
    typedef cub::BlockReduce<float, 256> BlockReduce;
    __shared__ typename BlockReduce::TempStorage temp_storage;

    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    float val = in[idx];
    float block_sum = BlockReduce(temp_storage).Sum(val);

    if (threadIdx.x == 0) out[blockIdx.x] = block_sum;
}
```

CUB handles the reduction efficiently — bank conflicts, warp shuffles, sync — all behind the abstraction. You get nearly-optimal performance with much less code than rolling your own.

Use CUB when:

- You're writing custom kernels that need reductions, scans, or sorts.
- You want optimal performance for these primitives without expertise.
- You need fine-grained control that Thrust doesn't expose.

### Frameworks abstracting CUDA further

Beyond CuPy and PyTorch:

- **JAX**: NumPy-like with composable transformations (grad, jit, vmap). Uses XLA which generates CUDA kernels.
- **Numba**: just-in-time CUDA from Python decorators. Lets you write Python that compiles to CUDA.
- **Triton**: a higher-level language for writing custom CUDA kernels in Python. Used by OpenAI; popular for ML kernels.
- **Halide**: DSL for image processing pipelines (CPU and GPU targets).
- **Mojo**: newer language targeting accelerators including GPU.

Triton in particular has gained popularity for ML: write kernels in a Python-like DSL, get near-CUDA performance. Used in many production AI codebases now.

### When to drop down

The question "should I write raw CUDA?" depends on:

1. **Does a library cover it?** Use the library.
2. **Does Thrust/CuPy/PyTorch cover it?** Use them.
3. **Does Triton or Numba make it easy?** Try them first.
4. **Is the perf gap from higher abstractions a real problem?** Profile to verify.
5. **Do you have expertise to do better?** Be honest.

Most "I'll write a CUDA kernel" decisions should be "I'll try a higher-level tool first." The custom kernel comes only when you've measured that you actually need it.

### Performance: the abstraction cost

A common worry: high-level abstractions are slower than raw CUDA. Sometimes yes, sometimes no:

- **PyTorch / CuPy / Thrust**: typically within 5-15% of hand-tuned for common patterns. For library-backed ops (matmul, conv), they ARE the hand-tuned code.
- **Triton / Numba**: typically within 10-30% of expert CUDA for custom kernels.
- **Naïve user-written CUDA kernels**: often slower than the abstractions, because the abstractions use better-tuned implementations under the hood.

The honest truth: most people write CUDA kernels that are slower than what they'd get from a high-level library. Use the high-level tool unless you can prove you'll do better.

### Mixed-mode strategies

Modern CUDA codebases mix levels:

- 90% of code: framework-level (PyTorch, TensorFlow, JAX).
- 5-8% of code: high-level GPU (Thrust, Triton, CuPy).
- 2-5% of code: custom CUDA kernels for specific hot spots or novel operations.

The cost of going low-level is engineering time and code complexity. Spend it where it pays back — usually on the inner loop of the most performance-critical kernels.

### Triton specifically

Triton deserves special attention. Originally from OpenAI, it's a Python-like DSL that compiles to CUDA:

```python
@triton.jit
def add_kernel(x_ptr, y_ptr, output_ptr, n, BLOCK_SIZE: tl.constexpr):
    pid = tl.program_id(axis=0)
    block_start = pid * BLOCK_SIZE
    offsets = block_start + tl.arange(0, BLOCK_SIZE)
    mask = offsets < n
    x = tl.load(x_ptr + offsets, mask=mask)
    y = tl.load(y_ptr + offsets, mask=mask)
    output = x + y
    tl.store(output_ptr + offsets, output, mask=mask)
```

You write in Python; Triton compiles to PTX and produces a working kernel. Performance is usually within 10-20% of expert CUDA C++, and the development time is dramatically shorter.

Used extensively in modern AI codebases (custom attention kernels, fused operations, etc.). For Python-first ML teams, Triton is often the right level — high enough to be productive, low enough to control performance.

### What this all means for you

You probably never need to write raw CUDA C++ kernels. The realistic path:

1. **Start with PyTorch or framework primitives.**
2. **Profile.** If something is slow, find where.
3. **Try Triton, CuPy, or Thrust** for the slow part.
4. **If those don't give the performance you need, then write CUDA.**

Skipping straight to CUDA C++ for everything is reinventing wheels. The custom-kernel skill is valuable but rare in actual application.

## Three real-world scenarios

**Scenario 1: Replacing slow NumPy.**
A scientist's simulation runs slowly in NumPy. They install CuPy, change `import numpy as np` to `import cupy as cp`, and the code mostly works on GPU. 20-50x speedup with hours of work, not weeks.

**Scenario 2: A custom transformer block.**
An ML researcher needs a non-standard attention variant. They write it in Triton — Python-like syntax, runs on GPU, integrates with PyTorch via custom autograd. Days of work instead of weeks for the same result in CUDA C++.

**Scenario 3: A simulation with custom physics.**
A custom physics simulation uses Thrust for the bulk operations (particles update via `thrust::transform`, sorts by position via `thrust::sort`). Only the most performance-critical kernel (collision detection in a specific structure) is written in raw CUDA C++ for max performance.

## Common mistakes to avoid

- **Writing raw CUDA when a library would do** — wastes engineering time.
- **Reinventing primitives** that Thrust/CUB provide.
- **Assuming high-level = slow** — often it's faster than your kernel.
- **Mixing abstraction levels** without measurement.
- **Sticking to CUDA C++** when Triton/JAX would fit better.

## Read more

- Thrust documentation and tutorial (NVIDIA).
- CUB documentation (NVIDIA).
- Triton tutorials (OpenAI).
- CuPy documentation.

## Summary

- **A spectrum of CUDA abstractions**: PyTorch → CuPy → Thrust → CUB → CUDA C++ → PTX.
- **CuPy**: NumPy-like Python GPU computing.
- **Thrust**: STL-like C++ templates for CUDA.
- **CUB**: reusable warp/block/device primitives.
- **Triton**: Python-like DSL that compiles to fast CUDA.
- **Most code should stay high-level**; drop down only for specific bottlenecks.
- **High-level performance** is usually within 10-30% of expert CUDA, sometimes faster.
- **Engineering time** is the dominant cost — choose the level that gets the work done.

Next: CUDA streams and concurrency.
