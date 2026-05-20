---
module: 4
position: 3
title: "CUDA streams and concurrency"
objective: "Overlap compute and data transfer."
estimated_minutes: 8
---

# CUDA streams and concurrency

## The puzzle

A typical GPU program does: transfer input, run kernel, transfer output. If each step takes the same time, you spend two-thirds of the wall clock not computing. The GPU sits idle during transfers; the PCIe sits idle during compute.

CUDA streams let you overlap these. While one chunk of data is being transferred up, another is computing, another is being transferred down. With enough overlap, total time approaches the slowest single phase rather than the sum of all phases.

## The simple version

A CUDA stream is an ordered queue of GPU operations (kernels, copies, events). Operations in the same stream execute sequentially; operations in different streams may execute concurrently.

The default behavior of `cudaMemcpy` and kernel launches is to use the "default stream" — all operations serialize. You explicitly opt into concurrency by creating streams.

Basic pattern:

```cuda
cudaStream_t s1, s2;
cudaStreamCreate(&s1);
cudaStreamCreate(&s2);

// Two independent pipelines running in parallel
cudaMemcpyAsync(d_a, h_a, bytes, cudaMemcpyHostToDevice, s1);
kernelA<<<grid, block, 0, s1>>>(d_a);
cudaMemcpyAsync(h_a, d_a, bytes, cudaMemcpyDeviceToHost, s1);

cudaMemcpyAsync(d_b, h_b, bytes, cudaMemcpyHostToDevice, s2);
kernelB<<<grid, block, 0, s2>>>(d_b);
cudaMemcpyAsync(h_b, d_b, bytes, cudaMemcpyDeviceToHost, s2);
```

Stream 1 and stream 2 run independently. The hardware schedules them in parallel where it can.

## The technical version

### What streams enable

Three flavors of concurrency on a single GPU:

1. **Host-device transfer overlapping with compute**: data flowing in one direction (or both) while a kernel runs.
2. **Multiple kernels running concurrently**: small kernels can co-occupy the GPU if SMs are available.
3. **Multiple streams interleaving operations**: more general version of #1 and #2.

Hardware support:

- Modern GPUs have separate copy engines for host-to-device and device-to-host transfers.
- The compute engine is also separate.
- That's three engines that can run simultaneously — kernel + upload + download all at once.

Without streams, you don't use any of this. Everything serializes through the default stream.

### Async transfers

For overlap, transfers must be asynchronous: `cudaMemcpyAsync` instead of `cudaMemcpy`. The async version returns immediately; the actual transfer happens later in the stream.

Async transfers require **pinned (page-locked) host memory**:

```cuda
float* h_data;
cudaMallocHost(&h_data, bytes);   // pinned

cudaMemcpyAsync(d_data, h_data, bytes, cudaMemcpyHostToDevice, stream);
```

If you pass pageable memory to `cudaMemcpyAsync`, it falls back to a synchronous copy via an internal pinned staging buffer. The async behavior is lost.

### The default stream

The default stream (stream 0) is special: most CUDA calls implicitly use it, and it synchronizes with all other streams by default.

This means:

- A kernel in the default stream blocks all other streams until it finishes.
- Any subsequent default-stream operation waits for all previous streams.

For genuine concurrency, you must use non-default streams (`cudaStreamCreate`) and explicitly pass them to async operations.

There's a "per-thread default stream" compile option that changes this behavior — each host thread gets its own default stream. Useful for multi-threaded CPU code.

### Synchronization

Several ways to wait:

- `cudaStreamSynchronize(stream)`: wait for one stream.
- `cudaDeviceSynchronize()`: wait for everything.
- **CUDA events** for finer-grained sync:

```cuda
cudaEvent_t event;
cudaEventCreate(&event);

cudaEventRecord(event, stream1);              // mark a point in stream1
cudaStreamWaitEvent(stream2, event, 0);       // stream2 waits for that point
```

Events let stream 2 depend on a specific operation in stream 1 without serializing all of either stream.

### The classic 3-way overlap pattern

Pipelining a large workload through multiple streams:

```cuda
int num_streams = 4;
cudaStream_t streams[4];
for (int i = 0; i < num_streams; ++i) cudaStreamCreate(&streams[i]);

int chunk_size = total_size / num_chunks;

for (int i = 0; i < num_chunks; ++i) {
    int s = i % num_streams;
    int offset = i * chunk_size;
    cudaMemcpyAsync(&d_in[offset], &h_in[offset], chunk_size * sizeof(float),
                    cudaMemcpyHostToDevice, streams[s]);
    kernel<<<grid, block, 0, streams[s]>>>(d_in + offset, d_out + offset, chunk_size);
    cudaMemcpyAsync(&h_out[offset], &d_out[offset], chunk_size * sizeof(float),
                    cudaMemcpyDeviceToHost, streams[s]);
}
cudaDeviceSynchronize();
```

This processes data in chunks. While chunk N is uploading, chunk N-1 is computing and chunk N-2 is downloading. With 4 streams, several chunks are in flight at once. Total wall time approaches the slowest phase × number of chunks instead of summing all phases.

For data that doesn't fit on GPU at once, this is how you achieve performance.

### When streams don't help

Concurrency requires the GPU to have spare capacity. Streams don't help when:

- **Each kernel fills the GPU**. If one kernel uses all SMs, a second kernel waits anyway.
- **No transfers to overlap with**. If your data fits and stays on GPU, there's nothing to pipeline.
- **Synchronization patterns serialize anyway**. Naive uses of `cudaDeviceSynchronize` defeat streams.

The biggest wins are when:

- Workloads have a transfer + compute pattern.
- Individual kernels are small enough that the GPU has spare capacity.
- Data is large enough to chunk meaningfully.

### Multi-stream concurrency for small kernels

When kernels are too small to fill the GPU, multiple streams let several kernels run concurrently:

```cuda
kernelA<<<smallGrid, block, 0, stream1>>>(...);
kernelB<<<smallGrid, block, 0, stream2>>>(...);
kernelC<<<smallGrid, block, 0, stream3>>>(...);
```

If each kernel uses, say, 20% of the GPU's SMs, all three can run simultaneously. Wall time is roughly that of the slowest, not the sum.

This pattern is useful for serving many small inference requests, processing multiple independent streams, etc.

### Stream priorities

Some hardware supports stream priorities — high-priority streams get preferential scheduling:

```cuda
int low_prio, high_prio;
cudaDeviceGetStreamPriorityRange(&low_prio, &high_prio);
cudaStream_t high_stream;
cudaStreamCreateWithPriority(&high_stream, cudaStreamNonBlocking, high_prio);
```

Useful when one stream's work is latency-critical (e.g., user-facing inference) and others are background (e.g., logging).

### CUDA Graphs — capturing repeated workflows

For workflows you repeat many times (like ML training steps), CUDA Graphs let you capture the operations once and replay them with lower overhead:

```cuda
cudaStreamBeginCapture(stream, cudaStreamCaptureModeGlobal);

kernel1<<<..., 0, stream>>>(...);
kernel2<<<..., 0, stream>>>(...);
cudaMemcpyAsync(..., stream);

cudaGraph_t graph;
cudaStreamEndCapture(stream, &graph);

cudaGraphExec_t graph_exec;
cudaGraphInstantiate(&graph_exec, graph, nullptr, nullptr, 0);

// Now you can launch the whole thing with one call, repeatedly
for (int i = 0; i < 1000; ++i) {
    cudaGraphLaunch(graph_exec, stream);
}
```

CUDA Graphs reduce kernel launch overhead (which can dominate for many small kernels). Used heavily in PyTorch (`torch.compile`) and inference engines.

### Streams in PyTorch

PyTorch exposes streams:

```python
stream1 = torch.cuda.Stream()
stream2 = torch.cuda.Stream()

with torch.cuda.stream(stream1):
    a = compute_something(x)

with torch.cuda.stream(stream2):
    b = compute_something_else(y)

torch.cuda.synchronize()
```

Useful for advanced workflows where you want explicit control over concurrency. Most PyTorch code uses the default stream and relies on the framework's optimizations.

PyTorch's `DataLoader` with `pin_memory=True` and `num_workers > 0` implements the classic transfer-overlap-compute pattern using streams under the hood.

### NCCL and multi-GPU streams

Multi-GPU communication uses streams too. NCCL operations are stream-aware:

```cpp
ncclAllReduce(d_send, d_recv, count, ncclFloat, ncclSum, comm, stream);
```

This lets you overlap communication with compute — kernel runs on GPU 0 while gradients shuttle between GPUs. The same overlap principle applies at multi-GPU scale.

In distributed training (DDP, FSDP, etc.), framework code orchestrates many streams to keep both compute and communication busy.

### Common bugs

Stream bugs:

- **Forgetting `pin_memory`**: async copies fall back to sync without it.
- **Using default stream by accident**: forgotten `stream` argument synchronizes everything.
- **Over-synchronizing**: `cudaDeviceSynchronize` inside a hot loop defeats streams.
- **Race conditions**: when one stream depends on another's output but no event sync.
- **Too many streams**: overhead of stream management exceeds benefit; 4-8 streams is usually enough.

### How much overlap do you actually get?

Profile with Nsight Systems. The timeline view shows what's happening on each engine:

- Compute engine: kernels running.
- Copy engine 1: H2D transfers.
- Copy engine 2: D2H transfers.
- CPU: launching things, doing other work.

If you see horizontal bars on all engines simultaneously, you have concurrency. If you see bars on one engine at a time, you don't.

The actual speedup depends on the relative cost of each phase. Best case (perfectly balanced compute and transfers): ~3x speedup. Typical case: 1.5-2x. Worst case: no improvement because one phase dominates.

### What this means for your code

For your specific code:

- **Pure GPU workloads** (everything stays on GPU): streams help less; main gain is overlapping multiple small kernels.
- **Streaming workloads** (continuous data in/out): streams help a lot; classic 3-way overlap.
- **Iterative workloads** (training loops): CUDA Graphs reduce launch overhead.
- **Multi-process / multi-GPU**: streams + NCCL for communication overlap.

## Three real-world scenarios

**Scenario 1: A large file process on GPU.**
The dataset is 50 GB; doesn't fit in 24 GB GPU memory. Solution: chunk into 1 GB pieces, use 4 streams, process chunks in flight. While chunk N is computing on GPU, chunk N-1 results are downloading, chunk N+1 is uploading. Total time is roughly file_size / max(read_bandwidth, compute_throughput, write_bandwidth) — limited by the slowest, not the sum.

**Scenario 2: PyTorch training with prefetch.**
DataLoader with `pin_memory=True, num_workers=4` runs CPU workers loading batches into pinned memory. Main loop's `batch.to('cuda', non_blocking=True)` is async. By the time the model forward pass needs the batch, it's already on GPU. Overlap of CPU loading + GPU compute + data transfer all happens automatically.

**Scenario 3: Inference serving with many concurrent requests.**
Each request is small enough to use only 20% of the GPU. With multiple streams, several requests run concurrently. Total throughput goes up; per-request latency may stay similar or improve. Tools like NVIDIA Triton Inference Server use this extensively.

## Common mistakes to avoid

- **Forgetting to pin memory** for async copies.
- **Calling cudaDeviceSynchronize too often** — kills concurrency.
- **Using the default stream** when you wanted concurrency.
- **Too many streams** — diminishing returns, overhead.
- **Race conditions** between streams without events.
- **Profiling without Nsight Systems** to see the timeline.

## Read more

- NVIDIA CUDA C++ Programming Guide — chapter on asynchronous concurrent execution.
- NVIDIA developer blog: posts on CUDA streams and graphs.
- Nsight Systems documentation.

## Summary

- **Streams** are ordered queues; different streams can run concurrently.
- **Default stream** synchronizes with everything; use named streams for concurrency.
- **Async transfers** (`cudaMemcpyAsync`) require pinned memory.
- **3-way overlap**: transfer up + compute + transfer down simultaneously.
- **Multi-kernel concurrency** when individual kernels are small.
- **CUDA Graphs** reduce launch overhead for repeated workflows.
- **Events** let one stream depend on a specific point in another.
- **PyTorch / frameworks** handle most of this for you.
- **Profile with Nsight Systems** to verify overlap.

Next: profiling with Nsight.
