---
module: 5
position: 3
title: "Deployment and operations"
objective: "Run live strategies reliably with monitoring + safeguards."
estimated_minutes: 5
---

# Deployment and operations

## Production checklist

- [ ] Strategy locked (no parameter changes).
- [ ] Webhook endpoint deployed + tested.
- [ ] Broker API key secured (env var; never in code).
- [ ] Daily loss limit configured.
- [ ] Max position size cap.
- [ ] Stop loss + take profit on every trade.
- [ ] Logging of every order placement + result.
- [ ] Alert on system failures (heartbeat).
- [ ] Manual kill switch documented.

For: minimum viable production.

## Hosting your webhook

Options ranked by ease:
1. **Cloudflare Workers**. Free; instant deploy; global edge. ~50ms latency.
2. **Vercel functions**. Easy from Next.js codebase. ~100ms.
3. **AWS Lambda**. Mature; deeper integrations. ~150ms.
4. **VPS (DigitalOcean / Hetzner)**. Full control; manual ops.

For: serverless = simpler ops; lower latency.

## Environment variables

Never commit secrets to git:

```bash
BROKER_API_KEY=...
BROKER_API_SECRET=...
WEBHOOK_AUTH_TOKEN=...
DISCORD_NOTIFY_URL=...
```

Use platform's env var UI (Cloudflare Dashboard, Vercel Project Settings).

For: security.

## Order logging

Every order placement:

```javascript
const log = {
  timestamp: Date.now(),
  signal: signal,
  brokerResponse: response,
  orderId: response.id,
  status: response.status
}
await db.insert("order_logs", log)
```

Persistent log → debugging + reconciliation + tax records.

For: audit trail.

## Heartbeat monitoring

```pinescript
//@version=5
indicator("Heartbeat", overlay=true)
if minute == 0 and second == 0   // Every hour on the hour
    alert('{"type": "heartbeat", "time": "{{time}}"}', alert.freq_once_per_bar_close)
```

Endpoint receives → updates `last_alive_at`. External monitor (UptimeRobot, BetterStack) pings endpoint hourly; alerts if `last_alive_at > 2 hours`.

For: detect dead pipelines.

## Broker connection health

Periodically poll broker API:
```javascript
async function brokerHealthCheck() {
  const account = await broker.getAccount()
  if (!account || account.status !== "ACTIVE") {
    await notifyOperator("Broker connection issue")
  }
}
```

Daily on schedule.

For: catch connectivity / auth issues early.

## Kill switch

Manual mechanism to halt all trading instantly:

```javascript
// Endpoint check
if (await kv.get("KILL_SWITCH")) {
  await notifyOperator("Alert received but kill switch active")
  return new Response("halted", { status: 200 })
}
```

Toggle via separate admin endpoint or even a Discord bot command.

For: emergency control.

## Daily reconciliation

Compare:
- Pine alerts fired today (TradingView log).
- Orders placed (webhook log).
- Fills (broker statement).

Discrepancies → investigate immediately.

For: catch missed alerts / failed orders.

## Position reconciliation

Periodically compare broker positions vs. expected:

```javascript
const expected = await db.getOpenPositions()
const actual = await broker.getOpenPositions()
const diff = compare(expected, actual)
if (diff.length) await notifyOperator(diff)
```

For: detect partial fills, missed exits.

## Strategy versioning

```pinescript
//@version=5
// Strategy version: v2.3.1
// Deployed: 2026-01-15
// Changelog: Added regime filter
strategy("S v2.3.1", ...)
```

Tag versions in alerts → reconcile back to backtest.

For: traceability.

## Multi-strategy portfolio

Several strategies sharing one webhook endpoint:

```json
{ "strategy_id": "trend_breakout_v2", "action": "buy", ... }
```

Endpoint routes by strategy_id. Risk-budgeted: each strategy gets X% of account.

For: diversification.

## A/B testing live

Run two parameter variants in parallel:
- Strategy A: half size.
- Strategy B: half size.

Compare live performance for 3-6 months → keep winner.

For: continuous improvement.

## TradingView account separation

Many serious traders split:
- Backtesting account: rapid iteration; many alerts.
- Production account: locked strategies; minimal alerts; max stability.

Different accounts → no risk of accidentally turning off live alert.

For: discipline.

## Latency budget

End-to-end for crypto / FX:
- Bar close to Pine evaluate: < 100ms.
- Pine alert fires: < 500ms.
- Webhook receives: < 1s.
- Order to broker: < 500ms.
- Broker fills: 50-500ms.

Total: ~2-3s typically. Slippage usually 1-3 ticks beyond signal price.

For: realistic execution expectations.

## When strategies stop working

Live divergence from backtest:
- Drawdown exceeds expected.
- Win rate drops 10+ points.
- Trade frequency drops.

Causes:
- Market regime change.
- Strategy decay (others using same edge).
- Bug introduced in update.
- Broker issues.

Diagnose: pause live, run latest data through backtest, compare.

For: maintain edge over time.

## Disaster recovery

What if:
- TradingView outage → manual oversight; close positions if extended.
- Webhook endpoint dies → backup endpoint + DNS failover, or manual.
- Broker outage → no execution; positions on hold.

Documented runbook per scenario.

For: production maturity.

## Mistakes to avoid

- **No kill switch.** Can't halt a runaway strategy fast.
- **No reconciliation.** Diverges silently; surprise drawdown.
- **No heartbeat.** Pipeline dies for hours undetected.
- **Manual tweaks live.** Contaminate evaluation; break correlation with backtest.

## Summary

- Hosting: Cloudflare Workers / Vercel for serverless simplicity.
- Logging + reconciliation + heartbeat = operational maturity.
- Kill switch + daily limits = safety.
- Latency: ~2-3s end-to-end for crypto / FX.

Next: tying it together + scaling.
