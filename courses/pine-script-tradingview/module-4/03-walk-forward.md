---
module: 4
position: 3
title: "Walk-forward and live transition"
objective: "Move from backtest to paper to live deployment."
estimated_minutes: 5
---

# Walk-forward and live transition

## Walk-forward concept

Train + test on rolling windows:

```
Train 2018-2020 (3 yrs) → Test 2021 (1 yr)
Train 2019-2021 (3 yrs) → Test 2022 (1 yr)
Train 2020-2022 (3 yrs) → Test 2023 (1 yr)
Train 2021-2023 (3 yrs) → Test 2024 (1 yr)
```

Each test window uses only data not seen during its train. Sum of test windows = realistic deployment simulation.

For: gold-standard validation.

## Walk-forward efficiency

```
Walk-Forward Efficiency = Σ(OOS returns) / Σ(IS returns)
```

- > 0.5: edge generalizes.
- 0.3-0.5: marginal.
- < 0.3: overfit.

If in-sample 100% returns; out-of-sample 15% → 0.15 efficiency. Likely curve-fit.

For: quantify generalization.

## Re-optimization frequency

Markets change. A strategy tuned for 2018 may need retuning.

Common cadences:
- Monthly: too frequent; data-mining.
- Quarterly: reasonable for active strategies.
- Yearly: conservative; ideal for trend / position.

For: balance adaptation vs. stability.

## Adaptive vs. static strategies

Adaptive:
- Lookback length scales with volatility.
- Position size adjusts to recent performance.
- Indicator parameters auto-tune (rare; usually overfit).

Static:
- Fixed parameters; manually re-evaluated periodically.
- Easier to validate; lower risk of self-overfit.

For: prefer static for retail; adaptive for advanced quant.

## Paper trading on TradingView

TradingView has a Paper Trading broker:
1. Open chart.
2. Click "Trade" → "Paper Trading".
3. Reset balance, set sim parameters.
4. Manual or strategy-fired alerts.

Run for 1-3 months matching real markets.

For: bridge between backtest + live.

## Forward testing checklist

Before live:
- [ ] OOS Sharpe > backtest × 0.6.
- [ ] Walk-forward efficiency > 0.5.
- [ ] Tested on multiple symbols.
- [ ] Tested on different market regimes.
- [ ] Paper-traded 3+ months.
- [ ] Max DD < 25%.
- [ ] Position sizing rules clear.
- [ ] Stop loss + take profit defined.
- [ ] Risk per trade ≤ 2%.

For: discipline gate.

## Slippage in live vs. backtest

Backtest assumes:
- Fills at requested price.
- No partial fills.
- No latency.

Live reality:
- Slippage 0.1-0.5 ticks on liquid; more on illiquid.
- Partial fills on large size.
- Network latency 50-500ms.

Add 30-50% slippage / commission cushion vs. backtest.

For: realistic live expectations.

## Position sizing for new deployment

Start small. If backtest says 10% per trade:
- Live week 1: 0.5% per trade.
- Live month 1: 1% per trade.
- Live month 3: 2% per trade.
- Live month 6: full size if metrics align.

For: capital preservation during learning phase.

## Monitoring live performance

Compare to backtest expectations:
- Avg trade P&L within 1σ?
- Win rate similar?
- Drawdown similar?
- Trade frequency similar?

Diverging significantly → market regime change or strategy decay.

For: catch issues early.

## Strategy degradation

All strategies eventually decay as:
- Markets evolve.
- Competing algorithms find same edge.
- Liquidity / spreads change.

Half-life for retail strategies: 6 months - 5 years.

Plan for retirement criteria upfront:
- Live Sharpe drops below 0.5 for 3 months → review.
- Drawdown exceeds 1.5× backtest max → halt.

For: discipline around exit.

## Regime detection

Some strategies work in trending markets, others in ranging. Detect regime:

```pinescript
adx = ta.adx(14)
trending = adx > 25
ranging = adx < 20

useTrendStrategy = trending
useMeanReversion = ranging
```

For: switching playbooks by environment.

## Real-money progression

Suggested phases:
1. **Demo / paper** — 3 months.
2. **Micro-live** — 1% capital, 3-6 months.
3. **Scaled-live** — 25% target capital.
4. **Full deployment** — full capital.

Move forward only if metrics align with expectations at each phase.

For: graduated risk.

## Mistakes to avoid

- **Optimize during live trading.** Contaminates evaluation. Run untouched 3 months minimum.
- **No regime check.** Strategy worked in bull market; bear market is different game.
- **Full capital from day 1.** Live edge usually lower than backtest; learn at small size.
- **No exit criteria.** Strategies should be retirable.

## Summary

- Walk-forward = rolling train/test = realistic validation.
- Walk-forward efficiency > 0.5 = generalizes.
- Paper trade 3+ months before live.
- Start tiny; scale only when validated live.
- All strategies decay; plan retirement criteria.

Next: backtesting pitfalls.
