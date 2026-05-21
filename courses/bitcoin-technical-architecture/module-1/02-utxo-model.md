---
module: 1
position: 2
title: "UTXO model and addresses"
objective: "Understand Bitcoin's stateless transaction model."
estimated_minutes: 5
---

# UTXO model and addresses

## What UTXOs are

UTXO = Unspent Transaction Output. Bitcoin doesn't track account balances. Instead:
- Every payment creates outputs (chunks of BTC).
- To spend, reference outputs as inputs.
- Outputs get consumed; new outputs created.

A "wallet balance" = sum of UTXOs you can spend.

For: mental model contrasting with account-based chains.

## Example flow

```
Tx 1: Mining reward → Alice's address (10 BTC) → creates UTXO #A
Tx 2: Alice pays Bob 3 BTC:
  Inputs:  UTXO #A (10 BTC, owned by Alice)
  Outputs: UTXO #B (3 BTC to Bob)
           UTXO #C (6.9 BTC change back to Alice, 0.1 BTC fee implicit)

Now: UTXO #A spent (consumed)
     UTXO #B owned by Bob
     UTXO #C owned by Alice (change)
```

For: stateless transaction.

## UTXO properties

- **Atomic.** Either all inputs spent + all outputs created, or nothing.
- **Locked by script.** Each output has a script specifying spending conditions.
- **Indivisible while unspent.** Can only consume whole UTXOs.
- **Sat-divisible internally.** 1 BTC = 100,000,000 satoshis.

For: granular conditions.

## Addresses

Bitcoin addresses are encoded forms of:
- Public key hash (P2PKH).
- Script hash (P2SH).
- Witness program (SegWit).
- Taproot output (P2TR).

Examples:
```
P2PKH:  1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa  (legacy)
P2SH:   3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy  (multi-sig common)
Bech32: bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq  (SegWit)
Taproot: bc1p... (newer; default in modern wallets)
```

For: address format identification.

## Address derivation

```
Private key (256 bits, random)
    ↓ ECDSA / Schnorr
Public key
    ↓ Hash (SHA-256 + RIPEMD-160)
Public key hash
    ↓ Encode (Base58Check or Bech32)
Address
```

One-way: address can't reveal pubkey (until you spend).

For: cryptographic chain.

## HD wallets (BIP32 / BIP44)

```
Master seed (12-24 word mnemonic)
    ↓ Hierarchical Deterministic derivation
Master private key
    ↓ Path: m/44'/0'/0'/0/0
Child key 0 → Address 0
    ↓ ... m/44'/0'/0'/0/1
Child key 1 → Address 1
```

One seed → millions of addresses. Backup mnemonic = backup everything.

For: practical key management.

## Mnemonic (BIP39)

12 or 24 words from 2048-word list. Encodes random entropy.

```
witch collapse practice feed shame open despair creek road again ice least
```

24 words: 256-bit entropy; 12 words: 128-bit (still secure).

For: human-readable backup.

## Coin selection

When spending, wallet picks which UTXOs to use:
- **Largest first.** Simple; bad privacy.
- **Branch and bound.** Optimal change minimization.
- **Random.** Avoid privacy linkage.
- **Coin control.** User picks manually.

Tradeoffs: fees, privacy, dust amounts.

For: wallet implementation detail.

## Dust

UTXOs smaller than ~546 sats can't be spent profitably (fee > value). Wallets sometimes reject sending such amounts.

Known as "dust outputs."

For: handling small UTXOs.

## Privacy implications

Each UTXO traceable:
- Input → output → input → output graph publicly visible.
- Address reuse links txs.
- Change outputs link to original sender.
- Chain analysis firms map this.

Mitigations: CoinJoin, separate wallets per use case.

For: privacy awareness.

## Account-based vs. UTXO

| | Bitcoin (UTXO) | Ethereum (Account) |
|--|----------------|---------------------|
| Balance | Sum of UTXOs | Direct mapping |
| Parallelizable | Yes (different UTXOs) | Limited |
| Privacy | Better (separable) | Worse (single address) |
| Smart contract complexity | Limited | Full |
| State size | Bigger (per UTXO) | Smaller (per account) |

For: design tradeoff understanding.

## Multisig UTXOs

```
Output: "Spend if 2 of 3 signatures from [Alice, Bob, Carol]"
```

Common: 2-of-3 multisig for cold storage.

P2SH or P2WSH typically wrap multisig scripts.

For: shared custody.

## Time-locked UTXOs

```
Output: "Spend after block N" or "Spend after time T"
```

Implemented via CLTV (CheckLockTimeVerify) or CSV (CheckSequenceVerify).

Used for: inheritance, vesting, Lightning channels.

For: programmable bitcoin.

## Mistakes to avoid

- **Reusing addresses.** Privacy leak.
- **Losing mnemonic.** Funds lost forever; no recovery.
- **Sending to wrong format.** Most modern wallets handle; some old ones don't.
- **Custody by exchange.** "Not your keys, not your coins."

## Summary

- UTXO = Unspent Transaction Output; Bitcoin's state model.
- Wallet balance = sum of spendable UTXOs.
- Addresses encode pubkey/script hash (P2PKH, P2SH, SegWit, Taproot).
- HD wallets from mnemonic; backup the seed.
- Each UTXO can have custom spending conditions (multisig, time-locks).

Next: Proof of Work + mining.
