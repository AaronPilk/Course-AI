---
module: 2
position: 1
title: "Prompt structure — subject, style, modifiers"
objective: "Write prompts that produce intended results."
estimated_minutes: 5
---

# Prompt structure — subject, style, modifiers

## The prompt formula

A solid prompt has structure:
1. **Subject.** Who / what is in the image.
2. **Context.** Where they are; what's happening.
3. **Style.** Photographic / illustration / specific artist.
4. **Modifiers.** Quality, lighting, composition.
5. **Technical.** Camera, lens, settings.

Stacking these gives the model rich guidance.

## Example evolution

Bad: "girl"
- Generic; gets default unattractive girl.

Better: "young woman in a coffee shop"
- Specific subject + context.

Better still: "young woman, late 20s, sitting in a cozy coffee shop, looking out the window thoughtfully, soft window light, shallow depth of field, photorealistic, professional photography, 50mm portrait lens"
- Subject + context + emotion + lighting + style + technical.

The progression: more specific = more controlled output.

## Subject specificity

For people:
- Age (young, middle-aged, elderly).
- Gender / ethnicity (be intentional).
- Hair (color, length, style).
- Clothing (specific items, colors).
- Pose / action.
- Expression / emotion.

For objects:
- Material (wood, metal, plastic).
- Color.
- Wear / age.
- Surface (matte, glossy).

The more specific, the more the model has to work with.

## Context

Where + when:
- Location (indoor / outdoor; specific place).
- Time of day (sunrise, golden hour, midnight).
- Weather (rain, snow, fog).
- Season (autumn leaves, winter snow).
- Atmosphere (foggy, dusty, smoky).

For: setting the scene.

## Style descriptors

For specific aesthetics:
- **"Photorealistic, photography"** for photo look.
- **"Oil painting, impressionist style"** for art.
- **"Digital art, concept art"** for game art.
- **"Anime, Studio Ghibli style"** for animation.
- **"Cinematic, film still"** for film aesthetic.
- **"3D render, octane render"** for 3D look.

Style heavily shapes output.

## Artist references

Some models trained on artist names:
- "by [artist name]" can invoke their style.
- Effectiveness varies by model (some artists trained heavily).

Controversial; some artists object. Many models now filter out specific artist names.

For ethics: use general style descriptors over named artists.

## Lighting

For mood + atmosphere:
- "Soft natural lighting."
- "Dramatic chiaroscuro lighting."
- "Golden hour, warm sunlight."
- "Blue hour, cool dusk light."
- "Cinematic lighting."
- "Studio lighting, three-point setup."
- "Backlit, rim lighting."
- "Volumetric lighting."

Lighting descriptors substantially affect output.

## Composition

For framing:
- "Wide shot."
- "Close-up portrait."
- "Over-the-shoulder shot."
- "Top-down view."
- "Low angle, dramatic perspective."
- "Symmetrical composition."
- "Rule of thirds composition."

For specific framing intent.

## Camera + lens

For photo realism:
- "50mm portrait lens."
- "85mm telephoto."
- "24mm wide angle."
- "Macro lens, extreme close-up."
- "Shot on Sony A7 IV."
- "Shot on RED camera."
- "Film grain, Kodak Portra 400."

For: specific photographic feel.

## Quality boosters

Common modifiers:
- "Highly detailed."
- "Masterpiece, best quality, 4K."
- "Photorealistic, hyperrealistic."
- "Award-winning photography."
- "Trending on ArtStation."

Effectiveness varies; some are placebo. The model isn't "trying harder" with "masterpiece"; it's just associated with high-quality training images.

For SDXL: moderate quality boosters. For Flux: less effective; describe scene specifically.

## Avoiding bad outputs

Beyond positive prompts, use negative prompts (next lesson) to exclude:
- "ugly, deformed, bad anatomy, watermark, text, blurry, oversaturated."

Common SD/SDXL pattern.

For Flux: negative prompts less impactful (different architecture).

## Subject-first or style-first?

Generally:
- **Subject early.** First tokens have more weight in CLIP-based models.
- **Style + modifiers later.** Refine the subject.

For SDXL: subject first → context → style → modifiers.

For Flux T5: more natural language; less position-sensitive.

## Prompt portability

Prompts that work great on one model may flop on another:
- SD 1.5 prompts often heavy with quality boosters + artist names.
- SDXL prompts more natural.
- Flux prompts: full descriptive sentences.

Test + adapt per model.

## Save your prompts

Use prompt management:
- Save successful prompts to a library.
- Annotate why they worked.
- Reuse + iterate.

Tools: text files, Notion, dedicated prompt managers (PromptHero, Prompt Manager extensions).

## Mistakes to avoid

- **Vague prompts.** "Cool picture" → generic.
- **Over-stuffing keywords.** 200 token prompts often worse than 50.
- **Wrong style for model.** Photorealistic prompt on anime model = ugly.
- **No negative prompt for SD/SDXL.** Extra artifacts.
- **Copying prompts blindly.** Adapt to your model.

## Summary

- Prompt structure: subject + context + style + modifiers + technical.
- Specificity drives quality; vague → generic.
- Lighting, composition, camera details shape mood.
- Style descriptors (photographic / illustration / anime).
- Quality boosters effectiveness varies; describe scene over relying on them.
- Subject-first for CLIP models (SD/SDXL); natural language for Flux T5.

Next: negative prompts.
