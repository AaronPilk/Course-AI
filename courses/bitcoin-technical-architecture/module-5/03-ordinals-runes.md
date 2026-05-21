---
module: 5
position: 3
title: "Ordinals, Runes, Inscriptions"
objective: "Understand Bitcoin's new asset layers."
estimated_minutes: 5
---

# Ordinals, Runes, Inscriptions

## What Ordinals are

Casey Rodarmor, Jan 2023. Numbering scheme for individual satoshis. Each sat = uniquely identifiable based on mining order.

By "inscribing" data on a specific sat, you create an NFT-like artifact on Bitcoin L1.

For: NFTs on Bitcoin.

## How inscriptions work

```
1. Reveal tx commits data on-chain.
2. Inscription = file (image, text, audio) embedded in witness data.
3. Tied to specific sat via Ordinal theory.
4. Transferable like any UTXO.
```

Uses Taproot witness data; no protocol change required.

For: ingenious on-chain data store.

## File sizes

- Max single inscription: ~4 MB (block size limit).
- Cost: ~1-5 sat/byte. A 100KB image: ~$5-50 in fees.
- Stored on-chain permanently.

For: economics.

## Impact on Bitcoin

Positive:
- Fees rose; miners earn more.
- Showed BTC could host culture.
- Brought interest from non-financial users.

Negative:
- Block space congestion.
- Some Bitcoiners see as "spam."
- Pushed regular tx fees higher.

For: contentious topic.

## BRC-20 tokens

Domo (March 2023). Token standard via inscriptions:
```
Inscribe JSON: {"p":"brc-20","op":"mint","tick":"ORDI","amt":"1000"}
```

Off-chain indexers track balances. Not natively supported by Bitcoin; entirely social convention.

Top BRC-20: ORDI, SATS. Speculative; volatile.

For: token experimentation.

## Runes protocol

Casey Rodarmor (creator of Ordinals) released Runes April 2024.

Improvements over BRC-20:
- UTXO-based (more Bitcoin-native).
- Uses OP_RETURN; doesn't bloat witness.
- Cheaper, more efficient.

Designed to replace BRC-20.

For: evolving tokens.

## Stacks, RSK, Liquid

Bitcoin-adjacent chains:
- **Stacks.** Smart contract layer secured by Bitcoin.
- **RSK.** EVM-compatible sidechain.
- **Liquid.** Federated sidechain by Blockstream.

Each makes Bitcoin programmable in different ways.

For: alternative paths.

## Drivechain (BIP-300)

Proposed: smart contract execution on sidechains, secured by miner attestation. Disputed in community.

For: future possibility.

## Layered approach

Bitcoin tech stack:
- L1: Bitcoin Core.
- L2: Lightning (payments), Stacks (smart contracts).
- L3: Apps on top of L2.

Specialization by layer; like Internet stack.

For: layered scaling.

## Inscription marketplaces

Trade Ordinals:
- Magic Eden.
- OKX Web3.
- Gamma.io.
- Ordswap.

Trading volume varies wildly. Concentrated in BTC-native users.

For: marketplace ecosystem.

## Long-term outlook

Open questions:
- Are inscriptions sustained or fad?
- Does BRC-20 / Runes ecosystem grow?
- Will Bitcoin Core devs implement any of this?

Active debate; uncertain trajectory.

For: balanced view.

## Cultural Ordinals

Beyond speculation:
- Genuine art (1.5M+ inscriptions).
- Historical records.
- Recursive inscriptions (one references another).
- Sat numbering (rare sats like "epic" - first sat of halving).

Artistic + cultural use case.

For: art on Bitcoin.

## Cryptocurrency vs. asset platform debate

Bitcoiner camps:
- **Maximalist purists.** "Bitcoin is digital cash; Ordinals = spam."
- **Cultural maximalists.** "Anything that adds value to BTC is good."
- **Pragmatists.** "Let market decide; high fees → more security."

No resolution; ongoing tension.

For: community dynamics.

## Mistakes to avoid

- **Trading BRC-20 without understanding.** Highly speculative.
- **Inscribing copyrighted material.** Same legal issues as digital art.
- **Assuming inscriptions are pure profit.** Volatile; many lose money.

## Summary

- Ordinals (Jan 2023): NFTs on Bitcoin via inscription.
- BRC-20: tokens via inscription JSON; not native.
- Runes (Apr 2024): UTXO-based tokens, more efficient.
- Pushed fees up; controversial in community.
- Bitcoin-adjacent chains (Stacks, RSK) add programmability.

Next: privacy + regulation.
