---
module: 2
position: 2
title: "Your first program"
objective: "Write, build, and deploy a complete Anchor program with state."
estimated_minutes: 5
---

# Your first program

## Project setup

```bash
anchor init counter
cd counter
```

Generates a working scaffold; replace contents to fit our counter program.

## Counter program

```rust
// programs/counter/src/lib.rs
use anchor_lang::prelude::*;

declare_id!("Counter111111111111111111111111111111111111");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        counter.authority = ctx.accounts.user.key();
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        require!(
            counter.authority == ctx.accounts.user.key(),
            CounterError::Unauthorized
        );
        counter.count = counter.count.checked_add(1).ok_or(CounterError::Overflow)?;
        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        require!(counter.count > 0, CounterError::Underflow);
        counter.count -= 1;
        Ok(())
    }
}
```

For: a full program with state + auth + math safety.

## Accounts struct

```rust
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + Counter::INIT_SPACE
    )]
    pub counter: Account<'info, Counter>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,

    pub user: Signer<'info>,
}
```

Constraints (`init`, `mut`, `Signer`) enforced before your code runs.

For: declarative access control.

## Account data definition

```rust
#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub count: u64,
    pub authority: Pubkey,
}
```

`#[account]` adds:
- AccountSerialize / AccountDeserialize.
- Discriminator (8-byte type tag) prefix.

`InitSpace` calculates required space automatically.

For: typed on-chain storage.

## Custom errors

```rust
#[error_code]
pub enum CounterError {
    #[msg("Unauthorized — not the counter owner")]
    Unauthorized,
    #[msg("Counter would underflow zero")]
    Underflow,
    #[msg("Counter would overflow u64")]
    Overflow,
}
```

Returned to client with original error message.

For: actionable error UX.

## require! macro

```rust
require!(
    counter.authority == ctx.accounts.user.key(),
    CounterError::Unauthorized
);
```

If condition false → return error. Idiomatic guard clauses in Anchor.

For: input validation.

## Build

```bash
anchor build
```

Compiles Rust → BPF bytecode → `target/deploy/counter.so` + IDL JSON.

IDL = Interface Definition Language; describes program for clients.

For: typesafe client SDKs.

## Generate types

```bash
anchor build  # IDL auto-generated at target/idl/counter.json
```

TS client uses IDL to construct calls with type safety.

For: end-to-end type safety.

## Deploy

```bash
solana config set --url devnet
anchor deploy
```

Uploads `.so` file; assigns program ID; updates `Anchor.toml`.

For: shipping the program.

## Client interaction

```typescript
import * as anchor from "@coral-xyz/anchor"

const program = anchor.workspace.Counter
const counterKp = anchor.web3.Keypair.generate()

await program.methods
  .initialize()
  .accounts({
    counter: counterKp.publicKey,
    user: provider.wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId
  })
  .signers([counterKp])
  .rpc()

await program.methods
  .increment()
  .accounts({
    counter: counterKp.publicKey,
    user: provider.wallet.publicKey
  })
  .rpc()

// Read state
const counter = await program.account.counter.fetch(counterKp.publicKey)
console.log("Count:", counter.count.toString())
```

For: front-end / script integration.

## Tests

```typescript
describe("counter", () => {
  it("initializes + increments", async () => {
    const counter = anchor.web3.Keypair.generate()
    await program.methods.initialize()
        .accounts({ counter: counter.publicKey, user: wallet.publicKey })
        .signers([counter]).rpc()

    await program.methods.increment()
        .accounts({ counter: counter.publicKey, user: wallet.publicKey })
        .rpc()

    const account = await program.account.counter.fetch(counter.publicKey)
    expect(account.count.toNumber()).to.equal(1)
  })
})
```

```bash
anchor test
```

For: TDD; CI-friendly.

## Checked arithmetic

```rust
// SAFE
let new_count = counter.count.checked_add(1).ok_or(CounterError::Overflow)?;

// UNSAFE — panics on overflow
let new_count = counter.count + 1;
```

Always use checked math for user-supplied or amount-related ints in production.

For: prevent overflow exploits.

## Space calculation

Account space:
```
discriminator (8 bytes)
+ count: u64 (8)
+ authority: Pubkey (32)
= 48 bytes
```

`#[derive(InitSpace)]` handles automatically — just `8 + Counter::INIT_SPACE`.

For: correct rent allocation.

## Upgrading programs

```bash
anchor upgrade target/deploy/counter.so --program-id <ProgramId>
```

By default upgrade authority = deployer. Can transfer or set to multisig.

```bash
solana program set-upgrade-authority <ProgramId> --new-upgrade-authority <NewAuthority>
solana program set-upgrade-authority <ProgramId> --final  # Lock forever
```

For: production upgrade governance.

## Mistakes to avoid

- **Unchecked arithmetic.** Overflow / underflow can drain accounts.
- **Missing `Signer` constraint.** Anyone can call.
- **Missing `mut` on account.** Anchor rejects write.
- **Wrong discriminator.** Fetching wrong account type returns garbage.

## Summary

- Anchor program = `#[program]` mod + `#[derive(Accounts)]` structs + `#[account]` data.
- `require!` + custom errors for validation.
- Checked math; always-error on overflow.
- IDL + TS client = full type safety.

Next: program-derived addresses (PDAs).
