---
module: 1
position: 1
title: "The Hub — models, datasets, Spaces"
objective: "Navigate Hugging Face's platform; understand what's available."
estimated_minutes: 5
---

# The Hub — models, datasets, Spaces

## What Hugging Face is

Hugging Face = "GitHub of AI." Open-source platform hosting:
- **1M+ models.** Open-source ML models for every task.
- **500K+ datasets.** Training + evaluation data.
- **300K+ Spaces.** Live AI demos as web apps.
- **Libraries.** Transformers, Datasets, PEFT, Accelerate, TRL.

The dominant open-source AI ecosystem in 2026.

## Why HF matters

Before HF: AI research scattered across papers + custom code.

After HF: standardized way to share + use models. Anyone can:
- Download + run state-of-the-art models in 5 lines of code.
- Share trained models for others.
- Deploy demos for free (via Spaces).
- Use community datasets.

Democratized open-source AI.

## Models on the Hub

Search huggingface.co/models. Filter by:
- **Task.** Text generation, classification, image generation, speech, etc.
- **Library.** Transformers, Diffusers, Sentence Transformers.
- **License.** Apache, MIT, OpenRAIL, etc.
- **Language.** For NLP models.
- **Size.** Parameters.

For: finding the right model for your need.

## Popular open models 2026

- **Llama 3 / Llama 3.5** (Meta). Strong open LLMs.
- **Mistral / Mixtral** (Mistral AI). Efficient.
- **Qwen** (Alibaba). Strong multilingual.
- **Phi** (Microsoft). Small + capable.
- **Flux** (Black Forest Labs). Image generation.
- **Whisper** (OpenAI). Speech recognition.
- **CLIP** (OpenAI). Image-text matching.
- **Stable Diffusion** (Stability AI). Image generation.

Most have HF model pages.

## Model pages

Each model has:
- **Model card.** Description, training, capabilities.
- **Files + versions.** Weights, tokenizer, config.
- **Inference widget.** Test in browser.
- **Use in Transformers** button.
- **Code snippets.** Copy-paste to use.
- **Spaces using it.** Live demos.
- **Discussions, community contributions.**

For: evaluate before using.

## Datasets

Search huggingface.co/datasets. Filter by:
- **Task.** Same as models.
- **Size.** Rows.
- **Language.**
- **License.**

For: training data; evaluation benchmarks; fine-tuning datasets.

## Popular datasets

- **The Pile.** 800GB diverse text.
- **C4.** Cleaned Common Crawl.
- **Wikipedia dumps.**
- **CommonVoice.** Speech data.
- **LAION.** Image-text pairs.
- **Domain-specific.** Medical, legal, code, etc.

## Spaces

Live AI demos as web apps. Anyone can:
- Build a Gradio / Streamlit app.
- Deploy to Spaces (free tier).
- Share URL; anyone uses.

For: model showcases, interactive demos, tools.

## Hub features

- **Repositories.** Like GitHub repos for AI assets.
- **Version control.** Git-based.
- **Collaboration.** Discussions, pull requests.
- **Organizations.** Teams + companies.
- **Private repos** (paid).
- **Inference API.** Test models via HTTP.

For: full ML asset lifecycle in one platform.

## Searching effectively

For models:
- Start with task filter.
- Sort by Trending / Most downloads / Most likes.
- Read model card before committing.
- Check Spaces using it (community usage signal).

For datasets:
- Filter by language + size + license.
- Preview rows in dataset viewer.

For: avoid wasted time on bad/unfit assets.

## API tokens

For programmatic access:
- HF account → Settings → Access Tokens.
- Use in Python: `huggingface_hub login`.
- Required for: private models, Inference API, gated models.

For: integration into your code.

## Free vs. Pro

HF free tier:
- Unlimited public repos.
- Limited Spaces compute.
- Inference API rate limits.

Pro / Enterprise:
- Private repos.
- More Spaces compute.
- Higher rate limits.
- Custom inference endpoints.

For: scale, upgrade.

## Mistakes to avoid

- **Using random model without reading card.** May not fit your task.
- **Ignoring license.** Commercial implications.
- **Wrong task filter.** Wastes time.
- **No version pinning.** Reproducibility risk.

## Summary

- HF = open-source AI ecosystem (models + datasets + Spaces + libraries).
- 1M+ models, 500K+ datasets, 300K+ Spaces.
- Filter searches by task, library, license, language.
- Model cards have everything; read before using.
- API tokens for programmatic access.
- Free tier generous; Pro for scale.

Next: finding the right model.
