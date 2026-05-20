---
module: 5
position: 1
title: "Position sizing and risk management"
objective: "How big to bet so one bad streak doesn't end the bot."
estimated_minutes: 7
---

# Position sizing and risk management

## Why sizing is the most important decision

A great strategy with bad sizing loses money. A mediocre strategy with great sizing makes money. The math:

- Lose 50% of capital → need 100% gain to break even.
- Lose 80% → need 400% gain.
- Lose 90% → need 900%.

The asymmetry is brutal. Surviving drawdowns is the prerequisite for compounding.

Position sizing controls how much you can lose per trade and per drawdown. Get it right and you stay in the game; get it wrong and the math kills you no matter how good your edges are.

## Fixed fractional sizing

Most common approach: risk a fixed percentage of equity per trade.

```python
def fixed_risk_size(equity, risk_pct, entry, stop):
    risk_per_share = abs(entry - stop)
    risk_budget = equity * risk_pct
    return int(risk_budget / risk_per_share)
```

For $100K equity, 1% risk, entry at $200, stop at $190:

```
risk_per_share = $10
risk_budget = $1,000
shares = 100
position_value = $20,000
```

If stop hits: lose $1,000 = 1% of equity. If risk_pct = 0.01, you'd need 100 consecutive max losses to wipe out.

**Standard retail risk:** 0.5% - 2% per trade. Aggressive: 5%. Beyond 5% is gambling.

## Why 1-2% is the sweet spot

Math says: at 1% risk per trade with a real +EV edge, you can take 20+ consecutive losses without serious drawdown. At 5%, 10 consecutive losses ruin you. At 10%, 5 losses do it.

Even +EV strategies have streaks. A 60% win-rate strategy hits 10 consecutive losses about once per 10,000 trades. Over years, you'll see one. Survival requires sizing that handles the streak.

## The Kelly criterion

Theoretical optimum sizing for known-edge strategies:

```
f = (bp - q) / b

where:
  b = win/loss ratio
  p = probability of win
  q = 1 - p (probability of loss)
```

For p = 0.55, b = 1.5:

```
f = (1.5 × 0.55 − 0.45) / 1.5 = 0.25
```

Bet 25% of equity per trade. Maximizes long-run geometric growth.

**Problem:** Kelly assumes you know your edge precisely. Real edges are estimated with uncertainty; using full Kelly with uncertain edges leads to ruinous drawdowns.

**Practical adjustment:** "fractional Kelly" — use 1/4 or 1/2 of computed Kelly. So for the above, 6-12% per trade. Still aggressive; most retail sticks closer to 1-2% fixed risk regardless.

## Portfolio-level risk

Per-trade risk isn't enough. You also need:

- **Per-symbol cap.** Max % of equity in any one name (e.g., 10%).
- **Per-sector cap.** Don't go 50% tech (e.g., 25% per sector).
- **Per-strategy cap.** If you run multiple strategies, cap each (e.g., 33% to any single strategy).
- **Aggregate gross exposure.** Total long + short position value cap (e.g., 150% of equity).
- **Aggregate net exposure.** Long minus short (for market-neutral, target 0%).

```python
class RiskManager:
    def can_open(self, symbol, side, qty, price):
        position_value = qty * price
        new_total = self.current_exposure + position_value
        new_symbol = self.position(symbol) + position_value
        new_sector = self.sector_exposure(get_sector(symbol)) + position_value
        
        if new_total > self.equity * self.max_gross:
            return False, 'gross exposure limit'
        if new_symbol > self.equity * self.max_per_symbol:
            return False, 'symbol limit'
        if new_sector > self.equity * self.max_per_sector:
            return False, 'sector limit'
        
        return True, None
```

The risk manager is a gate every new order passes through.

## Drawdown response

Even with good sizing, drawdowns happen. Pre-decide your response:

- **At 5% drawdown:** Audit recent trades; verify no bug.
- **At 10% drawdown:** Cut size by 50%.
- **At 15% drawdown:** Pause new entries; let positions decay.
- **At 20% drawdown:** Flatten everything; halt strategy.

Specific numbers depend on strategy and risk tolerance. The point: have a rule before the drawdown, not during. In the moment, you'll be too biased to choose well.

## Sector and correlation diversification

Two strategies on uncorrelated assets compound much faster than two on correlated assets. Math:

- Two strategies each at 1.0 Sharpe, fully uncorrelated → combined Sharpe ~1.4.
- Two strategies at 1.0 Sharpe, fully correlated → combined Sharpe ~1.0.

True diversification — different signal families, different asset classes, different regimes — is the highest-return-per-unit-of-risk move available.

A typical retail diversification:

- 1 trend strategy on equity futures (long/short).
- 1 mean-reversion on liquid US large caps.
- 1 stat-arb on cointegrated pairs.
- 1 event-driven (earnings drift).

Together: a portfolio whose performance smooths individual strategy drawdowns.

## Leverage

Some bots use leverage to amplify returns:

- **Margin:** broker lends you money. ~50% initial margin on stocks (you put up half).
- **Futures:** built-in leverage (5-25× notional depending on contract).
- **Crypto perps:** 10-100× available.

Leverage multiplies returns and losses. A 2× leveraged 10% loss → 20% drawdown. With margin calls and forced liquidations, leverage can wipe you out far faster than unleveraged.

**Rule for retail:** start unleveraged. Add leverage only after a year of clean live performance and only modestly (1.5-2× max). The Sharpe doesn't change with leverage; just the variance does — and variance is what hurts.

## Risk parity

Allocate capital so each strategy contributes equal expected risk:

```python
def risk_parity_weights(strategies):
    inverse_vol = {s: 1 / s.volatility for s in strategies}
    total = sum(inverse_vol.values())
    weights = {s: v / total for s, v in inverse_vol.items()}
    return weights
```

If one strategy has 5% vol and another has 20%, allocate 4× more to the 5% strategy. Each contributes the same dollar variance.

Used in multi-strategy portfolios; not always for single-strategy bots.

## Asymmetric exits

For trend strategies, allow upside but cap downside:

```python
def calculate_exits(entry, atr):
    return {
        'stop': entry - 2 * atr,
        'target': entry + 6 * atr,  # 3:1 reward/risk
    }
```

A 3:1 R:R with a 40% win rate is +EV; a 1:1 R:R with the same win rate isn't. For trend strategies, the math favors letting winners run far past the stop.

For mean reversion, exits are usually symmetric or favor the win side (small win, small loss, lots of trades).

## The portfolio Sharpe goal

For mature multi-strategy setups, target portfolio Sharpe ~1.5-2.0. Individual strategies might be 0.8-1.2; diversification combines them.

If your portfolio Sharpe is below 1.0 over a year of paper or live, the strategies are too correlated or the per-strategy edges too weak. Add diversification or improve edges.

## Mistakes to avoid

- **Sizing for upside.** Backtest looks great → bet bigger. Wrong direction.
- **No correlation awareness.** "10 different strategies" all driven by SPX = 1 strategy.
- **Leverage without competence.** Compounds losses.
- **No drawdown response plan.** Decide what 15% drawdown means before it happens.
- **Inconsistent risk per trade.** $500 here, $5000 there — bad math.

## Summary

- Risk 0.5-2% per trade as default; 5% is aggressive; beyond is gambling.
- Kelly is theoretical max; use fractional Kelly to handle uncertainty.
- Risk managers check per-symbol, per-sector, per-strategy, gross exposure.
- Pre-decide drawdown response: cut size at 10%, pause at 15%, flatten at 20%.
- Diversify across strategies and asset classes for portfolio Sharpe lift.
- Leverage cautiously, after live track record.

Next: kill switches and circuit breakers.
