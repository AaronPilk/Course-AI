---
module: 4
position: 4
title: "Running a Lightning node"
objective: "Operate a Lightning node from scratch."
estimated_minutes: 5
---

# Running a Lightning node

## Prerequisites

- Bitcoin Core full node (synced).
- 2 GB+ RAM.
- Stable internet.
- ~2 GB disk for channel data.

For: minimum specs.

## Choose implementation

| | Strengths | Best for |
|--|-----------|---------|
| LND | Most popular; great docs; large community | General use |
| Core Lightning | Modular; plugin ecosystem; strict spec | Power users |
| Eclair | Mobile-oriented (Phoenix) | Mobile + custom |
| LDK | Library; embed in your app | Devs |

Most beginners → LND or Umbrel / Start9 (turnkey).

For: software choice.

## LND quickstart

```bash
# Download
wget https://github.com/lightningnetwork/lnd/releases/download/v0.18.0-beta/lnd-linux-amd64-v0.18.0-beta.tar.gz
tar xzf lnd-*.tar.gz

# Config: ~/.lnd/lnd.conf
[Application Options]
alias=my-node
[Bitcoin]
bitcoin.active=true
bitcoin.mainnet=true
bitcoin.node=bitcoind
[Bitcoind]
bitcoind.rpchost=127.0.0.1
bitcoind.rpcuser=user
bitcoind.rpcpass=pass
bitcoind.zmqpubrawblock=tcp://127.0.0.1:28332
bitcoind.zmqpubrawtx=tcp://127.0.0.1:28333

# Run
./lnd
```

For: getting started.

## Create wallet

```bash
lncli create
```

Generates 24-word seed. Backup immediately on metal!

```bash
lncli unlock
```

Unlock on each restart.

For: first init.

## Connect to node

Get URI:
```bash
lncli getinfo
# pubkey@ip:9735
```

Share with peers to open channels.

For: peer discovery.

## Open first channel

```bash
# Connect to a node
lncli connect <pubkey>@<ip>:9735

# Open channel
lncli openchannel <pubkey> 500000   # 500k sats
```

Wait 6 L1 confirmations. Channel active.

For: bootstrap liquidity.

## Inbound liquidity sources

To receive payments, need inbound:
- **Lightning Pool.** Marketplace for liquidity swaps.
- **Pay services.** LNBig, Bitrefill — pay small fee, get channel.
- **Loop-out.** Convert outbound → inbound via Lightning Labs Loop.
- **Submarine swaps.** On-chain → off-chain.

For: balanced channels.

## Channel management

```bash
lncli listchannels                    # All channels
lncli channelbalance                  # Total local capacity
lncli pendingchannels                 # Opening / closing
lncli closechannel <funding_txid>:0   # Close
lncli forceclosechannel ...           # Force close
```

For: ops.

## Routing fees

```bash
lncli updatechanpolicy --base_fee_msat=1000 --fee_rate=0.000001
```

Set base + proportional fees. Default usually fine.

For: liquidity income.

## Backups

LND has Static Channel Backups (SCB):
```bash
cp ~/.lnd/data/chain/bitcoin/mainnet/channel.backup /backup/
```

Restore in disaster (lose drive). Channel will force-close but you recover most funds.

Auto-backup recommended (Mempool watchdog).

For: don't lose channels.

## Watchtowers

```bash
lncli wtclient add <watchtower_pubkey>@<ip>
```

Monitors your channels when offline; broadcasts penalty if needed.

For: offline safety.

## Lightning Address setup

```
lightning@yourdomain.com
```

Requires LNURL-pay server (e.g., LNbits, Alby Hub). Provides invoice generation per request.

For: human-friendly payments.

## Monitoring

```bash
# Status
lncli getinfo

# Open channels visualization
amboss.space or 1ml.com
```

Public node tools to monitor.

For: ops.

## Common operations

```bash
# Send
lncli payinvoice <bolt11>

# Generate invoice
lncli addinvoice --amt=1000 --memo="Pizza"

# Check balance
lncli channelbalance
```

For: daily use.

## Node operator considerations

To be a successful routing node:
- Maintain balanced liquidity.
- Reliable uptime (>99%).
- Reasonable fees (competitive).
- Channels to well-connected peers.
- Regular rebalancing.

ROI for retail nodes: marginal; mostly for fun + ideology.

For: realistic expectations.

## Mistakes to avoid

- **No backup of channel.backup.** Drive failure = funds at risk.
- **Closing prematurely.** Each open/close costs L1 fee.
- **Bad peer selection.** Force-closes drain you.
- **No watchtower if going offline.** Old-state attack risk.

## Summary

- LND most popular implementation; CLN / Eclair / LDK alternatives.
- Need running Bitcoin Core + 2GB RAM.
- Open channels; manage inbound liquidity.
- Channel.backup + watchtower essential.
- Monitor via Amboss / 1ml.

Module 4 complete. Module 5: security + ecosystem.
