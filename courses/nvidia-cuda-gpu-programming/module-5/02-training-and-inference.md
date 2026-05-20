---
module: 5
position: 2
title: "Training and inference workloads"
objective: "See how LLM training and inference actually run on GPUs."
estimated_minutes: 8
---

# Training and inference workloads

## The puzzle

Training a large language model is one workload. Serving the same model for inference is a completely different workload. Different bottlenecks, different optimizations, different hardware preferences. Understanding both — and where they diverge — is core to modern AI infrastructure.

## The simple version

**Training** is throughput-oriented. You batch many examples together, run forward + backward + optimizer steps repeatedly for days or weeks. Per-step latency doesn't matter much; total wall-clock time does. Optimized for raw FLOPS, large batches, multi-GPU scaling.

**Inference** is latency-oriented for online use cases. A single user wants their response now. Smaller batches (often batch-of-one for chat), low per-request latency, focus on first-token and tokens-per-second metrics. Memory bandwidth often matters more than raw FLOPS.

Same GPU, same model, very different optimization targets.

## The technical version

### Training: the basic loop

A training step:

1. **Load batch**: read training examples from disk, transfer to GPU.
2. **Forward pass**: compute model outputs and loss. Activations stored for backward pass.
3. **Backward pass**: compute gradients by backpropagation through the saved activations.
4. **Optimizer step**: update weights using gradients (Adam, SGD, etc.).
5. **Repeat**.

For large models, this is dominated by matmul. Transformer training: 60-80% of FLOPS goes to matrix multiplications in attention and feed-forward layers.

### Memory during training

Training memory is dominated by:

- **Model weights**: parameters × bytes per param. 70B model × FP16 (2 bytes) = 140 GB.
- **Gradients**: same shape as weights, similar memory.
- **Optimizer state**: Adam keeps two extra tensors per weight (momentum, variance). 4-8x model weight size.
- **Activations**: stored during forward pass for use in backward. Scales with sequence length × batch size × hidden dim.

Total for a 70B model in BF16 with Adam: roughly 1 TB+. Far exceeds single-GPU memory. Hence: distributed training.

### Inference: the basic flow

Inference for an LLM:

1. **Prefill**: process the input prompt. All input tokens fed through the model in parallel.
2. **Decode**: generate output tokens one at a time, each depends on the previous.
3. **Repeat decode** until stop condition (max tokens, EOS token, etc.).

Key difference from training: no backward pass, no gradients, no optimizer state. Much smaller memory footprint per request.

### Prefill vs decode

Prefill: parallelizable. The input prompt is processed in one matmul-heavy pass. High arithmetic intensity, GPU-compute-bound, similar to training step in shape.

Decode: sequential. Each output token requires reading the full model weights, doing a small amount of math, producing one new token. Low arithmetic intensity (only one token of activation through layers), memory-bandwidth-bound.

This split is critical for optimization. Prefill is compute-bound; decode is memory-bound. Different optimizations apply.

### KV caching

During decode, naively recomputing all attention values each new token is hugely wasteful. KV caching saves intermediate attention values (keys and values) from each previous token, only computing for the new one.

KV cache size: hidden_dim × num_heads × num_layers × sequence_length × 2 (K and V) × bytes_per_param.

For a 70B model at FP16 with 4096 sequence: ~6 GB per request just for KV cache. Times batch size, this dominates inference memory.

KV cache management is a major LLM inference optimization area: paging (vLLM's PagedAttention), shared prefix caching, eviction policies, etc.

### Batching for inference

Inference can batch multiple requests:

- **Static batching**: fixed batch size, all requests at same step.
- **Continuous batching** (a.k.a. dynamic batching, in-flight batching): requests at different stages share the same batch. As soon as one request finishes, a new one slots in.

Continuous batching dramatically improves throughput by keeping the GPU saturated. Implemented by inference engines like vLLM, TensorRT-LLM, SGLang.

For chat interfaces, decode is memory-bound: each new token needs to read all the model weights. Batching many requests' decodes together amortizes this weight read — same memory cost, more useful tokens generated. Speedup is roughly proportional to batch size (up to the point where compute becomes the bottleneck).

### Distributed training

For models too big for one GPU, training is distributed:

- **Data parallel**: each GPU has the full model, processes different examples. Gradients are aggregated across GPUs (NCCL all-reduce). Simple but limited by model fitting on each GPU.

- **Tensor parallel**: split each layer's weights across GPUs. Each GPU stores 1/N of the weights; matmuls happen in pieces with intermediate communication. Needed for models too large per layer.

- **Pipeline parallel**: split layers across GPUs. Each GPU runs a subset of layers; data flows through them like a pipeline. Useful when many layers but each layer fits one GPU.

- **Sequence parallel**: split along sequence dimension. Used in some advanced setups.

- **Expert parallel**: for mixture-of-experts models, distribute experts across GPUs.

Real-world training of frontier LLMs combines all of these (data + tensor + pipeline + expert). Frameworks like Megatron-LM, DeepSpeed, FSDP, Colossal-AI orchestrate the combinations.

### FSDP (Fully Sharded Data Parallel)

Modern PyTorch standard for large model training. Each GPU stores only a shard of the model weights. Before computing a layer, GPUs gather the full layer weights via all-gather; after using them, the weights are released. Memory footprint per GPU is roughly 1/N of the model + activations for the current layer.

FSDP is simpler than full 3D parallelism for many cases. Combined with mixed precision and activation checkpointing, it scales well.

### Gradient checkpointing

Training memory's activation portion can be reduced by gradient checkpointing: discard activations during forward pass, recompute them during backward as needed. Trade compute for memory.

Typical savings: 30-50% activation memory reduction at the cost of ~20-30% more compute. Worth it when memory is the binding constraint.

### Inference memory optimization

LLM inference engines push memory hard:

- **PagedAttention**: KV cache in pages, no fragmentation, allowing more concurrent requests.
- **Quantization**: lower precision weights and activations.
- **Speculative decoding**: small draft model proposes tokens, big model verifies — fewer big-model passes.
- **Multi-query attention / grouped-query attention**: reduce KV cache size with architectural changes.

State-of-the-art LLM inference (vLLM, TensorRT-LLM) implements all of these. For LLM serving, infrastructure has become a major engineering field.

### Throughput vs latency tradeoffs

Inference systems navigate:

- **Lower latency** (small batch, full precision, no speculation): better per-request experience, lower throughput.
- **Higher throughput** (large batch, lower precision, aggressive optimization): more requests per second, slightly higher per-request latency.

For chat: prioritize latency for first token, throughput for the rest.
For batch processing: pure throughput.
For latency-critical agents: ultra-low first-token latency.

Different optimizations fit different products.

### Training vs inference hardware preferences

Training and inference favor different GPU characteristics:

**Training favors**:
- Maximum FLOPS for compute-bound matmuls.
- Lots of memory (to hold model + gradients + optimizer).
- Fast NVLink between GPUs (for tensor and pipeline parallel).
- Fast InfiniBand between nodes (for data parallel all-reduce).

**Inference favors**:
- Memory bandwidth (for decode's weight reads).
- Sufficient memory to fit the model + KV cache.
- Lower-precision compute (FP8/INT8 throughput).
- Lower-cost GPUs are fine if precision is right.

Training clusters use top-tier hardware (H100, B200) heavily networked. Inference can use cheaper GPUs (T4, L4) for smaller models, or H100s for the largest LLMs.

### MoE — mixture of experts

Mixture-of-experts (MoE) models route each token through a subset of "experts" (sub-networks). Only a fraction of total parameters are active per token, giving the capacity of a large model with the compute of a smaller one.

Training MoE: complex routing, expert load balancing, all-to-all communication. Frameworks have specialized support (e.g., Megatron-MoE).

Inference MoE: routing means each request uses different parts of the model. Batching becomes harder. Specialized inference engines (vLLM with MoE support) handle this.

Notable MoE models: GPT-4 (rumored), Mixtral, DeepSeek-MoE. The pattern is now common at frontier scale.

### What this means in practice

For most people, "training" and "inference" reduce to:

- **Use a framework** (PyTorch, JAX) that handles the GPU details.
- **For training**: pick a parallelism strategy (FSDP, DeepSpeed) based on model size.
- **For inference**: use an inference engine (vLLM, TensorRT-LLM, SGLang).
- **Don't write the orchestration from scratch** unless you have a research reason.

The performance gap between hand-written and framework-managed is small relative to the engineering cost of doing it yourself.

### Cost economics

Rough numbers for context:

- Training a frontier 100B-parameter model: $5-50M in compute alone, weeks on thousands of GPUs.
- Inference serving the same model: pennies-to-dollars per request depending on length and hardware.
- Marginal cost of training: dominated by GPU-hours.
- Marginal cost of inference: dominated by GPU-hours per token generated.

For products, inference cost adds up over millions of requests. Inference optimization (quantization, batching, caching) directly reduces operating costs. Training optimization affects how often you can iterate.

### Trends

Observable patterns in 2025:

- **Inference becoming dominant cost** as deployed AI services scale.
- **Specialization of inference hardware** (Groq, Cerebras, etc., plus NVIDIA's lower-cost cards).
- **Mixture-of-experts gaining ground** at frontier scale.
- **Speculative decoding** becoming standard.
- **Quantization-aware training** for better INT4 inference.
- **Test-time compute** patterns (more inference compute per query for better answers).

The training-inference balance is shifting. Frontier training still uses thousands of top GPUs; inference at scale is the more common bottleneck for most companies.

## Three real-world scenarios

**Scenario 1: Training a 70B model with FSDP.**
A team trains a 70B LLM. With FSDP, each GPU holds 1/256 of the weights (across 256 GPUs in a node-cluster). Activation checkpointing saves memory. BF16 + FP32 optimizer state. Per-step time: ~10 seconds. Training run: ~10 days on the cluster. Without FSDP and BF16, this would be infeasible on the same hardware.

**Scenario 2: Inference at 1000 tokens/sec aggregate.**
A serving setup wants 1000 tok/s across all users for a 70B model on a single H100. Using vLLM with continuous batching, FP8, paged attention, and speculative decoding, this is achievable for moderate sequence lengths. Bare PyTorch inference would do ~50 tok/s.

**Scenario 3: First-token latency for a chat product.**
A chat interface needs first-token latency < 500ms. Prefill time dominates this for long prompts. Optimizations: chunked prefill (don't process the whole prompt at once if too long), speculative decoding (start generation before prefill is fully done), KV cache prewarming for known prefixes. Without these, long prompts have unacceptable latency.

## Common mistakes to avoid

- **Treating training and inference the same** — different optimizations.
- **Ignoring KV cache memory** — it dominates inference memory.
- **Skipping continuous batching** for production inference.
- **Not using an inference engine** — naive PyTorch inference is 5-10x slower.
- **Wrong parallelism choice** for training — pick based on model size and cluster.
- **Forgetting mixed precision** — leaves Tensor Core speedup on the table.

## Read more

- vLLM documentation and papers.
- DeepSpeed documentation.
- NVIDIA TensorRT-LLM documentation.
- Megatron-LM paper and code.

## Summary

- **Training**: throughput-oriented, batch-heavy, multi-GPU, days/weeks of wall time.
- **Inference**: latency-oriented for online, batch-oriented for batch jobs.
- **Prefill** (input processing): compute-bound, similar to training.
- **Decode** (generation): memory-bandwidth-bound, very different optimization.
- **KV caching** crucial for inference; manages with paging, eviction.
- **Continuous batching** keeps GPU saturated for inference.
- **Distributed training**: data + tensor + pipeline + expert parallel as needed.
- **Frameworks** (PyTorch FSDP, DeepSpeed, vLLM, TensorRT-LLM) handle most of this.
- **Inference cost** is becoming dominant in deployed AI; optimization matters.

Next: how GPU clusters scale.
