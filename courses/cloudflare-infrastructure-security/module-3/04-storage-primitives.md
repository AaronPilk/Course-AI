---
module: 3
position: 4
title: "Durable Objects, KV, R2, D1 — Cloudflare's storage primitives"
objective: "Pick the right storage primitive for your use case."
estimated_minutes: 10
---

# Durable Objects, KV, R2, D1 — Cloudflare's storage primitives

## The puzzle

Cloudflare offers four very different storage primitives. They're often confused. Picking the wrong one means rewriting later or fighting the platform.

This lesson is what each is for, when to pick it, and when not to.

## The simple version

- **KV** — global eventually-consistent key-value store. Fast reads, slow writes, ~60s consistency. Use for config, feature flags, cache.
- **R2** — object storage like S3 with free egress. Use for files, media, backups.
- **D1** — SQLite at the edge. Use for read-heavy relational data.
- **Durable Objects** — single-threaded stateful actors with strong consistency. Use for real-time coordination per entity (a room, a game session).

Mix as needed. Many production apps use 2-3.

## The technical version

### KV — eventually-consistent key-value

```js
// Write
await env.MY_KV.put("user:123", JSON.stringify({ name: "Alex" }));

// Read
const data = await env.MY_KV.get("user:123");
```

Strengths:

- Globally replicated; reads fast from any PoP.
- Cheap.
- Simple API.

Limits:

- **Eventually consistent** — writes propagate in ~60 seconds. A write isn't guaranteed visible from another PoP immediately.
- **High write latency** (~50-100ms typical).
- **Key/value size limits**: 512 bytes for keys, 25 MiB for values.
- **List operations are slow** — designed for direct key access.

When to use:

- **Configuration** — feature flags, app settings.
- **Cache layer** — slow-changing computed values.
- **Session storage** — if you tolerate ~60s lag on changes.
- **Lookup tables** — slug → id, ID → metadata.

When NOT to use:

- Real-time data needing strong consistency.
- Write-heavy workloads.
- Anything where stale reads cause bugs.

### R2 — object storage

```js
// Upload
await env.MY_BUCKET.put("path/to/file.jpg", fileBlob, {
  httpMetadata: { contentType: "image/jpeg" }
});

// Download
const obj = await env.MY_BUCKET.get("path/to/file.jpg");
if (obj) {
  const data = await obj.arrayBuffer();
}
```

Strengths:

- **Free egress** — you don't pay to serve files.
- Compatible with S3 API (most S3 clients work).
- Per-object metadata, versioning, lifecycle rules.
- Strong consistency on writes.

Limits:

- Per-bucket and per-object size limits (generous).
- Slightly newer ecosystem than S3.

When to use:

- File hosting (images, videos, downloads).
- Backups and archives.
- Media for the web (egress-heavy patterns).
- S3 migrations to escape egress bills.

When NOT to use:

- Workloads needing AWS-specific S3 integrations.
- Very rare per-object access patterns where Glacier-style cold storage matters.

### D1 — SQLite at the edge

```js
// Read
const result = await env.MY_DB
  .prepare("SELECT * FROM users WHERE id = ?")
  .bind(userId)
  .first();

// Write
await env.MY_DB
  .prepare("INSERT INTO users (id, name) VALUES (?, ?)")
  .bind(userId, name)
  .run();
```

Strengths:

- Full SQL (SQLite).
- Strong consistency on writes.
- Migrations via `wrangler d1 migrations`.
- Globally replicated reads.

Limits:

- **Write throughput limited** — D1 isn't a high-write OLTP database.
- **Complex joins on large tables** can be slow.
- **Per-database size** limit (currently 10 GB; growing).
- **Eventual write replication** — writes go to a primary; reads from replicas can lag briefly.

When to use:

- **Read-heavy app data**: product config, user profiles (low write rate).
- **Edge caches** of common queries.
- **Small/medium apps** where SQLite-class scale is enough.

When NOT to use:

- High-write transactional workloads.
- Complex relational queries over millions of rows.
- Apps requiring true Postgres features (advanced indexing, full-text search, JSON queries, etc.).

For those: keep Postgres on Supabase/Neon/RDS; access from Workers via Hyperdrive.

### Durable Objects — stateful actors

```js
// Worker code addresses a specific Durable Object instance
const objectId = env.MY_ROOM.idFromName("room-42");
const obj = env.MY_ROOM.get(objectId);
const response = await obj.fetch("https://.../message");

// Inside the Durable Object class
export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.messages = [];
  }
  
  async fetch(request) {
    // This entire class runs single-threaded for this specific instance
    const url = new URL(request.url);
    if (url.pathname === "/message") {
      const msg = await request.json();
      this.messages.push(msg);
      await this.state.storage.put("messages", this.messages);
      return Response.json({ ok: true });
    }
  }
}
```

Strengths:

- **Single-threaded per instance** — no race conditions on per-object state.
- **Persistent state** via `state.storage` (key-value within the object).
- **Addressable by name or ID** — `idFromName("room-42")` always returns the same instance.
- **WebSocket support** — perfect for real-time coordination.

Limits:

- Single-threaded means each instance handles requests sequentially.
- State per instance, not globally queryable.
- Designed for **many small instances**, not few large ones.

When to use:

- **Real-time collaboration** — one DO per document/room.
- **Game state** — one DO per match.
- **Coordinated counters / rate limiters** — one DO per user/key.
- **WebSocket hubs** — one DO per channel.

When NOT to use:

- Workloads needing cross-instance queries (DOs don't share state).
- High global concurrency on a single instance.
- Anything that fits a regular DB better.

### Combining primitives

A real-world app might use:

- **D1** for primary app data (users, products).
- **KV** for feature flags and config (low-write, global).
- **R2** for user uploads (files).
- **Durable Objects** for real-time chat rooms.
- **Workers AI** for inference.

Each plays its role. Don't try to force one to do another's job.

### Decision flowchart

```
Need to store data on Cloudflare?
  ├─ Files/media? → R2
  ├─ Real-time per-entity coordination? → Durable Objects
  ├─ Relational data with SQL? → D1 (read-heavy) or external Postgres (write-heavy)
  └─ Simple key-value with eventual consistency? → KV
```

### Pricing snapshot

Roughly (varies; check current):

- **KV**: cheap. Per-read and per-write pricing.
- **R2**: storage-based + Class A/B operations. **Free egress.**
- **D1**: read/write rows pricing + storage.
- **Durable Objects**: request count + storage + compute time.

For small apps, free tier covers most. Costs grow with scale; track per-primitive.

### Migration paths

Migrations between Cloudflare primitives are possible but real work:

- **D1 → external Postgres**: export, import, switch bindings. Some refactor.
- **KV → D1**: depends on schema; KV is schemaless.
- **R2 ↔ S3**: nearly seamless via S3-compatible API.

Pick deliberately; you can change later but it's not free.

## Three real-world scenarios

**Scenario 1: The right mix.**
A team built a CMS: D1 for content, KV for fast lookups (slug → content_id), R2 for media. Workers stitched them together. Free tier covered early growth; paid tier was affordable as traffic scaled.

**Scenario 2: The KV consistency surprise.**
A team used KV for user session data. Sessions updated in one region weren't visible in another for ~60s. Users hitting different PoPs saw stale sessions. They moved sessions to D1 (strong consistency) and kept KV for read-only config.

**Scenario 3: The Durable-Object collaboration win.**
A team built a real-time collaborative editor. Each document was a Durable Object. The DO held the doc state, broadcast changes via WebSocket, persisted to its own storage. No race conditions; clean scaling per-document. Replaced what would have been complex backend code.

## Common mistakes to avoid

- **KV for strong-consistency needs.** ~60s lag will break the app.
- **D1 for high-write workloads.** Hits limits; consider external Postgres.
- **DO for low-concurrency state.** Just use a DB if state isn't real-time.
- **R2 + AWS-only tooling.** Most S3 clients work but some AWS-specific tools don't.
- **No backups/snapshots.** Cloudflare's resiliency is good but treat as cattle-not-pets only if you have backups elsewhere.

## Read more

- [Cloudflare Workers KV](https://developers.cloudflare.com/kv/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)

## Summary

- **KV** = eventually-consistent global key-value. Config, cache, lookups.
- **R2** = S3-compatible object storage with free egress. Files, media, backups.
- **D1** = SQLite at the edge. Read-heavy relational data.
- **Durable Objects** = single-threaded stateful actors. Real-time per-entity coordination.
- **Mix them** based on workload shape. No single primitive fits everything.
- **External Postgres** for heavy write/relational; access via Hyperdrive from Workers.

That wraps Module 3. Next: security at the edge.
