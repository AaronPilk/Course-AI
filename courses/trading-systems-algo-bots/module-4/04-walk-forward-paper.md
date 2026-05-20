---
module: 4
position: 4
title: "From backtest to walk-forward to paper"
objective: "The validation pipeline before risking real money."
estimated_minutes: 6
---

# From backtest to walk-forward to paper

## The four-stage pipeline

A serious algo trader validates a strategy through stages of increasing realism:

```
1. Backtest (in-sample)
   ↓ filter (most die here)
2. Walk-forward / out-of-sample
   ↓ filter
3. Paper trade (real broker, fake money)
   ↓ filter
4. Live trade (real broker, real money)
```

Each stage filters out strategies that work only in artificial conditions. Most candidates die at stage 1 or 2. The few that reach stage 4 have a chance.

Skipping stages is how retail traders lose money. There are no shortcuts.

## Stage 1: in-sample backtest

This is the research phase:
- Build the strategy.
- Tune parameters.
- Validate logic.
- Check for obvious bugs.

You will look at this data many times. By the time you're "done", the strategy is calibrated to it.

Therefore: the in-sample result is meaningless as a predictor of future performance. It tells you whether the strategy *could* work in some world; not whether it *will*.

Common mistake: ship the strategy after in-sample looks good. Disaster.

## Stage 2: out-of-sample / walk-forward

Hold out data the strategy never saw during research:

```python
df = load_all_data()  # 2015-2024

# Strict split
in_sample = df.loc['2015':'2021']
out_of_sample = df.loc['2022':'2024']

# All research uses only in_sample
strategy = research_pipeline(in_sample)

# Run ONCE on out_of_sample — no tweaks afterward
oos_result = backtest(strategy, out_of_sample)
print(f'IS Sharpe: {in_sample_sharpe}, OOS Sharpe: {oos_result.sharpe}')
```

If OOS Sharpe is significantly worse than IS Sharpe → overfit; discard.

If OOS holds up → cautiously proceed.

If OOS is *better* than IS → suspicious; might be regime-specific or random.

**Walk-forward** is a stronger version: train on years 1-3, test on year 4. Roll: train on years 2-4, test on year 5. And so on. Aggregating across rolling tests gives a more honest estimate.

## The "I peeked" problem

Once you've looked at OOS results, you can't use that data again for the same strategy family. Period.

If you saw OOS Sharpe = 0.4 and tweaked the strategy "to fix that", your new OOS test is contaminated. You're effectively training on what was supposed to be the test set.

Workaround: have multiple holdouts. Year 2023 for first OOS, year 2024 for second OOS, etc. But you only get to use each one once.

The discipline is hard. Most traders convince themselves they're not contaminating things; usually they are.

## Stage 3: paper trading

You wrote the bot; backtest looks good; OOS holds up. Now: connect to the broker's paper account and run the bot live, fake-money.

What this catches:
- **Execution bugs.** Signal mismatches, order-management errors, timing issues.
- **API surprises.** Rate limits, order rejection paths, data quirks.
- **Mismatch between backtest fills and real fills.** Even paper, the broker simulates real fills against current book.
- **Operational issues.** Bot crashing overnight, timezone bugs, holiday handling.

Run for 1-3 months. Track:
- Live PnL vs backtest PnL on the same period.
- Trade-by-trade fill comparison.
- Latency between signal and fill.

If paper-trading matches backtest expectations within reasonable tolerance → green light.

If paper diverges materially → diagnose. Common causes: data lag, slippage worse than modeled, order types interacting unexpectedly with real fills.

## Stage 4: live trading with small size

Don't go full-size on day one. Start at 10-25% of intended size for the first weeks.

```python
# Config flag
LIVE_SIZE_MULTIPLIER = 0.25  # quarter size for first month
# Increase to 0.5, 0.75, 1.0 as confidence builds
```

This bounds the cost of any unknown failure mode. If something breaks, you lose 25% of what you would have.

Watch the first 100 trades carefully. Compare to backtest and paper expectations. If anything diverges meaningfully, pause and investigate.

## Real-time slippage tracking

Build a live monitor:

```python
def log_fill(intended_price, fill_price, qty, symbol):
    slip_bps = (fill_price - intended_price) / intended_price * 10000
    db.log_slippage({
        'symbol': symbol,
        'qty': qty,
        'intended': intended_price,
        'fill': fill_price,
        'slippage_bps': slip_bps,
        'modeled_bps': compute_modeled_slippage(symbol, qty),
    })
```

Daily report:
- Avg actual slippage vs modeled.
- Names with worst slippage.
- Times of day with worst slippage.

If model is consistently optimistic → bump up.

## Strategy promotion criteria

Before increasing size from 25% → 50% → 75% → 100%:

- 4+ weeks at current size with no major surprises.
- Live PnL within X% of paper/backtest projection.
- No data, execution, or operational anomalies unresolved.
- Drawdown within expected range.

Skipping these because "it's working great so far" is how live capital evaporates.

## When to retire a strategy

Strategies decay. Watch for:

- **Live PnL diverging persistently from backtest.** Real conditions have changed.
- **Drawdown exceeding designed-for max.** Strategy is broken or regime-shifted.
- **Edge crowding.** Once-rare signals now common; spread compressed.
- **Better strategy available.** Capital has opportunity cost.

When you retire a strategy, do it cleanly: flatten, document the cause, archive logs for post-mortem.

## The portfolio of pipelines

Mature algo traders run many strategies in different pipeline stages simultaneously:

- 5-10 strategies in research (backtests).
- 2-3 in paper trading.
- 1-2 in initial live (small size).
- 1-2 in mature live (full size).
- 0-2 in retirement / wind-down.

The pipeline ensures fresh edges replace decayed ones. Single-strategy traders are at the mercy of that strategy's life cycle.

## Mistakes to avoid

- **Going live straight from backtest.** Skip paper at your peril.
- **Tweaking after seeing OOS.** Contamination.
- **Full size on day one.** No room for unknown failures.
- **No live calibration.** Reality drifts; model must follow.
- **Holding decayed strategies for sentimental reasons.** Capital has cost.

## Summary

- Pipeline: backtest → OOS / walk-forward → paper → live small → live full.
- Each stage filters strategies that work only in artificial conditions.
- OOS data is single-use; contamination ruins it.
- Paper-trade 1-3 months before live.
- Start live at 25% size; promote based on stability.
- Retire strategies when they decay; replace with new ones.

Next module: position sizing, kill switches, monitoring — going live without disaster.
