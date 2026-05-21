---
module: 3
position: 3
title: "Img2img and reference image workflows"
objective: "Transform existing images using AI."
estimated_minutes: 5
---

# Img2img and reference image workflows

## What img2img is

Img2img = start with an image instead of pure noise; transform via prompt.

The model:
1. Encodes input image to latent space.
2. Adds partial noise based on "denoising strength."
3. Reverse-diffuses from that noisy latent guided by your prompt.
4. Outputs new image — similar structure, new content per prompt.

For: style transfer, photo-to-art, sketch-to-render, variation generation.

## Denoising strength

The key parameter:
- **0.1-0.3.** Subtle changes; preserves original structure heavily.
- **0.4-0.6.** Moderate; new style + original composition.
- **0.7-0.9.** Heavy; barely recognizable from original.
- **1.0.** Essentially text-to-image; original ignored.

For typical style transfer: 0.5-0.7.

## Common img2img workflows

**Photo to painting:**
- Photo input.
- Prompt: "oil painting style."
- Denoising 0.5-0.6.
- Result: photo transformed to oil painting.

**Sketch to render:**
- Rough sketch.
- Prompt: detailed description.
- Denoising 0.7-0.85.
- Result: polished render from sketch.

**Variation generation:**
- Existing AI generation.
- Same prompt; different seed.
- Denoising 0.4-0.5.
- Result: similar but varied versions.

## Img2img vs. ControlNet

Both use reference images differently:
- **Img2img.** Loose; denoising determines closeness; whole image guides.
- **ControlNet.** Surgical; specific aspect (pose, depth, edges) preserved precisely.

For specific structural control: ControlNet.
For style transfer / variation: img2img.

Combine: img2img + ControlNet for both reference style + specific structure.

## Reference Only ControlNet

A specialized ControlNet that uses image as style/content reference without preprocessing:
- Mimics reference image's overall feel.
- Combine with text prompt.

For: style transfer with more sophistication than img2img.

## IP-Adapter

Stronger reference image method:
- Image Prompt Adapter.
- Encodes reference image's features as conditioning.
- Generation incorporates reference's style + content.

Works well for:
- Style transfer.
- Character likeness (with face IP-Adapter).
- Composition reference.

Combine with text prompt: text drives subject; IP-Adapter drives style.

## Face IP-Adapter

For preserving a specific face:
- Provide face photo as reference.
- IP-Adapter encodes face features.
- Generated images include similar face.

For: character consistency across generations; named character work.

Caution: licensing + ethical concerns about using real people's faces; only with consent.

## Inpaint + img2img workflow

Pro workflow:
1. Generate base via text-to-image.
2. Img2img variations to explore directions.
3. Inpaint specific issues.
4. Final image is iterated composite.

For: production-quality results.

## Sketch-to-image

Increasingly powerful 2026 workflows:
1. Rough sketch (5-min hand drawing or Procreate).
2. Img2img + Canny ControlNet.
3. Detailed prompt.
4. Denoising 0.7-0.85.
5. Result: polished render guided by your composition.

For: concept art workflows; designers doodle → AI renders.

## Style mixing

For unique aesthetics:
1. Generate base in Style A.
2. Img2img with prompt for Style B.
3. Denoising 0.5 — hybrid emerges.

For: experimental work; finding new looks.

## Mistakes to avoid

- **Wrong denoising for goal.** Subtle change with 0.9 = lost original.
- **No ControlNet on structural transforms.** Composition drifts.
- **Img2img on low-quality source.** Garbage in, garbage out.
- **Same denoising for everything.** Tune per use case.

## Summary

- Img2img: start from image, transform via prompt.
- Denoising strength: 0.1-0.3 subtle; 0.5-0.7 typical; 0.9+ heavy.
- IP-Adapter for stronger reference influence.
- Combine with ControlNet for structural control.
- Inpaint + img2img iteration for production quality.

Next: IP-Adapter + identity preservation.
