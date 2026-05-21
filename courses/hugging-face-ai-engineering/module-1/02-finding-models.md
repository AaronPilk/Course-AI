---
module: 1
position: 2
title: "Finding the right model for your task"
objective: "Match model to use case efficiently."
estimated_minutes: 5
---

# Finding the right model for your task

## Task-based search

HF organizes models by task. Major categories:
- **Natural Language Processing.** Text generation, classification, summarization, translation, NER, QA.
- **Computer Vision.** Classification, detection, segmentation, generation.
- **Audio.** Speech recognition, TTS, classification.
- **Multimodal.** Image-text, video-text.
- **Tabular.** Structured data.

Start by picking task; filter from there.

## Top tasks + recommended models

**Text generation:** Llama 3, Mistral, Phi 3.5, Qwen 2.5.
**Text embedding (RAG):** sentence-transformers (all-MiniLM-L6-v2, mpnet-base, BGE).
**Speech-to-text:** Whisper (OpenAI) — multilingual ASR standard.
**Text-to-speech:** XTTS, Bark, Tortoise.
**Image classification:** ResNet, ViT, CLIP variants.
**Object detection:** YOLOv8, DETR.
**Image segmentation:** Segment Anything (Meta), Mask2Former.
**Image generation:** Stable Diffusion, Flux.
**Sentiment analysis:** distilbert-sentiment, twitter-roberta-base.
**Translation:** NLLB, Helsinki-NLP.
**Summarization:** BART, T5, Pegasus.
**Code generation:** CodeLlama, StarCoder, DeepSeek Coder.

For: starting points. Refine per specific needs.

## Reading model cards

Critical sections:
- **Intended uses.** What it's good at.
- **Limitations.** What it struggles with.
- **Training data.** What it learned from.
- **License.** Commercial / non-commercial.
- **Performance metrics.** Benchmarks on tasks.
- **How to use.** Code snippets.

Spend 5 min on the card before using.

## Benchmarks

Model performance metrics:
- **MMLU.** Multi-task language understanding.
- **HumanEval.** Code generation.
- **GSM8K.** Math reasoning.
- **HellaSwag.** Commonsense reasoning.
- **TruthfulQA.** Factual accuracy.
- **ARC.** Science QA.

Leaderboards: Open LLM Leaderboard (huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard).

For: compare models objectively.

## Size considerations

Model size = parameter count:
- **Small (< 3B).** Phi 3.5 Mini, Llama 3.2 1B. Fast; runs on CPU / phone.
- **Medium (3B-15B).** Llama 3 8B, Mistral 7B. Consumer GPU.
- **Large (15B-70B).** Llama 3.1 70B, Mixtral 8x22B. High-end GPU / multi-GPU.
- **Frontier (100B+).** Llama 3.1 405B. Cloud only.

For: match to hardware budget.

## Quantization

Lower precision for smaller / faster models:
- **FP32.** Full precision; largest.
- **FP16.** Half precision; standard.
- **INT8.** 8-bit; 50% smaller.
- **INT4 / NF4.** 4-bit; 75% smaller.
- **GGUF.** Format for CPU inference (llama.cpp).

Most production: FP16 or INT8.
For low-VRAM: INT4 / NF4 / GGUF.

## Licensing types

Common open-source licenses:
- **Apache 2.0.** Permissive; commercial OK.
- **MIT.** Permissive; commercial OK.
- **OpenRAIL-M.** Open + responsible AI; commercial OK with restrictions.
- **Llama Community License.** Custom; commercial OK up to ~700M MAU.
- **CC-BY-SA.** Attribution + share-alike.
- **Custom non-commercial.** Research only.

For commercial work: verify carefully.

## Gated models

Some models require approval:
- Llama (Meta requires agreement).
- Some Stability AI models.

Click "Access" button on model card; agree to terms; usually approved within minutes.

For: download + use restricted models.

## Inference widget

Each model has a browser-based test interface:
- Type input.
- See output.
- Test without code.

For: quick capability check before commitment.

## Spaces using a model

Each model page links Spaces (live demos) using it:
- See community deployment.
- Test app-style usage.
- Sometimes copy Space code as starting point.

For: real-world example of model in app.

## Trending vs. all-time

Recent uploads at top of Trending. All-time has classics.

For:
- Cutting edge: Trending.
- Battle-tested: All-time top.

Mix; consider your tolerance for newness vs. stability.

## When no perfect model exists

Often you find 80% match:
- Fine-tune base model on your data (Module 3).
- Use prompt engineering with general model.
- Combine multiple models (Module 5).
- Wait for better model (rapid release cycle).

For: practical AI work; rarely perfect off-the-shelf.

## Avoiding hype

Many models claim SOTA; some don't deliver:
- Read independent benchmarks.
- Check community discussions on model.
- Test on your actual data.

For: skeptical evaluation; not just trust marketing.

## Mistakes to avoid

- **Pick by name recognition.** Best for your task isn't always most famous.
- **Skip license check.** Commercial problems later.
- **Skip benchmarks.** Marketing != performance.
- **No real-world test.** Benchmarks don't cover your data.

## Summary

- Filter by task first; then license + size + capability.
- Read model cards; check benchmarks; test in widget.
- Major 2026 LLMs: Llama 3, Mistral, Phi, Qwen.
- Quantization (INT8 / INT4) for low VRAM.
- Verify commercial license before deployment.
- Real-world test on your data > benchmark claims.

Next: Datasets library.
