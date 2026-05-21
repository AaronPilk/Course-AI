---
module: 4
position: 2
title: "Token accounts and authorities"
objective: "Manage token authorities, delegations, and vault patterns."
estimated_minutes: 5
---

# Token accounts and authorities

## Authority types

```rust
pub enum AuthorityType {
    MintTokens,        // Who can mint more
    FreezeAccount,     // Who can freeze accounts
    AccountOwner,      // Token account owner
    CloseAccount,      // Who can close
}
```

Different authorities for different powers; granular control.

For: tokenomics security model.

## Renouncing authorities

```rust
// Renounce mint forever
token::set_authority(cpi_ctx, AuthorityType::MintTokens, None)?;
```

`None` = no one can ever mint again. Signals fixed supply.

For: investor trust.

## Multi-sig authority

```rust
use anchor_spl::token::{set_authority, AuthorityType};

// Authority set to multi-sig PDA
set_authority(cpi_ctx, AuthorityType::MintTokens, Some(multisig_pda))?;
```

Authority becomes multi-sig PDA controlled by program logic.

For: governance / DAO control.

## PDA vault pattern

```rust
#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub user_token: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        seeds = [b"vault", mint.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = vault_authority
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"vault_authority"],
        bump
    )]
    /// CHECK: PDA used as authority
    pub vault_authority: AccountInfo<'info>,

    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
```

`token::authority = vault_authority` makes a PDA the owner.

For: program-controlled token accounts.

## Withdrawing from PDA vault

```rust
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let bump = ctx.bumps.vault_authority;
    let seeds = &[b"vault_authority" as &[u8], &[bump]];
    let signer = &[&seeds[..]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.user_token.to_account_info(),
                authority: ctx.accounts.vault_authority.to_account_info(),
            },
            signer
        ),
        amount
    )?;
    Ok(())
}
```

PDA signs without private key.

For: programmatic disbursement.

## Delegate pattern

```rust
// User approves vault PDA to spend up to N tokens
token::approve(
    CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Approve {
            to: ctx.accounts.user_token.to_account_info(),
            delegate: ctx.accounts.vault_authority.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        }
    ),
    max_amount
)?;
```

Vault can spend on user's behalf without taking custody.

For: DEX / market integrations.

## Close token account

```rust
token::close_account(
    CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.token_account.to_account_info(),
            destination: ctx.accounts.recipient.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        }
    )
)?;
```

Reclaims ~0.002 SOL rent. Account must be empty (amount = 0).

For: cleanup; user UX.

## Frozen accounts

If `freeze_authority` exists:
```rust
token::freeze_account(cpi_ctx)?;
token::thaw_account(cpi_ctx)?;
```

Frozen accounts can't be transferred from.

Use cases: regulated tokens, paused tokens, anti-bot.

For: emergency controls.

## Permanent delegate (Token-2022)

```rust
// Cannot be revoked; intended for KYC / regulator tokens
```

Permanent delegate has spend authority on all token accounts of that mint. Visible in mint metadata so users know.

For: regulated stablecoins.

## Confidential transfers (Token-2022)

Amounts encrypted on-chain; only sender + receiver can decrypt. Uses Pedersen commitments.

```rust
// Configuration on mint creation
```

For: privacy-preserving transfers.

## Common security checks

```rust
// Mint matches
require!(token_account.mint == expected_mint, MyError::WrongMint);

// Owner matches
require!(token_account.owner == expected_owner, MyError::WrongOwner);

// Sufficient balance
require!(token_account.amount >= amount, MyError::Insufficient);
```

Anchor constraints cover most; add `require!` for business logic.

For: defense in depth.

## Sealevel attacks to know

- **Account substitution.** Attacker passes wrong account; without owner/mint check, succeeds.
- **Missing signer.** Forgot `Signer<'info>`; any account passes.
- **Re-init attack.** `init_if_needed` runs init logic twice → state reset.
- **Type confusion.** Passes wrong account type; discriminator catches if `Account<T>` used.

Mitigation: Anchor's typed Account + standard constraints prevent most.

For: program security awareness.

## Mistakes to avoid

- **Plain freezeable token in production.** Users panic; market discount.
- **Vault PDA with predictable seeds.** Front-runnable.
- **Auth checks only in Anchor constraints, not body.** Logic bugs missed.
- **Forgot to renounce mint authority.** Looks centralized.

## Summary

- Mint / Freeze / Owner / Close authorities granular.
- PDA vault pattern for program-owned tokens.
- Delegate pattern for non-custodial DEX flow.
- Token-2022 enables permanent delegate + confidential transfers.

Next: NFTs and Metaplex.
