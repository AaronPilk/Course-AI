---
module: 3
position: 4
title: "Wallet management"
objective: "Master Bitcoin Core wallet ops and security."
estimated_minutes: 5
---

# Wallet management

## Create wallet

```bash
bitcoin-cli createwallet "mywallet"      # Encrypted at creation prompt
bitcoin-cli -rpcwallet=mywallet getnewaddress
```

Modern wallets are descriptor wallets (better key derivation tracking).

For: starting wallet.

## Encrypt + unlock

```bash
bitcoin-cli -rpcwallet=mywallet encryptwallet "strongpassphrase"
bitcoin-cli -rpcwallet=mywallet walletpassphrase "strongpassphrase" 600  # Unlock 10 min
bitcoin-cli -rpcwallet=mywallet walletlock
```

Without encryption, wallet.dat is plaintext keys.

For: at-rest security.

## Backup

```bash
bitcoin-cli -rpcwallet=mywallet backupwallet ~/backups/wallet-$(date +%Y%m%d).dat
```

Automate:
```bash
# Cron daily
0 2 * * * bitcoin-cli -rpcwallet=mywallet backupwallet ~/backups/wallet-$(date +\%Y\%m\%d).dat
```

Store backups offsite + offline.

For: redundant safety.

## Descriptor wallets

Modern format:
```
wpkh([deadbeef/84'/0'/0'/0/*]xpub.../0/*)
```

Encodes:
- Script type (wpkh = native SegWit).
- Master key fingerprint.
- Derivation path.
- xpub.

```bash
bitcoin-cli -rpcwallet=mywallet listdescriptors
bitcoin-cli createwallet "watchonly" true   # watch-only
bitcoin-cli importdescriptors '[...]'
```

For: portable wallet definitions.

## Watch-only wallet

Track addresses without ability to spend. Useful for monitoring cold storage.

```bash
bitcoin-cli createwallet "monitor" true
bitcoin-cli -rpcwallet=monitor importdescriptors '[{"desc":"wpkh(xpub.../*)","timestamp":0}]'
```

Now node tracks addresses; can show balances but not spend.

For: monitor without exposure.

## PSBT (Partially Signed Bitcoin Transactions)

Standard for multi-step signing:
```bash
# 1. Create unsigned tx
bitcoin-cli -rpcwallet=watch walletcreatefundedpsbt ...

# 2. Hardware wallet signs PSBT
# 3. Combine signatures
bitcoin-cli combinepsbt '[...]'

# 4. Finalize + broadcast
bitcoin-cli finalizepsbt <signed_psbt>
bitcoin-cli sendrawtransaction <hex>
```

Standard for cold storage workflows.

For: secure multi-sig + air-gapped signing.

## Hardware wallet integration

Modern Bitcoin Core supports HWI (Hardware Wallet Interface):
```bash
hwi enumerate
hwi --device-type ledger getmasterxpub --path "m/84'/0'/0'"

# Use xpub in Core for watch-only; sign with hardware later via PSBT
```

For: cold-key signing.

## Multi-sig setup

```bash
# Get xpubs from 3 hardware wallets
# Create 2-of-3 descriptor wallet
bitcoin-cli createwallet "multisig" false false "" false true

# Import descriptor
bitcoin-cli -rpcwallet=multisig importdescriptors '[{
  "desc":"wsh(sortedmulti(2,xpub1...,xpub2...,xpub3...))",
  "timestamp":0,
  "active":true
}]'
```

Spend requires 2 of 3 hardware wallet signatures via PSBT.

For: high-value custody.

## Coin control

```bash
bitcoin-cli -rpcwallet=mywallet listunspent
bitcoin-cli -rpcwallet=mywallet lockunspent false '[{"txid":"...","vout":0}]'
```

Lock specific UTXOs from auto-selection. Spend manually for privacy / fee control.

For: advanced spending.

## Wallet labels

```bash
bitcoin-cli -rpcwallet=mywallet setlabel <addr> "Customer ABC"
bitcoin-cli -rpcwallet=mywallet getaddressesbylabel "Customer ABC"
bitcoin-cli -rpcwallet=mywallet listlabels
```

Organize incoming + outgoing.

For: business / tax tracking.

## Wallet privacy

- Don't reuse addresses.
- Run node over Tor.
- Consider CoinJoin (Wasabi, Whirlpool) for sensitive UTXOs.
- Separate wallets for separate purposes.

For: real-world privacy.

## Cold storage workflow

1. Generate xpub on offline hardware wallet.
2. Import xpub to online watch-only wallet.
3. Receive payments to addresses derived from xpub.
4. When spending: create PSBT online → sign offline → broadcast online.

Funds never touch online machine.

For: gold-standard custody.

## Mistakes to avoid

- **No wallet.dat backup.** Disk dies = funds lost.
- **Weak passphrase.** Brute force.
- **Cold-storage on online node.** Defeats purpose.
- **Address reuse.** Privacy + security degradation.

## Summary

- createwallet + encryptwallet + backupwallet = basic ops.
- Descriptor wallets are modern standard.
- Watch-only + PSBT for cold-key signing.
- Multi-sig via sortedmulti descriptors.
- Cold storage = offline keys + online watch-only.

Module 3 complete. Module 4: Lightning Network.
