---
module: 2
position: 2
title: "Bitcoin Script basics"
objective: "Read and write Bitcoin's stack-based scripting language."
estimated_minutes: 5
---

# Bitcoin Script basics

## What Script is

Stack-based programming language. Each output has a `scriptPubKey` (locking script); each input has a `scriptSig` (unlocking script).

To spend: scriptSig + scriptPubKey concatenated and executed. If stack ends with `true` → valid.

Intentionally limited: no loops (no Turing-completeness); deterministic execution.

For: spending condition language.

## Stack-based execution

```
Operation: push 5
Stack: [5]

Operation: push 3
Stack: [5, 3]

Operation: OP_ADD
Stack: [8]

Operation: push 8
Stack: [8, 8]

Operation: OP_EQUAL
Stack: [true]
```

For: execution model.

## Common opcodes

```
OP_DUP            // Duplicate top of stack
OP_HASH160        // RIPEMD160(SHA256(top))
OP_EQUALVERIFY    // Pop two; fail if not equal
OP_CHECKSIG       // Pop sig + pubkey; verify signature
OP_CHECKMULTISIG  // Multi-sig verification
OP_IF / OP_ELSE / OP_ENDIF
OP_RETURN         // Mark output unspendable; can carry data
```

For: building scripts.

## Standard P2PKH script

scriptPubKey:
```
OP_DUP OP_HASH160 <pubkeyHash> OP_EQUALVERIFY OP_CHECKSIG
```

scriptSig (provided by spender):
```
<signature> <pubkey>
```

Combined execution:
```
1. Push signature
2. Push pubkey
3. OP_DUP → duplicate pubkey
4. OP_HASH160 → hash pubkey
5. Push pubkeyHash (from scriptPubKey)
6. OP_EQUALVERIFY → match!
7. OP_CHECKSIG → signature valid for pubkey?
```

For: standard payment lock.

## Multisig

scriptPubKey:
```
OP_2 <pubkey1> <pubkey2> <pubkey3> OP_3 OP_CHECKMULTISIG
```

scriptSig:
```
OP_0 <sig1> <sig2>
```

(OP_0 fixes Off-by-one bug in OP_CHECKMULTISIG)

2-of-3 multisig: any 2 of 3 keys can spend.

For: shared custody.

## OP_RETURN (data carrier)

```
OP_RETURN <up to 80 bytes data>
```

Output marked unspendable; data publicly recorded. Used for:
- Document timestamps.
- Token issuance protocols (Counterparty, Omni).
- Ordinals (newer).

For: on-chain data.

## OP_CHECKLOCKTIMEVERIFY (CLTV)

```
<unix_timestamp> OP_CHECKLOCKTIMEVERIFY OP_DROP <pubkeyHash> OP_CHECKSIG
```

Output spendable only after specific time / block height.

For: vesting, inheritance.

## OP_CHECKSEQUENCEVERIFY (CSV)

Relative locktime: spendable N blocks/seconds after input was created.

```
<144> OP_CHECKSEQUENCEVERIFY  // ~1 day delay
```

For: Lightning channels, scripts requiring delays.

## Script complexity limits

- Max 10,000 ops per script.
- Max stack size: 1,000 items.
- No loops; bounded execution.
- Coinbase + standard tx have additional rules.

For: gas-free but bounded.

## Limited expressiveness

What Script can NOT do:
- Loops.
- Random access to other UTXOs.
- Network calls.
- State (without re-encoding into outputs).

Compared to Ethereum's Solidity: Bitcoin Script intentionally minimal.

For: design tradeoff.

## Why limited?

Reasons:
- Security: less attack surface.
- Determinism: every node computes identically.
- Predictable execution time.
- Resilience to bugs (no Turing-complete language footguns).

For: design philosophy.

## Mistakes to avoid

- **Putting secrets in scripts.** They're public when spent.
- **Forgetting OP_0 in multisig.** Tx fails.
- **Custom scripts users can't unlock.** Funds locked forever.

## Summary

- Stack-based; deterministic; intentionally limited.
- scriptPubKey locks; scriptSig unlocks.
- P2PKH: standard pay-to-pubkey-hash.
- Multisig, CLTV, CSV expand to common patterns.
- No Turing-completeness; no loops.

Next: P2PKH / P2SH / SegWit / Taproot detail.
