---
module: 2
position: 2
title: "Negative prompts and avoiding artifacts"
objective: "Push the model away from common failure modes."
estimated_minutes: 5
---

# Negative prompts and avoiding artifacts

## What negative prompts do

Negative prompts list concepts to AVOID. The model is steered away from these.

For SD/SDXL: very impactful; can dramatically improve quality.

For Flux: less impactful (different architecture); often leave empty or very brief.

## Common negative prompts

For SDXL realism:
```
ugly, deformed, bad anatomy, watermark, text, blurry, oversaturated, jpeg artifacts, low quality, worst quality, signature, username, low res, cropped, cartoon
```

For SDXL illustration:
```
ugly, deformed, bad anatomy, photo, photorealistic, watermark, text, blurry, signature
```

For anime:
```
realistic, photo, photography, 3d, blurry, watermark, text, ugly, deformed, bad anatomy, bad hands, low quality, multiple views
```

For: avoiding common SD artifacts.

## Anatomy-related

SD/SDXL struggle with anatomy. Negatives that help:
- "Bad anatomy, deformed limbs, fused fingers, extra fingers, missing fingers, malformed hands, mutant, disfigured."

Improves but doesn't eliminate hand / anatomy issues.

For better hands: ControlNet (next module) or Flux (handles hands better natively).

## Text + watermarks

SD/SDXL hallucinates random text + watermarks. Negatives:
- "Text, watermark, signature, logo, copyright, username."

Reduces but doesn't eliminate. Random "fake" text in images = SD signature.

For clean text-free images: Flux is much better.

## Quality negatives

To avoid common amateur signatures:
- "Low quality, worst quality, low res, jpeg artifacts, compression artifacts, blurry, oversaturated."

Reinforces toward high-quality training images.

## Style negatives

To exclude unwanted styles:
- For photography: "cartoon, anime, illustration, painting, 3d render."
- For art: "photo, photograph, photorealistic, 3d render."
- For anime: "realistic, 3d, photo, photography."

For: keep model in your target aesthetic.

## Don't over-negative

A 200-token negative isn't better than a 50-token negative:
- Token limit applies to negative too.
- Conflicting negatives confuse.
- Strong negative can suppress valid features.

Sweet spot: 30-60 tokens.

## Common community negatives

Civitai has standard "negative embeddings" — pre-trained tokens packaged as files:
- "BadDream" — anti-bad outputs.
- "UnrealisticDream" — anti-unrealistic.
- "EasyNegative" — popular SD 1.5 negative.

Add to Embeddings folder; reference as `(badDream:1)` or `embedding:BadDream`.

For: shortcut to good negative without writing keywords.

## Flux differences

Flux uses Classifier-Free Guidance differently:
- Doesn't have the same need for elaborate negative prompts.
- Empty / brief negatives often work fine.

For Flux: focus energy on positive prompts; light negative.

## SDXL Refiner

SDXL had a "Refiner" model meant to follow base. Most workflows skip refiner; refiner can degrade rather than improve in many cases.

For most: skip Refiner; use base SDXL directly.

## Generating multiple seeds

Same prompt + different seed = different image. Generate 4-8 batches:
- Cherry-pick best.
- See variation.
- Find "good seeds" for that prompt.

For: exploration; finalize from batch.

## Prompt iteration

Prompts rarely succeed first try:
1. Initial prompt.
2. Generate batch.
3. Identify what's wrong.
4. Adjust prompt (add specificity, remove conflicts).
5. Repeat.

Sometimes 5-10 iterations to nail an image.

## Mistakes to avoid

- **No negative.** Avoidable artifacts.
- **Over-negative.** Suppressing valid features.
- **Same negative for every model.** Adapt to model + style.
- **Flux with heavy negative.** Different architecture; minimal needed.

## Summary

- Negative prompts steer away from concepts.
- Common: deformed, bad anatomy, watermark, blurry, low quality, jpeg artifacts.
- Style negatives exclude unwanted aesthetic.
- Negative embeddings (BadDream, EasyNegative) packaged shortcuts.
- Don't over-negative; 30-60 tokens.
- Flux needs minimal negative.

Next: weighting + attention.
