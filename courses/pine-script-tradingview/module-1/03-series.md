---
module: 1
position: 3
title: "Series and time"
objective: "Understand Pine's series data + historical references."
estimated_minutes: 5
---

# Series and time

## What a series is

A series = value at each bar in history. Like an array indexed by bar position.

`close` is a series: at bar 0 (most recent) = current close; at bar 1 = previous close; etc.

For: time-series financial data.

## Historical reference

```pinescript
currentClose = close       // Most recent bar's close
prevClose = close[1]       // Previous bar's close
twoAgo = close[2]          // 2 bars ago
tenBarsAgo = close[10]
```

`[N]` accesses N bars ago.

For: comparing now to past.

## Common patterns

```pinescript
// Higher high?
higherHigh = high > high[1]

// Crossed above moving average?
crossedAbove = close[1] < sma[1] and close > sma

// Average over last 5 bars
avg5 = (close[0] + close[1] + close[2] + close[3] + close[4]) / 5
// Or use built-in
avg5_alt = ta.sma(close, 5)
```

For: pattern detection across time.

## Built-in technical analysis

`ta.` namespace has indicators:
```pinescript
sma14 = ta.sma(close, 14)
ema20 = ta.ema(close, 20)
rsiValue = ta.rsi(close, 14)
[macdLine, signalLine, hist] = ta.macd(close, 12, 26, 9)
[upper, middle, lower] = ta.bb(close, 20, 2)
```

For: standard indicators without re-implementing.

## Time variables

- `time`. UNIX timestamp ms.
- `timenow`. Current time (real-world, not bar time).
- `dayofweek(time)`. 1-7.
- `hour(time)`, `minute(time)`. Per bar.
- `year(time)`, `month(time)`.

For: time-of-day filters; session detection.

## Sessions

```pinescript
inSession = time(timeframe.period, "0930-1600", "America/New_York")
```

True during US market hours; useful for limiting trading to session.

## Bar state

- `barstate.isconfirmed`. Bar closed (not real-time).
- `barstate.isfirst`. First bar in dataset.
- `barstate.islast`. Most recent bar.
- `barstate.isnew`. New bar started.

For: only execute logic at certain bar states.

## Real-time vs. confirmed

Bars update in real-time as price changes. Use `barstate.isconfirmed` to only act on closed bars; avoids "repainting" issues.

## Mistakes to avoid

- **Acting on unconfirmed bars.** Signal flips intra-bar.
- **Forgetting [N] historical reference.** Compare wrong values.
- **Reinventing standard indicators.** Use ta. namespace.

## Summary

- Series = values across bars; `[N]` accesses N bars ago.
- Built-in ta. namespace for standard indicators.
- Time functions for session / day filtering.
- `barstate.isconfirmed` for closed-bar logic.

Next: conditionals and loops.
