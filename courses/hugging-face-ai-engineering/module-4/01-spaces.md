---
module: 4
position: 1
title: "Spaces — Gradio and Streamlit apps"
objective: "Build + deploy AI web apps."
estimated_minutes: 5
---

# Spaces — Gradio and Streamlit apps

## What Spaces are

HF Spaces = hosted web apps for AI demos. Build a Python app; push to Space; HF runs it; share URL.

Free tier:
- CPU-only Space (limited).
- 16 GB RAM, 2 CPU.

Paid:
- GPU Spaces (T4 / A10G / A100).
- Per-hour pricing.

For: model demos, internal tools, public AI apps.

## Gradio vs. Streamlit

**Gradio.** Designed for ML demos; simple interfaces; great for quick demos.

**Streamlit.** General data apps; more flexible layouts; popular for dashboards.

For ML demos: Gradio first. For complex apps: Streamlit.

Both supported in Spaces.

## Basic Gradio app

```python
import gradio as gr
from transformers import pipeline

pipe = pipeline("text-generation", model="meta-llama/Llama-3.2-1B-Instruct")

def chat(message):
    response = pipe(message, max_new_tokens=200)
    return response[0]["generated_text"]

demo = gr.Interface(fn=chat, inputs="text", outputs="text")
demo.launch()
```

Save as app.py + requirements.txt; push to Space → live demo URL.

## Gradio components

```python
gr.Interface(
    fn=my_function,
    inputs=[gr.Textbox(label="Prompt"), gr.Slider(0, 1, label="Temperature")],
    outputs=gr.Textbox(label="Response"),
    title="My LLM",
    description="...",
    examples=[["Hello"], ["What is AI?"]]
)
```

For: rich interfaces with multiple inputs/outputs.

## ChatInterface

For chat UIs:

```python
def respond(message, history):
    return pipe(message)[0]["generated_text"]

gr.ChatInterface(fn=respond).launch()
```

Built-in chat UI with history.

## Streaming

For real-time output:

```python
def generate(message, history):
    for token in stream_response(message):
        yield response_so_far

gr.ChatInterface(fn=generate).launch()
```

For: ChatGPT-style streaming UX.

## File uploads

```python
gr.Interface(
    fn=process_image,
    inputs=gr.Image(),
    outputs=gr.Image()
)
```

Supports: Image, Audio, Video, File. For: image / audio AI demos.

## Creating a Space

In browser:
1. huggingface.co/new-space.
2. Pick SDK (Gradio / Streamlit / Docker).
3. Pick hardware (CPU free / GPU paid).
4. Pick license.
5. Push code via Git or upload.

For: deploying your demo.

## Requirements.txt

Specify dependencies:
```
transformers
torch
gradio
accelerate
```

Auto-installed on Space build.

## Hardware

For Gradio Space with LLM:
- **CPU.** Free; works for small models / API-based apps.
- **T4 GPU.** $0.60/hour; fine for 7B INT8.
- **A10G.** $1.05/hour; better for 7B FP16, 13B INT8.
- **A100 (40GB).** $4/hour; large models.
- **H100.** Premium pricing; SOTA performance.

Pause when not in use to save cost.

## Pause + restart

Spaces can sleep when inactive:
- Free Spaces sleep after inactivity.
- Resume on next visit (cold start ~30 sec).

For free tier: cost-free hosting; some latency.

## Persistent storage

For data persistence across restarts:
- Spaces have ephemeral filesystem by default.
- Persistent Storage upgrade (~$5/month for 20 GB).

For: user data, fine-tuned models, caches.

## Secrets

For API keys:
- Space → Settings → Variables and secrets.
- Add HF_TOKEN, OPENAI_API_KEY, etc.
- Access in code via os.environ.

For: secure credentials.

## Community Spaces

Discover Spaces:
- huggingface.co/spaces.
- Filter by SDK, hardware, task.
- Find demos for any model.
- Copy code for your own use.

For: learning from examples; finding tools.

## Production patterns

Spaces for:
- Public demos.
- Internal team tools.
- Quick PoCs.

For high-volume production: Inference Endpoints (next lesson) or self-hosted instead.

## Mistakes to avoid

- **Free Space with huge model.** OOM crash.
- **No README in Space.** Discovery friction.
- **Secrets in code.** Exposed. Use Variables and secrets.
- **No requirements.txt.** Build failures.

## Summary

- Spaces = hosted web apps for AI demos.
- Gradio for ML demos; Streamlit for general data apps.
- Free CPU; paid GPUs (T4 / A10G / A100 / H100).
- Push code via Git or upload.
- Persistent storage + secrets for production.
- For high-volume: Inference Endpoints.

Next: Inference Endpoints.
