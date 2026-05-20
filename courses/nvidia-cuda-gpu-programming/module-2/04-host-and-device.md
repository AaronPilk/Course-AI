---
module: 2
position: 4
title: "Host and device — moving data between CPU and GPU"
objective: "Track where data lives and what it costs to move."
estimated_minutes: 8
---

# Host and device — moving data between CPU and GPU

## The puzzle

CPU memory and GPU memory are physically separate. The CPU can't directly read GPU memory; the GPU can't directly read CPU memory. They communicate over PCIe, which is dramatically slower than either chip's local memory.

The single biggest performance question for many CUDA programs isn't "how fast is the kernel?" but "how often are we copying between CPU and GPU, and how can we copy less?"

## The simple version

CUDA has two memory worlds:

- **Host memory**: regular CPU RAM. Allocated with `malloc`, `new`, etc.
- **Device memory**: GPU's high-bandwidth memory (HBM or GDDR). Allocated with `cudaMalloc`.

Moving data between them costs time and bandwidth:

- **Host → Device** (`cudaMemcpyHostToDevice`): CPU writes to PCIe; GPU receives.
- **Device → Host** (`cudaMemcpyDeviceToHost`): GPU writes to PCIe; CPU receives.
- **Device → Device** (`cudaMemcpyDeviceToDevice`): on the GPU itself; fast.

The rule of thumb: minimize host-device transfers. Once data is on the GPU, keep it there as long as possible. Do as many operations as possible before pulling results back.

## The technical version

### The bandwidth gap

Typical bandwidths in 2025:

- **GPU HBM (H100)**: ~3,000 GB/s.
- **CPU DDR5**: ~100-200 GB/s.
- **PCIe 5.0 x16**: ~64 GB/s (one direction).
- **PCIe 4.0 x16**: ~32 GB/s.

PCIe is ~50x slower than GPU memory. Moving 1 GB CPU→GPU takes ~30 ms over PCIe 4.0; the GPU's compute units could have done many TFLOPS of work in that time.

This is the dominant cost in many naive CUDA programs.

### Pinned memory

By default, host memory is "pageable" — the OS may move it around. CUDA can't DMA directly from pageable memory; it has to first copy to a pinned (page-locked) staging buffer, then DMA from there.

If you allocate "pinned memory" directly with `cudaMallocHost` (or `cudaHostAlloc`), CUDA can DMA from it directly. This is roughly 2x faster than pageable memory transfers.

```cuda
float* h_data;
cudaMallocHost(&h_data, bytes);  // pinned, faster transfers
// use h_data normally on CPU
cudaMemcpy(d_data, h_data, bytes, cudaMemcpyHostToDevice);
cudaFreeHost(h_data);
```

Pinned memory is a limited resource (it can't be paged out). Don't pin huge buffers you don't need. But for active transfer buffers, pinning is worth it.

### Async transfers and streams

By default, `cudaMemcpy` is synchronous — it doesn't return until the copy is done, and the CPU thread blocks.

`cudaMemcpyAsync` is asynchronous. You also need to associate it with a CUDA stream (an ordered queue of GPU operations). With streams, you can overlap transfers and compute:

```cuda
cudaStream_t stream;
cudaStreamCreate(&stream);

cudaMemcpyAsync(d_data, h_data, bytes, cudaMemcpyHostToDevice, stream);
kernel<<<blocks, threads, 0, stream>>>(d_data, ...);
cudaMemcpyAsync(h_result, d_result, bytes, cudaMemcpyDeviceToHost, stream);
```

The CPU returns immediately after each call. The GPU processes them in order. Multiple streams can run different copies and kernels concurrently — this is the foundation of overlap optimization, covered in Module 4.

### Unified memory

CUDA also supports "managed" memory — a single pointer that works on both CPU and GPU. The runtime auto-migrates pages on demand.

```cuda
float* data;
cudaMallocManaged(&data, bytes);
// use data on CPU
kernel<<<blocks, threads>>>(data, ...);  // data auto-migrates to GPU
cudaDeviceSynchronize();
// read data on CPU — auto-migrates back
```

Pros: simpler programming model, no explicit copies, easy prototyping.
Cons: performance can be worse than explicit management (you don't control when/how migrations happen). For high-performance code, explicit `cudaMemcpy` usually wins.

Unified memory is great for prototypes, complex data structures (linked lists, trees), and codes where data access patterns are unpredictable. For tight kernels with predictable patterns, explicit management is faster.

### Common transfer patterns

**Pattern 1: One-shot transfer.**
You have a large dataset, want to do a lot of work on the GPU, then get one final result. Transfer everything up front, do all the compute, transfer the result down.

```
cudaMemcpy(d_big, h_big, ...);          // ~30ms for 1GB
kernel1<<<...>>>(d_big);                 // fast
kernel2<<<...>>>(d_big);                 // fast
cudaMemcpy(h_small_result, d_small_result, ...);  // small final result
```

Transfer cost amortized over many kernels.

**Pattern 2: Streaming.**
Process more data than fits in GPU memory. Break it into chunks, overlap chunk N's transfer with chunk N-1's compute.

```
for chunk in chunks:
    async copy chunk to GPU on stream
    async kernel on stream
    async copy result back on stream
```

With enough streams, transfers and compute happen simultaneously. We'll cover this in Module 4.

**Pattern 3: Ping-pong.**
For iterative algorithms (like simulations), keep all state on GPU. Only transfer to CPU when you need to checkpoint or visualize.

### The "round trip" anti-pattern

A common mistake: alternating CPU and GPU operations inside a loop.

```cpp
for (int i = 0; i < N; ++i) {
    cudaMemcpy(d_x, h_x, ...);     // upload
    kernel<<<...>>>(d_x);           // compute
    cudaMemcpy(h_x, d_x, ...);     // download
    cpu_function(h_x);              // CPU step
}
```

Each iteration does two PCIe transfers. The total transfer time can dwarf the actual compute time. The kernel could be ten times faster and it wouldn't matter.

Fix: keep `x` on the GPU. Implement `cpu_function` as a GPU kernel. Only transfer at the start and end.

This anti-pattern is so common that profiling tools specifically flag it.

### Memory copy speeds in practice

Realistic transfer rates including overhead (PCIe 4.0 x16):

- Small transfers (< 1 MB): dominated by latency (~10-20 microseconds per call); effective bandwidth low.
- Medium transfers (1-100 MB): approaching peak; pinned memory significant gain.
- Large transfers (> 100 MB): near peak (~25-28 GB/s with pinned memory).

If you're doing many small transfers, the per-call overhead kills you. Batch them. If you're doing one large transfer, optimize bandwidth with pinned memory.

### Multi-GPU and NVLink

For multi-GPU setups, NVLink directly connects GPUs at ~600-900 GB/s — much faster than PCIe. GPU-to-GPU copies (peer-to-peer) over NVLink are the basis of multi-GPU training.

```cuda
cudaMemcpyPeer(d_other_gpu, gpu_id, d_this_gpu, 0, bytes);
```

For large-scale AI training, NVLink bandwidth between GPUs in a node and InfiniBand/Ethernet between nodes determine scaling efficiency. NVIDIA's NCCL library handles the communication patterns automatically.

### Page-locked memory limits

Pinned (page-locked) memory comes from a limited pool. Allocating too much can:

- Make the OS unstable (memory can't be paged).
- Slow down non-CUDA applications.
- Trigger system warnings.

Pin only what you need to pin (active transfer buffers, not entire datasets). Don't pin gigabytes you'll only transfer once.

### Zero-copy memory

A variant: pinned memory that's also mapped into the GPU's address space. The GPU can read it directly over PCIe instead of explicit copies.

```cuda
cudaHostAlloc(&h_data, bytes, cudaHostAllocMapped);
float* d_ptr;
cudaHostGetDevicePointer(&d_ptr, h_data, 0);
kernel<<<...>>>(d_ptr);  // GPU reads directly from CPU memory
```

Use case: small data, accessed once, where explicit copy overhead exceeds the cost of slow PCIe reads. Rare; most workloads benefit from explicit copy + fast GPU memory access.

### Memory allocators

`cudaMalloc` is relatively slow (microseconds per call). For kernels that frequently allocate and free, use a pool allocator:

- **cuMemAllocAsync** (CUDA 11.2+): driver-managed memory pools.
- **Thrust/CUB**: framework-level pools.
- **Custom allocators**: app-specific pools for known sizes.

Frameworks like PyTorch use sophisticated caching allocators that avoid actual `cudaMalloc`/`cudaFree` for repeated allocations. This is a major reason PyTorch GPU code is faster than naive CUDA.

### How frameworks handle this

In PyTorch:

```python
x = torch.randn(1000, device='cuda')   # allocates GPU memory, can be cached
y = x * 2                              # all on GPU, no transfer
z = y.sum()                            # still on GPU
result = z.item()                      # NOW transfers to CPU
```

Notice: data stays on GPU until you explicitly pull it back with `.item()` or `.cpu()`. PyTorch uses lazy evaluation patterns and caching allocators to minimize the explicit transfer pain.

For ML workloads, the rule is: load training data once, keep weights on GPU, only transfer scalars (loss values, metrics) frequently.

### When transfers are unavoidable

Some patterns require transfers:

- **I/O**: data comes from disk, GPU can't read disk directly (though some libraries like NVIDIA GPUDirect Storage can).
- **Display**: graphics output ends up CPU-rendered or routed through display memory.
- **Logging/checkpointing**: you eventually want results on CPU.
- **Multi-process**: passing data between processes goes through CPU memory or shared memory.

Strategy: bound the transfers. Compress data, transfer asynchronously, batch operations. The goal isn't zero transfers — it's transfers that don't dominate.

## Three real-world scenarios

**Scenario 1: Training a deep learning model.**
Training data lives on disk. At each step, a batch is loaded into CPU memory, transferred to GPU, forward+backward pass runs, gradients update weights (on GPU), repeat. The transfer pattern: ~100s of MB per batch, overlapped with compute via prefetching. PyTorch's DataLoader with `pin_memory=True` and `num_workers>0` is exactly this optimization.

**Scenario 2: Real-time video processing.**
Video frames come from a camera, get processed on GPU, results displayed. Each frame: ~6 MB at 1080p. At 30 fps, that's ~180 MB/s — well within PCIe bandwidth but requires async transfers and proper streaming to avoid frame drops.

**Scenario 3: A simulation that converges to a result.**
Iterative simulation (say, a fluid simulation) runs thousands of timesteps. Initial setup transfers state to GPU. Each step is a kernel. Only every 100 timesteps does the CPU pull a checkpoint for visualization. The 99% of timesteps with no transfer is what makes the simulation feasible at the desired speed.

## Common mistakes to avoid

- **Round-trip in inner loop** — devastating to performance.
- **Not using pinned memory** for performance-critical transfers.
- **Tiny transfers in a loop** — batch them.
- **Treating transfers as free** — measure them.
- **Over-using unified memory** when explicit copies would be cleaner.
- **Forgetting `cudaDeviceSynchronize`** when timing — async means your timing may measure nothing.

## Read more

- NVIDIA CUDA C++ Programming Guide — chapters on memory management and unified memory.
- NVIDIA developer blog: posts on pinned memory and async copies.
- *Professional CUDA C Programming* — memory transfer patterns.

## Summary

- **Host memory** (CPU) and **device memory** (GPU) are separate; PCIe connects them.
- **PCIe is 50x slower** than GPU memory — transfers are the dominant overhead in many workloads.
- **`cudaMalloc`** allocates GPU memory; **`cudaMemcpy`** transfers; **`cudaFree`** releases.
- **Pinned memory** (`cudaMallocHost`) is 2x faster for transfers.
- **Async copies** with streams enable overlap with compute.
- **Unified memory** (`cudaMallocManaged`) simplifies but can hurt performance.
- **Round-trip anti-pattern**: moving data back and forth in inner loops kills throughput.
- **Frameworks** like PyTorch use caching allocators and pinning to optimize.

That wraps Module 2. Next: the memory hierarchy on the GPU itself.
