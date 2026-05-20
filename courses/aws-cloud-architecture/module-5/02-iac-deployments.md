---
module: 5
position: 2
title: "Deployment and infrastructure as code"
objective: "Use CloudFormation, CDK, or Terraform sanely."
estimated_minutes: 8
---

# Deployment and infrastructure as code

## The puzzle

Click-ops — building AWS infrastructure through the console — is fine for learning. For anything production, it's a recipe for drift, irreproducibility, and 3am debugging sessions where nobody knows what changed. Infrastructure as Code (IaC) makes infrastructure deployable like code: versioned, reviewed, automated, reproducible.

## The simple version

Three popular IaC tools for AWS:

1. **CloudFormation**: AWS-native, JSON/YAML templates. Free, deep integration.
2. **AWS CDK** (Cloud Development Kit): write infrastructure in TypeScript/Python/etc., compiles to CloudFormation. AWS-native, more expressive.
3. **Terraform**: third-party, multi-cloud, HashiCorp's HCL. Most popular IaC tool overall.

All three work well. Pick based on team preferences and existing investment. For most new AWS-only projects, CDK is a reasonable default; Terraform if multi-cloud or existing investment.

Combined with CI/CD (CodePipeline, GitHub Actions, etc.), IaC enables: review every change, automated deploys, easy environment cloning, version control of infrastructure history.

## The technical version

### Why IaC

The click-ops failure modes:

- **Configuration drift**: prod and staging diverge over time.
- **Tribal knowledge**: only one person knows how it was set up.
- **No history**: who created this? when? why?
- **Slow recovery**: rebuilding after disaster is manual and error-prone.
- **Inconsistent environments**: dev/staging/prod differ in subtle ways.

IaC solves these by treating infrastructure like code: versioned in git, reviewed via PRs, deployed via CI/CD, rebuilt deterministically.

### CloudFormation

AWS-native IaC. Templates in JSON or YAML define resources:

```yaml
Resources:
  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: my-app-data
      VersioningConfiguration:
        Status: Enabled
```

Deploy via `aws cloudformation deploy` or via the console. CloudFormation creates the stack, tracks state, handles updates.

Strengths:

- AWS-native, every service supported.
- Free (you pay only for the resources).
- Drift detection.
- Stack rollback on failure.
- Cross-stack references and exports.
- Integration with AWS services (CodePipeline, etc.).

Weaknesses:

- YAML/JSON is verbose for complex setups.
- Learning curve for advanced features (intrinsics, custom resources).
- Updates can fail mid-way and leave inconsistent state.

CloudFormation is the foundation: even CDK and some Terraform configurations compile down to CloudFormation.

### AWS CDK

Write infrastructure in a real programming language (TypeScript, Python, Java, C#, Go):

```typescript
const bucket = new s3.Bucket(this, 'MyBucket', {
  bucketName: 'my-app-data',
  versioned: true,
});
```

CDK synthesizes CloudFormation templates from your code. Benefits:

- Use loops, conditionals, abstractions.
- Type safety in TypeScript.
- High-level constructs (e.g., `lambda.NodejsFunction` packages and deploys a Lambda).
- Reusable components.
- IDE support.

Tradeoffs:

- Adds a build step.
- The abstraction layer can hide what's actually deployed.
- TypeScript ecosystem volatility (less so as it matures).

For a team comfortable with TypeScript/Python, CDK is dramatically more pleasant than raw CloudFormation YAML for non-trivial infrastructure.

### Terraform

HashiCorp's tool, multi-cloud capable, very popular:

```hcl
resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-app-data"
}

resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.my_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}
```

Strengths:

- Multi-cloud (AWS, GCP, Azure, Cloudflare, etc.) — same tool.
- Huge community, many providers and modules.
- State management (Terraform tracks deployed state).
- Better at orchestrating across services and providers.
- Mature ecosystem.

Tradeoffs:

- State file management (S3 backend with locking).
- Provider versioning issues sometimes.
- New AWS services can lag in provider support.
- HCL is its own language to learn.

For multi-cloud or teams with existing Terraform expertise, Terraform. For AWS-only with TypeScript skills, CDK is often nicer.

### State management

CloudFormation and CDK store state in AWS internally. Terraform requires you to provide a state backend:

- **S3 + DynamoDB**: standard pattern, S3 for state file, DynamoDB for locking.
- **Terraform Cloud**: HashiCorp's managed backend.

State files are sensitive (may contain secrets). Treat as such: encrypted, access-controlled.

For teams: locking prevents concurrent modifications that corrupt state.

### Modular IaC

For non-trivial infrastructure, break into modules:

- **CloudFormation Nested Stacks**: stacks within stacks.
- **CDK Constructs**: classes that encapsulate resources.
- **Terraform Modules**: reusable groups of resources.

Common modules: VPC, ECS cluster, RDS database, observability stack. Build once, instantiate multiple times.

For multi-environment (dev/staging/prod), parameterize: same module, different parameters.

### Multi-environment patterns

Deploying to dev/staging/prod from the same code:

- **CloudFormation parameters / CDK contexts / Terraform variables**: pass environment-specific values.
- **Separate stacks per environment**: cleaner separation.
- **Separate accounts per environment**: best isolation.

Pattern: same IaC code, different parameter sets per environment, separate deploy pipelines per environment.

### CI/CD integration

IaC is most powerful when integrated with CI/CD:

- **Pull request → infrastructure plan**: see what changes before approving.
- **Merge to main → deploy to staging**: automatic.
- **Manual approval → deploy to prod**: human checkpoint for production.
- **CloudFormation drift detection runs periodically**: alert on out-of-band changes.

Tools: GitHub Actions, GitLab CI, AWS CodePipeline, CircleCI. All can run IaC deployments.

A typical pipeline:

1. Developer changes IaC code.
2. PR opened; pipeline runs `terraform plan` or `cdk diff`; results in PR comments.
3. Reviewer sees what will change.
4. Merge; pipeline deploys to staging.
5. After validation, manual or scheduled promotion to prod.

### Drift detection

Sometimes resources change outside IaC (someone clicks in the console, an emergency hotfix). Drift detection finds these:

- **CloudFormation Drift Detection**: built-in feature, runs on demand.
- **Terraform**: `terraform plan` shows differences.
- **AWS Config**: tracks resource configuration over time.

Regular drift detection (weekly or so) catches issues early. Fix by either updating IaC to match reality or reverting reality to IaC.

### Secrets in IaC

Don't put secrets in IaC code:

- **Reference Secrets Manager / Parameter Store**: IaC creates the secret store; secret value populated separately.
- **CloudFormation NoEcho**: parameter values not shown in stack outputs.
- **Terraform sensitive variables**: marked as sensitive, not shown in plan output.
- **Pre-deployed secrets**: created out-of-band, referenced by IaC.

The goal: IaC code in git contains no actual secret values, only references.

### Common IaC patterns

A few that show up everywhere:

**VPC stack**: VPC, subnets, IGW, NAT GWs, route tables. Built once per environment.

**Compute stack**: ECS cluster, ALB, services, task definitions.

**Data stack**: RDS, S3 buckets, KMS keys.

**Observability stack**: CloudWatch dashboards, alarms, log groups.

**Bootstrap stack**: IAM roles, base SCPs, account setup.

Each stack has clear boundaries; resources within a stack are tightly coupled, between stacks are loose.

### Avoid these IaC mistakes

A few patterns to avoid:

- **One huge stack** with everything: slow deploys, blast radius is huge.
- **Hard-coded environment names**: makes promotion painful.
- **No code review for IaC changes**: same standards as application code.
- **Secrets in version control**: even briefly is a leak.
- **Manual hotfixes never reflected in IaC**: drift accumulates.
- **No state backups** (Terraform): losing state = orphaned resources.

### Migration from click-ops

If you have existing console-built infrastructure, importing to IaC:

- **CloudFormer (deprecated)**: AWS tool that generated CloudFormation from existing resources.
- **`aws cloudformation create-stack` with `Import` flag**: import existing resources.
- **Terraform `import`**: import existing into Terraform state.
- **CDK `Imported` resources**: reference existing without managing.

Migration is gradual: start with new resources in IaC, import existing as you touch them, eventually everything is IaC.

### IaC for serverless

Serverless infrastructure (Lambda, API Gateway, etc.) suits IaC well:

- **AWS SAM (Serverless Application Model)**: CloudFormation extension for serverless.
- **Serverless Framework**: third-party, supports multiple clouds.
- **CDK**: high-level constructs for Lambda + API Gateway are concise.

For serverless workloads, IaC is even more important because there's nothing to click on — most config is in code.

### Real-world team practices

A mature team using IaC well:

- All production infrastructure in version control.
- PR review required for IaC changes.
- Automated `plan` / `diff` on PRs.
- Automated deploys to lower environments; manual approval for prod.
- Periodic drift detection.
- Secrets via Secrets Manager / Parameter Store, never inline.
- Tagging consistently applied via IaC.
- Disaster recovery via re-deploying IaC.

Building this discipline takes time but pays back enormously. Production outages from "I forgot what we did last time" become rare.

### Module versus monolith

For IaC architecture:

- **Monolithic stack**: one big stack for everything. Easy to reason about, slow to deploy, large blast radius.
- **Modular stacks**: separate stacks per logical component (network, compute, data, observability). Faster, smaller blast radius, harder to manage cross-stack dependencies.

For non-trivial setups, modular. For small projects, one stack is fine.

### Choosing between CloudFormation, CDK, and Terraform

Decision factors:

- **AWS-only? Use CDK or CloudFormation.**
- **Multi-cloud or potentially? Use Terraform.**
- **Team prefers programming languages? Use CDK or Terraform.**
- **Team prefers declarative? Use CloudFormation or Terraform HCL.**
- **Existing Terraform expertise? Stick with Terraform.**
- **Want AWS-native simplicity? CDK.**

There's no universally right answer. All three are production-grade. Pick one and use it consistently rather than mixing.

## Three real-world scenarios

**Scenario 1: A team adopts CDK after years of click-ops.**
Start: every change required walking to the AWS console. Adopted CDK incrementally: new resources in CDK from day one; existing resources imported gradually as touched. After 6 months, ~70% in CDK. Production changes now go through code review and automated deploys. Click-ops occasionally for emergencies, then reflected back in CDK.

**Scenario 2: Drift catching a missed change.**
Quarterly drift detection reveals a security group rule manually added during an incident weeks earlier. The rule was needed at the time but never made it into IaC. Drift detection found it. Team updated IaC to match (or removed the rule if no longer needed). Without drift detection, the next "redeploy from IaC" would have lost the rule unexpectedly.

**Scenario 3: Multi-environment scaling.**
Single environment originally. Now need dev/staging/prod and per-region. With IaC modules, spinning up new environments takes minutes: instantiate the same modules with different parameters. Without IaC, would have taken weeks per environment.

## Common mistakes to avoid

- **Click-ops production infrastructure** — guaranteed pain later.
- **Secrets in IaC code** — version control leak.
- **One huge stack** — slow, risky.
- **No code review for IaC changes**.
- **Manual hotfixes never reflected in IaC** — drift accumulates.
- **Mixing tools** (CloudFormation + Terraform + manual) inconsistently.
- **No state backups** for Terraform.

## Read more

- AWS CDK Developer Guide.
- AWS CloudFormation User Guide.
- Terraform AWS Provider docs.
- AWS Well-Architected Framework — Operational Excellence Pillar.

## Summary

- **IaC** treats infrastructure like code: versioned, reviewed, automated.
- **CloudFormation**: AWS-native, JSON/YAML, free.
- **CDK**: write IaC in programming language, compiles to CloudFormation.
- **Terraform**: multi-cloud, HCL, popular standard.
- **Modular stacks** for non-trivial setups.
- **CI/CD integration**: PRs trigger plan/diff; automated deploys.
- **Drift detection** catches out-of-band changes.
- **Secrets via Secrets Manager**, never in IaC code.
- **All three IaC tools** are production-grade; pick one consistently.

Next: cost optimization in detail.
