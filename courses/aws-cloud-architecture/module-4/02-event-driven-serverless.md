---
module: 4
position: 2
title: "Event-driven and serverless patterns"
objective: "Use SQS, SNS, EventBridge, and Lambda together."
estimated_minutes: 8
---

# Event-driven and serverless patterns

## The puzzle

Traditional architectures have services calling each other synchronously — service A calls service B, waits for response, returns to caller. Event-driven architectures invert this: services emit events when things happen; other services subscribe to events they care about. Loose coupling, async by default, scales naturally.

AWS has rich primitives for event-driven design. Knowing when to reach for them changes how you architect.

## The simple version

The event-driven toolkit on AWS:

- **SQS (Simple Queue Service)**: point-to-point messages. One producer puts; one consumer takes. Buffer between services.
- **SNS (Simple Notification Service)**: pub/sub. One publisher; many subscribers. Fan-out events.
- **EventBridge**: rules-based event routing. Match events on patterns, route to multiple targets.
- **Kinesis**: streaming data. Like Kafka, ordered, replayable.
- **Step Functions**: orchestrate workflows of multiple steps.
- **Lambda**: glue everything together; runs on event triggers.

Combined: services emit events; events route via SNS/EventBridge to interested consumers; queues buffer; workflows orchestrate; Lambda handles the in-between logic.

The pattern works for: async processing, integration between services, audit/analytics pipelines, microservice communication, fanout to multiple consumers.

## The technical version

### SQS — buffered async work

SQS is a managed message queue. The classic pattern:

```
Web service ── put message ──> SQS queue ── consume ──> Worker
```

Properties:

- **Distributed and managed**: AWS handles scaling, durability.
- **At-least-once delivery**: messages may be delivered more than once; consumers must be idempotent.
- **Visibility timeout**: when a consumer picks up a message, others can't see it for N seconds; if not deleted in that window, becomes visible again.
- **Long polling**: consumers can wait for messages up to 20 seconds.
- **Dead letter queues**: messages that fail repeatedly get moved to a DLQ for inspection.

Two queue types:

- **Standard**: highest throughput, at-least-once delivery, best-effort ordering.
- **FIFO**: ordered delivery, exactly-once processing, throughput-limited.

Use FIFO when order matters (e.g., bank transactions). Use Standard for most other cases (faster, cheaper).

### When to use SQS

Good uses:

- **Decouple slow work** from user-facing requests: web service puts message, returns immediately; worker processes async.
- **Smooth traffic spikes**: queue absorbs bursts; workers process at steady rate.
- **Retry handling**: failed processing remains in queue (or DLQ) until handled.
- **Worker scaling**: consumer count can scale based on queue depth.

Don't use SQS for:

- Real-time delivery (some inherent latency).
- Pub/sub with many consumers (use SNS or EventBridge).
- Long-lived streams (use Kinesis).

### SNS — pub/sub fan-out

SNS publishes messages to topics; subscribers receive copies. One publish, many deliveries.

Subscribers can be:

- SQS queues.
- Lambda functions.
- HTTP/HTTPS endpoints (webhooks).
- Email / SMS.
- AWS services.

Common pattern: SNS → multiple SQS queues. Producer publishes to SNS; each interested consumer has its own SQS queue subscribed to SNS. Consumers process independently at their own pace.

```
Producer ─ publish ─> SNS Topic ─ deliver ─> SQS Queue A ─ consumer A
                                 ─ deliver ─> SQS Queue B ─ consumer B
                                 ─ deliver ─> Lambda C
```

This decouples producers from consumers. Producer doesn't know who's listening; consumers don't depend on each other.

### EventBridge — rules-based routing

EventBridge is the modern, more sophisticated successor to SNS for event routing:

- **Event buses**: separate spaces (default + custom + partner integrations).
- **Rules**: match events using patterns (JSON match against event content).
- **Targets**: 30+ AWS services where matched events can be delivered.
- **Schema discovery**: auto-detect event schemas.
- **AWS service events**: every AWS service emits events to default bus.

Example rule: "when an EC2 instance changes state to 'stopped', invoke Lambda function X."

Or: "when an S3 object is created in bucket Y with prefix `incoming/`, publish to SQS queue Z."

EventBridge is what you reach for when you need pattern-based routing of AWS service events or custom application events.

### EventBridge vs SNS

When to use which:

- **SNS**: simple pub/sub for messages you control. Good when subscribers consume everything published.
- **EventBridge**: rules-based routing. Good when consumers want filtered subsets of events.

For new architectures, EventBridge is often more powerful. For simple high-volume pub/sub, SNS may be cheaper and simpler.

### Kinesis — streaming

For ordered, replayable streams:

- **Kinesis Data Streams**: ordered records with retention (default 24 hours, up to 365 days).
- Multiple consumers can read independently with their own positions.
- Sharded for parallel processing.
- Suitable for: log streaming, time-series ingestion, real-time analytics.

Difference from SQS: SQS messages are processed once and deleted; Kinesis records persist for the retention period, multiple consumers can re-read.

Difference from EventBridge: Kinesis is for high-volume continuous streams; EventBridge is for discrete events.

Kinesis Data Firehose is a related service that takes streams and writes them to S3/Redshift/OpenSearch — batch-loading streaming data.

### Step Functions — workflow orchestration

For multi-step workflows that need orchestration:

- Visual state machine of steps.
- Steps call Lambda, ECS tasks, other AWS services.
- Built-in error handling, retries, parallel branches.
- Long-running (up to 1 year).

When to use: multi-step processes where you want explicit state management — order processing, ETL pipelines, approval workflows, anything where "step 3 failed, retry from step 2" matters.

Example: image processing pipeline.

1. Trigger on S3 upload.
2. Step 1: scan for malware.
3. Step 2: extract metadata.
4. Step 3: generate thumbnails.
5. Step 4: update database.

If any step fails, the state machine retries or branches to error handling. Easier than coordinating across multiple Lambdas with custom error handling.

### Lambda as the glue

Across all these patterns, Lambda is the most common integration point:

- **SQS trigger**: Lambda processes queue messages.
- **SNS trigger**: Lambda subscribes to topic.
- **EventBridge target**: Lambda is invoked by matched rules.
- **Kinesis consumer**: Lambda processes stream batches.
- **Step Functions task**: Lambda is the actual work.

Lambda's pay-per-invocation model fits event-driven perfectly: pay when events happen, nothing when they don't.

### Common patterns

A few that show up everywhere:

**S3 → Lambda processing**:

```
S3 upload → S3 event → Lambda
```

Upload triggers processing. Used for: image resizing, document parsing, ETL.

**SQS buffer between services**:

```
Web service → SQS → Worker fleet
```

Decouple user-facing latency from work-doing time. Workers scale independently.

**SNS fanout**:

```
Order placed → SNS → Email queue → Send email
                  → Analytics queue → Update metrics
                  → Audit queue → Log to data lake
```

One event, many independent consumers, each at their own pace.

**EventBridge service integration**:

```
EC2 state change → EventBridge → Lambda → Update inventory
RDS event → EventBridge → SNS → Notify ops team
CodePipeline event → EventBridge → Slack webhook
```

AWS service events as integration points.

**Step Functions workflow**:

```
Image upload → Step Functions:
  1. Virus scan (Lambda)
  2. Extract metadata (Lambda)
  3. Generate thumbnails (Lambda)
  4. Update database (Lambda)
  5. Notify user (SNS)
```

Multi-step process with explicit error handling.

### Idempotency

A critical principle for event-driven systems: consumers must be idempotent because messages may be delivered multiple times.

Ways to make handlers idempotent:

- **Use idempotency keys**: each message has a unique ID; consumer checks if already processed.
- **Make operations naturally idempotent**: "set X to Y" is idempotent; "increment X by 1" isn't.
- **Use conditional updates**: DynamoDB conditional writes, transactional updates.
- **Track processed messages**: separate "processed" table keyed by message ID.

Without idempotency, retries and at-least-once delivery cause duplicate side effects — duplicate emails sent, duplicate charges, etc.

### Error handling

Event-driven systems need explicit error handling:

- **Visibility timeout / retry**: failed processing retries automatically.
- **Dead letter queues**: messages that fail repeatedly move to DLQ for inspection.
- **Alarms on DLQ depth**: notify when messages are failing.
- **Circuit breakers**: if downstream is failing, stop sending more requests.
- **Exponential backoff**: retry with increasing delays.

Failures are normal in distributed systems. Handle them explicitly, monitor them, build playbooks.

### Schema evolution

When you change an event's schema:

- Old consumers may not understand new fields.
- New consumers may expect fields old events don't have.

Patterns:

- **Additive changes only**: new fields default to optional.
- **Version events explicitly**: `event_version: "1.0"` in the payload.
- **Schema registry**: EventBridge Schema Registry for AWS service events.

For internal events, agree on schema conventions upfront. Breaking changes always require coordination.

### Observability

Event-driven systems need extra observability:

- **Tracing across services**: X-Ray distributed tracing.
- **Queue depth monitoring**: SQS queue length alarms.
- **DLQ monitoring**: alarm when messages land in DLQs.
- **Event flow visualization**: tools like ServiceLens or third-party (Honeycomb, etc.).

The downside of async is harder debugging — a request triggers a chain of async events that produce results elsewhere. Tracing IDs propagated across events help reconstruct the chain.

### When NOT to go event-driven

Event-driven isn't always the right answer:

- **Simple synchronous requests**: don't add queues if not needed.
- **Strong consistency requirements**: eventual consistency is built into async.
- **Tight latency requirements**: queues add latency (typically tens of milliseconds).
- **Low-volume workloads**: complexity isn't worth it.
- **No clear domain boundaries**: events without clear semantics produce mess.

For a CRUD app with moderate traffic and synchronous needs, REST APIs talking directly to a database is simpler and better.

### Cost considerations

Event-driven pricing on AWS:

- **SQS**: ~$0.40 per million requests. Cheap for moderate scale.
- **SNS**: per publication + per delivery; similar order.
- **EventBridge**: $1 per million events to default bus; more for custom.
- **Kinesis**: per shard hour + per put.
- **Step Functions**: per state transition.

For high-volume event flows, these accumulate. Modeling cost early helps with architecture choices (e.g., batching events to reduce per-message cost).

## Three real-world scenarios

**Scenario 1: Order processing pipeline.**
User places order → web service writes to database, then publishes to SNS → SNS fanouts: email service (via queue), inventory service (via queue), analytics service (via queue), audit service (via queue). Each consumer processes independently. If email service is down, orders still succeed, emails retry from queue later. Decoupling lets each subsystem evolve independently.

**Scenario 2: Image upload processing.**
User uploads image to S3 (via pre-signed URL) → S3 event triggers Step Functions → state machine runs: virus scan → metadata extraction → thumbnail generation (parallel branch with 3 sizes) → DB update → user notification via SNS. If any step fails, Step Functions handles retries and dead-lettering. Clean orchestration without custom code for state management.

**Scenario 3: Service-to-service notification.**
Microservice A wants to notify microservice B about events. Instead of A calling B's API directly (tight coupling, A waits for B, A breaks when B is down), A publishes to EventBridge with custom event types. B has a rule that matches events of interest and invokes B's processor (Lambda or queue). A and B can deploy independently; B can be down without breaking A.

## Common mistakes to avoid

- **Synchronous calls** where async would work better.
- **No idempotency** in consumers.
- **No dead letter queue** on critical processing.
- **No monitoring** of queue depth or DLQs.
- **Event-driven everywhere** — sometimes synchronous is fine.
- **Schema changes without versioning**.
- **One huge SNS topic** for unrelated events — split per domain.

## Read more

- AWS Whitepaper: "Implementing Microservices on AWS."
- AWS Well-Architected Framework — Serverless Application Lens.
- AWS EventBridge documentation.

## Summary

- **SQS**: point-to-point async queues for decoupling.
- **SNS**: pub/sub fan-out to multiple subscribers.
- **EventBridge**: rules-based event routing across services.
- **Kinesis**: high-volume streaming with replay.
- **Step Functions**: orchestrate multi-step workflows.
- **Lambda**: glue between event sources and consumers.
- **Idempotency** is non-negotiable for event consumers.
- **Dead letter queues** for failed processing.
- **Observability** matters more in async — use X-Ray, queue metrics, alarms.

Next: microservices on AWS.
