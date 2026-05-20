---
module: 5
position: 1
title: "Vercel vs self-hosted"
objective: "Where Next.js wins or loses on each."
estimated_minutes: 7
---

# Vercel vs self-hosted

## The hosting question

Next.js is built by Vercel, and Vercel is the canonical deployment target. But Next.js can run on any Node.js host, in Docker, on Kubernetes, on AWS, on your laptop. Choosing where to host is a real decision with cost, performance, and operational implications.

The short version: Vercel is dramatically simpler and tightly integrated. Self-hosted gives more control and can be cheaper at scale. Most teams should start on Vercel; some have reasons to self-host.

## What Vercel provides

Vercel turns "deploy my Next.js app" into a one-click operation:

- **Git-based deploys.** Push to main → auto-deploy. PRs get preview URLs.
- **Edge network.** Global CDN with 100+ points of presence.
- **Serverless functions.** Server Components and Server Actions run as serverless functions automatically.
- **Edge functions.** Middleware runs at edge.
- **Image optimization.** `next/image` cached at the edge.
- **Analytics, monitoring, logs.** Built-in.
- **Custom domains, SSL.** One-click setup.
- **Branch previews.** Every PR gets a unique URL.
- **Rollback.** One-click revert to any previous deploy.

The integration is tight. Things that take days to set up elsewhere are automatic.

## What self-hosting requires

To self-host a Next.js app you'll need:

- **A Node.js server.** Runs `next start` after `next build`.
- **A reverse proxy.** Caddy, Nginx, or similar for TLS termination and routing.
- **A CDN.** CloudFront, Cloudflare, or similar for static assets.
- **Image optimization.** Either install Sharp on the server or use an external service.
- **Monitoring.** Logs, metrics, error tracking — Datadog, Grafana, Sentry, etc.
- **CI/CD.** GitHub Actions, GitLab CI, or similar.
- **SSL certificates.** Let's Encrypt via Caddy or manual.

Each is a chunk of work. Most production-quality self-hosted Next.js deployments take weeks to set up properly.

## Hosting options

Beyond Vercel, common Next.js hosts:

- **Cloudflare Pages / Workers.** Strong on edge; some Node.js compatibility gaps for Server Actions and middleware-with-Node-APIs.
- **AWS Amplify.** Reasonable for Next.js; less Next.js-aware than Vercel.
- **Netlify.** Good for content sites; less optimal for full SSR/Server Actions.
- **Railway, Render, Fly.io.** Simple Node.js hosts with auto-scaling.
- **Self-managed VPS.** DigitalOcean droplet, Hetzner, AWS EC2 + Caddy + Node.
- **Docker on Kubernetes.** Full control; significant setup cost.
- **Coolify, Dokploy.** Open-source self-host platforms; PaaS-like UX on your own infrastructure.

Each has trade-offs. Vercel's tight integration is hard to beat for first-class Next.js features.

## When Vercel wins

For most teams:

- **Small to mid-sized apps.** Free tier is generous; Pro starts at $20/mo.
- **Teams without dedicated DevOps.** No infrastructure management.
- **Static + ISR + SSR + Edge mix.** All work seamlessly.
- **Preview deployments.** Game-changer for code review.
- **Edge middleware.** Runs globally without infra setup.

The total-cost-of-ownership including engineering time almost always favors Vercel for teams under 50 engineers.

## When self-hosting wins

Specific scenarios:

**1. Strict data-residency or compliance.**
Vercel is largely US-centric. If your data must stay in specific regions (GDPR with EU-only requirement, government compliance), self-host in your required region.

**2. Air-gapped or on-prem.**
Enterprise customers sometimes require deployment behind their firewall. Self-host required.

**3. Extreme cost optimization.**
At very high traffic ($5k+/month Vercel bills), running on a $200/mo VPS can be dramatically cheaper if you have the ops capability.

**4. Custom infrastructure needs.**
WebSocket servers, long-running background jobs, large file uploads — these often fit better outside Vercel's serverless model.

**5. Already-existing infrastructure.**
If your company runs everything on Kubernetes already, adding Next.js to the same cluster is sometimes simpler than introducing Vercel.

## Cost comparison

Rough numbers:

**Vercel Hobby (free):**
- Generous for small projects.
- 100GB bandwidth/mo.
- Serverless function execution limits.
- No commercial usage.

**Vercel Pro ($20/mo + usage):**
- 1TB bandwidth.
- Higher function limits.
- Custom domains.
- Most small-to-mid teams.

**Vercel Enterprise (custom):**
- Tailored for large orgs.
- Advanced security, compliance features.

**Self-hosted (rough numbers):**
- $20-100/mo for a small VPS to start.
- Scales linearly with traffic.
- Engineering time costs add up.

For most apps, Vercel is competitive on raw cost. The difference is engineering hours.

## Performance comparison

**Vercel:**
- Global edge network.
- Edge functions run at edge POPs.
- Automatic image optimization.
- ISR served from CDN.

**Self-hosted (single-region VPS):**
- One server location.
- Image optimization on your server.
- Need to add CDN separately.

For global apps, Vercel's edge network is a significant performance win out of the box.

For region-specific apps (one country), a well-configured self-hosted setup can match or beat Vercel's latency for that region.

## Feature compatibility

Some Next.js features have hosting nuances:

- **ISR:** Works on Vercel out of the box; requires shared storage in self-hosted distributed setups.
- **Image optimization:** Vercel handles this; self-hosted needs Sharp on the server or an external service.
- **Middleware on Edge:** Vercel runs at edge; self-hosted runs on your server (slower).
- **Server Actions:** Work everywhere but Vercel's serverless functions auto-scale.
- **draftMode and preview content:** Cookies + cache invalidation; works everywhere with care.
- **Streaming:** Requires HTTP/2 support; Vercel handles, most modern proxies do.

Self-hosting Next.js is genuine and supported; you just have to set up more pieces.

## The escape hatch

A pragmatic approach: start on Vercel for speed; design with portability in mind:

- Don't depend on Vercel-specific environment.
- Use abstractions for image storage, databases, queues.
- Keep state in your own database, not Vercel KV (unless you're committed).
- Pin Node version explicitly.

If you outgrow Vercel later, migration is straightforward. If you stay, you didn't lose anything.

## Migration path

If you're on Vercel and want to self-host:

1. Containerize the app: `Dockerfile` based on `node:20-alpine`, build, run.
2. Set up Caddy or Nginx for TLS.
3. Configure CDN (Cloudflare in front of your server is easy).
4. Migrate any Vercel-specific environment variables.
5. Test on staging.
6. Cut over DNS.

A weekend project for a well-organized app; a multi-week migration for one with heavy Vercel-specific dependencies.

## Open-source PaaS

A growing category: Coolify, Dokku, Dokploy, Caprover. These give you Vercel-like deploy-on-git workflows on your own infrastructure.

- **Coolify:** Polish, growing community, self-host friendly.
- **Dokku:** Lighter, longer-running, Heroku-style.
- **Caprover:** Docker-based, batteries included.

If you want PaaS DX without Vercel lock-in, these are real options. Setup is a few hours; ongoing maintenance is real.

## Common mistakes

- **Optimizing hosting cost prematurely.** Engineering time costs more.
- **Self-hosting without ops capacity.** Production fires.
- **Switching off Vercel without good reason.** Lose a lot of integrated features.
- **Locking heavily into Vercel-specific features.** Hard to migrate.
- **Not testing on Vercel preview deployments.** Local works ≠ Vercel works.

## Summary

- Vercel is dramatically simpler for Next.js; built for it.
- Self-hosting is genuine but requires real DevOps work.
- Vercel wins on engineering simplicity; self-hosted can win on compliance, cost at scale, or specific infrastructure needs.
- Design for portability if you might switch later.
- Open-source PaaS (Coolify, Dokku, Caprover) bridges the gap.
- Most teams should start on Vercel and consider switching only with specific triggers.

Next: environment variables and secrets.
