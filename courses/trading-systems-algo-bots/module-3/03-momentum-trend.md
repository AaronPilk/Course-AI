---
module: 3
position: 3
title: "Momentum and trend following"
objective: "Capture sustained moves with mechanical rules."
estimated_minutes: 7
---

# Momentum and trend following

## The other side of mean reversion

If mean reversion bets that extended moves revert, momentum bets that they persist. Both edges exist; they thrive in different regimes.

Momentum / trend following has been profitable in academic studies for over 100 years. The 2018 Asness/Frazzini/Pedersen paper "Quality Minus Junk" and Berkeley's Faber "A Quantitative Approach to Tactical Asset Allocation" both document multi-decade trend edges.

Why does it work?
- **Information diffusion.** New info propagates slowly through markets; prices adjust incrementally.
- **Behavioral.** Investors anchor to recent prices, underreact to news, herd in late.
- **Risk-on/risk-off cycles.** Macro regimes persist for months.

Trend following is one of the most-documented "real edges" in finance.

## The simplest trend signal

Moving average crossover:

```python
def trend_signal(df, fast=50, slow=200):
    df['ma_fast'] = df['close'].rolling(fast).mean()
    df['ma_slow'] = df['close'].rolling(slow).mean()
    
    df['signal'] = 0
    df.loc[df['ma_fast'] > df['ma_slow'], 'signal'] = 1   # uptrend
    df.loc[df['ma_fast'] < df['ma_slow'], 'signal'] = -1  # downtrend
    
    return df
```

The 50/200 cross is the famous "golden cross" (50 above 200, bullish) and "death cross" (below, bearish). Slow-signal, low-frequency strategy — good for swing/position trading.

Faster variants: 20/50 crossover, 10/30. More signals, more whipsaws in choppy markets.

## Donchian channels

Buy when price breaks above its N-day high; sell when it breaks below N-day low. Famous "Turtle Traders" used 20-day and 55-day breakouts.

```python
def donchian_signal(df, window=20):
    df['highest'] = df['high'].rolling(window).max().shift(1)
    df['lowest'] = df['low'].rolling(window).min().shift(1)
    
    df['signal'] = 0
    df.loc[df['close'] > df['highest'], 'signal'] = 1
    df.loc[df['close'] < df['lowest'], 'signal'] = -1
    
    return df
```

Note: `.shift(1)` is critical — the high/low must be of *prior* periods, not including today. Without the shift, you have look-ahead bias.

## Momentum (relative strength)

Rank assets by recent return; buy the top, short the bottom:

```python
def cross_sectional_momentum(prices, lookback=126, hold=21):
    returns = prices.pct_change(lookback)  # 6-month returns
    
    # On each rebalance date, rank
    ranks = returns.rank(axis=1, pct=True)
    
    long_basket = ranks > 0.9   # top 10%
    short_basket = ranks < 0.1  # bottom 10%
    
    return long_basket, short_basket
```

Standard in equity quant: 12-month return minus most-recent 1-month return (to avoid mean reversion at very short horizon). Rebalance monthly. Long top decile, short bottom decile.

Cross-sectional momentum has been profitable in equities for many decades, though less so post-2010 (more crowded).

## Trend strength filters

Not all moves are real trends. ADX (Average Directional Index) measures trend strength:

```python
from ta.trend import ADXIndicator

adx = ADXIndicator(df['high'], df['low'], df['close'], window=14)
df['adx'] = adx.adx()

# Only take trend signals when ADX > 25 (clear trend)
df.loc[df['adx'] < 25, 'signal'] = 0
```

ADX < 20: ranging, no trend. 20-40: trending. > 40: very strong trend. Filtering trend signals by ADX reduces whipsaws.

## Volatility-adjusted sizing

Trend strategies should size positions inversely to volatility — a 10% move in a low-vol asset is significant; in a high-vol asset, normal.

```python
def size_by_vol(symbol, equity, target_risk_pct, df, atr_window=14):
    from ta.volatility import AverageTrueRange
    atr = AverageTrueRange(df['high'], df['low'], df['close'], window=atr_window).average_true_range()
    current_atr = atr.iloc[-1]
    risk_per_share = current_atr * 2  # 2-ATR stop
    
    risk_budget = equity * target_risk_pct
    return int(risk_budget / risk_per_share)
```

The idea: every position risks the same dollar amount. Volatile assets get smaller share counts; calm assets get larger.

This is the Turtle Traders' contribution. Volatility-targeted sizing is now standard in trend strategies.

## Exit techniques

Trend exits are critical because most of the strategy's PnL comes from a few big winners:

**Trailing stop on ATR.** Stop tracks behind price by N × ATR. Loosens in volatile periods.

**Trailing stop on N-day low.** Exit when price drops below N-day low (for a long).

**Time stop combined.** Force-close if hasn't moved enough in K days.

**No fixed exit (run to reversal).** Hold until the trend reverses (e.g., 50/200 cross back). Lets winners run maximally; eats lots of giveback.

The best exit depends on the timeframe. For position trading (months), exit on reversal signal. For swing (days), tighter trailing stops.

## Crisis alpha

Trend-following's reputation as "crisis alpha" comes from its tendency to shine when trends become extreme — 2008, 2020-March, 2022. Long-running uptrends or sustained drops both reward trend.

When everything's correlated and in panic, trend captures the directionality. Pure mean reversion strategies often die in crises; trend strategies often thrive.

This is why managed-futures funds (which are mostly trend-followers) are often used as portfolio diversifiers.

## The pain of trend following

The hard truth: trend following has a terrible psychological profile.

- **Low win rate.** Often 35-45%.
- **Lots of small losses.** Many false starts that whip out via stops.
- **Rare huge winners.** A few trades per year do all the work.
- **Long drawdown periods.** 1-2 years of nothing is normal between big runs.

Most discretionary traders can't survive this — the small losses feel like failure, the huge wins look like luck, and the patience required exceeds what most humans have.

Bots are immune. This is one of the most algorithmically-friendly strategy families.

## What works for retail trend bots

Realistic retail trend-following setup:

- **Universe:** 50-200 diverse liquid instruments (stocks, ETFs, futures).
- **Signal:** 50/200 cross or Donchian breakout with ADX filter.
- **Sizing:** Volatility-targeted, 0.5-1% risk per trade.
- **Exits:** ATR trailing stop, or 50-day low.
- **Rebalance:** Daily check; positions held for weeks to months.

Expected behavior: 30-40% of years are big winners (15-30% return), 40-50% are flat to slightly profitable, 10-20% are losing years. Long-run Sharpe ~0.7-1.0. Diversified across many instruments, the result is decent on risk-adjusted basis but requires patience to harvest.

## Mistakes to avoid

- **Lookahead bias in breakouts.** Donchian channels need `.shift(1)` on highs/lows.
- **No ADX filter.** Trend signals in chop = constant whipsaws.
- **Equal-dollar sizing.** Volatile vs calm assets need different shares.
- **No trailing stop.** Wins give back; losses run.
- **Quitting in drawdown.** Trend's payoff comes from rare events; quitting before them ruins the math.

## Summary

- Trend / momentum is a well-documented multi-decade edge.
- Tools: moving average crossover, Donchian breakouts, cross-sectional ranking.
- ADX filter removes signals in ranging markets.
- Volatility-targeted sizing equalizes risk across instruments.
- Low win rate, big winners — psychologically tough; algorithmically friendly.
- "Crisis alpha" — trend tends to shine when other strategies suffer.

Next: blending mechanical and discretionary.
