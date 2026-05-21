---
module: 1
position: 3
title: "Accounts, transactions, and fees"
objective: "Understand Solana's account model and how to construct transactions."
estimated_minutes: 5
---

# Accounts, transactions, and fees

## The account model

Every piece of data on Solana lives in an account:
- **Address.** 32-byte public key (base58 encoded).
- **Owner.** Program that controls writes.
- **Lamports.** SOL balance (1 SOL = 1B lamports).
- **Data.** Serialized bytes (max 10MB).
- **Executable.** Boolean: is this account a program?

Wallets, token balances, NFT metadata, program code → all accounts.

For: mental model of state.

## Rent

Accounts must hold enough SOL to cover "rent exemption" — currently 2-year minimum. Accounts holding less get garbage-collected.

```
Rent-exempt minimum (typical): 0.001-0.01 SOL per account.
NFT mint account: ~0.002 SOL.
Token account: ~0.002 SOL.
```

For: budgeting account creation costs.

## Account ownership

```
System Program owns: SOL wallets (regular accounts).
SPL Token Program owns: token accounts.
Your Program owns: accounts you create + initialize.
```

Owner can:
- Modify data.
- Reassign ownership.
- Close account (recovering lamports).

For: who can change what.

## Transaction structure

```typescript
const tx = new Transaction()
tx.add(instruction1)
tx.add(instruction2)
tx.recentBlockhash = await connection.getLatestBlockhash()
tx.feePayer = wallet.publicKey
tx.sign(wallet)
const sig = await connection.sendTransaction(tx)
```

A transaction = list of instructions, fee payer, blockhash, signatures.

For: building tx in JS / Rust client.

## Instructions

```typescript
{
  programId: TOKEN_PROGRAM_ID,
  keys: [
    { pubkey: fromAccount, isSigner: true, isWritable: true },
    { pubkey: toAccount, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false }
  ],
  data: Buffer.from([transferInstructionCode, ...amountBytes])
}
```

Instruction tells program: "use these accounts + these data bytes". Program decodes data + processes.

For: lowest-level call construction.

## Signers

A transaction can have multiple signers. Each signer's account must be marked `isSigner: true`. Common signers:
- Fee payer (always required).
- Owner of source token account.
- Mint authority for minting tokens.

For: authorizing actions.

## Recent blockhash

Every transaction includes a recent blockhash (last ~150 slots). Prevents replay; transactions older than ~1-2 minutes expire.

```typescript
const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
tx.recentBlockhash = blockhash
tx.lastValidBlockHeight = lastValidBlockHeight
```

For: tx submission window awareness.

## Fees

Base fee: 5,000 lamports per signature (~$0.0005 at $100 SOL).
Priority fee: additional per-CU; varies 0-100k+ micro-lamports during congestion.

Total = base + (CU consumed × CU price).

For: tx cost estimation.

## Confirming transactions

```typescript
const sig = await connection.sendTransaction(tx)
await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight })

// Or skip preflight + retry on failure
const sig = await sendAndConfirmTransaction(connection, tx, [wallet], {
  skipPreflight: false,
  commitment: "confirmed",
  maxRetries: 3
})
```

For: production-grade submission.

## Transaction size limits

Max transaction size: 1,232 bytes. Each instruction adds bytes; large transactions need to:
- Be split into multiple smaller tx.
- Use account lookup tables (ALT) to shorten account references.

For: handling complex operations.

## Address Lookup Tables (ALT)

Compress account references in transactions:

```typescript
const altPubkey = await createAddressLookupTable(...)
extendLookupTable(altPubkey, [acc1, acc2, ...acc20])

// Now reference accounts by 1-byte index instead of 32 bytes
```

Lets transactions reference 30+ accounts.

For: complex DeFi / swap routing.

## Versioned transactions

```typescript
const messageV0 = new TransactionMessage({...}).compileToV0Message([altAccount])
const tx = new VersionedTransaction(messageV0)
```

V0 supports ALTs; legacy doesn't. Use V0 for new code.

For: modern transaction construction.

## SOL transfer example

```typescript
import { SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js"

const ix = SystemProgram.transfer({
  fromPubkey: sender,
  toPubkey: receiver,
  lamports: 0.01 * LAMPORTS_PER_SOL
})

const tx = new Transaction().add(ix)
```

Simplest possible Solana transaction.

For: starting point.

## Reading account data

```typescript
const account = await connection.getAccountInfo(pubkey)
console.log("Owner:", account.owner.toString())
console.log("Lamports:", account.lamports)
console.log("Data length:", account.data.length)

// Deserialize based on program
const decoded = MyAccountSchema.deserialize(account.data)
```

For: reading on-chain state.

## Mistakes to avoid

- **Forgetting blockhash refresh.** Tx expires; resubmit fails.
- **Not estimating rent.** Account creation fails silently.
- **Excessive accounts in one tx.** Hits 1,232 byte limit.
- **Confirming on processed.** Reverts possible.

## Summary

- Accounts hold all state (balances, data, programs).
- Transactions = instructions + accounts + signers + blockhash.
- Fees = base + priority; varies with congestion.
- Use ALTs + V0 tx for complex ops.

Next: setting up your dev environment.
