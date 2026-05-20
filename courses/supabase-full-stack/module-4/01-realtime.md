---
module: 4
position: 1
title: "Realtime subscriptions explained"
objective: "Postgres logical replication and channels."
estimated_minutes: 7
---

# Realtime subscriptions explained

## Why realtime

Plenty of apps benefit from realtime updates: chat, presence indicators, collaborative editing, live dashboards, notifications, multiplayer games. Building this manually requires WebSockets, server-side state, subscription routing, and reconnection logic.

Supabase Realtime gives you this out of the box. It hooks into Postgres logical replication, watches for database changes, and broadcasts them over WebSockets to subscribed clients. Plus broadcast channels (no DB needed) and presence tracking (who's online).

## Three flavors of Realtime

**1. Database Changes (postgres_changes).** Listen for INSERT/UPDATE/DELETE on tables. The most common use case — anything that should appear in real time when data changes.

**2. Broadcast.** Send arbitrary messages between clients via channels. No database involvement. Use for ephemeral data like cursor positions, chat-typing indicators, ephemeral events.

**3. Presence.** Track which users are currently in a channel. Built on top of broadcast; handles join/leave events automatically.

## Database Changes — the basics

```ts
const channel = supabase
  .channel('public:messages')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();

// Later, to unsubscribe:
supabase.removeChannel(channel);
```

Now any INSERT into `messages` triggers the callback. Filter by event (`INSERT` / `UPDATE` / `DELETE` / `*`) or by table.

You can filter further by row-level criteria:

```ts
supabase
  .channel('public:messages:room_id=eq.abc-123')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'messages',
      filter: 'room_id=eq.abc-123',
    },
    handle
  )
  .subscribe();
```

Only changes matching the filter come through.

## How it works under the hood

Postgres logical replication streams a log of changes — every INSERT, UPDATE, DELETE on tables with replication enabled. Supabase's Realtime service consumes this stream and broadcasts to subscribed clients via WebSocket channels.

This means:

- **No polling.** The server pushes; clients receive.
- **Eventually consistent.** There's some replication lag (typically <1s).
- **Replication-enabled tables only.** You must enable replication on tables you want to subscribe to.

Enable via dashboard (Database → Replication → toggle table) or SQL:

```sql
alter publication supabase_realtime add table public.messages;
```

## Realtime and RLS

Realtime respects RLS. When a row changes, the broadcast goes only to subscribers who have permission to see that row.

But there are subtleties:

- For INSERTs and UPDATEs to flow through, the subscriber must have SELECT permission on the new row state.
- For DELETEs, the subscriber must have permission on the old row state.
- The `auth.uid()` in policies works correctly — Realtime carries the user's identity through.

This means RLS-protected realtime is safe out of the box. Subscribers don't see changes for rows they couldn't read normally.

For Realtime to evaluate RLS, your tables need to be set up correctly:

```sql
-- Enable RLS (you should have done this anyway).
alter table public.messages enable row level security;

-- Add appropriate policies.
create policy "Members read room messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.room_members
      where room_id = messages.room_id
        and user_id = auth.uid()
    )
  );
```

Subscribers to this table only get notified of messages from rooms they're in.

## Broadcast — for ephemeral data

Some data shouldn't live in the database — cursor positions in a collaborative editor, "user is typing" indicators, ephemeral game state. Broadcast channels let clients send messages to each other without DB involvement.

```ts
const channel = supabase.channel('room:abc-123');

// Subscribe to cursor messages.
channel
  .on('broadcast', { event: 'cursor' }, (payload) => {
    showCursor(payload.userId, payload.x, payload.y);
  })
  .subscribe();

// Send a cursor position.
channel.send({
  type: 'broadcast',
  event: 'cursor',
  payload: { userId: myUserId, x: 100, y: 200 },
});
```

Broadcast is fast (no DB write) but ephemeral (no persistence; only current subscribers see it).

## Presence — who's online

Built on broadcast. The library tracks who's joined a channel and notifies others of joins/leaves.

```ts
const channel = supabase.channel('room:abc-123');

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    console.log('Currently online:', state);
  })
  .on('presence', { event: 'join' }, ({ newPresences }) => {
    console.log('Joined:', newPresences);
  })
  .on('presence', { event: 'leave' }, ({ leftPresences }) => {
    console.log('Left:', leftPresences);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ user_id: myUserId, online_at: new Date().toISOString() });
    }
  });
```

The `track()` call announces presence. Other subscribers get a `join` event. When the user disconnects, others get a `leave` event automatically.

Presence handles the messy parts (timeouts, reconnects, garbage collection).

## Scaling considerations

Realtime is well-suited for moderate scale; less ideal at extreme scale without architecture work.

**Subscribers per channel.** A single channel can support thousands of subscribers. Multiple channels work in parallel — each channel is independent.

**Messages per second.** Database Changes events flow at the rate of database changes; typically not a problem at sub-thousands writes/sec. Broadcast can handle higher rates because it bypasses the DB.

**Connection count.** Each subscribed client maintains a WebSocket. At very high concurrent counts (100k+), you may need to architect around channel sharding or use a dedicated realtime service.

For most apps, default Supabase Realtime suffices. Twitter-scale needs custom architecture.

## Realtime in React (UI patterns)

A common pattern: keep a local state synced with a table via Realtime.

```tsx
function useMessages(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    // Initial fetch.
    supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at')
      .then(({ data }) => setMessages(data ?? []));
    
    // Subscribe to changes.
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        ({ new: newMsg }) => {
          setMessages((prev) => [...prev, newMsg as Message]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        ({ old }) => {
          setMessages((prev) => prev.filter((m) => m.id !== (old as Message).id));
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);
  
  return messages;
}
```

The hook fetches existing rows, then keeps them in sync via Realtime. Add UPDATEs similarly.

## Common pitfalls

**Forgetting to enable replication.** Tables aren't subscribed by default. Add to `supabase_realtime` publication.

**Subscribing without unsubscribing.** Memory leaks; orphan channels.

**Re-subscribing on every render.** useEffect dependency mistakes cause subscriptions to thrash.

**Trusting Realtime for the source of truth.** Use the database query for state; Realtime updates the cache.

**Heavy callbacks blocking processing.** Keep callbacks fast; defer heavy work.

## When NOT to use Realtime

- **Long-cycle data.** Batch updates that don't need instant propagation work fine with periodic refresh.
- **Privacy-sensitive realtime.** If you don't trust your RLS policies, don't rely on Realtime to filter.
- **Massive fan-out.** A single user-action triggering broadcast to millions; consider purpose-built infra.

For most app use cases — chat, dashboards, presence, collaborative editing — Realtime is excellent.

## Mistakes to avoid

- **No RLS on realtime tables.** Anyone sees everyone's changes.
- **Channel name collisions across users.** Use unique room/user IDs in channel names.
- **Subscribing without filter.** All changes flood the client.
- **Treating broadcast as durable.** It isn't; not persisted.
- **Forgetting reconnection logic.** Network blips happen; supabase-js handles auto-reconnect but verify.

## Summary

- Realtime = postgres_changes (DB) + broadcast (ephemeral) + presence (online tracking).
- Database Changes via Postgres logical replication; sub-second propagation.
- Respects RLS — subscribers see only rows they can read.
- Enable replication per-table via `supabase_realtime` publication.
- Broadcast for ephemeral cursor / typing / state.
- Presence for who's online in a channel.
- Unsubscribe in useEffect cleanup; filter subscriptions to avoid flooding.

Next: storage — buckets, policies, CDN.
