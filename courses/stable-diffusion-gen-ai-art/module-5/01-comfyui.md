---
module: 5
position: 1
title: "ComfyUI — node-based generation"
objective: "Build repeatable professional generation pipelines."
estimated_minutes: 5
---

# ComfyUI — node-based generation

## What ComfyUI is

ComfyUI is a node-based interface for Stable Diffusion. Instead of UI sliders + dropdowns, you wire together nodes (Load Model, Load Prompt, KSampler, VAE Decode, Save Image) into a workflow graph.

For:
- **Pro production.** Complex pipelines visible + reproducible.
- **Custom workflows.** Combine ControlNet + LoRAs + IP-Adapter + upscaling in one graph.
- **Sharing workflows.** Export JSON; recipient loads exact pipeline.
- **Performance.** Often faster than A1111 for same workflow.

In 2026: the standard for serious AI art work.

## Installing ComfyUI

Several paths:
- **Git clone + Python.** Manual setup.
- **ComfyUI Desktop App** (newer; one-click).
- **Stability Matrix.** UI for managing SD installations including ComfyUI.
- **Cloud (Replicate, RunPod, etc.).** Hosted instances.

For local: ComfyUI Desktop App is easiest in 2026.

## The node graph

Basic flow:
1. **Load Checkpoint.** Loads SD model.
2. **CLIP Text Encode.** Converts prompt to conditioning.
3. **Empty Latent Image.** Starting noise.
4. **KSampler.** Diffusion happens here.
5. **VAE Decode.** Latent → pixel image.
6. **Save Image.** Write to disk.

Connect outputs to inputs by dragging wires.

## Adding complexity

For LoRA:
- Insert **Load LoRA** node between checkpoint + sampling.

For ControlNet:
- Add **Load ControlNet Model** + **Apply ControlNet** nodes; route conditioning.

For img2img:
- **Load Image** + **VAE Encode** → use as latent input instead of Empty Latent.

For inpaint:
- **Load Image** + **Mask** + **VAE Encode (for Inpainting)** → routed through inpaint workflow.

## Workflow sharing

Each ComfyUI session can export the current workflow as JSON:
- Save Workflow → JSON file.
- Load Workflow → reproduces exactly.

Civitai workflows, Reddit posts, Discord shares — workflows traded heavily.

For: reuse community workflows; share your own.

## Custom Nodes

Community-built nodes for:
- Specific ControlNets.
- Animation (AnimateDiff).
- Upscaling.
- Face restoration (FaceFusion, ReActor).
- Specific model integrations (Flux, SD3).

Install via ComfyUI Manager (extension): browse + install with one click.

For: extending capabilities.

## ComfyUI Manager

Essential extension:
- Browse + install custom nodes.
- Update nodes.
- Install models from URLs.
- Search node library.

For: managing the growing ComfyUI ecosystem.

## Performance

ComfyUI optimizations:
- **Lazy execution.** Only re-run changed parts of graph.
- **VRAM-aware.** Handles low-VRAM gracefully.
- **Queue.** Stack generations.
- **Persistence.** Memory caching across runs.

For: efficient iteration; especially with complex workflows.

## Common workflows

**Standard text-to-image:**
- Load Model → Text → KSampler → VAE Decode → Save.

**Text-to-image + LoRA:**
- Load Model → Load LoRA → Text → KSampler → VAE Decode → Save.

**ControlNet + LoRA:**
- Load Model → Load LoRA → Load ControlNet → preprocessing → Apply ControlNet to conditioning → KSampler → VAE Decode → Save.

**Inpaint:**
- Load Image + Mask → VAE Encode (Inpaint) → KSampler → VAE Decode → Save.

**Upscale chain:**
- Generate base → Upscale node → optional second pass → final save.

For: each common task; build once + reuse.

## Visual debugging

In node graph:
- See data flow visibly.
- Preview intermediate outputs (Preview Image nodes).
- Identify which node fails (error highlights).
- Compare versions by branching graph.

For: understand + debug + iterate generation chain.

## Saving generation metadata

ComfyUI embeds the entire workflow in saved image's metadata:
- Open image in ComfyUI → load workflow.
- Reproduces exact generation.

For: never lose how an image was made.

## ComfyUI vs. A1111 / Forge

**A1111 / Forge.** UI-based; sliders + dropdowns. Easier for beginners. Mature ecosystem.

**ComfyUI.** Node-based. Steeper learning. More powerful for complex workflows.

**Stability Matrix.** Wrapper for managing both.

For 2026 pros: ComfyUI dominant. For beginners: A1111 / Forge often easier start.

## API integration

ComfyUI has an API:
- POST workflow JSON.
- Get generated image.
- Build apps on top.

For: building products / services on ComfyUI; automating generation.

## Mistakes to avoid

- **Spaghetti graphs.** Organize nodes visually.
- **No groups / labels.** Hard to navigate.
- **Saving without metadata.** Lose reproducibility.
- **Custom nodes from untrusted sources.** Security risk.
- **Forgetting to update ComfyUI / nodes.** Compatibility issues.

## Summary

- ComfyUI = node-based SD interface.
- Build workflows by wiring nodes; reproduce + share via JSON.
- Custom Nodes extend capabilities (AnimateDiff, upscalers, face restoration).
- ComfyUI Manager for ecosystem management.
- Standard for pro AI art workflows in 2026.

Next: A1111 + Forge alternatives.
