---
module: 3
position: 1
title: "Why Anchor exists"
objective: "Understand what Anchor provides over raw Solana programs."
estimated_minutes: 5
---

# Why Anchor exists

## Raw vs. Anchor

Raw Solana program (no framework):
- Manual account deserialization.
- Manual signer + ownership checks.
- Manual instruction routing via discriminator parsing.
- Manual IDL or no client SDK.

Anchor:
- `#[derive(Accounts)]` validates accounts.
- `#[account]` handles serialization.
- `#[program]` routes instructions.
- IDL auto-generated; TS client typed.

Result: ~10× less boilerplate, far fewer bugs.

For: production Solana development.

## What Anchor provides

- **Account validation framework.** Declarative constraints.
- **Borsh serialization.** Auto-derived for accounts.
- **Discriminator system.** 8-byte type tag prevents account confusion attacks.
- **CPI helpers.** Typed cross-program calls.
- **IDL generation.** TypeScript-friendly interface.
- **Testing harness.** Mocha + ts-mocha + Anchor client.
- **Workspace.** Multi-program apps.

For: ergonomics + safety.

## What Anchor doesn't fix

- Compute unit limits (you still optimize).
- Tx size limits (still 1,232 bytes).
- Reentrancy detection (still runtime).
- Network outages (out of scope).

For: realistic expectations.

## Anchor.toml

```toml
[features]
seeds = false
skip-lint = false

[programs.localnet]
my_program = "MyProg11111111111111111111111111111111111111"

[programs.devnet]
my_program = "MyProg11111111111111111111111111111111111111"

[registry]
url = "https://anchor.projectserum.com"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

Configuration for cluster + wallet + scripts.

For: project setup.

## Workspaces (multi-program)

```toml
[programs.localnet]
counter = "Counter111111111111111111111111111111111111"
treasury = "Treasury11111111111111111111111111111111111"
```

```
programs/
  counter/
    src/lib.rs
  treasury/
    src/lib.rs
```

Both built + deployed via `anchor build` + `anchor deploy`.

For: multi-contract systems.

## Versioning

Anchor releases regularly. Pin in `Cargo.toml`:

```toml
[dependencies]
anchor-lang = "0.30.0"
anchor-spl = "0.30.0"
```

```bash
avm install 0.30.0
avm use 0.30.0
```

Match team version; avoid surprise breakage.

For: reproducible builds.

## Common dependencies

```toml
[dependencies]
anchor-lang = "0.30.0"
anchor-spl = { version = "0.30.0", features = ["metadata"] }

[features]
no-entrypoint = []      # For workspace re-exports
no-idl = []             # Skip IDL gen
cpi = ["no-entrypoint"]
default = []
```

For: library setup.

## When NOT to use Anchor

- Highly compute-constrained programs needing every CU.
- Programs with non-standard account models.
- Educational projects to understand Solana internals.
- Some MEV / arbitrage programs.

Most production apps benefit from Anchor; only ~5% have reason to go raw.

For: knowing the limits.

## Solana Playground

`https://beta.solpg.io` — browser-based Anchor IDE. Build, deploy, test without local setup. Great for learning.

For: quick experimentation.

## Anchor vs. other frameworks

- **Seahorse.** Python-like syntax → compiles to Anchor. Learning-friendly.
- **Native (no framework).** Maximum control + minimum safety.
- **Sealevel Attacks repo.** Anti-patterns + Anchor solutions; mandatory reading.

For: choosing your level.

## Mistakes to avoid

- **Mismatched Anchor versions.** `avm use X.Y.Z` matches Cargo dep.
- **Skipping IDL.** Frontend type safety lost.
- **Mixing raw + Anchor accounts.** Discriminator confusion.
- **Editing IDL by hand.** Regenerated on next build.

## Summary

- Anchor = de-facto Solana framework.
- Reduces boilerplate ~10×; catches bugs.
- Anchor.toml + Cargo.toml + workspaces for multi-program.
- Use Anchor unless you have a specific reason not to.

Next: accounts and constraints deeper.
