---
module: 5
position: 3
title: "Upscaling, face restoration, post-processing"
objective: "Polish AI-generated images to professional quality."
estimated_minutes: 5
---

# Upscaling, face restoration, post-processing

## Why upscale

SDXL native = 1024x1024; many use cases need higher:
- Print (300 DPI needs 4K+).
- Hero web images (4K+).
- Detail enhancement.
- Print-on-demand products.

Upscaling: take 1024 generation → 2K, 4K, 8K.

## AI upscalers

- **ESRGAN family.** Real-ESRGAN, 4x-UltraSharp, 4xRemacri. Free; widely used.
- **GFPGAN.** Face-focused.
- **CodeFormer.** Face restoration.
- **SUPIR.** High-quality general.
- **Magnific** (paid). Premium quality.
- **Topaz Gigapixel AI** (paid). Established commercial.

For most workflows: 4x-UltraSharp or Real-ESRGAN free.

## Upscale workflows

**Simple upscale:**
- Image → Upscaler → larger image.

**Latent upscale (hires.fix):**
- Generate latent at base resolution.
- Upscale in latent space.
- Continue diffusion at higher resolution.
- Result: more detail emerges; not just resize.

**Tile upscale:**
- Split image into overlapping tiles.
- Upscale each tile.
- Blend back together.
- For very large outputs (8K+) without VRAM crash.

## Hires.fix in A1111

A1111 has built-in Hires.fix:
- After base generation, scale latent + continue diffusion.
- Denoising strength controls how much new detail.
- Common: 1.5x or 2x scale; denoising 0.4-0.6.

For: better SDXL results than pure upscaling.

## Ultimate SD Upscale (ComfyUI / A1111)

Tiled upscale + diffusion:
- Splits image into tiles.
- Each tile upscaled + diffused.
- Blends back.
- Handles 8K+ without OOM.

For: high-resolution production output.

## SUPIR + Magnific tier

Premium upscalers:
- Massive parameter models.
- Hallucinate plausible detail.
- Sometimes "too creative" (adds details not in original).

For commercial / print work: Magnific often used; expensive.

## Face restoration

SD's face issues fixed by:
- **CodeFormer.** Reconstructs face features.
- **GFPGAN.** Similar; sometimes different look.
- **ADetailer extension** (A1111). Auto-detects + inpaints faces.
- **Face Restore** node (ComfyUI).

For: ugly / distorted faces post-generation.

## ADetailer

Automatic face / hand fix:
- Detection model finds faces / hands.
- Inpaints with focused prompt + LoRA.
- One-click polish.

For: production polish; eliminates manual face inpaint per image.

## Hand restoration

Specific to hands:
- ControlNet hand depth at generation time (best prevention).
- Manual inpaint per image with hand-focused prompt + LoRA.
- ADetailer with hand-detection model.

Hands remain SD weak spot; multi-pronged approach.

## ReActor / FaceFusion (face swap)

For replacing generated face with reference:
- ReActor (extension).
- FaceFusion (separate tool).
- Take any generated image; swap in your character's face.

For: ultra-strict character consistency; brand mascot work.

## Post-processing pipeline

Pro workflow:
1. Generate base (SDXL / Flux).
2. Inpaint problem areas.
3. ADetailer for face / hands.
4. Upscale (hires.fix or post-gen upscaler).
5. Final color correction (Photoshop / Photopea).
6. Export.

For polished output: each stage refines.

## External post-processing

After AI generation:
- **Photoshop / Affinity Photo.** Color correction, composition refinement.
- **Lightroom.** Tonal adjustments.
- **AI tools.** Photoshop Generative Fill, Firefly, Midjourney editing.

For: integrate AI generation into traditional pro workflows.

## Color grading

Generated images often need:
- Slight color correction.
- Vignette.
- Film grain (texture).
- Slight sharpening.
- Chromatic aberration (subtle realism).

For: photographic feel; remove "AI signature."

## Final checks

Before delivery:
- **Watch for AI artifacts.** Extra fingers, weird textures.
- **Check edges.** AI sometimes weird at image boundaries.
- **Spot text / watermarks.** SD hallucinates these; inpaint to remove.
- **Verify subject + prompt match.** Sometimes off.

For: ship-quality output.

## Mistakes to avoid

- **Direct upscale without diffusion.** Loses detail opportunity.
- **No face / hand fix.** Visible artifacts.
- **Forgot post-processing.** Output looks AI-generated.
- **Watermarks hallucinated.** Often missed.

## Summary

- Upscalers: ESRGAN family (free), SUPIR, Magnific (paid).
- Hires.fix (A1111) + Ultimate SD Upscale: diffusion-aided upscaling for more detail.
- Face restoration: ADetailer, CodeFormer, GFPGAN.
- Hand fixes: ControlNet, inpaint, ADetailer hand model.
- ReActor / FaceFusion for face swap (with consent).
- Post-process: color grade, vignette, grain to remove "AI signature."

Next: commercial workflows.
