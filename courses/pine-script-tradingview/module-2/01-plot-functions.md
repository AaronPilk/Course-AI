---
module: 2
position: 1
title: "Plot functions"
objective: "Render lines, shapes, bars, fills on the chart."
estimated_minutes: 5
---

# Plot functions

## plot()

```pinescript
//@version=5
indicator("My SMA", overlay=true)
sma20 = ta.sma(close, 20)
plot(sma20, "SMA 20", color=color.blue, linewidth=2)
```

Most-used plot. Series + style.

For: lines on chart (MAs, oscillators, anything continuous).

## plot styles

```pinescript
plot(value, style=plot.style_line)         // Default
plot(value, style=plot.style_circles)
plot(value, style=plot.style_cross)
plot(value, style=plot.style_columns)      // Histogram-like bars
plot(value, style=plot.style_area)         // Filled
plot(value, style=plot.style_stepline)     // No interpolation
plot(value, style=plot.style_histogram)
```

For: match visual to data type.

## plotshape

```pinescript
plotshape(buySignal, "Buy", shape.triangleup,
          location.belowbar, color.green, size=size.small)
```

Shape on bar when condition true. Common signals:
- `shape.triangleup` / `triangledown`
- `shape.arrowup` / `arrowdown`
- `shape.circle` / `square` / `diamond`
- `shape.cross` / `xcross` / `flag` / `labelup` / `labeldown`

For: discrete buy/sell markers.

## plotchar

```pinescript
plotchar(buy, "Buy", "▲", location.belowbar, color.green)
```

Unicode character instead of shape.

For: custom symbols + minimal visual clutter.

## plotarrow

```pinescript
plotarrow(signal, colorup=color.green, colordown=color.red, maxheight=60)
```

Bullish + bearish arrows automatically.

For: directional signals.

## plotbar / plotcandle

```pinescript
plotcandle(open, high, low, close, "Custom",
           color=close > open ? color.green : color.red)
```

For: custom candle rendering; Heikin Ashi-style overlays.

## hline

```pinescript
hline(0, "Zero line", color=color.gray, linestyle=hline.style_dashed)
hline(70, "Overbought")
hline(30, "Oversold")
```

Horizontal line at level. Static — not series.

For: reference levels (RSI 30/70, MACD zero).

## fill

```pinescript
upper = ta.sma(close, 20) + ta.atr(14)
lower = ta.sma(close, 20) - ta.atr(14)
p1 = plot(upper, "Upper")
p2 = plot(lower, "Lower")
fill(p1, p2, color=color.new(color.blue, 80))
```

Fill region between two plots.

For: bands; ranges; channels.

## bgcolor

```pinescript
bgcolor(inSession ? color.new(color.yellow, 90) : na)
```

Color chart background. Use `na` to not color.

For: highlight session, regime, conditions.

## Color manipulation

```pinescript
color.new(color.blue, 50)     // 50% transparency
color.rgb(255, 128, 0)        // Custom RGB
color.from_gradient(value, 0, 100, color.red, color.green)
```

For: dynamic / data-driven coloring.

## Conditional plot color

```pinescript
plotcolor = close > sma ? color.green : color.red
plot(close, color=plotcolor)
```

Color changes per bar based on condition.

For: visual cues without separate plot calls.

## offset

```pinescript
plot(sma20, "Forward SMA", offset=5)    // Shifts 5 bars right
plot(sma20, "Backward SMA", offset=-5)  // Shifts 5 bars left
```

For: displaced moving averages; future projections (rare).

## display

```pinescript
plot(value, display=display.none)         // Hidden but tracked
plot(value, display=display.data_window)  // Only in data window
plot(value, display=display.all)          // Default
```

For: alerts that need values without cluttering chart.

## Common overlay setup

```pinescript
//@version=5
indicator("MA Stack", overlay=true)

sma20 = ta.sma(close, 20)
sma50 = ta.sma(close, 50)
sma200 = ta.sma(close, 200)

plot(sma20, "20", color.blue)
plot(sma50, "50", color.orange)
plot(sma200, "200", color.red, linewidth=2)
```

For: multi-MA overlay on price.

## Mistakes to avoid

- **plot() in if block.** Plots called only conditionally don't work; use `na` value instead.
- **Forgot overlay=true.** Indicator opens in separate pane.
- **Too many plots.** TradingView limits to 64 plots per script.
- **Histogram from positive + negative without zero line.** Hard to read.

## Summary

- plot() for lines / columns / areas.
- plotshape / plotchar / plotarrow for signals.
- hline for static levels.
- fill between plots for bands.
- bgcolor + dynamic colors for visual context.

Next: common indicator implementations.
