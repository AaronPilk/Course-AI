---
module: 2
position: 4
title: "Lambda — serverless compute"
objective: "When to use Lambda vs EC2 vs containers."
estimated_minutes: 8
---

# Lambda — serverless compute

## The puzzle

EC2 gave you a VM. Containers (ECS, EKS) gave you a packaged runtime. Lambda gives you... a function. You upload code; AWS runs it when triggered; you pay only for invocation time. No servers to manage. Sounds magical. The question is: when is it actually the right tool, and when does the magic break?

## The simple version

AWS Lambda runs your code in response to events without you provisioning servers. You give it:

1. **A function** in a supported language (Python, Node.js, Java, Go, Ruby, .NET, custom runtimes).
2. **A trigger**: API Gateway HTTP request, S3 upload, SQS message, scheduled event, etc.
3. **Configuration**: memory size (128 MB to 10 GB), timeout (max 15 min), IAM role, environment variables.

AWS handles everything else: provisioning, scaling, OS, runtime, logs.

Pricing: pay per request + per duration (GB-seconds). 1M requests/month free; beyond that, fractions of a cent per million.

Use Lambda for: API endpoints with variable traffic, event-driven processing, scheduled tasks, glue code between AWS services.

Don't use Lambda for: long-running tasks (>15 min), workloads with sustained high throughput (gets expensive), workloads needing local persistent state.

## The technical version

### How Lambda actually runs

When you create a Lambda function:

1. AWS stores your code (zip or container image).
2. When triggered, AWS spins up a "micro-VM" using Firecracker (their hypervisor).
3. Your code runs in that micro-VM.
4. After a period of inactivity, the micro-VM is destroyed.
5. The next invocation may reuse a warm micro-VM ("warm start") or spin up a new one ("cold start").

You don't see any of this — you just write the function. But understanding the model helps explain cold starts, concurrency limits, and other behaviors.

### Triggers

Lambda can be invoked by many AWS services and patterns:

- **API Gateway / Function URL**: HTTP requests → Lambda.
- **S3 events**: object created/deleted.
- **DynamoDB Streams**: table changes.
- **SQS**: messages from queue.
- **SNS**: pub/sub messages.
- **EventBridge**: scheduled or custom events.
- **Kinesis**: stream records.
- **Step Functions**: workflow steps.
- **CloudWatch alarms**: when alarms trigger.
- **Direct API call**: synchronous invoke.

The richness of triggers is what makes Lambda useful — most AWS services can emit events that Lambda processes.

### Cold starts

When a Lambda hasn't run recently, the first invocation pays a "cold start" — the time to set up the micro-VM and load your code:

- **Simple Node.js / Python**: 100-500ms cold start.
- **Java / .NET**: 1-3 seconds (JVM startup).
- **Large functions or VPC-attached**: longer.

After cold start, subsequent invocations are fast ("warm").

Mitigations:

- **Provisioned Concurrency**: keep N instances warm. Costs money but eliminates cold starts.
- **Smaller deployment packages**: faster to load.
- **Avoid VPC if possible** (older issue, less relevant on modern Lambda).
- **Use SnapStart for Java**: snapshots warmed JVM for fast cold starts.

For most APIs, occasional 200ms cold starts are acceptable. For latency-sensitive paths, use Provisioned Concurrency or pre-warm with scheduled invocations.

### Concurrency

Lambda concurrency is the number of simultaneous executions. Default account limit: 1000 concurrent executions per region. Each execution = one micro-VM running one function invocation.

If 1000 requests arrive at once and you have 1000-concurrency limit, all 1000 run in parallel. Request 1001 gets throttled (HTTP 429 for API Gateway, retries for async sources like SQS).

Concurrency limits can be raised via support ticket. Per-function limits can be set lower as a safety guard ("don't let this one function consume all 1000 concurrency").

For high-traffic APIs, account-level concurrency is the limit to watch. Plan capacity accordingly.

### Memory and CPU

Lambda memory ranges from 128 MB to 10 GB. CPU and network scale proportionally to memory — more memory = more CPU.

This means: a CPU-bound function may run faster (and total cost may drop) with more memory, even though per-second cost is higher. Counterintuitive: provision more memory than the function strictly needs for memory, just to get the CPU.

Tools like AWS Lambda Power Tuning automate finding the optimal memory setting for cost or performance.

### Timeouts

Max Lambda timeout: 15 minutes. After that, AWS kills the execution.

Implications:

- Long batch jobs can't be a single Lambda invocation.
- Use Step Functions to orchestrate longer workflows of multiple Lambdas.
- For truly long-running work, use Fargate or EC2.

15 minutes is plenty for most API requests, event processing, and short batch tasks. Hit the limit and you need to rearchitect.

### Pricing

Two components:

- **Requests**: $0.20 per million.
- **Duration**: $0.0000166667 per GB-second.

A 256 MB function running for 100 ms costs:
- Request: ~$0.0000002.
- Duration: 0.25 GB × 0.1 s × $0.0000166667 = ~$0.000000417.
- Per million invocations: $0.20 + $0.417 = ~$0.62.

For sporadic workloads, near-free. For high-throughput sustained workloads, costs add up:

- 1000 requests/second × 100 ms each = 100 GB-seconds/sec, ~$100/month per million daily requests. Sounds cheap.
- 1 million requests/second sustained: gets into thousands per day.

At very high RPS, EC2/ECS is often cheaper than Lambda. The crossover depends on workload shape.

### Lambda + API Gateway

A common pattern: API Gateway in front of Lambda for HTTP APIs:

- API Gateway handles HTTPS termination, request validation, throttling, authorization.
- Lambda handles the actual logic.
- DynamoDB or RDS for storage.

Pros: zero servers, scales automatically, pay-per-request.
Cons: cold starts on first request, complexity if you need WebSocket, more expensive at very high traffic.

Alternative: Lambda Function URLs (built-in HTTP endpoint without API Gateway) for simpler cases. Less features, less cost.

### Lambda + S3 / SQS / DynamoDB Streams

The other dominant pattern: event-driven Lambda.

- S3 upload → Lambda processes the file → writes results.
- SQS message → Lambda handles it → ack or retry.
- DynamoDB change → Lambda reacts.

This is where Lambda shines — async, scalable event handling with no server management. Pattern fits many ETL, processing, and integration use cases.

### Lambda layers

For shared code or dependencies, use Lambda Layers:

- Layer = zip containing libraries.
- Up to 5 layers per function.
- Shared across functions.

Useful for shared SDK versions, custom runtimes, large dependencies kept out of function code.

Container image support (Lambda can run from container images, up to 10 GB) has somewhat reduced the need for layers.

### Lambda container images

Beyond zip files, Lambda can run code packaged as Docker container images:

- Up to 10 GB image size (vs 50 MB zip).
- Use familiar Docker tools and base images.
- Cold start can be longer (large images).

Useful for: large dependencies, complex builds, code that's already containerized for other environments.

### Environment variables and secrets

Configuration via environment variables. For secrets:

- **Don't put secrets in plaintext env vars** for production.
- Use AWS Systems Manager Parameter Store or Secrets Manager.
- Encrypt env vars with KMS.
- Or pull secrets at startup.

Lambda's small surface area makes secrets management cleaner than EC2 — fewer places for them to leak.

### Monitoring

Lambda has built-in CloudWatch integration:

- Logs: every print/log statement.
- Metrics: invocations, errors, duration, throttles.
- X-Ray: distributed tracing.

CloudWatch Insights makes querying logs easy. For production Lambdas, set up alarms on error rate and duration.

### When NOT to use Lambda

Lambda is bad for:

- **Long-running tasks** (>15 min). Use Fargate, Step Functions, or EC2.
- **Sustained high traffic**. At enough scale, EC2/Fargate is cheaper.
- **Latency-critical APIs** without Provisioned Concurrency. Cold starts matter.
- **Stateful workloads** needing local state. Lambda is stateless.
- **High-memory or high-CPU per task**. Max 10 GB memory.
- **WebSockets** at scale (API Gateway WebSocket exists but has limitations).
- **GPU workloads**. No GPU support.
- **Workloads with extreme regulatory/compliance requirements** for the runtime environment.

### Lambda vs containers (Fargate)

Lambda and Fargate (serverless containers) overlap. Differences:

- **Lambda**: function-as-a-service. Per-invocation pricing. 15-min max. Smaller runtime control.
- **Fargate**: container-as-a-service. Per-second pricing of running tasks. Long-running OK. Full container runtime control.

For HTTP API behind a load balancer, both work. Lambda is usually simpler for variable/spiky traffic; Fargate is usually cheaper for sustained traffic and lets you bring whatever container image you want.

For event-driven async processing, Lambda is usually the better fit because of native integration with most AWS event sources.

### Common Lambda patterns

A few canonical uses:

- **API backend**: Lambda + API Gateway + DynamoDB.
- **S3 image processor**: upload → Lambda → thumbnails.
- **Scheduled job**: EventBridge schedule → Lambda → some action.
- **SQS consumer**: queue → Lambda → process and ack.
- **Webhook receiver**: API Gateway → Lambda → record event.
- **Glue code**: Lambda between AWS services where no direct integration exists.

### Common Lambda mistakes

A few to avoid:

- **Using Lambda for sustained high-throughput services**: cost explodes.
- **Cold starts on critical paths**: use Provisioned Concurrency or pre-warm.
- **Connecting to RDS directly without pooling**: each Lambda opens a new connection; RDS connection limits exceed quickly. Use RDS Proxy.
- **Large deployment packages**: slow cold starts; trim dependencies.
- **Long timeouts hiding bugs**: a Lambda timing out at 15 minutes was probably broken at minute 1.
- **Recursive triggers**: Lambda that writes to S3 that triggers itself — infinite loop, infinite bill.

### Lambda for AI / ML

Increasingly used:

- **Small inference**: lightweight models in Lambda.
- **Routing**: Lambda triages requests to bigger inference services.
- **Preprocessing**: parsing, validation, prompt construction.

For heavy ML workloads, SageMaker or dedicated inference servers (Bedrock, EC2 with GPU) are better. Lambda has no GPU support and 10 GB memory cap.

## Three real-world scenarios

**Scenario 1: An image-resize service.**
Users upload images. S3 triggers Lambda. Lambda uses Pillow (Python) or sharp (Node.js) to generate thumbnails, stores them in another S3 prefix. Costs: pennies per thousand images. Scales automatically with upload rate. No servers to manage. Canonical Lambda use case.

**Scenario 2: A high-RPS API consider Lambda vs ECS.**
API receiving 1000 requests/second sustained. Lambda + API Gateway: roughly $3K-5K/month including high RPS pricing. Same API on Fargate behind ALB: roughly $500-1000/month. For sustained traffic, Fargate is much cheaper. The team chose ECS Fargate for cost; Lambda would have been simpler but 5x more expensive.

**Scenario 3: A scheduled report generator.**
Once a day, generate a report from data in DynamoDB. EventBridge schedule → Lambda → query DynamoDB → write PDF to S3 → email link. Total runtime: 30 seconds/day. Cost: less than $0.10/month. Could have used a cron job on EC2 ($30/month for an idle t3.nano). Lambda is dramatically cheaper for sporadic work.

## Common mistakes to avoid

- **Lambda for everything**: not always cheaper, not always simpler.
- **No connection pooling** to RDS without RDS Proxy.
- **Cold-start-sensitive paths** without Provisioned Concurrency.
- **15-min timeout hiding stuck functions**: monitor duration carefully.
- **Recursive triggers** that loop forever.
- **Big deployment packages** that slow cold starts.

## Read more

- AWS Lambda Developer Guide.
- AWS Whitepaper: "Serverless Architectures with AWS Lambda."
- AWS Well-Architected Framework — Serverless Application Lens.

## Summary

- **Lambda** = run code without managing servers, billed per-invocation.
- **Triggers**: many AWS services + HTTP + scheduled events.
- **Cold starts**: 100ms-3s on first invocation; warmer after.
- **Pricing**: $0.20/M requests + GB-seconds. Cheap for sporadic, expensive for sustained.
- **15-minute timeout**, 10 GB memory max.
- **Concurrency limit** typically 1000/region.
- **Use cases**: APIs with variable traffic, event processing, scheduled jobs, glue code.
- **Don't use**: long-running tasks, sustained high RPS, GPU workloads, stateful services.
- **Alternative**: Fargate for containerized workloads with similar serverless feel.

That wraps Module 2. Next: networking and security.
