---
module: 1
position: 3
title: "Blocks, finality, and consensus"
objective: "Understand Proof of Stake mechanics and finality guarantees."
estimated_minutes: 5
---

# Blocks, finality, and consensus

## Proof of Stake transition

Since "The Merge" (Sept 2022), Ethereum runs Proof of Stake:
- Validators stake 32 ETH each (~$100k+ at typical prices).
- ~1M+ active validators.
- Energy use dropped 99.9%.
- Inflation dropped to ~0.5-1% / year.

For: current consensus model.

## Validator lifecycle

1. Stake 32 ETH to deposit contract.
2. Wait in activation queue (variable).
3. Active: propose blocks + attest to others.
4. Penalties for downtime or misbehavior (slashing).
5. Exit + withdraw (after queue).

For: economic incentives.

## Slot + epoch

- **Slot.** 12 seconds. One block proposer chosen.
- **Epoch.** 32 slots = 6.4 min.
- Per epoch: every validator attests once.

For: timing fundamentals.

## Block proposal

Each slot:
1. Validator pseudo-randomly chosen as proposer.
2. Proposer collects txs from mempool.
3. Builds block; broadcasts.
4. Other validators attest.

Block missed if proposer offline → no block that slot.

For: production cadence.

## Attestations

Per epoch, every validator attests to:
- Source: justified checkpoint.
- Target: justifiable checkpoint.
- Head: latest block.

Attestations aggregated; voted blocks become justified → finalized.

For: how consensus reaches finality.

## Finality

- **Justified.** Majority validators attested current epoch's checkpoint.
- **Finalized.** Two consecutive epochs justified. ~2 epochs = ~13 min.

After finalization, reversing requires slashing 1/3+ of validators (~$30B+ at 1M validators × $100k).

For: economic finality guarantee.

## Forking + chain selection

When two valid blocks proposed same slot (rare):
- Validators attest one or other.
- LMD-GHOST + Casper FFG = fork choice.
- Other becomes uncle / orphaned.

Reorg risk: 1-2 blocks deep occasionally; >7 blocks extremely rare.

For: confirmation depth planning.

## Slashing

Validator slashed if:
- Double-signs (proposes two blocks same slot).
- Double-attests.
- Surround-vote.

Penalty: 1+ ETH; large slashing events cascade penalty up to 32 ETH lost.

For: severe disincentive against attack.

## MEV-Boost + relays

Most validators run MEV-Boost:
1. Builders construct optimal blocks (capture MEV).
2. Submit to relays.
3. Validator picks highest-paying block.
4. Proposes that block.

Decentralizes block building from validator hardware.

For: where MEV value flows.

## EIP-4844 (proto-danksharding)

Added "blob transactions":
- L2s post compressed data as blobs.
- Blobs cheap (~$0.0001 per byte).
- Pruned after ~2 weeks.

Result: L2 fees dropped 90%+ in 2024.

For: scaling roadmap awareness.

## Future scaling

Roadmap (Vitalik's "Verge / Splurge / etc."):
- More blob space.
- Statelessness (clients don't store full state).
- Verkle trees (smaller proofs).
- Single Slot Finality (~12s finality).

For: long-term direction.

## Client diversity

Ethereum needs multiple validator clients to prevent single-bug outage:
- Execution: Geth (dominant), Nethermind, Besu, Erigon, Reth.
- Consensus: Lighthouse, Prysm (dominant), Teku, Nimbus.

Healthy if no single client > 33% (slashing tolerance).

For: ecosystem health.

## L2 finality

L2s have their own finality:
- **Optimistic rollups.** Finalize on L1 after 7-day challenge window.
- **ZK rollups.** Finalize when proof submitted to L1 (minutes-hours).
- **L2 sequencer.** Provides "soft confirmation" within seconds.

UX: L2 txs feel instant via sequencer; full settlement async.

For: L2 timing.

## Reading block data

```typescript
import { JsonRpcProvider } from "ethers"
const provider = new JsonRpcProvider(RPC_URL)

const block = await provider.getBlock("latest")
console.log("Number:", block.number)
console.log("Hash:", block.hash)
console.log("Timestamp:", block.timestamp)
console.log("Gas used:", block.gasUsed)
console.log("Base fee:", block.baseFeePerGas)
console.log("Tx count:", block.transactions.length)
```

For: monitoring.

## Confirmations for different stakes

| Stake | Recommended confirmations |
|-------|----------------------------|
| Small payment (<$100) | 1-2 |
| Medium ($100-$10k) | 6-12 |
| Large ($10k+) | 32-64 (finalized) |
| Exchange withdrawal | 12-32 |

For: balancing UX + safety.

## Mistakes to avoid

- **Acting on pending tx.** Reorg risk; use confirmed.
- **Confirmation count too low for large stakes.** Wait for finality.
- **Assuming L2 instant finality on L1.** Soft conf ≠ settled.
- **Validator centralization.** Lido, Coinbase, etc. concentrate stake.

## Summary

- Proof of Stake; ~1M validators; 12s slots; 6.4min epochs.
- Finality ~13 min via 2 consecutive justified epochs.
- MEV-Boost separates block building from proposing.
- L2 finality varies; soft confirmations seconds, full settlement minutes-days.

Next: dev environment setup with Hardhat / Foundry.
