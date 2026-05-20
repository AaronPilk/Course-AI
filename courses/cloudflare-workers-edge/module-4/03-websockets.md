---
module: 4
position: 3
title: "WebSockets and real-time"
objective: "Persistent connections via Durable Objects."
estimated_minutes: 6
---

# WebSockets and real-time

## The persistent-connection problem

HTTP request/response is stateless: connection opens, request, response, connection closes. Great for caching, simple to reason about.

WebSockets are different. The connection persists for minutes or hours. Server can push to client at any time. State accumulates per connection.

For Workers, persistent connections require Durable Objects — Workers themselves are stateless and may be torn down between requests; only DOs guarantee a single coordinator that connections can live in.

## The setup

A Worker upgrades the request to WebSocket and forwards to a DO:

```ts
// src/index.ts
export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname === '/ws') {
      // Upgrade to WebSocket via the DO:
      const upgradeHeader = request.headers.get('Upgrade');
      if (upgradeHeader !== 'websocket') {
        return new Response('Expected WebSocket', { status: 426 });
      }
      
      const roomId = url.searchParams.get('room') || 'default';
      const id = env.ROOM.idFromName(roomId);
      const stub = env.ROOM.get(id);
      return stub.fetch(request);
    }
    
    return new Response('Not found', { status: 404 });
  },
};

// src/chat-room.ts
export class ChatRoom {
  state: DurableObjectState;
  sessions: WebSocket[] = [];
  
  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
  }
  
  async fetch(request: Request): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    
    this.handleSession(server);
    
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
  
  handleSession(ws: WebSocket) {
    ws.accept();
    this.sessions.push(ws);
    
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data as string);
      this.broadcast(msg);
    });
    
    ws.addEventListener('close', () => {
      this.sessions = this.sessions.filter(s => s !== ws);
    });
  }
  
  broadcast(msg: any) {
    const data = JSON.stringify(msg);
    for (const ws of this.sessions) {
      try {
        ws.send(data);
      } catch (err) {
        // Connection dead; remove later
      }
    }
  }
}
```

Worker upgrades the request; routes to a DO based on room ID; DO accepts the WebSocket and handles messages.

## Client-side

```ts
const ws = new WebSocket('wss://my-worker.example.com/ws?room=lobby');

ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'hello', user: 'aaron' }));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log('Got:', msg);
};

ws.onclose = () => {
  console.log('Connection closed');
};
```

Standard WebSocket API; no Cloudflare-specific client code.

## Hibernation

Durable Objects can hibernate while WebSockets are connected:

```ts
async fetch(request: Request): Promise<Response> {
  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair);
  
  this.state.acceptWebSocket(server);  // hibernation-enabled accept
  
  return new Response(null, { status: 101, webSocket: client });
}

webSocketMessage(ws: WebSocket, message: string) {
  // Called when a message arrives; DO can be hibernating until then
  this.broadcast(message);
}

webSocketClose(ws: WebSocket, code: number, reason: string) {
  // Connection closed
}
```

`acceptWebSocket` (vs the older `accept`) lets the DO sleep when idle, saving cost. Cloudflare wakes it when a message arrives or another event triggers.

For chat rooms / collaborative apps where activity is bursty, hibernation cuts costs dramatically.

## Use cases

**Chat rooms.** Each room = one DO; users connect to the room's DO.

**Real-time dashboards.** Server pushes updates to connected clients.

**Multiplayer games.** Match state in a DO; players' WebSockets connect to it.

**Collaborative editing.** Document = DO; participants connect and exchange operations.

**Live cursors.** Page = DO; participants stream cursor positions.

**Notifications.** User = DO; backend pushes notifications to active connections.

## State within the DO

Combine WebSocket handling with DO storage:

```ts
async webSocketMessage(ws, message) {
  const msg = JSON.parse(message);
  
  if (msg.type === 'chat') {
    // Persist to history:
    const history = await this.state.storage.get<Message[]>('history') || [];
    history.push(msg);
    if (history.length > 1000) history.shift();  // cap
    await this.state.storage.put('history', history);
    
    // Broadcast:
    this.broadcast(msg);
  }
}
```

History survives reconnects, hibernation, DO restarts. New connections can ask for history on join:

```ts
const ws = new WebSocket('wss://.../ws');
ws.onopen = () => ws.send(JSON.stringify({ type: 'get_history' }));
```

```ts
async webSocketMessage(ws, message) {
  const msg = JSON.parse(message);
  if (msg.type === 'get_history') {
    const history = await this.state.storage.get<Message[]>('history') || [];
    ws.send(JSON.stringify({ type: 'history', messages: history }));
  }
}
```

## Authentication

For authenticated WebSocket connections, verify in the upgrade request:

```ts
async fetch(request: Request, env: Env) {
  if (url.pathname === '/ws') {
    // Verify auth before upgrading:
    const token = url.searchParams.get('token');
    const user = await verifyToken(token, env);
    if (!user) return new Response('Unauthorized', { status: 401 });
    
    const stub = env.ROOM.get(env.ROOM.idFromName(roomId));
    
    // Pass user info to the DO:
    const upgradeRequest = new Request(request.url, {
      headers: { ...Object.fromEntries(request.headers), 'X-User-Id': user.id },
    });
    
    return stub.fetch(upgradeRequest);
  }
}
```

Cookie-based auth: browser sends the cookie with WebSocket upgrade request automatically.

## Server-Sent Events (SSE) alternative

For server-to-client streaming without bidirectional communication, SSE is simpler:

```ts
async fetch(request: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 100; i++) {
        controller.enqueue(`data: ${JSON.stringify({ count: i })}\n\n`);
        await sleep(1000);
      }
      controller.close();
    },
  });
  
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

Client:

```ts
const sse = new EventSource('https://worker/sse');
sse.onmessage = (e) => console.log(JSON.parse(e.data));
```

SSE works in plain Workers (no DO needed for ephemeral streams). For persistent + bidirectional, WebSockets + DOs are required.

## Scaling

A single DO is single-threaded — handles thousands of concurrent WebSockets but not millions. For massive rooms:

**Shard by sub-room.** Big chat → multiple sub-rooms.

**Hierarchical DOs.** Coordinator DO + per-N-users sub-DOs that broadcast up.

**External pub/sub.** For very large scale, integrate with dedicated pub/sub (Redis pub/sub, NATS, etc.) and let Workers/DOs be the WebSocket termination layer.

For most apps (chat rooms with hundreds of users, collaborative docs with tens of editors), one DO per entity is plenty.

## Common gotchas

**Reconnection logic.** Clients must handle disconnects. Show "reconnecting" UI; queue local messages until reconnected; replay on connect.

**Backpressure.** If a client can't consume fast enough, server-side queues build up. Set send buffer limits.

**Connection limits.** Per-IP / per-account limits exist; for very high concurrency, plan capacity.

**Cost.** Long-lived connections + DO instances add up. Monitor; consider hibernation.

## Cost model

Workers + DOs WebSocket costs:

- Outgoing messages count as requests.
- DO duration when not hibernating.
- WebSocket connections billed separately on some plans.

For thousands of concurrent connections: typically a few dollars to a few tens of dollars per month. For millions: real planning needed.

## Mistakes to avoid

- **WebSockets without DOs.** Workers alone can't maintain state across messages.
- **Not using hibernation.** Idle connections rack up costs.
- **One mega-room DO.** Single-thread bottleneck.
- **Broadcasting to dead connections.** Track and prune sessions.
- **Forgetting reconnection.** Client UX breaks on every blip.

## Summary

- WebSockets in Workers require Durable Objects for stateful coordination.
- Worker upgrades the request; routes to a DO; DO handles connections.
- `acceptWebSocket` enables hibernation (cost savings for idle periods).
- Standard WebSocket API on the client; no special SDK.
- DO storage persists history across reconnects.
- SSE for server-to-client streaming without bidirectional needs.
- One DO per entity; shard for large rooms.

Next: Workers AI.
