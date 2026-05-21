---
module: 5
position: 1
title: "Alerts and notifications"
objective: "Set up Pine alerts and route them to email / SMS / webhook."
estimated_minutes: 5
---

# Alerts and notifications

## alert() function

```pinescript
//@version=5
indicator("MA Cross Alert", overlay=true)
fastMA = ta.sma(close, 9)
slowMA = ta.sma(close, 21)

if ta.crossover(fastMA, slowMA)
    alert("Buy signal on " + syminfo.ticker, alert.freq_once_per_bar_close)

if ta.crossunder(fastMA, slowMA)
    alert("Sell signal on " + syminfo.ticker, alert.freq_once_per_bar_close)
```

`alert()` fires when condition true; respects frequency.

For: programmatic alerts inside Pine.

## Alert frequencies

- `alert.freq_once_per_bar`. Once per bar; may fire intra-bar.
- `alert.freq_once_per_bar_close`. After bar closes; no repainting.
- `alert.freq_all`. Every tick.

Use `alert.freq_once_per_bar_close` for trustworthy live signals.

For: prevent flickering alerts.

## alertcondition()

Older approach; creates alert conditions you can set up manually:

```pinescript
buyCondition = ta.crossover(fastMA, slowMA)
alertcondition(buyCondition, "Buy",
               "MA cross long on {{ticker}} at {{close}}")
```

In TradingView UI: Alerts panel → "Create Alert" → select condition from your indicator. `alert()` is the newer, preferred API.

For: manual alert setup; older scripts.

## Built-in alert placeholders

```pinescript
alert("Buy {{ticker}} at {{close}} on {{interval}}")
```

Resolved at fire time:
- `{{ticker}}`. Current symbol (e.g., AAPL).
- `{{close}}`, `{{open}}`, `{{high}}`, `{{low}}`, `{{volume}}`.
- `{{time}}`. Bar time.
- `{{interval}}`. Timeframe (1, 5, 60, D).
- `{{exchange}}`. Exchange.
- `{{strategy.order.action}}`, `{{strategy.position_size}}`.

For: dynamic alert content.

## Strategy alerts

In `strategy()` scripts:

```pinescript
strategy.entry("Long", strategy.long, alert_message="BUY {{ticker}} @ {{close}}")
strategy.exit("Exit", from_entry="Long", stop=stopPrice,
              alert_message="STOP HIT {{ticker}} @ {{close}}")
```

Fired automatically on order events.

Pair with TradingView Alert configured to fire on "Any alert function call".

For: automated trade alerts from strategy.

## Email + SMS

In TradingView UI when creating an alert:
- Email — free.
- SMS — premium tier required; limited per month.
- Mobile app push — free; needs app installed.

For: simple notifications.

## Webhook URL

The killer feature for automation:

In Alert dialog:
- Notifications tab → "Webhook URL".
- Enter URL endpoint.
- Pine alert text becomes POST body.

TradingView sends JSON / text on alert fire.

For: route alerts to broker / Discord / Slack / custom backend.

## Webhook message format

```pinescript
alert('{"action": "buy", "ticker": "{{ticker}}", "price": "{{close}}", "qty": 1}',
      alert.freq_once_per_bar_close)
```

JSON in alert text → webhook payload. Your endpoint parses + acts.

For: structured automation payloads.

## Alert template with variables

```pinescript
//@version=5
indicator("Alert Template", overlay=true)

threshold = input.float(2.0, "ATR Multiplier")
atr = ta.atr(14)
upperBand = close + atr * threshold
lowerBand = close - atr * threshold

if close > upperBand[1]
    alert('{"side": "long", "symbol": "{{ticker}}", "price": "{{close}}", "sl": "' +
          str.tostring(lowerBand) + '"}', alert.freq_once_per_bar_close)
```

String concatenation builds JSON dynamically.

For: rich payload content.

## Multi-condition single alert

```pinescript
buy1 = ta.crossover(close, ta.sma(close, 20))
buy2 = rsi < 30
buy3 = close > ta.ema(close, 200)
strongBuy = buy1 and buy2 and buy3

if strongBuy
    alert("Strong Buy: all 3 conditions met on " + syminfo.ticker,
          alert.freq_once_per_bar_close)
```

For: confluence-only alerts; reduce noise.

## Alert limits per account

TradingView tier limits:
- Free: 1 active alert.
- Pro: 20.
- Pro+: 100.
- Premium: 400.

Each alert can fire any number of times.

For: prioritize critical alerts; combine into fewer scripts.

## Alert ordering: server-side

Alerts run server-side on TradingView's infrastructure. No need to keep your computer open / browser tab.

For: 24/7 monitoring without local setup.

## When alerts fire

- On bar close (`freq_once_per_bar_close`).
- Every tick if `freq_all`.
- Real-time during regular session hours.
- After hours: alerts still fire on traded bars (varies by symbol).

For: understand timing precision.

## Alert delivery latency

Typical end-to-end:
- Pine evaluates: instant.
- TradingView server fires: < 1s.
- Email / push: 1-10s.
- Webhook: 100ms-2s to endpoint.

Crypto bots: webhook latency matters; aim < 500ms total.

For: realistic execution expectations.

## Mistakes to avoid

- **`alert.freq_all`.** Spams 100s of alerts per bar.
- **Hard-coded text.** Use placeholders for dynamic content.
- **Forgetting to enable on TV alert dialog.** Pine `alert()` needs TradingView alert configured to fire.
- **Webhook without auth.** Anyone can POST to your endpoint → secure with token in URL.

## Summary

- alert() / alertcondition() trigger TradingView alerts.
- Use `freq_once_per_bar_close` for clean signals.
- Webhook URL routes JSON to external endpoint.
- Strategy alerts auto-fire on entries / exits.

Next: webhooks for broker automation.
