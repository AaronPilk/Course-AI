---
module: 5
position: 1
title: "Tensor cores and AI math"
objective: "Understand the hardware that powers modern deep learning."
estimated_minutes: 8
---

# Tensor cores and AI math

## The puzzle

Modern AI is dominated by matrix multiplication. Training a 70B-parameter LLM means doing matrix multiplications continuously across thousands of GPUs for weeks. NVIDIA's response was specialized hardware called Tensor Cores, introduced in 2017, that does matmul faster than standard CUDA cores can.

Tensor Cores are why the H100 hits ~1,979 TFLOPS on FP8 matmul, an order of magnitude higher than the same chip's regular FLOPS. They're the hardware behind the AI scaling we've watched over the past decade.

## The simple version

A Tensor Core is a specialized unit that does a small matrix-matrix multiplication in one operation. Instead of computing one multiply-accumulate per cycle (like a CUDA core), a Tensor Core does a 4x4 (or 16x16) matrix multiply per cycle.

Per SM, modern GPUs have a few Tensor Cores doing the bulk of matrix-multiply throughput. cuBLAS, cuDNN, and frameworks like PyTorch automatically use them when applicable.

Tensor Cores work best on lower-precision data:

- **FP16** (16-bit float): the original tensor-core precision.
- **BF16** (brain float 16): same precision as FP16 but with FP32's exponent range.
- **TF32** (TensorFloat-32): NVIDIA-specific 19-bit float; drop-in for FP32 with speed of FP16.
- **FP8** (8-bit float): introduced in Hopper; another 2x speed boost.
- **INT8 / INT4**: for inference quantization.

Lower precision = more FLOPS, less accuracy. Modern ML training and inference carefully manage the precision-accuracy tradeoff.

## The technical version

### Why specialized hardware

Matrix multiplication is so common and so structured that it deserves its own circuit. A general CUDA core can do one multiply-accumulate per cycle on 32-bit values. That's flexible but inefficient for matmul.

A Tensor Core does roughly 64 multiply-accumulates per cycle (for a 4x4x4 operation in the original Volta design). Much faster, but only for that specific operation pattern.

The hardware tradeoff: dedicate silicon to specialized matmul circuits rather than more general CUDA cores. For workloads that are heavily matmul-bound (= modern AI), this is the right tradeoff. For workloads that aren't, those Tensor Cores sit idle.

This is why modern data-center GPUs (H100, B100) emphasize Tensor Cores so heavily: their primary workload is AI training and inference.

### Tensor Core generations

Each NVIDIA architecture has upgraded Tensor Cores:

- **Volta (V100, 2017)**: first Tensor Cores. FP16 multiply, FP32 accumulate. 4x4x4 matrix per cycle.
- **Turing (T4, RTX 20-series, 2018)**: added INT8 support for inference.
- **Ampere (A100, RTX 30-series, 2020)**: added BF16, TF32. 16x16x16 matrix per cycle.
- **Hopper (H100, 2022)**: added FP8 (massive throughput boost). Transformer Engine.
- **Blackwell (B100/B200, 2024)**: improved FP8, possibly FP6/FP4 (mixed sources).

Each generation roughly doubled peak FLOPS for AI workloads at the same architecture's lower-precision modes.

### Precision modes explained

**FP32 (single-precision float)**: 1 sign bit + 8 exponent bits + 23 mantissa bits. The numerical "standard" for most computation. Tensor Cores don't accelerate FP32 directly.

**FP16 (half-precision float)**: 1 + 5 + 10 bits. Half the memory, much smaller dynamic range. Risk: overflow during accumulation.

**BF16 (brain float 16)**: 1 + 8 + 7 bits. Same exponent range as FP32 (no overflow risk for typical ML values) but less mantissa precision. The de facto training precision for many models.

**TF32**: NVIDIA's invention. 1 + 8 + 10 bits = 19 bits used. Acts like FP32 for the user but computes with reduced precision internally. Default on Ampere+ for some operations.

**FP8**: 1 sign + variable exponent/mantissa (E4M3 and E5M2 variants). 4x throughput vs. FP16 on Hopper. Used for inference and increasingly for training.

**INT8 / INT4**: integer formats for quantized inference. Massive memory savings; some accuracy hit.

### Mixed-precision training

The most common pattern in deep learning:

- **Forward pass**: FP16 or BF16 for activations. Fast matmuls.
- **Backward pass**: FP16/BF16 for gradients.
- **Optimizer state**: FP32 for weights and Adam momentums (precision matters for tiny updates).
- **Loss scaling**: scale up the loss to keep gradients in FP16's representable range, then descale.

This gives the speed of half-precision with the accuracy of full-precision. PyTorch's `torch.cuda.amp.autocast` and similar abstractions handle this automatically.

For LLM training, BF16 is preferred over FP16 because BF16 has the full FP32 exponent range — no loss scaling needed, simpler training loop.

### The Transformer Engine

Hopper's H100 includes a "Transformer Engine" — software + hardware that automatically picks FP8 vs FP16 per layer based on dynamic range. For transformer models, this typically gives 2x speedup over pure FP16/BF16 with comparable accuracy.

```python
# Using NVIDIA's Transformer Engine in PyTorch
import transformer_engine.pytorch as te
linear = te.Linear(in_features, out_features, bias=True)
```

The hardware tracks the dynamic range per tensor; when ranges fit FP8, it uses FP8; otherwise BF16. For LLM workloads, most layers fit FP8 easily and you get the speedup automatically.

### How to use Tensor Cores

Most CUDA programmers don't write code that touches Tensor Cores directly. They:

1. **Call cuBLAS** with FP16/BF16/FP8 data → cuBLAS uses Tensor Cores automatically when matrix dimensions are right.
2. **Call cuDNN** for convolutions → cuDNN uses Tensor Cores when applicable.
3. **Use PyTorch with autocast** → framework chooses Tensor Core paths automatically.

Tensor Core requirements:
- Matrix dimensions need to be multiples of 8 (or 16 for some operations). Non-multiples force a fallback to CUDA cores or padding.
- Data type must be one Tensor Cores support.
- For best performance, the GEMM should be large enough that the Tensor Cores stay busy.

If your matrix dimensions are odd (like 7x32 multiplied by 32x7), you may not get Tensor Core acceleration. Padding to multiples of 8 typically helps.

### Tensor Core programming directly (PTX/CUTLASS)

For experts writing custom kernels that use Tensor Cores: CUTLASS provides templated abstractions for tensor-core-accelerated GEMM. PTX has direct Tensor Core instructions (`mma.sync`).

```cuda
// Pseudocode for using mma.sync (real syntax is more complex)
nvcuda::wmma::fragment<...> a_frag, b_frag, c_frag;
wmma::load_matrix_sync(a_frag, a_ptr, lda);
wmma::load_matrix_sync(b_frag, b_ptr, ldb);
wmma::mma_sync(c_frag, a_frag, b_frag, c_frag);
wmma::store_matrix_sync(c_ptr, c_frag, ldc, ...);
```

Most CUDA programmers don't need this. CUTLASS and the libraries do it for you.

### Tensor Cores beyond matrix multiplication

Tensor Cores were designed for matmul but are flexible enough for other operations:

- **Convolutions**: cuDNN uses Tensor Cores for many convolution algorithms.
- **Attention**: FlashAttention and similar fused kernels use Tensor Cores for QK^T and softmax(QK^T)V matmuls.
- **Sparse matrices**: Hopper's structured sparsity support lets Tensor Cores skip zeros.

Anything that decomposes into small matrix multiplies can in principle use Tensor Cores. ML primitives that don't (element-wise ops, reductions) use CUDA cores.

### Quantization for inference

For inference (not training), you often go even lower precision:

- **INT8**: 4x throughput vs. FP32, 4x memory savings. Some accuracy loss.
- **INT4**: 8x vs. FP32. More accuracy loss; requires calibration.
- **FP8**: Hopper's go-to for inference.

LLM inference engines (TensorRT-LLM, vLLM with quantization) routinely use INT8 or INT4 for weights, achieving large memory and throughput improvements.

Quantization-aware training and post-training quantization are the techniques to make this work without unacceptable accuracy loss.

### Performance impact in practice

Concrete numbers (very approximate, vary by setup):

| Operation | FP32 | FP16 (Tensor Core) | FP8 (Tensor Core) |
|-----------|------|---------------------|--------------------|
| GEMM (large) | 1x | 8-10x | 16-20x |
| LLM inference throughput | 1x | 3-4x | 5-7x |
| Training step time | 1x | 2-3x | 3-4x (with TE) |

The exact speedup depends on workload and how much was Tensor-Core-eligible. For modern LLM training where matmul dominates, the speedup is dramatic.

### Accuracy considerations

Lower precision doesn't always mean lower accuracy:

- FP16/BF16 training: usually matches FP32 accuracy with careful loss scaling.
- FP8 training: requires Transformer Engine; can match BF16 for many models.
- INT8 inference: small accuracy loss (typically <1% on benchmarks).
- INT4 inference: larger accuracy loss; needs quantization-aware training to mitigate.

The "right" precision depends on the model and task. Production LLM inference is often INT4 or FP8; training is BF16 or mixed-precision with FP32 optimizer state.

### What this means for the broader stack

Tensor Cores explain a lot of the AI hardware story:

- **GPU pricing**: Tensor Core throughput drives the value of training/inference GPUs.
- **Generation upgrades**: each new architecture's selling point is more Tensor Core throughput.
- **Memory bandwidth must keep up**: Tensor Cores can be starved if memory bandwidth doesn't scale with FLOPS. Hence HBM3, NVLink, etc.
- **Algorithm/hardware co-evolution**: transformer architecture works well because matmul dominates → Tensor Cores accelerate matmul → ergo the architecture and hardware reinforce each other.

This is one reason transformer-based AI is unlikely to be displaced soon: there's enormous co-evolved investment in matmul-optimized hardware.

## Three real-world scenarios

**Scenario 1: A training run sped up 3x.**
A team trains a vision model in FP32. They switch to mixed-precision (autocast) — minimal code change. Training is 3x faster with comparable accuracy. cuBLAS and cuDNN now use Tensor Cores instead of CUDA cores for the matmuls. Hardware was always capable; the framework setting was off.

**Scenario 2: LLM inference at INT8.**
A production LLM inference service runs FP16 — fits in 80 GB H100 memory, ~50 tokens/sec for a 70B model. They switch to INT8 with TensorRT-LLM. Model now fits with room for larger batches, and throughput jumps to 150 tokens/sec aggregate. Accuracy loss measured at ~0.5% on benchmarks — acceptable.

**Scenario 3: A custom kernel ignoring Tensor Cores.**
A research team writes a custom CUDA matmul kernel that runs at 20% of peak FLOPS. cuBLAS does the same operation at 80% of peak using Tensor Cores. The custom code "works" but is 4x slower. The fix: call cuBLAS, or use CUTLASS templates for the custom case.

## Common mistakes to avoid

- **Writing matmul in CUDA cores when Tensor Cores would work** — 4-10x penalty.
- **Wrong dimensions** (not multiples of 8) — silent fallback to slower paths.
- **Mixing FP32 with FP16 unnecessarily** — defeats Tensor Core benefit.
- **Ignoring autocast / mixed precision** — easy speedup left on the table.
- **Skipping FP8 on Hopper** without trying it.
- **Over-quantizing for inference** without measuring accuracy loss.

## Read more

- NVIDIA Tensor Core documentation.
- NVIDIA Transformer Engine documentation.
- PyTorch mixed-precision training tutorial.

## Summary

- **Tensor Cores** = specialized hardware for small matrix multiplications.
- **One Tensor Core operation** does what would be many CUDA-core multiply-accumulates.
- **Precision modes**: FP16, BF16, TF32, FP8, INT8, INT4 — each trades accuracy for speed.
- **Mixed-precision training** uses lower precision for matmuls, FP32 for optimizer state.
- **Transformer Engine** (Hopper+) auto-picks FP8 vs BF16 per layer.
- **Framework support** (PyTorch autocast, etc.) handles most usage automatically.
- **CUTLASS** for custom Tensor Core kernels.
- **AI hardware progression** is largely about more/better Tensor Cores.

Next: training and inference workloads on GPU.
