---
module: 1
position: 3
title: "SIMT and the GPU execution model"
objective: "See how thousands of threads run at once."
estimated_minutes: 8
---

# SIMT and the GPU execution model

## The puzzle

A modern GPU has tens of thousands of threads in flight. They can't all be doing their own thing independently — that would require tens of thousands of independent fetch/decode/control units, which would be absurdly expensive in silicon. So how does the GPU actually run all those threads?

The answer is SIMT: Single Instruction, Multiple Thread. Understanding this one acronym unlocks why GPU code is fast when it is, and slow when it isn't.

## The simple version

SIMT means: groups of 32 threads execute the same instruction at the same time, on different data.

Imagine 32 workers all doing the same step of an assembly line, but each handling a different car. One instruction, 32 simultaneous operations, 32 different pieces of data.

The GPU schedules work in these groups of 32 (called a "warp" in NVIDIA terminology). It runs many warps concurrently. When one warp stalls waiting for memory, another warp takes over the compute unit.

This model is dramatically efficient — when your code fits it. When your code has threads in the same warp wanting to do different things ("branch divergence"), you pay a penalty.

## The technical version

### SIMD vs SIMT

You may have heard of SIMD (Single Instruction, Multiple Data) — CPUs do this with AVX, NEON, etc. One instruction operates on a vector of 4, 8, or 16 values simultaneously.

SIMT is a related but distinct model. NVIDIA's twist:

- **SIMD on CPUs**: programmer writes vector instructions explicitly.
- **SIMT on GPUs**: programmer writes scalar code that looks like one thread, and the GPU runs 32 of those threads in lockstep on shared instruction-issue hardware.

The result is that GPU code looks like normal scalar code (with thread indices), but executes like SIMD under the hood. Easier to write, complex performance implications.

### What a warp actually is

A warp = 32 threads scheduled together on the GPU's hardware. They:

- All execute the same instruction at the same time.
- Each operates on its own private registers and data.
- All advance through the program counter together.

If thread 0 does `x[idx] = x[idx] + 1`, threads 1-31 are doing the same thing at the same time, but each with their own value of `idx` and their own `x`.

This means the GPU has one instruction fetcher per 32 threads, not per thread. Huge savings in transistor count vs. an army of fully-independent cores.

### The execution unit

Hardware perspective: a GPU has multiple "Streaming Multiprocessors" (SMs). Each SM has:

- 32-128 CUDA cores (arithmetic units).
- Warp schedulers (typically 4 per SM in modern hardware).
- Shared memory + L1 cache.
- A register file (huge — way bigger than a CPU's).

An SM runs many warps concurrently — modern SMs can have 32-64 warps "resident" at once (= up to 2048 threads per SM). Only a few warps issue instructions per cycle, but warps that are stalled don't waste hardware; they just wait for their turn.

A full GPU has dozens to hundreds of SMs. An H100 has 132 SMs; an RTX 4090 has 128 SMs.

### Why 32

The "32 threads per warp" number is a hardware design choice that has stayed stable across many GPU generations. It balances:

- **Hardware cost**: bigger warps require wider scheduling logic.
- **Branch divergence cost**: smaller warps have less divergence pain.
- **Memory transaction sizes**: 32 threads × 4 bytes = 128-byte transactions, matching DRAM burst sizes.

You don't really get to change this. You design CUDA code around it.

### Branch divergence

The big SIMT gotcha. If your code does:

```cuda
if (threadIdx.x < 16) {
    do_thing_A();
} else {
    do_thing_B();
}
```

Threads 0-15 want to do A; threads 16-31 want to do B. But they share an instruction fetcher. The hardware handles this by serializing: first the whole warp runs A (threads 16-31 masked off), then the whole warp runs B (threads 0-15 masked off). Both paths execute.

Effective performance: 50% of peak. The more divergent your branches, the more serialization you pay. Heavily divergent code can run 10x slower than convergent code.

**Convergent code**: all threads in a warp do the same thing → no penalty.
**Divergent code**: threads take different paths → serialization penalty.

This is why GPU-friendly algorithms minimize per-thread branching. You often see GPU code that does extra "no-op" work in branches to keep warps in lockstep.

### Latency hiding via warp scheduling

When a warp issues a memory load, that load takes hundreds of cycles. The warp can't proceed until the data arrives. But the SM has many other resident warps. The scheduler switches to another warp that's ready and lets that one make progress.

By the time the first warp's memory finishes, several other warps have done useful work. As long as there are enough resident warps, the SM stays busy.

This is the GPU's answer to memory latency: don't try to make it fast (with caches); just have so many warps that somebody's always ready.

### Occupancy

"Occupancy" = the fraction of maximum resident warps that you actually achieve. Higher occupancy means more warps available for the scheduler to pick from, more latency hiding.

Occupancy is limited by:

- **Registers per thread**: each thread uses some registers; SMs have a fixed register file.
- **Shared memory per block**: each thread block uses some shared memory; SMs have a fixed amount.
- **Threads per block**: SMs have a max threads-per-SM.

If your kernel uses too many registers per thread, fewer warps fit on each SM. Lower occupancy. Less latency hiding.

You don't always want maximum occupancy — sometimes per-thread resources matter more than the warp count. But occupancy is one of the main performance dials.

### Thread blocks

You don't write code that directly addresses warps. You write code that runs in "thread blocks":

- A thread block contains 1-1024 threads.
- The GPU rounds up to multiples of 32 internally (each block has some number of warps).
- Threads in a block can share memory (shared memory) and synchronize with each other.

Common block sizes: 128, 256, 512 threads. Multiples of 32 are best to avoid wasted threads.

### Grids of blocks

Your kernel launch specifies:
- How many threads per block.
- How many blocks total (the "grid").

Total threads = blocks × threads-per-block. A typical launch might be 1024 blocks of 256 threads = 262,144 threads total.

The GPU's scheduler distributes blocks across SMs. Each SM can run multiple blocks concurrently if resources allow.

(We'll cover this in detail in Module 2.)

### What this means for your code

Practical implications:

1. **Use block sizes that are multiples of 32** — otherwise you waste warp slots.
2. **Minimize branch divergence** within warps — write convergent code where possible.
3. **Keep memory accesses coalesced** — adjacent threads should access adjacent memory (more on this in Module 3).
4. **Use enough threads to keep the GPU busy** — small kernels don't pay back overhead.
5. **Don't over-optimize per-thread work** — let the GPU's parallelism do the lifting.

### Tensor Cores — beyond SIMT

Modern GPUs have specialized units called Tensor Cores that go beyond standard SIMT. A Tensor Core does a small matrix-matrix multiply per cycle (typically 4×4 or 16×16) with mixed-precision math.

For matrix multiplications (the dominant operation in deep learning), Tensor Cores are 5-10x faster than CUDA cores. NVIDIA's cuBLAS and cuDNN automatically use them when applicable.

We'll cover Tensor Cores in Module 5. The mental model: SIMT for general parallel work, Tensor Cores for matrix math.

### Compute vs graphics modes

GPUs were originally for graphics. Modern GPUs still do graphics, but most expensive AI/HPC workloads use them in "compute mode" via CUDA, OpenCL, ROCm, etc.

The hardware is the same; the programming interface differs. In graphics mode, you write shaders (vertex shaders, pixel shaders). In compute mode, you write kernels.

Some hardware (NVIDIA's "data center" GPUs like H100) is compute-only — no graphics output. Consumer GPUs (RTX series) do both.

### Why SIMT matters for everything else

Every CUDA programming pattern you'll learn — memory coalescing, shared memory tiling, occupancy tuning, kernel design — flows from SIMT. The execution model determines what's fast and what isn't.

Knowing this prevents the most common GPU programming mistakes:

- Writing code with heavy per-thread branching → divergence penalty.
- Using block sizes that aren't warp-aligned → wasted hardware.
- Treating GPU threads like CPU threads → wrong mental model.
- Optimizing per-thread when occupancy is the actual problem.

## Three real-world scenarios

**Scenario 1: A vectorized addition kernel.**
Adding two large arrays element-by-element. All threads in a warp do the same operation on adjacent data. Perfect SIMT case. Runs at memory-bandwidth limit (compute is trivial; memory is the bottleneck).

**Scenario 2: A kernel with `if (data[idx] > threshold) ...`**
Some threads enter the branch, others don't. Within each warp, divergence forces serialization of both paths. Speedup vs. an "always taken" version: ~50%. Common pattern; common pitfall.

**Scenario 3: A reduction (summing 1M numbers to 1 number).**
Naive approach: have thread 0 sum everything — wastes all other threads. Better: parallel reduction using shared memory and tree-style summation. Warps cooperate to halve the data each step. This is the canonical example of "design for SIMT, not against it."

## Common mistakes to avoid

- **Treating threads as independent** — they execute in warps of 32.
- **Heavy per-thread branching** — causes divergence penalty.
- **Block sizes not multiples of 32** — wasted warp slots.
- **Targeting maximum occupancy blindly** — sometimes register usage matters more.
- **Ignoring warp behavior in tight kernels** — you'll leave 2-10x on the table.

## Read more

- NVIDIA CUDA C++ Programming Guide — the canonical reference.
- *Programming Massively Parallel Processors* by Hwu, Kirk, El Hajj — chapter on SIMT.
- NVIDIA developer blog posts on warp-level primitives.

## Summary

- **SIMT**: Single Instruction, Multiple Threads — 32 threads per warp execute together.
- **Warps** are the hardware scheduling unit, not individual threads.
- **Branch divergence** within a warp causes serialization (performance penalty).
- **Latency hiding** via warp scheduling — many resident warps keep SMs busy.
- **Occupancy** = active-warps-per-SM ratio; affects latency hiding.
- **Block sizes** should be multiples of 32 to fill warps.
- **Tensor Cores** are specialized matrix-math units beyond standard SIMT.
- **Everything else in CUDA** flows from this execution model.

Next: how GPUs went from graphics to AI.
