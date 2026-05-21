---
module: 4
position: 3
title: "Dataset preparation and tagging"
objective: "Build training datasets that produce great LoRAs / fine-tunes."
estimated_minutes: 5
---

# Dataset preparation and tagging

## The data matters most

Dataset quality > training parameters. A great dataset + average training settings = great LoRA. A bad dataset + perfect training = bad LoRA.

For: invest time in dataset prep.

## Character LoRA dataset

For a character (real person, fictional, OC):
- **15-30 images.** Sweet spot.
- **Varied poses.** Standing, sitting, action, gesture.
- **Varied angles.** Front, side, 3/4, back.
- **Varied lighting.** Sunny, indoor, dramatic, soft.
- **Varied expressions.** Neutral, happy, angry, surprised.
- **Varied outfits.** If character has multiple looks; or consistent if always same.
- **Varied backgrounds.** Different scenes (or clean crop if you want pure character).

For: generalizable character that adapts to new prompts.

## Style LoRA dataset

For an aesthetic / artistic style:
- **20-50 images.** More needed.
- **Varied subjects.** Portraits, landscapes, objects, abstract — all in the style.
- **Consistent style.** Critical; cherry-pick.
- **Quality images.** No low-res, JPEG artifacts.

For: model learns the style across subjects.

## Image quality

Each training image:
- **High resolution.** 1024+ (will resize to training resolution).
- **Sharp.** No motion blur or out-of-focus.
- **Clean.** No watermarks, no overlay text.
- **Good lighting.** Not blown out / crushed.
- **Properly cropped.** Subject visible; not weird crops.

For: model trains on quality features.

## Image preprocessing

Before training:
1. **Resize.** To training resolution (1024x1024 typical for SDXL).
2. **Crop / pad.** Square or specific aspect ratio.
3. **Remove duplicates.** Avoid bias.
4. **Remove low-quality.** Filter aggressively.

Tools: BIRME (web), ImageMagick scripts, Kohya's preprocessing.

## Captioning

Each image needs a caption (text description):
- "a photo of [trigger_word] standing in a forest, wearing red jacket, sunny day, looking at camera."

Components:
- Trigger word (your unique identifier).
- Description of subject.
- Description of pose / action.
- Description of clothing / props.
- Description of environment.
- Description of lighting.

For: training-time conditioning.

## Auto-captioning tools

- **BLIP-2.** General purpose captioning.
- **CogVLM.** High-quality captions.
- **WD14 Tagger.** Anime-style booru tags.
- **Florence-2.** Microsoft's tagger.
- **Gemini / GPT-4V.** Via API; very good descriptions.

Workflow: auto-caption → manual edit → add trigger word.

## Caption editing

After auto-captioning:
- Add trigger word at beginning.
- Remove inaccurate descriptions.
- Add missing details.
- Standardize phrasing.

For: ensuring captions describe images accurately + use consistent trigger.

## What to caption / not caption

**Caption** (the model learns to vary):
- Pose / action.
- Clothing.
- Background.
- Lighting.
- Expression.

**Don't caption** (these become "always with this concept"):
- Things you always want associated with the trigger.

Example: if your character always has blue hair, don't caption "blue hair" — model assumes blue hair is part of character.

Counterintuitive but powerful: what you DON'T caption gets baked in.

## Tagging strategies

Two schools:
- **Detailed.** Describe everything; model learns to vary.
- **Sparse.** Caption only trigger + minimal context; baked-in features.

For style LoRAs: sparse often works (just trigger + minimal style indicator).
For character LoRAs: detailed (so character adapts to new contexts).

## Booru-style tagging

For anime models: comma-separated booru tags:
- `mychar, 1girl, blue hair, red dress, smile, standing, outdoor`.

For realistic: natural-language captions:
- `A photo of mychar, a young woman with blue hair, wearing a red dress, smiling, standing outdoors.`

Match style to your target model.

## Dataset balance

Even distribution:
- Not all photos of same pose / angle.
- Not all close-ups (also need full body, mid-shot).
- Not all same lighting.

For: avoid overfitting to specific pose / angle.

## Augmentation

Some training pipelines include automatic augmentation:
- Horizontal flip.
- Slight crop.
- Color jitter.

Mostly automatic; sometimes configurable.

For: effectively larger dataset; better generalization.

## Dataset workflow

1. Collect 20-50 images.
2. Filter for quality.
3. Preprocess (resize / crop).
4. Auto-caption.
5. Edit captions; add trigger.
6. Train.
7. Test outputs.
8. If poor: iterate dataset (add / remove / re-caption).

For: high-quality LoRA, expect 2-3 iteration cycles.

## Common mistakes

- **All same pose.** Model can only render character standing facing camera.
- **Mix of identifiable people.** Mixed identity LoRA.
- **Low-quality images.** Model learns artifacts.
- **Inconsistent captions.** Model confused about what's important.
- **No trigger word.** No way to invoke specifically.

## Summary

- Dataset quality > training parameters.
- 15-30 images for character; 20-50 for style.
- Varied poses, angles, lighting, expressions.
- Caption each image; auto-caption then edit.
- Don't caption "always present" features (they get baked in).
- Iterate; expect 2-3 dataset revisions per LoRA.

Next: combining LoRAs.
