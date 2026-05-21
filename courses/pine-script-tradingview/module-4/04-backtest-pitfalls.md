---
module: 4
position: 4
title: "Backtest pitfalls"
objective: "Common traps that make backtests lie."
estimated_minutes: 5
---

# Backtest pitfalls

## Repainting

Indicator / strategy values change after the bar has formed. Backtest looks great because it used "future" data; live signals flicker + don't match.

Causes:
- `request.security` with `lookahead_on`.
- Indicators using current bar's data (e.g., raw `close` without `barstate.isconfirmed`).
- `series` index `-N` accesses.

Fix:
```pinescript
// Use confirmed close from HTF
htf = request.security(syminfo.tickerid, "D", close[1])

// Only execute on confirmed bar
if condition and barstate.isconfirmed
    strategy.entry("Long", strategy.long)
```

For: trustworthy backtest matching live.

## Look-ahead bias

Using info not available at trade time.

```pinescript
// BAD: tomorrow's high
highTomorrow = high[-1]

// BAD: knowing the future
if close[-5] > close
    // Imagines a future check
```

Pine prevents most but security calls can leak.

## Survivorship bias

Backtest on currently-listed stocks excludes failed ones. If you tested 1990s tech survival, AAPL/MSFT shine — but you didn't account for Pets.com, Sun, Compaq.

Mitigation: test on broad indices (SPY) or constituents-at-time datasets. Crypto less affected (still survivor-biased to coins that didn't die).

For: accurate edge measurement.

## Slippage realism

Default slippage = 0 ticks → unrealistic fills.

```pinescript
strategy("S", slippage=2)    // Slippage in ticks
```

Real slippage by market:
- Liquid stocks / ES futures: 0.5-1 tick.
- Mid-cap stocks: 1-3 ticks.
- Crypto majors: 0.05-0.2% effective.
- Illiquid / small-cap: 5-20 ticks.

For: account for execution costs.

## Commission realism

Zero commission → backtest fantasy.

Real costs:
- Retail brokers: 0% on stocks (but spreads).
- Crypto: 0.1-0.25% per side.
- Forex: 0.5-1 pip spread.
- Options: $0.65 per contract.

Set in strategy():
```pinescript
strategy("S",
         commission_type=strategy.commission.percent,
         commission_value=0.1)
```

For: realistic P&L.

## Limit order assumptions

Backtest assumes limit orders fill when high/low touches limit price. Live: order at $100 may not fill if only one trade prints at $100 and others ahead in queue take it.

For: limit-heavy strategies overstate fill rates.

## Stop order slippage in gaps

Backtest: stop at $95 fills at $95.
Live gap: stock opens at $90; stop fills at $90 (5% slippage).

Common in:
- Earnings gaps.
- Overnight gaps.
- Crypto flash crashes.
- News events.

For: budget for gap risk on overnight positions.

## Same-bar entry / exit

```pinescript
strategy("S", process_orders_on_close=true)
```

`true` = enter + exit on same bar's close. Often unrealistic; orders typically delay one bar.

Default `false` = enter at next bar's open. More realistic.

For: realistic execution lag.

## Volume assumptions

```pinescript
strategy.entry("Long", strategy.long, qty=10000)
```

Pine doesn't model whether market could absorb 10,000 shares without moving. Backtest assumes yes; live, large orders move the market.

For: large size strategies must use realistic position sizing on liquid markets.

## Synthetic data

If your data source has bad ticks (wicks, exchange errors), backtest reacts to phantom levels.

Mitigation:
- Use clean exchange data.
- Filter outliers (`high > open * 1.5` → skip bar).
- Cross-check with second data source.

For: avoid backtest signals from data errors.

## Optimization on test data

Cardinal sin: tweaking on OOS data.

Workflow corruption:
1. Backtest 2018-2022.
2. Promising; test OOS 2023.
3. OOS fails. Tweak parameters.
4. Re-test OOS 2023.
5. Now OOS = IS.

Solution: split data once, optimize on train only. OOS = single shot.

For: scientific validity.

## Selection bias

Testing 50 strategies; one shines. That winner is a survivor of 50; you'd expect one to look good by chance alone.

Bonferroni correction: divide significance threshold by number of strategies tested. If `p < 0.05` for one strategy, you need `p < 0.001` to claim significance after 50 tests.

For: appropriate skepticism with multiple strategies.

## Curve-fit to data quirks

Specific exchange's wick patterns, specific historical event (March 2020 crash), specific time-of-day quirk → strategy capitalizes on noise.

Test across:
- Multiple exchanges (Binance vs. Coinbase BTC).
- Different time periods (exclude COVID-era separately).
- Different sessions (US vs. Asian hours).

For: confirm generalization.

## TradingView free vs. paid

Free tier:
- Limited bars (5,000 historical).
- One open chart.
- Limited alerts.

Premium:
- 20,000+ bars history.
- Deep Backtest.
- More alerts.

For: serious work needs Premium.

## Realistic backtest checklist

- [ ] Realistic initial_capital ($10k+).
- [ ] commission_type set; commission_value ≥ 0.05%.
- [ ] slippage ≥ 1 tick.
- [ ] process_orders_on_close = false (default).
- [ ] 100+ trades over 3+ years.
- [ ] 2+ market regimes covered.
- [ ] Tested on 3+ symbols.
- [ ] In-sample / out-of-sample split honored.
- [ ] No `lookahead_on` in security calls.
- [ ] `barstate.isconfirmed` on entries.

For: trustworthy results.

## Mistakes to avoid

- **Zero commission + slippage.** Backtest fantasy.
- **process_orders_on_close=true.** Unrealistic timing.
- **Single symbol test.** Curve-fit risk.
- **Touching OOS data.** Contamination.

## Summary

- Repainting + look-ahead bias = silent backtest killer.
- Commission + slippage realistic.
- Out-of-sample untouched until final test.
- Test across symbols + regimes + time periods.

Module 4 complete. Module 5: alerts and automation.
