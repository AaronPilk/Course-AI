---
module: 4
position: 3
title: "Integration with cloud providers"
objective: "Deploy HF models on AWS / GCP / Azure."
estimated_minutes: 5
---

# Integration with cloud providers

## When to use cloud directly vs. HF Endpoints

**HF Endpoints:** managed; quick; HF markup.

**Cloud direct (AWS/GCP/Azure):** more control; lower per-hour cost; ops burden.

For small-medium scale: HF Endpoints.
For massive scale: cloud direct.

## AWS deployment options

- **SageMaker.** Managed ML platform; HF integration native.
- **EC2 GPU instances.** Raw VMs; full control.
- **EKS.** Kubernetes; for sophisticated deployments.
- **Lambda + Bedrock.** Serverless for some workloads.

For HF models on AWS: SageMaker most common.

## SageMaker + HF

HF + AWS partnership:
- Pre-built HF containers.
- Deploy in 5 lines:

```python
from sagemaker.huggingface import HuggingFaceModel

model = HuggingFaceModel(
    model_data="s3://my-bucket/my-model.tar.gz",
    role=role,
    transformers_version="4.40",
    pytorch_version="2.2",
    py_version="py310"
)

predictor = model.deploy(
    initial_instance_count=1,
    instance_type="ml.g5.xlarge"
)
```

For: production AWS deployments.

## GCP Vertex AI

Google's managed ML platform:
- Pre-built containers.
- AutoML alternatives.
- Vertex Pipelines for orchestration.

For: GCP-based teams.

## Azure ML

Microsoft's:
- Similar managed ML platform.
- HF integration.
- Azure OpenAI for closed-source.

For: Azure-based teams.

## Cost comparison

Rough 2026 (per hour):
- **AWS g5.xlarge (A10G):** $1.00.
- **AWS p4d.24xlarge (8x A100):** $32.
- **GCP a2-highgpu-1g (1x A100):** $3.70.
- **Azure NCv4 (A100):** Similar.
- **HF Endpoints A10G:** $1.30.
- **HF Endpoints A100:** $4.50.

HF markup is real but ops simpler. Self-host saves 20-40%.

## Containerized deployments

For portability:
- Docker image with model + serving code.
- Deploy on Kubernetes (EKS / GKE / AKS).
- Or serverless (AWS ECS Fargate, GCP Cloud Run).

For: cloud-portable; team's existing Docker tooling.

## Inference servers

Production-grade options:
- **TGI (HF Text Generation Inference).** HF's optimized LLM server.
- **vLLM.** Berkeley; high throughput.
- **TensorRT-LLM.** Nvidia's optimized.
- **Triton Inference Server.** Nvidia's general inference.
- **Ray Serve.** Distributed Python inference.

Pick based on hardware + scale.

## Cold starts

Issue with serverless / scale-to-zero:
- Model load time (5-60 sec).
- First request slow.

Mitigations:
- Keep min instances > 0.
- Use smaller models for serverless.
- Warm-up pings.
- Cache model in memory.

## Networking + latency

For low latency:
- Deploy near users (region selection).
- Use CDN for cached responses.
- Streaming responses for perceived speed.
- Connection pooling.

For global users: multi-region deployment.

## Security

For production:
- Authentication on endpoints (API keys, OAuth).
- VPC peering for private connections.
- Secrets management (AWS Secrets Manager, etc.).
- Rate limiting.
- DDoS protection.

For: production-safety.

## Monitoring + observability

Production must-haves:
- Prometheus / Grafana for metrics.
- DataDog / New Relic for APM.
- ELK / CloudWatch for logs.
- Sentry for errors.

For: catch issues before users do.

## Multi-cloud

For redundancy:
- Deploy across AWS + GCP.
- Load balancer routes traffic.
- Failover if one cloud has issues.

For: mission-critical applications.

## Hybrid (cloud + edge)

For latency-critical:
- Small model on edge (CDN / device).
- Large model on cloud (for complex queries).
- Route based on complexity.

For: real-time + complex AI combined.

## Mistakes to avoid

- **Defaulting to cloud direct for small projects.** Ops burden.
- **No monitoring.** Issues caught by users.
- **Unsecured endpoints.** API abuse + costs.
- **No load testing.** Capacity surprises.

## Summary

- HF Endpoints simplest; cloud direct for scale.
- AWS SageMaker, GCP Vertex AI, Azure ML for HF model deployment.
- Inference servers: TGI, vLLM, TensorRT-LLM, Triton.
- Auto-scaling + monitoring + security essential.
- Multi-cloud / hybrid for advanced needs.

Next: cost optimization + scaling.
