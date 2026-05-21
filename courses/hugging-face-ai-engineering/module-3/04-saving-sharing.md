---
module: 3
position: 4
title: "Saving + sharing your fine-tunes"
objective: "Deploy + distribute trained models."
estimated_minutes: 5
---

# Saving + sharing your fine-tunes

## Saving models

```python
# Standard save
model.save_pretrained("./my-model")
tokenizer.save_pretrained("./my-model")

# For LoRA only adapter
peft_model.save_pretrained("./my-lora")  # Just adapter

# Merged (LoRA into base)
merged = peft_model.merge_and_unload()
merged.save_pretrained("./my-merged-model")
```

For: distribution flexibility.

## Push to Hub

```python
from huggingface_hub import login
login()  # Or use HF_TOKEN env var

# Push model
model.push_to_hub("my-username/my-model")
tokenizer.push_to_hub("my-username/my-model")

# Or via Trainer
trainer.push_to_hub("my-username/my-model")
```

For: share via HF Hub.

## Model cards (write yours)

Every shared model should have a model card. README.md in repo:

```markdown
---
license: apache-2.0
language: en
tags:
- text-generation
- llama
- fine-tuned
base_model: meta-llama/Llama-3.1-8B
---

# My Fine-Tuned Llama

## Description
Fine-tuned for legal Q&A.

## Training Data
[Describe data]

## Usage
```python
from transformers import AutoModelForCausalLM
model = AutoModelForCausalLM.from_pretrained("my-username/my-model")
```

## Limitations
[Be transparent]
```

For: enable others to use your model responsibly.

## Repository structure

A complete model repo:
- config.json
- model.safetensors (weights)
- tokenizer files
- README.md (model card)
- training_args.bin (training config)
- (LoRA: adapter_config.json, adapter_model.safetensors)

## Versioning

Hub uses Git. Tag releases:

```python
api = HfApi()
api.create_tag("my-username/my-model", tag="v1.0", revision="main")
```

For: pinned versions; reproducibility.

## Private repos

Pro / Enterprise tier:
```python
model.push_to_hub("my-username/my-model", private=True)
```

For: not-yet-public models; internal sharing.

## Organizations

Create / join orgs:
- Group repos under organization.
- Permissions management.
- Pro features.

For: team work.

## Spaces (deployment)

Deploy your model as web app:
1. Create Space (Gradio / Streamlit template).
2. Load your model.
3. Push code to Space repo.
4. Auto-deploys.

For: shareable demo with your model.

## Inference Endpoints

For production API:
1. Go to model page.
2. "Deploy" → Inference Endpoints.
3. Choose hardware + autoscaling.
4. Pay hourly; production API.

For: scalable hosting.

## Discoverability

To get your model used:
- Comprehensive model card.
- Tags (task, library, language).
- Examples in README.
- License clarity.
- Sample outputs.
- Spaces using it (demos).

For: community adoption.

## Citation

Add citation to model card:

```markdown
## Citation
@software{your_model_2026,
  author = {Your Name},
  title = {Your Model},
  year = {2026},
  url = {https://huggingface.co/my-username/my-model}
}
```

For: academic / research use; proper attribution.

## License selection

For sharing:
- **Apache 2.0.** Permissive; most adoption.
- **MIT.** Permissive.
- **CC-BY-SA.** Attribution + share-alike.
- **OpenRAIL-M.** Open + responsible.
- **Custom.** Non-commercial / specific use restrictions.

Pick based on intent. Apache 2.0 / MIT for maximum adoption.

## Mistakes to avoid

- **No model card.** Nobody uses.
- **No license.** Legal ambiguity.
- **Massive file sizes when LoRA adapter sufficient.** Wastes storage.
- **No examples / quickstart.** Friction for users.
- **Private when meant public.** Settings check.

## Summary

- save_pretrained + tokenizer.save_pretrained for local saves.
- push_to_hub to share via HF Hub.
- Model card (README.md) documents your model.
- Choose license: Apache / MIT for maximum adoption.
- Deploy via Spaces (demo) or Inference Endpoints (production API).
- Versioning via Git tags.

Module 4 next: Spaces and deployment.
