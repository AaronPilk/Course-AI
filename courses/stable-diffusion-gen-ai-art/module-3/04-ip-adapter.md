---
module: 3
position: 4
title: "IP-Adapter and identity preservation"
objective: "Use image-based prompting for style + identity."
estimated_minutes: 5
---

# IP-Adapter and identity preservation

## What IP-Adapter is

IP-Adapter = Image Prompt Adapter. Lets you use an image as part of the prompt instead of (or alongside) text.

The image's features (style, content, identity) are encoded; the diffusion model treats them like additional prompt conditioning.

For:
- Style transfer from reference.
- Character / face consistency.
- Composition reference.
- "Looks like this image" prompting.

## Two variants

- **IP-Adapter (standard).** General style/content; works for any image.
- **IP-Adapter Face / FaceID.** Specialized for faces; preserves identity strongly.

For: face consistency, use Face variant. For style transfer, use standard.

## IP-Adapter strength

Like ControlNet, has strength parameter:
- **0.3-0.5.** Subtle reference influence; text prompt dominant.
- **0.7-0.9.** Strong reference; text refines.
- **1.0.** Maximum reference influence.

For: balance text prompt + reference image.

## IP-Adapter weight type

Different attention masks:
- **Linear.** Even influence across all attention layers.
- **Strong style** weight: only style layers; preserves more text freedom.
- **Style + composition** weight: matches both.

For: tuning specific aspects (style only vs. both style + composition).

## Common workflows

**Style transfer:**
- Text prompt: subject description.
- IP-Adapter: image with desired style.
- Generate: subject rendered in reference's style.

**Character consistency:**
- Text prompt: scene + pose description.
- IP-Adapter Face: character reference photo.
- Generate: same character in new scene.

**Mood matching:**
- Text prompt: scene description.
- IP-Adapter: mood reference image (lighting, atmosphere).
- Generate: scene with mood from reference.

## InstantID

Newer technology specifically for face identity:
- Single face photo → consistent character.
- Works at high quality.

For: stronger face identity than basic IP-Adapter Face.

## Multi-image IP-Adapter

Some workflows allow multiple reference images:
- Composition from one.
- Style from another.
- Mood from third.

For: complex aesthetic targeting.

## IP-Adapter vs. LoRA

- **IP-Adapter.** Zero training; ready immediately; per-image.
- **LoRA.** Requires training; reusable; stronger lock.

For one-off character / style: IP-Adapter.
For ongoing series / brand identity: LoRA (Module 4) + IP-Adapter combined.

## Ethical considerations

For faces:
- Always consent before using real people.
- Generated images of celebrities = potential legal / ethical issues.
- For commercial work: model release forms required.
- For personal / non-commercial: cautious; respect privacy.

For: responsible AI art practice.

## Mistakes to avoid

- **Too high IP-Adapter strength + complex text prompt.** Conflicts.
- **Face IP-Adapter without face in reference.** No identity to preserve.
- **Same approach for style + face.** Different IP-Adapter variants exist.
- **Real person without consent.** Ethical / legal risk.

## Summary

- IP-Adapter = image-as-prompt; encodes reference for generation.
- Standard for style; Face for identity.
- Strength + weight type tune influence.
- Combine with text prompt + LoRA + ControlNet for production control.
- InstantID for stronger face identity.
- Ethical practice: consent + responsible use.

Module 4 next: fine-tuning + customization.
