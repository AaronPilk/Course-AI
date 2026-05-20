---
module: 4
position: 1
title: "The classic three-tier web app"
objective: "Map a working architecture across AWS services."
estimated_minutes: 8
---

# The classic three-tier web app

## The puzzle

The "three-tier web app" — load balancer + app servers + database — is the most common architecture on AWS. Most production workloads boil down to a variant of it. Knowing the canonical pattern and how each piece maps to AWS services is foundational because every more sophisticated architecture (microservices, event-driven, serverless) is built on the same primitives.

## The simple version

A three-tier web app on AWS looks like:

1. **Presentation tier**: users hit a CDN (CloudFront) or directly an Application Load Balancer in public subnets.
2. **Application tier**: app servers (EC2, ECS, or Lambda) in private subnets, fronted by the load balancer.
3. **Data tier**: managed database (RDS, Aurora, DynamoDB) in private "database" subnets, never accessible from the internet.

Add: ACM for TLS certs, Route 53 for DNS, S3 for static assets, CloudWatch for monitoring, IAM roles for service-to-service auth. That's the full stack.

This pattern works for blog platforms, SaaS apps, e-commerce, internal tools — most things you'd build.

## The technical version

### The full topology

```
User
  │
  ▼ DNS resolution
Route 53  (your-domain.com → CloudFront distribution)
  │
  ▼
CloudFront (CDN, edge caching, TLS termination)
  │
  ▼ (cache miss → forward to origin)
Application Load Balancer (in public subnets, multi-AZ)
  │
  ▼ (route + health check)
Auto Scaling Group of EC2 / ECS service / Lambda
  (in private app subnets, multi-AZ)
  │
  ▼
RDS / Aurora primary in DB subnet (AZ-A)
RDS / Aurora standby in DB subnet (AZ-B)
  │
  ▼ (assets, uploads)
S3 (static content)
```

Plus orthogonal:

- Secrets Manager (DB password, API keys).
- CloudWatch (logs, metrics, alarms).
- IAM roles (instance/task roles for AWS API access).
- ACM (free TLS cert for CloudFront and ALB).
- WAF (optional, for DDoS/SQLi/etc protection at edge).
- AWS Backup (managed backups across services).

### Tier 1: presentation and edge

User traffic enters via:

- **Route 53** for DNS. Handles routing to the right region (latency-based, geolocation, failover).
- **CloudFront** for CDN. Caches static content at edge locations globally. Reduces origin load. Provides DDoS protection (Shield Standard, free).
- **WAF** (optional) for filtering malicious traffic at the edge.
- **TLS** via ACM. Free certs, auto-renewing.

CloudFront optimizes for static content but also forwards dynamic requests to the origin (the ALB). Origin Shield is an additional caching tier between edge and origin.

For an API-only app (no significant static content), CloudFront may be unnecessary; users hit the ALB directly. For anything with images/CSS/JS, CloudFront usually pays for itself.

### Tier 2: load balancing

**Application Load Balancer (ALB)** is the standard for HTTP/HTTPS:

- L7 routing (path-based, host-based, header-based).
- HTTPS termination via ACM.
- WAF integration.
- Cross-AZ load balancing.
- Health checks remove failing instances.
- Integration with target types: EC2 instances, ECS services, Lambda functions, IP addresses.

**Network Load Balancer (NLB)** is for L4 (TCP/UDP) — when you need raw TCP performance, fixed IPs, or non-HTTP protocols.

**Gateway Load Balancer** for inserting third-party network appliances (firewalls, IDS) into traffic flow.

For most web apps, ALB. The other two are for specific cases.

### Tier 3: application

Three primary options for compute:

**EC2 with Auto Scaling Group**:

- Most flexible, most operational overhead.
- ASG maintains desired instance count, replaces failures.
- Scaling policies based on CPU, request count, custom metrics.
- Best for: legacy apps, special OS/runtime requirements, GPU workloads.

**ECS / EKS containers**:

- Wrap app in container image; let AWS schedule it.
- ECS is AWS-native; EKS is managed Kubernetes.
- Use Fargate for serverless containers (no EC2 to manage).
- Best for: modern apps, microservices, polyglot teams.

**Lambda**:

- No servers; pay per invocation.
- Best for: sporadic/event-driven traffic, simple APIs.
- Worst for: sustained high traffic (gets expensive), long-running tasks.

For a new three-tier app in 2026, ECS Fargate or Lambda are usually the right starting points. EC2 with ASG is right when you need control the others don't provide.

### Tier 4: data

Multiple managed database options:

**RDS** (Postgres, MySQL, MariaDB, SQL Server, Oracle):

- Single primary + optional Multi-AZ standby (synchronous replication for HA).
- Optional read replicas.
- Automated backups.
- Best for: traditional relational workloads, moderate scale.

**Aurora** (MySQL or Postgres compatible):

- AWS's reimagined RDS — separates compute from storage.
- Better performance than RDS for many workloads.
- Aurora Serverless v2 auto-scales.
- Best for: most relational workloads, especially with variable load.

**DynamoDB** (NoSQL):

- Massive scale, single-digit-ms latency.
- Pay-per-request or provisioned.
- Best for: high-throughput key-value lookups, simple access patterns.

For most new apps: Aurora Postgres or DynamoDB, depending on data model. RDS works fine but Aurora is usually better for the same money.

### Multi-AZ patterns

For HA, every tier spans multiple AZs:

- **CloudFront**: global edge, no AZ concept.
- **ALB**: explicitly spans AZs you configure.
- **EC2 ASG**: configured to launch in multiple AZs; scales evenly.
- **ECS service**: tasks spread across AZs.
- **RDS Multi-AZ**: primary + synchronous standby in another AZ; auto-failover.
- **Aurora**: data replicated 6 ways across 3 AZs by default.
- **S3**: replicated across AZs in the region automatically.
- **DynamoDB**: data replicated across AZs automatically.

If you do these right, a single-AZ outage doesn't take down the app. This is the baseline; anything less is a risk.

### Static assets

A common pattern often missed by novices:

- **Static files** (HTML, CSS, JS, images, downloads) → S3.
- **CloudFront** in front of S3, optionally fronting the app via the same distribution.
- **Versioned URLs** for cache invalidation (`/static/app-v3.css` instead of `/static/app.css`).

This removes static serving from your app servers entirely. ALB only handles dynamic requests. App servers do less; everything is faster; CDN caching is more effective.

For SPAs (React, Vue, Svelte), the entire frontend is static; only API calls go to app servers.

### User uploads

For user-uploaded files (images, documents):

- **Pre-signed URLs** for direct browser-to-S3 uploads.
- Upload handler in app: validate, return pre-signed URL.
- Browser uploads directly to S3, never through your app servers.
- App stores S3 key in the database after upload completes.
- Serve later via CloudFront with signed URLs for access control.

This pattern scales infinitely without burdening your app servers with file streaming.

### Background work

For asynchronous tasks (sending emails, processing uploads, generating reports):

- Front-end app puts a message on **SQS** (Simple Queue Service).
- Workers (Lambda, ECS, EC2) consume messages and process.
- Output to S3, DynamoDB, or back to the database.

Decouples user-facing latency from work-doing time. Worker fleet scales independently from web tier.

For event-driven patterns (S3 upload triggers Lambda), no queue needed — direct integration.

### Caching

Common cache patterns in three-tier apps:

- **CloudFront** caches at edge (static assets, sometimes dynamic with cache headers).
- **ElastiCache** (Redis or Memcached) for application-level cache.
- **DynamoDB Accelerator (DAX)** for in-memory cache in front of DynamoDB.
- **Application memory** cache for very hot data.

Order of magnitude: more aggressive caching = less load on DB = better performance. Layer caches strategically based on access patterns.

### Monitoring

For a production three-tier app, instrument:

- **CloudWatch metrics**: built-in for every AWS service. Add custom app metrics.
- **CloudWatch Logs**: collect app logs from EC2/ECS/Lambda.
- **CloudWatch alarms**: trigger on high error rate, slow response, low free memory, etc.
- **X-Ray**: distributed tracing across services.
- **CloudWatch dashboards**: visualize key metrics.

Or use third-party tools (Datadog, New Relic, Honeycomb) that integrate with AWS.

For "what's actually happening?", you need observability before you launch, not after the first outage.

### Cost optimization in three-tier

Common wins:

- **Right-size everything**: instances, RDS, etc. Don't over-provision.
- **Reserved Instances / Savings Plans** for steady workloads.
- **Spot Instances** for stateless app tier (only viable for tolerant workloads).
- **Aurora Serverless v2** for variable DB load.
- **Lifecycle policies on S3** for assets that age.
- **CloudFront caching** to reduce origin load.
- **VPC endpoints** to bypass NAT for AWS service traffic.

Each provides incremental savings. Together they can cut bills by 50-70% without architecture changes.

### Deployment patterns

For deploying updates:

- **Blue/Green**: spin up new fleet, switch traffic, terminate old.
- **Rolling**: gradually replace instances in the ASG.
- **Canary**: route a small percentage of traffic to new version, expand if healthy.

AWS Code* services (CodeDeploy, CodePipeline) support these patterns. Or use third-party CI/CD (GitHub Actions, CircleCI) with AWS deployment.

Database migrations need separate handling — they don't fit the blue/green pattern naturally. Tools like Flyway or Liquibase manage schema versioning.

### Common variants

A few common variations on the canonical pattern:

**API + SPA**: same backend, but frontend is a static React/Vue app served from S3+CloudFront. Backend is APIs only.

**Multi-tenant SaaS**: same architecture, with tenant isolation enforced via app-level logic or per-tenant DB schemas.

**Read-heavy workload**: add Aurora read replicas and route reads to them.

**Write-heavy workload**: consider partitioning, switch to DynamoDB, or async write patterns.

**Real-time features**: add WebSockets via API Gateway WebSocket, or a dedicated tier (Elasticache pub/sub, etc.).

### Common mistakes to avoid

A few patterns to watch:

- **Database in public subnet** with public IP. (Should always be private.)
- **Single AZ deployment** in production.
- **No CDN** for static assets, app servers serving them.
- **Tight coupling between app tier and DB** — can't scale them independently.
- **Hardcoded resource references** (specific subnet IDs in code) — use service discovery.
- **No automated backups verified by restoration**.
- **Monitoring gaps** that hide problems until users complain.

## Three real-world scenarios

**Scenario 1: A SaaS app at moderate scale.**
ALB → ECS Fargate (3 services across 3 AZs, scales 2-10 tasks each) → Aurora Postgres (Multi-AZ). Static assets in S3 + CloudFront. Secrets in Secrets Manager. Total infra cost: ~$1500/month at this scale. Handles 10K concurrent users comfortably.

**Scenario 2: An e-commerce site with bursty traffic.**
Same general architecture but with Aurora Serverless v2 (auto-scales DB for traffic spikes), CloudFront aggressively caching catalog pages, ElastiCache for cart sessions, Lambda for async order processing. Black Friday handled without code changes.

**Scenario 3: A startup MVP.**
Minimal version: Lambda + API Gateway + DynamoDB + S3 + CloudFront. No ALB, no EC2, no ECS. Costs ~$50/month at low traffic. Same architecture concepts (presentation, app, data) but every tier is serverless.

## Common mistakes to avoid

- **Single point of failure** somewhere (one NAT, one AZ, one DB without replica).
- **No CDN** when static traffic dominates.
- **App servers serving static files** instead of S3.
- **Database publicly accessible**.
- **No queue for async work** that ends up blocking user requests.
- **One huge ALB target group** mixing concerns; split per service.

## Read more

- AWS Whitepaper: "Web Application Hosting in the AWS Cloud."
- AWS Well-Architected Framework — Reliability and Performance pillars.
- AWS Architecture Center reference architectures.

## Summary

- **Three tiers**: presentation (CDN, LB), application (compute), data (database).
- **CloudFront + ALB + EC2/ECS/Lambda + RDS/Aurora/DynamoDB**: canonical AWS three-tier.
- **Multi-AZ** at every tier for HA.
- **Static assets to S3 + CloudFront**, not via app servers.
- **Pre-signed URLs for uploads**, not via app servers.
- **Async work to SQS + workers**, not blocking requests.
- **Layer caches**: CDN → application cache → DB cache.
- **Observability built in**: CloudWatch, X-Ray, alarms.
- **Most production apps are variants** of this same pattern.

Next: event-driven and serverless patterns.
