---
module: 5
position: 4
title: "Scaling your trading system"
objective: "From one strategy to a portfolio; from retail to professional."
estimated_minutes: 5
---

# Scaling your trading system

## Single strategy → portfolio

One strategy = single bet on one market regime. A portfolio of uncorrelated strategies smooths returns:

```
Strategy A (trend): works in trends, fails in chop
Strategy B (mean rev): works in chop, fails in trends
Strategy C (breakout): works in transitions
```

Sum ≈ smoother equity curve than any single.

For: lower drawdown; more consistent returns.

## Correlation matrix

Calculate correlation of monthly returns between strategies:

```
            A     B     C
A          1.0  -0.2   0.3
B         -0.2   1.0  -0.1
C          0.3  -0.1   1.0
```

Ideal: < 0.3 between strategies. > 0.7 = essentially same strategy.

For: portfolio diversification.

## Risk budgeting

Allocate capital to strategies by risk, not capital:

```
Strategy A: $5,000 capital allocation, 2% risk per trade
Strategy B: $3,000 capital allocation, 2% risk per trade
Strategy C: $2,000 capital allocation, 2% risk per trade
```

Aggregate daily risk capped: max 5% total exposure across all strategies.

For: prevent compound drawdown.

## Multi-symbol same-strategy

```pinescript
//@version=5
strategy("Multi-symbol via webhook")

// Run separately on each symbol; each fires its own alert
// Endpoint receives + routes
```

Setup: one alert per symbol; same strategy script. 10 symbols × $1k risk each = diversified.

For: scale a working strategy across instruments.

## Symbol selection

Universe construction:
- Liquidity: minimum $10M daily volume for stocks; $100M for crypto.
- Volatility: minimum 1% daily range to provide trades.
- Correlation: not all in same sector / market.
- Trading hours: cover different sessions.

For: viable trading universe.

## Capital scaling

As account grows, position size grows proportionally:

```pinescript
positionSize = strategy.equity * 0.02 / stopDistance
```

Account 10× → position 10× → same % risk. Until:
- Slippage starts mattering (typically at 0.1-1% of average daily volume).
- Liquidity walls hit.

For: scaling limit awareness.

## When slippage becomes a constraint

Rough thresholds where slippage matters:
- Liquid stocks (AAPL, SPY): up to 5% of avg vol = ~$10M.
- Mid-cap stocks: 1-2% of avg vol.
- Crypto majors: 0.5-1% of order book depth.
- Small-cap: 0.5% of avg vol.

Beyond → split orders; use VWAP/TWAP execution.

For: capital ceiling per strategy / symbol.

## Building edge over time

Continuous improvement loop:
1. Track every trade with metadata (regime, size, indicator readings).
2. Quarterly review: what worked? What failed?
3. Hypothesize improvements.
4. Backtest hypothesis in isolation.
5. Out-of-sample test.
6. Paper-trade if validated.
7. Live with reduced size; promote on confirmation.

For: edge maintenance.

## Lessons from quant trading

- 60% of strategy success = research / backtest rigor.
- 30% = execution quality.
- 10% = the "edge" itself.

Most retail focus on "the edge" alone — wrong distribution. Discipline + process matter more.

For: realistic priorities.

## Common career paths

Retail trader → algorithmic retail → prop firm trader → hedge fund → quant fund.

Skills compound:
- Pine fluent → Python / C++ for institutional speed.
- Single-symbol → multi-symbol → multi-strategy → portfolio management.
- Backtest → forward test → live → portfolio with risk management.

For: learning trajectory.

## When to graduate from Pine

Pine is excellent for:
- Strategy ideation + backtest.
- Visual indicators.
- Solo retail trading with webhook automation.

Outgrow Pine when:
- Need sub-second execution (Pine has ~1s alert latency).
- Need order book / Level 2 data.
- Multiple symbols requiring sub-second correlation.
- Heavy historical backtest (>100k bars).

Then: Python (backtrader, vectorbt, NautilusTrader) or C++ for HFT.

For: tool evolution.

## Tax considerations

Tracked metadata for tax season:
- Date, ticker, side, qty, price, P&L per trade.
- 1099-B form from broker.
- Mark-to-market election (US Section 475) for active traders.
- Wash sale rules (US).

Broker provides; reconcile with your strategy log.

For: tax compliance + accuracy.

## Strategy lifecycle

1. **Idea** (days): hypothesis + setup.
2. **Backtest** (weeks): validate historically.
3. **OOS test** (weeks): confirm generalization.
4. **Paper** (months): live data, no risk.
5. **Live micro** (months): real money, tiny size.
6. **Scaled** (months-years): full deployment.
7. **Decay** (eventual): metrics degrade.
8. **Retirement** (single decision): exit cleanly.

For: lifecycle perspective.

## Community + learning

- TradingView Public Library: open Pine scripts; study masters.
- @PineCoders, @Bjorgum on TV: high-quality educational content.
- r/algotrading + quantnet forums.
- Books: "Trading Systems" by Tomasini, "Quantitative Trading" by Ernie Chan.

For: ongoing skill development.

## Realistic expectations

Retail algorithmic trading:
- 10-20% annual returns (with controlled risk) = excellent.
- 30%+ years require taking on more drawdown risk.
- Losing months happen ~30% of the time.
- Survivorship bias: most who try fail.

Successful retail algo trader profile:
- 3+ years of dedicated work.
- 100s of strategy ideas tested; 5-10 live.
- Disciplined risk management above all.
- Treats it as a business, not gambling.

For: grounded expectations.

## Mistakes to avoid

- **Scaling losses.** Add capital after losing → larger losses.
- **Single point of failure.** One strategy, one symbol, one broker = brittle.
- **Skipping research after success.** Best traders constantly improve.
- **Emotion-driven overrides.** Defeats whole point of automation.

## Summary

- Multi-strategy portfolio = lower DD + smoother returns.
- Correlation < 0.3 between strategies = diversified.
- Capital scaling has slippage ceiling per symbol.
- Pine fluent → Python next; community + books for growth.
- Realistic: 10-20% annual at controlled risk = great.

That's the course. Next steps: deploy your first paper-traded strategy.
