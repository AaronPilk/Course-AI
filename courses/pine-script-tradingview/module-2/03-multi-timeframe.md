---
module: 2
position: 3
title: "Multi-timeframe analysis"
objective: "Pull data from higher timeframes; avoid repainting."
estimated_minutes: 5
---

# Multi-timeframe analysis

## request.security

```pinescript
//@version=5
indicator("HTF MA", overlay=true)

dailyClose = request.security(syminfo.tickerid, "D", close)
dailyMA = request.security(syminfo.tickerid, "D", ta.sma(close, 50))

plot(dailyMA, "Daily 50 MA", color.purple, linewidth=2)
```

Pulls data from another timeframe / symbol.

For: trade lower timeframe with higher timeframe trend bias.

## Function signature

`request.security(symbol, timeframe, expression, gaps, lookahead, ignore_invalid_symbol)`

- `symbol`. `syminfo.tickerid` for current; `"AAPL"` for another.
- `timeframe`. `"D"` / `"60"` / `"240"` / `"W"` / `"M"`.
- `expression`. The series to fetch.

## Repainting hazard

```pinescript
// BAD: lookahead=lookahead_on causes repainting in backtests
bad = request.security(s, "D", close, lookahead=barmerge.lookahead_on)

// GOOD: use close[1] from HTF or default lookahead_off
good = request.security(s, "D", close[1])
```

Default `lookahead_off` + offset = safer. Test on confirmed bars.

For: backtest results that match live performance.

## Higher timeframe close

```pinescript
htf = input.timeframe("D", "HTF")
htfClose = request.security(syminfo.tickerid, htf, close[1])
```

`close[1]` offsets to prior HTF bar's close — known + confirmed.

For: clean signals; no look-ahead bias.

## HTF trend filter

```pinescript
htfEma = request.security(syminfo.tickerid, "D", ta.ema(close, 50))
trendUp = close > htfEma

plotshape(trendUp and ta.crossover(close, ta.ema(close, 20)),
          "Buy with HTF trend", shape.triangleup, location.belowbar, color.green)
```

Trade lower TF only when HTF agrees.

For: top-down analysis; filter losing trades.

## Multiple HTF requests

```pinescript
htf1 = request.security(syminfo.tickerid, "60", ta.rsi(close, 14))
htf4 = request.security(syminfo.tickerid, "240", ta.rsi(close, 14))
htfD = request.security(syminfo.tickerid, "D", ta.rsi(close, 14))

table tbl = table.new(position.top_right, 2, 4)
table.cell(tbl, 0, 0, "TF")
table.cell(tbl, 1, 0, "RSI")
table.cell(tbl, 0, 1, "1H")
table.cell(tbl, 1, 1, str.tostring(htf1, "#.##"))
```

Show multiple timeframes side-by-side.

For: confluence dashboards.

## Cross-symbol data

```pinescript
spy = request.security("SPY", timeframe.period, close)
qqq = request.security("QQQ", timeframe.period, close)
ratio = qqq / spy
plot(ratio, "QQQ/SPY ratio")
```

Compare instruments; relative strength.

For: pairs trading; sector rotation.

## Performance: limits

TradingView limits `request.security` calls per script. Group similar requests:

```pinescript
[htfOpen, htfHigh, htfLow, htfClose] =
    request.security(syminfo.tickerid, "D", [open, high, low, close])
```

One call returns multiple values.

For: stay under request limits.

## Anchored timeframe

```pinescript
// Weekly value resets on new week
weeklyHigh = request.security(syminfo.tickerid, "W", high)
```

For: session highs; weekly pivots.

## ta.change with HTF

```pinescript
htfClose = request.security(syminfo.tickerid, "D", close)
newDay = ta.change(htfClose)
```

Detect when HTF bar updates.

For: trigger logic only on HTF close.

## Mistakes to avoid

- **Forgetting lookahead.** Default is `lookahead_off`; turning on causes repainting.
- **Pulling current HTF close.** Will repaint until HTF bar closes; use `close[1]`.
- **Too many security calls.** Hit limits; bundle in arrays.
- **Mixing timeframes without confirmation.** Adjust signals so HTF closes confirmed.

## Summary

- request.security() for HTF / cross-symbol data.
- Use `close[1]` to prevent repainting.
- Bundle multi-value requests for performance.
- Top-down: HTF trend + LTF entry = standard pattern.

Next: tables and custom dashboards.
