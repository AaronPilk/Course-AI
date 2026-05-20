---
module: 3
position: 1
title: "What an 'edge' really is"
objective: "How to think about whether a strategy can actually make money."
estimated_minutes: 7
---

# What an 'edge' really is

## The honest definition

An edge is a statistically significant tendency for a setup to deliver positive expected value after all costs. Words to notice:

- **Statistically significant.** Not "I made money once."
- **Positive expected value.** Mean × win rate − Mean × loss rate − costs > 0.
- **After all costs.** Spread, slippage, commissions, fees. Pre-cost edges don't count.

Most strategies traders find on Twitter and YouTube are not edges. They're noise that looked like signal in a small sample, or signals that vanish after costs. The job of an algo trader is to find rare edges and exploit them disciplined.

## The mechanics of expected value

For each trade, expected value is:

```
EV = P(win) × avg_win  −  P(loss) × avg_loss  −  costs
```

Example:
- 60% win rate.
- Avg win: $80.
- Avg loss: $90.
- Cost per trade: $5.

```
EV = 0.60 × 80  −  0.40 × 90  −  5  =  48 − 36 − 5  =  $7
```

Per trade, you expect $7 profit. Over 1000 trades, $7000.

But variance matters. Even a +EV strategy has losing streaks. The math says you'll win long-term; the experience is bumpy.

## Sources of edge

Real edges come from a few places:

**1. Information.** You know something the market hasn't priced in. Insider info is illegal; everything else is legal — alternative data, faster news ingestion, niche fundamentals.

**2. Speed.** You can act on public information faster than others. HFT, latency arbitrage, news-trigger bots.

**3. Modeling.** You forecast better than the consensus. Quant funds with PhD-level math.

**4. Discipline.** You execute mechanically what most humans can't — long losing streaks, contrarian positions, mean-reversion in panics.

**5. Structure.** You exploit microstructure or pricing inefficiencies — order book imbalance, dark-pool / lit-pool spread, ETF arbitrage.

Retail algo traders mostly compete on #4 and #5. Information and modeling are hard without institutional resources; speed is dominated by HFT firms.

## What's not an edge

Common things that look like edges but aren't:

- **"This indicator works."** RSI under 30 / MACD crossovers / Bollinger bands. These are tools, not edges. Used alone, they're break-even after costs.
- **"I follow the trend."** Trend-following is a real edge family, but "buy what's going up" is too vague to backtest reliably.
- **"This pattern works."** Head-and-shoulders, cup-and-handle. Tested rigorously, most have zero edge.
- **"AI/ML will find it."** Black-box ML on raw prices overfits aggressively. Edges from ML come from feature engineering and discipline, not "the model found it."

Beware any source promising an edge without the math, the sample size, and the cost accounting.

## Backtest first, prove later

How to test if a candidate is an edge:

1. Define it as code — unambiguously.
2. Backtest over a long period (5+ years) on a relevant universe.
3. Measure expected value, win rate, distribution, max drawdown.
4. Stress-test costs — does it survive 2× modeled slippage?
5. Walk-forward — does the in-sample edge hold out-of-sample?
6. Paper trade — does it survive contact with real fills?

Most candidates die at step 3 (no edge), step 4 (eaten by costs), or step 5 (overfitting).

A handful survive all 6. Those are the strategies you can actually run.

## Sample size and significance

A strategy that won 60% of its 20 trades looks great. Statistically: at a 50% null hypothesis, 12/20 wins has p ≈ 0.13. Not significant. Could be luck.

For comfortable significance, you typically need 100+ trades — and 1000+ for any strategy with marginal edge. Backtests over 5+ years on a diverse universe usually generate enough trades.

Few-trade backtests are seductive but misleading. Be skeptical.

## Drawdown — the silent killer

Even +EV strategies have losing streaks. A 60% win-rate strategy has a 0.4^5 = 1% chance of losing 5 in a row. Over 1000 trades, that streak happens ~10 times.

If your position sizing assumes wins, the streak ruins you. If your sizing assumes the streak, you survive.

Realistic drawdown estimate: max drawdown in backtest × 1.5-2× = what you should plan to tolerate live. Strategies with 10% backtest drawdown often see 15-25% live.

## The edge decays

Real edges erode over time:

- **Crowding.** Other traders find the same signal; it diminishes.
- **Regime change.** The market structure that created the edge shifts (e.g., 2010s low-volatility regime ended in 2020).
- **Counter-action.** Market makers adapt; institutional flow shifts.

Plan for decay. Continuously evaluate your strategies; have a replacement pipeline.

## How edges compound

The magic isn't large per-trade returns; it's many small +EV trades.

A strategy returning 0.1% per trade with 500 trades/year:

```
Annual return = (1.001 ^ 500) − 1 ≈ 64%
```

Compared to a strategy returning 5% per trade with 10 trades/year:

```
Annual return = 1.05 ^ 10 − 1 ≈ 63%
```

Similar return; vastly different sample sizes. The 500-trade strategy is statistically far more reliable — you'll know within a few months whether it's working. The 10-trade strategy may take years to validate.

Prefer many small +EV trades over rare large ones, when possible.

## Asymmetric vs symmetric edges

**Symmetric:** Win and loss sizes similar; differentiation comes from win rate. E.g., 60% wins of $80, 40% losses of $80. Very sensitive to win-rate fluctuations.

**Asymmetric:** One side much larger than the other.
- *Trend-following.* 40% wins, but wins are huge (3-10× losses). EV is positive despite low win rate.
- *Mean-reversion.* 70%+ wins, but losses are huge tail events. EV positive in normal regimes; gets killed in crashes.

Asymmetric edges feel different. Trend-following has lots of small losses and rare big wins — psychologically tough. Mean-reversion has lots of small wins and rare devastating losses — feels great until the tail event arrives.

## The Sharpe ratio

A standard metric:

```
Sharpe = (avg_return − risk_free) / std_dev_of_returns
```

Higher = better risk-adjusted return.

- Sharpe > 1: decent.
- Sharpe > 2: very good.
- Sharpe > 3: extremely good (often overfit, be suspicious).

Use Sharpe to compare strategies, not as a standalone "good enough" gate. A high-Sharpe strategy in backtest is still subject to the rest of the validation pipeline.

## Mistakes to avoid

- **Mistaking lucky for skilled.** Small sample makes everything look profitable.
- **Confusing tools for edges.** RSI is not an edge; it's a measurement.
- **Ignoring costs.** Pre-cost edges don't matter; post-cost edges do.
- **No drawdown plan.** Even +EV strategies lose for stretches.
- **Believing edges are permanent.** They decay; pipeline new ones.

## Summary

- Edge = statistically significant positive EV after all costs.
- Sources: information, speed, modeling, discipline, structure. Retail competes on discipline and structure.
- Validate with backtest, cost stress, walk-forward, paper.
- Drawdowns are normal; plan for 1.5-2× backtest max.
- Many small +EV trades > rare large ones, when possible.
- Edges decay — keep researching.

Next: mean reversion patterns.
