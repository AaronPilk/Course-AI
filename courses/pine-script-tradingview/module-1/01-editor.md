---
module: 1
position: 1
title: "TradingView + Pine editor"
objective: "Set up Pine Script development in TradingView."
estimated_minutes: 5
---

# TradingView + Pine editor

## What Pine Script is

TradingView's proprietary language for:
- Custom technical indicators.
- Trading strategies with backtesting.
- Real-time alerts.
- Visualizations on charts.

60M+ TradingView users; Pine Script the standard for charting scripts.

## Pine version 5

Latest version (2026). Major improvements over v4:
- Better types (matrices, maps).
- Better error handling.
- More built-in functions.
- Cleaner syntax.

Always use v5 for new scripts: `//@version=5` first line.

## Pine Editor

Click Pine Editor tab in TradingView (bottom of chart). Features:
- Syntax highlighting.
- Auto-complete.
- Save scripts to your account.
- Publish to community.

For: code, save, share.

## Basic script structure

```pinescript
//@version=5
indicator("My Indicator", overlay=true)

// Code here
plot(close)
```

- `//@version=5` declares Pine version.
- `indicator()` for visual indicator OR `strategy()` for trading strategy.
- `overlay=true` plots on main chart vs. separate pane.

## Adding to chart

After writing:
1. Click "Add to chart."
2. Script runs; output appears on chart.
3. Save the script for reuse.

For: see output instantly.

## Account tiers

- **Free.** Basic; limited indicators on chart.
- **Pro.** More indicators, custom timeframes.
- **Premium.** Even more; priority alerts.

Pine Script works on all tiers; Premium needed for some features (extended hours alerts, etc.).

## Published scripts

Community scripts:
- Browse "Public Library."
- Copy + customize.
- Standard indicators (SuperTrend, VWAP variants, many indicators).

For: learn from + reuse.

## Mistakes to avoid

- **Using v4 in 2026.** Outdated.
- **Skipping documentation.** Massive reference available.
- **Closed-source published.** Limited learning.

## Summary

- Pine Script = TradingView scripting language.
- v5 current; declare with //@version=5.
- Pine Editor in TradingView (bottom tab).
- indicator() or strategy() at top.
- Public library for learning.

Next: variables, types, operators.
