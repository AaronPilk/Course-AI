---
module: 1
position: 1
title: "Order books and how prices form"
objective: "Understand the structure that drives every quote you see."
estimated_minutes: 7
---

# Order books and how prices form

## What a market actually is

The price you see on a chart isn't a number set by anyone — it's the last trade that printed. Every traded asset (stock, futures contract, crypto pair) has an order book: a real-time list of every standing buy order and sell order.

Prices form when buyers and sellers agree. A trade happens when an incoming order can be matched against an existing one. The "price" of the asset is just whichever match printed last.

For a bot to make smart decisions, you need to see the order book — not just the chart.

## Bids, asks, and the spread

The order book splits into two sides:

- **Bids.** Buy orders waiting to execute. Sorted highest price first.
- **Asks (offers).** Sell orders waiting to execute. Sorted lowest price first.

The highest bid is the "best bid"; the lowest ask is the "best ask". The gap between them is the **spread**.

Example for AAPL:

```
Asks:
  $187.45 × 200
  $187.44 × 500
  $187.43 × 100   ← best ask
─────────────────
  Spread = $0.01
─────────────────
  $187.42 × 300   ← best bid
  $187.41 × 800
  $187.40 × 1500
Bids:
```

The displayed "price" is usually the midpoint or the last trade. The actual price you'd pay to buy now is the ask ($187.43); the actual price you'd get selling now is the bid ($187.42).

## How a trade happens

Two scenarios:

**Marketable order (crossing the spread).** Someone enters a market order or a limit order at or beyond the opposite side. It matches against existing standing orders and prints a trade.

Buy 50 shares of AAPL market → executes at $187.43 (best ask). That ask volume drops from 100 to 50.

**Resting order (joining the book).** Someone enters a limit order that doesn't cross the spread. It sits on the book, waiting.

Buy 50 shares of AAPL limit at $187.42 → joins the bid stack at $187.42, behind the existing 300.

## Depth and liquidity

The order book has depth — how much volume is sitting at each price level. A liquid market has tight spreads and large size at the inside (best bid/ask).

For AAPL on a normal trading day: thousands of shares at the inside, spread of $0.01. For a thinly traded small-cap stock: maybe 100 shares at the inside, spread of $0.10+. For an illiquid bond or crypto pair: even worse.

Your bot's behavior must change based on liquidity. A strategy that works on AAPL may be uneconomic on a stock that trades 10,000 shares a day.

## Price levels

Order books cluster around round numbers (whole dollars, half dollars, "round" cents like .25/.50/.75 for some products). These levels often act as support or resistance — large orders sit there because traders mentally anchor to them.

You can sometimes spot these in your data:

```
Bids:
  $99.75 × 5,000   ← cluster
  $99.50 × 8,500   ← cluster
  $99.25 × 2,300
  $99.00 × 15,000  ← big cluster, round number
```

Strategies that buy near support or sell at resistance lean on this clustering.

## Top of book vs full book

Most retail APIs give you **top of book** (best bid, best ask, last trade). That's enough for many bots.

Some give **L2 (level 2)** data — multiple levels deep on each side. Useful for spotting imbalances ("90% of size on the bid → likely upward pressure").

Full order book ("L3" or full depth) is rarer at retail — exchanges typically charge for it. For most strategies you don't need it.

## Order book imbalance

A simple signal: if bid size >> ask size, more buyers are waiting than sellers. Often a short-term price-up signal.

```python
imbalance = (bid_size - ask_size) / (bid_size + ask_size)
# +1.0 = all bids; -1.0 = all asks; 0 = balanced
```

This is one of the simpler microstructure signals. It works on short timeframes (seconds to minutes) and decays fast.

## Time and sales (the tape)

Separate from the order book: the stream of trades as they print, with timestamp, price, and volume. Reading the tape is an old skill — feeling whether trades are aggressive buying (hitting the ask) or aggressive selling (hitting the bid).

```
14:32:15.234  AAPL  $187.43  × 200  (BUY, hit ask)
14:32:15.456  AAPL  $187.42  × 500  (SELL, hit bid)
14:32:15.789  AAPL  $187.43  × 100  (BUY, hit ask)
```

Aggressive-buy ratio over a window is another microstructure signal.

## Market makers and HFT

Behind a lot of the order book activity: market makers — firms that continuously post bids and asks, hoping to profit from the spread. They cancel and re-post thousands of orders per second.

This is why the book is so dynamic. A naive retail order might see "5000 shares at $187.43" and have it vanish before the order arrives — the market maker pulled the quote.

You don't need to compete with HFT; you need to understand that the book is alive.

## What your bot sees vs reality

When a bot receives a quote update via API, there's latency between the actual exchange and the bot. Best case: 50ms. Common case: 200-500ms. The book may have moved before your order reaches the venue.

This is why "I saw a great price and tried to buy" can fail — by the time your order arrived, the price was gone. Strategies must be resilient to this.

## Mistakes to avoid

- **Trading off chart price.** Charts show last trade. You buy at ask, sell at bid. Always cost yourself the spread.
- **Ignoring depth.** A "great signal" on a stock with $50 of depth is unsalvageable — you can't size into it.
- **Assuming quotes don't move.** They do, constantly, faster than you.
- **Backtesting against last-trade data.** You can't actually trade at the last trade — you trade at bid or ask.

## Summary

- Order books are stacks of standing buy and sell orders.
- Spread = best ask − best bid; you pay the spread on every round-trip.
- Depth (volume at each level) determines what size you can trade.
- Top of book is usually enough; L2 helps for imbalance signals.
- The book is alive — market makers cancel and reprice constantly.
- Your bot sees a delayed view of the book; design accordingly.

Next: the order types you actually have to choose between.
