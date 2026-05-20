---
module: 5
position: 3
title: "Scaling — multi-GPU, multi-node, NVLink, InfiniBand"
objective: "Track how GPU clusters get built."
estimated_minutes: 8
---

# Scaling — multi-GPU, multi-node, NVLink, InfiniBand

## The puzzle

Training a frontier LLM requires thousands of GPUs working together. Inference at scale spans hundreds of nodes. How do all those GPUs talk to each other fast enough that the math doesn't sit waiting on data?

The answer is a hierarchy of interconnects: NVLink within a server, InfiniBand or high-speed Ethernet between servers, software libraries (NCCL) orchestrating the communication. Understanding the network topology is increasingly important to understanding GPU compute.

## The simple version

A modern AI cluster is hierarchical:

- **Single GPU**: 80 GB HBM, 3 TB/s memory bandwidth.
- **Single server (8 GPUs)**: connected by NVLink at 600-900 GB/s GPU-to-GPU.
- **Single rack (multiple servers)**: connected by InfiniBand at 400-800 Gbps.
- **Full cluster (thousands of GPUs)**: full-bisection fabric, ideally non-blocking.

Going up the hierarchy, bandwidth decreases and latency increases. Training algorithms try to keep communication local — within-server when possible — and overlap communication with compute.

## The technical version

### NVLink — within-server GPU interconnect

NVLink connects GPUs within a server. Bandwidth has grown each generation:

- **NVLink 2 (Volta, V100)**: 300 GB/s aggregate per GPU.
- **NVLink 3 (Ampere, A100)**: 600 GB/s.
- **NVLink 4 (Hopper, H100)**: 900 GB/s.
- **NVLink 5 (Blackwell, B100/B200)**: 1.8 TB/s.

For comparison: PCIe 5.0 x16 is ~128 GB/s bidirectional. NVLink is ~10x faster.

In an HGX/DGX server, 8 GPUs are interconnected by NVLink, often through an "NVSwitch" — a switch chip that gives all-to-all connectivity at full bandwidth. This means any two GPUs in the server can communicate at NVLink speeds.

NVLink enables tight cooperation between GPUs in a server: tensor parallel layers can synchronize within microseconds, gradients can be reduced across 8 GPUs quickly, KV caches can be partitioned across GPUs without huge overhead.

### InfiniBand — between-server interconnect

For multi-server clusters, InfiniBand (or high-speed Ethernet with RDMA) connects nodes:

- **HDR InfiniBand**: 200 Gbps per link.
- **NDR InfiniBand**: 400 Gbps.
- **XDR InfiniBand**: 800 Gbps (newer).

Multiple links per server. Modern AI nodes have 4-8 InfiniBand interfaces, total ~3.2 Tbps per server.

InfiniBand uses RDMA (Remote Direct Memory Access) — one server can directly read/write another's memory without involving the CPU. This is critical for GPU-to-GPU across nodes (GPUDirect RDMA goes directly from one GPU's memory through the NIC, across the network, into another GPU's memory).

### Topology: fat-tree, dragonfly, etc.

Cluster network topology matters at scale. Common patterns:

- **Fat-tree**: tree structure where higher levels have more bandwidth. Full bisection at every level.
- **Dragonfly**: flatter, multi-tier, optimized for fewer-hop paths.
- **Torus**: each node connects to neighbors in a 3D grid.

For AI training, "non-blocking" or "rail-optimized" topologies are common. The idea: any GPU can talk to any other GPU at full bandwidth, regardless of routing. Bottlenecks anywhere mean the slowest path defines cluster performance.

Custom AI clusters (Meta's RSC, Tesla's Dojo, NVIDIA's own systems) invest heavily in network topology because it's the limiting factor at scale.

### NCCL — the communication library

NCCL (NVIDIA Collective Communication Library) is the software that handles GPU-to-GPU communication. It implements:

- **All-reduce**: sum a tensor across all GPUs, every GPU gets the result. Used for gradient aggregation.
- **All-gather**: every GPU gets the full set of tensors. Used for assembling sharded weights.
- **Reduce-scatter**: distribute reduced results across GPUs. Used in some FSDP implementations.
- **Broadcast**: one GPU sends to all others.
- **All-to-all**: every GPU sends to every other GPU. Used for MoE routing.

NCCL picks the optimal algorithm and path: ring vs tree, NVLink vs InfiniBand, etc. The framework (PyTorch Distributed, JAX collectives) calls NCCL transparently.

For distributed training, NCCL performance often determines real cluster throughput. Tuning NCCL — buffer sizes, algorithm choice, link selection — is a specialized skill at large scale.

### Communication patterns in training

A data-parallel training step needs:

1. **Forward**: no communication.
2. **Backward**: gradients computed locally.
3. **Gradient all-reduce**: across all GPUs, sum gradients. This is the communication-heavy step.
4. **Optimizer step**: each GPU applies the same updates.

The all-reduce dominates communication cost. Strategies to minimize impact:

- **Bucketing**: group small tensors into bigger ones for fewer, more efficient transfers.
- **Overlapping**: start the all-reduce for layer N while computing layer N-1's backward.
- **Gradient compression**: reduce bytes transferred (top-k, quantization).
- **Pipelining**: spread gradient communication across the backward pass.

PyTorch's DistributedDataParallel does bucketing and overlapping automatically.

### Tensor parallel communication

Tensor parallel splits weights across GPUs and requires intra-layer communication. Common patterns:

- **Column-parallel**: input replicated, output split. Requires all-gather at the end.
- **Row-parallel**: input split, output replicated. Requires all-reduce of partial results.

Megatron-LM's classic tensor-parallel scheme alternates column- and row-parallel layers to minimize communication.

Tensor parallel typically lives within a server (over NVLink) because the communication frequency is too high for slower interconnects. 4-8 GPU tensor parallel is common; spanning multiple servers usually slows things down.

### Pipeline parallel communication

Pipeline parallel splits layers across GPUs. Each batch flows through the pipeline like an assembly line. Communication is between adjacent pipeline stages, much less frequent than tensor parallel.

Pipeline parallel can span servers easily — communication is small and infrequent. Pipeline bubbles (idle time when the pipeline isn't full) are the bigger concern.

Modern training combines:

- **Data parallel** outermost (replicate model across groups).
- **Pipeline parallel** within each group (split layers across servers).
- **Tensor parallel** within each pipeline stage (split layers across GPUs in a server).

This 3D parallelism scales to thousands of GPUs efficiently.

### Failure handling at scale

Thousands of GPUs running for weeks: some will fail. Strategies:

- **Checkpointing**: save state periodically; resume from checkpoint if a node dies.
- **Elastic training**: detect failures, drop the failed node, continue with remaining.
- **Spare nodes**: have extras; swap in when one fails.
- **Health monitoring**: detect slow/flaky GPUs before they cause silent corruption.

Frameworks like TorchRun, MosaicML's Composer, and others have built-in resilience. Without it, a 30-day training run hitting a hardware failure on day 28 is catastrophic.

### Bandwidth + latency hiding

Just like single-GPU CUDA hides memory latency with parallelism, multi-GPU training hides communication latency with compute:

- **Overlap gradient all-reduce** with backward computation of other layers.
- **Overlap tensor parallel communications** with compute via async APIs.
- **Use CUDA streams** to manage concurrent compute and communication.

The art is making sure communication never blocks compute. Profiling with Nsight Systems shows whether your training is overlap-limited or just communication-bound.

### Inference at scale

Multi-GPU inference is increasingly important:

- **Tensor parallel** to fit big models across GPUs.
- **Pipeline parallel** for very long models.
- **Replica parallel** for serving many requests (each replica is a copy of the model).
- **Disaggregated prefill/decode**: separate prefill workers (compute-heavy) from decode workers (memory-bandwidth-heavy).

NVIDIA Triton, vLLM, TensorRT-LLM all support various multi-GPU inference configurations.

The networking requirements for inference can be lighter than training (less frequent communication), but for tensor-parallel inference of large models, fast intra-server NVLink is still essential.

### Cloud vs on-premises

AI workloads can run on:

- **Public clouds** (AWS, GCP, Azure): GPU instances with various interconnect quality. Easy to use, expensive at sustained scale.
- **Specialty clouds** (Lambda, CoreWeave, RunPod, Crusoe): focused on AI workloads with better GPU pricing.
- **On-premises**: self-built clusters. Expensive upfront, cheaper at sustained scale.
- **Hybrid**: training on owned hardware, inference in cloud or at edge.

Top clouds offer "AI optimized" instance types (e.g., AWS P5, GCP A3, Azure ND) with H100s and InfiniBand. Pricing is high — frontier training on cloud is more expensive than building your own at the same scale.

### Power and cooling

Large GPU clusters consume serious power:

- **Per GPU**: 700-1000W active power (H100/B100).
- **Per server (8 GPUs)**: 6-10 kW.
- **Per rack (4-8 servers)**: 30-80 kW.
- **Frontier training cluster**: 100+ MW.

Cooling can't keep up at this density with air. Liquid cooling (cold plates, immersion) becomes standard for top-end clusters. Data center site selection now considers power grid capacity, cooling, and water access.

For context: a 100 MW AI cluster uses as much power as a small city. The energy economics of AI training and inference are becoming a strategic consideration at the national level.

### NCCL tuning in practice

For large-scale training, NCCL tuning matters:

- **Buffer size** (NCCL_BUFFSIZE): affects throughput vs latency.
- **Algorithm choice** (NCCL_ALGO=tree vs ring): different for small vs large messages.
- **Link selection** (NCCL_NET_GDR_LEVEL): GPUDirect RDMA tuning.
- **Topology awareness** (NCCL_TOPO_FILE): for custom cluster layouts.

Default settings work reasonably. For maximum performance at scale, NCCL experts tune extensively.

### What this means for the ML practitioner

For most ML engineers:

- **Use a framework** that handles distributed training (PyTorch FSDP, Lightning, DeepSpeed).
- **Pick parallelism strategy** based on model size and hardware (don't over-engineer).
- **Profile with Nsight Systems** to see if communication is overlap-limited.
- **Use NCCL defaults** unless you have a specific reason.
- **Plan for failures** with checkpointing.

The cluster details are mostly handled by frameworks. Knowing what's underneath helps you reason about scaling limits and pick the right configuration.

## Three real-world scenarios

**Scenario 1: An 8-GPU training run on one server.**
A team trains a 30B model on one H100 server. Tensor parallel = 8 (using NVLink at 900 GB/s for intra-layer communication). No multi-server complexity. Communication overhead minimal because NVLink is fast. Software: PyTorch with Megatron-style tensor parallel.

**Scenario 2: A 256-GPU training cluster.**
Frontier training: 32 nodes × 8 GPUs. 3D parallelism: data parallel × 4, pipeline parallel × 4, tensor parallel × 8. NCCL handles all-reduce across data-parallel groups, point-to-point for pipeline stages, all-reduce within tensor-parallel groups. InfiniBand carries inter-server traffic. Architecture decisions: pipeline depth, microbatch sizes, gradient accumulation — all tuned for the cluster topology.

**Scenario 3: Multi-GPU inference for a 175B model.**
A 175B parameter model is too large for one H100 (140 GB at FP16 vs 80 GB memory). Solution: tensor parallel across 4 GPUs in a server. Each GPU stores 1/4 of weights, intermediate activations exchanged via NVLink during inference. With FP8 and proper tensor-parallel implementation, achieves competitive serving throughput. Multi-server inference for even larger models follows the same pattern with InfiniBand between nodes.

## Common mistakes to avoid

- **Cross-node tensor parallel** — communication too frequent for InfiniBand latency.
- **Ignoring overlap** — communication blocking compute kills cluster efficiency.
- **No checkpointing** — long training runs without checkpoints risk catastrophic loss.
- **Over-parallelizing small models** — communication overhead exceeds compute benefit.
- **Untuned NCCL** at large scale — can leave significant performance on the table.
- **Mixing GPU types** — heterogeneous clusters have hard-to-debug performance issues.

## Read more

- NVIDIA NCCL documentation.
- Megatron-LM paper (Shoeybi et al.).
- DeepSpeed-Inference paper.
- "Megatron-Turing NLG 530B" paper (detailed cluster description).

## Summary

- **Hierarchical interconnects**: GPU memory → NVLink → InfiniBand → cluster network.
- **NVLink**: within-server, very fast (up to 1.8 TB/s).
- **InfiniBand**: between-server, fast (400-800 Gbps per link).
- **NCCL**: library handling all collective communication patterns.
- **3D parallelism**: data + tensor + pipeline parallel combined for frontier training.
- **Overlapping** communication with compute is essential.
- **Failures at scale** require checkpointing and elastic training.
- **Power and cooling** are strategic considerations.
- **Frameworks** (PyTorch FSDP, DeepSpeed, Megatron) handle most complexity.

Next: where the hardware is heading.
