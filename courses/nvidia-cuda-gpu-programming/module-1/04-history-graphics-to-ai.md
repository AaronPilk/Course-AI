---
module: 1
position: 4
title: "A brief history — from graphics to AI"
objective: "Track why GPUs became the engine of AI."
estimated_minutes: 8
---

# A brief history — from graphics to AI

## The puzzle

In 2010, NVIDIA was a graphics card company worth ~$10B. By 2024, it crossed $3 trillion in market cap on the strength of AI compute. Same hardware lineage, dramatically different valuation. How did a graphics chip become the engine of modern AI, and why did NVIDIA dominate it?

The history is short but matters. The architectural and software choices that made GPUs useful for graphics turned out to be exactly what AI needed.

## The simple version

The story in five beats:

1. **1990s-2000s**: GPUs evolve for 3D graphics. Hardware-parallel pixel and vertex math.
2. **2007**: NVIDIA releases CUDA, making GPUs programmable for general compute.
3. **2012**: AlexNet wins ImageNet trained on GPUs — deep learning takes off.
4. **2016-2020**: Transformers + GPU clusters enable large-scale ML.
5. **2022-onward**: ChatGPT and LLMs make GPU compute strategic.

NVIDIA bet on CUDA when it had no obvious application beyond graphics. That bet looked premature for ~15 years and then suddenly looked prescient.

## The technical version

### The graphics era

Early 3D graphics required hardware that could:

- Transform millions of vertices per frame (matrix multiplications).
- Color millions of pixels per frame (independent per-pixel work).
- Apply textures, lighting, depth tests at extreme parallelism.

CPUs couldn't keep up — too few cores, too much serialization. Dedicated graphics hardware emerged. NVIDIA, ATI (later AMD), and others raced to build chips that did this efficiently.

By the early 2000s, GPUs had become massively parallel SIMD-like processors specifically tuned for graphics. They were also programmable in limited ways via "shaders" — small programs that ran on the GPU as part of rendering.

### The GPGPU era (early-mid 2000s)

Researchers noticed: this hardware is incredibly parallel and good at math. Could you use it for things other than graphics?

The first wave was hacky. People would encode their scientific computations as fake "shaders" using graphics APIs (OpenGL, DirectX). You'd pretend your matrix multiplication was a pixel-coloring problem and trick the GPU into doing it.

It worked, kind of. Speedups were impressive for specific workloads. But the programming model was hostile — you had to think in graphics terms to do non-graphics work.

This phase was called GPGPU — General-Purpose GPU computing.

### CUDA arrives (2007)

NVIDIA noticed and made a strategic move: build a programming model designed for general compute, not graphics.

CUDA (Compute Unified Device Architecture) launched in 2007 with the G80 GPU. Key features:

- **C-like programming language** with extensions for parallelism.
- **Explicit thread/block/grid model** instead of graphics abstractions.
- **Direct memory access** via host/device transfers.
- **Compiler toolchain** (nvcc) that compiled CUDA C to GPU machine code.

For the first time, researchers could write parallel scientific code that ran on a GPU without pretending to do graphics. CUDA made the hardware general-purpose.

NVIDIA also made a commercial bet: CUDA was free, but it only ran on NVIDIA hardware. If general-purpose GPU computing took off, NVIDIA would own the platform.

For years, this bet looked questionable. CUDA was used in academic HPC, finance, scientific computing, computer graphics research — niches. Revenue was small.

### The deep learning moment (2012)

Geoffrey Hinton's group at Toronto trained a neural network (AlexNet) for ImageNet using NVIDIA GPUs and CUDA. AlexNet won the 2012 ImageNet competition by a wide margin, demonstrating that deep convolutional networks could beat traditional computer vision methods.

The hardware story: AlexNet trained on two GTX 580 GPUs. Without GPU acceleration, the training would have taken weeks or months on CPU clusters. With GPUs, days.

The architecture story: deep learning is dominated by matrix multiplications and convolutions. Both are embarrassingly parallel. Both fit GPU hardware perfectly.

This moment is the inflection point. After 2012, deep learning research effectively required GPUs. NVIDIA's CUDA ecosystem became the default platform.

### The scale era (2016-2020)

Through the late 2010s, deep learning models grew rapidly:

- **2014**: GANs, AlphaGo's early versions.
- **2017**: Transformer architecture introduced ("Attention Is All You Need").
- **2018**: BERT shows transformers work for language understanding.
- **2019**: GPT-2 scales transformers further.
- **2020**: GPT-3 (175B parameters) demonstrates emergence at scale.

Each step required more GPU compute. Model sizes grew by orders of magnitude. Single-GPU training became infeasible — multi-GPU then multi-node clusters became standard.

NVIDIA matched this with:

- **Tensor Cores** (Volta, 2017): specialized matrix-multiply units for deep learning.
- **NVLink**: high-bandwidth GPU-to-GPU interconnect.
- **DGX systems**: integrated multi-GPU servers.
- **Mellanox acquisition** (2019): high-bandwidth networking for GPU clusters.

The ecosystem advantage compounded. CUDA, cuDNN, NCCL (multi-GPU communication), TensorRT (inference) — NVIDIA owned the whole stack.

### The LLM moment (2022-present)

ChatGPT launched November 2022. Within months it was clear that LLMs were a new category of product, and that running them required massive GPU compute.

Demand for NVIDIA GPUs exploded:

- **H100 (2022-2023)**: 80 GB HBM3, 3 TB/s bandwidth, far more capable Tensor Cores than predecessors.
- **B200/Blackwell (2024)**: even larger, more efficient.
- **Networking ecosystem**: NVLink, NVSwitch, InfiniBand all scaled to support training clusters.

NVIDIA's market cap went from ~$300B in 2020 to over $3T in 2024 — primarily on AI demand.

The competitors:

- **AMD**: Instinct MI series with ROCm software stack. Capable hardware, lagging software/ecosystem.
- **Google TPUs**: optimized for Google's workloads. Available via Google Cloud.
- **Intel Gaudi, custom AI chips**: various efforts, none dominant.
- **Apple Silicon**: Neural Engine, GPU for on-device ML, not data center.

NVIDIA's lead is real but not infinite. The software ecosystem (CUDA, cuDNN, frameworks like PyTorch defaulting to CUDA) is the bigger moat than the hardware itself.

### Why CUDA's lead is so durable

Frameworks like PyTorch and TensorFlow target CUDA first. ML researchers write CUDA-targeted code (often without realizing it — just using PyTorch on GPU). Libraries (cuBLAS, cuDNN, TensorRT) are CUDA-only and highly optimized.

Switching to alternative hardware requires:

- Equivalent kernels for the new hardware.
- Compatible libraries.
- Framework-level support.
- Testing and validation.

The ecosystem of CUDA code is massive and growing. AMD's ROCm is improving but lags. Custom chips compete only in narrow use cases.

NVIDIA's bet on CUDA in 2007 looks brilliant in retrospect because of the compound effect: every year of CUDA-only ecosystem growth makes the moat deeper.

### The hardware progression

Each NVIDIA architecture generation has roughly doubled performance for AI workloads:

- **Kepler** (2012): early CUDA era.
- **Maxwell** (2014): improved efficiency.
- **Pascal** (2016): more memory, faster.
- **Volta** (2017): Tensor Cores introduced.
- **Turing** (2018): consumer Tensor Cores, ray tracing.
- **Ampere** (2020): A100 — 312 TFLOPS FP16, transformative for AI.
- **Hopper** (2022): H100 — 1979 TFLOPS FP8, transformative for LLMs.
- **Blackwell** (2024): B100/B200 — even bigger, more memory.

Each generation enabled larger models. LLM scaling tracks GPU capability.

### Where this all goes

Open questions:

- **Will CUDA's moat hold?** If AMD/others catch up on software, NVIDIA's pricing power erodes.
- **Will specialized AI hardware (TPUs, ASICs) take share?** Possible for inference; less for training where flexibility matters.
- **Will the AI compute scale-up continue?** Depends on whether scaling laws hold and whether economics keep pace.
- **What's the role of edge GPU?** Increasingly relevant for on-device AI.

The short answer: NVIDIA is dominant now, structural moats are real, but no single position lasts forever in compute.

### Lessons from the history

For practitioners:

1. **CUDA is the de facto standard** — invest in learning it.
2. **Frameworks abstract a lot** — but understanding what they're doing on GPU matters for optimization.
3. **Hardware generations matter** — performance characteristics shift; what was a bottleneck on A100 may not be on H100.
4. **Memory and interconnect matter as much as compute** — the dollar-per-FLOP ratio isn't the whole picture.
5. **The ecosystem advantage is real** — alternatives exist but require effort to use.

For strategy:

1. **NVIDIA's market position is the result of a 15-year bet** — long-term platform thinking pays off.
2. **Software ecosystems compound** — early lock-in becomes structural advantage.
3. **General-purpose-good-enough beats specialized-better** when the general-purpose has ecosystem momentum.
4. **Watch China** — Chinese cloud providers and government investment in alternatives matters strategically.

## Three real-world scenarios

**Scenario 1: A PyTorch model running on GPU.**
You write `.to('cuda')` and PyTorch handles the rest. Under the hood: PyTorch calls cuDNN for convolutions, cuBLAS for matmuls, NCCL for multi-GPU communication. You never write CUDA directly, but you're using it.

**Scenario 2: A company tries to switch from NVIDIA to AMD GPUs.**
They use AMD Instinct GPUs and ROCm. Migration takes months: porting custom kernels, validating framework support, dealing with library gaps. The hardware is comparable; the software ecosystem is not. Many companies abandon the migration.

**Scenario 3: A startup builds an AI chip from scratch.**
They face the same challenge: even with great silicon, getting PyTorch/TensorFlow to perform well on novel hardware requires building equivalents of the entire CUDA software stack. Most such companies fail; the survivors find narrow niches (specific workloads, specific scales).

## Common mistakes to avoid

- **Treating NVIDIA's lead as permanent** — it's earned but not inevitable.
- **Ignoring software ecosystem** — it's the moat, not the silicon.
- **Optimizing for the wrong GPU generation** — characteristics shift.
- **Underestimating Chinese hardware investment** — strategic compute is a national priority.
- **Confusing graphics GPUs with data center GPUs** — same lineage, different design points.

## Read more

- *The Innovator's Dilemma* by Christensen — platform shifts in computing.
- NVIDIA's CUDA history pages.
- The original AlexNet paper (Krizhevsky, Sutskever, Hinton 2012).

## Summary

- **GPUs evolved for graphics** in the 1990s-2000s.
- **CUDA (2007)** made GPUs programmable for general compute.
- **AlexNet (2012)** showed deep learning + GPUs could beat everything else.
- **Scale era** (2016-2020) brought transformers and multi-GPU training.
- **LLM moment (2022+)** made GPU compute strategic.
- **NVIDIA's software ecosystem** (CUDA, cuDNN, NCCL, TensorRT) is the durable moat.
- **Competitors exist** — AMD, TPUs, custom chips — but lag in ecosystem.
- **The position is earned, not inevitable** — moats can erode.

That wraps Module 1. Next: actually writing CUDA code.
