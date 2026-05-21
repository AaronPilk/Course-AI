---
module: 5
position: 1
title: "Web3.js + wallet adapters"
objective: "Connect a frontend to Solana with multi-wallet support."
estimated_minutes: 5
---

# Web3.js + wallet adapters

## @solana/web3.js basics

```typescript
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"

const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed")
const balance = await connection.getBalance(new PublicKey("..."))
console.log(balance / LAMPORTS_PER_SOL, "SOL")
```

Core library for reading + sending transactions.

For: client interaction.

## Wallet adapter setup

```bash
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui \
            @solana/wallet-adapter-wallets @solana/web3.js
```

```typescript
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"

export function Providers({ children }) {
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter()
  ]
  const endpoint = "https://api.mainnet-beta.solana.com"

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
```

For: standard frontend setup.

## Connect button

```typescript
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export function Header() {
  return (
    <header>
      <h1>My dApp</h1>
      <WalletMultiButton />
    </header>
  )
}
```

Pre-built button handles connect / disconnect / wallet selection.

For: out-of-box UX.

## Using wallet in components

```typescript
import { useWallet, useConnection } from "@solana/wallet-adapter-react"

export function Profile() {
  const { publicKey, sendTransaction, signMessage } = useWallet()
  const { connection } = useConnection()

  if (!publicKey) return <div>Connect wallet</div>

  return <div>Connected: {publicKey.toString()}</div>
}
```

For: wallet state in React.

## Standard Wallet API

Modern wallets implement the Wallet Standard:
- `connect()`, `disconnect()`.
- `signTransaction(tx)`.
- `signAllTransactions(txs)`.
- `signMessage(message)`.
- `signIn(input)` (SIWS).

Older Phantom-specific API deprecated.

For: future-proof integration.

## Popular wallets

- **Phantom.** Most popular browser wallet; mobile app.
- **Solflare.** Solana-focused; hardware integration.
- **Backpack.** Newer; xNFT support.
- **Glow.** Polished UX.
- **Ledger.** Hardware; via Phantom / Solflare.

For: wallet ecosystem.

## Mobile Wallet Adapter

```typescript
import { SolanaMobileWalletAdapter, createDefaultAuthorizationCache, createDefaultChainSelector } from "@solana-mobile/wallet-adapter-mobile"

// On Android: uses MWA protocol; opens wallet app
// On iOS: deep links to wallets
```

For: mobile dApps.

## Reading wallet token balances

```typescript
import { getParsedTokenAccountsByOwner } from "@solana/spl-token"

const tokens = await connection.getParsedTokenAccountsByOwner(publicKey, {
  programId: TOKEN_PROGRAM_ID
})

for (const { account } of tokens.value) {
  const info = account.data.parsed.info
  console.log(info.mint, info.tokenAmount.uiAmount)
}
```

For: portfolio display.

## NFT enumeration

```typescript
// Helius DAS API (recommended)
const response = await fetch(HELIUS_URL, {
  method: "POST",
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "getAssetsByOwner",
    params: { ownerAddress: walletAddress.toString(), page: 1, limit: 1000 }
  })
})
const { result } = await response.json()
const nfts = result.items.filter(item => item.interface === "V1_NFT")
```

DAS API works for compressed + regular NFTs.

For: NFT galleries.

## Anchor in browser

```typescript
import * as anchor from "@coral-xyz/anchor"

function getProgram(wallet) {
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" })
  return new anchor.Program(IDL, PROGRAM_ID, provider)
}

const program = getProgram(wallet)
await program.methods.deposit(amount).accounts({...}).rpc()
```

Direct program calls with type safety.

For: dApp interactions.

## Error handling

```typescript
try {
  await program.methods.action().rpc()
} catch (err) {
  if (err instanceof anchor.AnchorError) {
    console.log("Code:", err.error.errorCode.code)
    console.log("Message:", err.error.errorMessage)
  } else if (err.message.includes("User rejected")) {
    // User cancelled in wallet
  }
}
```

For: graceful UX.

## SOL balance subscription

```typescript
const subId = connection.onAccountChange(
  publicKey,
  (account) => console.log("Balance:", account.lamports),
  "confirmed"
)

// Cleanup
await connection.removeAccountChangeListener(subId)
```

Real-time updates without polling.

For: live UI.

## Mistakes to avoid

- **Hard-coded RPC URLs.** Use env vars.
- **No loading state.** UI shows old / wrong balance.
- **Polling every second.** Use subscriptions or smart caching.
- **Showing public key only.** UX: show first 4 + last 4 chars.

## Summary

- web3.js for low-level; wallet-adapter for UI.
- WalletMultiButton handles UX.
- useWallet + useConnection in React.
- DAS API for NFT enumeration.

Next: signing and submitting transactions.
