---
module: 5
position: 2
title: "51% attacks + MEV"
objective: "Understand Bitcoin's attack vectors."
estimated_minutes: 5
---

# 51% attacks + MEV

## What 51% attack is

Attacker controls >50% of network hash rate. Can:
- Censor specific txs.
- Reorganize recent blocks (double-spend).
- Empty mempool selectively.

Cannot:
- Steal others' coins.
- Change protocol rules (e.g., 21M cap).
- Reverse old transactions (would require trillions more energy).

For: scope of risk.

## Why Bitcoin is safe-ish

To 51% attack Bitcoin needs:
- ~$10B+ in ASIC hardware.
- Or rent equivalent hash power (impossible at scale).
- Energy infrastructure to power it.
- Risk of attacked-vehicle (BTC price tanks; attack worthless).

Economic disincentive massive. Smaller chains (BCH, ETC) have been 51% attacked.

For: realistic risk.

## Selfish mining

Withholding blocks; releases later. Earns proportionally more than fair share.

Theoretical threshold: 25-30%+ hash rate to be profitable.

In practice: rarely seen; honest mining usually pays better long-term.

For: subtle attack.

## Mining centralization

Concerns:
- Top 4 mining pools ~50% (rotates).
- ASIC manufacturers concentrated (Bitmain, MicroBT).
- US (~35%), formerly China.

If one pool grows >50% → could attack. But: pool members can leave; ecosystem alert.

Mitigations: Stratum v2 (miners choose own tx); ASIC competition.

For: structural risk.

## MEV in Bitcoin

Limited vs. Ethereum because no smart contracts. But exists:
- **Tx fee sniping.** Reorganize last block to claim high-fee txs.
- **Ordinals / Inscriptions.** Front-running mints.
- **MEV through Lightning.** Channel-related.

Lower MEV than Ethereum due to UTXO model + limited scripting.

For: nascent area.

## Tx malleability (fixed by SegWit)

Pre-SegWit, txids could be modified by 3rd party signatures without invalidating signature. Broke Lightning Network functionality.

SegWit (2017) separated witness; txids stable. Enabled Lightning.

For: historical context.

## Network spam attacks

- DDoS broadcasting many tiny txs.
- Spent UTXO database bloat.

Mitigations: min relay fee; tx prioritization; rate limiting at node level.

For: defensive maturity.

## Eclipse attacks

Isolate target node from honest network; feed fake chain:
1. Attacker controls all 8 connections to victim node.
2. Sends crafted blocks.
3. Victim sees false chain state.

Mitigations:
- Increase outbound connection count.
- Use Tor.
- Use trusted peers (-addnode).

For: node-level safety.

## Quantum threat

Hypothetical: quantum computer breaks ECDSA.
- ~2030-2040 best estimates (uncertain).
- Bitcoin already partly resistant (P2PKH addresses); Taproot uses Schnorr (still vulnerable).
- Soft fork to post-quantum signatures would be needed.
- Estimated 5+ years to upgrade smoothly.

Active research; not imminent threat as of 2026.

For: long-tail risk.

## Protocol changes

Soft fork: backwards compatible (SegWit, Taproot). Old nodes still validate.
Hard fork: incompatible (BCH split 2017). Old nodes can't accept new blocks.

Bitcoin trend: conservative soft forks only. Ossification approaching.

For: change resistance.

## Sybil attacks

Spam many fake nodes to:
- Eclipse honest nodes.
- Manipulate gossip.

Bitcoin uses IP-based connection diversity + reputation. Tor adds anonymity but complicates Sybil resistance.

For: P2P layer safety.

## Risk hierarchy

Most likely to least likely:
1. Phishing / scams (daily).
2. Lost / stolen keys (weekly).
3. Exchange hacks / bankruptcy (yearly).
4. Software bug exploits (rare).
5. 51% attack on BTC L1 (extremely unlikely).
6. Quantum break (decade+ away).

Focus security on top items.

For: appropriate paranoia.

## Mistakes to avoid

- **Worrying about quantum more than phishing.** Wrong threat model.
- **Trusting "100% secure" anything.** All has tradeoffs.
- **Holding on small chains.** Smaller chains 51% attackable.
- **Custody by entity without insurance.** FTX wasn't insured.

## Summary

- 51% attack possible but economically prohibitive on BTC.
- Smaller chains regularly 51% attacked.
- MEV limited on Bitcoin vs. Ethereum.
- Eclipse attacks at node level; mitigate via Tor + diversity.
- Quantum theoretical; not imminent.
- Real risks: phishing, key loss, exchange failure > protocol attacks.

Next: Ordinals + ecosystem.
