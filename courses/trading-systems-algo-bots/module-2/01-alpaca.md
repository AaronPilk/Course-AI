---
module: 2
position: 1
title: "Alpaca: the easy start"
objective: "Wire up your first broker API for paper and live trading."
estimated_minutes: 7
---

# Alpaca: the easy start

## Why Alpaca

Alpaca is purpose-built for algorithmic traders:

- **Free paper trading** — full API, fake money. No application; sign up and start.
- **Free live trading** — $0 commission on US equities and crypto.
- **Clean REST + WebSocket API.** Modern, documented, JSON.
- **SDKs in Python, JavaScript, Go, and more.**
- **No PFOF concerns** — Alpaca routes through their own market access, though execution quality is still consumer-grade.

It's the de facto "hello world" of algorithmic trading. Most courses start here.

Trade-offs vs IBKR:
- Smaller universe (US equities + crypto only; no futures, no options as of broad rollout, no FX).
- Execution quality acceptable but not pro-tier.
- API outages happen — production-grade pros usually diversify away from a single broker.

For learning and most retail-scale bots, Alpaca is the right choice.

## Account setup

1. Sign up at alpaca.markets.
2. Confirm email.
3. Generate API keys: Dashboard → Paper Account → API Keys.
4. You have two key pairs:
   - **Paper keys** — sandbox, fake money.
   - **Live keys** — real money, requires identity verification.

For live, you also need to fund the account (ACH from a US bank). Skip live until your bot has paper-traded successfully for at least a month.

## Python SDK

Install:

```bash
pip install alpaca-py
```

Connect to paper:

```python
from alpaca.trading.client import TradingClient

trading_client = TradingClient(
    api_key='YOUR_PAPER_KEY',
    secret_key='YOUR_PAPER_SECRET',
    paper=True,
)

account = trading_client.get_account()
print(f"Equity: ${account.equity}")
print(f"Cash: ${account.cash}")
print(f"Buying power: ${account.buying_power}")
```

That's it — you're connected.

For live, set `paper=False` and use live keys.

## Placing an order

```python
from alpaca.trading.requests import MarketOrderRequest, LimitOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce

# Market order
order = MarketOrderRequest(
    symbol='AAPL',
    qty=10,
    side=OrderSide.BUY,
    time_in_force=TimeInForce.DAY,
)
result = trading_client.submit_order(order)
print(result.id, result.status)

# Limit order
limit_order = LimitOrderRequest(
    symbol='AAPL',
    qty=10,
    side=OrderSide.BUY,
    limit_price=187.42,
    time_in_force=TimeInForce.DAY,
)
trading_client.submit_order(limit_order)
```

Order types supported: market, limit, stop, stop-limit, trailing-stop, bracket. Standard set.

## Checking positions

```python
positions = trading_client.get_all_positions()
for p in positions:
    print(p.symbol, p.qty, p.avg_entry_price, p.unrealized_pl)

# Close a single position
trading_client.close_position('AAPL')

# Close everything
trading_client.close_all_positions()
```

`close_all_positions()` is the panic button. Useful in error handlers.

## Market data (REST)

For historical bars:

```python
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame
from datetime import datetime, timedelta

data_client = StockHistoricalDataClient('KEY', 'SECRET')

bars_request = StockBarsRequest(
    symbol_or_symbols='AAPL',
    timeframe=TimeFrame.Minute,
    start=datetime.now() - timedelta(days=5),
    end=datetime.now(),
)
bars = data_client.get_stock_bars(bars_request)
df = bars.df  # pandas DataFrame
print(df.tail())
```

Available timeframes: Minute, Hour, Day, plus Min(5), Min(15), Min(30), etc.

For free tier, IEX data only (one US exchange's prints). Paid Algo Trader Plus gets SIP data (consolidated all venues). For most strategies, IEX is good enough — same direction, slightly less volume.

## Market data (WebSocket)

For live streaming:

```python
from alpaca.data.live import StockDataStream

stream = StockDataStream('KEY', 'SECRET')

async def on_bar(bar):
    print(bar.symbol, bar.close, bar.volume)

stream.subscribe_bars(on_bar, 'AAPL', 'MSFT')
stream.run()
```

Bar events arrive ~once per minute (or chosen timeframe). For tick-by-tick, subscribe to trades / quotes instead.

For bots polling every few seconds, REST is simpler. For sub-second strategies, WebSocket is required.

## Crypto

Same SDK; different namespace:

```python
from alpaca.data.historical import CryptoHistoricalDataClient

crypto_client = CryptoHistoricalDataClient()  # no auth needed for free market data

# Trade crypto via same trading_client:
crypto_order = MarketOrderRequest(
    symbol='BTC/USD',  # slash notation
    qty=0.01,
    side=OrderSide.BUY,
    time_in_force=TimeInForce.GTC,  # crypto trades 24/7, GTC common
)
trading_client.submit_order(crypto_order)
```

Crypto on Alpaca trades 24/7. Pairs available: BTC, ETH, LTC, BCH, AAVE, etc. Smaller universe than dedicated crypto exchanges but enough for many strategies.

## Order updates (the right way to know fills)

Don't poll `get_order(id)` in a loop — wasteful and laggy. Subscribe to the trading WebSocket:

```python
from alpaca.trading.stream import TradingStream

trading_stream = TradingStream('KEY', 'SECRET', paper=True)

async def on_update(event):
    print(event.order.id, event.event, event.order.status)

trading_stream.subscribe_trade_updates(on_update)
trading_stream.run()
```

Events: new, fill, partial_fill, canceled, rejected, etc. Real-time as the order moves.

## Rate limits

- REST: 200 requests/minute on free tier.
- WebSocket: no hard limit on subscriptions; ~50-100 symbols sustainable.

For bots scanning many symbols, batch with the bulk endpoints (`get_stock_bars` accepts a list of symbols).

## Error handling that matters

```python
from alpaca.common.exceptions import APIError

try:
    trading_client.submit_order(order)
except APIError as e:
    if 'insufficient buying power' in str(e):
        # log, alert, don't retry
        ...
    elif 'rate limit' in str(e):
        time.sleep(1)
        retry()
    else:
        # unknown — log and panic-stop
        log_and_alert(e)
        kill_switch()
```

Distinguish recoverable errors (rate limits, transient network) from fatal ones (account problems, rejected orders). Treat unknowns as fatal.

## Paper to live checklist

Before flipping to live keys:

1. Bot has paper-traded ≥ 30 days without manual intervention.
2. Live PnL tracks paper PnL within reasonable tolerance.
3. Every error path is handled and logged.
4. A kill switch exists (script that calls `close_all_positions()` + halts the bot).
5. Position sizing is conservative — assume you're wrong about backtest assumptions.
6. Monitoring is set up — alerts if bot stops trading, alerts on big losses, daily PnL email.

Don't skip any of these. Live trading reveals bugs paper trading hides.

## Mistakes to avoid

- **Hardcoded API keys in code.** Use env vars; rotate periodically.
- **Paper-mode flag flipped accidentally.** Real money lost. Use distinct key pairs and verify.
- **No order update subscription.** Polling = lag = bad decisions.
- **Single-broker dependence in production.** API outages happen.
- **Ignoring rate limits.** Suspensions are unpleasant.

## Summary

- Alpaca is the simplest broker API for algo trading; $0 commissions; paper + live.
- alpaca-py SDK handles auth, orders, positions, market data, streaming.
- Use WebSocket for fills and bar streaming, REST for one-off queries.
- Handle every error path; distinguish recoverable from fatal.
- Don't go live until paper has worked for a month + monitoring is in place.

Next: Interactive Brokers — the pro option.
