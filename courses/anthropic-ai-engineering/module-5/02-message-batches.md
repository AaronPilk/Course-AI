---
module: 5
position: 2
title: "Message Batches API — 50% off for offline workloads"
objective: "Process large batches at half price within 24 hours."
estimated_minutes: 8
---

# Message Batches API — 50% off for offline workloads

## The puzzle

You need to summarize 100,000 customer reviews. Classify a year of tickets. Re-process every doc in your knowledge base after a prompt change. Generate descriptions for 50,000 products.

None of these are real-time. The user doesn't need an instant response — they just need it done by end of day, or tomorrow.

Sending these through the regular Messages API works, but you pay full price and your account flirts with rate limits. The **Message Batches API** is the right tool: submit up to 100,000 requests, get results within 24 hours, pay **50% off** the per-token rate.

## The simple version

1. Build a list of Message requests, each with a unique `custom_id`.
2. POST the batch to `/v1/messages/batches`.
3. Poll status until `ended`.
4. Download the results file. Map by `custom_id` back to your inputs.
5. Pay half what real-time API costs.

Use it for: analytics, backfills, content generation, embedding pipelines, eval runs, anything where latency doesn't matter.

Don't use it for: user-facing real-time requests, anything with a tight deadline.

## The technical version

### Building a batch

Each request in a batch is a complete Messages API call, plus a `custom_id`:

```js
const batchRequests = [
  {
    custom_id: "review-001",
    params: {
      model: "claude-haiku-4-5",
      max_tokens: 200,
      messages: [{ role: "user", content: `Summarize: ${review1}` }]
    }
  },
  {
    custom_id: "review-002",
    params: {
      model: "claude-haiku-4-5",
      max_tokens: 200,
      messages: [{ role: "user", content: `Summarize: ${review2}` }]
    }
  },
  // ... up to 100,000 requests
];

const batch = await client.messages.batches.create({
  requests: batchRequests
});

console.log("Batch ID:", batch.id);
console.log("Status:", batch.processing_status);  // "in_progress"
```

### Polling

Batches process asynchronously. Poll status:

```js
async function waitForBatch(batchId) {
  while (true) {
    const batch = await client.messages.batches.retrieve(batchId);
    if (batch.processing_status === "ended") return batch;
    if (batch.processing_status === "canceled") throw new Error("Batch canceled");
    await sleep(60_000);  // every 60s is plenty
  }
}

const finalBatch = await waitForBatch(batch.id);
console.log("Done:", finalBatch.request_counts);
// {
//   processing: 0,
//   succeeded: 99820,
//   errored: 180,
//   canceled: 0,
//   expired: 0
// }
```

Typical completion time is much less than 24 hours — often minutes for small batches, an hour or two for large ones. The 24-hour SLA is the upper bound, not the expected time.

### Reading results

When `ended`, fetch the results file (JSONL stream):

```js
const stream = await client.messages.batches.results(batch.id);

for await (const entry of stream) {
  console.log(entry.custom_id);            // your original ID
  console.log(entry.result.type);          // "succeeded" | "errored" | "canceled" | "expired"
  if (entry.result.type === "succeeded") {
    console.log(entry.result.message.content[0].text);
  } else {
    console.error(entry.result.error);
  }
}
```

Map each result back to your input by `custom_id`. Handle errors per request (rate limits, content blocks, etc.).

### Pricing

Batched requests get a flat **~50% discount** off the standard input AND output rates. Cache hits within a batch are also discounted.

Concrete: a workload that costs $400 in real-time API calls drops to ~$200 in batch. For 50,000+ request workloads, this is real money.

### Use cases — batch wins

- **Analytics / backfills**: classify a year of tickets, generate embeddings for a corpus, summarize a month of logs.
- **Content generation at scale**: product descriptions, internal documentation, A/B variants.
- **Eval suite runs**: when an eval has hundreds or thousands of cases, batch them.
- **Periodic content**: newsletters, weekly digests, end-of-month reports.
- **Data preparation**: cleaning, structuring, annotation tasks.

### Use cases — don't batch

- **User-facing real-time chat or completions.** Can't make a user wait 24 hours.
- **Synchronous tool calls in an agent loop.** Each step needs the previous step's output.
- **Anything with sub-minute SLA.** Batch is async; minimum overhead is a few minutes.
- **Single-shot one-off calls.** Just send them via the regular API.

### Batches + caching

Caching works within batches:

- The first request in a batch that uses a shared prefix performs the cache write.
- Subsequent batch requests hit the cache (~10% rate × 50% batch discount = ~5% of standard input rate).

If you're processing thousands of items against the same large context (a knowledge base, a long instruction set), caching + batching stack for near-free input on the repeats.

### Failure modes

Batches can fail per-request without killing the whole batch:

- A specific request hits a content moderation block.
- A specific request exceeds rate limits.
- A specific request times out.

Plan for it: every result has a status; handle failures per `custom_id`. Re-submit failed items as a smaller batch if needed.

### Limits

- Up to **100,000 requests per batch**.
- Up to **256 MB total request size**.
- **24-hour SLA** for completion. Most complete much faster.
- Rate limits apply (specific limits vary by account tier).

### Batches vs. streaming the real-time API

The temptation: just blast 50,000 sequential requests through the regular API. Two problems:

1. **Rate limits**. You'll hit per-minute quotas; throughput is capped.
2. **Full price**. No 50% discount.

Batches solve both. If a workload qualifies, always check batch first.

## Three real-world scenarios

**Scenario 1: The annual review job.**
A team needed to summarize 80,000 customer reviews for an annual report. Real-time API would have cost ~$1,200 and saturated their rate limits for hours. Batch cost ~$600 and completed in 45 minutes. Same model, same prompts, half the bill.

**Scenario 2: The eval suite that finally scaled.**
A team's eval suite had 500 cases. Running it serially via the API took 45 minutes per release. They moved to batch. Eval suite now runs in 5 minutes wall time (most is batch processing), costs half, and they run evals 5x more often as a result.

**Scenario 3: The wrong use of batch.**
A team tried to use batch for a user-facing chat assistant by queuing requests. Users waited 20 minutes for replies. They reverted to real-time. Lesson: batch is for *offline* workloads. If users are watching, don't batch.

## Common mistakes to avoid

- **Using batch for real-time UX.** Users won't wait. Use the regular API.
- **Not setting unique `custom_id`s.** Can't map results back.
- **Skipping per-request error handling.** Some requests will fail; plan for it.
- **Not stacking with caching.** When prompts share a stable prefix, caching + batching compound.
- **Treating 24-hour SLA as expected time.** Most batches finish in minutes; build for the typical case but allow the upper bound.

## Read more

- [Message Batches API](https://docs.anthropic.com/en/docs/build-with-claude/batch-processing)
- [Batches API reference](https://docs.anthropic.com/en/api/creating-message-batches)

## Summary

- **Batches API** processes large request lists asynchronously at **~50% off** per-token rates.
- Submit up to **100,000 requests** per batch; results delivered within **24 hours** (often much faster).
- Each request has a **`custom_id`** for mapping results back.
- Stack with **prompt caching** for compounding savings on repeated prefixes.
- Use for **analytics, backfills, evals, content generation, embeddings**.
- **Don't use** for real-time UX or anything user-facing with tight latency.

Next: evals — how to know if your Claude features are getting better.
