---
module: 2
position: 3
title: "Market data: bars, ticks, and streams"
objective: "What data exists, what it costs, and what you need."
estimated_minutes: 7
---

# Market data: bars, ticks, and streams

## The four levels of market data

From least to most granular:

1. **Daily bars.** OHLCV per day. Free, ubiquitous, fine for swing/position strategies.
2. **Intraday bars.** OHLCV per minute / 5-min / hour. Free at major brokers; for tick-heavy strategies, still aggregated.
3. **Tick / trade data.** Every individual print with timestamp, price, volume, exchange.
4. **Order book (L2/L3) data.** Quote updates at multiple depth levels.

Each level has more data volume than the previous — daily bars are kilobytes; tick data is gigabytes; L2 is terabytes.

Your strategy's time horizon dictates the data level. Don't pay for tick data if you're holding for days.

## OHLCV bars

The standard structure:

```python
{
  'timestamp': '2026-05-15T14:30:00Z',
  'open': 187.42,
  'high': 187.58,
  'low': 187.39,
  'close': 187.50,
  'volume': 142_350,
}
```

OHLC: open / high / low / close. Volume: shares traded in the bar.

Bars come in standard intervals: 1-min, 5-min, 15-min, 30-min, 1-hour, 1-day, 1-week.

**Implicit assumptions:**
- The "close" is the last trade in the bar — could be at the bid or ask.
- Volume is total executed in the period.
- Open is the first trade in the bar — not always at the exchange opening for daily bars (depends on data provider).

For most strategies, this is enough. Tick data only matters for microstructure strategies.

## Where to get data

**Free tiers:**

- **Alpaca.** IEX-only intraday and historical bars; SIP-consolidated on paid Algo Trader Plus ($99/mo).
- **Yahoo Finance.** Free daily/weekly bars via libraries (yfinance). Latency: 15-min delayed for some quotes.
- **Polygon.io.** Free tier; small daily limits.

**Paid:**

- **Polygon.io.** $29-200/mo for various tiers; clean API; full tick history.
- **Alpaca Algo Trader Plus.** SIP-consolidated data, all venues.
- **IEX Cloud.** Free + paid tiers; historical + real-time.
- **IBKR.** Per-exchange data subscriptions through the broker.

For a hobby bot trading liquid US stocks, Alpaca free or Polygon $29 is plenty. For a serious strategy, Polygon or paid SIP is worth it.

## Reading data with pandas

The standard pattern:

```python
import pandas as pd
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame

client = StockHistoricalDataClient('KEY', 'SECRET')

bars = client.get_stock_bars(StockBarsRequest(
    symbol_or_symbols=['AAPL', 'MSFT', 'GOOGL'],
    timeframe=TimeFrame.Day,
    start='2024-01-01',
))

df = bars.df  # MultiIndex DataFrame: (symbol, timestamp)
```

`df` has columns: open, high, low, close, volume, trade_count, vwap.

For single-symbol analysis:

```python
aapl = df.loc['AAPL']
aapl['return'] = aapl['close'].pct_change()
aapl['vol_ma'] = aapl['volume'].rolling(20).mean()
```

Pandas is the lingua franca; almost every backtest library expects DataFrame input.

## Adjusted vs unadjusted prices

For long-term backtests, stock prices need adjustment for:

- **Splits.** 2-for-1 split → all historical prices divided by 2.
- **Dividends.** Optionally back-adjusted so total return is reflected.

Yahoo Finance returns "Adj Close" by default. Some APIs return raw and you must adjust yourself. Always check whether your data is adjusted before backtesting — un-adjusted prices look like massive sell-offs at split dates that didn't happen.

```python
import yfinance as yf
df = yf.download('AAPL', start='2020-01-01', auto_adjust=True)  # uses adjusted
```

## Tick data

The full firehose:

```
2026-05-15T14:30:00.001Z  AAPL  $187.43  ×  100  IEX  BUY
2026-05-15T14:30:00.034Z  AAPL  $187.43  ×  200  NYSE BUY
2026-05-15T14:30:00.187Z  AAPL  $187.42  ×  500  ARCA SELL
```

Every print. For US equities, AAPL alone generates ~3-5 million ticks per day. Across the universe: tens of billions per day.

Polygon.io is the most common retail source for full tick history. Storage and processing are real costs — you need a database (TimescaleDB, ClickHouse, Arctic) for anything substantial.

For most strategies, tick data is overkill. Use it when:

- Microstructure signals (order book imbalance, aggressive-buy ratio).
- Sub-second execution analysis.
- Liquidity research.

## WebSocket streaming

For live bots, you don't poll the data API every second — you subscribe to a stream:

```python
from alpaca.data.live import StockDataStream

stream = StockDataStream('KEY', 'SECRET')

async def on_bar(bar):
    print(f'{bar.symbol} closed at {bar.close}')
    await maybe_trade(bar)

stream.subscribe_bars(on_bar, 'AAPL', 'MSFT')
stream.run()  # blocks
```

Events arrive as the bar closes. For real-time decision making, this is the architecture.

For ticks: `subscribe_trades`. For quotes: `subscribe_quotes`. Match subscription to your strategy's needs.

## Bar aggregation

Sometimes you need bars at intervals the API doesn't natively provide. Aggregate from smaller bars:

```python
import pandas as pd

def resample(df, rule):
    # df indexed by timestamp, has o/h/l/c/v
    return df.resample(rule).agg({
        'open': 'first',
        'high': 'max',
        'low': 'min',
        'close': 'last',
        'volume': 'sum',
    }).dropna()

bars_5min = resample(bars_1min, '5T')
bars_hourly = resample(bars_1min, '1H')
```

Pandas `resample` is the standard tool. Always include `.dropna()` because some periods (overnight gap) have no data.

## Time zones — the silent killer

US markets trade in America/New_York. Most APIs return UTC timestamps. Always be explicit:

```python
df.index = df.index.tz_convert('America/New_York')
```

Common bug: filtering "after 9:30 AM" using UTC timestamps — you exclude all morning data. Or running a backtest on Asia/Tokyo time and getting weird off-by-day errors.

The rule: store everything in UTC; convert to exchange-local timezone only for filtering/display.

## Data quality issues

Raw data has problems:

- **Missing bars.** Holidays, halts, low-liquidity periods.
- **Stale prices.** Some data providers extend yesterday's close into today on no-volume periods.
- **Bad ticks.** $10,000 prints on a $200 stock from data errors.
- **Adjustment bugs.** Splits or dividends applied to wrong dates.

For serious strategies, validate data:

```python
df = df.dropna()
df = df[df['volume'] > 0]  # drop empty bars
# Outlier filter
df['ret'] = df['close'].pct_change()
df = df[df['ret'].abs() < 0.5]  # drop > 50% moves as suspicious
```

## Storage

For backtesting, you'll accumulate data. Storage options:

- **Parquet files.** Columnar, fast, compressed. Per-symbol or per-day files. Standard for pandas workflows.
- **TimescaleDB.** Postgres extension for time-series. Excellent for queries across symbols/timeframes.
- **ClickHouse.** Column-store database — extremely fast for large-scale analytics.
- **Arctic / VnPy datafeed.** Specialized time-series stores.

For < 1 GB of daily bars: just use Parquet files. Past that, consider a real database.

## Mistakes to avoid

- **Backtesting on un-adjusted prices.** False splits look like crashes.
- **Time zone confusion.** Mix UTC and local → off-by-hours bugs.
- **Polling instead of streaming.** Wastes API budget; slower.
- **No data validation.** Bad ticks corrupt signals.
- **Wrong data level.** Buying tick data for a swing strategy that uses daily bars.

## Summary

- Match data granularity to strategy time horizon.
- Free Alpaca / yfinance for hobbies; Polygon for serious work.
- Adjusted prices for backtests with > 1-year lookback.
- WebSocket streaming for live; REST for historical.
- Resample bars in pandas; store as Parquet by default.
- Always validate: drop missing, filter outliers.
- UTC storage, local-time filtering.

Next: order management essentials.
