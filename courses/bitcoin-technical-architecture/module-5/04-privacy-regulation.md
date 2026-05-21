---
module: 5
position: 4
title: "Privacy: CoinJoin, mixers, regulation"
objective: "Navigate Bitcoin privacy and regulation reality."
estimated_minutes: 5
---

# Privacy: CoinJoin, mixers, regulation

## Bitcoin privacy default

Bitcoin is pseudonymous, not anonymous:
- Every tx publicly visible forever.
- Addresses can be linked across txs.
- Chain analysis firms (Chainalysis, Elliptic, TRM) map identities.
- Exchanges report user data to governments.

For: setting baseline.

## How addresses get linked

- Address reuse.
- Change outputs (one input → 2 outputs; one is change).
- Common-input heuristic (all inputs to one tx assumed same owner).
- IP leak (running node from home).
- Exchange KYC connecting all withdrawals.

For: surveillance avenues.

## CoinJoin

Multiple users combine UTXOs in single tx:
```
Input: 1 BTC from Alice
Input: 1 BTC from Bob
Input: 1 BTC from Carol
Output: 1 BTC to Alice (different addr)
Output: 1 BTC to Bob (different addr)
Output: 1 BTC to Carol (different addr)
```

Breaks common-input heuristic. After many rounds, source obscured.

For: privacy enhancement.

## Implementations

- **Wasabi Wallet.** Wallet with CoinJoin (Whirlpool / Wasabi 2.0).
- **JoinMarket.** Earn fee by participating in others' CoinJoins.
- **Samourai (deprecated).** Whirlpool variant.
- **Sparrow + ZkSnacks.** CoinJoin coordination.

CoinJoin is legal in most jurisdictions, but increasingly scrutinized.

For: practical tools.

## CoinJoin limitations

- Costs fees + time.
- Some exchanges flag CoinJoined coins.
- Cross-input analysis can still identify patterns.
- Not perfect anonymity.

For: realistic expectations.

## Mixers (custodial)

Send to service; receive different coins. Like a tumbler.

Problem: most have been sanctioned:
- **Tornado Cash** (Ethereum) sanctioned 2022.
- **Blender.io / ChipMixer** seized.
- **Samourai Whirlpool** dev arrests 2024.

Risk: funds frozen, you sanctioned.

For: avoiding pitfalls.

## Tor + node privacy

Run Bitcoin Core over Tor:
```ini
proxy=127.0.0.1:9050
onlynet=onion
```

Hides operator IP. Most queries through .onion peers.

For: network-level privacy.

## Wallet privacy

Wallet leaks to ISP / VPN / wallet server:
- Address queries.
- Tx submissions.
- IP correlations.

Solutions:
- Own node + wallet pointed at own node.
- Tor in wallet (some support).

For: privacy stack.

## KYC / AML regulation

Most exchanges require:
- Government ID.
- Selfie + liveness check.
- Source of funds.
- Tax reporting (1099 in US).

Non-KYC sources:
- P2P (LocalBitcoins replaced by Hodl Hodl, Bisq).
- Bitcoin ATMs (with limits).
- Mining (you mine = you have BTC).

For: KYC vs. permissionless.

## Travel Rule

FATF requires exchanges to share user info on transfers >$1k between exchanges. Increases surveillance.

For: regulatory trend.

## Privacy + legal

Privacy is legal; obscuring criminal proceeds is not.

For most users:
- Hold BTC privately (no obligation to disclose holdings).
- Pay taxes on realized gains.
- Don't actively launder.

Consult lawyer for jurisdiction-specific.

For: keeping legal.

## Future privacy: research

- **CoinSwap.** Anonymous channel-based swaps.
- **PayJoin / P2EP.** Sender + receiver combine inputs.
- **Confidential transactions.** Hide amounts (used in Liquid).
- **Schnorr aggregation.** Multi-sig looks like single-sig.

Active development.

For: privacy roadmap.

## Realistic privacy strategy

For most users:
1. Don't reuse addresses.
2. Use new wallet for each major purpose.
3. Run own node (over Tor).
4. Consider CoinJoin before high-stakes movements.
5. Hold long-term off exchange.

For: practical playbook.

## Audits + reporting

Exchanges report to:
- IRS (US).
- HMRC (UK).
- Tax authorities globally.

Track:
- Cost basis (when you bought).
- Realized gains.
- Tax form requirements.

Tools: Koinly, CoinTracker, Cointelli.

For: tax compliance.

## Privacy tradeoffs summary

| | Convenience | Privacy |
|--|--|--|
| Exchange custody | High | None |
| Hardware wallet, KYC source | Medium | Low |
| Hardware wallet, non-KYC | Medium | Medium |
| CoinJoin + own node | Low | High |
| Full anonymity stack | Very low | Very high |

Choose level based on threat model.

For: matching tools to needs.

## Mistakes to avoid

- **Using mixers post-sanction.** Funds frozen + legal risk.
- **Reusing addresses.** Privacy nightmare.
- **Running node from home without Tor.** ISP sees activity.
- **Tax non-disclosure.** Trail leads back via exchange records.

## Summary

- Bitcoin pseudonymous, not anonymous. Chain visible forever.
- CoinJoin breaks common-input heuristic.
- Custodial mixers risky post-sanctions.
- Tor + own node + non-reuse = solid privacy baseline.
- KYC inflows constrain privacy permanently.
- Legal compliance varies by jurisdiction.

That's the course. Next steps: run your own node + explore inscriptions + experiment with Lightning + custody safely.
