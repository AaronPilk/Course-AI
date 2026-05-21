---
module: 3
position: 1
title: "Strategy basics"
objective: "Switch from indicator() to strategy() and configure properties."
estimated_minutes: 5
---

# Strategy basics

## indicator() vs. strategy()

```pinescript
// Visualization only
indicator("My Indicator", overlay=true)

// Backtestable trading logic
strategy("My Strategy", overlay=true,
         initial_capital=10000,
         default_qty_type=strategy.percent_of_equity,
         default_qty_value=10,
         commission_type=strategy.commission.percent,
         commission_value=0.05)
```

`strategy()` enables entries / exits + the Strategy Tester pane.

For: simulating + measuring P&L on historical data.

## Key strategy() parameters

- `initial_capital`. Starting equity (default $1000; common: $10k or $100k).
- `default_qty_type`. `strategy.fixed`, `strategy.percent_of_equity`, `strategy.cash`.
- `default_qty_value`. Quantity per trade.
- `currency`. Account currency.
- `commission_type` + `commission_value`. Realistic costs.
- `slippage`. Bars; simulates execution lag.
- `pyramiding`. Max additional entries in same direction.
- `process_orders_on_close`. Default false (next bar's open). True = same bar.

For: realistic backtest configuration.

## Position sizing modes

```pinescript
// 10% of equity per trade
strategy("S1", default_qty_type=strategy.percent_of_equity, default_qty_value=10)

// $5,000 per trade
strategy("S2", default_qty_type=strategy.cash, default_qty_value=5000)

// 100 contracts per trade
strategy("S3", default_qty_type=strategy.fixed, default_qty_value=100)
```

For: control risk per trade.

## Simple entry example

```pinescript
//@version=5
strategy("SMA Cross", overlay=true, initial_capital=10000)

fastMA = ta.sma(close, 9)
slowMA = ta.sma(close, 21)

longCondition = ta.crossover(fastMA, slowMA)
shortCondition = ta.crossunder(fastMA, slowMA)

if longCondition
    strategy.entry("Long", strategy.long)

if shortCondition
    strategy.entry("Short", strategy.short)

plot(fastMA, color=color.blue)
plot(slowMA, color=color.orange)
```

When long signal fires, enters long. New opposite signal closes + reverses.

For: trend-following baseline strategy.

## strategy.entry parameters

```pinescript
strategy.entry(id="Long",                // Trade label
               direction=strategy.long,   // Long / short
               qty=100,                    // Override default
               limit=close * 0.99,         // Limit price
               stop=close * 1.01,          // Stop price
               comment="MA cross long")
```

`id` lets you reference + close specific entries.

## strategy.close

```pinescript
if exitCondition
    strategy.close("Long")              // Close that specific trade

strategy.close_all()                     // Close everything
```

For: rule-based exits.

## strategy properties pane

After loading strategy, "Properties" tab controls:
- Initial capital.
- Order size.
- Pyramiding.
- Commission.
- Verify slippage.

Settings override script defaults for testing.

For: A/B compare configurations without code change.

## Strategy Tester output

Overview tab shows:
- Net profit / gross profit / gross loss.
- Total trades + winning / losing.
- Win rate.
- Profit factor.
- Max drawdown.
- Sharpe ratio.

For: judge whether strategy works.

## Realistic commissions

```pinescript
strategy("S",
         commission_type=strategy.commission.percent,
         commission_value=0.1,           // 0.1% per trade
         slippage=2)                      // 2 ticks
```

Most retail brokerages: 0.05-0.25% per trade. Crypto: similar.

For: don't trick yourself with zero-cost backtests.

## Process orders on close

```pinescript
strategy("S", process_orders_on_close=true)
```

`true` = order fills at current bar's close (more aggressive backtest).
`false` (default) = order fills at next bar's open (more realistic).

For: realistic execution simulation.

## Pyramiding

```pinescript
strategy("S", pyramiding=3)
```

Allows 3 entries in same direction.

For: scaling into trends.

## Mistakes to avoid

- **No commission set.** Backtest looks great; live trades lose to fees.
- **Default initial_capital $1000.** Position sizes too small to test edge.
- **process_orders_on_close=true everywhere.** Unrealistic; over-optimizes.
- **No slippage.** Crypto + low-cap stocks have real slippage.

## Summary

- strategy() enables backtests + entries.
- Set initial_capital, qty, commission, slippage realistically.
- strategy.entry for opening; strategy.close for closing.
- Strategy Tester for P&L, drawdown, Sharpe.

Next: order types and risk management.
