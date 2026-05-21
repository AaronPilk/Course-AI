---
module: 4
position: 4
title: "Combining LoRAs and style stacking"
objective: "Layer multiple LoRAs for complex generation."
estimated_minutes: 5
---

# Combining LoRAs and style stacking

## Multi-LoRA prompts

In a single generation:
```
<lora:my_character:0.8> <lora:my_style:0.6> <lora:fantasy_concept:0.5>
detailed prompt describing scene
```

Three LoRAs combined: character identity + style aesthetic + fantasy concept.

For: rich compositional control beyond single LoRA.

## Weight balancing

When stacking LoRAs:
- Their combined strength can over-amplify.
- Reduce individual weights when stacking (0.6-0.8 each vs. 1.0 each).
- Sum of weights matters more than individual values.

For: experiment per combination; find the balance.

## Common combinations

**Character + Style:**
- Character LoRA at 0.8.
- Style LoRA at 0.5-0.7.
- Result: character in that style.

**Subject + Lighting:**
- Subject LoRA.
- Lighting LoRA (e.g., dramatic chiaroscuro).
- Result: subject with specific lighting.

**Multiple characters:**
- Character A LoRA.
- Character B LoRA.
- Combined: both characters present.
- Risk: identity bleeding (faces blend).

For: prompt-controlled multi-character scenes.

## LoRA compatibility

Not all LoRAs work together:
- **Same base model.** SDXL LoRAs only on SDXL.
- **Style conflicts.** Two competing style LoRAs cancel out.
- **Quality variance.** Mixing poorly-trained LoRA with good degrades both.

For: test combinations; not all pair gracefully.

## Block weights / Layered LoRAs

Advanced: apply LoRA at different strengths to different model layers:
- Strong on style layers; weak on subject layers.
- Tools: Locon, LoCon, layer-specific weights.

For: fine control; rare in most workflows.

## Trigger conflicts

If multiple LoRAs share trigger words:
- Generation confused; merges concepts incorrectly.
- Rename trigger if you control the LoRA.

For: avoid trigger collisions.

## ControlNet + LoRA

Combine ControlNet (structure) + LoRA (identity / style):
- ControlNet pose → exact pose.
- LoRA character → specific character.
- Result: your character in that exact pose.

For: maximum control; pro-grade output.

## IP-Adapter + LoRA

Both contribute reference influence:
- IP-Adapter: image-based style.
- LoRA: trained-in style.
- Together: very strong style adherence.

For: precision style work; brand consistency.

## Embedding (Textual Inversion)

Different technique: trains an "embedding" (vector representing a concept):
- Tiny file (~10 KB).
- Invoked via trigger word.
- Less powerful than LoRA; faster to train.

For: simple concepts; lightweight customization.

## Hypernetworks (legacy)

Older technique; mostly replaced by LoRA. Skip for new work.

## SD 1.5 vs. SDXL vs. Flux LoRAs

LoRAs are model-family specific:
- SD 1.5 LoRA only works on SD 1.5 models.
- SDXL LoRA only on SDXL.
- Flux LoRA on Flux.

For: maintain separate LoRA collections per base model.

## Civitai community

Most LoRAs come from Civitai:
- Browse by concept.
- See sample outputs + recommended prompts.
- License varies; check before commercial use.

For: rich library without training.

## Curating personal LoRA library

Pro AI artists maintain organized LoRAs:
- **Folder by category.** Characters, styles, concepts.
- **Naming convention.** Include base model + trigger word.
- **Notes.** Recommended weights, recommended pairings, license.

For: 100+ LoRA library; navigate by need.

## Mistakes to avoid

- **Too many LoRAs at high weight.** Mess.
- **Same trigger word across LoRAs.** Conflicts.
- **Forgetting to match base model.** Won't work.
- **Trying every LoRA at 1.0.** Over-amplification.

## Summary

- Stack LoRAs for combined effects (character + style + concept).
- Reduce individual weights when stacking (0.6-0.8 each).
- ControlNet + LoRA + IP-Adapter for maximum control.
- LoRAs are base-model-specific.
- Curate personal library; organize by category + base model.

Module 5 next: ComfyUI + production workflows.
