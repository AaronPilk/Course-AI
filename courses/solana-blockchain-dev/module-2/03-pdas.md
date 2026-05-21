---
module: 3
position: 3
title: "Program-derived addresses (PDAs)"
objective: "Generate deterministic, program-owned addresses for unique on-chain state."
estimated_minutes: 5
---

# Program-derived addresses (PDAs)

## What a PDA is

A PDA = address derived from seeds + program ID, off-curve (no private key exists). Only the deriving program can sign for it.

```rust
let (pda, bump) = Pubkey::find_program_address(
    &[b"user", user.key().as_ref()],
    program_id
);
```

For: per-user / per-thing accounts deterministically.

## Why PDAs matter

Solana programs need stable addresses for:
- Per-user data.
- Vaults holding tokens.
- Configuration / treasury accounts.

If you used random keypairs, you'd have to track them separately. PDAs are derived — recover by computing again.

For: deterministic state addressing.

## Seeds + bump

```rust
seeds = [b"vault", owner.key().as_ref(), token_mint.key().as_ref()]
```

Seeds can be:
- Static bytes (`b"vault"`).
- Public keys (`owner.key().as_ref()`).
- Other accounts' data.

Bump = single byte chosen to push address off the Ed25519 curve. Stored in account; reused to save compute.

For: stable, programmable identity.

## Creating a PDA in Anchor

```rust
#[derive(Accounts)]
pub struct CreateUserProfile<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + UserProfile::INIT_SPACE,
        seeds = [b"profile", user.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct UserProfile {
    pub authority: Pubkey,
    pub bump: u8,
    pub display_name: String,
}
```

Anchor calls `init` once; subsequent calls error.

For: one-time PDA setup.

## Accessing existing PDA

```rust
#[derive(Accounts)]
pub struct UpdateProfile<'info> {
    #[account(
        mut,
        seeds = [b"profile", user.key().as_ref()],
        bump = profile.bump,
        has_one = authority
    )]
    pub profile: Account<'info, UserProfile>,

    pub authority: Signer<'info>,
}
```

`has_one = authority` verifies stored field matches signer.

For: typed update calls.

## PDA signing

PDAs can "sign" CPI calls because the program owns them:

```rust
let seeds = &[b"vault", owner.key().as_ref(), &[bump]];
let signer = &[&seeds[..]];

token::transfer(
    CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.recipient.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        },
        signer
    ),
    amount
)?;
```

Vault PDA signs without holding a private key.

For: program-managed funds.

## Common PDA patterns

1. **Per-user state**: `seeds = [b"profile", user.key().as_ref()]`.
2. **Per-token vault**: `seeds = [b"vault", token_mint.key().as_ref()]`.
3. **Global counter**: `seeds = [b"counter"]`.
4. **Order book**: `seeds = [b"order", market.key().as_ref(), &order_id.to_le_bytes()]`.

For: structuring PDAs by use case.

## Bump caching

Computing `find_program_address` is expensive (iterates up to 256 bumps). Store the bump on account creation; reuse:

```rust
#[account]
pub struct Profile {
    pub authority: Pubkey,
    pub bump: u8,    // Stored for reuse
    pub data: String,
}

// Later
#[account(seeds = [b"profile", user.key().as_ref()], bump = profile.bump)]
```

Saves thousands of compute units per call.

For: production-grade efficiency.

## Canonical bump

`find_program_address` returns the highest valid bump. Storing the bump that worked at init keeps the same PDA forever, even if seeds remain the same.

For: stable addressing.

## Realloc

```rust
#[account(
    mut,
    realloc = 8 + ProfileV2::INIT_SPACE,
    realloc::payer = user,
    realloc::zero = false,
    seeds = [b"profile", user.key().as_ref()],
    bump = profile.bump
)]
pub profile: Account<'info, ProfileV2>,
```

Lets you grow / shrink account data after init.

For: account migration / extension.

## Close account

```rust
#[account(
    mut,
    close = receiver,   // Recovered lamports go here
    seeds = [b"profile", user.key().as_ref()],
    bump = profile.bump
)]
pub profile: Account<'info, UserProfile>,
```

Refunds rent + zeros out data + marks closed.

For: account cleanup.

## Pitfalls

- **Wrong seeds order.** Address won't match; lookup fails.
- **Including signer pubkey in PDA accidentally.** Anyone could pre-compute.
- **Not validating PDA matches program ID.** Cross-program PDA confusion.
- **Forgetting to store bump.** Recomputation cost adds up.

## Constraint cheat sheet

Anchor account constraints:

```rust
#[account(init, payer = X, space = Y)]          // Create new
#[account(mut)]                                  // Mark writable
#[account(seeds = [...], bump)]                  // Derive PDA
#[account(seeds = [...], bump, payer = X)]       // Create new PDA
#[account(has_one = field)]                      // Verify field matches account
#[account(constraint = expr)]                    // Custom condition
#[account(realloc = N, realloc::payer = X)]      // Resize
#[account(close = X)]                            // Close + refund
#[account(executable)]                           // Program account
```

For: declarative access control.

## Mistakes to avoid

- **PDAs without bump cache.** Wastes CU.
- **Re-deriving on every call.** Slow; expensive.
- **Mixing seed types unsafely.** Pubkey + raw u64 needs consistent encoding.
- **Trying to sign tx with PDA externally.** Only the deriving program can.

## Summary

- PDA = address derived from seeds + program ID, off-curve.
- Used for deterministic per-thing accounts.
- Anchor `seeds + bump` constraint enforces derivation.
- Programs sign with PDAs via `with_signer`.

Next: cross-program invocation (CPI).
