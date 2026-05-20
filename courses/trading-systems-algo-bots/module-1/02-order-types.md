---
module: 1
position: 2
title: "Order types: market, limit, stop, IOC"
objective: "Choose the right tool for what you're trying to accomplish."
estimated_minutes: 7
---

# Order types: market, limit, stop, IOC

## Why order type matters

Two traders can have the exact same strategy and end up with different PnL purely because of how they submitted orders. Order type controls the trade-off between certainty of execution and price you pay.

For a bot, picking the wrong default destroys an otherwise-good strategy.

## Market orders

A market order says: "buy/sell now, at whatever price is available."

```python
api.submit_order(symbol='AAPL', qty=10, side='buy', type='market', time_in_force='day')
```

- **Pros.** Guaranteed to execute (assuming any liquidity exists). Instant.
- **Cons.** You take the ask (or hit the bid). Pay the full spread. For thin instruments, may walk up the book — buy 1000 shares of a thin stock with 100 at the inside, and you'll fill at progressively worse prices for the remaining 900.

**When to use:** liquid instruments where the spread is tiny relative to your edge, when execution certainty matters (e.g., closing a position fast).

**When not to use:** thin instruments, very large size, anything where slippage matters.

## Limit orders

A limit order says: "buy at $X or better; sell at $Y or better." If the market doesn't reach your price, you don't trade.

```python
api.submit_order(symbol='AAPL', qty=10, side='buy', type='limit', limit_price=187.42, time_in_force='day')
```

- **Pros.** You control the price. If filled, you got at least your price.
- **Cons.** May not fill at all. Even if the price hits your limit, your order may be queued behind others.

**Variants:**
- **Marketable limit.** Limit at the current ask (for buys) — likely to fill immediately, but caps the slippage.
- **Resting limit.** Limit below the market (for buys) — joins the book, fills when price comes to you.

Most algorithmic traders use limits as the default. Market orders are a last resort.

## Stop orders

A stop order activates when price reaches a trigger. Two flavors:

**Stop-market.** Once triggered, becomes a market order.

```python
api.submit_order(symbol='AAPL', qty=10, side='sell', type='stop', stop_price=180.00)
# If AAPL trades at or below $180, this becomes a market sell.
```

Used for stop-losses ("get me out if it drops"). Risk: in a gap or fast move, the market price after trigger can be far worse than the stop price.

**Stop-limit.** Once triggered, becomes a limit order.

```python
api.submit_order(symbol='AAPL', qty=10, side='sell', type='stop_limit', stop_price=180.00, limit_price=179.50)
# Triggers at $180; tries to sell at $179.50 or better.
```

Caps the slippage. Risk: in a fast drop, price may blow past the limit and never come back — your stop doesn't execute, and you sit through a much bigger loss.

Most professional risk management uses stop-market for shop and stop-limit for fast-moving instruments where you can tolerate not-getting-out.

## Trailing stops

A stop that follows price up:

```python
api.submit_order(symbol='AAPL', qty=10, side='sell', type='trailing_stop', trail_percent=2.0)
# Stop sits 2% below the highest price seen since order entry.
```

As price rises, the stop rises. If price falls, the stop stays — and triggers if the drop is bigger than the trail.

Useful for letting winners run while protecting open profit. Not always supported on all brokers; check the API.

## Time in force

Every order has a TIF — how long it's valid:

- **DAY.** Valid until end of trading day; cancelled at close.
- **GTC (good-til-cancelled).** Valid until you cancel. Some brokers cap at 60-90 days.
- **IOC (immediate-or-cancel).** Fill what you can right now; cancel the rest.
- **FOK (fill-or-kill).** Fill the entire size right now, or cancel completely.
- **OPG (opening).** Only at the market open.
- **CLS (closing).** Only at the close auction.

For bots: most orders are DAY. Use IOC when you want a "try once, don't sit" semantic — common for high-frequency strategies that don't want stale orders.

## Bracket orders

A combo: entry order + profit target (limit) + stop loss. The broker manages it as one unit.

```python
api.submit_order(
    symbol='AAPL', qty=10, side='buy', type='market',
    order_class='bracket',
    take_profit={'limit_price': 195.00},
    stop_loss={'stop_price': 180.00}
)
```

When the entry fills, both legs become active. When either fills, the other cancels (OCO — one cancels other).

Useful for swing trades — set the bracket on entry, let the broker manage exits. Reduces bot complexity (no need to chase exits in code).

## Hidden orders, iceberg orders

Pro-grade orders that hide most of their size:

- **Hidden.** Doesn't display in the book at all; only fills if someone comes to your price.
- **Iceberg.** Displays a small "tip"; the rest is hidden and refills as the tip executes.

Limited retail support. Used by institutions executing large size without telegraphing intent.

## What to use when

| Goal | Order type |
|------|-----------|
| Execute now at any cost | Market |
| Execute soon at a controlled price | Marketable limit |
| Patient entry, may not fill | Resting limit |
| Stop loss, take whatever | Stop-market |
| Stop loss, cap downside | Stop-limit |
| Let winners run | Trailing stop |
| Set-and-forget swing trade | Bracket |
| Try once, don't linger | IOC |

For algo bots, most orders are limit (resting or marketable) + a stop-loss leg.

## Order rejection reasons

Brokers reject orders for many reasons:

- Insufficient buying power.
- Bad limit price (e.g., sell limit below current bid).
- Pattern-day-trader rules (cash accounts, 4 round-trips per 5 days).
- Halted instrument (news halts, circuit breakers).
- Outside trading hours (if TIF doesn't allow extended).
- Price tick increment violations (must be in $0.01 for most stocks; $0.0001 for sub-$1).

Robust bots handle every documented error and log them.

## Mistakes to avoid

- **Market orders on thin instruments.** Massive slippage.
- **Stop-limit with too-tight limit.** Triggers but doesn't fill; gap risk eats you.
- **No stop loss.** Every position must have a defined max loss.
- **GTC orders forgotten.** Reset after each session if rules might have changed.
- **No order rejection handling.** Bot doesn't know it isn't really in.

## Summary

- Market = certainty, expensive. Limit = control, may miss.
- Stops protect — stop-market for liquid, stop-limit for fast-moving.
- Trailing stops let winners run with protection.
- TIF controls order lifetime. DAY for most; IOC for "try once".
- Bracket orders simplify exit logic at the broker level.
- Always handle rejection paths in code.

Next: liquidity, slippage, and what they actually cost.
