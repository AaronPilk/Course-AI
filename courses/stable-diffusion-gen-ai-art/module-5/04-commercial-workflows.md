---
module: 5
position: 4
title: "Commercial workflows — concept art, product, film"
objective: "Apply Stable Diffusion to professional production needs."
estimated_minutes: 5
---

# Commercial workflows — concept art, product, film

## Concept art for games / film

Workflow:
1. **Mood / reference research.** Pinterest, art books, films.
2. **Initial sketches / blockouts.** Hand draw or 3D block.
3. **Img2img + ControlNet.** Convert sketch to rendered concept.
4. **Iterate.** Generate 10-20 variations; pick directions.
5. **Inpaint refinements.** Specific area improvements.
6. **Hand-paint over.** Photoshop / Procreate for final polish.

Result: faster concept generation than pure manual; final has human craft.

## Hero illustration

For book covers, posters, key art:
1. **Composition planning.** Sketch / wireframe.
2. **Generate base.** SDXL or Flux with detailed prompt.
3. **Iterate seeds.** Find good composition.
4. **Inpaint problems.** Face / hands / specific elements.
5. **Upscale.** 4K-8K via Ultimate SD Upscale or Magnific.
6. **Post-process.** Photoshop color grade + final polish.

Result: professional illustration; AI-augmented but craft-polished.

## Product photography

For e-commerce:
1. **Studio reference.** Existing product photos.
2. **IP-Adapter + product image.** Encode product features.
3. **Or ControlNet + product depth/edge.** Preserve product shape.
4. **Generate variants.** Different backgrounds, lighting, contexts.
5. **Composite for accuracy.** Real product photo as base + AI background.

Critical: product itself must be accurate. AI may "creatively interpret" your product unless heavily constrained.

For pure product accuracy: photograph product, AI generates background.

## Marketing imagery

For ads, social, web:
1. **Brand reference.** Style guide, color palette, mood.
2. **Style LoRA** (trained on brand aesthetic) + Style IP-Adapter.
3. **Generate batch.** 20-100 candidates.
4. **Curate.** Pick 5-10 best.
5. **Polish.** Inpaint + upscale + post-process.

For: scaled marketing content production.

## Storyboards / pre-vis

For film:
1. **Story beats.** Identify key moments.
2. **Generate frames.** Each moment as concept image.
3. **Style consistency.** Same LoRA + ControlNet across frames.
4. **Use as reference.** Director / cinematographer plans shots.

For: pre-production storyboarding; explore looks before expensive shoots.

## Character design

For games / animation:
1. **Initial sketches.** Block out character.
2. **AI render variations.** ControlNet pose + style LoRAs.
3. **Iterate features.** Inpaint + adjust.
4. **Turnarounds.** Multiple angles via ControlNet depth + same seed.
5. **Final character sheet.** Compile angles + variations + expressions.

For: rapid character design exploration.

## Music videos / clips

For: AI-generated frames for video:
1. **Storyboard.** Plan frames.
2. **AnimateDiff / SVD / Runway / Luma.** Video diffusion models.
3. **ControlNet pose / depth for frame consistency.**
4. **Post-process.** Compile in Premiere / DaVinci Resolve.

For: AI-generated music videos; experimental video art.

## Stock photography alternative

For licensing free of stock photo costs:
- Generate images for blog posts, presentations, etc.
- Verify commercial license of model + LoRAs.
- Avoid generating recognizable real people.

For: blog imagery; presentation visuals; web content.

## Architectural visualization

For client renders:
1. **3D model in SketchUp / Blender.**
2. **Quick render.**
3. **Img2img + ControlNet** for photoreal pass.
4. **Iterate** different lighting / weather / time of day.
5. **Final polish + post.**

Faster than full pro renders for early concept presentation.

## Commercial licensing

Critical checks:
- **Base model license.** SDXL (OpenRAIL-M, commercial OK), Flux Schnell (Apache 2.0), Flux Dev (paid commercial license).
- **LoRA license.** Per-creator; some Apache 2.0, some restrict commercial.
- **Reference image rights.** If using img2img with copyrighted reference: legal risk.
- **Training data** of base model: ongoing legal questions; varies by model.

For commercial work: document tools used; verify licenses; consider Adobe Firefly (commercial-safe but lower-quality alternative).

## Pricing AI work

How AI artists price:
- **Per image.** $50-500+ depending on complexity + use.
- **Per project.** Larger commercial gigs.
- **Hourly.** For ongoing client work.
- **Retainer.** Monthly arrangements.

Rates similar to traditional digital art; AI tool doesn't lower price drastically.

For: client work, value the craft + outcome; not the speed.

## Client workflow

For client projects:
1. **Brief + mood board.**
2. **Initial concept batch.** 5-10 directions.
3. **Client picks direction.**
4. **Refine + iterate.**
5. **Final polish.**
6. **Deliver.**

Same as traditional creative work; AI accelerates production.

## Disclosing AI use

For ethics + client trust:
- Disclose AI use where requested.
- Don't claim AI work as traditional.
- Many clients OK with AI; some prefer pure human; respect preferences.

For: transparent commercial practice.

## Mistakes to avoid

- **Selling commercial work made with non-commercial models.** Legal issue.
- **No disclosure when client asked.** Trust broken.
- **Treating AI output as final.** Most needs human polish.
- **Underpricing.** AI speed doesn't make work less valuable.
- **Ignoring style consistency.** Client expects coherent body of work.

## Summary

- AI generation accelerates concept art, illustration, product viz, marketing, storyboards, character design, archviz.
- Combine: ControlNet (structure) + LoRA (identity) + IP-Adapter (style) + post-process for production quality.
- Commercial licensing verification mandatory.
- Pricing similar to traditional digital art.
- Disclose AI use when relevant; respect client preferences.
- Most pro output is AI-generated + human-polished hybrid.

## Course complete

You've covered Stable Diffusion + generative AI image gen end-to-end: how diffusion models work; prompting; ControlNet + guided generation; fine-tuning via LoRA + Dreambooth; production workflows in ComfyUI; commercial application. The ecosystem evolves rapidly (Flux took over from SDXL within 2 years; new models monthly); fundamentals stay constant — composition, lighting, intentional generation, iterative refinement.

Next steps:
1. Pick a project. Personal art, portfolio piece, or commercial test.
2. Apply the full stack: prompt → ControlNet → LoRA → ComfyUI workflow → upscale + polish.
3. Build your asset library: prompts, LoRAs, ComfyUI workflows, reference images.
4. Engage community: Civitai, Reddit r/StableDiffusion, Discord servers, ArtStation AI category.
5. If commercial: study licensing carefully; document workflow per project.

Stable Diffusion + the open ecosystem has democratized image generation — what required studio teams 5 years ago is achievable by individuals now. The technology continues advancing; staying current means following Black Forest Labs, Stability AI, and the community releases monthly. The craft of using these tools well — composition, lighting, intent, iteration — is what separates skilled AI artists from prompt typers. Welcome to generative AI art.
