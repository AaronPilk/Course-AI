---
module: 1
position: 4
title: "Difficulty + halvings"
objective: "Master Bitcoin's monetary policy mechanisms."
estimated_minutes: 5
---

# Difficulty + halvings

## Difficulty number

Difficulty = how hard the puzzle is. Specifically:
```
difficulty = max_target / current_target
```

At genesis: 1. Today: ~100 trillion.

For: hardness measure.

## Difficulty retargeting

Every 2,016 blocks:
```
new_difficulty = old_difficulty × (2 weeks ÷ actual time)
```

If 2,016 blocks took 1.5 weeks (faster than target): difficulty up ~33%.
If they took 3 weeks: difficulty down ~33%.

Max swing capped at 4× per cycle to prevent oscillation.

For: self-regulation.

## Difficulty drops in 2021

After China mining ban May 2021:
- Many miners offline.
- Block time slowed to ~15 min.
- Difficulty dropped 28% (largest in history).
- Network self-healed in ~6 weeks.

Showed mechanism works under stress.

For: resilience proof.

## Halving schedule

| Halving | Block | Date | Reward |
|---------|-------|------|--------|
| 1st | 210,000 | Nov 2012 | 50 → 25 |
| 2nd | 420,000 | Jul 2016 | 25 → 12.5 |
| 3rd | 630,000 | May 2020 | 12.5 → 6.25 |
| 4th | 840,000 | Apr 2024 | 6.25 → 3.125 |
| 5th | 1,050,000 | ~2028 | 3.125 → 1.5625 |

Last block reward: year ~2140.

For: monetary timeline.

## Pre/post halving economics

Pre-halving:
- Miners earn X BTC/day.
- After halving: X/2 BTC/day.
- If BTC price doesn't double, marginal miners turn off.
- Hash rate may dip; difficulty adjusts down.

Historically: halvings preceded major BTC bull markets:
- 2012: $12 → $1,000 within 12 months.
- 2016: $650 → $19,000 within 18 months.
- 2020: $9,000 → $69,000 within 18 months.
- 2024: $65,000 → $100k+ (varies).

Pattern not guaranteed; correlation ≠ causation.

For: market-aware perspective.

## Stock-to-Flow model

Plan B's S2F model (controversial):
```
Stock-to-Flow = Existing supply / Annual new supply
```

Bitcoin S2F doubles every halving → higher S2F → higher price (per model).

Critics: post-2021 model broke; gold/silver don't fit perfectly; mean-reverting forces eventually dominate.

For: aware of model + its limits.

## Heat death of mining

As block reward → 0 (~2140):
- Miners earn only from tx fees.
- If fees aren't enough, hash rate drops.
- Lower hash rate = lower security.

Counter: by then, BTC value should be much higher; tx fees on $1M+ BTC could sustain mining.

Ongoing protocol debate.

For: long-term sustainability.

## Mining centralization

Concerns:
- Top 4 pools = ~50%+ network.
- One pool with 51% could theoretically reorg short chains.
- ASIC manufacturers concentrated (Bitmain dominant).

Mitigations:
- Stratum v2: miners pick own tx, not pool.
- Competing ASIC manufacturers (MicroBT, Canaan).
- Network design: 51% attack is theoretical; economic disincentive massive.

For: realistic security view.

## Network hashprice

```
Hashprice = revenue per TH/s per day
```

Currently $0.05-0.10. Reflects market difficulty + price.

Miners use this to plan profitability.

For: economic indicator.

## Mining derivatives

Some platforms offer:
- Hashrate forwards (e.g., Foundry's product).
- Mining ETFs (e.g., WGMI).
- Block reward streaming.

Lets investors gain mining exposure without operating.

For: institutionalization.

## Energy mix

Bitcoin Mining Council surveys show:
- ~50%+ renewable / nuclear (varies by methodology).
- Stranded gas (flaring) increasingly captured.
- Curtailed renewables harnessed at off-hours.

Bitcoin uniquely incentivizes building energy where humans don't live.

For: nuanced energy debate.

## Future protocol upgrades

Soft forks (backwards compatible):
- Past: SegWit (2017), Taproot (2021).
- Future: BIP119 (CTV), drivechain, more.

Hard forks (incompatible): controversial; require global consensus.

Bitcoin Core development very conservative; "ossification" trend.

For: evolution model.

## Mistakes to avoid

- **Treating halving as cancer trigger.** Markets factor in.
- **Believing miners will quit at zero reward.** Adapts.
- **Trusting S2F predictions blindly.** Single-factor model.
- **Confusing block reward with tx fees.** Different incentive horizons.

## Summary

- Difficulty retargets every 2,016 blocks; adapts to hash rate.
- Halvings every 4 years; supply caps near 21M by 2140.
- Historical price rallies post-halving; not guaranteed.
- Long-term incentive: fees must grow as reward drops.
- Network self-regulating; survived major disruptions.

Module 1 complete. Module 2: transactions + scripts.
