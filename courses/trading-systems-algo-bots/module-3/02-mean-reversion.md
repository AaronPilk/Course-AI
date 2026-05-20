---
module: 3
position: 2
title: "Mean reversion patterns"
objective: "How to find and trade short-term reversal edges."
estimated_minutes: 7
---

# Mean reversion patterns

## The intuition

Mean reversion: when a price extends far from its short-term mean, there's a tendency for it to come back. Buy oversold; sell overbought. Profit from the rebound.

It's not magic — it's a tendency. The mechanism: short-term selling pressure (margin calls, panic, technical stops) often overshoots fundamentals, and the market corrects within hours to days.

Mean reversion works best in:

- **Ranging markets.** Sideways action, no strong trend.
- **Liquid instruments.** Tight spreads, deep books.
- **Short timeframes.** Intraday to a few days.

It works worst in:

- **Trending markets.** Reversion is overwhelmed by the trend.
- **Thin instruments.** Slippage eats the edge.
- **News-driven moves.** Reversion against real information loses.

## The classic mean reversion signal

The basic recipe:

```python
def mean_reversion_signal(df):
    df['ma_20'] = df['close'].rolling(20).mean()
    df['std_20'] = df['close'].rolling(20).std()
    df['z'] = (df['close'] - df['ma_20']) / df['std_20']
    
    df['signal'] = 0
    df.loc[df['z'] < -2, 'signal'] = 1   # buy oversold
    df.loc[df['z'] > 2, 'signal'] = -1  # sell overbought
    df.loc[df['z'].abs() < 0.5, 'signal'] = 0  # close on reversion
    
    return df
```

z-score below -2 (price 2 standard deviations below mean) → buy. Above +2 → sell. Exit when z gets near 0.

This is the "20-period z-score" — one of the most studied mean-reversion patterns. Variants substitute different window sizes, different mean (EMA vs SMA), different exit conditions.

## Pairs trading

A more sophisticated version. Find two assets historically correlated. When their spread widens unusually, bet on convergence:

```
Spread = price_A - β × price_B

If spread > threshold: short A, long B (β-adjusted size)
If spread < threshold: long A, short B
If spread crosses 0: exit
```

Classic example: KO vs PEP. Two big colas, similar industry exposure. When KO outperforms PEP by 3%, expect mean reversion of the spread.

Statistical pairs trading uses cointegration tests to find genuinely linked pairs. Many pairs that look correlated aren't — they just happened to drift together.

Pairs trading was the original quant strategy at firms like Renaissance and DE Shaw in the 80s. The edge has decayed but the family still works.

## ETF arbitrage

ETFs are baskets of stocks. The ETF price and the implied price from the basket should match — but they drift in short windows. Authorized participants (APs) arbitrage them; you can too on smaller scale:

```
Spread = ETF_price - sum(weight_i × stock_price_i)

If spread > threshold: short ETF, long basket
If spread < threshold: long ETF, short basket
```

Hard to execute at retail scale (many simultaneous legs, latency-sensitive), but the pattern exists.

## Day-of-week / time-of-day patterns

Some mean reversion is seasonal:

- **Monday gap fades.** Many stocks open with a weekend-news gap; some fade back to Friday's close.
- **End-of-day reversions.** Closing-hour moves often reverse pre-market.
- **Earnings overreactions.** Big earnings moves sometimes fade in the following days.

These are weaker, less-reliable patterns — but easy to test. Filter by liquidity and you can find tradeable ones.

## Bollinger band reversion

Variant of z-score. Bollinger bands are:

```
upper = MA + 2 × std
lower = MA - 2 × std
```

Same as z = ±2 signal. The classic "buy at lower band, sell at upper band" works in ranging markets. In trends, it gets steamrolled.

The fix: only trade Bollinger bands when:

- ADX (trend strength) is low (< 20).
- Range is well-defined.
- Liquidity is high.

## RSI divergence

When price makes a lower low but RSI makes a higher low: bullish divergence — possible mean reversion higher.

Backtest results: divergence signals have small positive EV in some regimes, near zero in others. Not a standalone edge; useful as a filter combined with other signals.

## Volume-weighted reversion

Mean reversion is stronger when triggered by abnormal volume:

```
volume_spike = volume / volume_20_ma > 3.0

if z < -2 and volume_spike and direction == 'down':
    buy()
```

The reasoning: large-volume sells often indicate forced unwinding (margin calls, fund liquidation) rather than informed selling — more likely to bounce. This filter improves base mean-reversion signals materially.

## Position sizing for mean reversion

Mean reversion has a specific risk profile: lots of small wins, rare large losses (when the position keeps moving against you). Sizing implications:

- **Hard stops mandatory.** Don't average down forever.
- **Smaller sizes.** Because the tail loss is the killer.
- **Time stops.** If position hasn't reverted in N bars, exit. Mean reversion that doesn't revert quickly often won't.

A common sizing rule: risk 0.5% of equity per trade, with a hard stop at z = -4 or -5.

## Entry execution

Mean-reversion entries often happen at moments of extreme prices — wide spreads, depleted liquidity. Market orders are dangerous:

- Use limit orders at the price you actually want.
- Accept that some setups won't fill — that's fine.
- Don't chase. If price moves away, let it.

## Exit execution

Standard exits:

- **Mean revert to z = 0:** the "complete reversion" exit.
- **z = -0.5 (partial):** lock partial profit at half-reversion.
- **Time stop:** 3 bars / 1 day / whatever — if not done by then, leave.

A combination is common: target = z=0 (limit order), stop = z=-4 (stop-market), time = N bars (force exit).

## When mean reversion stops working

The strategy is designed for ranging markets. In trends, it fails. Watch for:

- **Sustained directional moves** with no reversion in a week.
- **Drawdowns** > 1.5× backtest worst.
- **Win rate dropping below threshold** (typically 55%+ in backtest).

When you see these, pause or reduce size. The regime has shifted; the edge may be temporarily gone.

## Common reasons mean reversion strategies fail live

- **Trading thin instruments.** Slippage kills the small edges.
- **No time stop.** Positions that don't revert in days often become 30%+ losers.
- **Averaging down without limit.** Doubles down into a real trend.
- **Backtesting on adjusted prices but trading unadjusted.** Different math.
- **No regime filter.** Mean reversion works in ranges, fails in trends.

## Mistakes to avoid

- **Treating mean reversion as universal.** It works in some regimes only.
- **No stops.** Mean reversion losses are tail-heavy.
- **Symmetric position sizing.** The skew demands smaller positions.
- **Entering at any signal.** Volume / regime filters double the edge.

## Summary

- Mean reversion: prices that move far from short-term mean tend to revert.
- z-score, Bollinger bands, pairs trading — all variants.
- Best in ranging markets; failed in trends.
- Lots of small wins, rare large losses — needs small position sizes.
- Mandatory stops, time exits, and regime filters.

Next: momentum and trend following.
