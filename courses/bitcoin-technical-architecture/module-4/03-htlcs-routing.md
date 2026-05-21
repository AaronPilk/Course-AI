---
module: 4
position: 3
title: "HTLCs and routing"
objective: "Understand multi-hop payments and HTLC mechanics."
estimated_minutes: 5
---

# HTLCs and routing

## What an HTLC is

Hash Time-Locked Contract. Conditional payment:
```
"Pay X sats if recipient reveals preimage of hash H, before time T.
 Otherwise, refund to sender."
```

Used to coordinate multi-hop payments trustlessly.

For: routing core primitive.

## Multi-hop flow

Alice → Bob → Carol (Carol = recipient):

```
1. Carol generates random preimage R; hash(R) = H.
2. Carol creates invoice with H.
3. Alice sees H; constructs HTLC chain.
4. Alice sends HTLC to Bob: "Pay 10k+fee to whoever shows preimage of H within 2 hours."
5. Bob locks 10k for Carol: "Pay 10k to whoever shows preimage of H within 1 hour."
6. Carol reveals R to Bob; gets 10k.
7. Bob has R; reveals to Alice; gets 10k+fee.
```

Atomic: either all hops succeed or all rollback.

For: trustless routing.

## Why HTLCs work

The preimage R unlocks all HTLCs in chain. Once Carol reveals R, Bob can claim from Alice. Time-locks ensure stuck payments resolve.

Cryptographic guarantee, not trust.

For: trustless multi-hop.

## Routing fees

Each hop charges:
```
fee = base_fee + (amount * proportional_fee)
```

Example: base 1 sat, prop 1 ppm.
Send 100k sats: 1 + 100,000/1,000,000 = 1.1 sats fee.

For routes: sum of all hops' fees.

For: economic incentive for liquidity providers.

## Onion routing

Sender encrypts route in onion layers:
- Outer layer: only first hop can decrypt.
- Inner layer: only second hop can decrypt.
- Final layer: recipient.

Each hop only knows previous + next. Privacy similar to Tor.

For: payment privacy.

## Multi-Path Payments (MPP)

Split a single payment across multiple paths:
```
Pay 1M sats via:
  Path 1: 400k
  Path 2: 350k
  Path 3: 250k
```

All parts must complete; otherwise refund. Increases reliability + capacity.

For: large payment routing.

## AMP (Atomic Multi-Path)

Like MPP but with re-randomized hashes; sender uses single secret. Better privacy + reuse.

For: advanced privacy.

## Trampolines

Light wallets can't compute full network routes. Trampoline: outsource routing to a hub:
```
Light wallet → Trampoline node → ... → Recipient
```

Trampoline finds path; light wallet stays small.

For: mobile-friendly routing.

## Pathfinding heuristics

Algorithms optimize for:
- Lowest fee.
- Fewest hops.
- Highest probability of success.
- Privacy (random paths).

Each implementation has its own algorithm.

For: routing quality.

## Failed payment debug

Common reasons:
- No path with sufficient liquidity.
- Channel inflight HTLCs full.
- Node offline.
- Insufficient sender balance.
- Recipient invoice expired.

Lightning errors give hints; not always clear.

For: troubleshooting.

## Payment privacy

- Sender doesn't expose to intermediaries (onion routing).
- Recipient doesn't see sender (rendez-vous routing planned).
- Channels publicly known (gossip protocol).

Trade-off: routing requires visibility into channels.

For: realistic privacy model.

## Liquidity providers

Some operators run large nodes specifically to provide routing liquidity:
- Bitfinex, Strike, ACINQ.
- Earn from routing fees.
- Manage rebalancing.

For: who keeps Lightning liquid.

## Probing

Pre-payment query: send 0-amount HTLC to see if path exists; cancel before completion. Doesn't move sats but probes connectivity.

For: improving success rate.

## Mistakes to avoid

- **Sending without trying smaller test first.** Big payment fails.
- **Channels with hostile counterparties.** Force-closes increase.
- **No rebalancing.** Channels stuck unidirectional.

## Summary

- HTLC = hash + time-locked conditional payment.
- Multi-hop via HTLC chain; atomic guarantee.
- Onion routing for privacy.
- MPP / AMP / trampolines for advanced routing.
- Pathfinding optimizes fee + reliability + privacy.

Next: running a Lightning node.
