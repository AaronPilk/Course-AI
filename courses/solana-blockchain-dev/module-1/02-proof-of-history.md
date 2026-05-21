---
module: 1
position: 2
title: "Proof of History + consensus"
objective: "Understand PoH, Tower BFT, and how Solana achieves fast finality."
estimated_minutes: 5
---

# Proof of History + consensus

## What PoH is

Proof of History = cryptographic clock built by hashing data continuously in sequence.

```
hash_0 = sha256("genesis")
hash_1 = sha256(hash_0)
hash_2 = sha256(hash_1)
...
```

Each hash proves "this happened after the previous." Insert transaction data at hash N → that transaction provably happened between hash N-1 and N.

For: ordering events without coordination between validators.

## Why PoH matters

Other blockchains: validators must coordinate "what time is it?" → slow consensus rounds.

Solana: PoH establishes a global verifiable clock. Validators don't have to agree on time — the clock just runs. They only need to agree on order, which PoH already provides.

Result: parallelism in block production. Validators stream blocks; no round-robin waiting.

For: appreciating throughput advantage.

## Slot vs. block

- **Slot.** 400ms time unit. Leader is chosen per slot.
- **Block.** Slot's actual produced output. Sometimes slots are skipped.
- **Epoch.** ~432,000 slots (~2 days). Validator set updates per epoch.

For: terminology in tooling + explorers.

## Tower BFT

Solana's consensus algorithm — PBFT variant using PoH for timestamping.

Validators vote on blocks. Each vote is locked-in for `2^N` slots — increasing lockup = increasing commitment. A finalized block has 32+ supermajority votes from current validator set.

For: how Solana finalizes.

## Confirmation levels

When tracking a transaction:
- **Processed.** Seen by one validator; could be reverted.
- **Confirmed.** Voted by supermajority; very unlikely reverted.
- **Finalized.** Locked by 32+ confirmations; permanent (~13s).

For: client-side UX choices (instant feedback vs. safety).

## Validator economics

To run a validator:
- Stake (typically 1k+ SOL or delegated).
- High-spec server: 12+ cores, 256GB RAM, 2TB NVMe SSD, 1 Gbps.
- Voting fees (~1 SOL/day).
- Rewards: inflation + transaction fees.

For: barriers to validator participation.

## Inflation + rewards

Solana inflation:
- Started at 8%; declining 15%/year toward 1.5% long-term floor.
- Distributed pro-rata to stake (validators + delegators).
- Burnt: 50% of transaction priority fees.

For: understanding tokenomics.

## Leader rotation

Leader (block producer) rotates every 4 slots (~1.6s). Schedule determined at epoch start by stake-weighted random.

For: load distribution across validators.

## Network forks + skipped slots

Sometimes:
- Leader is offline → slot skipped.
- Two valid forks emerge → Tower BFT resolves via vote weight.

Result: ~95% slot production typically; occasional re-org during congestion.

For: aware of mainnet realities.

## Firedancer

New validator client by Jump Crypto, written in C/C++. Goals:
- Higher throughput (1M TPS theoretical).
- Resilience via client diversity.
- Production-ready 2025-2026 timeframe.

For: future performance ceiling.

## Network outages

Causes of past Solana outages:
- DDoS via spam transactions overwhelming validators.
- Bug in consensus / state replay.
- Validator software OOM on certain block.

Mitigations:
- Priority fees + local fee markets (added 2022).
- QUIC transport protocol (replaces UDP, prevents amplification).
- Stake-weighted QoS.

For: appreciating evolution toward stability.

## Local fee markets

Per-account write locks: transactions touching the same hot account pay localized priority fees, leaving other accounts cheap.

Result: NFT mint storm doesn't make DeFi expensive.

For: understanding fee variability.

## Compute units

Every instruction consumes compute units (CU). Default per tx: 200,000 CU. Max: 1.4M CU.

```typescript
// Set CU limit
ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 })

// Set CU price (priority fee in micro-lamports)
ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 5000 })
```

For: optimizing transaction success during congestion.

## Mistakes to avoid

- **Confusing slot + block.** Tools sometimes show slot number; not all slots have blocks.
- **Confirming on processed.** Reverts possible; wait for confirmed at minimum.
- **No priority fee on congested tx.** Will sit in mempool forever.
- **Assuming free transactions.** Free for base fee; priority needed in practice.

## Summary

- PoH = cryptographic clock enabling parallelism.
- Tower BFT consensus; finality ~13s.
- Confirmation levels: processed → confirmed → finalized.
- Local fee markets + compute units control execution priority.

Next: accounts, transactions, and fees.
