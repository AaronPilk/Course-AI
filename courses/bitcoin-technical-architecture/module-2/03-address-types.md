---
module: 2
position: 3
title: "P2PKH, P2SH, SegWit, Taproot"
objective: "Recognize and use Bitcoin's address types."
estimated_minutes: 5
---

# P2PKH, P2SH, SegWit, Taproot

## P2PKH (Legacy)

Pay-to-PubKey-Hash. Original format:
```
Address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa (starts with 1)
scriptPubKey: OP_DUP OP_HASH160 <hash> OP_EQUALVERIFY OP_CHECKSIG
```

- Largest tx size (no SegWit discount).
- Compatible everywhere.
- Common pre-2017.

For: legacy compatibility.

## P2SH (Pay-to-Script-Hash)

Address starts with `3`:
```
Address: 3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy
scriptPubKey: OP_HASH160 <scriptHash> OP_EQUAL
```

Hash of a redeem script. Spender reveals script + provides unlocking data.

Common uses:
- Multi-sig (most common in pre-SegWit era).
- Custom scripts wrapped for compatibility.

For: complex scripts behind standard address.

## SegWit (P2WPKH, P2WSH)

BIP141 activated 2017. Witness data separated from main tx → reduces tx size (75% weight for witness data).

Addresses start with `bc1q`:
```
bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq
```

P2WPKH = SegWit equivalent of P2PKH.
P2WSH = SegWit equivalent of P2SH.

Benefits:
- Lower fees (75% witness discount).
- Tx malleability fixed.
- Enables Lightning Network.

For: cheaper modern transactions.

## SegWit nested (P2SH-P2WPKH)

Some old wallets only sent to P2SH addresses. Workaround:
```
Address: 3... (P2SH wrapper)
Script: P2WPKH inside P2SH
```

Compatible with old senders; gets SegWit benefits on spend.

For: gradual migration.

## Taproot (P2TR)

BIP340/341/342, activated Nov 2021. Addresses start with `bc1p`:
```
bc1p... (longer; bech32m encoding)
```

Benefits:
- Schnorr signatures (smaller; aggregatable).
- All Taproot outputs look identical on-chain (privacy).
- Complex spending conditions hidden until used.

For: privacy + efficiency.

## Schnorr signatures

ECDSA: each signature ~71 bytes; not aggregatable.
Schnorr: each signature 64 bytes; aggregatable!

Multi-sig with Schnorr (MuSig2):
- N parties combine to one signature.
- On-chain looks identical to single-sig.
- 90%+ size savings vs. raw multi-sig.

For: scalability + privacy.

## MAST (Merklized Alternative Script Tree)

Taproot supports script trees:
- Multiple spending conditions in a script tree.
- Reveal only the one used.

Example: "spend if A signs after 1 year" OR "spend with multisig today" — only the executed branch is revealed.

For: hidden complexity.

## Address comparison

| | Length | Starts | Tx size | Adoption |
|--|--------|--------|---------|----------|
| P2PKH | 34 | 1 | Largest | Universal |
| P2SH | 34 | 3 | Large | Universal |
| P2WPKH | 42 | bc1q | Medium | Modern wallets |
| P2WSH | 62 | bc1q | Medium | Modern wallets |
| P2TR | 62 | bc1p | Smallest | Growing 2022+ |

For: choice guidance.

## Why use which

- **P2PKH.** Exchanges with old infra; usually withdraw to.
- **P2WPKH (bc1q).** Default for modern wallets; cheap + supported.
- **P2WSH (bc1q).** Modern multisig.
- **P2TR (bc1p).** Best privacy + cheapest; not 100% supported yet by some exchanges.

For: practical choice.

## Sending between types

All types interoperate. Modern wallet receives any format.

Old wallets may not send to bech32 addresses. Send via different intermediate if necessary.

For: legacy compatibility.

## Tx size savings

| Address type | Typical tx size | Fee at 30 sat/vB |
|--|----------------|--------------------|
| P2PKH | 226 vB | 6,780 sats |
| P2WPKH | 141 vB | 4,230 sats |
| P2TR | 111 vB | 3,330 sats |

50%+ savings from P2PKH → Taproot.

For: economic motivation.

## Mistakes to avoid

- **Sending Taproot from old exchange.** Some don't support; ATH.
- **Confusing bc1q / bc1p.** Different formats; non-interchangeable.
- **Address reuse.** Privacy leak across all types.

## Summary

- P2PKH: legacy `1...`; largest.
- P2SH: `3...`; commonly multisig.
- SegWit P2WPKH / P2WSH: `bc1q...`; 25% smaller.
- Taproot P2TR: `bc1p...`; smallest; best privacy; Schnorr.

Next: fees + mempool.
