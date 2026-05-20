---
module: 4
position: 1
title: "Backtest mechanics: vectorbt and beyond"
objective: "How to run a clean backtest and read the results."
estimated_minutes: 7
---

# Backtest mechanics: vectorbt and beyond

## What backtesting really is

Backtesting = simulating a trading strategy on historical data and computing what would have happened. The goal: estimate whether the strategy has a real edge before risking money.

It's not "predicting the future." Backtests answer: "Would this strategy have made money on past data, assuming reasonable execution?" Past performance isn't future performance, but a strategy that didn't work in the past almost certainly won't work in the future.

## What a backtest framework provides

A good backtester gives you:

- **Data feeding.** Loop or vectorize over historical bars.
- **Order execution simulation.** Compute fills with realistic spreads and slippage.
- **Portfolio tracking.** Position, cash, equity over time.
- **Performance metrics.** Total return, Sharpe, max drawdown, win rate.
- **Trade-level details.** Every trade's entry, exit, PnL, duration.

You can write all of this yourself, but it's tedious and error-prone. Use a library.

## Python backtest libraries

**vectorbt.** Modern, vectorized (fast). Best for systematic strategies on many symbols. Big API surface; steep learning curve but rewards investment.

```python
import vectorbt as vbt

price = vbt.YFData.download('AAPL', start='2020-01-01').get('Close')

fast_ma = vbt.MA.run(price, 10)
slow_ma = vbt.MA.run(price, 50)

entries = fast_ma.ma_crossed_above(slow_ma)
exits = fast_ma.ma_crossed_below(slow_ma)

pf = vbt.Portfolio.from_signals(price, entries, exits, init_cash=10000)

print(pf.total_return())
print(pf.sharpe_ratio())
pf.plot().show()
```

Five lines of code = full backtest with charts.

**backtrader.** Object-oriented, event-driven. Older but well-documented. Slower than vectorbt but flexible for path-dependent logic.

**zipline.** Built by Quantopian (RIP). Production-quality but heavy. Most retail traders moved away after Quantopian shut down.

**bt.** Lightweight, focused on portfolio construction and rebalancing strategies.

**Custom Python with pandas.** For simple strategies, just write a loop. Fewer abstractions, fewer bugs.

For most retail algo work: vectorbt is the modern default. backtrader if you need event-driven complexity.

## Vectorized vs event-driven

**Vectorized.** Compute signals as columns over the entire price series, then aggregate. Fast, simple.

**Event-driven.** Step through time, bar by bar; portfolio state updates each bar. Slower, but supports path-dependent logic (positions affected by past fills, stops that move based on price action, etc.).

For most simple signals (MA crossover, RSI), vectorized is fine. For complex strategies with state, event-driven is required.

## A simple custom backtest

For learning, write one yourself:

```python
import pandas as pd

def backtest(df, initial_cash=10000, commission=0.0005):
    cash = initial_cash
    position = 0  # shares held
    equity = []
    trades = []
    
    for i, row in df.iterrows():
        signal = row['signal']  # -1, 0, +1
        price = row['close']
        
        # On signal change, trade
        if signal == 1 and position == 0:
            shares = int(cash / price * (1 - commission))
            cost = shares * price * (1 + commission)
            cash -= cost
            position = shares
            trades.append({'time': i, 'type': 'BUY', 'price': price, 'shares': shares})
        
        elif signal == -1 and position > 0:
            proceeds = position * price * (1 - commission)
            cash += proceeds
            trades.append({'time': i, 'type': 'SELL', 'price': price, 'shares': position})
            position = 0
        
        equity.append(cash + position * price)
    
    df['equity'] = equity
    return df, pd.DataFrame(trades)
```

This is simplified — no realistic fills, no spread, no slippage. But the structure is right: signal → conditional trade → track equity.

For real strategies, use a library. For learning, build it once.

## Key metrics

Standard performance summary:

```python
total_return = (final_equity / initial_equity) - 1
cagr = (1 + total_return) ** (1 / years) - 1
sharpe = mean(daily_returns) / std(daily_returns) * sqrt(252)
sortino = mean(daily_returns) / std(negative_returns) * sqrt(252)
max_drawdown = (rolling_max - equity).max() / rolling_max.max()
win_rate = sum(trade.pnl > 0) / len(trades)
profit_factor = sum(winners.pnl) / abs(sum(losers.pnl))
```

What to look at:

- **CAGR.** Annualized return. > 10% interesting; > 20% suspicious.
- **Sharpe.** Risk-adjusted. > 1 good; > 2 very good; > 3 likely overfit.
- **Max drawdown.** Worst peak-to-trough. 20%+ is normal for most strategies; > 40% is rough live.
- **Profit factor.** Total wins / total losses. > 1.5 decent; > 2 strong.
- **Win rate.** Trend = low (35-45%); mean reversion = high (55-70%). Judge per family.

No single metric tells the story. Sharpe alone can mislead (high-Sharpe strategies often blow up rarely); drawdown alone misses smooth-but-flat. Always look at the equity curve.

## The equity curve

Plot it. A good strategy's equity curve:

- Steady upward slope.
- Drawdowns are short relative to gains.
- No "cliffs" (sudden 30% drops).
- Recovery from drawdowns happens.

Red flags:

- Cliff at the end. Strategy worked then stopped — regime shift?
- Cluster of all returns in one year. Backtest summary masks that the rest was flat.
- Massive drawdown not in summary. Sharpe and CAGR good but a single 50% drawdown — that's a real live experience.

Always plot the curve. Numbers without visuals lie.

## Reproducibility

Track:

- The exact data used (with timestamps).
- The exact strategy version (git hash).
- Hyperparameters.
- Random seeds if applicable.

A backtest result is meaningless if you can't re-run it. Save full output (equity curve, trades, params) to disk and version-control the strategy code.

## Speed considerations

For research, fast backtests = more iterations:

- vectorbt is fast (NumPy under the hood).
- Caching loaded data avoids repeated downloads.
- Avoid pandas `iterrows()` for large datasets.
- Profile slow code; usually one or two functions dominate.

For a strategy you run nightly on 500 symbols: minutes of backtest time is fine. For research with thousands of strategy variants: you need vectorization.

## Mistakes to avoid

- **No commission/slippage modeling.** Inflates results dramatically.
- **Same data for build and test.** Overfit.
- **Selection bias.** Cherry-picked the years that worked.
- **Re-running until it works.** "Just tweak the params until backtest looks good" = overfitting.
- **Trusting cumulative chart over distribution.** Visualize PnL distribution, not just equity.

## Summary

- Backtest = simulate strategy on historical data with realistic execution.
- Modern Python: vectorbt for vectorized speed; backtrader for event-driven; custom for learning.
- Track Sharpe, max DD, profit factor, win rate, plus equity curve plot.
- Reproducibility matters — version data + code.
- Don't trust numbers alone; visualize.

Next: the bias traps that ruin backtests.
