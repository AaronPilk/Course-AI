---
module: 4
position: 4
title: "Cost optimization and scaling"
objective: "Keep AI deployment affordable + scalable."
estimated_minutes: 5
---

# Cost optimization and scaling

## Cost dimensions

AI deployment costs:
- **Compute (GPU-hours).** Biggest expense.
- **Storage.** Model files + data.
- **Network.** Egress / API traffic.
- **Operations.** Engineering time.

Optimize each.

## Right-sizing models

Often smaller model suffices:
- Try Phi 3.5 Mini (3.8B) before Llama 70B.
- Test on representative queries.
- Most use cases: 7-13B models sufficient.
- Reserve 70B+ for genuinely needed reasoning.

For: huge cost reduction; usually quality stays high.

## Quantization in production

- FP16 → INT8: ~50% memory + cost.
- INT8 → INT4: another ~50%.
- AWQ / GPTQ: production-optimized quantization.

For: pack more inference per GPU; smaller hardware.

## Caching

For repeated queries:
- Cache exact-match queries (Redis).
- Semantic cache (similar queries → same response).
- TTL based on freshness needs.

For: huge cost reduction on FAQ-like workloads.

## Batch processing

If real-time not needed:
- Queue requests.
- Process in batches.
- Much higher throughput per GPU.

For: async tasks (summarization, embedding generation, evaluation).

## Continuous batching

For real-time:
- vLLM / TGI continuous batching.
- Combines requests in-flight.
- 5-10x throughput vs. one-at-a-time.

For: real-time API serving; max GPU utilization.

## Spot / preemptible instances

Cloud spot prices ~70% cheaper:
- AWS Spot, GCP Preemptible, Azure Spot.
- Can be terminated with notice.
- For: training, batch inference, fault-tolerant workloads.

For: massive cost reduction; not for production-critical real-time.

## Hardware tier choice

Match hardware to need:
- **T4 ($0.60/hr):** Small model inference.
- **A10G ($1/hr):** 7-13B INT8.
- **L4 ($1.50/hr):** Better than T4; good price/perf.
- **A100 (40-80GB):** Larger models; training.
- **H100:** Premium; SOTA performance.

For: avoid over-provisioning.

## Scale-to-zero

For sporadic traffic:
- Scale replicas to 0 when idle.
- Cold start on next request (~30 sec).
- Pay only when active.

For: low-traffic APIs; dev / staging environments.

## Multi-tenancy

Share GPU across uses:
- Multiple models on one GPU (if VRAM allows).
- Multi-LoRA inference (different adapters; same base).
- Time-share for low-priority work.

For: maximize hardware utilization.

## API vs. self-hosted economics

Per-token pricing of API vs. hourly GPU rental:

Example: 1M queries/day, ~500 tokens each.
- **API ($0.20/M tokens):** 500M tokens/day × $0.20 = $100/day.
- **Self-hosted A10G:** 24 hours × $1 = $24/day + ops.

For high volume: self-host saves.
For low volume: API simpler.

Break-even typically 100K-1M requests/day depending on model + use case.

## Model distillation

Train smaller model to match larger:
- Teacher: large model.
- Student: small model trained to mimic.
- Result: similar quality, 10x less compute.

For: production deployment; quality from large with cost of small.

## Quantization-aware training

Train model to be robust to quantization:
- Better quality at INT8 / INT4 than post-hoc quantization.
- More setup but better production economics.

For: critical quality + production cost balance.

## Speculative decoding

For LLM inference speedup:
- Small draft model proposes tokens.
- Large model verifies.
- 2-3x speedup for many cases.

For: latency-critical without quality drop.

## Monitoring + alerting

Track:
- Cost per day / week.
- Cost per request.
- Underutilized resources.
- Spikes (unexpected traffic / bugs).

For: catch runaway costs early.

## Budget alerts

Set up:
- Hard caps (e.g., stop service if exceeds).
- Soft alerts (notify; investigate).
- Per-project / team budgets.

For: prevent month-end bill shock.

## Mistakes to avoid

- **Default to biggest model.** Costs 10-100x without needed benefit.
- **No caching.** Pay for repeated queries.
- **24/7 max replicas.** Pay for idle.
- **No quantization.** Use more hardware than needed.
- **No monitoring.** Runaway costs invisible.

## Summary

- Right-size model (smaller often sufficient).
- Quantize for memory + speed.
- Cache repeated queries.
- Batch when possible; continuous batching for real-time.
- Spot instances for fault-tolerant workloads.
- Scale-to-zero for sporadic traffic.
- Self-host saves at high volume; API at low.
- Monitor + alert for cost control.

Module 5 next: production AI patterns.
