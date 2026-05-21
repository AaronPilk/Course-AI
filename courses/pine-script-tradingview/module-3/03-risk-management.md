---
module: 3
position: 3
title: "Risk management"
objective: "Size positions by risk; respect max risk per trade and per day."
estimated_minutes: 5
---

# Risk management

## Risk per trade

Standard rule: risk 1-2% of equity per trade. If $10,000 account → risk $100-$200 per trade.

```pinescript
riskPercent = input.float(1.0, "Risk %") / 100
accountRisk = strategy.equity * riskPercent
```

For: survive losing streaks.

## Position size from risk

```pinescript
entryPrice = close
stopPrice = entryPrice * 0.98       // 2% stop
riskPerShare = entryPrice - stopPrice
positionSize = accountRisk / riskPerShare

strategy.entry("Long", strategy.long, qty=positionSize)
strategy.exit("Stop", from_entry="Long", stop=stopPrice)
```

Fixed dollar risk regardless of stop distance. Smaller positions with wider stops.

For: consistent risk per trade.

## ATR position sizing

```pinescript
atrValue = ta.atr(14)
stopDistance = atrValue * 2.0
positionSize = accountRisk / stopDistance

strategy.entry("Long", strategy.long, qty=positionSize)
strategy.exit("ATR Stop", from_entry="Long", stop=close - stopDistance)
```

For: volatility-adjusted sizing.

## Max risk per trade

```pinescript
maxTradeSize = strategy.equity * 0.1     // Max 10% of equity per trade
positionSize = math.min(positionSize, maxTradeSize / close)
```

For: cap exposure even if math says larger.

## Daily loss limit

```pinescript
var float dayStartEquity = na
var float dailyPnL = na

if ta.change(time("D"))                  // New day
    dayStartEquity := strategy.equity

dailyPnL := strategy.equity - dayStartEquity
maxDailyLoss = -dayStartEquity * 0.03    // 3% daily limit

if dailyPnL < maxDailyLoss
    strategy.close_all()
    // Stop trading for rest of day
```

For: prevent revenge trading; capital preservation.

## Max drawdown stop

```pinescript
var float peakEquity = na
peakEquity := na(peakEquity) ? strategy.equity : math.max(peakEquity, strategy.equity)
drawdown = (peakEquity - strategy.equity) / peakEquity

if drawdown > 0.10                      // 10% drawdown
    strategy.close_all()
    // Halt until manual reset
```

For: circuit breaker for catastrophic drawdown.

## R-multiple framework

R = risk on the trade.
- 1R loss = stop hit.
- 2R win = took profit at 2× risk.

```pinescript
entryPrice = strategy.position_avg_price
stopDistance = math.abs(entryPrice - stopPrice)
rMultiple = math.abs(close - entryPrice) / stopDistance
```

For: thinking in R, not dollars. Strategy expectancy = avg R per trade.

## Expectancy

```
Expectancy = (Win% × Avg Win in R) - (Loss% × Avg Loss in R)
```

Example: 40% win rate × 3R avg win − 60% loss rate × 1R avg loss = 1.2R − 0.6R = 0.6R per trade.

Positive expectancy = profitable over many trades.

For: judge strategy quality.

## Risk-reward minimum

```pinescript
minRR = 2.0                              // Minimum 2:1
takeDistance = stopDistance * minRR
takePrice = close + takeDistance

if takePrice > resistance               // Target beyond resistance? Skip.
    // Don't take trade
```

For: only take trades with positive expected value.

## Correlation risk

If trading multiple instruments, correlated positions = compound risk:
- Tech stocks all crash together.
- USD pairs all move together.

```pinescript
maxCorrelatedPositions = 3              // Limit
```

For: avoid concentrated risk.

## Kelly criterion (advanced)

```
Kelly % = (Win% / AvgLoss) - ((1 - Win%) / AvgWin)
```

Optimal fraction of capital per trade. Usually fractional Kelly (Kelly/4) for safety.

For: theoretical optimum (use cautiously).

## Position sizing for futures

```pinescript
tickValue = syminfo.pointvalue            // $ per point
stopTicks = stopDistance / syminfo.mintick
riskPerContract = stopTicks * tickValue
contracts = math.floor(accountRisk / riskPerContract)
```

For: instrument-specific math.

## Slippage allowance

```pinescript
slippageBuffer = ta.atr(14) * 0.1
stopPrice = entryPrice - stopDistance - slippageBuffer
```

Pad stop to account for execution slippage.

For: realistic stop fills.

## Mistakes to avoid

- **No max daily loss.** One bad day kills account.
- **Position sized by capital not risk.** Wider stops should mean smaller positions.
- **Ignoring correlation.** "Diversified" portfolio is one trade.
- **Increasing size after losses.** Martingale → blowup.

## Summary

- 1-2% risk per trade is industry standard.
- Position size = account risk / stop distance.
- Daily + max drawdown circuit breakers.
- Think in R-multiples; positive expectancy.

Next: backtesting and walk-forward.
