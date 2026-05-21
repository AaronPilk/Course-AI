---
module: 2
position: 3
title: "Running locally vs. via Inference API"
objective: "Pick the right execution mode for your needs."
estimated_minutes: 5
---

# Running locally vs. via Inference API

## Local execution

Pros:
- **Free after hardware.** No per-call costs.
- **Privacy.** Data stays on your machine.
- **Latency control.** No network roundtrip.
- **Customization.** Modify model, quantization, samplers.
- **Offline capable.**

Cons:
- **Hardware required.** Modern GPU for serious work.
- **Setup complexity.** CUDA, drivers, Python env.
- **Power consumption.**

## Inference API (HF)

Hosted by Hugging Face:

```python
from huggingface_hub import InferenceClient

client = InferenceClient(token="YOUR_HF_TOKEN")
response = client.text_generation(
    "Hello, world",
    model="meta-llama/Llama-3.1-8B-Instruct"
)
```

Pros:
- **No hardware needed.**
- **Try any model.** Without download.
- **Free tier** for testing.

Cons:
- **Rate limited** (free).
- **Latency.** Network + cold starts.
- **Cost** for paid usage.
- **Privacy.** Data leaves your machine.

For: prototyping, testing, low-volume production.

## Inference Endpoints (HF)

Dedicated production hosting:
- Choose model + hardware.
- Auto-scale.
- Custom endpoints.
- Pay per hour.

For: production deployment without managing infra.

## Other cloud GPU options

- **Replicate.** Pay per second; many models.
- **Together AI.** Specialized in open-source LLMs.
- **Fireworks AI.** Fast open-source inference.
- **Groq.** Ultra-fast inference for specific models.
- **AWS / GCP / Azure.** General cloud.
- **RunPod, Lambda Labs.** Cheap raw GPU rental.

For: pick based on price, latency, model availability.

## Decision framework

**Use local when:**
- Privacy critical.
- High volume (TCO favors local hardware).
- Custom modifications.
- Offline / air-gapped.

**Use API / cloud when:**
- Prototyping.
- Variable load.
- No GPU available.
- Latest models without setup.
- Production with auto-scaling.

## Hybrid patterns

Common:
- Develop locally; deploy via API.
- Local for development; cloud for production.
- Local for non-critical; API for critical.

## Cost comparison

Rough 2026 numbers:
- **Local RTX 4090.** $1500 one-time; ~$0.30/hour electricity.
- **Cloud A100 (Replicate).** ~$0.001-0.003/sec for inference.
- **HF Inference Endpoints.** $0.06-2/hour per GPU.
- **Together / Fireworks.** $0.10-2 per million tokens.
- **OpenAI GPT-4o-mini.** ~$0.15-0.60 per million tokens.

For: estimate based on monthly volume.

## Latency comparison

- **Local (consumer GPU).** ~30-100 tokens/sec for 8B model.
- **Cloud (A100).** ~50-200 tokens/sec.
- **Groq (specialized).** 200-500+ tokens/sec.
- **Network overhead.** Adds 50-300ms for cloud calls.

For real-time: local or specialized cloud (Groq).

## llama.cpp ecosystem

For local on consumer hardware:
- llama.cpp: C++ inference for GGUF models.
- Ollama: simplified interface around llama.cpp.
- LM Studio: UI for local LLMs.
- Jan: open-source local LLM UI.

Run open models locally without Python / CUDA complexity.

For: local LLMs with simple setup.

## Quantization for local

To fit large models on small GPUs:
- AWQ (Activation-aware Weight Quantization).
- GPTQ.
- GGUF (CPU + GPU).
- Bitsandbytes (INT8 / INT4).

Find pre-quantized versions on HF Hub.

## Mistakes to avoid

- **Cloud for everything.** Costs add up; local cheaper for high volume.
- **Local for prototyping.** Slow iteration; cloud APIs faster start.
- **No quantization for local.** Can't fit big models.
- **No latency budget.** API may be too slow for real-time use.

## Summary

- Local: free after hardware; private; latency control.
- HF Inference API: no setup; rate limited; good for prototyping.
- HF Inference Endpoints: production hosting.
- Other clouds: Replicate, Together, Fireworks, Groq.
- Cost/latency varies; pick by use case.
- Quantization for local on small GPUs.

Next: GPU acceleration + quantization.
