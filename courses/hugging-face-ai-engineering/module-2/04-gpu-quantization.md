---
module: 2
position: 4
title: "GPU acceleration and quantization"
objective: "Fit bigger models on smaller hardware."
estimated_minutes: 5
---

# GPU acceleration and quantization

## GPU vs. CPU

GPU: parallel matrix math; 10-100x faster than CPU for transformer inference.

For: any non-trivial model, use GPU.

CPU only for: tiny models (< 1B params), edge devices, no GPU available.

## Precision levels

- **FP32.** 32-bit float; full precision; baseline.
- **FP16.** 16-bit half precision; ~50% memory; minimal quality loss.
- **BF16.** 16-bit brain float; like FP16 but better range; common for training.
- **INT8.** 8-bit integer; 25% memory of FP32; small quality loss.
- **INT4.** 4-bit integer; ~12.5% memory of FP32; some quality loss.
- **FP8.** 8-bit float (new); good balance.

For most production: FP16 or BF16.
For low-VRAM: INT8 / INT4.

## Loading in different precisions

```python
import torch
from transformers import AutoModelForCausalLM

# FP16 (most common)
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B-Instruct",
    torch_dtype=torch.float16,
    device_map="auto"
)

# BF16
model = AutoModelForCausalLM.from_pretrained(..., torch_dtype=torch.bfloat16, ...)
```

For: standard precision.

## INT8 / INT4 quantization

Via bitsandbytes:

```python
from transformers import BitsAndBytesConfig

# INT8
bnb_config = BitsAndBytesConfig(load_in_8bit=True)

# INT4 (NF4)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B-Instruct",
    quantization_config=bnb_config,
    device_map="auto"
)
```

For: fit bigger models on smaller GPUs.

## Memory math

Approximate VRAM for inference:
- **FP16/BF16.** ~2 GB per billion parameters.
- **INT8.** ~1 GB per billion.
- **INT4.** ~0.5 GB per billion.
- **Plus overhead.** ~20% extra for activations + KV cache.

Examples:
- Llama 3 8B FP16: ~16 GB; needs 24 GB GPU (16 + overhead).
- Llama 3 70B FP16: ~140 GB; multi-GPU only.
- Llama 3 70B INT4: ~35 GB; fits 48 GB workstation.

## GGUF format

For CPU + flexible inference:
- llama.cpp's quantization format.
- Variants: Q2_K, Q3_K, Q4_K_M, Q5_K_M, Q8_0, etc.
- Lower numbers = more compressed; some quality loss.

Use via Ollama, LM Studio, llama.cpp directly.

For: local / CPU / Mac (Metal acceleration); flexibility.

## AWQ / GPTQ

Other quantization formats:
- **AWQ.** Activation-aware Weight Quantization; fast inference; great quality.
- **GPTQ.** Gradient-Post-Training-Quantization; older; widely supported.

Both produce models that run faster than bitsandbytes INT4 but require offline quantization (or download pre-quantized version).

For production speed: AWQ.

## Accelerate library

For multi-GPU / large models:

```python
from accelerate import Accelerator
accelerator = Accelerator()

# Splits model across GPUs / CPU as needed
model = AutoModelForCausalLM.from_pretrained(
    "huge-model",
    device_map="auto"
)
```

`device_map="auto"` handles distribution.

For: models too big for single GPU.

## vLLM

Optimized inference engine:
- Continuous batching.
- PagedAttention for KV cache efficiency.
- 5-20x throughput vs. naive transformers.

```python
from vllm import LLM, SamplingParams

llm = LLM(model="meta-llama/Llama-3.1-8B-Instruct")
outputs = llm.generate(prompts, SamplingParams(temperature=0.7))
```

For: production serving; high throughput.

## TensorRT-LLM

Nvidia's optimized inference:
- Best raw speed on Nvidia GPUs.
- Compile model for specific hardware.

For: max performance on Nvidia hardware.

## Flash Attention

Memory-efficient attention algorithm:
- Lower memory; faster.
- Most modern models support.

```python
model = AutoModelForCausalLM.from_pretrained(..., attn_implementation="flash_attention_2")
```

For: longer sequences; lower memory; faster.

## Mistakes to avoid

- **CPU inference for large models.** Painfully slow.
- **FP32 when FP16 sufficient.** 2x memory waste.
- **No quantization for big models on small GPU.** OOM.
- **vLLM / TensorRT not considered for production.** Lower throughput.
- **No Flash Attention.** Slower + more memory.

## Summary

- FP16/BF16 standard; INT8/INT4 for memory savings.
- bitsandbytes for runtime quantization.
- AWQ / GPTQ for production-optimized quantization.
- GGUF + llama.cpp for CPU / Mac / flexibility.
- vLLM / TensorRT-LLM for production speed.
- Flash Attention for memory + speed.
- Accelerate for multi-GPU distribution.

Module 3 next: fine-tuning models.
