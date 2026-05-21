---
module: 3
position: 3
title: "Instructions and contexts"
objective: "Structure Anchor instructions, args, and contexts effectively."
estimated_minutes: 5
---

# Instructions and contexts

## Instruction signature

```rust
pub fn create_offer(
    ctx: Context<CreateOffer>,
    price: u64,
    expiry: i64,
    metadata: String
) -> Result<()> {
    // Validate
    require!(price > 0, MyError::InvalidPrice);
    require!(expiry > Clock::get()?.unix_timestamp, MyError::Expired);
    require!(metadata.len() <= 200, MyError::MetadataTooLong);

    // Initialize
    let offer = &mut ctx.accounts.offer;
    offer.creator = ctx.accounts.creator.key();
    offer.price = price;
    offer.expiry = expiry;
    offer.metadata = metadata;
    offer.bump = ctx.bumps.offer;

    Ok(())
}
```

`ctx`: account validation + bumps. Args: instruction parameters.

For: standard instruction shape.

## ctx.bumps

```rust
offer.bump = ctx.bumps.offer;
```

Anchor provides bumps for all PDA constraints. Cache to avoid recomputation.

For: efficient PDA reuse.

## Clock sysvar

```rust
let now = Clock::get()?.unix_timestamp;
require!(now < expiry, MyError::Expired);
```

Built-in time access. Other sysvars: Rent, Epoch, Slot.

For: time-based logic.

## Multiple instructions

```rust
#[program]
pub mod marketplace {
    use super::*;

    pub fn create_listing(ctx: Context<CreateListing>, price: u64) -> Result<()> { /* */ }
    pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> { /* */ }
    pub fn purchase(ctx: Context<Purchase>, max_price: u64) -> Result<()> { /* */ }
    pub fn update_price(ctx: Context<UpdatePrice>, new_price: u64) -> Result<()> { /* */ }
}
```

Each becomes typed RPC call in client.

For: full program API.

## Argument types

```rust
pub fn instruction(
    ctx: Context<MyCtx>,
    bytes: Vec<u8>,           // Variable bytes
    array: [u64; 10],         // Fixed-size array
    text: String,             // Variable string
    option: Option<u64>,      // Optional
    flag: bool,
    amount: u64,
    keys: Vec<Pubkey>
) -> Result<()> { /* */ }
```

Borsh-serializable types. Max args size: ~10KB practical (tx limit).

For: rich instruction inputs.

## Returning values

```rust
pub fn get_price(ctx: Context<GetPrice>) -> Result<u64> {
    let price = compute_price(&ctx.accounts.market);
    Ok(price)
}
```

```typescript
const price = await program.methods.getPrice().accounts({...}).rpc()
```

Returned via simulated tx; visible to client.

For: read-only queries.

## Events

```rust
#[event]
pub struct PurchaseEvent {
    pub buyer: Pubkey,
    pub listing: Pubkey,
    pub price: u64,
    pub timestamp: i64,
}

pub fn purchase(ctx: Context<Purchase>, ...) -> Result<()> {
    // ... logic
    emit!(PurchaseEvent {
        buyer: ctx.accounts.buyer.key(),
        listing: ctx.accounts.listing.key(),
        price,
        timestamp: Clock::get()?.unix_timestamp
    });
    Ok(())
}
```

Logged to tx logs; subscribers can listen.

```typescript
program.addEventListener("PurchaseEvent", (event) => {
  console.log("Purchase:", event)
})
```

For: client notifications without polling.

## Logging

```rust
msg!("User {} deposited {} tokens", user.key(), amount);
```

Limited budget; expensive (~100 CU per log). Use sparingly in production.

For: debugging during dev; minimal in prod.

## Conditional instruction logic

```rust
pub fn execute(ctx: Context<Execute>, mode: u8) -> Result<()> {
    match mode {
        0 => execute_buy(ctx)?,
        1 => execute_sell(ctx)?,
        _ => return Err(MyError::InvalidMode.into())
    }
    Ok(())
}
```

Use sparingly — separate instructions usually cleaner.

For: minor variants of single flow.

## Optional accounts

```rust
#[derive(Accounts)]
pub struct Trade<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Optional referrer for fees
    pub referrer: Option<AccountInfo<'info>>,
}
```

Use `Option<...>` for accounts that may be absent.

For: flexible instruction shapes.

## Common patterns

### Initialize + auth pattern
```rust
pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    ctx.accounts.config.authority = ctx.accounts.deployer.key();
    Ok(())
}

pub fn update_param(ctx: Context<UpdateParam>, value: u64) -> Result<()> {
    // Anchor's has_one checks authority
    ctx.accounts.config.param = value;
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateParam<'info> {
    #[account(mut, has_one = authority)]
    pub config: Account<'info, Config>,
    pub authority: Signer<'info>,
}
```

For: admin-controlled config.

### Escrow pattern
```rust
pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    // Transfer user → escrow vault PDA
    token::transfer(/* cpi */, amount)?;
    ctx.accounts.escrow.deposited = amount;
    ctx.accounts.escrow.depositor = ctx.accounts.user.key();
    Ok(())
}

pub fn release(ctx: Context<Release>) -> Result<()> {
    // PDA signs token transfer back
    token::transfer(/* with PDA signer */, ctx.accounts.escrow.deposited)?;
    Ok(())
}
```

For: locked funds with conditional release.

## Mistakes to avoid

- **Forgetting `Result<()>` return.** Anchor enforces.
- **Mutable account without `mut`.** Compile error.
- **Big strings in args.** Tx size limit; use IPFS / Arweave for long data.
- **No instruction-level validation.** Constraints alone may not be enough; require!() in body for business rules.

## Summary

- Instructions: typed args + Context<Accounts>.
- ctx.bumps for PDA bumps.
- Events via #[event] + emit! for client-side reactivity.
- Clock sysvar for time; sysvars are global.

Next: testing Anchor programs.
