---
module: 2
position: 2
title: "Interactive Brokers: the pro option"
objective: "When you outgrow Alpaca and want better execution."
estimated_minutes: 7
---

# Interactive Brokers: the pro option

## Why IBKR

Interactive Brokers (IBKR) is what pros use. Strengths over retail brokers:

- **Largest universe.** US/global equities, futures, options, FX, bonds, mutual funds. ~150 markets in 33 countries.
- **No PFOF on IBKR Pro.** Direct exchange routing; better execution quality.
- **SmartRouting.** Algorithmically picks the best venue per order.
- **Margin rates competitive.** Significantly lower than Robinhood/Schwab.
- **Pro tools.** TWS desktop, IBKR Mobile, API.

Trade-offs:
- **Commissions.** Not free (though small — $0.005/share, $1 min for stocks).
- **Onboarding friction.** Identity verification, funding minimums.
- **API is older.** TWS API (formerly known as the IB API) is mature but not as modern as Alpaca's.

For serious algos, the execution quality + universe makes IBKR worth the friction.

## Account types

- **IBKR Pro.** Direct routing, commissions per trade, sophisticated. Required for API.
- **IBKR Lite.** PFOF model, free commissions, retail-grade. Doesn't support full API.

For algo trading, you want Pro.

## TWS or IB Gateway

To use the API, you need one of two desktop apps running on your machine (or a server):

- **TWS (Trader Workstation).** Full desktop app, big GUI.
- **IB Gateway.** Lightweight, no GUI — preferred for bots.

Both speak the same API protocol. IB Gateway uses fewer resources, less to crash, easier to run on a headless VPS.

Run pattern: Gateway runs on a VPS, your bot connects to it via TCP on localhost:7497 (paper) or 7496 (live).

## Authentication

Two-step:
1. Log into Gateway with your IBKR credentials.
2. Gateway exposes the API on localhost; your bot connects to that port.

For 24/7 bots, this is the awkward part — Gateway requires daily re-login (security feature). Solutions:

- **IBController / ib-gateway-docker.** Auto-login scripts; well-maintained projects.
- **Live trading sessions reset daily.** Plan for 5 min of downtime around the daily reset.

## Python SDKs

Two main options:

**ib_insync (legacy but popular):**

```python
from ib_insync import IB, Stock, MarketOrder

ib = IB()
ib.connect('127.0.0.1', 7497, clientId=1)  # paper port

aapl = Stock('AAPL', 'SMART', 'USD')
ib.qualifyContracts(aapl)

order = MarketOrder('BUY', 10)
trade = ib.placeOrder(aapl, order)

# Wait for fill
while not trade.isDone():
    ib.waitOnUpdate()

print(trade.orderStatus.status, trade.orderStatus.avgFillPrice)
```

`ib_insync` is async, pythonic. The author retired the project but the community maintains it.

**ibapi (official SDK):**

```python
from ibapi.client import EClient
from ibapi.wrapper import EWrapper

class TradingApp(EWrapper, EClient):
    def __init__(self):
        EClient.__init__(self, self)
    
    def nextValidId(self, orderId):
        self.next_order_id = orderId
        ...
    
    def orderStatus(self, orderId, status, filled, remaining, ...):
        print(f'order {orderId}: {status}')

app = TradingApp()
app.connect('127.0.0.1', 7497, 0)
app.run()
```

Verbose, callback-based. The official Python SDK from IBKR. More control, more boilerplate.

Most new IBKR bots use `ib_insync` for ergonomics.

## Placing orders

```python
from ib_insync import IB, Stock, LimitOrder, StopOrder

ib = IB()
ib.connect('127.0.0.1', 7497, clientId=1)

aapl = Stock('AAPL', 'SMART', 'USD')
ib.qualifyContracts(aapl)

# Limit buy
limit = LimitOrder('BUY', 10, lmtPrice=187.42)
trade = ib.placeOrder(aapl, limit)

# Stop loss
stop = StopOrder('SELL', 10, stopPrice=180.00)
ib.placeOrder(aapl, stop)
```

Order types: Market, Limit, Stop, StopLimit, TrailingStop, MarketIfTouched, LimitIfTouched, Bracket, OCA (one-cancels-all).

Tons of advanced types — Adaptive (price improvement), VWAP, TWAP, MidPrice, ScaleOrder.

## Futures

Different contract class:

```python
from ib_insync import Future

es = Future('ES', '202506', 'CME')  # June 2025 E-mini S&P
ib.qualifyContracts(es)
order = LimitOrder('BUY', 1, lmtPrice=5800.00)
ib.placeOrder(es, order)
```

Continuous contracts (auto-roll on expiry) supported via the `localSymbol` form. Futures have margin requirements — buying power calculated differently than for stocks.

## Options

```python
from ib_insync import Option

call = Option('AAPL', '20250620', 200, 'C', 'SMART')
ib.qualifyContracts(call)
order = LimitOrder('BUY', 1, lmtPrice=4.50)
ib.placeOrder(call, order)
```

Multi-leg options (spreads, condors, iron flies) use `Bag` contracts — combine legs into one routed order.

## Market data

IBKR's market data is rich but billing is complex:

- **Real-time level 1 (top of book).** Subscription required per exchange. ~$3-10/month per exchange.
- **Streaming bars.** Aggregated from level 1.
- **Historical bars.** Free up to a daily limit; rate-limited.
- **Tick-by-tick.** Requires paid subscription.

For most US equities, the basic subscription is fine. For exotic data (options chains, futures order book), more subscriptions add up.

```python
ticker = ib.reqMktData(aapl)
ib.sleep(2)
print(ticker.bid, ticker.ask, ticker.last)
```

For historical:

```python
from datetime import datetime
bars = ib.reqHistoricalData(
    aapl,
    endDateTime='',
    durationStr='5 D',
    barSizeSetting='5 mins',
    whatToShow='TRADES',
    useRTH=True,
)
df = ib_insync.util.df(bars)
```

## Connection lifecycle

The gateway connection is stateful and sensitive:

- Lost connection? Reconnect. Don't blindly resubmit orders — IBKR may still have them.
- Daily reset? Bot should pause, wait, reconnect.
- Order IDs are server-assigned and per-session. Track them in your own DB if needed.

Resilient bots have a reconnect loop with backoff:

```python
def connect_with_retry(ib):
    for attempt in range(10):
        try:
            ib.connect('127.0.0.1', 7497, clientId=1, timeout=30)
            return
        except Exception as e:
            print(f'attempt {attempt}: {e}')
            time.sleep(min(60, 2 ** attempt))
    raise Exception('connection failed')
```

## When to switch from Alpaca to IBKR

- You need futures, options, or non-US instruments.
- You're trading large enough size that execution quality matters.
- You're scaling beyond the few-thousand-symbols Alpaca covers.
- You want to short-sell with proper borrow markets.
- Your strategy benefits from advanced order types (TWAP, MidPrice, etc.).

Otherwise, Alpaca's simplicity beats IBKR's power.

## Mistakes to avoid

- **Single clientId across multiple bots.** Each bot needs a unique clientId — collisions cause weird behavior.
- **Assuming Gateway is always up.** Daily logout — bot must handle.
- **Polling for fills.** Subscribe to `orderStatus` callback.
- **Trading without specifying exchange.** `SMART` works for US equities; you must specify for futures/options.
- **Live-money clientId pointing at Gateway port for paper.** Wrong port = wrong account.

## Summary

- IBKR Pro is the pro broker: bigger universe, better execution, direct routing.
- TWS or IB Gateway runs locally; your bot connects to its API port.
- `ib_insync` (pythonic) or `ibapi` (official) for Python.
- Universe: stocks, futures, options, FX, bonds across global markets.
- Connection lifecycle is stateful — handle daily resets and reconnects.
- Switch from Alpaca when you outgrow its scope.

Next: market data — bars, ticks, streams.
