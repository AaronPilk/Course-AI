---
module: 5
position: 2
title: "Webhooks and automation"
objective: "Wire Pine alerts to brokers via webhook endpoints."
estimated_minutes: 5
---

# Webhooks and automation

## Webhook flow

```
Pine Script   →  TradingView Alert  →  Webhook URL  →  Your Endpoint  →  Broker API  →  Order
```

TradingView fires HTTP POST to your URL with the alert message as body.

For: hands-off execution from signals.

## Alert message as JSON

```pinescript
//@version=5
strategy("Auto Strategy", overlay=true)

if buyCondition
    alertMsg = '{"action": "buy", "ticker": "{{ticker}}", "qty": 1, "price": "{{close}}"}'
    strategy.entry("Long", strategy.long, alert_message=alertMsg)
```

Endpoint receives parseable JSON.

For: structured automation.

## TradingView alert setup

1. Right-click chart → "Add Alert".
2. Condition: select your strategy / indicator.
3. Settings → Frequency: "Only once" or "Once per bar close".
4. Notifications tab → Webhook URL: paste your endpoint.
5. Message: `{{strategy.order.alert_message}}` (pulls Pine's alert_message).
6. Create.

For: production setup.

## Webhook receivers — options

- **3Commas / TradingConnector / TradeStream**. Pre-built TradingView → broker bridges. Easy; subscription-based.
- **Custom backend (Cloudflare Workers, Vercel, Fly.io)**. Full control; coding required.
- **Discord webhook URL**. Free notifications; not for trading.
- **AWS Lambda / API Gateway**. Scalable; broker SDK in Lambda.

For: choice based on technical level.

## Sample Cloudflare Worker endpoint

```javascript
export default {
  async fetch(req, env) {
    const auth = req.headers.get("authorization")
    if (auth !== `Bearer ${env.WEBHOOK_SECRET}`) return new Response("forbidden", { status: 403 })

    const body = await req.text()
    const signal = JSON.parse(body)

    // Route to broker API
    const order = await placeOrder(env.BROKER_API_KEY, signal)
    return new Response(JSON.stringify(order))
  }
}
```

Authenticate with shared secret; parse JSON; call broker.

For: production-grade webhook.

## Authentication

Webhooks are public URLs. Anyone with the URL can POST. Defenses:

1. **Secret in URL**: `https://your.app/webhook/abc123-random`.
2. **Bearer token** from TradingView: include `Authorization: Bearer XYZ` header (Pro+ feature).
3. **IP whitelist**: TradingView publishes alert source IPs; restrict to those.
4. **HMAC signature**: include signed hash in payload; verify server-side.

For: prevent unauthorized order placement.

## Broker API integrations

Popular paths:
- **Alpaca**. Free API; commission-free stocks + crypto. REST/Websocket.
- **Interactive Brokers**. Pro choice; complex API (TWS, Client Portal).
- **Binance / Bybit / Coinbase**. Crypto; REST APIs straightforward.
- **OANDA**. Forex; REST + streaming.
- **MetaTrader bridge**. Forex; popular for retail.

For: pick based on instrument + region.

## Order format example

```json
{
  "action": "buy",
  "symbol": "BTCUSD",
  "exchange": "BINANCE",
  "qty": 0.05,
  "type": "market",
  "tp": "{{plot('TP', tpPrice)}}",
  "sl": "{{plot('SL', slPrice)}}"
}
```

Endpoint translates to broker API format.

For: standardized internal protocol.

## Idempotency

Alerts can fire twice (TradingView retries on transient failure):

```javascript
const orderId = `${signal.ticker}-${signal.bar_time}`
if (await store.get(orderId)) return new Response("duplicate")
await store.set(orderId, "placed")
await placeOrder(signal)
```

For: prevent double orders.

## Position size from webhook

Pine sends desired position size; endpoint resolves to broker units.

```pinescript
// Pine sends % of equity
alert('{"action": "buy", "size_pct": 5}')

// Endpoint converts based on broker account balance
const equity = await getBrokerEquity()
const qty = (equity * signal.size_pct / 100) / signal.price
```

For: separate strategy logic from broker quirks.

## Stop loss management

Two patterns:
1. **Single-shot bracket**. Pine sends entry + SL/TP in one alert; broker places OCO.
2. **Round-trip alerts**. Pine sends entry; later sends exit when stop triggers in Pine. Higher latency; cleaner.

For: most brokers, pattern 1 is faster + more reliable.

## Webhook reliability

Failure modes:
- TradingView server downtime (rare).
- Network blip → retry within seconds.
- Your endpoint down → alert lost.
- Broker API down → order fails.

Mitigations:
- Endpoint hosted on serverless (Cloudflare Workers / Vercel) for uptime.
- Order placement retries (max 3) with backoff.
- Log every alert; manual reconciliation if needed.
- Heartbeat: regular alerts confirming system alive.

For: production reliability.

## Testing in production

1. Webhook returns immediately on receipt; queue work.
2. Log alert payload + endpoint response.
3. Initial mode: dry run (log only; no broker call).
4. Then paper-trade endpoint with broker sandbox.
5. Then live with tiny size.

For: graduated production rollout.

## Discord / Slack webhook

Quick notifications via the platform's webhook URL — no coding:

```pinescript
alert('{"content": "Buy signal on {{ticker}} at {{close}}"}',
      alert.freq_once_per_bar_close)
```

Discord webhooks expect specific JSON format; configure in alert message.

For: free notifications without trading automation.

## Costs

- TradingView Pro+: $25/mo (webhook alerts).
- Cloudflare Workers: free tier covers 100k requests/day.
- Broker APIs: usually free (commission per trade).
- Total cost for solo automated trader: $25-50/mo.

For: bootstrap budget.

## Mistakes to avoid

- **Public webhook without auth.** Anyone fires orders.
- **Hardcoded secrets in Pine.** Pine source visible if shared.
- **No idempotency.** Duplicate orders on retries.
- **Synchronous broker call.** Webhook times out; alert "fails".

## Summary

- Webhook URL connects Pine alerts to brokers.
- JSON alert messages parsed by endpoint.
- Authenticate webhooks; idempotency keys; logging.
- Start with paper / dry-run; scale slowly.

Next: deployment and ongoing operations.
