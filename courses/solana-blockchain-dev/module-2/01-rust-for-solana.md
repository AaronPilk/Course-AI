---
module: 2
position: 1
title: "Rust for Solana developers"
objective: "Master the Rust patterns you'll use daily writing Solana programs."
estimated_minutes: 5
---

# Rust for Solana developers

## Why Rust

Solana chose Rust for:
- Memory safety without GC.
- Predictable performance (compiles to native BPF).
- Strong type system catching bugs at compile time.
- Zero-cost abstractions.

Tradeoff: steeper learning curve than Solidity.

For: knowing why the pain is worth it.

## Variables and mutability

```rust
let x = 5;          // Immutable by default
let mut y = 10;     // Mutable
y += 1;             // OK
// x += 1;          // Compile error
```

Solana programs are mostly immutable until you explicitly want change.

## Types you'll use

```rust
u8, u16, u32, u64, u128     // Unsigned integers (token amounts: u64)
i8, i16, i32, i64           // Signed
bool                        // Boolean
String, &str                // Strings (heap vs. slice)
Vec<T>                      // Dynamic array
Option<T>                   // Some(value) or None
Result<T, E>                // Ok(value) or Err(error)
```

For: Solana types are constrained — no floats; u64 for lamports.

## Structs

```rust
pub struct UserAccount {
    pub authority: Pubkey,
    pub balance: u64,
    pub nickname: String,
}
```

Data layout for on-chain accounts. Pin all fields; size determines rent.

For: defining account state.

## Enums + pattern matching

```rust
pub enum AccountStatus {
    Active,
    Frozen,
    Closed { reason: String },
}

match status {
    AccountStatus::Active => process(),
    AccountStatus::Frozen => return Err(MyError::Frozen.into()),
    AccountStatus::Closed { reason } => msg!("Closed: {}", reason)
}
```

For: typed state machines.

## Ownership + borrowing

Rust's killer feature:
- Each value has one owner.
- Multiple immutable borrows OR one mutable borrow.
- Borrow checker enforces at compile time.

```rust
let user = UserAccount { /* ... */ };
let user_ref = &user;            // Immutable borrow
let user_mut = &mut user;        // ERROR: already borrowed
```

For: no data races; predictable mutability.

## Lifetimes

```rust
fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() > b.len() { a } else { b }
}
```

`'a` = lifetime annotation. References must live at least as long as the lifetime.

Solana code uses lifetimes heavily for AccountInfo references.

For: surviving compile errors in Anchor code.

## Result + ? operator

```rust
fn transfer(amount: u64) -> Result<()> {
    let sender = get_sender()?;        // ? propagates error
    let receiver = get_receiver()?;
    sender.transfer(receiver, amount)?;
    Ok(())
}
```

`?` returns early on `Err`; clean error handling.

For: program function flow.

## Custom errors

```rust
use anchor_lang::prelude::*;

#[error_code]
pub enum MyError {
    #[msg("Insufficient balance")]
    InsufficientBalance,
    #[msg("Unauthorized")]
    Unauthorized,
}

// Usage
return Err(MyError::InsufficientBalance.into());
```

Typed errors with messages; surface in client.

For: clear failure modes.

## Traits

```rust
trait Greet {
    fn hello(&self) -> String;
}

impl Greet for UserAccount {
    fn hello(&self) -> String {
        format!("Hi, {}", self.nickname)
    }
}
```

Solana uses traits heavily (AccountSerialize, etc.). Often auto-derived.

For: shared interfaces.

## Derive macros

```rust
#[derive(Debug, Clone, PartialEq)]
pub struct User { ... }
```

Auto-generates trait impls. Anchor adds:
- `#[derive(AnchorSerialize, AnchorDeserialize)]` for accounts.
- `#[account]` macro for full account boilerplate.

For: reducing boilerplate.

## Vec + iterators

```rust
let amounts: Vec<u64> = vec![100, 200, 300];
let total: u64 = amounts.iter().sum();
let doubled: Vec<u64> = amounts.iter().map(|x| x * 2).collect();
```

Functional iteration patterns.

For: data processing in programs.

## Option vs. unwrap

```rust
// Don't crash production
let maybe = some_function();
match maybe {
    Some(v) => use_value(v),
    None => return Err(MyError::NotFound.into())
}

// .unwrap() crashes if None — never in programs!
```

In Solana programs, `unwrap()` halts the chain transaction with a panic. Always handle `None`.

For: safe error handling.

## Memory in Solana context

Programs run in a sandboxed BPF VM:
- ~256 KB stack.
- Heap allocation limited.
- No stdlib subset (no file I/O, no network).
- Compute units limit overall work.

Implication: avoid `Box::new`, large `Vec`, recursion.

For: writing efficient programs.

## Common patterns from Anchor

```rust
use anchor_lang::prelude::*;

#[program]
pub mod my_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, name: String) -> Result<()> {
        let user = &mut ctx.accounts.user;
        user.authority = ctx.accounts.payer.key();
        user.name = name;
        Ok(())
    }
}
```

`Context<Accounts>` provides typed account access.

For: idiomatic Anchor.

## Mistakes to avoid

- **`unwrap()` everywhere.** Crashes program on edge cases.
- **Ignoring borrow checker.** Compile errors are real bugs.
- **`Vec` resizing in loops.** Heap thrash hurts compute units.
- **Floats.** Not deterministic across machines; banned in programs.

## Summary

- Rust = memory-safe systems language; steep learning curve.
- Result + ? for error propagation.
- Ownership + borrowing = compile-time safety.
- Anchor's derive macros remove most boilerplate.

Next: writing your first program.
