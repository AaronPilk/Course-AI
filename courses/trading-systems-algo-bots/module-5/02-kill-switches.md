---
module: 5
position: 2
title: "Kill switches and circuit breakers"
objective: "Build the panic-button infrastructure that saves your account."
estimated_minutes: 6
---

# Kill switches and circuit breakers

## Why every bot needs one

Bots fail in unexpected ways:

- Bug in new code path causes a position-flipping loop.
- Bad market data triggers ten thousand "signals" in a minute.
- Broker API returns garbage; bot interprets it as a price move.
- Strategy hits a regime it wasn't designed for; losses pile up fast.

In each case, the difference between a bad day and a blown account is how quickly you can stop the bot. Manual response time is minutes; automatic kill switches respond in seconds. The latter wins.

## The hierarchy of kills

Build progressively more aggressive halts:

1. **Pause new entries.** Existing positions intact; no new orders submitted.
2. **Cancel all open orders.** Working orders stop; positions remain.
3. **Flatten all positions.** Close everything at market.
4. **Halt the process.** Bot stops accepting any signal.

In a real incident, you usually want #3 + #4: flatten and halt.

```python
class KillSwitch:
    def panic(self, reason):
        log_critical(f'KILL SWITCH: {reason}')
        alert_human(reason)
        
        # 1. Cancel all open orders
        broker.cancel_all_orders()
        
        # 2. Flatten all positions
        broker.close_all_positions()
        
        # 3. Stop accepting signals
        self.halted = True
        
        # 4. Optionally: shut down process entirely
        if self.config.exit_on_panic:
            sys.exit(1)
```

## What triggers the kill

**Hard limits — fully automatic, no human in the loop:**

- Daily loss > X% of equity.
- Position size in any one name > Y% of equity.
- Total gross exposure > Z% of equity.
- More than N orders submitted in M seconds (run-away loop detector).
- Order rejection rate > threshold.

**Soft limits — alert + human decides:**

- Strategy down 5%.
- Latency between signal and fill exceeded.
- Data feed gap.
- Pricing anomaly (e.g., bar with > 30% change).

Hard limits should be conservative. False positives are annoying; missing a real failure is catastrophic.

## The run-away loop detector

A common bot failure: bug causes the bot to submit orders in a loop. Without a circuit breaker, you can submit thousands of orders in seconds — capacity-blowing or simply blowing up the account.

```python
class OrderRateLimiter:
    def __init__(self, max_per_minute=20):
        self.max = max_per_minute
        self.timestamps = []
    
    def allow(self):
        now = time.time()
        self.timestamps = [t for t in self.timestamps if now - t < 60]
        if len(self.timestamps) >= self.max:
            kill_switch.panic('order rate limit exceeded')
            return False
        self.timestamps.append(now)
        return True
```

Cap orders to a sensible rate for your strategy. A daily-bar strategy should not submit > 20 orders per day; a 1-min bar strategy might allow more. Whatever the right number, enforce it.

## The lockout file

For multi-process safety:

```python
LOCKOUT_FILE = '/var/run/trading_bot.halted'

def check_lockout():
    if os.path.exists(LOCKOUT_FILE):
        sys.exit(0)

def halt_globally(reason):
    with open(LOCKOUT_FILE, 'w') as f:
        f.write(f'{datetime.now()}: {reason}')
```

Any restart of the bot reads the file and exits. You must manually remove the file to allow trading. Prevents "I forgot to flip the kill switch back" → bot resumes immediately on restart.

Some teams require a senior engineer to clear the file. Friction is a feature here.

## Position size guards

Even with kill switch, day-to-day sizing should self-bound:

```python
def submit_order(symbol, qty, side, price):
    proposed_position = position(symbol) + qty * sign(side)
    proposed_value = abs(proposed_position) * price
    
    if proposed_value > equity * 0.10:
        log_critical(f'BLOCKED: {symbol} position would exceed 10% cap')
        return None
    
    if total_exposure() + qty * price > equity * 1.5:
        log_critical(f'BLOCKED: gross exposure would exceed 150% cap')
        return None
    
    broker.submit(...)
```

Caps run at every order submission. Lower-level than the kill switch — they prevent the kill switch from ever needing to fire.

## Heartbeats

Bots must signal liveness:

```python
def heartbeat():
    redis.set('bot:alive', time.time(), ex=120)

def watchdog():
    last_beat = redis.get('bot:alive')
    if not last_beat or time.time() - float(last_beat) > 120:
        alert('BOT NOT HEARTBEATING — possibly crashed')
```

The watchdog runs separately (cron, systemd timer, separate VM). If it doesn't see a heartbeat in 2 minutes, it alerts.

A bot that's silent during market hours is a bot that's failing. Heartbeat alerts catch this even when the bot is too broken to log its own death.

## EOD verification

At end of each trading day:

```python
def eod_verification():
    broker_positions = broker.list_positions()
    db_positions = db.list_positions()
    
    if positions_match(broker_positions, db_positions):
        log_info('EOD: positions reconciled OK')
    else:
        log_critical('EOD: POSITION MISMATCH')
        alert_human()
    
    daily_pnl = compute_daily_pnl()
    if daily_pnl < -0.05 * equity:
        log_critical(f'EOD: daily loss {daily_pnl:.2%} exceeds 5%')
        kill_switch.panic('daily loss limit')
```

Forces a daily checkpoint. If the day was bad, the kill switch fires before tomorrow's market open.

## Broker-side controls

Most brokers expose risk controls at the account level:

- **Daily loss limit.** Account auto-halts at X% loss.
- **Max position size.** Per-symbol cap.
- **Pre-trade margin checks.** Order rejected if it would breach margin.

Layer these *underneath* your bot's controls. If the bot has bugs, the broker's controls are the final backstop.

For Alpaca: pattern day trader rules limit you to 3 round-trips per 5 days if account < $25K (regulatory, not optional).

## Recovery after a kill

When the kill switch fires:

1. **Don't immediately re-enable.** Investigate. Find the cause.
2. **Reconcile state.** Make sure your DB matches broker.
3. **Document.** Postmortem the incident — what failed, what you'll change.
4. **Update tests.** Add a regression test if the failure was a bug.
5. **Resume cautiously.** Smaller size on first day back.

Most bots that blow up don't blow up once. They blow up, get restarted "fixed", and blow up again the same way. Real recovery requires real analysis.

## Mistakes to avoid

- **No kill switch.** "It hasn't failed yet" doesn't mean it won't.
- **Kill switch you've never tested.** Test it on paper. Make sure it works.
- **Soft alerts only.** Some failures move too fast for human response.
- **Kill switch behind a password humans forget.** Easy access; rate-limit instead.
- **Resuming without investigation.** The bug is still there.

## Summary

- Kill switches escalate from pause → cancel → flatten → halt.
- Hard limits: daily loss, position size, order rate.
- Soft limits: latency, anomalies, alerts.
- Heartbeats catch silent failures.
- EOD verification gates the next day's trading.
- Broker-side controls are the final backstop.
- Always investigate before re-enabling.

Next: monitoring, alerting, and ops.
