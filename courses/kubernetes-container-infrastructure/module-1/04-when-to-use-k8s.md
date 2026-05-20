---
module: 1
position: 4
title: "When Kubernetes is the right tool (and when it isn't)"
objective: "Decide if you actually need K8s."
estimated_minutes: 8
---

# When Kubernetes is the right tool (and when it isn't)

## The puzzle

Kubernetes is the default answer in many conferences and team discussions. It's also wrong for many of the situations where it's chosen. The honest question isn't "Is Kubernetes good?" — it is, for what it does. The honest question is "Does my situation need what Kubernetes offers, given what it costs?"

## The simple version

K8s is the right tool when:

1. **Multiple services** that need consistent orchestration.
2. **Variable scale** that benefits from auto-scaling primitives.
3. **Existing K8s expertise** on the team.
4. **Multi-environment portability** is a real requirement (cloud-to-cloud, cloud-to-on-prem).
5. **Specific patterns** (operators, CRDs, complex scheduling) you need.

K8s is the wrong tool when:

1. **Single small service** — a PaaS or VM does fine.
2. **Small team without ops appetite** — operational burden is real.
3. **Hobby projects** — overkill.
4. **Greenfield AWS-only, no K8s experience** — ECS Fargate is usually better.
5. **Workload doesn't fit** (stateful DBs, latency-critical kernel work).

Pick deliberately, not by default.

## The technical version

### The actual cost of Kubernetes

K8s isn't free. Real costs:

- **Cluster cost**: managed control plane is ~$72/month per cluster minimum + worker nodes.
- **Add-on cost**: Ingress controller, observability stack, cert-manager, etc. — each runs containers and uses resources.
- **Engineering time**: learning curve is months; ongoing operations is continuous.
- **Cluster upgrades**: every 3-4 months a new version; old ones go out of support.
- **Cognitive overhead**: every team member needs at least basic K8s knowledge.
- **Debugging complexity**: more moving parts = more failure modes.

These are real, ongoing costs. For workloads where K8s' capabilities matter, they're worth it. For simpler workloads, they're tax with no return.

### What K8s gives you

What you get for the cost:

- **Unified API** across all your workloads.
- **Self-healing**: failed Pods restarted automatically.
- **Service discovery**: services find each other by name.
- **Load balancing**: built-in between Pods.
- **Rolling updates**: deploy without downtime.
- **Config and secret management** as first-class objects.
- **Resource limits** and prioritization.
- **Portable abstractions**: same YAML works on different clouds (mostly).
- **Ecosystem**: Helm charts, operators, tooling.

For multi-service apps with operational maturity, this list is genuinely valuable. For a small Node.js app, much of it is overhead.

### Alternatives by use case

**Single service, AWS-only, small team**: ECS Fargate, App Runner, or Lambda. Easier, cheaper, faster.

**Single service, want zero ops**: PaaS like Render, Fly.io, Railway, Vercel. Deploy from git in minutes.

**Microservices, AWS-only, team comfortable with ECS**: ECS Fargate. Less complexity than EKS.

**Microservices, multi-cloud or hybrid**: K8s makes sense. The portability story is real here.

**Microservices, large team with K8s experience**: K8s. The team knows it; tooling is built around it; investing in K8s expertise compounds.

**ML training and serving**: K8s with Kubeflow / specialized operators is increasingly common.

**Stateful databases**: avoid K8s unless you have a good reason. RDS, Cloud SQL, or self-managed on VMs is usually better.

### The team factor

Honestly the biggest factor: does your team know K8s?

If yes:
- The learning curve is amortized.
- Tooling, runbooks, debugging skills exist.
- New services slot into existing patterns.
- K8s adds less marginal cost.

If no:
- Months to ramp up.
- Operational mistakes are likely early.
- You're investing in expertise that doesn't pay back if your workload is small.
- Often better to start with something simpler and migrate later if needed.

For a small team starting fresh, the right answer is rarely K8s on day one — even if it might be the right answer at year 3.

### Greenfield AWS — ECS vs EKS decision

A common question: starting fresh on AWS, ECS or EKS?

**ECS Fargate** if:
- AWS-only, no multi-cloud plans.
- Team doesn't know K8s deeply.
- Simpler operations valued more than ecosystem.
- Fewer than a dozen microservices.

**EKS** if:
- Existing K8s expertise.
- Multi-cloud is real (you'll deploy the same workload to GCP or on-prem eventually).
- Complex orchestration patterns (custom operators, advanced scheduling).
- Large team with diverse workloads.
- Hiring K8s-experienced engineers is part of the strategy.

Most greenfield AWS workloads should start ECS Fargate. EKS comes later if requirements shift.

### When K8s shines

A few patterns where K8s is genuinely the best tool:

**Internal developer platforms**: K8s + GitOps + service mesh + observability = an internal PaaS for many app teams. K8s' uniformity across many services pays back.

**Multi-tenant SaaS at scale**: tenant isolation via namespaces; consistent operations across many services.

**Edge / on-prem / hybrid**: K8s runs everywhere — laptop (Minikube, kind), data center, every cloud. For workloads spanning environments, K8s' portability matters.

**Stateful operators**: when a team builds a "Postgres-as-a-service" operator, K8s is the right substrate.

**Custom scheduling**: ML training that needs GPU-specific scheduling, batch with priorities, multi-tenant fairness.

For these, the K8s investment pays back.

### When K8s loses

A few situations where K8s is the wrong choice:

**Simple web app behind a load balancer**: App Runner, Lambda + API Gateway, or a PaaS does it in days. K8s does it in weeks.

**Critical single-instance database**: K8s' Pod lifecycle (replace on failure) conflicts with database durability assumptions. Managed databases or VMs are usually better.

**Latency-critical kernel work**: K8s adds some networking and scheduling overhead. For sub-millisecond paths, dedicated hardware beats K8s.

**Single-team simple deploy**: the operational discipline K8s requires is overkill for one team running one or two services.

**Static sites**: S3 + CloudFront. Don't put a static site on K8s.

### Honest signals

Some signals that K8s might actually be right:

- "We have 20+ microservices each with their own deploy story; we need consistency."
- "We're deploying to AWS today, GCP next year, on-prem after that."
- "We hire heavily for K8s expertise; new engineers expect it."
- "We're building an internal platform; K8s is the substrate."

Some signals that K8s is wrong:

- "Our DevOps lead read a conference talk and decided we need it."
- "It's the industry standard."
- "It looks good on resumes."
- "All the cool companies use it."

The former are workload-driven; the latter are fashion-driven. Workload-driven wins.

### Migration paths

If you start without K8s and might need it later:

- **Containerize early**: even if you're on ECS Fargate, you're using OCI container images. Same image runs on K8s.
- **12-factor app**: stateless, config-via-env, externalize state. Makes K8s migration easier.
- **IaC for infrastructure**: Terraform/CDK with your services. Moving to K8s changes deployment, not infrastructure design.
- **Loose coupling between services**: communication via well-defined APIs / queues. Doesn't matter where each runs.

Done right, "we'll switch to K8s when we need it" is a real option.

### The honest framework

For each new workload, ask:

1. **What does K8s give me here?** (List specific capabilities.)
2. **What does it cost in engineering, operations, and complexity?**
3. **Are there simpler alternatives that solve the actual problem?**
4. **Do I have or am I committing to K8s expertise?**
5. **Will this workload grow into K8s' sweet spot, or stay simple?**

If the answers favor K8s, choose K8s. If they favor simpler options, choose those without apologizing for not using K8s.

### The honest takeaway

K8s is a powerful tool with real costs. It's well worth investing in when you need its capabilities. It's poorly worth investing in when you don't.

Industry default isn't a good reason to choose anything. Workload requirements + team capabilities are.

For this course: assuming you've decided to use K8s (or need to understand it because you work with teams that have), the rest of the lessons cover how it works. The right-tool question matters first — without it, you spend weeks learning a tool you didn't need.

## Three real-world scenarios

**Scenario 1: Solo developer, side project.**
Initial instinct: K8s, because everyone says so. After 2 weeks of YAML, networking debugging, and operational reading, realized the project could have been deployed in 30 minutes on Render. Migrated. Now spends time on the actual project. Lesson: K8s for a side project is almost certainly overkill.

**Scenario 2: Series A startup with 6 microservices.**
Considering ECS Fargate vs EKS. Team has no K8s experience. Chose ECS Fargate. Got to production in 2 months instead of 6. Operating cost lower; debugging easier; less to know. Could revisit K8s in 1-2 years if requirements change. Right call for current state.

**Scenario 3: Mid-size enterprise migrating from VMs.**
40 teams, dozens of services, diverse stacks, on-prem and cloud presence. Standardized on K8s as internal platform substrate. Built platform team to operate the cluster fleet. Took 2 years to migrate. K8s pays back: uniform deployment, observability, security across all services. Right call for this scale.

## Common mistakes to avoid

- **Choosing K8s by default** without honest evaluation.
- **Choosing K8s because of resumes** instead of requirements.
- **Self-managing K8s** to "save money" — usually false economy.
- **Not investing in K8s expertise** but expecting K8s benefits.
- **Treating K8s as a magic solution** to scaling or reliability — it provides primitives; you build the system.

## Read more

- *Kubernetes: An Overview* (CNCF).
- Charity Majors' writing on cloud and operations.
- *Accelerate* by Forsgren, Humble, Kim — what actually drives high-performing teams.

## Summary

- **K8s shines when** multi-service + multi-environment + existing expertise + capabilities used.
- **K8s loses when** single small workload, no K8s expertise, simpler alternatives suffice.
- **Real costs**: cluster, add-ons, engineering, operations, cognitive overhead, upgrades.
- **Real benefits**: unified API, self-healing, service discovery, rolling updates, portability, ecosystem.
- **Greenfield AWS-only**: ECS Fargate usually beats EKS.
- **Pick deliberately**, not by default.
- **Containerize early** to keep options open.
- **Team expertise** is often the deciding factor.

That wraps Module 1. Next: core Kubernetes objects.
