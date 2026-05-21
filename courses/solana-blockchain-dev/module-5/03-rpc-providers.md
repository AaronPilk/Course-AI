---
module: 5
position: 3
title: "RPC providers and rate limits"
objective: "Choose, configure, and scale RPC infrastructure."
estimated_minutes: 5
---

# RPC providers and rate limits

## What RPC does

Solana RPC = HTTP + WebSocket endpoint validators expose. Your dApp talks to RPC to:
- Read account data.
- Send transactions.
- Subscribe to changes.
- Query block / slot info.

Without good RPC, your dApp dies under load.

For: critical infrastructure choice.

## Public RPC limits

`api.mainnet-beta.solana.com`:
- ~40 requests per 10 seconds per IP.
- No SLA.
- Frequently rate-limited.
- Not for production.

Devnet / testnet less constrained but still rate-limited.

For: avoid production use.

## RPC providers

| Provider | Strengths | Pricing |
|----------|-----------|---------|
| Helius | Solana-specialized; webhooks; enhanced APIs (DAS) | Free → $$ |
| QuickNode | Multi-chain; reliable; global | $$ |
| Triton | Bare-metal performance; high-volume | $$$ |
| Alchemy | Multi-chain; mature; great tooling | $$ |
| Ankr | Public + paid tiers | Free → $ |
| Syndica | Solana-native; trader/MEV use cases | $$ |
| Chainstack | Multi-chain managed nodes | $ → $$ |

For: provider selection.

## Helius enhanced APIs

```typescript
// Get NFTs (DAS standard)
const nfts = await fetch(`https://mainnet.helius-rpc.com/?api-key=${KEY}`, {
  method: "POST",
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "getAssetsByOwner",
    params: { ownerAddress: wallet }
  })
})

// Priority fee estimation
const fees = await fetch(`https://mainnet.helius-rpc.com/?api-key=${KEY}`, {
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "getPriorityFeeEstimate",
    params: [{ accountKeys: [hotAcc] }]
  })
})

// Webhooks: receive on-chain events at your endpoint
```

Solana-specific superpowers.

For: feature-rich integration.

## Connection setup

```typescript
const connection = new Connection(
  process.env.NEXT_PUBLIC_RPC_URL,
  {
    commitment: "confirmed",
    wsEndpoint: process.env.NEXT_PUBLIC_WS_URL,
    confirmTransactionInitialTimeout: 60_000
  }
)
```

Separate WebSocket endpoint for subscriptions.

For: production setup.

## Failover

```typescript
class FailoverConnection {
  constructor(urls) {
    this.connections = urls.map(url => new Connection(url, "confirmed"))
    this.current = 0
  }

  async call(method, ...args) {
    for (let i = 0; i < this.connections.length; i++) {
      try {
        return await this.connections[this.current][method](...args)
      } catch (err) {
        this.current = (this.current + 1) % this.connections.length
      }
    }
    throw new Error("All RPCs failed")
  }
}
```

Resilience against provider outages.

For: production reliability.

## Caching

```typescript
const cache = new Map()
async function getCachedAccount(pubkey) {
  const key = pubkey.toString()
  if (cache.has(key)) return cache.get(key)

  const data = await connection.getAccountInfo(pubkey)
  cache.set(key, data)
  setTimeout(() => cache.delete(key), 10_000)   // 10s TTL
  return data
}
```

Saves RPC calls on hot data.

For: rate limit management.

## Batched requests

```typescript
const accounts = await connection.getMultipleAccountsInfo([pubkey1, pubkey2, pubkey3])
```

One round trip vs. three.

For: efficiency.

## getProgramAccounts pitfalls

```typescript
const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
  filters: [{ dataSize: 165 }, { memcmp: { offset: 0, bytes: '...' } }]
})
```

Powerful but expensive. Providers often paginate or charge extra. Use with caution; prefer indexed APIs (DAS, GraphQL services).

For: don't accidentally DOS yourself.

## WebSocket subscriptions

```typescript
const subId = connection.onAccountChange(pubkey, (info) => {
  console.log("Updated:", info.lamports)
}, "confirmed")

const logSubId = connection.onLogs(programId, ({ logs }) => {
  console.log("Program logs:", logs)
})

// Cleanup
await connection.removeAccountChangeListener(subId)
await connection.removeOnLogsListener(logSubId)
```

Better than polling for live updates.

For: real-time UX.

## Geyser

Validators expose Geyser plugins for high-throughput data streaming. Providers use this internally.

End-users: usually consume via provider's enhanced API (webhooks, websocket).

For: enterprise / institutional users.

## Cost optimization

Typical app costs:
- 1k DAU → free tier providers.
- 10k DAU → $50-200/mo.
- 100k DAU → $500-2000/mo + enhanced APIs.

Optimize:
- Cache aggressively.
- Use WebSockets for live data.
- Batch requests.
- Use indexer for complex queries.

For: budgeting.

## Indexers + GraphQL

```typescript
// Helius / Triton / Hyperledger / custom
import { GraphQLClient } from "graphql-request"

const client = new GraphQLClient("https://api.helius.xyz/graphql")
const query = `
  query {
    nfts(owner: "${wallet}") {
      mint
      name
      image
    }
  }
`
const { nfts } = await client.request(query)
```

For complex queries that getProgramAccounts can't handle efficiently.

For: scalable data layer.

## Production checklist

- [ ] Paid RPC provider with SLA.
- [ ] Failover to second provider.
- [ ] WebSocket subscriptions instead of polling.
- [ ] Cache hot data with TTL.
- [ ] Monitor RPC error rates.
- [ ] Use enhanced APIs (DAS for NFTs).
- [ ] Set commitment carefully (confirmed default).
- [ ] Implement retry with exponential backoff.

For: production maturity.

## Mistakes to avoid

- **Public RPC in production.** First scale hit fails.
- **No caching.** Hammer the RPC unnecessarily.
- **Polling every second.** Use subscriptions.
- **getProgramAccounts without filters.** Massive cost / timeout.

## Summary

- Choose paid RPC (Helius, QuickNode, Triton) for production.
- Cache, batch, WebSocket subscribe.
- Enhanced APIs save tons of work.
- Failover + retries for reliability.

Next: mainnet deployment + security.
