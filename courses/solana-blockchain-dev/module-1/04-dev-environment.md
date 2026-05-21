---
module: 1
position: 4
title: "Setting up your dev environment"
objective: "Install Solana CLI, Rust, and Anchor; deploy your first program."
estimated_minutes: 5
---

# Setting up your dev environment

## Solana CLI

```bash
# Install
sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"

# Verify
solana --version
solana config get
```

CLI is your entry to chain operations: deploy programs, transfer SOL, view accounts.

For: command-line workflow.

## Network selection

```bash
# Devnet (free, test only)
solana config set --url https://api.devnet.solana.com

# Testnet
solana config set --url https://api.testnet.solana.com

# Mainnet
solana config set --url https://api.mainnet-beta.solana.com
```

Always start dev on devnet. Mainnet only for production.

For: network awareness.

## Create wallet

```bash
solana-keygen new --outfile ~/.config/solana/dev-wallet.json
solana config set --keypair ~/.config/solana/dev-wallet.json
solana address
```

Save the seed phrase securely. For development, fresh wallet OK; production wallet → hardware (Ledger).

For: identity for testing.

## Airdrop SOL on devnet

```bash
solana airdrop 2
solana balance
```

Free devnet SOL for testing. Rate-limited (~2 SOL/request).

For: paying for tests.

## Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup default stable
rustc --version
```

Solana programs are Rust.

For: program development.

## Anchor framework

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
anchor --version
```

Anchor = Solana's "Hardhat" — scaffolding, testing, deployment helper.

For: faster + safer program development.

## Initialize Anchor project

```bash
anchor init my-program
cd my-program
ls -la
```

Generates:
- `programs/my-program/` — Rust source.
- `tests/` — Mocha tests.
- `Anchor.toml` — config.
- `Cargo.toml` — Rust dependencies.

For: project structure.

## Hello world program

```rust
// programs/my-program/src/lib.rs
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod my_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Hello from Solana!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
```

Minimal Anchor program.

For: starter template.

## Build + deploy

```bash
anchor build
anchor deploy
```

Build compiles Rust → BPF (Solana bytecode). Deploy uploads to devnet at your configured network.

For: shipping a program.

## Tests

```typescript
// tests/my-program.ts
import * as anchor from "@coral-xyz/anchor"

describe("my-program", () => {
  anchor.setProvider(anchor.AnchorProvider.env())
  const program = anchor.workspace.MyProgram

  it("initializes", async () => {
    const tx = await program.methods.initialize().rpc()
    console.log("Tx:", tx)
  })
})
```

```bash
anchor test
```

For: TDD; integration tests against devnet or local validator.

## Local validator

```bash
solana-test-validator
```

Spin up local Solana network on localhost:8899. Instant blocks; pre-loaded SOL.

```bash
anchor test --skip-local-validator  # If validator already running
```

For: fast dev iteration without external network.

## Useful CLI commands

```bash
solana account <address>          # Inspect account
solana program show <programId>    # Program details
solana transaction-history <addr>  # Recent activity
solana logs                        # Live tx logs
solana confirm <signature>         # Check tx status
spl-token create-token             # Create a new token
```

For: daily operations.

## VS Code setup

Install extensions:
- `rust-analyzer`. Rust IDE support.
- `Solana`. Syntax + utilities.
- `Even Better TOML`. For Anchor.toml.

For: developer ergonomics.

## Wallet adapters for frontend

```bash
npm install @solana/web3.js @solana/wallet-adapter-react \
            @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
```

Browser wallet integration (Phantom, Solflare, Backpack).

For: dApp UI development.

## Helius / QuickNode RPC

Public RPC (`api.mainnet-beta.solana.com`) is rate-limited; production needs paid RPC.

Common providers:
- **Helius.** Solana-specialized; great free tier; webhooks + enhanced APIs.
- **QuickNode.** Multi-chain; reliable.
- **Triton.** Bare-metal performance.
- **Alchemy / Ankr.** Multi-chain options.

For: production-grade RPC.

## Mistakes to avoid

- **Mainnet wallet for dev.** Risks real funds. Use devnet wallet.
- **Public RPC in production.** Rate-limited; fails under load.
- **Skipping Anchor.** Possible but error-prone for new devs.
- **Old Solana CLI.** Network protocol changes occasionally; keep updated.

## Summary

- Install Solana CLI + Rust + Anchor.
- Generate wallet; airdrop devnet SOL.
- `anchor init` + `anchor build` + `anchor deploy`.
- Helius / QuickNode for production RPC.

Module 1 complete. Module 2: writing programs.
