---
module: 5
position: 1
title: "Custody: hot vs. cold storage"
objective: "Choose the right custody model for your situation."
estimated_minutes: 5
---

# Custody: hot vs. cold storage

## Custody spectrum

| | Hot | Warm | Cold | Deep cold |
|--|-----|------|------|-----------|
| Examples | Exchange, mobile wallet | Desktop wallet, HW connected | HW wallet offline | Multisig, paper, geographic distribution |
| Convenience | High | Medium | Low | Very low |
| Security | Low | Medium | High | Very high |
| Best for | Daily spending | Weekly use | Savings | Generational wealth |

For: matching custody to use.

## Hot wallets

Connected to internet:
- Phone wallets (BlueWallet, Phoenix).
- Exchange custody (Coinbase, Kraken).
- Browser wallets (rare for BTC).

Pros: instant access, payment-ready.
Cons: hackable if device compromised.

Recommendation: only keep what you'd lose without ruin.

For: spending money.

## Hardware wallets

Dedicated signing devices:
- **Ledger.** Most popular; closed-source firmware.
- **Trezor.** Open source; long history.
- **Coldcard.** Bitcoin-only; air-gapped.
- **BitBox.** Swiss-made; clean UX.
- **Foundation Passport.** Open source.

Private key never leaves device. Sign tx; broadcast via online machine.

For: meaningful funds.

## Self-custody pros + cons

Pros:
- No counterparty risk (FTX, Mt. Gox).
- Censorship-resistant.
- Privacy maintained.
- Aligned with Bitcoin ethos.

Cons:
- You're responsible (no password reset).
- Inheritance complex.
- Loss = permanent.

For: tradeoff.

## Mnemonic backup

24-word seed → universe of derived addresses.

Backup options:
- **Paper.** Cheap; vulnerable to fire/water.
- **Metal plate.** Steelmaster, Cryptosteel; fireproof.
- **Multiple geographic locations.** Reduces single-point loss.
- **Trusted family member.** Inheritance + redundancy.

NEVER:
- Store digital photo of mnemonic.
- Email or chat the words.
- Keep in cloud storage.

For: durable backup.

## Passphrase (25th word)

```
24 words + custom passphrase = different wallet
```

Adds plausible deniability. With duress, reveal "stealth" wallet without real funds.

But: forget passphrase = lose funds. Use carefully.

For: advanced protection.

## Multisig wallets

Require N of M keys to spend:
- **2-of-3.** Most common; lose any one, recover.
- **3-of-5.** Used for high value + treasuries.

Implementations:
- Sparrow Wallet.
- Specter Desktop.
- Casa.
- Unchained Capital.

For: shared / large custody.

## Inheritance planning

Without plan: heirs may not recover funds.

Options:
- **Multisig with attorney/family.** They have keys.
- **Time-locked tx.** Funds auto-recover after N years.
- **Vault services (Casa, Unchained).** Professional recovery.
- **Letter of instruction.** Explain to executor.

Consult lawyer for jurisdiction.

For: legacy planning.

## Test backups before scaling

```
1. Buy hardware wallet.
2. Generate seed.
3. Backup metal plate.
4. Wipe device.
5. Recover from backup.
6. Verify same addresses appear.
```

Only THEN deposit significant funds.

For: validation.

## Exchanges: not your keys

Holding BTC on exchange = trusting exchange. Risks:
- Hack (Mt. Gox, FTX, QuadrigaCX).
- Regulatory seizure.
- Withdrawal halts.
- Bankruptcy.

Rule: 95%+ in self-custody; only exchange amount being traded.

For: counterparty awareness.

## Coinjoin + privacy mixers

For privacy-conscious:
- Wasabi Wallet (Whirlpool).
- Samourai (deprecated).
- JoinMarket.

Mix tx to obscure source. Subject to evolving regulation.

For: enhanced privacy.

## Physical security

Beyond digital:
- Don't tell people you own BTC.
- Don't post big balances publicly.
- $5 wrench attack: someone may try to extract keys by force.
- Mitigation: don't be obvious target.

For: real-world threats.

## Mistakes to avoid

- **Backing up to phone gallery.** Hacked phone = funds gone.
- **Single backup.** Single point of failure.
- **No test recovery.** Backup might be incomplete.
- **All on one exchange.** "Not your keys, not your coins."

## Summary

- Hot wallets for daily; cold for savings; multisig for large.
- Hardware wallets sign offline; mnemonic backed up on metal.
- Multisig spreads risk; inheritance planning critical.
- Test recoveries; never trust untested backups.

Next: 51% attacks + MEV.
