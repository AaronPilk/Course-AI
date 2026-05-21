---
module: 4
position: 2
title: "Overfitting and curve fitting"
objective: "Recognize and prevent strategies that work only on past data."
estimated_minutes: 5
---

# Overfitting and curve fitting

## What overfitting is

A strategy is overfit when its rules are tuned to historical noise rather than real edge. Looks perfect in backtest; fails live.

Signs of overfitting:
- Too many parameters.
- Suspiciously high metrics (Sharpe > 3, profit factor > 4).
- Works on one symbol but not similar ones.
- Tiny changes to params destroy performance.
- Specific to one time period.

For: trust the strategy vs. discard.

## Why it happens

You try 100 combinations of `(length, threshold, multiplier)`. By chance, one combo's results match the noise pattern of your dataset. You think you found edge; you found a coincidence.

Mathematically: more parameters / more iterations → easier to find a fit that doesn't generalize.

For: discipline around optimization.

## Parameter count

Rule of thumb: each free parameter doubles the chance of curve-fitting.

A 2-parameter strategy: 10 trials × 2 params → moderate fit.
A 10-parameter strategy: 10 trials × 10 params → almost guaranteed curve-fit.

Keep strategies as simple as possible.

For: avoid combinatorial overfit.

## Robustness test: parameter neighborhood

```
Length = 14: Sharpe 1.8
Length = 13: Sharpe 1.7
Length = 15: Sharpe 1.7
Length = 12: Sharpe 1.6
Length = 16: Sharpe 1.6
```

Smooth neighborhood = robust. If 14 = 1.8 but 13 = -0.5 and 15 = 0.2, you optimized to noise.

For: pick robust mid-range params.

## In-sample vs. out-of-sample

Split data:
- **In-sample (IS).** Develop + optimize (e.g., 2018-2022).
- **Out-of-sample (OOS).** Test only, don't optimize on (e.g., 2023-2024).

If IS Sharpe 2.0 + OOS Sharpe 0.3 → overfit.
If IS 1.8 + OOS 1.5 → likely real edge.

For: gold standard validation.

## Walk-forward analysis

```
Train 2018-2020, Test 2021     (year 1 of OOS)
Train 2018-2021, Test 2022     (year 2 of OOS)
Train 2018-2022, Test 2023     (year 3 of OOS)
```

Re-optimize periodically + test on fresh data. Mimics realistic deployment.

For: rigorous OOS validation.

## Test multiple symbols

A strategy that works on BTC but not ETH, SOL, AAPL → probably curve-fit to BTC quirks.

Strong strategies generalize across:
- Similar assets (crypto majors).
- Different sectors (stocks).
- Different timeframes (1H, 4H, D).

For: confirmation of real edge.

## Test multiple time periods

Run on:
- Bull market (2017, 2020-2021).
- Bear market (2018, 2022).
- Chop (2019, 2023).

If only works in trending markets → narrow regime strategy. Combine with regime filter or accept the limitation.

For: realistic expectations.

## Monte Carlo simulation

Reshuffle trade order; recalculate equity curve N times. Reveals range of possible outcomes.

If 95% confidence interval is $1k-$50k profit, your actual $10k result is one draw from that distribution.

For: confidence intervals; not a single number.

## Backtest period length

Minimum 3-5 years across:
- 200+ trades.
- 2+ market regimes (bull, bear, chop).
- Multiple asset classes if possible.

10 trades over 6 months proves nothing.

For: statistical significance.

## Survivorship bias

If you test on currently-listed stocks, you exclude delisted ones. Real history included companies that failed (Enron, Lehman).

Pine + TradingView usually fine for index ETFs / currency / crypto; problematic for individual stock universes.

For: aware of which datasets bias upward.

## Look-ahead bias

Using information not yet known at trade time.

```pinescript
// BAD: uses future data
ifClose = close[-1]  // -1 = future bar (look-ahead!)

// GOOD: use known data
prevClose = close[1]
```

Pine prevents `close[-1]` for most cases; HTF security calls with `lookahead_on` can leak future.

For: scientific validity.

## Data mining bias

Try 100 strategies → keep the best. That best one looks great. But it's the survivor of 100; the "winner" by chance.

Solution: pre-register strategy logic before backtest. Test 1 strategy on OOS data, not 100.

For: avoid researcher degrees of freedom.

## Lock-in test

After optimization, lock parameters. Run on new live data daily/weekly for 3-6 months without changes. If still positive → ready for paper trade.

For: discipline gate before live deployment.

## Simplicity bias

Two strategies:
1. SMA crossover, 2 params, Sharpe 1.5.
2. Custom indicator with 12 params, Sharpe 2.5.

#1 more likely to generalize. Occam's razor for backtests.

For: prefer simple.

## Mistakes to avoid

- **Optimizing on full dataset.** No OOS = no validation.
- **Single-symbol test.** Generalization unproven.
- **Tweaking + re-running.** Once you peek at OOS, it's contaminated.
- **Cherry-picking time period.** "Strategy works 2020-2022" might fail 2023-2024.

## Summary

- Overfitting = strategy matches noise, not edge.
- IS/OOS split + walk-forward + multi-symbol = validation.
- Smooth parameter neighborhood = robust.
- Simple > complex; few params > many.

Next: walk-forward and live transition.
