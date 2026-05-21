---
module: 2
position: 4
title: "Tables, labels, and visualization"
objective: "Custom dashboards and annotations on chart."
estimated_minutes: 5
---

# Tables, labels, and visualization

## table.new

```pinescript
//@version=5
indicator("Dashboard", overlay=true)

var table info = table.new(position.top_right, 2, 5,
                            bgcolor=color.new(color.black, 70),
                            border_width=1)

if barstate.islast
    table.cell(info, 0, 0, "Metric", bgcolor=color.gray, text_color=color.white)
    table.cell(info, 1, 0, "Value", bgcolor=color.gray, text_color=color.white)
    table.cell(info, 0, 1, "Close")
    table.cell(info, 1, 1, str.tostring(close, "#.##"))
    table.cell(info, 0, 2, "RSI")
    table.cell(info, 1, 2, str.tostring(ta.rsi(close, 14), "#.##"))
    table.cell(info, 0, 3, "Trend")
    table.cell(info, 1, 3, close > ta.ema(close, 50) ? "Up" : "Down",
               text_color=close > ta.ema(close, 50) ? color.green : color.red)
```

Persistent UI on chart. `var` declares once; `barstate.islast` updates only on latest bar.

For: dashboards; multi-indicator summary.

## Table positions

- `position.top_left` / `top_center` / `top_right`
- `position.middle_left` / `middle_center` / `middle_right`
- `position.bottom_left` / `bottom_center` / `bottom_right`

## label.new

```pinescript
if ta.crossover(close, ta.sma(close, 20))
    label.new(bar_index, high, "BUY",
              color=color.green,
              style=label.style_label_down,
              textcolor=color.white,
              size=size.normal)
```

Annotation tied to bar / price.

For: trade markers; pattern identification.

## Label styles

- `label.style_none`. Text only.
- `label.style_label_up` / `label_down` / `label_left` / `label_right`. Tag with pointer.
- `label.style_circle` / `square` / `diamond` / `triangleup` / `triangledown`.
- `label.style_arrowup` / `arrowdown`.
- `label.style_flag`. Marker flag.

## Managing label count

```pinescript
var label[] labels = array.new<label>()

if buySignal
    newLabel = label.new(bar_index, low, "BUY")
    array.push(labels, newLabel)

    // Keep only last 50 labels
    if array.size(labels) > 50
        label.delete(array.shift(labels))
```

TradingView limits to 500 drawing objects.

For: chart cleanliness; performance.

## line.new

```pinescript
if barstate.islast
    line.new(bar_index - 100, close[100], bar_index, close,
              color=color.blue, width=2,
              extend=extend.right)
```

Draw line between two points.

For: trendlines; support/resistance.

## box.new

```pinescript
if isOrderBlock
    box.new(bar_index - 10, high, bar_index, low,
            border_color=color.green,
            bgcolor=color.new(color.green, 80))
```

Highlight region.

For: order blocks; supply / demand zones.

## str. functions

```pinescript
text = str.tostring(close, "#.##")               // Formatted
text2 = str.format("Price: {0}, RSI: {1}", close, rsiVal)
upper = str.upper("hello")
parts = str.split("a,b,c", ",")
```

String building for labels / tables.

For: dynamic text on chart.

## Color from value

```pinescript
strength = 75.0  // 0-100
color_dynamic = color.from_gradient(strength, 0, 100, color.red, color.green)
```

Heat-map style coloring.

For: visualize magnitude.

## Drawing performance

- Drawings (labels / lines / boxes) are global state.
- Re-creating every bar adds up — use `var` for persistent + `barstate.islast` for last-bar-only updates.
- `.delete()` removes; combine with arrays to keep recent N.

## Real-time vs. confirmed annotations

```pinescript
if ta.crossover(close, sma) and barstate.isconfirmed
    label.new(bar_index, low, "Confirmed Buy")
```

Only annotate on bar close to prevent confusing flickers.

## Custom indicator panel

```pinescript
indicator("Custom Pane", overlay=false)
plot(0, "Zero line", color.gray)

// Hierarchy of signals
plot(rsiSignal ? 1 : 0, "RSI", color.blue, style=plot.style_columns)
plot(macdSignal ? 2 : 0, "MACD", color.orange, style=plot.style_columns)
plot(volumeSignal ? 3 : 0, "Volume", color.purple, style=plot.style_columns)
```

For: stacked signal visualization.

## Mistakes to avoid

- **Creating drawings every bar.** Hits limits + slows script. Use `var` + last bar.
- **Forgetting `var`.** Resets each bar; objects multiply.
- **Tables on every bar.** Use `barstate.islast` only.
- **Hard-coded sizes / positions.** Doesn't adapt across timeframes.

## Summary

- table.new for dashboards; cells with str.tostring.
- label.new / line.new / box.new for annotations.
- `var` + `barstate.islast` for performance.
- Manage drawing count via arrays.

Module 2 complete. Module 3: strategy development.
