---
module: 3
position: 4
title: "Mechanical vs discretionary blending"
objective: "When to let humans override the algorithm — and when not to."
estimated_minutes: 6
---

# Mechanical vs discretionary blending

## The spectrum

Trading systems range from fully mechanical (bot does everything; human never touches it) to fully discretionary (human reads charts and clicks). Most retail algo traders end up somewhere in between.

A purely mechanical bot has clear advantages:

- No emotional decisions.
- Repeatable, backtestable.
- Operates 24/7.
- Catches every signal.

But also disadvantages:

- Can't react to genuinely new market conditions.
- Vulnerable to regime shifts the code wasn't designed for.
- May miss obvious red flags (e.g., FTX-style counterparty risk).

A purely discretionary trader has the opposite trade-offs. Blending — bot does most of the work; human supervises and rarely intervenes — captures the best of both.

## Three modes of blending

**Mode 1: Mechanical with kill switch.** Bot runs autonomously. Human watches and has a kill switch. Intervenes only in clear failure (system bug, broker outage, geopolitical shock).

**Mode 2: Mechanical with override gates.** Bot generates signals; human approves each trade. Slows down trading but reduces blind execution. Common during a new strategy's first weeks live.

**Mode 3: Discretionary with mechanical support.** Human decides; bot handles execution (TWAP slicing, stop placement, position tracking). Common in hedge funds where PMs trade and execution is automated.

For retail, modes 1 and 2 are typical. Mode 1 is the goal; Mode 2 is the training-wheels stage.

## The case for mechanical

The single biggest argument for mechanical: humans systematically interfere with their own systems. Studies of long-running discretionary overrides on mechanical signals find that the overrides usually destroy alpha.

Reasons:
- Loss aversion. Want to "wait one more day" on a losing trade.
- Recency bias. Cancel signals after a string of losses.
- Greed. Hold winners past the exit signal.
- Bias against repetition. "Already long that name — feel like I shouldn't add more."

Bots don't have these biases. They execute exactly what was tested.

## The case for discretionary override

Sometimes humans are right to override:

- **Obvious data error.** Bot computes from corrupted bar; sees a "signal" that's a price glitch. Human catches it.
- **News not in the data.** Company announces guidance cut after-hours; bot's pre-market signal is based on stale info.
- **Counterparty risk.** Exchange is rumored to have liquidity problems; human flatten before solvency event.
- **Regulatory shift.** Sudden margin requirement change, halt, force-close requirement.

These are rare. If you find yourself overriding daily, you don't have a discretionary advantage — you have a fear-based interference problem.

## How to add discretionary safeguards correctly

**Pre-trade gate.** Allow but discourage manual veto.

```python
def propose_trade(symbol, side, size):
    if config.MANUAL_APPROVAL_MODE:
        send_alert(f'PROPOSED: {side} {size} {symbol}', approve_url=f'/approve/{trade_id}')
        # Wait for click; timeout cancels
    else:
        execute(symbol, side, size)
```

**Position-level halt.** Allow killing a single open position without halting the whole bot.

**Strategy-level halt.** Allow pausing a single strategy.

**Bot-level kill.** "Stop everything; flatten." The hard panic button.

A good UI exposes all four; you use the highest-level one that solves the problem.

## Logging override decisions

Every manual intervention gets logged with reason. This is critical for honest evaluation later:

```python
def manual_override(action, reason, operator):
    db.insert('overrides', {
        'timestamp': now(),
        'action': action,
        'reason': reason,
        'operator': operator,
    })
```

After a month, review the overrides:
- Did they save or cost money?
- Was the reason a real edge case or a fear response?
- Would the bot have been fine without intervention?

Most overrides reveal that humans interfere more than they help. The data should change your behavior.

## When to add a rule vs override

If you find yourself overriding the bot for the same kind of situation repeatedly, that's a signal to codify the rule, not keep overriding:

- "I always cancel signals during earnings week." → Add an earnings-week filter.
- "I always skip thin stocks." → Add a liquidity filter.
- "I always close before FOMC." → Add a calendar-event filter.

The job of discretionary feedback is to *improve the bot*, not to compete with it.

## Multi-strategy ensembles

Most professional setups run multiple strategies simultaneously:

- Trend (long-term, low frequency).
- Mean reversion (short-term, high frequency).
- Statistical arbitrage (pairs, market-neutral).
- Event-driven (earnings drift, M&A).

Each captures a different edge. Combined, they smooth the equity curve — when one strategy is in drawdown, others are typically working.

The risk: correlation. In crises, many "uncorrelated" strategies suddenly correlate. Allocate capital with this in mind.

## The retail reality

Most retail algo traders run:

- 1-2 mechanical strategies.
- Manual oversight of a few "high-conviction" trades.
- A clear separation between bot capital and discretionary capital.

The separation matters. Mixing bot and human in the same account causes psychological interference. Two accounts (or two sub-accounts) keeps the mechanical edge clean.

## Mistakes to avoid

- **Constant overrides.** Erodes the edge; defeats the purpose.
- **No override capability at all.** A bot that can't be stopped is dangerous in genuinely new situations.
- **Mixing bot capital and manual trades.** Psychological contamination of both.
- **Not logging interventions.** Can't measure whether you're helping or hurting.
- **Treating discretionary insights as one-offs.** If a pattern repeats, codify it.

## Summary

- Mechanical: emotion-free, backtestable, 24/7.
- Discretionary override: necessary safety, often misused.
- Mode 1 (autonomous + kill switch) is the retail goal.
- Log every override; review monthly.
- Codify repeated overrides as rules.
- Keep bot capital separate from discretionary capital.

Next module: backtesting honestly.
