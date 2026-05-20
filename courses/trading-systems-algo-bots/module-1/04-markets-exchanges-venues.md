---
module: 1
position: 4
title: "Markets, exchanges, and venues"
objective: "Know where your orders actually go."
estimated_minutes: 6
---

# Markets, exchanges, and venues

## The fragmentation problem

Most retail traders imagine one big "stock market". The reality: US equities trade across ~13 exchanges and ~50 dark pools and alternative trading systems (ATSs). Your broker decides where to route each order.

This matters because:

- Different venues have different liquidity and fees.
- "Best execution" depends on real-time routing decisions.
- Some venues offer rebates; others charge.
- Your broker's routing can favor their economics over yours.

For most bots, you don't directly control routing — but understanding what's happening tells you why fills look the way they do.

## Major US equity exchanges

The biggest:

- **NYSE.** Big-cap stocks listed here (Berkshire, J&J, Coca-Cola).
- **Nasdaq.** Tech-heavy (Apple, Microsoft, Google).
- **Cboe (BATS).** High-volume venue; runs four exchanges (BYX, BZX, EDGA, EDGX).
- **IEX.** "Investors Exchange" — slows down quote responses by 350 microseconds via a "speed bump" to make HFT harder.

Each exchange has its own fee schedule, hours, and matching rules. Brokers route based on Regulation NMS rules (best displayed price wins, more or less).

## Dark pools and ATSs

Off-exchange venues — trades happen privately, then print to a public tape.

- **UBS ATS, JPM-X, Goldman Sigma X.** Big bank pools.
- **Liquidnet, Instinet.** Block trading venues.
- **Citadel Connect, Virtu MatchIt.** Wholesaler pools.

For institutional orders, dark pools reduce market impact. For retail, they're often where your order ends up because brokers route to wholesalers (Citadel Securities, Virtu) for "payment for order flow."

## Payment for order flow (PFOF)

Many retail brokers (Robinhood, Webull, parts of TD/Schwab) sell their order flow to wholesalers in exchange for rebates. The wholesaler internalizes trades — fills you off-exchange at the National Best Bid/Offer (NBBO) or slightly better, profiting from the spread.

Implications:

- "Free" commissions are subsidized by PFOF.
- Fills are typically at or near NBBO — fine for casual trading.
- For algorithms, can mean slightly worse execution than direct exchange routing.
- For options, PFOF can mean meaningful give-up vs direct.

Interactive Brokers Pro is the main alternative — no PFOF, but you pay commissions.

## NBBO

The "National Best Bid and Offer" — the best bid and best ask across all exchanges, calculated by the SIP (Securities Information Processor). Brokers must execute at NBBO or better (Reg NMS rules).

For most retail trades, your fill is at NBBO — that's the regulatory floor. Pro traders try to capture better fills (price improvement, mid-spread fills via dark pool).

## Pre-market and after-hours

US equities trade:

- **Regular hours.** 9:30 AM - 4:00 PM ET.
- **Pre-market.** 4:00 AM - 9:30 AM ET (varies by broker).
- **After-hours.** 4:00 PM - 8:00 PM ET (varies).

Extended hours are thinner — wider spreads, less depth, sometimes wildly different prices than regular hours. Most bots restrict to regular hours.

For news-driven strategies, extended hours can be where the move happens — but tread carefully.

## Auction periods

Two special events daily:

- **Opening auction (9:30 AM).** Orders accumulate before open; they all match at one clearing price.
- **Closing auction (4:00 PM).** Same but at close. Often the largest single liquidity event of the day.

Index rebalances and large institutional flow concentrate at the close. The closing auction can move prices significantly. Some bots specifically target this window.

## Futures markets

A different beast:

- Traded on dedicated futures exchanges (CME, CBOT, NYMEX, ICE).
- Centralized — one exchange per contract; no fragmentation.
- Margin-based: you put up a fraction of contract value.
- 23/5 trading (Sunday evening to Friday afternoon, with daily breaks).

E-mini S&P 500 (/ES), crude oil (/CL), gold (/GC), bitcoin (/BTC) — all futures. Standardized contracts, deep liquidity, lower per-dollar margin than stocks.

For algo trading, futures have advantages: cleaner data, no PFOF, more transparent execution. Tax treatment in US is also favorable (60/40 long-term/short-term).

## Options markets

US options trade on ~16 exchanges (CBOE, AMEX, ARCA, ISE, etc.).

- Quotes update across all venues; NBBO applies.
- Spreads are wider than stocks (often $0.05-0.50 even on liquid options).
- PFOF is common.
- Multi-leg orders (spreads, condors) execute as a unit at most venues.

Options-trading bots need different infrastructure than equity bots — Greeks, IV, multi-leg complexity. Most retail algo trading is equities/futures/crypto first.

## Crypto venues

Crypto is the wild west:

- **Centralized exchanges (CEXs).** Coinbase, Binance, Kraken, Bybit. Each has its own order book per pair; no NBBO equivalent. Prices can differ across exchanges (arbitrage opportunities exist).
- **Decentralized exchanges (DEXs).** Uniswap, dYdX, Hyperliquid. On-chain order books or AMMs (automated market makers).
- **Perpetuals.** Bybit, Binance Futures, dYdX, Hyperliquid. Leveraged, fund-rate-paid every 8 hours.

Different exchange = different price = different fees = different latency. Crypto bots juggle all of these.

## FX markets

Decentralized — no central exchange. OTC market with banks, brokers, ECNs.

For retail: OANDA, Interactive Brokers FX, dukascopy. Spreads vary widely; no PFOF but variable commissions.

24/5 trading (Sunday evening to Friday evening). Tight spreads on majors (EUR/USD, USD/JPY). Wider on crosses (AUD/CAD).

## What your bot picks

For most retail algo traders:

- **Equities.** Alpaca (PFOF-based, $0 commission) for simplicity; IBKR Pro for execution quality.
- **Futures.** IBKR, Tradovate, NinjaTrader.
- **Options.** IBKR, Tastytrade.
- **Crypto.** Coinbase Advanced, Kraken, Bybit, Hyperliquid (DEX).
- **FX.** OANDA, IBKR.

Your strategy and capital determine the choice. Most courses use Alpaca for examples (free, simple API) and switch to IBKR when execution starts to matter.

## Latency hierarchy

Latency-sensitive strategies care:

- **Co-located server at exchange.** 100 microseconds. HFT only.
- **Same-city cloud (AWS NY for NYSE).** 5-20 ms.
- **Same-region cloud.** 30-100 ms.
- **Home broadband.** 100-500 ms.

Most retail bots run on home broadband or cheap VPS. That's fine for strategies holding minutes-to-days. For sub-second strategies, you need real infrastructure.

## Mistakes to avoid

- **Assuming "the market" is one place.** Fragmentation affects fills.
- **Not knowing your broker's routing.** Some sell flow worse than others.
- **Trading thin extended-hours moves.** Spreads + slippage destroy edges.
- **Crypto without considering exchange risk.** Counterparty failures happen (FTX, etc.).
- **Sub-second strategies on home internet.** Latency mismatch kills them.

## Summary

- US equities trade across ~13 exchanges + dark pools; brokers route.
- PFOF subsidizes retail commissions; trade-off is execution quality.
- NBBO is the floor; pro brokers try to improve on it.
- Futures and crypto have their own venue structures.
- Latency matters for fast strategies; not for slow ones.

Next module: connecting your bot to a broker.
