---
module: 3
position: 2
title: "Orders and exits"
objective: "Master entry, exit, stop, limit, and bracket orders."
estimated_minutes: 5
---

# Orders and exits

## Entry types

```pinescript
// Market order
strategy.entry("Long", strategy.long)

// Limit order
strategy.entry("Long", strategy.long, limit=close * 0.99)

// Stop order (breakout)
strategy.entry("Long", strategy.long, stop=high * 1.01)

// Stop-limit
strategy.entry("Long", strategy.long, stop=stopPrice, limit=limitPrice)
```

`limit` = buy below current; `stop` = buy above current.

For: entry style based on signal type.

## strategy.order vs. strategy.entry

```pinescript
// .entry respects pyramiding + closes opposite positions
strategy.entry("Long", strategy.long)

// .order doesn't auto-close opposite; just places order
strategy.order("Buy", strategy.long, qty=100)
```

For: `.entry` for clean trade management; `.order` for advanced.

## strategy.exit

```pinescript
strategy.entry("Long", strategy.long)
strategy.exit("Bracket", from_entry="Long",
              stop=stopPrice,      // SL
              limit=takePrice)      // TP
```

Sets stop loss + take profit for entry.

For: bracket orders (SL/TP at entry).

## Trailing stop

```pinescript
strategy.exit("Trail", from_entry="Long",
              trail_points=200,      // Trail by 200 ticks
              trail_offset=100)      // Activate after 100 ticks profit
```

Stop follows price as it moves favorably.

For: let winners run; lock in gains.

## Percentage stop / target

```pinescript
strategy.entry("Long", strategy.long)
entryPrice = strategy.position_avg_price
stopPrice = entryPrice * 0.97       // 3% stop
takePrice = entryPrice * 1.06       // 6% target (2R)

strategy.exit("TP/SL", from_entry="Long", stop=stopPrice, limit=takePrice)
```

For: standard risk/reward setup.

## ATR-based stops

```pinescript
atrValue = ta.atr(14)
stopMult = input.float(2.0, "Stop ATR")
takeMult = input.float(4.0, "Take ATR")

if buyCondition
    strategy.entry("Long", strategy.long)

stopPrice = strategy.position_avg_price - atrValue * stopMult
takePrice = strategy.position_avg_price + atrValue * takeMult

strategy.exit("ATR Exit", from_entry="Long", stop=stopPrice, limit=takePrice)
```

Volatility-adaptive bracket.

For: stops that scale with market conditions.

## Multiple exits (TP1, TP2, runner)

```pinescript
strategy.entry("Long", strategy.long, qty=100)

// Take 50% off at first target
strategy.exit("TP1", from_entry="Long", qty=50, limit=tp1Price, stop=slPrice)

// Take 30% at second
strategy.exit("TP2", from_entry="Long", qty=30, limit=tp2Price, stop=slPrice)

// Runner with trailing stop
strategy.exit("Runner", from_entry="Long", qty=20, trail_points=500, trail_offset=100, stop=slPrice)
```

For: lock partial profits; let runner extend.

## Time-based exit

```pinescript
strategy.entry("Long", strategy.long)
barsSinceEntry = bar_index - strategy.opentrades.entry_bar_index(0)

if barsSinceEntry > 20    // Exit if held > 20 bars
    strategy.close("Long")
```

For: scalp strategies; preventing dead trades.

## Cancel orders

```pinescript
strategy.cancel("Long")          // Cancel pending Long entry
strategy.cancel_all()             // Cancel everything pending
```

For: invalidate signals before fill.

## Reverse position

```pinescript
if shortSignal and strategy.position_size > 0
    strategy.entry("Short", strategy.short)
    // .entry auto-closes Long and opens Short
```

For: trend-following reversal systems.

## Close on opposite signal

```pinescript
if longCondition
    strategy.entry("Long", strategy.long)

if shortCondition and strategy.position_size > 0
    strategy.close("Long")
```

For: long-only systems exiting on bearish signal.

## strategy.position_size

```pinescript
size = strategy.position_size       // Positive = long; negative = short; 0 = flat
inLong = strategy.position_size > 0
inShort = strategy.position_size < 0
flat = strategy.position_size == 0
```

For: conditional logic based on open position.

## Order fill assumptions

In backtest, orders fill assuming:
- Bar's high reached limit price (sells) / low reached limit price (buys).
- Bar's range touched stop = stop fills at that price.
- Reality: real markets may gap through; slippage matters.

For: understand backtest vs. live divergence.

## Mistakes to avoid

- **No stop loss.** One trade can wipe gains.
- **Stops too tight.** Whipsawed out of valid trades.
- **Reversal without flat check.** Doubles position size unexpectedly.
- **Forgetting `from_entry`.** Exit doesn't link to correct entry.

## Summary

- .entry for managed trades; .exit for SL/TP brackets.
- ATR-based stops adapt to volatility.
- Multiple exits (TP1/TP2/runner) for scaling out.
- Always use stops; configure realistically.

Next: risk management and position sizing.
