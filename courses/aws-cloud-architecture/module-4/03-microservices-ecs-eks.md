---
module: 4
position: 3
title: "Microservices on AWS — ECS, EKS, and beyond"
objective: "Choose between container orchestration options."
estimated_minutes: 8
---

# Microservices on AWS — ECS, EKS, and beyond

## The puzzle

When your app outgrows a single deployable, you reach for microservices — separate services for separate concerns, each independently deployable and scalable. The infrastructure for this is container orchestration. AWS gives you several choices: ECS, EKS, Fargate, App Runner, plain Lambda. Picking the right one depends on team skills, scale, and what you actually need.

## The simple version

Container options on AWS, from least to most operational burden:

1. **App Runner / Lambda**: highest abstraction. Zero infrastructure to manage. Best for: small services, APIs, web apps.
2. **ECS Fargate**: serverless containers. AWS-native control plane. Best for: most modern container workloads on AWS.
3. **ECS on EC2**: containers on instances you manage. Best for: GPU workloads, special compute needs, cost optimization at scale.
4. **EKS Fargate**: managed Kubernetes, serverless workers. Best for: existing Kubernetes investment + want managed.
5. **EKS on EC2**: full Kubernetes. Best for: portability across clouds, complex orchestration needs.
6. **Self-managed Kubernetes on EC2**: max control, max work. Best for: very specific needs that K8s services don't meet.

For most teams starting fresh on AWS: ECS Fargate. For teams already using Kubernetes: EKS. For everything-else: pick based on requirements, not hype.

## The technical version

### Why containers

Containers package an application with its dependencies into an image that runs the same anywhere. Benefits:

- **Consistency**: same image in dev, staging, prod.
- **Density**: many containers per host (more efficient than VMs).
- **Speed**: containers start in milliseconds.
- **Polyglot**: different services in different languages.
- **Tooling**: rich ecosystem (Docker, OCI images, container registries).

The shift from "deploy a binary to a VM" to "deploy a container image to an orchestrator" was the big infrastructure change of the 2010s. By 2025, containers are the default for new server-side applications.

### ECS — AWS's native container orchestrator

Elastic Container Service. AWS's purpose-built orchestrator with deep AWS integration.

Key concepts:

- **Task definition**: blueprint for a container or group of containers. Like a `docker-compose.yml`.
- **Task**: a running instance of a task definition.
- **Service**: a desired number of tasks, with health checks and updates.
- **Cluster**: a logical group of tasks; can be Fargate or EC2-backed.

ECS is simpler than Kubernetes. Less to learn, less to operate. Tight integration with ALB, IAM (task roles), CloudWatch, Secrets Manager.

ECS runs in two modes:

- **Fargate**: serverless. AWS picks the host; you don't. Pay per task per second.
- **EC2**: you manage the underlying EC2 instances. Cheaper at scale; more operational work.

For most workloads, ECS Fargate is the right starting point. EC2 mode for cost optimization once usage is established.

### EKS — managed Kubernetes

Elastic Kubernetes Service. AWS-managed Kubernetes control plane.

Use EKS when:

- **Existing Kubernetes investment**: your team already uses K8s; tooling, manifests, expertise transfer.
- **Multi-cloud portability**: want to run the same workload on multiple clouds eventually.
- **Complex orchestration patterns**: Helm charts, operators, CRDs that don't fit ECS.
- **Hiring**: K8s skills are more transferable.

Use ECS when:

- AWS-only (mostly).
- Simpler operations matter more than portability.
- Smaller team without K8s specialists.
- Want tighter AWS service integration.

EKS has a per-cluster cost ($0.10/hour = ~$72/month) on top of the underlying compute. ECS has no control plane charge.

EKS also runs on Fargate or EC2 nodes, same model as ECS.

### Service mesh on AWS

For microservices needing sophisticated networking (traffic splitting, retries, mTLS, observability), service meshes:

- **AWS App Mesh** (being deprecated as of 2026): AWS-native service mesh.
- **Istio on EKS**: most popular open-source mesh, runs on K8s.
- **Linkerd on EKS**: lighter alternative.

For most applications, service meshes are overkill. Start with ALB or API Gateway and add service mesh only when you have a specific need.

### Service discovery

How services find each other:

- **AWS Cloud Map**: service discovery for ECS/EKS, integrates with Route 53.
- **DNS**: assign DNS names to services; clients resolve them.
- **Load balancer**: services find each other via shared LB.
- **Kubernetes native**: K8s services with cluster DNS.

For ECS, Cloud Map or internal ALB is the common pattern. For EKS, K8s services with cluster DNS is standard.

### Container registry

You need somewhere to store container images:

- **ECR (Elastic Container Registry)**: AWS-managed registry. Private by default. Integrates with ECS/EKS, IAM, image scanning.
- **Docker Hub / GitHub / GitLab / Quay**: third-party options.

For AWS workloads, ECR is the default. Cheaper, integrated, lifecycle policies for old image cleanup.

### Service-to-service auth

For service-to-service auth within your VPC:

- **IAM roles for tasks**: each ECS task has an IAM role, automatically gets temporary credentials. Use these for AWS API calls.
- **mTLS between services**: certificates managed by ACM Private CA or self-managed.
- **JWTs / API tokens**: traditional service-to-service auth.

For "ECS task A calls S3", use IAM role on the task. For "ECS task A calls ECS task B's HTTP API", use mTLS or JWTs depending on requirements.

### Sidecar pattern

Each service runs alongside helper containers (sidecars) that handle cross-cutting concerns:

- **Log forwarding**: sidecar tails app logs, ships to CloudWatch.
- **Metrics export**: sidecar exposes Prometheus metrics.
- **Service mesh proxy**: Envoy or similar for mesh capabilities.
- **Auth proxy**: handles OAuth/OIDC before requests reach the app.

Sidecars add complexity but cleanly separate concerns. Common in K8s; available in ECS via multi-container task definitions.

### Container deployment strategies

Common patterns:

- **Rolling update**: replace containers gradually. Default for ECS services.
- **Blue/green**: stand up new fleet, switch traffic, terminate old. Built-in for ECS via CodeDeploy.
- **Canary**: shift small percentage of traffic to new version, expand if healthy. ALB weighted routing + automation.

ECS makes rolling updates easy. Blue/green requires CodeDeploy. Canary requires custom automation or a service mesh.

### Autoscaling

Containers should scale based on load:

- **Target tracking**: maintain target CPU/memory/request-count. Most common.
- **Step scaling**: rules like "scale up 2 tasks if CPU > 80% for 5 minutes."
- **Scheduled scaling**: predictable patterns (scale up during business hours).

For ECS: Application Auto Scaling integrates with target tracking on CloudWatch metrics. Set min/max task counts, target metric, AWS handles the rest.

For EKS: Horizontal Pod Autoscaler + Cluster Autoscaler (or Karpenter) handle scaling pods and underlying nodes.

### Cost management

Containers can be cost-effective if right-sized:

- **Right-size container resources**: don't over-provision CPU/memory per task.
- **Fargate vs EC2**: Fargate is convenient but more expensive per vCPU. At significant scale, EC2 mode + Savings Plans is cheaper.
- **Spot for non-critical workloads**: ECS supports Fargate Spot and EC2 Spot, 60-90% cheaper.
- **Shut down dev clusters off-hours**: scheduled scaling to zero.

For typical web app traffic, Fargate is often cheaper than equivalent EC2 because of utilization gains. For high-utilization workloads at scale, EC2 wins.

### When NOT to use containers

Some workloads still fit other models better:

- **Simple APIs with variable traffic**: Lambda might be cheaper and simpler.
- **Static sites**: S3 + CloudFront.
- **One-off scripts**: Lambda or AWS Batch.
- **Legacy software with VM-specific requirements**: EC2.
- **GPU workloads**: SageMaker or EC2 with GPU.

Containers aren't always the right answer. Match tooling to workload.

### App Runner — the simplest option

For straightforward web apps, AWS App Runner:

- Point at a container image or source code repo.
- AWS builds (for source) and runs the container.
- Handles load balancing, autoscaling, TLS, deployments.
- No infrastructure to configure.

Use case: simple web app or API where you don't need ECS/EKS sophistication. Costs more per resource than Fargate but eliminates configuration entirely.

### Lambda vs containers

Lambda and Fargate overlap:

- **Lambda**: function-as-a-service, max 15 min, max 10 GB memory, no GPU, per-invocation billing.
- **Fargate**: container-as-a-service, long-running OK, more resource flexibility, per-second billing.

For HTTP APIs behind a load balancer, both work. Lambda simpler for variable/spiky traffic; Fargate cheaper for sustained traffic with full container control.

For event-driven processing, Lambda is usually simpler — native integration with most AWS event sources.

For containerized monoliths or polyglot teams: Fargate.

### Real-world choosing

A practical decision tree:

- **Is it a simple HTTP API or web app?** → App Runner or Lambda.
- **Sporadic or event-driven?** → Lambda.
- **Containerized app, AWS-only, want minimal ops?** → ECS Fargate.
- **Already using Kubernetes?** → EKS (Fargate or EC2).
- **High scale and want to optimize cost?** → ECS or EKS on EC2 with Savings Plans.
- **Special requirements (GPU, specific OS, etc.)?** → EC2 directly.

Most teams should default to ECS Fargate or Lambda. EKS only if K8s is the right tool for the problem, not just because it's popular.

### CI/CD for containers

Building and deploying containers:

- **Build**: CodeBuild, GitHub Actions, GitLab CI, etc.
- **Image registry**: ECR.
- **Deploy**: CodeDeploy for blue/green, or direct ECS service updates.
- **Testing**: run tests in CI before pushing image.

A typical pipeline: commit → CI builds image → tests run → push to ECR → update ECS service / EKS deployment → rolling update.

For ECS, infrastructure-as-code (CloudFormation, CDK, Terraform) defines services and tasks. For EKS, Helm charts or kustomize define deployments.

### Multi-region containers

For global deployments:

- **Replicate to multiple regions**: each region has its own cluster.
- **Route 53** routes traffic based on latency or health.
- **ECR Cross-Region Replication** for images.
- **Service discovery per region** (Cloud Map or K8s).

True multi-region is operationally complex. Most workloads should start single-region and add regions only when latency or compliance demand it.

### Common mistakes

A few patterns to avoid:

- **Choosing EKS for prestige** when ECS would do.
- **Over-allocating container resources** (cost waste).
- **No container image scanning** (security risk).
- **No service health checks** (failures take down traffic).
- **Sidecar proliferation** that complicates debugging.
- **Service mesh adoption** before there's a need.
- **No cleanup of old images** in ECR (cost accumulates).

## Three real-world scenarios

**Scenario 1: A startup choosing between ECS and EKS.**
Greenfield SaaS, small team, no K8s experience, AWS-only. Pick ECS Fargate. Less to learn, less to operate, AWS-native integrations work better, no $72/month control plane charge per cluster. Adding K8s would mean a new skill set for the team and operational complexity they don't need. Could reconsider EKS in 2-3 years if K8s portability or specific features matter.

**Scenario 2: A company migrating from on-prem Kubernetes.**
Their team has 5 years of K8s experience, dozens of Helm charts, existing CI/CD pipelines targeting K8s. EKS on Fargate keeps their K8s expertise productive on AWS. Migration is mostly cloud-specific adjustments (AWS IAM, ALB instead of NGINX Ingress, etc.) rather than learning a new orchestrator.

**Scenario 3: A high-scale workload optimizing cost.**
Web app at 1000 RPS sustained. Originally on ECS Fargate at $5K/month. Migrated to ECS on EC2 with Savings Plans: ~$2K/month for the same throughput. The Fargate convenience wasn't worth the 2.5x cost at this scale. For early-stage workloads with variable traffic, Fargate's premium is worth paying; at scale, EC2 mode + Savings Plans wins.

## Common mistakes to avoid

- **EKS by default** when ECS fits.
- **Over-allocated container resources**.
- **No image scanning** (Trivy, ECR scanning, etc.).
- **Sidecar proliferation**.
- **Service mesh** without specific need.
- **No image cleanup** in ECR.
- **Long-lived secrets** in container images.

## Read more

- AWS ECS User Guide.
- AWS EKS User Guide.
- AWS Whitepaper: "Containers on AWS."
- AWS Well-Architected Framework — Container Lens.

## Summary

- **App Runner / Lambda**: simplest container deployment for HTTP services.
- **ECS Fargate**: AWS-native containers, serverless, low operational overhead.
- **ECS EC2**: cheaper at scale; more operational work.
- **EKS**: managed Kubernetes for teams already using K8s.
- **Container registry**: ECR for AWS workloads.
- **IAM task roles** for service-to-AWS auth.
- **Service discovery** via Cloud Map or K8s native.
- **Autoscaling**: target tracking on CPU/memory/request count.
- **Default to ECS Fargate** for new container workloads on AWS.

Next: the Well-Architected Framework.
