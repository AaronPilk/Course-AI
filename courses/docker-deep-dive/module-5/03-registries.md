---
module: 5
position: 3
title: "Registries — ECR, GHCR, Docker Hub"
objective: "Manage images and access at scale."
estimated_minutes: 6
---

# Registries — ECR, GHCR, Docker Hub

## The simple version

A registry stores images. You push images to it; clusters and developers pull from it. Major options:

- **Docker Hub**: the original; free public; rate-limited; paid private repos.
- **Amazon ECR**: AWS-native; integrates with IAM; ECR Public for public images.
- **GitHub Container Registry (GHCR)**: GitHub-integrated; great for repos hosted on GitHub.
- **Google Artifact Registry / Azure Container Registry**: cloud-specific.
- **Self-hosted (Harbor)**: full control; more operational work.

For production: a registry close to your compute. ECR for EKS; GHCR for GitHub Actions; Harbor or cloud registry for on-prem.

## The technical version

### Pushing and pulling

```
docker tag myapp:v1 registry.example.com/myteam/myapp:v1
docker push registry.example.com/myteam/myapp:v1
docker pull registry.example.com/myteam/myapp:v1
```

The registry hostname is the first part of the image reference. Default is Docker Hub (`docker.io`).

### Authentication

`docker login` stores credentials. CI systems use service accounts:

- **ECR**: IAM permissions; `aws ecr get-login-password | docker login --username AWS --password-stdin`.
- **GHCR**: PAT (personal access token) or GITHUB_TOKEN in Actions.
- **Docker Hub**: username/password or access token.

For Kubernetes: imagePullSecrets (with credentials) or IRSA-style federated identity for ECR.

### Tags and digests

Tags are mutable references (`v1.0`, `latest`). Digests are immutable content hashes (`sha256:abc123...`).

For production deploys, reference by digest: someone can retag `v1.0` to point at a different image, but the digest is always the same content.

```
docker pull myapp@sha256:abc123...
```

### Cleanup and retention

Registries fill up. Each push creates new layers; old tags accumulate. Configure retention:

- **ECR Lifecycle Policies**: delete untagged images after N days; keep only the last K tags.
- **GHCR**: cleanup via API or GitHub Actions.
- **Harbor**: built-in retention rules.

Set policies early. Without them, registry storage costs grow quietly.

### Rate limits

Docker Hub limits anonymous pulls (100 per 6h per IP) and authenticated free pulls (200). Production clusters hitting Docker Hub for base images can exhaust limits during deploys.

Mitigations:

- **Pull-through cache**: ECR Public, Harbor, or Distribution can proxy and cache Docker Hub. Limit hits the cache, not Docker Hub.
- **Mirror base images** to your own registry. Update mirrors on a schedule.
- **Paid Docker Hub** for higher limits if direct pulls are required.

For production K8s, never depend on Docker Hub for hot-path pulls without a cache.

### Multi-region / multi-cloud

For workloads in multiple regions:

- **ECR cross-region replication**: source region pushes; ECR replicates.
- **Manual mirroring**: scripts push to multiple registries.

Reduces pull latency and cross-region transfer costs.

### Private vs public

Most production images should be private. Public registry repos are scanned by the world; CVEs, license info, internal naming all leak.

For OSS projects, publish to public ECR, GHCR public, or Docker Hub. For internal apps, private.

### Tag conventions

Common conventions:

- Semantic version: `v1.2.3`, `v1.2`, `v1`.
- Git SHA: `git-abc123def`.
- Branch: `main`, `pr-456`.
- Combined: `v1.2.3-abc123-main`.

Maintain at least one fully-qualified tag per image (the SHA-based one) — guarantees uniqueness. Mutable tags (`latest`, `v1`) move; SHA tags stay.

### Repository structure

For a single team:

- `myteam/api:v1.2.3`
- `myteam/worker:v1.2.3`
- `myteam/migrator:v1.2.3`

For multi-team:

- `team-a/api`, `team-b/api` — separate paths, separate IAM.

ECR uses one repo per image name (`myapp` is the whole repo containing all tags). GHCR mirrors GitHub repos. Plan naming upfront.

### Common issues

- **Pull rate limits in CI**: pull-through cache.
- **Tag confusion**: someone retags `latest`; deploys break. Use immutable tags or digests in production.
- **Forgotten retention**: registry cost grows. Configure lifecycle policies.
- **Cross-account ECR**: IAM policies are fussy. Use ECR's repository policy for cross-account read.
- **Slow pulls**: registry far from compute. Use regional/replicated registries.

## Summary

- ECR / GHCR / Docker Hub / Harbor are the major options.
- Use digests for production references; tags for human-friendly references.
- Lifecycle policies prevent registry bloat.
- Pull-through cache or mirrors avoid Docker Hub rate limits.
- Private registries for internal images; public for OSS.
