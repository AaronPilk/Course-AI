---
module: 3
position: 3
title: "Cloudflare Pages — sites and the Jamstack model"
objective: "Deploy a static or Next.js site to Pages."
estimated_minutes: 8
---

# Cloudflare Pages — sites and the Jamstack model

## The puzzle

You have a Next.js app or a static site. You need to deploy it globally with low latency, behind Cloudflare, with CI from your git repo. Cloudflare Pages is the product designed for this.

## The simple version

Pages is Cloudflare's static + Jamstack hosting:

- **Connect a git repo** (GitHub, GitLab).
- **Builds on push**, deploys globally in under a minute.
- **Preview deploys** for every branch / PR.
- **Free tier** generous; paid tier scales.
- **Integrates with Workers** for server-side logic at the edge.

It's competitive with Netlify and Vercel for many workloads.

## The technical version

### What Pages is

Pages handles:

- **Static site hosting** (any framework that outputs static files).
- **Jamstack** (static + dynamic via Functions or Workers).
- **SSR / edge rendering** for frameworks that support it (Next.js Edge Runtime, Nuxt, Remix, SvelteKit, Astro).
- **Git-based deploys** with preview deploys per branch.
- **Custom domains, SSL, CDN** automatic.

### Setting up a Pages project

1. **Cloudflare dashboard** → Pages → Connect to Git.
2. **Authorize** GitHub/GitLab; select repo.
3. **Build settings**:
   - Framework preset (Next.js, Nuxt, Astro, etc.) → auto-detected for most.
   - Build command (`npm run build`).
   - Output directory (`out`, `dist`, `.next`, etc.).
4. **Environment variables** for build and runtime.
5. **Deploy** — Cloudflare builds and deploys to a `*.pages.dev` URL.

Subsequent pushes trigger redeploys automatically. Branch pushes get preview URLs.

### Framework support

**Next.js**: full SSR/SSG/ISR via Edge Runtime. Use `@cloudflare/next-on-pages` for the build adapter.

**Nuxt**: edge mode native.

**SvelteKit**: `@sveltejs/adapter-cloudflare`.

**Remix**: Cloudflare adapter.

**Astro**: native via Pages.

**Vanilla React (Vite, CRA)**: works as static SPA.

**Pure HTML / CSS / JS**: deploys without a build step.

### Functions

Pages Functions are basically Workers, defined in your project as files:

```
my-pages-project/
  functions/
    api/
      hello.ts  → /api/hello
      users/
        [id].ts → /api/users/:id
```

Each file exports an `onRequest` handler. Same Worker runtime; same bindings. The framework's file-based routing maps URLs to handlers automatically.

```ts
// functions/api/hello.ts
export const onRequest = async ({ request, env }) => {
  return Response.json({ message: "Hello from the edge" });
};
```

Functions deploy alongside your static site; serve dynamic routes at the same domain.

### Custom domains

Add a custom domain in Pages settings. Cloudflare provisions SSL automatically (via Universal SSL). Point your domain's CNAME / A record at your Pages project. Done.

If your domain is already on Cloudflare DNS, this is a single click.

### Build caching

Pages caches `node_modules` and your framework's build cache (`.next/cache`, etc.) between builds. Subsequent builds are faster.

For aggressive caching, configure framework-specific cache directories in build settings.

### Preview deploys

Every branch push gets a unique preview URL (`branch-name.project.pages.dev`). PRs to the main branch get preview deploys linked from GitHub. Preview environments use the same configuration as production unless overridden.

Pattern: open a PR, get a preview URL, click through, verify the change visually. Standard workflow on Pages.

### Pages vs. Vercel vs. Netlify

The three are competitive. Quick comparison:

| Aspect | Pages | Vercel | Netlify |
|---|---|---|---|
| Free tier | Very generous | Generous | Generous |
| Next.js | Strong (Edge Runtime) | Strongest (native) | Adequate |
| Build minutes | High | Capped | Capped |
| Egress | Free | Bandwidth-billed | Bandwidth-billed |
| Edge functions | Workers (V8) | Vercel Functions (V8) | Netlify Edge (Deno) |
| Bandwidth | Generous | Generous | Generous |
| Lock-in | Some | Some | Some |

Pages is often cheapest at scale (free egress is big for high-traffic sites). Vercel has tighter Next.js integration. Netlify has been the longest in this space.

For a Next.js app where deepest framework support matters, Vercel is hard to beat. For most other workloads, Pages is competitive or cheaper.

### Limits

Free tier:

- 500 builds/month.
- Unlimited bandwidth.
- 20,000 files per deploy.

Paid tier (~$20/month):

- 5,000 builds/month.
- Concurrent builds.
- Larger limits.

### When Pages is the right call

- Static sites and Jamstack apps.
- Next.js apps that work with Edge Runtime.
- Frontend-only projects where you want simple deploys.
- High-traffic sites where egress matters.

### When to look elsewhere

- Heavy Next.js SSR / ISR that doesn't fit Edge Runtime — Vercel might be better.
- Deep integrations with non-Cloudflare services that have first-party Vercel/Netlify support.
- Workloads requiring real Node runtime (not V8 isolates).

## Three real-world scenarios

**Scenario 1: The Pages + Workers stack.**
A team built their frontend on Pages and backend on Workers, sharing the same Cloudflare account and bindings. Free tier covered both during early traction. Deploys were git push → preview → merge. Ops was minimal.

**Scenario 2: The Vercel migration.**
A team built on Vercel using Next.js features that didn't fit Edge Runtime (heavy ISR, specific Node APIs). They moved to Pages and hit gaps. Reverted to Vercel for the Next.js parts; kept Cloudflare for edge concerns. Hybrid worked.

**Scenario 3: The bandwidth save.**
A team's video-heavy site cost $400/month in Vercel bandwidth. They moved to Pages (free egress). Same site, $0 bandwidth cost. Saved $4.8K/year.

## Common mistakes to avoid

- **Assuming all Next.js features work on Pages.** Edge Runtime has gaps.
- **Forgetting to set environment variables** — build fails or runtime errors.
- **No preview deploys per branch** — config oversight; turn on.
- **Hardcoding domains** — use custom-domain config, not hardcoded URLs.
- **Pushing secrets in `[vars]`** — use Pages secrets surface, not git vars.

## Read more

- [Cloudflare Pages docs](https://developers.cloudflare.com/pages/)
- [Next on Pages](https://github.com/cloudflare/next-on-pages)
- [Pages Functions](https://developers.cloudflare.com/pages/functions/)

## Summary

- **Pages** is Cloudflare's static + Jamstack hosting.
- **Connect git, build on push, deploy globally** in under a minute.
- **Functions** are file-based Workers; same runtime, same bindings.
- **Custom domains** with automatic SSL.
- **Preview deploys per branch / PR**.
- **Competitive with Vercel and Netlify**; free egress is a major economic win.
- **Best for**: static sites, Jamstack, Next.js Edge Runtime, high-traffic / bandwidth-sensitive apps.

Next: Durable Objects, KV, R2, D1 — Cloudflare's storage primitives.
