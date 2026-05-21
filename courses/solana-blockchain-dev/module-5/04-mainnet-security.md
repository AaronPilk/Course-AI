---
module: 5
position: 4
title: "Mainnet deployment + security"
objective: "Ship to production safely; understand security best practices."
estimated_minutes: 5
---

# Mainnet deployment + security

## Mainnet readiness checklist

Before deploying:
- [ ] Comprehensive test coverage (happy + failure paths).
- [ ] Code audited by external firm (Halborn, OtterSec, Neodyme, Asymmetric Research, Zellic).
- [ ] All authorities documented + secured (hardware wallet / multi-sig).
- [ ] Upgrade authority transferred to multi-sig.
- [ ] Constants double-checked (treasury addresses, fee bps, mint pubkeys).
- [ ] Devnet beta tested with real users.
- [ ] Emergency pause / circuit-breaker.
- [ ] Incident response plan documented.

For: don't ship unprepared.

## Costs

Mainnet program deploy:
- Buffer account: ~2 SOL temporary.
- Final deploy: ~5 SOL for typical program.
- Account creation: 0.001-0.01 SOL each.

Have 10+ SOL on hand for first deployment.

For: budgeting.

## Deploy command

```bash
solana config set --url mainnet-beta

anchor build
anchor deploy --provider.cluster mainnet --provider.wallet ~/.config/solana/deployer.json
```

Verify program ID matches `declare_id!`.

For: ship to prod.

## Upgrade authority

Initial upgrade authority = deployer keypair.

```bash
# Transfer to multi-sig
solana program set-upgrade-authority <PROGRAM_ID> --new-upgrade-authority <MULTISIG_ADDRESS>

# Lock forever (irrevocable)
solana program set-upgrade-authority <PROGRAM_ID> --final
```

Tradeoff: locked = trustless; unlocked = fixable bugs.

For: governance decision.

## Multi-sig with Squads

Squads Protocol = Solana multi-sig standard.

```typescript
import * as multisig from "@sqds/multisig"

// Create 2-of-3 multisig
const [multisigPda] = multisig.getMultisigPda({ createKey: createKey.publicKey })
await multisig.rpc.multisigCreate({
  connection,
  creator: payer,
  multisigPda,
  configAuthority: null,
  threshold: 2,
  members: [
    { key: alice.publicKey, permissions: multisig.types.Permissions.all() },
    { key: bob.publicKey, permissions: multisig.types.Permissions.all() },
    { key: carol.publicKey, permissions: multisig.types.Permissions.all() }
  ]
})

// Then set as upgrade authority
```

For: decentralized control.

## Audit selection

Major firms:
- **Halborn.** Major Solana protocols.
- **OtterSec.** Solana-specialized.
- **Neodyme.** Sealevel security research origin.
- **Zellic.** Top-tier.
- **Asymmetric Research.** Sealevel attacks deep expertise.

Pricing: $20-150k depending on scope.

For: serious projects must audit.

## Common Solana vulnerabilities

- **Account substitution.** Caller passes wrong account; missing owner check.
- **Missing signer.** Forgot `Signer<'info>`.
- **Type confusion.** Wrong account type without discriminator.
- **Bump validation skipped.** PDA seed substitution.
- **Reinitialization attack.** init_if_needed runs init logic twice.
- **Math overflow.** Unchecked arithmetic with user input.
- **Sysvar substitution.** Pass wrong sysvar account.

Sealevel-attacks repo: realistic examples + Anchor mitigations.

For: defense study.

## Best practices summary

```rust
// 1. Use Anchor typed accounts
pub user: Account<'info, UserData>

// 2. Mark mutability explicitly
#[account(mut)]

// 3. Verify signers
pub authority: Signer<'info>

// 4. Validate PDAs
#[account(seeds = [b"user", user.key().as_ref()], bump = user_data.bump)]

// 5. has_one for ownership
#[account(has_one = authority)]

// 6. Custom constraints for business rules
#[account(constraint = ledger.balance >= amount @ MyError::Insufficient)]

// 7. Checked math
let new = balance.checked_sub(amount).ok_or(MyError::Overflow)?;
```

For: secure-by-default coding.

## Emergency pause

```rust
#[account]
pub struct Config {
    pub authority: Pubkey,
    pub paused: bool,
    pub bump: u8,
}

pub fn pause(ctx: Context<UpdateConfig>) -> Result<()> {
    ctx.accounts.config.paused = true;
    Ok(())
}

pub fn user_action(ctx: Context<UserAction>) -> Result<()> {
    require!(!ctx.accounts.config.paused, MyError::Paused);
    // ... rest of logic
}
```

Lets ops halt activity during incident.

For: circuit breaker.

## Monitoring

After deploy:
- **Helius webhooks.** Receive events.
- **Solscan / Solana FM.** Manual + alerting.
- **Custom Geyser plugin.** High-throughput needs.
- **Dune Analytics.** SQL queries on activity.

Watch:
- TVL trends.
- Failed tx rate.
- New unique users.
- Withdrawal patterns (red flag if spike).

For: catch problems early.

## Disaster recovery

When something breaks:
1. Pause via multi-sig.
2. Notify users via Discord / Twitter.
3. Investigate logs / replay tx.
4. If fund-risk: coordinate exit (proven flow, communicate widely).
5. Audit fix.
6. Deploy patched program.
7. Postmortem publicly.

For: trust through transparency.

## Liability + insurance

- **Nexus Mutual / InsurAce.** DeFi coverage; not specific to Solana but available.
- **Sherlock.** Solana now available.
- **Code4rena audits.** Competitive audit before launch.

For: serious capital protection.

## Tokenomics + treasury

- Multi-sig for treasury.
- Vesting contracts for team allocations.
- DAO governance for parameter changes.
- Public dashboard of holdings.

For: investor / community trust.

## Documentation

After launch:
- README with quickstart.
- Architecture diagram.
- Contract addresses + IDLs publicly hosted.
- Integration guide for partners.

For: ecosystem adoption.

## Community communication

- Discord for users.
- Twitter for announcements.
- GitHub for transparency.
- Bug bounty (Immunefi / Code4rena / direct).

For: healthy ecosystem.

## Mistakes to avoid

- **Single-sig upgrade auth in production.** Hot wallet compromise = rug.
- **No emergency pause.** Hours of damage during incident.
- **No audit.** Easy bugs found in prod.
- **Silent treasury.** Investors panic without transparency.

## Summary

- Audit + multi-sig + emergency pause = mainnet table stakes.
- Squads for Solana multi-sig.
- Webhooks + indexers for monitoring.
- Transparency wins trust during incidents.
- Bug bounty + community = long-term security.

That's the course. Next steps: deploy your first program to devnet, iterate, and ship to mainnet with confidence.
