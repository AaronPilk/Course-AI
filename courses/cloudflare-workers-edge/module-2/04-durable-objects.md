---
module: 2
position: 4
title: "Durable Objects — coordination primitive"
objective: "Strong consistency where you need it."
estimated_minutes: 7
---

# Durable Objects — coordination primitive

## What Durable Objects are

Durable Objects (DOs) are single-leader, globally-addressable JavaScript objects with persistent storage. Each DO instance:

- Has a unique ID.
- Exists in exactly one place at any moment (the "leader" location, chosen near first access).
- Has its own private SQLite-backed storage (durable across requests).
- Provides strong consistency — operations on one DO are linearizable.

DOs solve the coordination problem that Workers' globally-distributed model creates: when you need a single source of truth for a particular entity (chat room state, game session, rate-limit counter), DOs give you one.

## When to reach for DOs

**Strong consistency required.**

- Rate limiting where exact counts matter.
- Game state shared by N players.
- Chat rooms or shared documents.
- Transactional counters or balances.
- Order of operations matters across requests.

**Coordination, not scale.**

DOs are about one-instance-per-entity, not scale. A chat room with 100 users is one DO; a game with 4 players is one DO; a user's rate-limit counter is one DO (keyed by user ID). Many entities = many DOs.

## The architecture

```ts
// src/chat-room.ts
export class ChatRoom {
  state: DurableObjectState;
  
  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
  }
  
  async fetch(request: Request): Promise<Response> {
    // Handle requests to this specific room.
    const url = new URL(request.url);
    
    if (url.pathname === '/messages') {
      const messages = await this.state.storage.get<Message[]>('messages') || [];
      return Response.json(messages);
    }
    
    if (url.pathname === '/send' && request.method === 'POST') {
      const msg = await request.json<Message>();
      const messages = await this.state.storage.get<Message[]>('messages') || [];
      messages.push(msg);
      await this.state.storage.put('messages', messages);
      return new Response('Sent');
    }
    
    return new Response('Not found', { status: 404 });
  }
}

// src/index.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const roomId = url.pathname.split('/')[2];  // /room/abc-123/send
    
    // Get the DO instance for this room:
    const id = env.ROOM.idFromName(roomId);
    const stub = env.ROOM.get(id);
    
    // Forward request to the DO:
    return stub.fetch(request);
  },
};

export { ChatRoom };
```

```toml
# wrangler.toml
[[durable_objects.bindings]]
name = "ROOM"
class_name = "ChatRoom"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["ChatRoom"]
```

The Worker routes requests to the right DO; the DO handles state for that specific room.

## Naming DOs

Two patterns to address a DO:

**By name:** stable string ID becomes a DO instance.

```ts
const id = env.ROOM.idFromName('room-abc-123');
const stub = env.ROOM.get(id);
```

Same name → same DO instance globally. Use for entities with stable IDs (users, rooms, accounts).

**By unique ID:** generate a fresh ID for a new DO.

```ts
const id = env.ROOM.newUniqueId();
const stub = env.ROOM.get(id);
// Persist the id.toString() somewhere if you need to address this DO later.
```

For ephemeral things or when you want Cloudflare to choose the location.

## Storage

Each DO has its own SQLite storage (or KV-style API):

```ts
// KV-style:
await this.state.storage.put('key', value);
const value = await this.state.storage.get('key');
await this.state.storage.delete('key');
const list = await this.state.storage.list({ prefix: 'msg:' });

// SQL (newer SQLite-backed DOs):
await this.state.storage.sql.exec('CREATE TABLE messages (id, body)');
const result = this.state.storage.sql.exec('SELECT * FROM messages WHERE id = ?', id);
```

Storage is private to this DO; persists across requests and even across restarts of the DO. Up to 10GB per DO.

## Strong consistency

A DO is single-threaded. Each request runs to completion (or awaits) before the next starts on the same DO. No concurrent modifications; no race conditions on this DO's state.

```ts
async incrementCounter() {
  const count = (await this.state.storage.get<number>('count')) || 0;
  await this.state.storage.put('count', count + 1);
  return count + 1;
}
```

Even if 100 simultaneous requests hit this method, they're serialized through the DO. Each sees the previous's update. No "lost update" anomaly.

For rate limiting:

```ts
async checkRateLimit(userId: string, maxPerMin: number): Promise<boolean> {
  const now = Date.now();
  const windowStart = Math.floor(now / 60000) * 60000;
  const key = `count:${windowStart}`;
  
  const count = (await this.state.storage.get<number>(key)) || 0;
  if (count >= maxPerMin) return false;
  
  await this.state.storage.put(key, count + 1, { expirationTtl: 120 });
  return true;
}
```

Exact counts; no overcount. Strict rate limiting works perfectly with DOs.

## Use cases

**Real-time apps:**

- WebSocket connections (covered Module 4).
- Live cursors and collaboration.
- Multiplayer games.

**State coordination:**

- Shopping cart per user.
- Reservation systems (seat selection, slot booking).
- Distributed locks.

**Rate limiting and quotas:**

- Per-user request limits.
- Per-IP abuse prevention.
- API key quotas.

**Workflow state:**

- Multi-step user flows.
- Saga orchestration.
- Long-running background tasks.

## DO RPC

Newer pattern: DOs expose typed RPC methods directly:

```ts
export class ChatRoom extends DurableObject {
  async addMessage(msg: Message) {
    const messages = await this.ctx.storage.get<Message[]>('messages') || [];
    messages.push(msg);
    await this.ctx.storage.put('messages', messages);
  }
  
  async getMessages(): Promise<Message[]> {
    return (await this.ctx.storage.get<Message[]>('messages')) || [];
  }
}

// Worker calls:
const stub = env.ROOM.get(env.ROOM.idFromName('room-123'));
await stub.addMessage({ user: 'aaron', text: 'hi' });
const messages = await stub.getMessages();
```

Cleaner than fetch-based RPC; type-safe. The newer DO pattern.

## Alarms — scheduled work per DO

DOs can set alarms (one-time scheduled callbacks):

```ts
async fetch(request: Request) {
  // Set alarm for 1 hour from now:
  await this.state.storage.setAlarm(Date.now() + 60 * 60 * 1000);
  return new Response('Alarm set');
}

async alarm() {
  // Runs at the scheduled time:
  await this.sendReminder();
  // Schedule next:
  await this.state.storage.setAlarm(Date.now() + 24 * 60 * 60 * 1000);
}
```

Useful for: scheduled notifications, cleanup tasks, periodic state checks. Per-DO; survives restarts.

## Cost model

Each DO instance costs per request + storage:

- **$0.15 per million requests** to DOs.
- **$0.20 per GB-month** for storage.
- **CPU time** charged for active processing.

For light coordination (rate limiting, sessions), cheap. For heavy traffic to a single DO (millions of requests), can add up; but the strong consistency is hard to replicate elsewhere.

## Limits

- **Storage:** 10GB per DO.
- **Memory:** standard Worker limits.
- **Request rate:** ~1000 req/sec per DO (single-threaded by design).
- **Hibernation:** idle DOs sleep, restart on next request.

For per-user state, the per-DO rate limit isn't an issue (one user generates limited traffic). For shared-state DOs (popular chat room), it can be — partition by sub-key, or accept the bottleneck.

## When NOT to use DOs

- **No coordination needed.** Just use KV / D1 / R2.
- **Massive throughput on one entity.** DOs are single-threaded.
- **Read-heavy with low coordination needs.** KV is cheaper for reads.
- **OLAP queries across many entities.** D1 or external analytics fit.

DOs are a specialized tool. Use them when you genuinely need coordination; otherwise simpler primitives.

## Local development

```bash
wrangler dev
```

Spins up local DOs with in-memory storage. Behavior matches production; storage doesn't persist between local restarts (use `--remote` for that).

For unit testing DOs, the Workers test framework (Vitest + Miniflare) provides utilities.

## Mistakes to avoid

- **Using DOs as a general database.** They're for coordination, not scale.
- **One DO for the whole app.** Bottleneck; should be per-entity.
- **No alarms cleanup.** Forgotten alarms fire forever.
- **Storing large blobs in DO storage.** Use R2; reference by key.
- **Treating DOs like Lambda.** They're long-lived; have state; behave like actors.

## Summary

- Durable Objects = single-leader, globally-addressable JS objects with persistent storage.
- One DO per entity (chat room, user, game session).
- Strong consistency via single-threaded execution.
- Storage: 10GB per DO; SQL or KV API.
- Use for coordination: rate limiting, real-time, transactional state.
- Alarms for per-DO scheduled work.
- Don't use as general database — use D1/KV instead.

Next module: Building real Workers.
