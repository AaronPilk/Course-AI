---
module: 4
position: 3
title: "Modeling costs, slippage, and capacity"
objective: "Build a realistic execution model into your backtest."
estimated_minutes: 6
---

# Modeling costs, slippage, and capacity

## Why backtest costs almost always understate reality

Default backtest fills assume:

- You filled at the historical close (or open).
- Zero slippage.
- Zero commission.
- Unlimited liquidity.

None of these are true. A strategy that wins by $0.05/share in a free, frictionless backtest may lose by $0.02/share when commissions, spreads, slippage, and impact are included.

The job: model the costs accurately enough that surviving strategies have real edges.

## The components to model

For each trade:

```
realized_cost = spread/2 + slippage + commission + regulatory_fee + (borrow_or_funding if applicable)
```

Each component:

**Spread.** Half the bid/ask spread (you cross it on entry; the other half on exit).

**Slippage.** Depends on your size relative to typical depth. For most retail strategies on liquid names, model as a fixed bps amount plus a size-dependent term.

**Commission.** Broker-specific. $0 on retail US equities; $1/contract on futures; bps on crypto.

**Regulatory fee.** Sells only on US equities (SEC fee + FINRA TAF).

**Borrow / funding.** For shorts (equities) or perpetual futures positions held overnight.

## Vectorbt cost modeling

```python
import vectorbt as vbt

pf = vbt.Portfolio.from_signals(
    price,
    entries,
    exits,
    init_cash=10000,
    fees=0.0005,     # 5 bps round-trip
    slippage=0.0005, # 5 bps slippage
)
```

Built-in. Fees and slippage are simple but cover most cases.

For more sophisticated modeling — size-dependent slippage, borrow costs — you write a custom `Portfolio.from_orders` flow with explicit fees per order.

## A conservative slippage model

For US equities at retail scale:

```python
def slippage_bps(symbol, size, volume_today, spread, price):
    # Base spread cost
    spread_cost = spread / price * 10000 / 2  # half-spread in bps
    
    # Size-dependent: 1bp per 1% of daily volume
    size_pct = size / volume_today
    size_cost = size_pct * 100
    
    # Volatility-dependent: tighter spreads in chop, wider in panic
    # (skip for simple model)
    
    total_bps = spread_cost + size_cost + 5  # +5 bps minimum slippage cushion
    return total_bps
```

For a $200 stock at $0.01 spread with 1% of daily volume:

```
spread_cost ≈ 0.5 bps + size_cost = 100 bps + cushion 5 bps = 105.5 bps
```

If you're trading 1% of daily volume on every trade, you're paying ~1% in slippage per round trip. Almost certainly uneconomic.

The model exposes the real cost of large size. Adjust size or strategy if needed.

## Modeling commissions

Per-trade fixed:

```python
def commission(qty, price, broker='alpaca'):
    if broker == 'alpaca':
        return 0.0
    elif broker == 'ibkr':
        # $0.005/share, min $1, max 0.5% of trade value
        return min(max(qty * 0.005, 1.0), qty * price * 0.005)
    elif broker == 'tradovate_futures':
        return qty * 1.99  # ~$2/contract round trip
```

For options:

```python
def options_commission(contracts, broker='ibkr'):
    return contracts * 0.65  # standard IBKR options
```

## Regulatory fees (US sells only)

```python
def regulatory_fee(side, qty, price):
    if side != 'SELL':
        return 0.0
    
    notional = qty * price
    sec_fee = notional * 0.0000295   # check current rate
    finra_taf = min(qty * 0.000166, 8.30)
    
    return sec_fee + finra_taf
```

Small but real. For 10,000-share trades on high-price stocks, adds up.

## Borrow cost for shorts

```python
def short_borrow_cost(symbol, position_value, days_held, annual_rate=0.01):
    return position_value * annual_rate * (days_held / 365)
```

Hard-to-borrow names can be 5-20% annual rate. Crypto perps have funding instead (per 8h):

```python
def perp_funding(position_value, funding_rate, hours_held):
    periods = hours_held / 8
    return position_value * funding_rate * periods  # can be ± depending on rate
```

## Capacity — how much can you trade?

A backtest at $100,000 may work. The same strategy at $10 million may not — your size moves the market.

**Capacity test:** scale up the simulated trade size and observe degradation.

```python
for cash in [10_000, 100_000, 1_000_000, 10_000_000]:
    pf = vbt.Portfolio.from_signals(price, entries, exits, init_cash=cash, slippage=size_dependent)
    print(f'${cash}: Sharpe = {pf.sharpe_ratio()}, CAGR = {pf.annual_return()}')
```

For a real strategy, expect Sharpe to degrade as cash grows. The "capacity" is the level at which Sharpe drops below your minimum acceptable.

For most retail (< $1M), capacity isn't binding on liquid names. For multi-million dollar accounts, capacity becomes a real constraint and you must trade fewer, more-liquid names.

## Market impact for large size

For sizes > 1% of daily volume:

```python
def market_impact(size_pct):
    # Empirical: ~10 bps per 1% of daily volume (very rough)
    return size_pct * 1000  # bps
```

Real estate of academic research on this — Almgren et al., Kyle's lambda, etc. For retail, the heuristic "10 bps per 1% of ADV" is conservative enough.

## Combined cost in backtest

```python
def realized_pnl(entry_price, exit_price, qty, symbol, days_held):
    gross = (exit_price - entry_price) * qty
    
    entry_cost = (
        slippage_bps(symbol, qty, get_volume(symbol)) * entry_price / 10000 * qty
        + commission(qty, entry_price)
    )
    exit_cost = (
        slippage_bps(symbol, qty, get_volume(symbol)) * exit_price / 10000 * qty
        + commission(qty, exit_price)
        + regulatory_fee('SELL', qty, exit_price)
    )
    
    net = gross - entry_cost - exit_cost
    return net
```

Per-trade net PnL with full cost model. Compute this for every backtest trade; aggregate to portfolio.

## Calibration with live data

After paper-trading for a month, compare your model predictions to actual fills:

```python
for trade in live_trades:
    modeled_cost = compute_cost(trade.symbol, trade.qty, trade.intended_price)
    actual_cost = abs(trade.fill_price - trade.intended_price) * trade.qty
    print(f'{trade.symbol}: modeled ${modeled_cost:.2f}, actual ${actual_cost:.2f}')
```

If your model consistently underestimates, increase the slippage cushion. If it overestimates, you've been overly conservative — slight increase in size may be safe.

Continuous calibration keeps the backtest honest as conditions change.

## Mistakes to avoid

- **No costs at all.** The most common error.
- **Flat slippage on all sizes.** Misses the size-dependent component.
- **No commission for non-zero-commission brokers.** Underestimates IBKR, futures, options costs.
- **Ignoring borrow.** Short-strategy backtests look great until borrow eats them.
- **No capacity test.** Strategy works in research, dies at production scale.

## Summary

- Cost = spread + slippage + commission + regulatory + borrow/funding.
- Conservative slippage model: half-spread + size-dependent term + cushion.
- Run capacity tests at multiple sizes; identify where Sharpe degrades.
- Calibrate against live fills monthly.
- Without good cost modeling, backtests systematically over-promise.

Next: walking from backtest to walk-forward to paper.
