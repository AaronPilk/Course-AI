---
module: 3
position: 2
title: "Accounts and constraints"
objective: "Master Anchor's account validation constraints."
estimated_minutes: 5
---

# Accounts and constraints

## Basic constraints

```rust
#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut)]                    // Writable
    pub from: Account<'info, Vault>,

    #[account(mut)]
    pub to: Account<'info, Vault>,

    pub authority: Signer<'info>,      // Must sign
}
```

Anchor verifies before instruction runs.

For: declarative input validation.

## init for new accounts

```rust
#[account(
    init,
    payer = user,
    space = 8 + UserData::INIT_SPACE,
    seeds = [b"user", user.key().as_ref()],
    bump
)]
pub user_data: Account<'info, UserData>,
```

`init` calls system program to allocate; signed by `payer`. Discriminator (8 bytes) + struct fields.

For: one-time account creation.

## init_if_needed

```rust
#[account(
    init_if_needed,
    payer = user,
    space = 8 + UserData::INIT_SPACE,
    seeds = [b"user", user.key().as_ref()],
    bump
)]
pub user_data: Account<'info, UserData>,
```

Init only if not already created; idempotent. Requires `init-if-needed` feature flag — security implications since same code path runs whether or not creation happens. Often safer to have separate `initialize` instruction.

For: optional account creation; use carefully.

## seeds + bump

```rust
#[account(
    seeds = [b"vault", token_mint.key().as_ref(), authority.key().as_ref()],
    bump = vault.bump      // Stored bump (cached)
)]
pub vault: Account<'info, Vault>,
```

Validates PDA derivation. Caching bump saves compute.

For: PDA access verification.

## has_one

```rust
#[account(has_one = authority)]
pub vault: Account<'info, Vault>,

pub authority: Signer<'info>,
```

Verifies `vault.authority == authority.key()`.

For: cross-account ownership checks.

## constraint = expr

```rust
#[account(
    constraint = vault.balance >= amount @ MyError::Insufficient,
    constraint = vault.is_active @ MyError::Frozen
)]
pub vault: Account<'info, Vault>,
```

Arbitrary boolean validation; `@` attaches custom error.

For: complex preconditions.

## close

```rust
#[account(
    mut,
    close = receiver,      // Lamports refunded here
    seeds = [b"order", order.id.to_le_bytes().as_ref()],
    bump = order.bump
)]
pub order: Account<'info, Order>,

pub receiver: AccountInfo<'info>,
```

Marks account closed; zeros data; refunds lamports.

For: account lifecycle.

## realloc

```rust
#[account(
    mut,
    realloc = 8 + new_size,
    realloc::payer = user,
    realloc::zero = false,
    seeds = [b"data", user.key().as_ref()],
    bump = data.bump
)]
pub data: Account<'info, ExpandableData>,
```

Resize account; pay (or receive) lamport delta.

`realloc::zero = false` keeps existing data (avoid double-write).

For: growing accounts (e.g., adding fields).

## Account types

```rust
Account<'info, T>           // Anchor-owned account; deserialized
AccountInfo<'info>          // Untyped raw account
SystemAccount<'info>        // System-owned (e.g., wallet)
UncheckedAccount<'info>     // Skip type check (require comment why)
Signer<'info>               // Must sign tx
Program<'info, T>           // Verified to be specific program ID
```

Pick most specific type for safety.

For: type-safe account access.

## Token account types

```rust
use anchor_spl::token::{TokenAccount, Mint};

#[account(
    mut,
    constraint = user_token.mint == mint.key(),
    constraint = user_token.owner == user.key()
)]
pub user_token: Account<'info, TokenAccount>,

pub mint: Account<'info, Mint>,
```

Anchor SPL provides typed TokenAccount + Mint wrappers.

For: token integration.

## Associated Token Account

```rust
use anchor_spl::associated_token::{self, AssociatedToken};

#[account(
    init,
    payer = user,
    associated_token::mint = mint,
    associated_token::authority = user,
)]
pub user_token: Account<'info, TokenAccount>,

pub mint: Account<'info, Mint>,
#[account(mut)]
pub user: Signer<'info>,
pub system_program: Program<'info, System>,
pub token_program: Program<'info, Token>,
pub associated_token_program: Program<'info, AssociatedToken>,
```

ATA = deterministic PDA per `(owner, mint)` pair. Standard for token UX.

For: predictable token account addressing.

## Validation order

Anchor validates in declaration order:
1. Constraints first (parsing).
2. Cross-account constraints (has_one, etc.).
3. init / close mutations last.

Bugs from ordering: derive a PDA from another account before that account is validated. Order accounts so dependencies come first.

For: predictable validation behavior.

## Compute cost of constraints

Each constraint adds compute:
- `mut`: free.
- `init`: ~5,000 CU.
- `seeds + bump`: ~3,000 CU (cached); ~10,000 CU (find).
- `has_one`: ~200 CU.
- `constraint = expr`: depends on expression.

Tight loops with many CPIs may need budget bump.

For: CU optimization awareness.

## Mistakes to avoid

- **`init_if_needed` everywhere.** Same code runs for new + existing; hidden bugs.
- **Missing `mut` on writable.** Anchor rejects writes silently in some cases.
- **Wrong account type.** `Account` vs `AccountInfo` skips validation.
- **Constraint order bugs.** Validate dependencies before dependents.

## Summary

- Constraints: init / mut / signer / seeds+bump / has_one / constraint = expr.
- Account types: Account, AccountInfo, Signer, Program, etc.
- Token wrappers + ATA for SPL token integration.
- Compute costs apply to constraints; optimize hot paths.

Next: instructions and contexts.
