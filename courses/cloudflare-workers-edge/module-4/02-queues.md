---
module: 4
position: 2
title: "Queues for async processing"
objective: "Decouple work from request flow."
estimated_minutes: 6
---

# Queues for async processing

## Why queues

Many requests trigger work that doesn't need to block the response:

- User signs up → send welcome email + analytics event + provision resources.
- Webhook arrives → process and update DB.
- Upload completes → run image transformations.

Doing all this synchronously: slow responses, fragile (one step fails = user-visible error), couples your fast path to slow operations.

Queues decouple: receive request, enqueue work, return immediately, process asynchronously. Standard pattern in any reasonably-scaled system.

Cloudflare Queues is the Workers-native queue primitive — bindings, no separate infra, sub-second delivery.

## Setup

```toml
# wrangler.toml — producer (the Worker enqueueing work):
[[queues.producers]]
queue = "email-queue"
binding = "EMAIL_QUEUE"

# Same wrangler.toml or different Worker — consumer (the Worker processing):
[[queues.consumers]]
queue = "email-queue"
max_batch_size = 10
max_batch_timeout = 30
max_retries = 3
dead_letter_queue = "email-dlq"
```

The producer Worker writes to the queue; the consumer Worker reads. Can be the same or different Workers.

## Producing messages

```ts
async fetch(request: Request, env: Env) {
  const { userId, email } = await request.json();
  await createUser({ email });
  
  // Enqueue welcome email:
  await env.EMAIL_QUEUE.send({
    type: 'welcome',
    userId,
    email,
  });
  
  return Response.json({ ok: true });
}
```

`env.EMAIL_QUEUE.send(message)` writes one message. Returns when accepted (~ms).

For batched sends:

```ts
await env.EMAIL_QUEUE.sendBatch([
  { body: { type: 'welcome', userId: '1' } },
  { body: { type: 'welcome', userId: '2' } },
  { body: { type: 'welcome', userId: '3' } },
]);
```

Up to 100 messages per batch send.

## Consuming messages

```ts
export default {
  async queue(batch: MessageBatch, env: Env, ctx: ExecutionContext) {
    for (const msg of batch.messages) {
      try {
        const { type, userId, email } = msg.body;
        if (type === 'welcome') {
          await sendWelcomeEmail(email, env);
        }
        msg.ack();  // mark this message as processed
      } catch (err) {
        msg.retry();  // re-deliver later
      }
    }
  },
};
```

The `queue` handler receives a batch of messages. Process each; ack on success; retry on failure.

`max_batch_size` (in wrangler.toml) controls how many messages per batch (default 10). `max_batch_timeout` controls how long to wait to fill a batch (default 30s).

## Retry behavior

Failed messages retry with exponential backoff. After `max_retries` attempts, they go to the Dead Letter Queue (DLQ) if configured.

```ts
msg.retry({ delaySeconds: 60 });  // retry in 60 seconds explicitly
```

DLQ is just another queue containing failed messages — process or inspect to debug.

## Throughput

Cloudflare Queues handles tens of thousands of messages per second per queue. Per-message processing speed limited by your consumer's throughput.

Cloudflare auto-scales the number of consumer Workers to keep up with backlog. For very high throughput, configure higher `max_batch_size` so each consumer processes more per invocation.

## Use cases

**Email sending.** User action → enqueue → consumer sends via SendGrid/Postmark/Resend. Fast user response; resilient against email-provider hiccups.

**Image processing.** Upload to R2 → enqueue thumbnail/resize jobs → consumer processes → updates D1 metadata.

**Webhook processing.** Receive webhook → ACK to provider quickly → enqueue for actual handling → consumer processes.

**Analytics events.** Track events → enqueue → consumer batches into D1 or external store.

**Workflow steps.** Multi-step user journeys; each step enqueues the next.

## Patterns

**Webhook receiver:**

```ts
app.post('/webhooks/stripe', async (c) => {
  const signature = c.req.header('Stripe-Signature');
  const body = await c.req.text();
  
  // Verify signature (synchronous):
  if (!verifySig(body, signature, c.env.STRIPE_WEBHOOK_SECRET)) {
    return c.text('Invalid', 400);
  }
  
  // Enqueue actual processing:
  await c.env.WEBHOOK_QUEUE.send({ body });
  
  // ACK to Stripe immediately:
  return c.text('OK', 200);
});
```

Stripe (and other webhook providers) requires fast 200 response. Queue decouples the response from the actual processing.

**Sequential workflow:**

```ts
async queue(batch, env, ctx) {
  for (const msg of batch.messages) {
    const { step, data } = msg.body;
    
    if (step === 'process_signup') {
      await provisionUser(data);
      await env.QUEUE.send({ step: 'send_welcome', data });
    } else if (step === 'send_welcome') {
      await sendWelcomeEmail(data);
      await env.QUEUE.send({ step: 'add_to_crm', data });
    } else if (step === 'add_to_crm') {
      await syncToCRM(data);
    }
    
    msg.ack();
  }
}
```

Each step enqueues the next. Failures retry only the failed step. Workflows survive crashes.

For complex workflows, Cloudflare Workflows (separate product) provides durable execution with built-in retries and state.

## Dead letter queues

For messages that fail all retries:

```toml
[[queues.consumers]]
queue = "main-queue"
dead_letter_queue = "main-dlq"
max_retries = 3
```

Failed messages land in `main-dlq` after 3 failed attempts. Set up a separate consumer for the DLQ to:

- Alert operators.
- Persist to a "needs investigation" table.
- Replay after fixing the underlying issue.

```ts
// Separate DLQ consumer:
async queue(batch, env, ctx) {
  for (const msg of batch.messages) {
    await env.D1.prepare('INSERT INTO failed_messages (body, error) VALUES (?, ?)')
      .bind(JSON.stringify(msg.body), msg.error)
      .run();
    
    await notifyOnCall(`DLQ message: ${msg.id}`);
    msg.ack();
  }
}
```

## Limits

- **Message size:** 128KB.
- **Throughput:** 5k messages/sec per queue typically.
- **Retention:** up to 4 days.

For larger messages: store in R2; enqueue the reference (R2 key).

## Cost

Queues priced per million operations:

- ~$0.40 per million writes.
- ~$0.40 per million reads.

Generous free tier. For most apps, queues are cheap.

## Alternatives

**Cloudflare Workflows.** Durable execution engine — checkpoints state; retries entire workflows automatically. Higher-level than queues; better for multi-step flows.

**External queues (SQS, RabbitMQ, BullMQ + Redis).** When you need integration with non-Cloudflare systems or specific queue semantics.

**Durable Objects.** For coordination + state combined; queues are pure pipes.

For Workers-native async processing: Queues. For complex multi-step workflows: Workflows. For external integration: managed external queues.

## Local development

`wrangler dev` runs the consumer locally too. Messages enqueued via `env.QUEUE.send` are delivered locally to the consumer handler. Test the whole flow without deploying.

## Mistakes to avoid

- **Synchronous processing of webhook payloads.** Provider times out.
- **No DLQ.** Failed messages disappear silently.
- **Non-idempotent consumers.** At-least-once delivery means retries are normal.
- **Huge messages.** Store payload in R2; reference in queue.
- **Single consumer Worker without scaling config.** Backlog builds.

## Summary

- Cloudflare Queues: native async processing for Workers.
- Producer enqueues via binding; consumer processes via `queue` handler.
- Batch processing with retry + dead letter queue.
- Use for emails, webhooks, image processing, analytics, workflow steps.
- Make consumers idempotent (at-least-once delivery).
- Scale via batch size + auto-scaling consumers.
- Workflows for higher-level multi-step orchestration.

Next: WebSockets and real-time.
