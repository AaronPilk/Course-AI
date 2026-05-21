---
module: 3
position: 2
title: "Inpainting and outpainting"
objective: "Edit existing images selectively + expand canvas."
estimated_minutes: 5
---

# Inpainting and outpainting

## What inpainting is

Inpaint = regenerate a specific masked area of an existing image. The model fills in the mask using context from surroundings + your prompt.

For:
- Remove unwanted objects.
- Fix mistakes (bad hands, bad face, weird artifacts).
- Change parts (different shirt color, add jewelry).
- Add elements (add a dog to scene).

Game-changing for editing AI-generated images.

## How inpaint works

1. Load existing image.
2. Paint mask over area to change.
3. Provide new prompt for that area.
4. Model regenerates masked region while preserving surrounding pixels.

For: surgical edits without regenerating whole image.

## Inpaint settings

- **Mask blur.** Soften mask edges; blends new with old.
- **Mask mode.** Inpaint masked (regenerate inside) or Inpaint not masked (regenerate outside).
- **Inpaint area.** Whole picture (slow) or Only masked (fast; better context).
- **Denoising strength.** 0 = no change; 1 = full regenerate.

For balancing: 0.5-0.8 denoising for moderate changes; 0.9+ for major.

## Inpaint workflow

For a face fix:
1. Image with bad face.
2. Mask face area.
3. Prompt: "perfect face, detailed skin, sharp eyes."
4. Denoising 0.6-0.8.
5. Generate; new face replaces old.

For removing object:
1. Image with unwanted object.
2. Mask object.
3. Prompt: describe what should be there (e.g., "grass" for object on lawn).
4. Generate; object removed; replaced with described context.

## Inpaint specific models

Some SD models are inpaint-specific:
- "inpaint" suffix in model name.
- Trained specifically for inpaint workflows.
- Better quality for inpaint.

For dedicated inpaint work: inpaint-specific checkpoint.

## ControlNet + Inpaint

For: precise inpainting:
- ControlNet Inpaint takes the masked image + mask + prompt.
- Stronger control than plain inpaint.

For: high-quality inpaint preserving structure.

## Outpainting

Outpaint = extend the canvas beyond original image boundaries. Model generates new content matching style of original.

For:
- Convert portrait to landscape (extend sides).
- Add background context.
- Extend cropped images.
- Create cinematic widescreen versions.

## Outpaint workflow

1. Original image.
2. Add canvas in chosen direction (left / right / top / bottom).
3. New region masked.
4. Model fills new area matching style + content of original.

For: aspect ratio changes; cinematic crops; revealing context.

## Smart inpaint tools

Some tools provide AI-assisted inpaint:
- **Photoshop Generative Fill.** Adobe's tool, uses Firefly + sometimes SD.
- **Krita AI plugins.** Open-source painting + AI inpaint.
- **ComfyUI workflows.** Custom inpaint pipelines.

For: professional editing with AI assistance.

## Inpaint composite workflow

For complex edits:
1. Generate base image with prompt.
2. Iteratively inpaint problem areas (face, hands, specific objects).
3. Final image is collage of best regenerations.

Pro AI artists rarely accept first generation; iterate via inpaint.

## Inpaint for face / hand fixes

SD often produces ugly faces / hands. Standard fix:
1. Generate base.
2. Mask face → inpaint with face-focused prompt + LoRA.
3. Mask hands → inpaint with hand-focused prompt + ControlNet hand depth.
4. Result: clean face + hands.

For: production-quality output.

## Outpaint for wider compositions

For social media variants (square → landscape):
1. Generate square image.
2. Outpaint left + right.
3. Resize to 16:9 cinematic widescreen.

For: multi-platform delivery from single source.

## Generative fill (Adobe)

Adobe's branded version of inpaint + outpaint:
- Photoshop integration.
- Cloud-based (uses Firefly model).
- Commercial-safe (Adobe trained on licensed content).

For: pro photo editing with AI fill; commercial confidence.

## Mistakes to avoid

- **High denoising on entire mask.** Loses surrounding context.
- **Low denoising for major changes.** No real change.
- **No mask blur.** Hard mask edges visible.
- **Wrong model for inpaint.** Some models bad at inpaint.

## Summary

- Inpaint = regenerate masked region; for fixes + additions + removals.
- Outpaint = extend canvas beyond original.
- Settings: mask blur, denoising strength (0.5-0.8 typical).
- Inpaint-specific models exist; better for the task.
- ControlNet + Inpaint for precise structural control.
- Pro workflow: iterate base generation + inpaint problem areas.

Next: img2img + reference workflows.
