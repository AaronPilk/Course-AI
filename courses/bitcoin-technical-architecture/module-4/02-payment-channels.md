---
module: 4
position: 2
title: "Payment channels"
objective: "Understand how channels work mechanically."
estimated_minutes: 5
---

# Payment channels

## What a channel is

Two parties lock funds in a 2-of-2 multisig on L1. Off-chain, they exchange signed updates representing balance changes. Either can close anytime by broadcasting latest state to L1.

For: shared escrow with mutable balance.

## Opening a channel

```
1. Alice & Bob create 2-of-2 multisig address.
2. Alice deposits 1M sats (or split funding).
3. Funding tx broadcast to L1.
4. 6 confirmations → channel "open."
5. Both keep latest signed balance state.
```

Cost: 1 L1 tx fee.

For: setup.

## Off-chain payments

Alice → Bob pays 10k sats:
```
Initial state: Alice 1M, Bob 0
After 10k:     Alice 990k, Bob 10k
Both sign new state.
Old state must NOT be broadcast (penalty mechanism).
```

No L1 interaction. Instant + free.

For: scale.

## Commitment transactions

Each balance update produces a new commitment tx. Both parties hold signed copies. If one cheats by broadcasting old state, the other can punish (take all funds).

For: trustless update mechanism.

## Closing a channel

Two paths:
- **Cooperative close.** Both sign final balance; 1 L1 tx; clean.
- **Force close.** One party broadcasts latest state unilaterally; timelock delays before funds available.

Cost: 1 L1 tx fee (varies).

For: exit semantics.

## Penalty mechanism

If Bob broadcasts an old state (where he had more):
- Alice has time window (CSV delay).
- Alice broadcasts breach tx using penalty key.
- Alice takes 100% of channel.
- Bob loses everything.

Powerful incentive to play fair.

For: enforcement.

## Watchtowers

If Alice goes offline, Bob could broadcast old state undetected. Watchtowers monitor on Alice's behalf, broadcast penalty if needed.

For: offline protection.

## Channel capacity

Total channel capacity = funding amount.
- Alice's balance + Bob's balance = capacity.
- Liquidity in one direction limited by your side balance.

```
Capacity: 1M sats
Alice: 800k (can send up to 800k)
Bob: 200k (can send up to 200k)
```

For: liquidity planning.

## Inbound vs. outbound liquidity

- **Outbound.** Sats on your side; can send.
- **Inbound.** Sats on counterparty side; can receive.

If you only have outbound, you can pay but not receive.

For: balance management.

## Splicing

Add or remove funds without closing channel. New in 2024.

```
Pre-splice: Channel 1M sats
Splice-in: Add 500k → channel 1.5M
Splice-out: Remove 200k → channel 1.3M
```

Reduces closing + reopening costs.

For: dynamic capacity.

## Channel limits

- Max channel size: 0.16 BTC (default; wumbo channels remove this).
- Min channel size: 20k sats typical.
- Per-tx limit: ~5 BTC.

For: practical constraints.

## Routing

If Alice has no direct channel to Carol:
```
Alice → Bob → Carol (multi-hop)
```

Bob forwards in exchange for tiny fee. Onion routing hides intermediate hops.

For: network reachability.

## Source-based routing

Sender chooses path; network state needed to find route. Each implementation has routing algorithm:
- Direct channels (if available).
- Multi-hop (typically <5 hops).
- MPP (multi-path payment) splits across multiple paths.

For: routing complexity.

## Channel jamming

Attacker locks up channel capacity via failed payments. Active research; potential mitigations include up-front fees.

For: known vulnerability.

## Mistakes to avoid

- **No watchtowers + go offline.** Vulnerable to old-state attack.
- **All outbound, no inbound.** Can't receive.
- **Bad routing algo.** Payments fail.
- **Tiny channels with high fees.** Net negative.

## Summary

- Channel = 2-of-2 multisig + off-chain state.
- Open + close = 1 L1 tx each; off-chain unlimited tx.
- Penalty mechanism punishes cheaters.
- Watchtowers for offline protection.
- Capacity = funding; inbound + outbound matter.

Next: HTLCs and routing.
