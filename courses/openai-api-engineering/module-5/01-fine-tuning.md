---
module: 5
position: 1
title: "Fine-tuning — when it actually helps (and when it doesn't)"
objective: "Decide whether your problem needs fine-tuning, prepare training data, and run a fine-tune end-to-end."
estimated_minutes: 13
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# Fine-tuning — when it actually helps (and when it doesn't)

## The puzzle

You've spent two weeks tuning the prompt. It works most of the time but it's:

- Too long (3,000 tokens of instructions and examples per call).
- Inconsistent in tone (your support voice keeps slipping into corporate-speak).
- Slow (the prompt size pushes TTFT up).

Someone suggests fine-tuning. "Just train it on our data." The implication is: cheaper, faster, more consistent.

Sometimes that's right. Often it isn't. Fine-tuning is a powerful tool, but it's the *fourth* lever to reach for, not the first. This lesson covers how to tell which problems need it and how to do it well when you do.

## The simple version

**Fine-tuning** takes a base model and continues training it on your examples. The result is a new model checkpoint that's been nudged toward the style, format, or behavior you want.

What it's good for:

- Locking in a consistent tone or style.
- Making outputs faithful to a narrow format or schema.
- Embedding domain-specific vocabulary the base model handles weakly.
- Replacing long few-shot prompts with shorter ones (a trained model "knows" the pattern).

What it's *not* good for:

- Teaching the model new facts (use RAG).
- Fixing reasoning failures (use a bigger or reasoning-tier model).
- Adding tool-use behavior (use function calling and prompting).
- Making the model fundamentally smarter.

A useful filter: if a smart human, given your system prompt, could do the task — fine-tuning can help. If the task requires knowledge or skills the base model lacks entirely — fine-tuning won't fix it.

## The technical version

### What fine-tuning actually does

The base model has weights tuned for a broad mix of tasks. Fine-tuning takes those weights as the starting point and runs more training steps on your data — usually supervised fine-tuning (SFT) on (prompt, completion) pairs, sometimes preference optimization on (prompt, better, worse) triples.

After training, the model:

- Produces outputs closer to your training examples in style, tone, and structure.
- Often does better at narrow tasks with shorter prompts.
- Can lose some general capability if you over-train or train on too narrow a distribution.

The base architecture is unchanged. You're not making it smarter — you're making it more *aligned* with your specific patterns.

### When fine-tuning is the right tool

Reach for fine-tuning when:

1. **Prompt-engineering has plateaued.** You've tried clear instructions, few-shot examples, and structured output, and the model is still inconsistent in ways that matter.
2. **You have ≥50–100 high-quality examples** of the exact behavior you want. A few thousand is better. Below 50 is usually not worth it.
3. **The behavior is narrow and stylistic.** Tone, format, structured output schemas, brand voice.
4. **You want shorter prompts at runtime.** A fine-tuned model that "knows" the system prompt by training can use a much shorter inference-time prompt — lower latency and cost per call.
5. **Cost or latency matter at scale.** Smaller fine-tuned models often beat larger general models on specific narrow tasks.

### When fine-tuning is the wrong tool

Don't fine-tune if:

1. **You're trying to teach facts.** Use RAG. Models forget facts in fine-tuning; they don't reliably memorize new ones.
2. **The task is broad reasoning.** Fine-tuning narrows the model; reasoning benefits from breadth.
3. **You have fewer than ~50 examples.** Not enough signal. Better prompting wins.
4. **The base model already does the task well.** Fine-tuning costs money and engineering time; only do it if there's a real gap to close.
5. **Requirements change weekly.** Fine-tuned models are static. If the behavior keeps shifting, you'll spend more retraining than you save.

### The fine-tuning workflow

Five steps:

**1. Define the success criterion.** Run an eval against the base model. Score it. This is the bar you need to clear after fine-tuning, plus the metric you'll watch.

**2. Collect and clean training data.** (prompt, ideal_response) pairs. Sources: hand-crafted examples, edited model outputs, human-labeled production data, synthetic data with human review.

**3. Format as JSONL.** OpenAI expects one example per line in the chat format:

```jsonl
{"messages": [{"role": "system", "content": "You are a brand-voice copy assistant."}, {"role": "user", "content": "Write a subject line for our spring sale."}, {"role": "assistant", "content": "Spring is here — and so are 30% off your favorites."}]}
{"messages": [{"role": "system", "content": "You are a brand-voice copy assistant."}, {"role": "user", "content": "Welcome email opener for new customers."}, {"role": "assistant", "content": "Hey there — welcome to the family. Glad you found us."}]}
```

**4. Upload and run the fine-tune.**

```js
// Upload training file
const file = await openai.files.create({
  file: fs.createReadStream("train.jsonl"),
  purpose: "fine-tune"
});

// Start fine-tune job
const job = await openai.fineTuning.jobs.create({
  training_file: file.id,
  model: "gpt-4.1-mini-2025-04-14",  // or current fine-tunable base
  hyperparameters: { n_epochs: 3 }   // optional — 3 is a reasonable default
});

console.log("Job:", job.id);

// Poll or wait for completion
const final = await openai.fineTuning.jobs.retrieve(job.id);
console.log("Fine-tuned model:", final.fine_tuned_model);
```

Training takes minutes to hours depending on data size.

**5. Evaluate the fine-tuned model.** Run the same eval. Compare scores. Look at outputs side-by-side. If it's worse, debug the data (often the cause). If it's better, ship it behind a feature flag and watch production metrics.

### Choosing the base model

Not every OpenAI model supports fine-tuning. Check the [fine-tuning model list](https://platform.openai.com/docs/guides/fine-tuning) for the current options. As of writing, OpenAI offers fine-tuning on selected GPT-4-family models, embedding models, and some specialized variants.

Rule of thumb:

- For style and format tasks → fine-tune a small/mini-tier model. Cheaper to train, cheaper to run, and these tasks don't need a heavyweight base.
- For domain-specific reasoning → consider fine-tuning a larger base. But first try RAG + prompting on the larger base; often you don't need to fine-tune at all.

### Data quality matters more than quantity

If you can have 200 great examples or 2,000 mediocre ones, take the 200. Quality patterns:

- **Consistent format.** Every assistant message follows the same structure.
- **Consistent voice.** Same tone across examples.
- **Diverse inputs.** Don't train on 50 versions of the same question.
- **Edge cases included.** Tricky cases the base model gets wrong.
- **Human-reviewed.** Bad examples teach bad behavior.

A common pattern: take 100 production outputs, have a human edit the half that aren't right, train on the corrected set. The model learns your house style by example.

### Hyperparameters

Most teams should accept defaults. The main knob:

- **`n_epochs`** — how many full passes over the training data. Default is fine; bump up if the model isn't learning the style, down if it's overfitting (good on train, bad on held-out).
- **`learning_rate_multiplier`** — usually leave alone. Higher = more aggressive update, more risk of forgetting general capability.
- **`batch_size`** — usually leave alone.

A small validation file (held-out examples) lets you check the model isn't overfitting. OpenAI's job report includes loss curves you can inspect.

### Cost and latency

Fine-tuning itself costs tokens. Roughly:

- Training: pay per training token (input + output tokens × epochs).
- Inference: fine-tuned model rate is slightly higher than base, but you can often use a smaller base after fine-tuning, netting cheaper inference.

Latency on a fine-tuned model is similar to its base. The big win is that **prompts get shorter** — the model already knows the system prompt, so you don't have to send the 2,000-token instruction block on every call. That's where real cost and latency savings come from.

### Distillation: a related pattern

Distillation is fine-tuning where the training data is produced *by a stronger model*. You use GPT-5 to generate ideal outputs, then fine-tune a smaller model on those outputs. The smaller model learns to imitate the bigger one's patterns on your specific task.

This is one of the best ways to get GPT-5-quality outputs at GPT-5-mini cost for narrow tasks. OpenAI's "Stored Completions" feature can simplify this — production traffic from a strong model gets logged and becomes training data for a smaller one.

### Common failure modes

- **The fine-tuned model gets worse, not better.** Almost always a data quality problem. Inspect a sample of training pairs.
- **Style is right but it hallucinates facts.** You trained it to sound right, not to know facts. Use RAG.
- **It works on training examples and fails on real users.** Distribution mismatch. Train on data that looks like real production inputs.
- **It overfits.** Sounds rote, repeats patterns mechanically. Reduce epochs or add training data diversity.
- **It loses general capability.** Trained on too narrow a distribution. Mix in some general examples or fine-tune less aggressively.

### When in doubt, prompt first

A useful exercise before fine-tuning: write the system prompt that would produce the behavior you want, using as many tokens as you need. If a long prompt on GPT-5 can do it, fine-tuning *can* compress that prompt into a smaller faster model. If the long prompt *can't* do it, fine-tuning probably won't either.

This is the right mental model: fine-tuning compresses what you can already do via prompting into a faster cheaper package. It doesn't unlock new capabilities the base model lacks.

## An analogy: training a new employee

You hire someone smart but new to your company. Day one, they need a long onboarding doc and constant references. With time, they internalize your style, your customers, your product — and they no longer need the doc. They just *get it*.

Prompting is the onboarding doc. Fine-tuning is the internalization. Both are useful; both have their place.

But fine-tuning isn't *teaching them new things*. A new employee who doesn't know calculus won't learn calculus by working at your company. If your task requires knowledge or skills the base model lacks, fine-tuning won't add them. It just polishes what's already there.

## Three real-world scenarios

**Scenario 1: The brand voice that finally locked in.**
A SaaS company had a 2,500-token prompt enforcing brand voice. Outputs still drifted half the time. They collected 300 examples of on-voice copy, fine-tuned a mini-tier model, and got both more consistency and a 5× shorter prompt at inference time. Cost dropped, latency dropped, brand drift dropped.

**Scenario 2: The team that tried to fine-tune for facts.**
A team had a customer support bot that didn't know product details. They tried fine-tuning on a corpus of product docs. The bot kept hallucinating — the docs were in training data but the model "knew" them in a fuzzy, unreliable way. They abandoned fine-tuning and built RAG over the same docs. Hallucinations dropped 90%. Lesson: fine-tuning is for behavior, not facts.

**Scenario 3: The distillation that saved $20K/month.**
A team had GPT-5 generating product descriptions, ~$30K/month. They logged 5,000 production outputs (already reviewed/approved by editors), fine-tuned a mini-tier model on those examples, and verified the eval pass rate held. Inference cost dropped from $30K to $5K. The smaller fine-tuned model produced output indistinguishable from the original for their use case.

## Common mistakes to avoid

- **Fine-tuning before exhausting prompting.** Cheap to test prompts; expensive to train and maintain a fine-tune.
- **Fine-tuning on garbage data.** Mediocre training pairs teach mediocre behavior.
- **Trying to teach facts via fine-tuning.** Use RAG.
- **Not running evals before and after.** No way to know if it helped.
- **Forgetting the model is now static.** New product features need re-training or careful prompting on top.
- **Skipping a held-out validation set.** Can't detect overfitting.

## Read more

- [Fine-tuning guide](https://platform.openai.com/docs/guides/fine-tuning)
- [Distillation guide](https://platform.openai.com/docs/guides/distillation)
- [Model selection guide](https://platform.openai.com/docs/guides/model-selection)

## Summary

- **Fine-tuning** continues training a base model on your examples to align it with your specific style, format, or narrow task behavior.
- It's for **behavior, tone, and format** — not for teaching facts (use RAG), reasoning capability (use a stronger base), or tool use (use prompting + function calling).
- Need **≥50–100 high-quality examples** to be worth it. Quality beats quantity.
- Workflow: define success → collect data → format JSONL → run job → evaluate against base.
- **Distillation** — train a small model on outputs from a stronger model — is a powerful cost-reduction pattern for narrow tasks.
- Defaults for hyperparameters are usually fine; main knobs are `n_epochs` and (rarely) `learning_rate_multiplier`.
- **Always run evals before and after.** No eval, no proof.
- The big inference-time win is **shorter prompts** — the model has the system prompt baked in.

Next: reasoning models and the new "think first" paradigm.
