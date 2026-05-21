---
module: 2
position: 1
title: "Transaction structure"
objective: "Decode Bitcoin transactions byte by byte."
estimated_minutes: 5
---

# Transaction structure

## Tx components

```
Version (4 bytes)
Input count (varint)
Inputs[] (variable)
Output count (varint)
Outputs[] (variable)
Locktime (4 bytes)
```

For: serialization format.

## Input fields

```
Previous tx hash (32 bytes)
Output index in that tx (4 bytes)
ScriptSig length (varint)
ScriptSig (signature + redemption script)
Sequence number (4 bytes)
```

Inputs reference UTXOs being spent.

For: spending mechanism.

## Output fields

```
Value (8 bytes, satoshis)
ScriptPubKey length (varint)
ScriptPubKey (locks the output to specific script)
```

Outputs define new UTXOs.

For: spending conditions.

## Transaction ID (txid)

```
txid = SHA256(SHA256(serialized_tx))
```

Unique identifier. Reversed in tools (little-endian → big-endian).

For: transaction reference.

## Witness data (SegWit)

Post-SegWit (2017), signature data lives outside main tx:
```
Version
Marker (0x00) + Flag (0x01)
Inputs (without scriptSig)
Outputs
Witness data per input
Locktime
```

Result: txid doesn't include signatures → fixes transaction malleability.

For: SegWit benefit.

## Transaction fee

```
fee = sum(input values) - sum(output values)
```

No explicit fee field; difference goes to miner.

For: fee calculation.

## Building a transaction

```bash
# bitcoin-cli
bitcoin-cli createrawtransaction '[{"txid":"...","vout":0}]' '{"recipient":0.01}'
bitcoin-cli signrawtransactionwithkey <hex> '["<wif_key>"]'
bitcoin-cli sendrawtransaction <signed_hex>
```

For: hands-on tx creation.

## RBF (Replace By Fee)

If a tx in mempool isn't confirmed, owner can replace with higher-fee version:
- Original tx signaled RBF (sequence < 0xFFFFFFFE).
- New tx pays higher fee.
- New tx replaces in mempool.

For: stuck tx recovery.

## CPFP (Child Pays For Parent)

If you receive a tx with low fee:
- Spend the output in a child tx with high fee.
- Miner must include parent to include child.
- Effective fee = combined.

For: accelerating someone else's tx.

## Mistakes to avoid

- **Sending without checking outputs.** Easy to fat-finger amounts.
- **No RBF signal.** Can't accelerate later.
- **Dust outputs (<546 sat).** Often unspendable economically.

## Summary

- Tx = version + inputs + outputs + locktime.
- Inputs reference UTXOs; outputs create new UTXOs.
- Fee = inputs - outputs.
- SegWit separates witness data (no malleability).
- RBF / CPFP for fee acceleration.

Next: Bitcoin Script.
