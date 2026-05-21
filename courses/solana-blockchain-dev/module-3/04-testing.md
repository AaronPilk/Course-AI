---
module: 3
position: 4
title: "Testing Anchor programs"
objective: "Write comprehensive integration tests for Solana programs."
estimated_minutes: 5
---

# Testing Anchor programs

## anchor test workflow

```bash
anchor test
```

What happens:
1. Builds program (`anchor build`).
2. Starts `solana-test-validator` locally.
3. Deploys program to local validator.
4. Runs Mocha tests from `tests/` directory.
5. Stops validator.

For: full integration test cycle.

## Basic test structure

```typescript
import * as anchor from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor"
import { Counter } from "../target/types/counter"
import { expect } from "chai"

describe("counter", () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const program = anchor.workspace.Counter as Program<Counter>

  it("initializes and increments", async () => {
    const counter = anchor.web3.Keypair.generate()

    await program.methods
      .initialize()
      .accounts({
        counter: counter.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([counter])
      .rpc()

    await program.methods.increment()
      .accounts({
        counter: counter.publicKey,
        user: provider.wallet.publicKey
      })
      .rpc()

    const account = await program.account.counter.fetch(counter.publicKey)
    expect(account.count.toNumber()).to.equal(1)
  })
})
```

For: starting point.

## PDA derivation

```typescript
const [pdaAddress, pdaBump] = anchor.web3.PublicKey.findProgramAddressSync(
  [Buffer.from("user"), userWallet.publicKey.toBuffer()],
  program.programId
)
```

Mirror PDA derivation from program.

For: predict + use PDA addresses.

## Multiple wallets

```typescript
import { airdrop } from "../helpers"

const alice = anchor.web3.Keypair.generate()
const bob = anchor.web3.Keypair.generate()

await airdrop(provider, alice.publicKey, 2)
await airdrop(provider, bob.publicKey, 2)

await program.methods.transfer(amount)
    .accounts({ from: aliceAccount, to: bobAccount, authority: alice.publicKey })
    .signers([alice])
    .rpc()
```

For: multi-actor scenarios.

## Airdrop helper

```typescript
async function airdrop(provider, publicKey, sol = 2) {
  const sig = await provider.connection.requestAirdrop(
    publicKey,
    sol * anchor.web3.LAMPORTS_PER_SOL
  )
  await provider.connection.confirmTransaction(sig, "confirmed")
}
```

Reusable test setup.

For: pre-loading test accounts.

## Token testing

```typescript
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAccount
} from "@solana/spl-token"

const mint = await createMint(
  provider.connection,
  provider.wallet.payer,
  provider.wallet.publicKey,
  null,
  6  // decimals
)

const userAta = await createAssociatedTokenAccount(
  provider.connection,
  provider.wallet.payer,
  mint,
  alice.publicKey
)

await mintTo(provider.connection, provider.wallet.payer, mint, userAta, provider.wallet.publicKey, 1_000_000)

// Now use in program test
```

For: realistic token scenarios.

## Asserting errors

```typescript
import { assert } from "chai"

it("rejects unauthorized update", async () => {
  try {
    await program.methods.update()
        .accounts({ counter: counterPubkey, user: imposter.publicKey })
        .signers([imposter])
        .rpc()
    assert.fail("Should have thrown")
  } catch (err) {
    expect(err.error.errorCode.code).to.equal("Unauthorized")
  }
})
```

For: negative test cases.

## Logs assertion

```typescript
const tx = await program.methods.action()
    .accounts({ /* */ })
    .rpc({ commitment: "confirmed" })

const txInfo = await provider.connection.getTransaction(tx, { commitment: "confirmed" })
const logs = txInfo.meta.logMessages
expect(logs.some(log => log.includes("Program log: success"))).to.be.true
```

For: verifying msg! output.

## Event listening

```typescript
const listener = program.addEventListener("PurchaseEvent", (event, slot) => {
  expect(event.price.toNumber()).to.equal(expectedPrice)
})

await program.methods.purchase(price).accounts({...}).rpc()

await program.removeEventListener(listener)
```

For: verifying emitted events.

## Mock time

Local validator can advance time:

```typescript
import { setClockSysvar } from "anchor-bankrun"  // optional helper

// Or use anchor-bankrun for time control
```

For: testing time-dependent logic.

## Fuzzy testing

For high-stakes programs:
- Echidna (Ethereum) inspired tools.
- `trident` for Anchor fuzzing.
- Property-based testing pattern.

```rust
proptest! {
  #[test]
  fn token_balance_invariant(amount in 0u64..1_000_000_000u64) {
    // Random amount; check invariants
  }
}
```

For: catching edge cases.

## Snapshot testing

```typescript
const state = await program.account.market.fetch(marketAddress)
expect(state).toMatchSnapshot()
```

Detects unexpected state changes between code revisions.

For: regression prevention.

## CI configuration

```yaml
# .github/workflows/test.yml
- run: cargo install --git https://github.com/coral-xyz/anchor avm --locked
- run: avm install latest && avm use latest
- run: anchor test
```

Run on every PR.

For: catch breakage before merge.

## Common test gotchas

- **Tx fails silently.** Add try/catch + log.
- **Airdrop rate limits.** Test validator may need delays.
- **Time-based bugs.** Use `Clock::get()` and mock when possible.
- **Slot finalization.** Use `confirmed` commitment by default.

## Coverage targets

For production programs:
- Initialize tests for every Accounts struct.
- One success + one failure path per instruction.
- Edge cases: zero amounts, max amounts, expired conditions.
- Integration: full user flow end-to-end.

For: production-ready test suite.

## Mistakes to avoid

- **Only happy path tests.** Catch attack vectors with failure tests.
- **No CI.** Tests die slowly without enforcement.
- **No event/log assertions.** Programs may "succeed" silently with wrong behavior.
- **Sharing state between tests.** Each test should be independent.

## Summary

- anchor test runs full integration cycle.
- Use SPL Token helpers for realistic token scenarios.
- Test both success + failure paths.
- Event/log assertions verify deeper behavior.
- CI on every PR prevents regression.

Module 3 complete. Module 4: tokens and NFTs.
