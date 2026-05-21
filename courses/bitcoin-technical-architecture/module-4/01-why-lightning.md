---
module: 4
position: 1
title: "Why Lightning exists"
objective: "Understand the motivation for Bitcoin's L2."
estimated_minutes: 5
---

# Why Lightning exists

## L1 scaling limits

Bitcoin L1:
- ~7 transactions per second.
- ~10 min block time.
- Fees $0.50-$50+ during congestion.

Not viable for coffee purchases or microtransactions.

For: the problem.

## Lightning's proposal

Joseph Poon + Thaddeus Dryja, 2015 whitepaper. Idea: settle transactions off-chain via payment channels; only commit to L1 when opening/closing.

Result:
- Near-instant payments.
- Fees: 1 sat or fractional sats.
- Throughput: millions of TPS theoretically.

For: scaling thesis.

## What you can do on Lightning

- Send any amount (1 sat to ~5 BTC per payment).
- Pay merchants accepting Lightning (Strike, Cash App, Bitfinex, etc.).
- Run Lightning Address (lightning@domain.com).
- Stream sats (e.g., Podcasting 2.0).
- Micropayments (per-API-call, per-second of video).

For: practical capabilities.

## Lightning Network size (2026)

- ~5,000 BTC capacity public network.
- ~15,000+ nodes.
- Major hubs: Bitfinex, Strike, Wallet of Satoshi, ACINQ.
- $400M+ TVL.

Growing but small vs. L1.

For: scale context.

## Trade-offs

Lightning vs. L1:
- **Pros.** Instant, cheap, private, scalable.
- **Cons.** Need online liquidity, channels can fail, less decentralized.

Online requirement: must run node (or use custodial wallet).

For: when to use.

## Custodial vs. self-custody

| | Custodial | Non-custodial |
|--|-----------|----------------|
| Setup | 1 click | Run node |
| Fund safety | Trust provider | You hold |
| Examples | Wallet of Satoshi, Cash App | Phoenix, Breez, Zeus, raspiblitz |

Custodial = onboarding ease. Non-custodial = true Lightning ethos.

For: user spectrum.

## Lightning Address

Like email:
```
alice@strike.me
$alice (via Cash App-style)
```

Resolves to Lightning invoice. Standard via LNURL-pay.

For: human-friendly payments.

## BOLT specs

Lightning protocol specs: BOLT 1-12.
- BOLT 2: Channel management.
- BOLT 3: Tx format.
- BOLT 4: Onion routing.
- BOLT 11: Invoice format.
- BOLT 12: Offers (reusable).

For: protocol depth.

## Major implementations

- **LND.** Lightning Labs; most popular; written in Go.
- **Core Lightning (CLN).** Blockstream; written in C; modular.
- **Eclair.** ACINQ; written in Scala; powers Phoenix mobile.
- **LDK.** Rust library; embed in your own app.

For: software choice.

## Common use cases

1. **Tipping.** Streamers, podcasters, content creators.
2. **Remittances.** Strike powers El Salvador remittance.
3. **Gaming.** Earn small sats per action.
4. **Streaming media.** Per-second payment.
5. **API monetization.** Per-call micropayment.

For: real-world adoption.

## Mistakes to avoid

- **Custodial = your Bitcoin if hacked.** "Not your keys."
- **No backup of channel state.** Lose channel funds.
- **Running on weak hardware.** Channels fail.

## Summary

- Lightning = Bitcoin L2 via payment channels.
- Near-instant, cheap (sub-cent fees), scalable.
- Custodial easy; non-custodial truer to ethos.
- BOLT specs + LND/CLN/Eclair/LDK implementations.

Next: payment channels detail.
