---
module: 1
position: 3
title: "Liquidity, slippage, and spreads"
objective: "Quantify what trading actually costs."
estimated_minutes: 7
---

# Liquidity, slippage, and spreads

## The three costs of every trade

Every trade pays:

- **Spread.** The bid/ask gap you cross on entry and exit.
- **Slippage.** The difference between your expected price and your filled price.
- **Commissions and fees.** Broker + exchange + regulatory.

Plus, sometimes:

- **Borrow.** For short positions, the rate to borrow the share.
- **Funding.** For perpetual crypto futures.

A backtest that doesn't model these will dramatically overstate returns. Live trading reality-checks every assumption.

## Spread cost

Easy to model. For every round trip (buy → sell), you cross the spread once on entry, once on exit:

```
Round-trip spread cost = 2 × (ask − bid) / 2  =  (ask − bid)
```

For AAPL at a $0.01 spread, every round-trip costs $0.01/share. On 100 shares = $1.

For a $1 stock with a $0.02 spread, every round-trip costs $0.02 → 2% of the share price.

The relative cost is what matters. A $0.02 spread on a $1 stock is 200× more expensive proportionally than on a $200 stock.

## Slippage

When your order size is larger than the displayed liquidity, you "walk the book" — fill at progressively worse prices.

Order: BUY 1000 AAPL market.
Book:
```
Asks:
  $187.45 × 300
  $187.44 × 500
  $187.43 × 100 ← inside
```

Your fill:
- 100 @ $187.43
- 500 @ $187.44
- 300 @ $187.45  → but you only need 400, so 400 @ $187.45

Average fill: (100 × $187.43 + 500 × $187.44 + 400 × $187.45) / 1000 = $187.443

The expected price (inside ask) was $187.43; you actually paid $187.443 — 1.3 cents of slippage. For 1000 shares = $13.

For a liquid stock with deep books, this is small. For thin stocks, it can be enormous.

## Modeling slippage in backtests

A reasonable conservative model:

```python
def fill_price(side, size, book_ask, book_bid, daily_volume):
    # Spread cost
    spread = book_ask - book_bid
    base = book_ask if side == 'BUY' else book_bid
    
    # Slippage scales with size as fraction of daily volume
    size_pct = size / daily_volume
    slippage_pct = 0.0005 + size_pct * 0.5  # 5 bps base + 50 bps per 1% of DV
    slippage = base * slippage_pct
    
    return base + slippage if side == 'BUY' else base - slippage
```

This is rough — production trading firms have sophisticated models. For retail backtests, the goal is to be *too conservative*, not realistic. If a strategy survives an aggressive slippage model, it has a chance live.

## Volume-weighted average price (VWAP)

VWAP = the average price of the day weighted by volume:

```
VWAP = Σ(price × volume) / Σ(volume)
```

Used as a benchmark for execution quality. Trading "at VWAP or better" means you didn't slip significantly against the day's typical price.

Many algos split a large order across the day to track VWAP — small slices, no single trade spikes the price. Retail bots usually don't need this complexity unless trading large size.

## Time-weighted average price (TWAP)

Simpler than VWAP — just split size evenly over time:

```
4-hour TWAP of 1000 shares = 250 shares each hour
```

Used when you want to avoid market impact and don't want to react to volume profile. Mechanical and simple.

For a bot that needs to execute a big position without telegraphing intent, TWAP is fine and easy to implement.

## Commissions

US stocks at most retail brokers: $0 commission.
US options: $0.65/contract typical.
Futures: $1-5/contract.
Crypto on Coinbase Advanced: 0.0% to 0.6% depending on volume tier.
Crypto on Alpaca: 0.0% (currently — check status).

Don't assume $0 forever. Some brokers charge per-share over a threshold. Some charge for "non-marketable" orders. Read the fee schedule.

## Regulatory fees

In US equities, every sell pays SEC fee and FINRA TAF:

- SEC fee: $0.0000295 × dollar value (as of 2026; check current).
- FINRA TAF: $0.000166/share, max $8.30.

For most trades, pennies. For 10,000 shares of a $200 stock — meaningful ($59 SEC fee + $1.66 TAF = $60+).

## Borrow costs for shorts

To short, you must borrow the share from someone holding it. Borrow has a rate:

- Common, liquid stocks: 0.1%-1% annual.
- Hot shorts (high demand): 5%-20%+ annual.
- "Hard to borrow" (HTB): may not be available at all.

For a position held 10 days at 5% borrow:
```
Cost = position_value × 5% × (10 / 365) = 0.137% of position
```

Short strategies must factor this in. Long-bias strategies ignore it.

## Funding for perpetual futures

In crypto perpetuals (Binance, Bybit, etc.), funding is a periodic payment between longs and shorts to keep perpetual prices close to spot:

- Funding paid every 8 hours typically.
- Rate can be ±0.01%-0.1% per period (sometimes wilder).
- Positive funding: longs pay shorts. Negative: shorts pay longs.

For a leveraged crypto bot, funding can be a major P&L line. Backtests must include it.

## Total cost example

Round-trip a $20,000 position on AAPL:

```
Spread:        $0.01 × 100 shares × 2 sides = $1.00 (well, $0.50 each side)
Slippage:      ~$0.005 × 100 × 2 = $1.00
Commission:    $0.00
Regulatory:    ~$0.60 (sell-side SEC fee + TAF)
─────────────────────────────────────────────
Total:         ~$2.60 (0.013% of position)
```

For a $20K position aiming for 1% profit ($200), $2.60 cost is fine. For a strategy aiming for 0.05% per trade ($10), cost would eat 26% of the gross — borderline uneconomic.

The smaller the per-trade edge, the more execution costs matter.

## Liquidity considerations

How to identify trade-able instruments:

- **Average daily volume.** Higher = more capacity. Rule of thumb: don't be more than 1% of ADV unless you have a real execution algo.
- **Spread.** Tight = cheap entry/exit. Skip names with > 0.1% spread for short-hold strategies.
- **Listed exchange.** Major listings (NYSE, Nasdaq) → better quality. OTC → wider spreads, less depth.
- **Time of day.** First 30 min and last 30 min often most liquid (and most volatile). Midday can be thin on some names.

Bots should filter the universe by liquidity before considering signals.

## Mistakes to avoid

- **Backtest ignoring spread.** Most common error; inflates returns.
- **Backtest using last-trade.** Same problem — you'd actually trade at bid or ask.
- **Trading thin names with size.** No amount of edge survives walking the book.
- **Ignoring borrow on shorts.** Hot shorts can cost 20%+/yr.
- **Ignoring funding on perp futures.** Sneaky cost that compounds.

## Summary

- Every trade pays: spread + slippage + commissions + fees (+ borrow/funding).
- Spread is the easy-to-model entry cost; slippage is harder.
- VWAP/TWAP split large orders to reduce market impact.
- Conservative slippage models in backtests separate real edges from artifacts.
- Liquidity filters belong upstream of signal generation.

Next: the actual structure of markets, exchanges, and venues.
