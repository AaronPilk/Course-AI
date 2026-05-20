---
module: 5
position: 3
title: "Monitoring, alerts, and ops"
objective: "Run a bot you can trust to run itself."
estimated_minutes: 6
---

# Monitoring, alerts, and ops

## What "operating a bot" actually means

A backtest produces a result and ends. A live bot runs forever. The cost shifts from research-time to ops-time.

What you need running continuously:

- The bot itself.
- Watchdog process for liveness.
- Logging and metrics collection.
- Alerting on critical signals.
- Daily reporting.
- Reconciliation jobs.
- Backup of state.

Each is small individually; together they're an operations practice. Without it, the bot drifts into states you don't notice until they're catastrophic.

## Infrastructure choices

For retail:

- **VPS.** AWS EC2 small instance, DigitalOcean Droplet, Linode — $5-20/month. Good enough for most strategies.
- **Containerized.** Docker + docker-compose; easy redeploy.
- **Process manager.** systemd or supervisord — restarts on crash.

For pro:

- **Dedicated colo near exchange.** Latency-critical strategies. Sub-millisecond.
- **Multi-region.** Failover between regions if one outages.
- **Custom monitoring stack.** Prometheus + Grafana, datadog.

Most retail bots run fine on a $10/month VPS with systemd. Premature scaling is wasted.

## Logging

Log everything at the right level:

```python
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
log = logging.getLogger('bot')

log.info('start of session, equity=$%.2f', equity)
log.info('signal generated: %s %s qty=%d', symbol, side, qty)
log.info('order submitted: id=%s', order_id)
log.info('order filled: id=%s avg_price=%.4f', order_id, fill_price)
log.warning('order rejected: id=%s reason=%s', order_id, reason)
log.error('broker connection lost')
log.critical('KILL SWITCH FIRED: %s', reason)
```

- **INFO** for normal events.
- **WARNING** for unexpected but recoverable.
- **ERROR** for serious problems.
- **CRITICAL** for things requiring immediate attention.

Log to stdout (captured by systemd / Docker) AND to a structured store (Loki, Logflare, S3) for queryability.

## Metrics

Track these, charted:

- **Equity over time.** The primary chart.
- **Open positions.** Symbol, qty, unrealized PnL.
- **Daily PnL.** Realized + unrealized.
- **Drawdown.** Current % from peak equity.
- **Order count per day.** Catches loops; catches inactivity.
- **Fill latency.** Time from signal to fill.
- **Slippage.** Intended vs actual fill price.
- **Strategy-specific signals.** Win rate, position counts, etc.

Push to InfluxDB / TimescaleDB / Prometheus. Visualize with Grafana. Single dashboard with 6-8 panels covers most needs.

## Alerts

Don't alert on everything — alert fatigue is real. Reserve alerts for:

- **Bot stopped heartbeating.** Critical, page.
- **Kill switch fired.** Critical, page.
- **Daily loss > X%.** Warning, push notification.
- **Order rejection rate > threshold.** Warning, push.
- **Position size cap breached.** Warning, push.
- **Drawdown > 10%.** FYI, daily digest.
- **EOD summary.** FYI, daily email.

For paging: PagerDuty, OpsGenie, or simpler — SMS via Twilio. For push: Pushover, Telegram bot. For digest: email.

## Daily reports

End of each trading day, generate a summary:

```
=== Daily Report: 2026-05-15 ===

Equity: $103,420 (+$420 / +0.41%)
Trades today: 12 (8 wins, 4 losses)
Win rate today: 67%
Largest winner: AAPL +$185
Largest loser: TSLA -$95
Current positions: 4 (NVDA +$320, MSFT +$80, ...)
Max drawdown YTD: 4.2% (recovered 2026-04-20)

Anomalies:
- 1 order rejected (TSLA, insufficient buying power — investigating)
- Average fill latency 145ms (typical: 80ms; broker side issues?)

Strategy breakdown:
- mean_rev_us_equities: +$310
- trend_following_etfs: +$110
- statarb_pairs: $0 (no signals today)
```

Email yourself daily. Read it for 30 seconds. Catches drift before it grows.

## Backups

Back up:

- The bot's local DB (orders, positions, trades).
- Config / .env files (encrypted).
- Strategy code (already in git; verify).
- Logs (rotated daily; archive monthly).

To S3 or B2. Daily automated job.

If the VPS dies, you can rebuild in 15 minutes from backups. Without them, your live state is gone.

## Deployment process

Every change to production:

1. Tested in paper.
2. Approved (formally for teams; mentally for solos).
3. Deployed via a script — never manual ssh edits.
4. Logged: what changed, when, who.
5. Watched the first hour after deploy.

A solo trader's "deploy" can be `git pull && systemctl restart bot`. Make it idempotent and reproducible.

## On-call discipline

If you have alerts, someone has to answer them. For solo traders, that's you 24/7. For teams, rotate.

Define:

- **Response time.** Critical alert → respond in 15 minutes.
- **Resolution time.** Investigate, fix or escalate, within 1 hour.
- **Postmortem.** Within 24 hours of major incidents.

For market hours only: alerts route to phone. After hours: defer non-critical to morning.

The point: alerts that no one answers are noise. Either fix the cause or quiet the alert.

## Postmortems

Every incident (kill switch, big drawdown, surprise loss) gets a written postmortem:

```
## Incident 2026-04-15

What happened:
At 11:32 ET, the bot opened a 5× larger position in TSLA than designed.

Why:
The position-size guard had a bug — float comparison against a string equity value
that was sometimes "10000" (string) and sometimes 10000 (float).

Impact:
Position opened at 50% of equity instead of 10%. Loss of $1,200 when stopped out.

Fix:
Coerce equity to float at the boundary; added unit test for the guard.

Prevention:
Now: type assertions on all numerical inputs at module boundaries.
```

Postmortems force a real "what changed?" answer. Most bugs surface as "we'd seen this before but didn't take it seriously" — postmortems prevent the second occurrence.

## Calibration loops

Monthly:

- Compare modeled slippage to actual.
- Compare backtest PnL to live PnL for the same period.
- Review override log (if any).
- Check sector / size limits — still appropriate?

This is the slow feedback loop that keeps the system honest as conditions change.

## Mistakes to avoid

- **Logging too much; nobody reads.** Be selective.
- **Alerting on everything.** Alert fatigue makes real alerts invisible.
- **No daily summary.** Drift accumulates invisibly.
- **No on-call.** Alerts go unanswered.
- **No postmortems.** Same bug repeats.

## Summary

- VPS + systemd + Docker is plenty for retail.
- Log INFO/WARNING/ERROR/CRITICAL appropriately; push to a store.
- Metrics: equity, drawdown, PnL, latency, slippage. Grafana dashboard.
- Alerts: critical (page), warning (push), FYI (digest).
- Daily report; read for 30 seconds.
- Backup local state; test restores.
- Postmortem every incident.
- Monthly calibration vs reality.

Next: the trader's mindset and surviving streaks.
