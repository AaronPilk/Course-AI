---
module: 1
position: 4
title: "Model cards and licensing"
objective: "Read model documentation; verify commercial fit."
estimated_minutes: 5
---

# Model cards and licensing

## What model cards are

A model card = README for each model. Documents:
- What the model does.
- How it was trained.
- Limitations.
- Performance.
- License.
- Usage examples.

Required for serious models; community norm + sometimes mandatory.

## Card sections to read

For every model you use:
- **Model description.** What is it?
- **Intended uses.** Designed for what?
- **Out-of-scope use.** What it's bad at / shouldn't be used for.
- **Bias, Risks, Limitations.** Known issues.
- **Training data.** What it learned from.
- **Training procedure.** How it was trained.
- **Evaluation.** Benchmark scores.
- **Environmental impact.** Sometimes included.
- **Citation.** How to credit.

For: informed usage; avoid surprises.

## License types

Common licenses on HF:
- **Apache 2.0.** Permissive; commercial OK. Examples: Mistral, Whisper.
- **MIT.** Permissive; commercial OK. Examples: Phi.
- **OpenRAIL-M.** Open + responsible. Examples: Stable Diffusion variants.
- **Llama Community License.** Custom; commercial OK up to ~700M MAU.
- **Gemma Terms of Use.** Google's custom; commercial OK with restrictions.
- **CC-BY-SA.** Attribution + share-alike.
- **Non-commercial.** Research only.

For: verify before commercial deployment.

## Verifying license

Steps:
1. Open model card.
2. Find "License" section / metadata.
3. Read full license text (linked from model card).
4. Check intended use compatibility.
5. Document the license used for the project.

For: legal compliance.

## Gated models

Some models require explicit access:
- Click "Access" button.
- Read + agree to terms.
- Wait for approval (often instant; sometimes manual review for sensitive models).
- Download available after approval.

Examples: Llama models (Meta), some Stability AI releases.

For: legitimate access to gated content.

## OpenRAIL-M specifics

OpenRAIL = Open Responsible AI License. Most common in image gen / multimodal:
- Commercial use OK.
- "Use-based" restrictions: no illegal, harmful, deceptive, discriminatory use cases listed.
- No specific revenue cap.

For: most generative AI work; comply with use restrictions.

## Llama Community License

Meta's custom:
- Commercial OK below 700M MAU (large companies need separate agreement).
- Acceptable use policy must be followed.
- Attribution to Llama / Meta required.
- Output sometimes has restrictions (varies per version).

For: most indie + SMB commercial use OK; verify scale.

## Reading bias + limitation sections

Model cards often disclose:
- Performance gaps for non-English.
- Stereotypes from training data.
- Outdated knowledge (cutoff date).
- Domain-specific weaknesses.

For: informed deployment; mitigation strategies.

## Performance metrics

Most cards include:
- Benchmark scores (MMLU, HumanEval, etc.).
- Comparison to baseline / prior models.
- Per-task breakdowns.

For: realistic expectations; pick best for your use case.

## Training data disclosure

Some models disclose:
- Dataset names (The Pile, Common Crawl, Wikipedia).
- Data filtering applied.
- Languages covered.
- Cutoff date.

For: understand model's "world view"; spot mismatches with your domain.

## Environmental impact

Some cards include:
- Training compute (GPU-hours).
- Carbon emissions estimate.
- Hardware used.

For transparency; emerging standard.

## Carbon-aware deployment

For environmental awareness:
- Train / fine-tune in regions with green energy.
- Use smaller / quantized models.
- Cache inference results.

For: responsible AI development.

## Model card examples

Strong examples on HF:
- **Llama 3** model cards. Comprehensive.
- **BLOOM** cards. Open science transparency.
- **Stable Diffusion** cards. Multiple OpenRAIL details.

Weak (avoid using these):
- One-paragraph cards.
- No license info.
- No training data.
- No limitations.

For: prefer models with thorough cards.

## Mistakes to avoid

- **Skip card; just use model.** License + capability surprises.
- **Ignore "out of scope" warnings.** Misuse + poor results.
- **No license documentation in project.** Compliance gap.
- **Trust benchmarks without verification.** Marketing != real performance.

## Summary

- Model cards document model behavior + license + usage.
- Read before using; especially for production / commercial.
- Common licenses: Apache 2.0, MIT, OpenRAIL-M, Llama Community, CC variants.
- Gated models need approval (Llama, some Stability).
- Document licenses in your project.
- Trust + verify benchmarks on your data.

Module 2 next: Transformers library.
