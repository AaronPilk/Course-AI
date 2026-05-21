---
module: 1
position: 4
title: "Conditionals and loops"
objective: "Branch logic + iterate over bars."
estimated_minutes: 5
---

# Conditionals and loops

## if statement

```pinescript
if close > open
    label.new(bar_index, high, "Green bar")
```

Indent body 4 spaces.

For: branch based on condition.

## if/else

```pinescript
trend = if close > sma200
    "bullish"
else
    "bearish"
```

Returns value; can assign to variable.

For: conditional value assignment.

## Ternary

```pinescript
color = close > open ? color.green : color.red
```

Compact one-liner.

For: simple conditional value.

## switch

```pinescript
signal = switch
    rsiValue > 70 => "overbought"
    rsiValue < 30 => "oversold"
    =>             "neutral"
```

Multiple branches; cleaner than nested if.

For: many mutually exclusive cases.

## for loop

```pinescript
sum = 0.0
for i = 0 to 9
    sum := sum + close[i]
avg = sum / 10
```

`:=` for reassignment (different from `=` for declaration).

For: iterate over bars / arrays.

## while loop

```pinescript
i = 0
while close[i] > open[i]
    i := i + 1
```

For: loop until condition false.

## Loops over arrays

```pinescript
prices = array.new<float>()
for i = 0 to 99
    array.push(prices, close[i])

avg = array.avg(prices)
```

For: collect + analyze sets of values.

## Conditional plotting

```pinescript
plotshape(close > sma, "Buy", shape.triangleup,
          location.belowbar, color.green)
```

Plots only when condition true.

For: visualize signals on chart.

## Assignment vs. comparison

- `=`. Initial declaration: `x = 10`.
- `:=`. Reassign: `x := x + 1`.
- `==`. Equality check: `if x == 10`.

Common bug: using `=` where `:=` needed.

## Logical operators

- `and`. Both true.
- `or`. Either true.
- `not`. Inverse.

```pinescript
buy = rsi < 30 and close > sma and not isWeekend
```

For: combining conditions.

## Mistakes to avoid

- **Confusing `=` and `:=`.** Reassignment needs `:=`.
- **Indentation errors.** Pine uses Python-like indent.
- **Loops over too many bars.** Performance hit; prefer ta. built-ins.
- **Variable initialized in loop.** Resets every bar; declare outside.

## Summary

- if / else / ternary / switch for branching.
- for / while for iteration.
- `:=` for reassignment.
- Logical: and / or / not.

Module 1 complete. Next module: building indicators.
