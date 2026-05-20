---
module: 5
position: 4
title: "The future — Hopper, Blackwell, and beyond"
objective: "See where the hardware is heading."
estimated_minutes: 9
---

# The future — Hopper, Blackwell, and beyond

## The puzzle

The pace of GPU progression is unprecedented. Each architecture generation (~2 years) roughly doubles AI performance. Hopper (H100, 2022) was transformative for LLMs; Blackwell (B100/B200, 2024) doubles that again; the next generation is in the pipeline. Where does this go, and what does it mean for software design today?

## The simple version

Recent and upcoming NVIDIA architectures:

- **Ampere** (A100, 2020): ~312 TFLOPS FP16. The previous-generation workhorse.
- **Hopper** (H100, 2022): ~989 TFLOPS BF16, ~1979 TFLOPS FP8. Tensor Cores improved dramatically; Transformer Engine introduced.
- **Blackwell** (B100/B200, 2024): Doubles Hopper's throughput. New FP4/FP6 support, larger memory, higher NVLink bandwidth.
- **Next gen** (rumored): Continuing the pattern.

The trends: more Tensor Cores, lower-precision support, more memory, faster interconnects, more aggressive integration of multiple chips.

## The technical version

### Hopper (H100) — the LLM era's defining chip

H100 launched in 2022, just before ChatGPT made LLMs mainstream. Key features:

- **Fourth-gen Tensor Cores**: ~3x the throughput of A100 for FP16/BF16.
- **FP8 support**: ~6x faster than A100's FP16, with the Transformer Engine to manage dynamic range.
- **HBM3 memory**: 80 GB at 3 TB/s bandwidth.
- **NVLink 4**: 900 GB/s GPU-to-GPU.
- **Dynamic Programming Instructions (DPX)**: hardware acceleration for algorithms like Smith-Waterman.
- **Async memory ops**: TMA (Tensor Memory Accelerator) for bulk transfers.
- **Thread block clusters**: Groups of blocks that can share data via "distributed shared memory."

H100 was the workhorse of 2023-2024 frontier AI training and inference. Most state-of-the-art models trained on H100 clusters.

### Blackwell (B100/B200) — the 2024+ generation

Blackwell was announced in March 2024:

- **Two dies per package**: Blackwell GPUs are "chiplet" designs with two large dies interconnected at 10 TB/s. From software's perspective, it appears as one logical GPU with combined resources.
- **Higher FLOPS**: Roughly 2x Hopper across precision modes.
- **FP4 support**: New ultra-low precision for inference.
- **More memory**: B200 has 192 GB HBM3e.
- **NVLink 5**: 1.8 TB/s GPU-to-GPU.
- **NVL72 rack**: 72 GPUs in one liquid-cooled rack as a coherent computing fabric.

The chiplet approach is a strategic shift. Building one monolithic die hits manufacturing limits; combining two large dies via fast interconnect lets you keep growing.

### What "doubling every generation" really means

The pattern: each generation gets ~2x performance for AI workloads, with the headline number being something like "lower-precision peak FLOPS."

But the practical experience is more nuanced:

- **Compute per dollar**: increases, but not exactly 2x. Higher-end SKUs are expensive.
- **Compute per watt**: improves but not as dramatically — power per GPU also grows.
- **Memory per GPU**: increases over time but slower than compute.
- **Memory bandwidth**: keeps pace with compute (mostly).
- **Inter-GPU bandwidth**: grows generation-over-generation.

The "doubling" is real for the right workload. For workloads bottlenecked elsewhere (memory bandwidth in decode, communication in distributed training), gains are less dramatic.

### Precision trends

The precision lower-bound keeps dropping:

- **2017-2018**: FP16 was the new low.
- **2020**: BF16, TF32.
- **2022**: FP8.
- **2024**: FP4 (Blackwell).

Each lower-precision mode doubles peak throughput. The question is always: does my workload still produce acceptable results at this precision?

For training: BF16 is the standard. FP8 is increasingly viable for frontier-scale training with Transformer Engine.

For inference: FP8 is becoming mainstream. INT4 and FP4 are emerging for the most cost-sensitive deployments.

### Memory wall pressure

A persistent challenge: compute grows faster than memory bandwidth. Even with HBM3 and HBM3e improvements, peak compute outpaces memory delivery.

The implication: workloads become more memory-bound over time, despite hardware getting faster at compute. Optimizations like:

- Tiling and reuse via shared memory.
- Lower-precision quantization.
- Fused kernels (less memory traffic between ops).
- KV caching and other reuse patterns.

...become more important, not less, as hardware progresses.

### Larger systems, not just larger GPUs

NVIDIA's strategy has shifted from "build a bigger GPU" toward "build a bigger system":

- **NVL72**: 72 B200 GPUs in one liquid-cooled rack with NVSwitch fabric. Acts as one giant compute node from a programming perspective.
- **DGX SuperPOD**: pre-built clusters with thousands of GPUs and integrated networking.
- **Spectrum-X Ethernet**: NVIDIA's networking technology optimized for AI workloads.

The customer for top-tier GPUs increasingly buys racks or clusters, not individual cards. Pricing follows: tens of millions of dollars per rack.

### Competition

AMD (Instinct MI series):

- MI300X: 192 GB memory, competitive on raw FLOPS, ROCm software stack.
- ROCm has improved significantly but lags CUDA on ecosystem depth.
- AMD has won some major deployments (Meta uses MI300X for some workloads, Microsoft has bought significant quantities).

Google TPUs:

- Pod-scale TPUs (v4, v5p) compete with NVIDIA clusters for Google's internal workloads.
- TPUs available via Google Cloud but not widely used outside Google.

Other specialized chips:

- **Cerebras**: wafer-scale chips for training.
- **Groq**: inference-optimized chips with very high tokens/second.
- **SambaNova, Tenstorrent, Habana, Graphcore**: various specialized architectures.

Most non-NVIDIA chips compete in narrow niches. NVIDIA's CUDA ecosystem advantage holds for most ML workloads.

### Chinese hardware

China's chip ecosystem is developing under US export restrictions:

- **Huawei Ascend** (910B and beyond): competitive for inference, behind on training at frontier scale.
- **Other Chinese chips**: Cambricon, Biren, etc., at varying maturity.

For Chinese AI workloads, domestic chips are increasingly used. Outside China, NVIDIA still dominates. US export controls limit which NVIDIA chips can ship to China — leading to "throttled" versions (H800, H20) with reduced features.

### Specialized AI silicon

Beyond GPUs, specialized AI accelerators target specific workloads:

- **Inference ASICs**: optimized for one model family, very efficient at narrow scope.
- **TPU-style architectures**: systolic arrays for matrix math.
- **Cerebras WSE**: an entire silicon wafer as one chip.

For specific narrow uses (huge-batch inference of one model family, ultra-low-power edge inference), specialized chips can be 5-10x more efficient than GPUs. For general AI workloads, GPUs win because their flexibility matches the rapid algorithmic change.

### Software evolution

Hardware capabilities pull software forward:

- **CUDA 12+** adds support for newer hardware features (FP8, TMA, distributed shared memory).
- **PyTorch 2.x** with torch.compile generates better code for new hardware.
- **Triton** evolves to expose new hardware features without users writing PTX.
- **Inference engines** (TensorRT-LLM, vLLM) gain new optimizations to use new hardware features.

If you're starting a project in 2026, target the latest CUDA, latest PyTorch, latest hardware-supporting libraries. The ecosystem moves fast.

### Programming model future

The CUDA programming model has been stable but is extending:

- **Cooperative groups** for finer-grained parallelism.
- **Cluster-level cooperation** (Hopper+) for groups of blocks.
- **Async APIs** for everything (memory, kernels, synchronization).
- **Dynamic parallelism**: kernels launching kernels (a long-existing feature getting more use).
- **CUDA Graphs** for repeated workflows.

The high-level direction: more concurrency, more cooperation between thread groups, less explicit synchronization.

### Implications for current designs

If you're designing systems in 2026 that need to last 3-5 years:

- **Plan for higher compute per GPU** — current performance estimates will look conservative.
- **Memory bandwidth will lag compute** — design for memory-bound workloads.
- **Inter-GPU bandwidth keeps growing** — multi-GPU patterns will get easier.
- **Lower precision (FP8, FP4) becomes mainstream** — design for mixed precision.
- **CUDA ecosystem persists** — invest accordingly.
- **Cluster-scale matters** — single-GPU optimization isn't enough for biggest workloads.

### Bottlenecks of the future

What might bottleneck AI hardware in 2027-2030:

- **Memory bandwidth** continues to be the dominant constraint for inference.
- **Power and cooling** at cluster scale — facilities limits.
- **Interconnect at the rack level** — NVLink can only stretch so far.
- **Manufacturing** — TSMC capacity, advanced packaging.
- **Software ecosystem** — keeping up with hardware capabilities.

The hardware companies are aware of these and investing accordingly. Whether the doublings continue or hit limits is a major open question for the AI industry.

### The energy and cost angle

AI compute is becoming a major economic variable:

- Frontier training runs cost $10M-100M+ in compute alone.
- Data center electricity at scale is a strategic concern.
- Power grid capacity is now an AI bottleneck in some regions.
- Cooling water for cluster cooling raises environmental questions.

The "compute scaling" thesis assumes more hardware, more power, more cost is justified by better models. Whether this holds depends on returns to model scale and the economics of deployed AI.

### What practitioners should track

Watch:

- **New precision modes** (FP4, possibly FP2 eventually) — they unlock more throughput.
- **New interconnect generations** — NVLink 6, faster InfiniBand variants.
- **Memory technologies** — HBM4, etc.
- **Networking** — Ethernet vs InfiniBand at AI scale.
- **Specialized chips** — whether they break out beyond niches.
- **Software ecosystem moves** — Triton, JAX, Mojo, new frameworks.

The 2-year cadence of NVIDIA architectures shapes the industry's tempo. Major model upgrades, infrastructure investments, and ML research directions all align with hardware generations.

## Three real-world scenarios

**Scenario 1: A company planning a 3-year AI infrastructure investment.**
They have to choose between buying H100s now or waiting for B200. The math: B200 is roughly 2x performance at higher price. H100 is available now with proven software stack. They split: order H100s for immediate needs, plan B200 expansion for late 2024/2025 as availability improves. Most large AI organizations make similar phased decisions.

**Scenario 2: An LLM inference startup choosing hardware.**
Top-tier H100/B200 for serving frontier models. Lower-cost L4 or T4 for smaller models or speculative use cases. Memory size matters as much as compute — they pick GPUs based on model size (70B → H100 with ~80GB; smaller models can use less-expensive cards). Quantization (FP8/INT4) often determines what fits.

**Scenario 3: A startup considering AMD MI300X to save cost.**
MI300X is 30-40% cheaper per peak FLOP than H100. They evaluate: their custom kernels work on CUDA but need porting to HIP/ROCm. Their PyTorch models mostly work on AMD but with subtle issues. They estimate 2-3 months of engineering time to port and validate, with ongoing maintenance. For their workload size, the savings justify it — they switch some workloads to AMD while keeping CUDA for others. Many companies make similar calculations; most stay on NVIDIA because the migration cost exceeds the hardware savings for their specific scale.

## Common mistakes to avoid

- **Over-indexing on raw FLOPS** — memory bandwidth and inter-GPU bandwidth matter too.
- **Underestimating ecosystem cost** — switching off CUDA is expensive.
- **Buying too early** — wait for software ecosystem to mature on new architecture.
- **Buying too late** — capacity constraints mean delays.
- **Ignoring power/cooling** — facilities can be the binding constraint.
- **Forgetting precision** — choose precision based on workload, not hardware.

## Read more

- NVIDIA architecture whitepapers (Hopper, Blackwell).
- Industry analysis from SemiAnalysis, MosaicML, etc.
- *Compute and Memory Trends in AI* (various 2024-2025 publications).

## Summary

- **Hopper (H100, 2022)**: defining chip of the LLM era. FP8, Transformer Engine, 80 GB HBM3.
- **Blackwell (B100/B200, 2024)**: doubles Hopper. Two-die chiplet design, FP4, 192 GB.
- **Lower precision** trend continues — FP4 emerging for inference.
- **Memory bandwidth** lags compute; tiling and quantization matter more.
- **Systems, not just chips** — racks like NVL72 as the unit of purchase.
- **Competition** exists (AMD MI300X, TPUs, specialized chips) but ecosystem favors NVIDIA.
- **Power and cooling** are strategic constraints.
- **CUDA ecosystem** continues to define the industry; lock-in is real and durable.

That wraps Module 5 and the course. GPU computing is in the middle of a transformation as significant as the move from CPU to GPU itself was. The hardware will keep evolving; the disciplines you've learned — coalescing, occupancy, library use, profiling — will keep applying even as the specific numbers change.
