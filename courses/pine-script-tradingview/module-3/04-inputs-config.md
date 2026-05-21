---
module: 3
position: 4
title: "Inputs and configuration"
objective: "Parameterize strategies for testing without code change."
estimated_minutes: 5
---

# Inputs and configuration

## input.int / input.float

```pinescript
length = input.int(20, "MA Length", minval=2, maxval=200)
multiplier = input.float(2.0, "Stop Multiplier", minval=0.5, maxval=10, step=0.1)
```

User-editable in Settings panel.

For: tune parameters without recompiling.

## input.bool

```pinescript
useStop = input.bool(true, "Use Stop Loss")
useTakeProfit = input.bool(true, "Use Take Profit")
```

For: toggle features.

## input.string with options

```pinescript
maType = input.string("EMA", "MA Type",
                      options=["SMA", "EMA", "WMA", "HMA"])

ma = switch maType
    "SMA" => ta.sma(close, length)
    "EMA" => ta.ema(close, length)
    "WMA" => ta.wma(close, length)
    "HMA" => ta.hma(close, length)
```

For: choose between variations.

## input.color

```pinescript
bullColor = input.color(color.green, "Bull Color")
bearColor = input.color(color.red, "Bear Color")
plotcandle(open, high, low, close, color=close > open ? bullColor : bearColor)
```

For: user theming.

## input.timeframe

```pinescript
htf = input.timeframe("D", "Higher Timeframe")
htfClose = request.security(syminfo.tickerid, htf, close[1])
```

For: multi-timeframe configuration.

## input.session

```pinescript
sess = input.session("0930-1600", "Trading Hours")
inSession = time(timeframe.period, sess, "America/New_York")
```

For: session filters; market hours.

## input.symbol

```pinescript
benchmark = input.symbol("SPY", "Benchmark")
spyClose = request.security(benchmark, timeframe.period, close)
```

For: comparison instruments.

## Input grouping

```pinescript
length = input.int(20, "Length", group="MA Settings")
source = input.source(close, "Source", group="MA Settings")

riskPct = input.float(1.0, "Risk %", group="Risk Management")
maxDailyLoss = input.float(3.0, "Max Daily Loss %", group="Risk Management")
```

Groups settings into collapsible sections.

For: organize complex inputs.

## Input inline (same row)

```pinescript
fastLen = input.int(9, "Fast", inline="MA", group="Periods")
slowLen = input.int(21, "Slow", inline="MA", group="Periods")
```

`inline="MA"` puts both on same row.

For: compact UI.

## input.time

```pinescript
startDate = input.time(timestamp("2024-01-01"), "Start Date")
endDate = input.time(timestamp("2025-01-01"), "End Date")

inDateRange = time >= startDate and time <= endDate
```

For: date range filters; specific period testing.

## Tooltips

```pinescript
length = input.int(20, "Length",
                   tooltip="Lookback period for moving average. Higher = smoother, lower = more reactive.")
```

For: documentation for users.

## Conditional inputs

```pinescript
useStop = input.bool(true, "Use Stop Loss")
stopType = input.string("Percent", "Stop Type", options=["Percent", "ATR"])
stopPct = input.float(2.0, "Stop %")
atrMult = input.float(2.0, "ATR Multiplier")

stopDistance = if not useStop
    na
else if stopType == "Percent"
    close * stopPct / 100
else
    ta.atr(14) * atrMult
```

For: feature toggling with mode selection.

## input.source

```pinescript
src = input.source(close, "Source")
ma = ta.sma(src, length)
```

Lets user pick close / open / hl2 / hlc3 / ohlc4 / another series.

For: flexible indicator inputs.

## Default settings strategy

```pinescript
strategy("My Strategy", overlay=true,
         default_qty_type=strategy.percent_of_equity,
         default_qty_value=10,
         calc_on_every_tick=false,        // Bar close only
         process_orders_on_close=false)    // Next bar open
```

For: reasonable defaults that match real-world.

## Optimization workflow

1. Set wide input ranges.
2. Manually walk through parameter combinations.
3. Note in spreadsheet: equity curve, Sharpe, drawdown.
4. Test best-of on out-of-sample period.
5. Avoid the highest-return params (likely overfit); pick robust mid-range.

Pine doesn't have built-in optimizer; TradingView Premium has Deep Backtest.

For: finding robust parameters.

## Save settings as template

In TradingView UI: right-click indicator → "Save Indicator Template". Reload exact config later.

For: A/B test multiple configurations.

## Mistakes to avoid

- **No `minval` / `maxval`.** User can set length=0 → crash.
- **Sliders without `step`.** float inputs jump weirdly.
- **No grouping.** Wall of 30 inputs = unusable.
- **No tooltips.** Future-you forgets what each does.

## Summary

- input.int/float/bool/string/color/timeframe/session for params.
- Groups + inline + tooltips for clean UI.
- Conditional inputs for feature toggles.
- Save templates; A/B test methodically.

Module 3 complete. Module 4: backtesting.
