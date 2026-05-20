---
module: 1
position: 1
title: "GPUs vs CPUs — what's actually different"
objective: "Build the right mental model for GPU hardware."
estimated_minutes: 8
---

# GPUs vs CPUs — what's actually different

## The puzzle

A modern CPU has 8-64 cores. A modern GPU has 10,000+ cores. CPUs cost $300-1000; GPUs cost $1,000-40,000+. Both run code. So why isn't everything just on GPUs?

The answer isn't "GPUs are faster." It's "GPUs are a different kind of processor, good at different things." Understanding what they're actually good at — and bad at — is the foundation of everything else.

## The simple version

CPUs are designed to run a few threads very fast, with lots of logic for branch prediction, caching, and handling unpredictable code.

GPUs are designed to run thousands of threads simultaneously, each one simpler than a CPU thread, doing the same kind of work on different data.

If your problem has lots of identical work happening in parallel (matrix math, image processing, AI inference, simulations), GPUs crush CPUs. If your problem is a single thread doing complex branching logic (running a database, parsing JSON, web server request handling), CPUs win.

The whole rest of GPU programming flows from this hardware truth.

## The technical version

### What a CPU core actually looks like

A modern CPU core (one of the 8-64 in your machine) is sophisticated:

- **Out-of-order execution**: rearranges instructions to keep the pipeline busy.
- **Branch prediction**: guesses which way `if` statements will go.
- **Large caches**: L1 (~32 KB), L2 (~1 MB), L3 (~32 MB shared).
- **Deep pipelines**: 15-20 stages.
- **Speculation**: runs ahead before knowing if it's safe.
- **Vector units (SIMD)**: AVX/AVX-512 do 8-16 operations at once.

All this hardware is dedicated to making *one thread* run as fast as possible. The single-thread performance is the optimization target.

### What a GPU core actually looks like

A GPU "CUDA core" is much simpler:

- **In-order execution** mostly — no out-of-order machinery.
- **No branch prediction** at the CUDA core level.
- **Tiny per-thread state** — just registers.
- **No big private caches**.
- **Shorter pipeline**.

What makes the GPU fast isn't per-core speed. It's having thousands of cores running together, sharing fetch/decode/scheduling overhead, all executing the same instruction on different data.

An RTX 4090 has ~16,384 CUDA cores. An H100 has ~16,896 CUDA cores plus 528 Tensor Cores. A datacenter cluster has tens of thousands of GPUs and hundreds of millions of cores in aggregate.

### The transistor budget reveals the design

A CPU spends most of its transistor budget on control logic and caches. Maybe 10-20% of the die is actual arithmetic units.

A GPU flips this. The vast majority of the die is arithmetic units. Less control logic, less cache, more raw math.

Same silicon area, different priorities. If your workload is dominated by arithmetic on lots of independent data, the GPU's allocation wins. If it's dominated by sequential branching logic, the CPU's allocation wins.

### Amdahl's law and parallelism

Even if part of a program is highly parallelizable, the parts that aren't limit total speedup. If 90% of your workload can run on GPU and 10% has to run on CPU, your maximum speedup is 10x even with infinite GPU cores.

For AI training, GPU-friendly work is 95%+ of the wall-clock time, so GPUs are transformative. For database transactions, GPU-friendly work might be <10%, so GPUs barely help.

The question to ask of any workload: how much of this is *embarrassingly parallel* (independent operations on independent data)?

### Memory bandwidth, not just compute

GPUs have not just more cores but more memory bandwidth. An H100 has ~3 TB/s of memory bandwidth (HBM3). A high-end CPU has maybe 100-200 GB/s of DDR5 bandwidth. That's a 15-30x difference.

For memory-bound workloads (most AI workloads after a point), this bandwidth is what matters more than raw FLOPs. Pumping data into the compute units fast enough is often harder than the compute itself.

### Why graphics started this

GPUs originated for graphics: rendering a 1080p frame means computing colors for ~2 million pixels, every frame, 60 times per second. Each pixel computation is largely independent. Embarrassingly parallel.

Same for vertex transformations in 3D graphics — each vertex independently multiplied by a transformation matrix. The hardware that evolved to do this efficiently turned out to also be efficient at:

- Physics simulations.
- Cryptocurrency mining.
- Scientific computing.
- Machine learning.

NVIDIA's CUDA (released 2007) was the first widely-adopted way to use this hardware for general-purpose computing.

### Latency vs throughput

Two ways to measure speed:

- **Latency**: how fast a single operation completes.
- **Throughput**: how many operations complete per second across all parallel work.

CPUs optimize latency — get one thread through fast.
GPUs optimize throughput — get many threads through together, even if each one is slower individually.

A single GPU thread is actually slower than a single CPU thread. The GPU wins by running 10,000 threads at once.

If your workload is "I need this one calculation as fast as possible," use a CPU. If it's "I need 10,000 of these calculations done as quickly as possible," use a GPU.

### Memory hierarchy differences

CPU memory hierarchy: registers → L1 → L2 → L3 → DRAM. Large caches, hardware prefetching, complex coherency.

GPU memory hierarchy (covered in detail in Module 3): registers → shared memory → L1 → L2 → global memory (HBM). Smaller caches per-thread, programmer-managed shared memory, much higher peak bandwidth.

The GPU hierarchy is more exposed to the programmer. You have to think about where data lives. CPUs hide this with caching; GPUs expect you to manage it explicitly for performance.

### What CPUs are still better at

CPUs still own:

- **Single-threaded code** where parallelism doesn't apply.
- **Branchy logic** with many unpredictable conditionals.
- **Low-latency operations** where you can't wait for thousands of threads to coordinate.
- **System code** — operating systems, network stacks, hypervisors.
- **Anything that has to interact with disks, network, and other peripherals directly**.
- **Code with unpredictable memory access patterns** that defeat parallelism.

The GPU is a coprocessor managed by the CPU. The CPU still runs the OS, the application, and coordinates GPU work.

### What GPUs are better at

GPUs dominate when:

- **Data-parallel operations**: same operation on lots of independent data items.
- **Arithmetic-heavy workloads** with predictable access patterns.
- **Workloads that fit GPU memory** (or stream efficiently into it).
- **Throughput-sensitive** rather than latency-sensitive.

Concrete examples: matrix multiplication, convolutions, FFTs, ray tracing, fluid simulation, dense linear algebra, neural network training and inference.

### The economics of GPU computing

A modern AI training cluster might have tens of thousands of GPUs. Each H100 retails for $25,000-40,000. A cluster costs billions of dollars in hardware alone, plus power and cooling.

This is justified because for the right workload (LLM training), the GPU does in a week what a CPU cluster would take a decade to do. The economics work because the workload is embarrassingly parallel and the speedup is dramatic.

For wrong workloads, this hardware is wasted — like using a freight train to deliver a single envelope.

## Three real-world scenarios

**Scenario 1: Training a large language model.**
Forward and backward passes through transformer layers are dominated by matrix multiplications. Each matmul is embarrassingly parallel. Training scales near-linearly with GPU count up to thousands of devices. CPUs would take ~1000x longer; nobody trains foundation models on CPUs.

**Scenario 2: Running a web server.**
Web request handling involves complex branching, I/O wait, sequential business logic, and rarely any heavy parallel math. Threads are independent but each one is doing different work. CPUs win clearly. Using GPUs for this would be ridiculous.

**Scenario 3: Cryptocurrency mining (historically).**
Bitcoin mining was originally CPU work. GPUs were dramatically faster (embarrassingly parallel hashing). Then ASICs were even faster. The path "CPU → GPU → ASIC" tracks how specialized the workload allows hardware to become. Once you know your workload, more specialized hardware always wins.

## Common mistakes to avoid

- **Treating GPUs as faster CPUs** — different paradigm.
- **Assuming everything can be GPU-accelerated** — Amdahl's law limits gains.
- **Ignoring memory bandwidth** — often the real bottleneck.
- **Optimizing single-thread performance on GPU** — measure throughput instead.
- **Using GPU for tasks with unpredictable branching** — wastes the hardware.

## Read more

- *Programming Massively Parallel Processors* by Hwu, Kirk, El Hajj — definitive textbook.
- NVIDIA CUDA Programming Guide (free online).
- *Computer Architecture* by Hennessy & Patterson — broader context.

## Summary

- **CPUs**: few cores, sophisticated per-core, optimized for latency.
- **GPUs**: thousands of cores, simple per-core, optimized for throughput.
- **CPU transistor budget**: mostly control + cache. **GPU budget**: mostly arithmetic.
- **GPU memory bandwidth** is 15-30x CPU memory bandwidth.
- **Amdahl's law**: serial portions of code limit GPU speedup.
- **CPUs win**: sequential, branchy, latency-critical code.
- **GPUs win**: data-parallel, arithmetic-heavy, throughput-critical code.
- **GPU is a coprocessor** — CPU still runs the OS and coordinates.

Next: when to actually pick a GPU.
