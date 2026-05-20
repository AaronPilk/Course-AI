---
module: 4
position: 2
title: "Survivorship, look-ahead, and lookback bias"
objective: "The traps that quietly destroy backtest validity."
estimated_minutes: 6
---

# Survivorship, look-ahead, and lookback bias

## Why this matters

You can run a perfect backtest framework on perfect data and get garbage results, because one of these biases poisoned the inputs. They're invisible until you know what to look for.

Every serious algo trader has been bitten by at least one. Most live blow-ups trace back to a bias the backtest didn't catch.

## Survivorship bias

The most common. You backtest a strategy on the "S&P 500 today" — but the S&P 500 today is the set of companies that *survived* to today. Companies that went bankrupt or were delisted aren't in your data.

Example: backtest a long-only momentum strategy on today's S&P 500 from 2000-2023.

- You see Apple, Amazon, Nvidia perform brilliantly.
- You don't see Enron, Lehman, Bear Stearns, Worldcom, Eastman Kodak, etc., because they aren't in today's index.
- Your backtest shows great returns from holding "winners".
- In real-time 2000, you couldn't have known which would be the winners; you would have held all of them, including the failures.

**Fix:** use **point-in-time** data — the actual S&P 500 membership at each historical date, including names that were delisted. Same for any other universe.

Sources: Norgate Data, Sharadar, paid data vendors that provide historical index constituents. Free data (Yahoo, Alpaca) does not include delisted names properly.

For most retail backtests, this means: results are systematically too optimistic. Discount accordingly.

## Look-ahead bias

Using data in your signal computation that wouldn't have been available at the time of the signal.

**Most common case:** computing a feature from a bar that "today" hasn't closed yet.

```python
# ❌ Lookahead — uses today's close to make today's decision
df['signal'] = df['close'] > df['close'].rolling(20).mean()
buy_at_today_open = df['signal']

# ✅ Use prior close
df['signal'] = df['close'].shift(1) > df['close'].rolling(20).mean().shift(1)
buy_at_today_open = df['signal']
```

The fix is `.shift(1)` everywhere a signal references data that wouldn't be known yet.

**Second case:** using "future" labels accidentally.

```python
# ❌ This computes "did price go up next?" — only knowable in the future
df['future_return'] = df['close'].shift(-5)
df['signal'] = df['future_return'] > df['close']
```

`shift(-N)` introduces a future value. Sometimes useful for ML (creating training labels), but the test set must not see future bars when generating signals.

**Third case:** intra-bar fills.

If you compute a signal at the close of a bar and "fill at the open of the next bar," your backtest is honest. If you compute at the close and "fill at the same bar's close" — that's lookahead, even if subtle.

## Survivor's universe in mutual funds and crypto

Same bias hits non-stock universes:

- **Mutual funds.** Many close or merge. Backtests on "today's funds" miss closures.
- **Crypto.** Many tokens went to zero (Luna, FTT, hundreds of "rug pulls"). Backtests on today's top-100 coins are sunny.
- **ETFs.** Lots of ETFs delisted in 2010s; survivorship in ETF backtests is real.

Specialized data providers maintain historical constituents. Be skeptical of any backtest that doesn't use them.

## Lookback bias (data snooping)

Closely related to overfitting. You try 100 strategy variants on the same data; one looks profitable. That doesn't mean it has an edge — it means you searched a lot.

The technical name is **multiple comparisons problem**. If you test 100 strategies at p < 0.05 significance, you expect ~5 false positives by chance.

**Fix:** out-of-sample testing. Hold out part of your data; don't look at it during research. When you have a "promising" strategy, run it on the held-out set. If it works there too, your edge is more likely real.

The discipline is hard. Most retail traders peek constantly at all the data and convince themselves they're not.

## In-sample / out-of-sample split

The discipline:

```python
in_sample = df.loc['2015-01-01':'2020-12-31']
out_of_sample = df.loc['2021-01-01':'2024-12-31']

# Build / tune / explore using ONLY in_sample
strategy = research(in_sample)

# Final test (do once, no tweaks afterward)
result = backtest(strategy, out_of_sample)
```

If you tune on out-of-sample, you've contaminated it. The whole point is that the OOS set is "blind."

Real discipline: once you've looked at out-of-sample, you can't use it again for the same strategy family. Need a fresh holdout for the next iteration.

## Walk-forward analysis

A more rigorous version of OOS testing:

1. Train/tune on years 1-3.
2. Test on year 4.
3. Roll: train on years 2-4, test on year 5.
4. Continue.

Each test period is genuinely out-of-sample. Aggregating across all rolling tests, you get a more honest performance estimate.

vectorbt, backtrader, and other libraries have walk-forward modules. Use them.

## Sector and time filtering

Often a strategy works on a specific subset. If you tested 50 sectors and the best one performed well, you've overfit. Test the strategy on a broad universe, not the cherry-picked best.

Same for time: if 2020-2021 performed brilliantly and 2018-2019 was flat, you may have a regime-specific strategy. Test across regimes.

## Curve-fitting via parameter optimization

Tune parameters (window sizes, thresholds) until backtest looks good — that's curve-fitting. Almost always destroys live performance.

Symptoms:

- Strategy uses very specific numbers (window=23, threshold=2.7, instead of round 20 and 3).
- Sharpe collapses with small parameter changes.
- Performance varies wildly across nearby parameter sets.

**Robustness test:** evaluate at multiple parameter values, plot the metric. If only a narrow band works, you've curve-fit.

Robust strategies have wide plateaus — they work for a range of parameter values, not just one.

## The smoking gun

A backtest that runs flawlessly often has a bug. If something looks too good (Sharpe > 3, 80% win rate, no drawdowns), the question isn't "how do I deploy this?" — it's "where's the lookahead?"

Common places to find it:

- Resampling or rolling functions without `.shift(1)`.
- Using "adjusted" prices on entry but unadjusted on exit (or vice versa).
- Reading `next bar's open` into "today's" decision.
- Crypto/futures where the data uses end-of-day rolling versus continuous contracts.

When in doubt, the answer is `.shift(1)`.

## Mistakes to avoid

- **Backtesting on today's index members.** Survivorship.
- **Not using `.shift(1)`.** Lookahead in signals.
- **Tuning on the test set.** Contamination.
- **Cherry-picked universes.** Overfit to the names that worked.
- **Trusting Sharpe > 3.** Almost always a bug.

## Summary

- Survivorship: today's universe excludes failures. Use point-in-time data.
- Lookahead: signals can't see future bars. `.shift(1)` everywhere.
- Lookback bias: multiple-testing destroys p-values. Strict OOS discipline.
- Walk-forward analysis: rigorous OOS for time-series.
- Robust strategies have wide parameter plateaus — narrow ones are curve-fit.

Next: modeling costs realistically.
