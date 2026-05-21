---
module: 4
position: 1
title: "SPL Token Program"
objective: "Create, mint, and transfer SPL tokens."
estimated_minutes: 5
---

# SPL Token Program

## What SPL tokens are

SPL = Solana Program Library. Token program is the canonical fungible + non-fungible token implementation.

Every Solana token (USDC, BONK, WIF, NFTs) is created with this program. Standardized → wallets + DEXs + tooling all interoperate.

For: foundation of Solana tokenomics.

## Create a token (CLI)

```bash
spl-token create-token --decimals 6
# Mint: <NewMintPubkey>

spl-token create-account <Mint>
# Token Account: <TokenAccount>

spl-token mint <Mint> 1000000
# Mints 1M to your token account

spl-token transfer <Mint> 50 <RecipientAddress> --fund-recipient
```

CLI flow for token operations.

For: scripting common operations.

## Mint account

```rust
pub struct Mint {
    pub mint_authority: Option<Pubkey>,    // Who can mint more
    pub supply: u64,                        // Current total
    pub decimals: u8,                       // E.g., 6 for USDC, 9 for SOL
    pub is_initialized: bool,
    pub freeze_authority: Option<Pubkey>    // Who can freeze accounts
}
```

State for an entire token type.

For: tokenomics design.

## Token account

```rust
pub struct TokenAccount {
    pub mint: Pubkey,           // Which token
    pub owner: Pubkey,          // Who owns
    pub amount: u64,            // Balance
    pub state: AccountState,    // Active / Frozen / Uninitialized
    pub delegate: Option<Pubkey>,  // Approved spender
    pub delegated_amount: u64
}
```

State per (user, token) pair.

For: per-user balances.

## Associated Token Account (ATA)

ATA = deterministic PDA per `(owner, mint)`:

```rust
let ata = get_associated_token_address(&owner, &mint);
// Or in Anchor:
#[account(
    init,
    payer = user,
    associated_token::mint = mint,
    associated_token::authority = user,
)]
pub user_token: Account<'info, TokenAccount>,
```

Wallets check ATA by default; predictable + standard.

For: best practice token UX.

## Mint in Anchor

```rust
use anchor_spl::token::{self, Token, Mint, TokenAccount, MintTo};

pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
    token::mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.recipient.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            }
        ),
        amount
    )?;
    Ok(())
}
```

For: programmatic minting.

## Transfer

```rust
token::transfer(
    CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        }
    ),
    amount
)?;
```

For: token movement.

## Burn

```rust
token::burn(
    CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.holder.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        }
    ),
    amount
)?;
```

Reduces total supply.

For: deflationary mechanics.

## Approve/Revoke

```rust
// Approve another address to spend
token::approve(/* cpi */, amount)?;

// Revoke
token::revoke(/* cpi */)?;
```

DeFi / market integrations use approve pattern.

For: delegated spending.

## Token-2022 (Token Extensions)

Newer token program with extensions:
- Transfer fees (auto-collected on transfers).
- Interest-bearing tokens.
- Permanent delegate (regulator pattern).
- Metadata pointer (no separate metadata program).
- Group + member (collections).
- Confidential transfers (encrypted amounts).
- Default account state (e.g., frozen by default).
- Required memo on transfer.

Use Token-2022 for new fungible tokens needing these features. Plain SPL still standard for legacy compat.

For: feature-rich tokens.

## Decimals

| Token  | Decimals |
|--------|----------|
| SOL    | 9        |
| USDC   | 6        |
| BTC    | 8 (on Solana) |
| NFTs   | 0        |

Display amount = on-chain amount / 10^decimals.

For: correct human-readable amounts.

## Setting authorities

```rust
token::set_authority(
    cpi_ctx,
    AuthorityType::MintTokens,
    Some(new_authority)
)?;

// Set to None = renounce forever
token::set_authority(cpi_ctx, AuthorityType::MintTokens, None)?;
```

Common: renounce mint authority after initial mint → fixed supply.

For: trust signaling.

## Freeze + thaw

If freeze_authority set:
```rust
token::freeze_account(/* cpi */)?;   // Freeze a token account
token::thaw_account(/* cpi */)?;     // Unfreeze
```

For: regulated tokens / compliance.

## Common patterns

### Fixed-supply token
1. Create mint.
2. Mint full supply once.
3. Renounce mint authority (set None).
4. Distribute via airdrop / staking / DEX.

### Inflationary token
- Mint authority stays with DAO or program.
- Mint per emission schedule.

### Bonding curve
- Program controls mint.
- Users send SOL → program mints tokens.
- Curve based on supply.

For: token economic models.

## Querying balance

```typescript
import { getAccount, getMint } from "@solana/spl-token"

const ata = getAssociatedTokenAddressSync(mint, owner)
const accountInfo = await getAccount(connection, ata)
console.log("Balance:", accountInfo.amount.toString())

const mintInfo = await getMint(connection, mint)
const display = Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals)
```

For: client-side balance reading.

## Mistakes to avoid

- **Off-by-decimals.** "$1" needs 1_000_000 in USDC (6 decimals).
- **No mint authority renouncing.** Investors assume rug pull risk.
- **Freezing prod tokens without recovery plan.** Users locked out.
- **Token-2022 incompat with plain SPL.** Wallets handle differently; test before launch.

## Summary

- SPL Token Program = standard for tokens.
- Mint + TokenAccount + ATA = state.
- Anchor + anchor_spl::token helpers wrap CPI.
- Token-2022 for advanced features.

Next: token accounts + authorities deep-dive.
