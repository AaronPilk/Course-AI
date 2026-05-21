---
module: 2
position: 4
title: "Cross-program invocation (CPI)"
objective: "Call other Solana programs from yours."
estimated_minutes: 5
---

# Cross-program invocation (CPI)

## What CPI is

A program calls another program. Like function call across programs.

Common targets:
- SPL Token Program — transfer tokens.
- System Program — create accounts.
- Metaplex — create NFT metadata.
- Your own programs — composable apps.

For: composability. Programs build on each other.

## CPI in Anchor

```rust
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let cpi_accounts = Transfer {
        from: ctx.accounts.user_token.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    token::transfer(cpi_ctx, amount)?;
    Ok(())
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}
```

For: calling token program from your program.

## CPI with PDA signer

When your program owns a PDA and wants to use it to sign:

```rust
let bump = ctx.accounts.vault_bump;
let seeds = &[
    b"vault",
    ctx.accounts.mint.key().as_ref(),
    &[bump]
];
let signer = &[&seeds[..]];

let cpi_accounts = Transfer {
    from: ctx.accounts.vault.to_account_info(),
    to: ctx.accounts.user_token.to_account_info(),
    authority: ctx.accounts.vault_authority.to_account_info(),
};

let cpi_ctx = CpiContext::new_with_signer(
    ctx.accounts.token_program.to_account_info(),
    cpi_accounts,
    signer
);

token::transfer(cpi_ctx, amount)?;
```

`with_signer` includes PDA seeds; runtime allows the PDA to sign.

For: programmatic vault withdrawals.

## Calling your own program

Same pattern; program ID is your program:

```rust
use other_program::cpi::accounts::DoSomething;

other_program::cpi::do_something(
    CpiContext::new(
        ctx.accounts.other_program.to_account_info(),
        DoSomething {
            // accounts
        }
    ),
    args
)?;
```

Anchor generates `cpi` module from the other program's IDL.

For: multi-program apps.

## Anchor `Declared programs`

In your Anchor.toml, declare external programs:

```toml
[programs.localnet]
counter = "Counter111111111111111111111111111111111111"
other = "Other222222222222222222222222222222222222222"

[dependencies]
other = { path = "../other-program" }
```

Imports `cpi` module + types.

For: cross-program type safety.

## System Program CPI

Create accounts from your program:

```rust
use anchor_lang::system_program;

let cpi_ctx = CpiContext::new(
    ctx.accounts.system_program.to_account_info(),
    system_program::CreateAccount {
        from: ctx.accounts.payer.to_account_info(),
        to: ctx.accounts.new_account.to_account_info(),
    }
);

system_program::create_account(
    cpi_ctx,
    rent_lamports,
    space,
    &program_id
)?;
```

Programs can create raw accounts; usually use Anchor `init` instead.

For: low-level account creation.

## Calling SPL Token operations

Common token CPIs:

```rust
// Mint
token::mint_to(cpi_ctx, amount)?;

// Burn
token::burn(cpi_ctx, amount)?;

// Approve
token::approve(cpi_ctx, amount)?;

// Set authority
token::set_authority(cpi_ctx, AuthorityType::MintTokens, Some(new_authority))?;

// Close account
token::close_account(cpi_ctx)?;
```

Each takes specific CpiContext with matching Accounts struct.

For: token lifecycle within programs.

## CPI compute costs

Each CPI hop adds compute:
- Program load: ~3,000 CU.
- Account validation: per account.
- Instruction execution: depends on callee.

Plan total CU budget; raise via ComputeBudgetProgram if needed.

For: cost-aware program design.

## Reentrancy

Solana enforces a max CPI depth of 4 calls deep. Re-entering the same program in a call stack is detected + rejected.

```rust
ProgramA → ProgramB → ProgramA  // ERROR: reentrancy
```

Helps prevent classic reentrancy bugs by default.

For: appreciating the safety model.

## Pre / post checks

Pattern: load accounts before CPI, verify state after:

```rust
let pre_balance = ctx.accounts.vault.amount;

// CPI to swap program
swap_program::cpi::swap(...)?;

ctx.accounts.vault.reload()?;
let post_balance = ctx.accounts.vault.amount;
let delta = post_balance.checked_sub(pre_balance)
    .ok_or(MyError::SwapFailed)?;
require!(delta >= min_out, MyError::SlippageExceeded);
```

For: defensive composition.

## Anchor Idl + IDL accounts

```rust
declare_id!("MyProgram111111111111111111111111111111111111");
```

ID is fixed in code. Match `Anchor.toml` for deploy.

CPI calls verify by program ID + IDL discriminator.

For: type-safe calling.

## Mistakes to avoid

- **Wrong CpiContext.** Mismatched accounts → cryptic errors.
- **Forgetting `with_signer` for PDA.** PDA can't sign without seeds.
- **Not reloading after CPI.** Stale data; wrong assertions.
- **Hardcoded program IDs.** Use `declare_id!` or constants.

## Summary

- CPI = call another program from yours.
- `CpiContext::new` for normal; `new_with_signer` for PDA auth.
- SPL Token + System Program are most common targets.
- Reentrancy is detected automatically.

Module 2 complete. Module 3: Anchor framework deep-dive.
