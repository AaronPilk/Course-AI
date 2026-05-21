---
module: 1
position: 1
title: "Why Solana exists"
objective: "Understand Solana's design goals and what makes it different."
estimated_minutes: 5
---

# Why Solana exists

## The blockchain trilemma

Every blockchain trades off three properties:
- **Decentralization.** No single point of control.
- **Security.** Resistant to attack.
- **Scalability.** High throughput, low latency.

Most pick two. Bitcoin + Ethereum: decentralization + security; sacrifice scalability (7-15 TPS).

Solana's bet: scale via single-shard high-performance architecture instead of L2 / sharding.

For: understanding Solana's trade-off thesis.

## Throughput claims

Solana claims:
- 65,000 TPS theoretical max.
- 3,000-5,000 TPS typical mainnet.
- 400ms block times.
- < $0.001 transaction fees.

Ethereum L1: 15 TPS, 12s blocks, $5-50 fees.

For: appreciating the scale difference.

## Use cases enabled

- **High-frequency DeFi.** Order book DEXs (Serum, Phoenix); on-chain limit orders.
- **NFT scale.** 1M+ NFT collections; sub-cent mint costs.
- **Consumer apps.** Social, games, payments — fees too high on Ethereum L1.
- **Real-time apps.** 400ms confirmations feel near-instant.

For: identifying where Solana fits.

## What's the catch

Trade-offs:
- **Hardware requirements.** Validators need high-spec machines ($5k+ servers).
- **Fewer validators.** ~2,000 validators vs. Ethereum's 1M+.
- **Network outages.** Several full chain halts since 2021.
- **State growth.** Account model accumulates data fast.
- **Different mental model.** Rust + accounts ≠ Solidity + storage.

For: realistic expectations.

## Solana vs. Ethereum L2

L2s (Arbitrum, Optimism, Base) achieve high throughput by batching to Ethereum:
- Strengths: inherit Ethereum security + EVM compatibility.
- Weaknesses: bridge complexity; 7-day withdrawal periods; sequencer centralization.

Solana monolithic L1:
- Strengths: no bridges; uniform UX; composability across all dapps.
- Weaknesses: single point of consensus failure; harder to upgrade.

For: choosing platform per use case.

## History snapshot

- 2017. Anatoly Yakovenko whitepaper on Proof of History.
- 2018. Solana Labs founded.
- 2020. Mainnet beta launch.
- 2021. ATH price $260; ecosystem boom.
- 2022-2023. FTX collapse damaged ecosystem; rebuild.
- 2024-2026. Recovery; Firedancer client; ecosystem growth.

For: context.

## Solana Labs vs. Solana Foundation

- **Solana Labs.** For-profit; main client engineering.
- **Solana Foundation.** Nonprofit; ecosystem grants + advocacy.
- **Anza, Jump (Firedancer), Helius.** Independent validator client implementations.

For: knowing who builds what.

## Programming model overview

- Programs (smart contracts) are stateless executables.
- State lives in accounts (think: serialized blobs at addresses).
- Programs read / write accounts passed into them.
- Different from Ethereum where contracts hold state.

Implication: you must pass all relevant accounts to a transaction.

For: mental model shift coming.

## Languages

- **Rust.** Native; full power; production choice.
- **Anchor.** Rust framework; safer; faster development.
- **Seahorse.** Python-like syntax (compiles to Rust); learning-friendly.
- **Solana C / C++.** Possible but rare.

Recommendation: learn Rust + Anchor.

For: language selection.

## Solana mobile

Saga + Seeker phones run Solana Mobile Stack — wallet + dApp integration at OS level. Niche but growing.

For: aware of mobile-first plays.

## Ecosystem snapshot

Active sectors:
- DeFi: Jupiter (aggregator), Drift, Kamino, MarginFi.
- NFTs: Magic Eden, Tensor, Metaplex.
- Consumer: Dialect (messaging), Helius (RPC).
- Payments: Solana Pay; Helium / Hivemapper (DePIN).

For: opportunity scan.

## Mistakes to avoid

- **Treating Solana as fast Ethereum.** Different account model + Rust + tooling.
- **Skipping Rust basics.** Solana programs are unforgiving.
- **Ignoring fee variability.** Priority fees during congestion can spike 100×.
- **Assuming 100% uptime.** Plan for chain halts; check status page.

## Summary

- Solana = high-throughput monolithic L1.
- 3-5k TPS typical; 400ms blocks; <$0.001 fees.
- Different model from Ethereum: stateless programs + accounts.
- Trade-offs: high hardware reqs, fewer validators, occasional outages.

Next: Proof of History + consensus.
