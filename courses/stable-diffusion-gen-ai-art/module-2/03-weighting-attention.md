---
module: 2
position: 3
title: "Weighting, regional prompting, attention"
objective: "Control which prompt elements get emphasized."
estimated_minutes: 5
---

# Weighting, regional prompting, attention

## Token weighting

Standard syntax for adjusting prompt influence per token:

**A1111 / Forge / ComfyUI syntax:**
- `(token)` = 1.1x.
- `((token))` = 1.21x.
- `(((token)))` = 1.33x.
- `(token:1.4)` = 1.4x (precise).
- `[token]` = 0.91x (de-emphasis).
- `[[token]]` = 0.83x.

For: emphasizing key concepts; de-emphasizing unwanted.

## Practical weighting

Examples:
- `(red dress:1.3)` to ensure the model produces a clearly red dress.
- `[background:0.7]` to make background less prominent.
- `((perfect anatomy))` to push toward correct anatomy.

For: pushing the model toward important elements when default isn't strong enough.

## Don't over-weight

Excessive weights (1.6+) often produce:
- Distortion.
- Burning / saturation.
- Mangled features.

Sweet spot: 1.1 - 1.4 per token. Higher rarely helps.

For: subtle nudges; not heavy hammers.

## Prompt scheduling

Some UIs support prompts that change over diffusion steps:
- `[red dress:blue dress:0.5]` = red dress for first 50% of steps, blue dress for last 50%.
- Result: hybrid; transitions between concepts.

For: controlled blending; concept morphing.

## Regional prompting (advanced)

For different regions of the image to have different prompts:
- ComfyUI: Regional Prompter nodes.
- A1111: Regional Prompter extension.
- Define masks; assign prompts to each region.

Example: portrait left side, landscape right side; or character A in top-left, character B in bottom-right.

For: composite images; multi-subject control.

## Attention masking

For surgical control:
- Mask paint specific areas where a concept should apply.
- Generate with attention focused on masked region.

Tools: ComfyUI nodes; Forge regional prompter; img2img with masks.

For: making the model focus on parts of the image.

## BREAK keyword (A1111)

For separating prompt sections:
- `red car BREAK blue sky`.
- Model treats them as separate attention contexts; less bleeding between concepts.

For: multi-subject prompts where concepts shouldn't mix (red car shouldn't be blue).

## Concept bleeding

A common SD problem:
- Prompt: "red apple on a green table."
- Result: green apple on a red table (concept bleeding).

Fixes:
- BREAK keyword.
- Regional prompting.
- Token weighting on specific colors.
- ControlNet for object placement.

For multi-concept prompts: structure carefully.

## Color binding

Specifying which object gets which color is hard:
- "Woman with blue hair and red dress" — model might color blend.
- Strong colors + specific bindings sometimes work.
- Heavy weights help: `(blue hair:1.3) (red dress:1.3)`.

For complex color schemes: ControlNet + reference images often more reliable.

## Style transfer via weight

For style + subject mixing:
- `portrait (oil painting style:1.2)`.
- `building (concept art:0.8)` to make it less dominant.

For: tonally appropriate style amounts.

## Order matters

CLIP-based models weight early tokens more:
- "Beautiful woman" → emphasis on beauty.
- "Woman, beautiful" → emphasis on woman.

For: lead with most important concept.

## Iteration vs. weighting

Sometimes the answer isn't more weight; it's:
- Different word ("crimson" vs. "red").
- Different specificity.
- Different position.

For: try alternatives before cranking weights.

## Flux differences

Flux uses T5 encoder which handles natural language directly:
- Less need for keyword weighting.
- Describe in prose: "A woman with vivid blue hair and a flowing red dress."
- T5 understands semantic relationships.

For Flux: write descriptive sentences over keyword stacks + weights.

## Mistakes to avoid

- **Over-weighting.** 1.8x = mess.
- **Conflicting weights.** Multiple 1.5x's that conflict.
- **Weighting subject down.** Reduces what you want.
- **Weighting everything equally.** No structure.
- **Heavy SDXL weighting on Flux.** Doesn't translate.

## Summary

- Weighting syntax: (token), (token:1.4), [token], [token:0.8].
- 1.1-1.4 range typical; higher distorts.
- BREAK keyword for separating concepts in A1111.
- Regional prompting / attention masking for multi-zone control.
- Order matters; early tokens have more weight.
- Flux uses natural language; less keyword weighting.

Next: style libraries.
