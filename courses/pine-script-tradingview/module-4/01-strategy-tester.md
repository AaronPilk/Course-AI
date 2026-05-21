---
module: 4
position: 1
title: "Reading the Strategy Tester"
objective: "Interpret backtest metrics and judge strategy quality."
estimated_minutes: 5
---

# Reading the Strategy Tester

## Where it lives

When you load a `strategy()` script, the **Strategy Tester** pane appears at the bottom. Three tabs:
- **Overview.** Summary metrics + equity curve.
- **Performance Summary.** Detailed stats (all trades / long / short).
- **List of Trades.** Every trade with entry / exit / P&L.

For: judge whether strategy works on historical data.

## Net profit

Total $ gained or lost over the backtest period.

```
$10,000 starting → $14,500 ending
Net profit = $4,500 (45%)
```

For: top-line return. But context matters — compare to buy-and-hold, time period, volatility.

## Profit factor

`Profit Factor = Gross Profit / Gross Loss`

- 1.0 = breakeven.
- 1.5+ = decent.
- 2.0+ = strong.
- 3.0+ = likely overfit; verify on out-of-sample.

For: efficiency of dollar-per-dollar-risked.

## Win rate

`Win Rate = Winning Trades / Total Trades`

NOT the most important metric on its own. A 90% win rate with one giant loss = unprofitable.

Examples:
- Mean-reversion: 70%+ win rate; small wins, larger losses.
- Trend-following: 30-40% win rate; large wins, small losses.
- Scalping: 80%+; very small per-trade P&L.

For: understand the strategy's nature.

## Avg trade

`Avg Trade = Net Profit / Total Trades`

How much each trade contributes on average. Must beat commission + slippage for live viability.

Example: 0.05% per trade beats 0.1% commission only marginally.

For: judge per-trade edge.

## Max drawdown (MDD)

Largest peak-to-trough equity decline.

```
Peak: $15,000
Trough after peak: $11,250
MDD = $3,750 (25%)
```

Realistically, expect 1.5-2× backtest MDD in live trading.

For: assess pain tolerance + position sizing.

## Sharpe ratio

`Sharpe = (Returns − Risk-free) / Volatility of returns`

Risk-adjusted return. Annualized:
- < 1.0: poor risk-adjusted.
- 1.0-2.0: reasonable.
- 2.0+: excellent (suspicious if huge).
- 3.0+: very rare; likely overfit.

For: comparing strategies on equal footing.

## Sortino ratio

Like Sharpe but only penalizes downside volatility. Ignores upside variance.

```
Sortino = Returns / Downside Deviation
```

Better metric than Sharpe for asymmetric returns.

For: trend-following / option-like payoffs.

## Total closed trades

Sample size. Rules of thumb:
- < 30 trades: not statistically significant.
- 100+ trades: better confidence.
- 500+ trades: robust.

For: trust calibration. Few trades with great returns = noise.

## Max consecutive losses

Longest losing streak. Multiply by max risk per trade → drawdown.

If 1% per trade × 12 consecutive losses = ~12% drawdown.

For: psychological + capital planning.

## Avg trade duration

Bars / time in trade.
- Scalping: minutes.
- Day trading: hours.
- Swing: days.
- Position: weeks / months.

For: match strategy to lifestyle / capital.

## Trade efficiency

`Trade Efficiency = (Exit − Entry) / (Best Possible − Entry)`

Tracks if exits capture most of the move or leave $ on the table.

For: optimize exit logic.

## Long vs. short performance

Performance Summary tab splits stats. Healthy strategies often perform better long in uptrending markets; short in downtrending. Vastly skewed → may not generalize.

For: balance check.

## Equity curve

Visual on the chart pane. Look for:
- **Smooth upward.** Ideal.
- **Steady with manageable DD.** Realistic.
- **Lumpy / step-like.** Few big winners; volatile.
- **Linear with no DD.** Suspicious; likely curve-fit.

For: visual gut check.

## Per-bar % gain shown on chart

Default strategy tester shows trade markers + cumulative P&L bubbles. Toggle in settings.

For: see which bars drive returns.

## Common red flags

- 95%+ win rate.
- Sharpe > 3.0.
- Profit factor > 4.
- Few trades (< 30) with huge returns.
- All gains from one big winner.
- Performance only on specific symbol / specific year.

For: skepticism about backtest validity.

## Compare to benchmark

Strategy returns 15%/year. S&P returns 12%/year. Outperformance: 3%/year, but at what risk?

```
Strategy: 15% return, 20% max DD, 0.6 Sharpe
S&P:      12% return, 14% max DD, 0.8 Sharpe
```

S&P actually superior (better Sharpe, lower DD).

For: benchmark-relative evaluation.

## Mistakes to avoid

- **Net profit only.** High DD strategies may not survive live.
- **Ignoring trade count.** 10-trade backtest meaningless.
- **Curve-fitting to one symbol.** Test across multiple instruments.
- **Backtest period too short.** Need bull + bear + chop conditions.

## Summary

- Net profit + drawdown + Sharpe + trade count = minimum viable metrics.
- Win rate + profit factor describe strategy nature.
- 100+ trades, < 25% DD, Sharpe > 1.5 = decent threshold.
- Equity curve visual gut check.

Next: overfitting and how to avoid it.
