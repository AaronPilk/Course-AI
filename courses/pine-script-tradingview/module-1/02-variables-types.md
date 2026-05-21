---
module: 1
position: 2
title: "Variables, types, operators"
objective: "Pine Script syntax basics."
estimated_minutes: 5
---

# Variables, types, operators

## Declaring variables

```pinescript
myVar = 10
myVar2 = "hello"
myBool = true
```

Type inferred from value.

## Types

- **int.** Integer.
- **float.** Decimal.
- **bool.** True/false.
- **string.** Text.
- **color.** Color literals (color.red, color.new(color.blue, 50)).
- **na.** Not available; for missing data.

Plus series of each type (covered next).

## Operators

- Arithmetic: + - * / %.
- Comparison: == != < > <= >=.
- Logical: and or not.
- Ternary: cond ? a : b.

## Built-in variables

Pre-defined:
- `close`, `open`, `high`, `low`. Current bar OHLC.
- `volume`. Current bar volume.
- `time`. Current timestamp.
- `bar_index`. Current bar number.
- `barstate.islast`. Is this the most recent bar.

For: access bar data.

## var keyword

For variables that persist across bars (initialized once):
```pinescript
var counter = 0
counter := counter + 1  // Updates each bar
```

Without var: re-initialized each bar (sometimes wanted, sometimes not).

## Assignment

- `=` declares + initializes.
- `:=` reassigns (after initial).
- `var x = 0` then `x := x + 1` increments.

For: counter / accumulator variables.

## Input variables

User-tweakable settings:
```pinescript
length = input.int(14, "Length", minval=1)
multiplier = input.float(2.0, "Multiplier")
showLabels = input.bool(true, "Show Labels")
```

Appear in indicator settings UI; users adjust.

## Comments

```pinescript
// Single line
/* Multi-line
   comment */
```

## Mistakes to avoid

- **No var on persistent counters.** Resets each bar.
- **Wrong assignment operator.** = vs. :=.
- **Hardcoded values.** Use input() for tunable.

## Summary

- Variables: int, float, bool, string, color.
- Operators standard.
- Built-ins: close, open, high, low, volume.
- `var` for persistent; `:=` for reassign.
- `input()` for user-tweakable.

Next: series and time.
