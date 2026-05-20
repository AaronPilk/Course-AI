---
module: 4
position: 4
title: "Workers AI"
objective: "Run models at the edge."
estimated_minutes: 6
---

# Workers AI

## What Workers AI is

Cloudflare Workers AI runs ML models on Cloudflare's GPU network — accessible to Workers via a simple binding. Pay per inference, no model hosting, no GPU provisioning.

Useful for:

- LLM completions (open-weight models — Llama, Mistral, Qwen).
- Text embeddings.
- Image generation (Stable Diffusion, Flux).
- Speech-to-text (Whisper).
- Object detection.
- Translation.

## Setup

```toml
# wrangler.toml
[ai]
binding = "AI"
```

```ts
type Env = { AI: Ai };

async fetch(request: Request, env: Env) {
  const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is the capital of France?' },
    ],
  });
  
  return Response.json(response);
}
```

That's a complete LLM-backed Worker. No API keys; no SDK config; just bindings.

## Available models

Cloudflare hosts dozens of models. Common ones:

**LLMs:**
- `@cf/meta/llama-3.1-8b-instruct` — fast, capable.
- `@cf/meta/llama-3.1-70b-instruct` — larger, slower, more capable.
- `@cf/mistralai/mistral-7b-instruct-v0.2` — Mistral.
- `@cf/qwen/qwen1.5-14b-chat` — Qwen.

**Embeddings:**
- `@cf/baai/bge-base-en-v1.5` — fast English embeddings (768 dims).
- `@cf/baai/bge-large-en-v1.5` — larger, more accurate.

**Image generation:**
- `@cf/black-forest-labs/flux-1-schnell` — Flux fast variant.
- `@cf/lykon/dreamshaper-8-lcm` — Stable Diffusion variant.

**Speech-to-text:**
- `@cf/openai/whisper` — multilingual transcription.

**Vision / multimodal:**
- `@cf/llava-hf/llava-1.5-7b-hf` — image understanding.

Model catalog grows continuously; check current Cloudflare docs for the latest list.

## Streaming responses

For LLM responses, streaming is essential:

```ts
async fetch(request: Request, env: Env) {
  const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: 'Tell a long story' }],
    stream: true,
  });
  
  return new Response(response, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

`stream: true` returns a `ReadableStream`. Pipe to the Response — clients see tokens appear progressively.

For client-side consumption:

```ts
const sse = new EventSource('/api/chat?prompt=hello');
sse.onmessage = (event) => {
  const data = JSON.parse(event.data);
  appendToken(data.response);
};
```

## Embeddings

For RAG (retrieval-augmented generation):

```ts
async function embed(text: string, env: Env): Promise<number[]> {
  const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text });
  return response.data[0];
}

async function search(query: string, env: Env) {
  const queryEmbedding = await embed(query, env);
  // Use Vectorize or pgvector to find nearest matches:
  const results = await env.VECTORIZE.query(queryEmbedding, { topK: 5 });
  return results;
}
```

Cloudflare Vectorize is a vector database; bind like other primitives; queries are sub-ms at edge.

## Image generation

```ts
async fetch(request: Request, env: Env) {
  const { prompt } = await request.json();
  
  const image = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
    prompt,
    steps: 4,  // Flux schnell is fast; few steps
  });
  
  // image is binary PNG data
  return new Response(image, {
    headers: { 'Content-Type': 'image/png' },
  });
}
```

Image generation is more expensive than text (seconds, not milliseconds). For user-facing flows, return early with a job ID; process via queue; deliver via webhook or polling.

## Speech transcription

```ts
async fetch(request: Request, env: Env) {
  const audioBuffer = await request.arrayBuffer();
  
  const transcription = await env.AI.run('@cf/openai/whisper', {
    audio: [...new Uint8Array(audioBuffer)],
  });
  
  return Response.json({ text: transcription.text });
}
```

Whisper transcribes audio to text. Costs scale with audio length.

## Pricing

Workers AI prices per neuron — Cloudflare's compute unit normalizing across models:

- Free tier: 10k neurons/day (light usage).
- Paid: $0.011 per 1k neurons.

Approximate costs:
- Small LLM (8B) response: a few cents per million tokens.
- Embeddings: extremely cheap, sub-cent per 1k.
- Image generation: $0.005-0.05 per image depending on model/steps.

Compared to OpenAI/Anthropic APIs: Workers AI is often 2-10x cheaper for equivalent open-weight model use; the catch is you're limited to the models Cloudflare hosts (no GPT-4, no Claude — but open-source alternatives are catching up).

## Comparing to OpenAI / Anthropic

**Workers AI:**
- Open-weight models (Llama, Mistral, Qwen).
- Cheaper.
- Bindings, no key management.
- Edge runtime (low latency).
- Smaller catalog.

**OpenAI / Anthropic from Workers:**
- GPT-4, Claude, etc. — strongest closed models.
- More expensive.
- Need API key (use Wrangler secrets).
- Latency depends on provider region.

For most apps: use Workers AI for things that fit (chat, classification, embeddings, simple gen) and OpenAI/Anthropic for the hardest tasks (complex reasoning, agents). Mix as needed.

## AI Gateway

Cloudflare AI Gateway sits in front of any AI provider (OpenAI, Anthropic, Workers AI, etc.) and adds:

- Logging and analytics.
- Rate limiting.
- Caching identical requests.
- Cost tracking.
- Fallback (try Provider A; if fails, try Provider B).

```ts
// Through AI Gateway:
const response = await fetch('https://gateway.ai.cloudflare.com/v1/<account>/<gateway>/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ /* OpenAI format */ }),
});
```

AI Gateway is free (in early stages) for the routing and observability. Useful for multi-provider apps.

## Vectorize

Cloudflare's native vector database:

```toml
[[vectorize]]
binding = "VECTORS"
index_name = "documents"
```

```ts
// Insert:
await env.VECTORS.upsert([
  { id: 'doc-1', values: [0.1, 0.2, ...], metadata: { title: 'Doc 1' } },
]);

// Query:
const results = await env.VECTORS.query([0.1, 0.2, ...], {
  topK: 5,
  returnMetadata: true,
});
```

Pair with Workers AI embeddings for end-to-end RAG within Cloudflare:

```
Worker → Workers AI (embed query) → Vectorize (find matches) → Workers AI (LLM with context) → response
```

All in one infrastructure; minimal latency; bindings throughout.

## Use cases

**Chat interfaces.** LLM via Workers AI; conversation state in DO or KV.

**Search.** Embeddings + Vectorize for semantic search.

**Moderation.** Classify text/images for safety before user content goes live.

**Summarization.** Long doc → LLM summary → stored back to D1.

**Image generation.** User prompt → image → R2 storage.

**Translation.** Workers AI translation models for multi-lingual UI.

## Mistakes to avoid

- **Calling Workers AI for simple tasks.** Sometimes regex / cheaper logic suffices.
- **No streaming for long LLM responses.** Bad UX.
- **Long Worker runs for image gen.** Use queues for async generation.
- **Hardcoded model names.** Use config so you can swap models.
- **No fallback for AI failures.** Always have a graceful degradation.

## Summary

- Workers AI runs ML models on Cloudflare's GPU network via bindings.
- LLMs, embeddings, image gen, speech-to-text, vision available.
- Bindings — no API keys to manage.
- Cheaper than OpenAI/Anthropic for equivalent open-weight model use.
- Vectorize as native vector DB; pair with embeddings for RAG.
- AI Gateway sits in front of any provider for logging/caching/fallback.
- Use for chat, search, moderation, summarization, image gen.

Next module: production operations.
