---
module: 3
position: 1
title: "Bitcoin Core install + setup"
objective: "Run your own Bitcoin node."
estimated_minutes: 5
---

# Bitcoin Core install + setup

## Why run a node

- Verify Bitcoin yourself (don't trust, verify).
- Privacy (queries don't go to a 3rd party).
- Support the network.
- Required for Lightning, Electrum servers, custom tools.

For: sovereignty.

## Hardware needs

Minimum:
- 600+ GB disk (full chain).
- 4 GB RAM.
- Always-on internet.

Recommended:
- 1 TB SSD (faster sync).
- 8 GB RAM.
- 1 Gbps unmetered connection.

For: realistic specs.

## Download Bitcoin Core

```bash
# Linux / macOS
wget https://bitcoincore.org/bin/bitcoin-core-26.0/bitcoin-26.0-x86_64-linux-gnu.tar.gz
tar xzf bitcoin-26.0-x86_64-linux-gnu.tar.gz
cd bitcoin-26.0

# Verify signatures (highly recommended)
gpg --verify SHA256SUMS.asc SHA256SUMS
sha256sum -c SHA256SUMS --ignore-missing
```

For: secure install.

## bitcoin.conf

```ini
# ~/.bitcoin/bitcoin.conf
server=1
txindex=1
rpcuser=youruser
rpcpassword=yourpassword
prune=0          # 0 = keep full chain; or 5500 for 5.5 GB pruned
dbcache=4000     # 4 GB cache; faster sync
```

For: configuration.

## Initial Block Download (IBD)

```bash
./bin/bitcoind -daemon
```

First sync downloads ~600 GB; takes:
- SSD + good CPU: ~12-24 hours.
- HDD + slow CPU: 1-2 weeks.

Watch progress:
```bash
./bin/bitcoin-cli getblockchaininfo
```

For: getting started realistically.

## Pruning

```ini
prune=5500   # Keep last 5.5 GB of blocks
```

Saves disk; can't serve older blocks; can't run Lightning fully. Good for small SSDs.

For: minimal disk.

## Run as service

```bash
# systemd unit
sudo nano /etc/systemd/system/bitcoind.service

[Unit]
Description=Bitcoin Core
After=network.target

[Service]
Type=forking
User=bitcoin
ExecStart=/usr/local/bin/bitcoind -daemon
Restart=on-failure

[Install]
WantedBy=multi-user.target

sudo systemctl enable bitcoind
sudo systemctl start bitcoind
```

For: production daemon.

## Tor for privacy

```ini
proxy=127.0.0.1:9050
listen=1
bind=127.0.0.1
torcontrol=127.0.0.1:9051
```

Hides node operator IP; less network surveillance.

For: privacy.

## Mistakes to avoid

- **No backup of wallet.dat.** Lose funds if disk dies.
- **Public RPC port.** Anyone can drain wallet.
- **Skipping signature verification.** Compromised binary.

## Summary

- Bitcoin Core = reference implementation.
- Need 600+ GB disk, decent CPU.
- Initial sync 12h to weeks.
- Pruning for small disks; Tor for privacy.

Next: bitcoin-cli essentials.
