---
module: 4
position: 2
title: "Inference Endpoints — production hosting"
objective: "Deploy models as production APIs."
estimated_minutes: 5
---

# Inference Endpoints — production hosting

## What Inference Endpoints are

HF managed production hosting for models:
- Dedicated GPU.
- Auto-scaling.
- Custom domain optional.
- SSL endpoints.
- Pay hourly per GPU.

Differs from Spaces (demos) — endpoints are for production API traffic.

## Creating an endpoint

Via UI:
1. Model page → Deploy → Inference Endpoints.
2. Choose hardware (T4 / A10G / A100 / H100).
3. Choose cloud (AWS / Azure / GCP).
4. Choose region.
5. Set autoscaling (min/max replicas).
6. Deploy → API endpoint URL.

## Pricing model

Pay per GPU-hour:
- **T4.** ~$0.60/hour.
- **A10G.** ~$1.30/hour.
- **A100 (80GB).** ~$3.40/hour.
- **H100.** ~$10/hour.

Pause when not in use to save money.

For: high-volume production where API fees > rental hourly.

## Calling the endpoint

```python
import requests

endpoint_url = "https://your-endpoint.us-east-1.aws.endpoints.huggingface.cloud"
response = requests.post(
    endpoint_url,
    headers={"Authorization": f"Bearer {HF_TOKEN}"},
    json={"inputs": "Hello", "parameters": {"max_new_tokens": 100}}
)
print(response.json())
```

Or via HF SDK:
```python
from huggingface_hub import InferenceClient
client = InferenceClient(endpoint_url=endpoint_url, token=HF_TOKEN)
response = client.text_generation("Hello")
```

For: standard REST API; integrate from any language.

## Auto-scaling

Configure:
- **Min replicas.** Always running.
- **Max replicas.** Cap on scale-up.
- **Scale-up threshold.** Requests per second.

For: spike handling without paying for idle.

## Scale to zero

If supported:
- Min replicas = 0.
- Endpoint pauses when no traffic.
- Cold start on first request (~30 sec).

For: cost-savings for sporadic traffic; pay only when used.

## Custom container

For more control:
- Use Custom Image (Docker).
- Bring optimized inference engine (vLLM, TGI, TensorRT-LLM).
- Custom dependencies.

For: production-optimized deployments.

## Text Generation Inference (TGI)

HF's optimized LLM server:
- Continuous batching.
- Speculative decoding.
- Tensor parallelism.
- High throughput.

Pre-built containers; auto-deployed when you create endpoint for compatible model.

## Endpoint regions

Choose for latency / compliance:
- **us-east-1.** US East.
- **us-west-2.** US West.
- **eu-west-1.** Europe.
- **ap-southeast-1.** Asia Pacific.

For: low latency to users; data residency.

## Custom endpoints (advanced)

For workflows beyond model inference:
- Custom Handler (custom Python code per request).
- Multi-model endpoints (load multiple).
- Pre/post-processing.

For: complex production pipelines.

## Monitoring

Endpoint dashboard shows:
- Request counts.
- Latency.
- Errors.
- Cost.

For: track production health.

## Production patterns

For real-world use:
- **Stage endpoints.** Test before production.
- **Multiple regions.** For latency-sensitive global users.
- **Auto-scaling configured.** Handle traffic spikes.
- **Cost monitoring.** Avoid surprise bills.
- **Alerting.** Set up Slack / email for errors.

## Inference Endpoints vs. self-hosted

**HF Inference Endpoints:**
- Managed hosting; less ops.
- Markup on raw GPU cost.
- Easy scaling.

**Self-hosted (your AWS / GCP):**
- Full control.
- Lower per-hour cost.
- More ops burden.

For: small teams, Endpoints; for FAANG-scale, self-hosted.

## Mistakes to avoid

- **Running endpoint 24/7 without need.** Cost.
- **Wrong hardware for model.** Either OOM or wasted capacity.
- **No autoscaling.** Either over-provisioned or undersized.
- **No monitoring.** Surprise bills + outages.

## Summary

- Inference Endpoints = HF managed production model hosting.
- Choose hardware + cloud + region.
- Pay GPU-hour; scale to zero if supported.
- TGI containers for optimized LLM serving.
- Standard REST + Python SDK access.
- For production API traffic; Spaces for demos.

Next: integration with cloud providers.
