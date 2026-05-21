---
module: 1
position: 3
title: "Proof of Work + mining"
objective: "Understand mining mechanics + economics."
estimated_minutes: 5
---

# Proof of Work + mining

## What miners do

Miners:
1. Collect pending txs from mempool.
2. Build candidate block (txs + header).
3. Try different nonces; hash header until result starts with N zeros.
4. Successful hash → broadcast block.
5. Other nodes verify; appended to chain.
6. Earn block reward + tx fees.

For: how blocks are produced.

## SHA-256 PoW

Bitcoin hashes the block header:
```
SHA-256(SHA-256(header))
```

Header includes:
- Previous block hash.
- Merkle root (tx commitment).
- Timestamp.
- Difficulty target.
- Nonce.

Miners try nonces until hash < target. Probability proportional to hash rate.

For: PoW puzzle structure.

## Hash rate

Total network hash rate ≈ 600+ EH/s (10^18 hashes per second) in 2026.

```
1 KH/s   = 1,000 hashes/sec
1 MH/s   = 1M
1 GH/s   = 1B
1 TH/s   = 1T (modern ASIC ~100-500 TH/s)
1 PH/s   = 1Q (a large mining farm)
1 EH/s   = 1Qn (network-level)
```

Hash rate = security; more = harder to 51% attack.

For: scale.

## ASICs

Mining moved from CPU → GPU → FPGA → ASIC (Application-Specific Integrated Circuit) by 2013.

Modern ASIC: Antminer S21 ≈ 200 TH/s @ 3,500W.

ASICs do nothing but SHA-256 → 100,000× more efficient than CPU.

For: hardware reality.

## Mining pools

Solo mining variance very high (find a block once every years). Pools:
- Members contribute hash rate.
- Pool finds block.
- Reward distributed pro-rata.

Top pools: Foundry USA, AntPool, F2Pool. Top 4 pools = ~50%+ of network.

For: practical mining.

## Block reward + halvings

```
Block 0-209,999:        50 BTC
Block 210,000-419,999:  25 BTC
Block 420,000-629,999:  12.5 BTC
Block 630,000-839,999:  6.25 BTC
Block 840,000-1,049,999: 3.125 BTC  (current as of 2024+)
Block 1,050,000+:       1.5625 BTC (2028 halving)
```

Each halving = 4 years. Total supply asymptotes to 21M.

For: monetary policy.

## Difficulty adjustment

Bitcoin targets 1 block every 10 minutes:
- Every 2,016 blocks (~2 weeks), difficulty adjusts.
- If blocks came faster than 10 min avg → difficulty up.
- If slower → difficulty down.

Max change per cycle: 4×.

Result: 10-min interval stable across hash rate changes.

For: self-regulating mechanism.

## Energy use

Bitcoin uses ~100-150 TWh/year (varies). Comparable to Norway / Argentina.

Debate:
- Critics: wasteful for "just digital cash."
- Defenders: secures $1T+ asset; uses stranded / renewable energy; immutability is the product.

Most reliable estimates: 50%+ from renewable / nuclear / hydro.

For: balanced view.

## Mining economics

Profitability:
```
Revenue = (Block reward + fees) × probability of finding block × BTC price
Cost = Energy × time + Hardware amortization + Operations

Profit per BTC mined ≈ (Reward + fees) - cost in $
```

Marginal miners turn off when cost > revenue → difficulty drops.

For: equilibrium.

## Mining geographic distribution

After China ban (2021), mining redistributed:
- USA ~35%
- China ~15% (informal, since ban)
- Kazakhstan ~10%
- Russia ~5%
- Rest: Canada, Europe, Iran, others.

For: geopolitical context.

## Stratum protocol

Mining pools and ASICs communicate via Stratum:
- Pool sends miner a job (header + nonce range).
- Miner hashes; reports shares.
- Pool aggregates and constructs winning hash.

Stratum v2: in-progress upgrade for better security + decentralization.

For: protocol layer.

## Tx fees become dominant

Block reward halves; fees relatively grow over time.

Future block: 100% fees as block reward → 0 by ~year 2140.

Today: fees are 1-10% of reward typically. Spikes during congestion or new tech (Ordinals, Runes).

For: long-term incentive sustainability.

## Coinbase transaction

First tx in every block:
- No input.
- Creates new BTC (block reward + tx fees).
- Output to miner's address.

Coinbase output: locked 100 blocks (~16h) before spendable.

For: where new BTC comes from.

## Selfish mining + reorganizations

Theoretical attack: miner with 30%+ hash rate withholds blocks, releases later to "win." Causes minor reorgs.

In practice: rare; honest mining usually pays better.

For: aware of edge case.

## Mistakes to avoid

- **Solo mining today.** Variance too high; use pool.
- **Confusing hash rate with security.** Pool concentration matters too.
- **Buying old hardware.** Outdated within 1-2 years.
- **Ignoring electricity cost.** Make-or-break in mining profitability.

## Summary

- Miners hash block headers searching for low-value SHA-256 result.
- ASICs dominate; pools aggregate small miners.
- Block reward halves every 4 years; 21M cap by 2140.
- Difficulty adjusts every 2,016 blocks → 10 min target.
- Energy use real; debated; trending toward renewable.

Next: difficulty + halvings detail.
