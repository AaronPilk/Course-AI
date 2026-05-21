---
module: 4
position: 4
title: "Building a token-gated app"
objective: "Gate content / features based on token or NFT ownership."
estimated_minutes: 5
---

# Building a token-gated app

## What token-gating is

Restrict access to features based on on-chain ownership:
- Holders of token X see exclusive content.
- NFT collection holders access Discord channels.
- $1k+ stakers get governance vote.

For: utility-driven token economics.

## Client-side check (basic)

```typescript
import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token"

async function holdsToken(wallet, mintAddress) {
  try {
    const ata = getAssociatedTokenAddressSync(mintAddress, wallet)
    const account = await getAccount(connection, ata)
    return account.amount > 0n
  } catch {
    return false
  }
}
```

Quick UI gating; not security-critical.

For: showing/hiding UI.

## Server-side verification

For real security, server verifies signature + holding:

```typescript
import { verifyMessage } from "tweetnacl"

// 1. Client signs nonce
const message = `Login at ${nonce}`
const signature = await wallet.signMessage(new TextEncoder().encode(message))

// 2. Server verifies signature + checks on-chain balance
const verified = nacl.sign.detached.verify(
  message,
  signature,
  wallet.publicKey.toBytes()
)

if (verified) {
  const balance = await getOnChainBalance(wallet.publicKey, requiredMint)
  if (balance > 0) grantAccess()
}
```

For: backend-enforced gating.

## SIWS (Sign-In With Solana)

Standard for wallet auth:

```typescript
import { signIn } from "@solana/wallet-standard-features"

const result = await signIn({ wallet, statement: "Sign to access" })
// result.signature verified server-side
```

Like Sign-In with Ethereum but for Solana.

For: standard auth UX.

## NFT collection gating

```typescript
import { Metaplex } from "@metaplex-foundation/js"

const nfts = await metaplex.nfts().findAllByOwner({ owner: wallet.publicKey })

const ownedCollections = nfts
  .filter(n => n.collection?.verified)
  .map(n => n.collection.address.toString())

const hasAccess = ownedCollections.includes(REQUIRED_COLLECTION.toString())
```

Verify NFT belongs to specific collection.

For: PFP project utility.

## Multi-token gating

```typescript
const requirements = [
  { mint: TOKEN_A, minBalance: 1000_000_000 },  // 1000 TOKEN_A
  { mint: NFT_COLLECTION, type: "collection" }
]

async function checkAccess(wallet) {
  for (const req of requirements) {
    if (req.type === "collection") {
      if (!await holdsCollectionNft(wallet, req.mint)) return false
    } else {
      const bal = await getBalance(wallet, req.mint)
      if (bal < req.minBalance) return false
    }
  }
  return true
}
```

For: tiered access patterns.

## On-chain gating (program-level)

```rust
#[derive(Accounts)]
pub struct AccessGatedFeature<'info> {
    pub user: Signer<'info>,

    #[account(
        constraint = user_token.mint == required_mint.key() @ MyError::WrongMint,
        constraint = user_token.owner == user.key() @ MyError::WrongOwner,
        constraint = user_token.amount > 0 @ MyError::NoTokens
    )]
    pub user_token: Account<'info, TokenAccount>,

    pub required_mint: Account<'info, Mint>,
}
```

Program rejects calls if user doesn't hold token.

For: on-chain feature gating.

## Snapshot-based airdrop

```typescript
// Snapshot at slot N
const holders = await getProgramAccounts(TOKEN_PROGRAM_ID, {
  filters: [
    { dataSize: 165 },
    { memcmp: { offset: 0, bytes: MINT.toString() } }
  ]
})

// Filter active holders
const active = holders
  .filter(h => unpackAccount(h.account).amount > 0)
  .map(h => unpackAccount(h.account).owner)

// Airdrop to each
for (const owner of active) {
  await mintTo(connection, payer, NEW_MINT, getATA(NEW_MINT, owner), authority, AIRDROP_AMOUNT)
}
```

For: rewarding holders.

## Discord integration

Common pattern:
1. User connects wallet to Discord bot.
2. Bot verifies on-chain holdings.
3. Bot assigns role / grants channel access.

Libraries: `discord-solana` / `collab.land` / `vulcanforge`.

For: community gating.

## Token-gated content (Web2)

```typescript
// API middleware
async function gatedRoute(req, res, next) {
  const { wallet, signature, message } = req.headers

  // Verify signed
  if (!verifySig(wallet, signature, message)) return res.status(401).send()

  // Verify hold
  if (!await holdsToken(wallet, REQUIRED_MINT)) return res.status(403).send()

  next()
}
```

For: gating articles, videos, downloads.

## Rate limiting by holders

```typescript
// Premium holders get 10× more API calls
const tier = await getHolderTier(wallet)
const limit = tier === "premium" ? 1000 : 100
await rateLimiter.check(wallet, limit)
```

For: usage-based perks.

## Real-world examples

- **Audius.** $AUDIO holders unlock features.
- **Star Atlas.** Game items + NFT-gated areas.
- **Mad Lads.** PFP holders access trading tools.
- **DRiP.** Free NFT distribution to subscribers.

For: pattern study.

## Anti-evasion considerations

Users can:
- Borrow tokens to bypass (flash loan attack on snapshots).
- Sell after access granted.
- Use multiple wallets.

Mitigations:
- Locked staking (must lock tokens to access).
- Continuous verification (re-check each session).
- Soulbound tokens (non-transferable).

For: robust gating.

## Privacy considerations

Wallets are pseudonymous but linkable. Token-gating reveals:
- Wallet activity (via Solscan).
- Other tokens held.
- Trading patterns.

Users may use dedicated "gated apps" wallets.

For: respecting user privacy.

## Mistakes to avoid

- **Client-only gating.** Easily bypassed by editing UI.
- **Snapshot manipulation.** Flash-borrow tokens during snapshot.
- **Permanent access from one-time check.** Holders sell; access persists.
- **No anti-replay.** Same signature reused across sessions.

## Summary

- Token-gating = restrict by on-chain ownership.
- Sign-In with Solana (SIWS) for auth.
- Backend verification > client-only.
- Programs can gate on-chain features via constraints.
- Anti-evasion: continuous verify + locked staking.

Module 4 complete. Module 5: frontend + production.
