---
module: 1
position: 1
title: "The Bitcoin whitepaper"
objective: "Understand Satoshi's core innovations."
estimated_minutes: 5
---

# The Bitcoin whitepaper

## Context

Satoshi Nakamoto published "Bitcoin: A Peer-to-Peer Electronic Cash System" in October 2008. 9 pages. Solved the **double-spending problem** without a trusted third party.

Genesis block mined Jan 3, 2009. Contained a Times newspaper headline: "Chancellor on brink of second bailout for banks."

For: motivation + provenance.

## The problem

Pre-Bitcoin digital cash attempts:
- Required trusted central party (banks, PayPal).
- Or solved double-spending only with central oversight.
- DigiCash (1990s) — failed; centralized.
- E-gold — shut down by feds.

Trustless digital cash needed: how do you prove a coin hasn't been spent without a referee?

For: design goal.

## Satoshi's solution

Three combined ideas:
1. **Proof of Work.** Make creating blocks costly; majority of honest miners outcompete attackers.
2. **Chained timestamps.** Each block references the previous; tamper requires re-doing work.
3. **Longest-chain rule.** Nodes follow the chain with most cumulative work.

Result: probabilistic finality. After enough blocks, reversal becomes economically impossible.

For: the core innovation.

## How a payment works

```
1. Alice signs a tx sending 1 BTC to Bob.
2. Tx broadcast to network.
3. Miners include tx in block.
4. Miner solves PoW puzzle.
5. Block appended to chain; broadcast.
6. Bob's wallet shows tx confirmed.
7. More confirmations = more security.
```

For: end-to-end model.

## Incentive structure

Miners spend electricity + hardware to solve PoW. Earn:
- **Block reward.** Newly minted bitcoins (halves every 4 years).
- **Transaction fees.** Users bid for block space.

Long-term: as block reward → 0, fees become miner income.

For: economic security.

## Network model

- **Nodes.** Verify rules; broadcast tx + blocks.
- **Miners.** Subset of nodes that produce blocks.
- **Wallets.** Users; sign tx; may or may not run a node.
- **Exchanges.** Centralized service for fiat ramp.

Anyone can participate at any level.

For: decentralization.

## Properties

Bitcoin achieves:
- **Permissionless.** No KYC at protocol level.
- **Censorship-resistant.** Tx with fee gets included.
- **Pseudonymous.** Addresses not directly tied to identity.
- **Immutable.** Blocks after ~6 confirmations near-impossible to reverse.
- **Verifiable.** Anyone can check the full ledger.

For: trust properties.

## Limitations

Original whitepaper acknowledged:
- Throughput limits (later resolved as ~7 tx/s on L1).
- Privacy weaknesses (linkable txs).
- 51% attack vulnerability (theoretical).

Designed for digital cash; not all use cases envisioned.

For: realistic scope.

## Why "decentralized"

No single party can:
- Print new BTC outside protocol.
- Reverse confirmed tx.
- Censor specific users (assuming honest miners).
- Stop the network (without taking down 10k+ globally distributed nodes).

This decentralization is the core value proposition.

For: why Bitcoin matters.

## The 21 million cap

- Block reward starts at 50 BTC; halves every 210,000 blocks (~4 years).
- Sum of all rewards converges to ~21 million BTC.
- Last bitcoin minted around year 2140.
- Hard cap; not mutable without near-impossible network consensus.

Result: hardest money in history (zero issuance after final halving).

For: monetary policy.

## Critique + nuance

Bitcoin's also critiqued:
- **Energy use.** Currently ~100 TWh/year (varies; comparable to medium country).
- **Speculative volatility.** Not great as everyday money yet.
- **Slow confirmations.** ~10 min between blocks.
- **Hash rate concentration.** ~50% of mining in few large pools.

Reasonable people debate severity. Course covers both sides.

For: balanced understanding.

## Read the whitepaper

```bash
curl https://bitcoin.org/bitcoin.pdf -O
```

9 pages; very readable. Worth multiple reads. Anchors everything that follows.

For: primary source.

## Mistakes to avoid

- **Treating Bitcoin like a company.** No CEO; no roadmap dictated.
- **Conflating with altcoins.** Bitcoin has distinct security + monetary properties.
- **Confusing technical implementation with monetary thesis.** Both interesting; different debates.
- **Skipping the whitepaper.** Read it before reading commentary.

## Summary

- Whitepaper 2008; solves double-spending without trusted party.
- PoW + chained timestamps + longest-chain rule = trustless ledger.
- 21M hard cap; halvings reduce issuance.
- Miners secured by block reward → eventually only fees.

Next: UTXO model.
