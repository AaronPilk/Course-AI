---
module: 4
position: 1
title: "cuBLAS, cuDNN, and the math libraries"
objective: "Use NVIDIA's optimized primitives."
estimated_minutes: 8
---

# cuBLAS, cuDNN, and the math libraries

## The puzzle

You spent Modules 2-3 learning how to write CUDA kernels. Now the punchline: for the most common operations — matrix multiplication, convolutions, FFTs, sparse linear algebra — you should almost never write your own kernel. NVIDIA's libraries do it better.

The CUDA ecosystem is massive. Knowing what exists saves enormous time and gets you closer to peak performance than custom code ever will.

## The simple version

The major CUDA libraries:

- **cuBLAS**: linear algebra (BLAS). Matrix-matrix multiply, matrix-vector multiply, vector ops.
- **cuDNN**: deep neural network primitives. Convolutions, activations, pooling, attention.
- **cuFFT**: fast Fourier transforms.
- **cuSPARSE**: sparse matrix operations.
- **cuRAND**: random number generation.
- **cuSOLVER**: solvers for dense and sparse linear systems.
- **NCCL**: multi-GPU communication primitives.
- **Thrust**: CUDA's STL-like high-level templates.
- **CUB**: NVIDIA's reusable warp/block/grid primitives.

For 90% of GPU compute, you're using these libraries (often via a framework like PyTorch). Knowing they exist and what they do is more important than knowing how to write a fast matmul yourself.

## The technical version

### cuBLAS — the foundation

cuBLAS implements the BLAS interface (Basic Linear Algebra Subprograms) for GPUs. BLAS is the foundation of essentially all numerical computing.

Operations grouped into levels:

- **Level 1**: vector-vector ops (dot product, vector add, scaling).
- **Level 2**: matrix-vector ops (matrix-vector multiply).
- **Level 3**: matrix-matrix ops (matrix multiply, the workhorse).

Level 3 ops have the highest arithmetic intensity and are what GPUs really shine at. `cublasSgemm` (single-precision general matrix multiply) is the most-used function in numerical GPU computing.

Example usage:

```cpp
cublasHandle_t handle;
cublasCreate(&handle);

float alpha = 1.0f, beta = 0.0f;
// C = alpha * A * B + beta * C, all on GPU
cublasSgemm(handle, CUBLAS_OP_N, CUBLAS_OP_N,
            m, n, k, &alpha, d_A, m, d_B, k, &beta, d_C, m);

cublasDestroy(handle);
```

The API is famously fiddly (Fortran column-major conventions, transpose flags, leading-dimension parameters). But the performance is unbeatable for matmul — typically 70-90% of peak FLOPS.

cuBLAS has multiple precision variants: `cublasSgemm` (FP32), `cublasDgemm` (FP64), `cublasHgemm` (FP16), and Tensor Core variants. The library automatically picks the fastest path for your hardware and data.

### cuBLASLt and cuBLASMp

Extensions of cuBLAS:

- **cuBLASLt**: "lightweight" extensions with more flexible matmul, including Tensor Core integration and quantized operations (FP8, INT8). Used heavily in LLM inference engines.
- **cuBLASMp**: multi-process matmul for distributed workloads.

If you're building LLM inference systems, you'll meet cuBLASLt directly even if you're not writing custom kernels.

### cuDNN — deep learning primitives

cuDNN provides optimized primitives for neural networks:

- **Convolutions** (the most important): forward, backward, multiple algorithms tuned per case.
- **Activations**: ReLU, sigmoid, tanh, etc.
- **Pooling**: max, average, etc.
- **Normalization**: batch norm, layer norm, group norm.
- **Attention**: fused attention kernels (Flash Attention-style).
- **Recurrent operations**: LSTM/GRU primitives.

Convolutions are the largest single thing cuDNN does. There are many ways to implement a convolution (direct, im2col, FFT, Winograd) — cuDNN picks the right one for your shapes and hardware.

PyTorch's `nn.Conv2d` calls cuDNN under the hood. TensorFlow's `tf.nn.conv2d` does the same. You write the framework call; cuDNN runs.

cuDNN versioning matters. Newer cuDNN versions add support for new operations (e.g., FlashAttention-style fused attention came to cuDNN in versions 8-9), better algorithms, and new precision modes. PyTorch/TensorFlow updates often track cuDNN updates.

### cuFFT

Fast Fourier transforms — used in signal processing, image processing, certain scientific simulations, and some ML workloads (Fourier-based convolutions in cuDNN call cuFFT).

```cpp
cufftHandle plan;
cufftPlan1d(&plan, n, CUFFT_C2C, batch);
cufftExecC2C(plan, d_in, d_out, CUFFT_FORWARD);
cufftDestroy(plan);
```

cuFFT supports 1D, 2D, 3D transforms; real-to-complex, complex-to-complex, and inverse. Performance is generally excellent — the algorithm scales well to GPU.

### cuSPARSE

Sparse matrix operations — when matrices are mostly zeros and you don't want to store/process them densely. Used in graph analytics, certain optimization problems, and increasingly in sparse neural networks.

cuSPARSE handles multiple sparse formats: CSR (compressed sparse row), COO (coordinate), ELL, and others. Different formats are faster for different operations.

For most ML workloads, sparsity isn't extreme enough to make cuSPARSE worth it. For genuine sparse problems (>90% zeros), cuSPARSE is critical.

### cuRAND — random numbers on GPU

CPU RNG is slow when you need millions of values per kernel launch. cuRAND generates random numbers directly on the GPU.

```cpp
curandGenerator_t gen;
curandCreateGenerator(&gen, CURAND_RNG_PSEUDO_DEFAULT);
curandSetPseudoRandomGeneratorSeed(gen, 1234);
curandGenerateUniform(gen, d_out, n);
```

Several algorithms supported (XORWOW, Philox, MTGP32, Sobol). Philox is a common choice for ML (used in PyTorch's CUDA RNG).

### NCCL — multi-GPU communication

The library for moving data between GPUs in collective operations. The patterns you need for distributed training: all-reduce (sum gradients across GPUs), broadcast (distribute weights), all-gather (collect outputs).

NCCL uses NVLink, PCIe, and InfiniBand intelligently based on the topology. It's the foundation of every distributed-training framework (PyTorch Distributed, DeepSpeed, FSDP, Megatron).

```cpp
ncclComm_t comm;
ncclCommInitRank(&comm, num_gpus, id, rank);
ncclAllReduce(d_send, d_recv, count, ncclFloat, ncclSum, comm, stream);
```

When you train an LLM on hundreds of GPUs, NCCL is what's actually shuttling data between them.

### Thrust — high-level CUDA C++

Thrust is CUDA's STL-like library. Iterators, algorithms, containers — but they run on GPU.

```cpp
#include <thrust/device_vector.h>
#include <thrust/sort.h>

thrust::device_vector<float> v(1000000);
// fill v ...
thrust::sort(v.begin(), v.end());
float total = thrust::reduce(v.begin(), v.end(), 0.0f);
```

This is the most "high-level" way to write CUDA code. No kernels, no launch configurations — just algorithms applied to device vectors. Thrust handles everything.

Performance is usually quite good — Thrust is implemented with hand-tuned CUB primitives under the hood. For sort, reduce, scan, transform, and similar parallel patterns, Thrust is often faster than custom code and much faster to write.

### CUB — the building blocks

CUB (CUDA Unbound) is the lower-level library Thrust uses. It exposes reusable warp/block/device primitives:

- **Device-wide**: reduce, scan, sort, run-length encode.
- **Block-wide**: reduce, scan, sort within a block.
- **Warp-wide**: reduce, scan, shuffle within a warp.

If you're writing custom kernels, CUB primitives let you compose efficient implementations without reinventing each algorithm.

```cpp
#include <cub/cub.cuh>

// Block-wide reduction
__global__ void kernel(float* in, float* out) {
    typedef cub::BlockReduce<float, 256> BlockReduce;
    __shared__ typename BlockReduce::TempStorage temp_storage;
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    float val = in[idx];
    float sum = BlockReduce(temp_storage).Sum(val);
    if (threadIdx.x == 0) out[blockIdx.x] = sum;
}
```

The amount of detail you don't have to think about is impressive. Bank conflicts, warp shuffles, padding — all handled.

### NVIDIA Math Library (nvmath)

A newer addition: a unified Python interface to NVIDIA's math libraries (cuBLAS, cuFFT, cuRAND, etc.). Lets Python developers use these libraries directly without C++ glue code.

Useful for prototyping and for replacing some PyTorch ops with potentially-faster library calls.

### CUTLASS — templated CUDA kernels

CUTLASS is NVIDIA's C++ template library for high-performance matrix multiplication and convolution. Used by cuBLAS internally and by researchers building custom kernels.

CUTLASS lets you compose tiled matrix operations with full control over tiling parameters, precision, layouts, and Tensor Core usage. It's what you reach for when cuBLAS doesn't quite fit your use case — e.g., when you need a fused matmul-plus-something.

Modern CUTLASS (3.x+) uses the latest hardware features: Tensor Cores, async loads, distributed shared memory on Hopper. Production AI inference engines (TensorRT-LLM, FlashAttention) build on CUTLASS heavily.

### TensorRT — inference engine

Not a library in the same sense, but worth mentioning. TensorRT is NVIDIA's inference optimizer/runtime. You give it a trained model (ONNX or framework-specific), it builds an optimized execution plan that fuses operations, picks Tensor Core paths, and applies precision tricks (FP16, INT8, FP8).

For LLM inference, TensorRT-LLM is a specialized variant focused on transformer inference. Used widely in production.

### When to write your own kernel

Given all these libraries, when should you write custom CUDA?

- **Operations not in any library** (novel ML primitives, custom physics simulations).
- **Fused operations** combining multiple library calls (sometimes faster as one kernel).
- **Specialized data layouts** that libraries don't support efficiently.
- **Educational** purposes — learning how the libraries work.

In practice, most CUDA programmers write maybe 5-10% of their performance-critical code from scratch. The other 90%+ calls libraries.

### Performance comparison: custom vs library

For matrix multiplication (FP32, large matrix):

| Implementation | % of peak |
|----------------|-----------|
| Naive kernel | 3-5% |
| Tiled shared memory | 20-30% |
| Hand-tuned with Tensor Cores | 60-80% (requires deep expertise) |
| **cuBLAS** | **70-90%** |
| cuBLAS with Tensor Cores (mixed precision) | 90%+ |

The library wins by a lot. cuBLAS authors have spent years tuning, and they know hardware details most programmers don't. Don't compete unless you have a specific reason.

### Library version compatibility

CUDA libraries are version-coupled with the CUDA Toolkit. Mismatched versions cause confusing failures.

When debugging CUDA issues, check:

- CUDA Toolkit version (`nvcc --version`).
- cuDNN version (separate install).
- Driver version (`nvidia-smi`).
- Framework's expected versions (PyTorch ships specific versions).

Frameworks like PyTorch bundle most needed libraries. Conflicts mostly arise when mixing system installations with framework versions.

### The cost of dependencies

CUDA libraries are not small. A full install of CUDA + cuDNN + cuBLAS + cuFFT + others is many gigabytes. Production deployments often strip down to just the libraries the application uses.

For containers: NVIDIA provides Docker images with the libraries pre-installed. PyTorch's official images are a good starting point.

## Three real-world scenarios

**Scenario 1: A research team needs matmul in their custom op.**
First instinct: write a CUDA matmul kernel. Better instinct: call `cublasSgemm` (or PyTorch's `torch.matmul`) and move on. The library beats anything they'd write in months by 2-5x and was free.

**Scenario 2: An LLM inference engine.**
They build on TensorRT-LLM, which wraps CUTLASS for matmul, integrates cuDNN for attention variants, uses NCCL for tensor parallelism. Their custom code is glue and configuration. The performance-critical work is in NVIDIA's libraries.

**Scenario 3: A particle simulation needing random numbers.**
Generating random numbers on CPU and transferring is slow. They use cuRAND to generate on GPU directly. One library call, no PCIe transfers, ~100x faster.

## Common mistakes to avoid

- **Reinventing matmul** — cuBLAS exists.
- **Reinventing reductions/scans** — Thrust/CUB exist.
- **Ignoring TensorRT for inference** — it's a major optimization.
- **Mixing library versions** — confusing failures.
- **Calling libraries from inside kernels** — they're host-side calls.
- **Not measuring** — sometimes a custom kernel does beat the library; sometimes it doesn't.

## Read more

- NVIDIA cuBLAS documentation.
- NVIDIA cuDNN documentation.
- Thrust user's guide (NVIDIA).
- CUTLASS examples (GitHub).

## Summary

- **cuBLAS**: linear algebra, especially matrix multiply.
- **cuDNN**: deep learning primitives (convolutions, attention, etc.).
- **cuFFT, cuSPARSE, cuRAND, cuSOLVER**: specialized domain libraries.
- **NCCL**: multi-GPU communication.
- **Thrust**: STL-like high-level templates for CUDA C++.
- **CUB**: reusable warp/block/grid primitives.
- **CUTLASS**: templated matrix-multiply building blocks.
- **TensorRT**: inference optimizer / runtime.
- **Use libraries first**; write custom kernels only when libraries don't fit.

Next: Thrust and high-level abstractions in more depth.
