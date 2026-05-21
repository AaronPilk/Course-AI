---
module: 5
position: 2
title: "Signing and submitting transactions"
objective: "Build, sign, and confirm transactions reliably."
estimated_minutes: 5
---

# Signing and submitting transactions

## Basic tx submission

```typescript
import { Transaction, SystemProgram } from "@solana/web3.js"

const tx = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: receiverPubkey,
    lamports: 0.01 * LAMPORTS_PER_SOL
  })
)

const sig = await sendTransaction(tx, connection)
await connection.confirmTransaction(sig, "confirmed")
```

`sendTransaction` from `useWallet` signs via wallet + submits.

For: simple transactions.

## Blockhash management

```typescript
const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
tx.recentBlockhash = blockhash
tx.feePayer = publicKey
```

Tx valid for ~150 slots (~1 minute) after blockhash. Refresh if delayed.

For: tx validity window.

## Confirmation strategies

```typescript
// Standard
await connection.confirmTransaction({
  signature,
  blockhash,
  lastValidBlockHeight
})

// Faster (less safe)
await connection.confirmTransaction(signature, "processed")

// Stricter
await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "finalized")
```

For: latency vs. safety tradeoff.

## Versioned (V0) transactions

```typescript
import { TransactionMessage, VersionedTransaction } from "@solana/web3.js"

const messageV0 = new TransactionMessage({
  payerKey: publicKey,
  recentBlockhash: blockhash,
  instructions: [ix1, ix2]
}).compileToV0Message([altAccount])

const tx = new VersionedTransaction(messageV0)
const signedTx = await wallet.signTransaction(tx)
const sig = await connection.sendRawTransaction(signedTx.serialize())
```

V0 supports Address Lookup Tables. Modern standard.

For: complex multi-account txs.

## Priority fees

```typescript
import { ComputeBudgetProgram } from "@solana/web3.js"

const tx = new Transaction()
tx.add(
  ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 }),
  ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 }),
  myInstruction
)
```

Adds priority fee in micro-lamports per CU. During congestion 1000-100,000+.

For: tx success during congestion.

## Dynamic priority fees

```typescript
const recentFees = await connection.getRecentPrioritizationFees({
  lockedWritableAccounts: [hotAccount]
})

const medianFee = median(recentFees.map(f => f.prioritizationFee))
const priorityFee = Math.max(medianFee * 1.5, 5000)
```

Adjust to current network conditions.

For: efficient pricing.

## Sending with retry

```typescript
async function sendWithRetry(tx, wallet, connection, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      tx.recentBlockhash = blockhash
      const signedTx = await wallet.signTransaction(tx)
      const sig = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        maxRetries: 0   // We retry ourselves
      })
      const result = await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight })
      if (!result.value.err) return sig
    } catch (err) {
      console.warn(`Attempt ${attempt + 1} failed:`, err)
    }
  }
  throw new Error("Tx failed after retries")
}
```

For: reliability.

## Multiple signers

```typescript
const tx = new Transaction().add(/* instructions needing multiple signers */)
tx.recentBlockhash = blockhash
tx.feePayer = wallet.publicKey

// Partial sign with secondary keypair
tx.partialSign(secondaryKeypair)

// Wallet signs as primary
const signed = await wallet.signTransaction(tx)
```

For: PDA-adjacent operations needing additional keypairs.

## Simulation before submit

```typescript
const simulation = await connection.simulateTransaction(tx)
if (simulation.value.err) {
  console.error("Would fail:", simulation.value.logs)
  return
}
// Safe to submit
```

Saves wallet popup if tx will fail.

For: pre-flight UX.

## Batch transactions

```typescript
const signedTxs = await wallet.signAllTransactions([tx1, tx2, tx3])

await Promise.all(
  signedTxs.map(tx => connection.sendRawTransaction(tx.serialize()))
)
```

One wallet popup for multiple txs.

For: airdrop / mint flows.

## Transaction inspection

```typescript
const tx = await connection.getTransaction(sig, { commitment: "confirmed", maxSupportedTransactionVersion: 0 })
console.log("Logs:", tx.meta.logMessages)
console.log("Fee:", tx.meta.fee)
console.log("Pre-balances:", tx.meta.preBalances)
console.log("Post-balances:", tx.meta.postBalances)
```

For: post-tx UI updates + debugging.

## Decoding errors

```typescript
try {
  await program.methods.action().rpc()
} catch (err) {
  if (err.logs) {
    const customError = err.logs.find(log => log.includes("AnchorError"))
    console.log("Anchor error:", customError)
  }
}
```

Anchor errors include the named code + message.

For: actionable user feedback.

## Common pitfalls

- **Stale blockhash.** Tx expires; resubmit fails.
- **Wallet timeout.** Some wallets sign + close before confirmation.
- **Race conditions.** Multiple txs targeting same account.
- **CU estimation off.** Hits limit; tx fails with cryptic error.

## Common patterns

### Pre-confirm UI feedback
```typescript
const sig = await sendTransaction(tx, connection)
toast.info("Transaction sent...")
await connection.confirmTransaction(sig, "confirmed")
toast.success("Done!")
```

### Optimistic UI updates
Update UI immediately on send; reconcile on confirm; rollback on failure.

For: snappy UX.

## Mistakes to avoid

- **No priority fee on congested network.** Tx stalls.
- **Wait for finalized everywhere.** Slow UX.
- **No retry on RPC failures.** Transient errors fail user.
- **Trust simulation completely.** Simulation can succeed but real tx fail.

## Summary

- Tx structure: instructions + signers + recentBlockhash + feePayer.
- Priority fees via ComputeBudgetProgram during congestion.
- Confirmation levels: processed (fast) → confirmed → finalized (safe).
- Simulate before submit; retry on failure.

Next: RPC providers and rate limits.
