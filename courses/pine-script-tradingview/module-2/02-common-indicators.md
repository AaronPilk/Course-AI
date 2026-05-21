---
module: 2
position: 2
title: "Common indicators"
objective: "Implement SMA, EMA, RSI, MACD, Bollinger Bands."
estimated_minutes: 5
---

# Common indicators

## Moving averages

```pinescript
//@version=5
indicator("MA Variants", overlay=true)
length = input.int(20, "Length")

sma = ta.sma(close, length)
ema = ta.ema(close, length)
wma = ta.wma(close, length)
rma = ta.rma(close, length)   // Wilder's
vwma = ta.vwma(close, length, volume)
hma = ta.hma(close, length)   // Hull

plot(sma, "SMA", color.blue)
plot(ema, "EMA", color.orange)
plot(hma, "HMA", color.purple)
```

Each weights bars differently. EMA reacts faster than SMA; HMA reduces lag.

For: trend identification + smoothing noise.

## RSI

```pinescript
//@version=5
indicator("RSI", overlay=false)
length = input.int(14, "Length")

rsiValue = ta.rsi(close, length)
plot(rsiValue, "RSI", color.purple)
hline(70, "Overbought", color.red)
hline(30, "Oversold", color.green)
hline(50, "Midline", color.gray, linestyle=hline.style_dotted)

bgcolor(rsiValue > 70 ? color.new(color.red, 90) :
        rsiValue < 30 ? color.new(color.green, 90) : na)
```

Measures speed + magnitude of price changes. 0-100 scale. Overbought >70; oversold <30.

For: spotting momentum extremes; divergence analysis.

## MACD

```pinescript
//@version=5
indicator("MACD", overlay=false)
fast = input.int(12, "Fast")
slow = input.int(26, "Slow")
signal = input.int(9, "Signal")

[macdLine, signalLine, histogram] = ta.macd(close, fast, slow, signal)

plot(macdLine, "MACD", color.blue)
plot(signalLine, "Signal", color.orange)
plot(histogram, "Histogram", color=histogram >= 0 ? color.green : color.red, style=plot.style_columns)
hline(0, "Zero", color.gray)
```

Trend-following + momentum. Crossovers + zero line + histogram for signals.

For: trend changes; momentum shifts.

## Bollinger Bands

```pinescript
//@version=5
indicator("BB", overlay=true)
length = input.int(20, "Length")
mult = input.float(2.0, "Multiplier")

[middle, upper, lower] = ta.bb(close, length, mult)

p1 = plot(upper, "Upper", color.red)
p2 = plot(middle, "Middle", color.blue)
p3 = plot(lower, "Lower", color.green)
fill(p1, p3, color.new(color.blue, 90))
```

SMA + standard deviation bands. Price stays inside ~95% of time at 2σ.

For: volatility; mean reversion; squeeze breakouts.

## ATR

```pinescript
atr = ta.atr(14)
plot(atr, "ATR", color.orange)

// Common use: stop loss distance
stopDistance = atr * 2
```

Average True Range — measures volatility. Use for stop sizing, position sizing.

For: volatility-aware position management.

## Stochastic

```pinescript
[k, d] = ta.stoch(close, high, low, 14, 3)
kSmooth = ta.sma(k, 3)
dSmooth = ta.sma(d, 3)

plot(kSmooth, "K", color.blue)
plot(dSmooth, "D", color.orange)
hline(80, "Overbought")
hline(20, "Oversold")
```

Where current price sits in N-bar range.

For: short-term overbought/oversold; reversal signals.

## VWAP

```pinescript
vwap = ta.vwap(close)
plot(vwap, "VWAP", color.purple, linewidth=2)
```

Volume Weighted Average Price. Anchored to session start.

For: intraday institutional reference; trend bias.

## Custom indicator: rate of change

```pinescript
rocLength = input.int(10, "ROC Length")
roc = (close - close[rocLength]) / close[rocLength] * 100
plot(roc, "ROC %", color.blue)
hline(0)
```

Build your own; Pine handles the math.

For: custom momentum measures.

## Combining indicators

```pinescript
// Trend filter + momentum entry
ema200 = ta.ema(close, 200)
rsi = ta.rsi(close, 14)
uptrend = close > ema200
buySignal = uptrend and rsi < 35

plotshape(buySignal, "Buy", shape.triangleup, location.belowbar, color.green)
```

Layer indicators for confluence.

For: better signal quality than single indicator.

## Indicator vs. strategy distinction

`indicator()` only plots; `strategy()` plots + backtests with entries / exits. Same math; different framework.

For: visual analysis (indicator) vs. P&L testing (strategy).

## Mistakes to avoid

- **Single-indicator strategies.** False signals; need confluence.
- **Optimization to one period.** Curve-fit; doesn't generalize.
- **Ignoring market regime.** Trend indicators fail in chop; mean-reversion fails in trends.
- **Overlay on wrong pane.** RSI / MACD belong in separate pane; MAs overlay price.

## Summary

- ta.sma / ema / wma / hma / vwma for averages.
- ta.rsi / macd / bb / atr / stoch for popular oscillators.
- Combine for confluence.
- Custom math possible — Pine is full programming language.

Next: multi-timeframe analysis.
