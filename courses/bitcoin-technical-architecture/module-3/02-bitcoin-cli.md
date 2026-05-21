---
module: 3
position: 2
title: "bitcoin-cli essentials"
objective: "Query the chain and manage wallets from CLI."
estimated_minutes: 5
---

# bitcoin-cli essentials

## Status

```bash
bitcoin-cli getblockchaininfo            # Sync status, chain tip
bitcoin-cli getnetworkinfo               # Peer count + version
bitcoin-cli getmempoolinfo               # Mempool size + fees
bitcoin-cli uptime                        # Seconds since start
```

For: health checks.

## Chain queries

```bash
bitcoin-cli getblockcount                # Current block height
bitcoin-cli getblockhash 800000           # Hash of specific block
bitcoin-cli getblock <hash>                # Block details
bitcoin-cli getbestblockhash             # Tip hash

# Verbose block with txs
bitcoin-cli getblock <hash> 2
```

For: exploring history.

## Transactions

```bash
bitcoin-cli getrawtransaction <txid>      # Hex
bitcoin-cli getrawtransaction <txid> 2    # Decoded

bitcoin-cli decoderawtransaction <hex>    # Parse hex

# Search for tx (requires txindex=1)
bitcoin-cli gettransaction <txid>
```

For: tx inspection.

## Wallets

```bash
bitcoin-cli listwallets                   # Loaded wallets
bitcoin-cli loadwallet "myname"           # Load wallet
bitcoin-cli createwallet "newname"        # Create new

# Once loaded:
bitcoin-cli -rpcwallet=myname getbalance
bitcoin-cli -rpcwallet=myname getnewaddress
bitcoin-cli -rpcwallet=myname listunspent
```

For: wallet ops.

## Sending

```bash
bitcoin-cli -rpcwallet=myname sendtoaddress <addr> 0.01

# More control: PSBT (Partially Signed Bitcoin Transaction)
bitcoin-cli -rpcwallet=myname walletcreatefundedpsbt ...
```

For: payments.

## Fees

```bash
bitcoin-cli estimatesmartfee 6            # Fee for 6 block confirmation
bitcoin-cli getmempoolinfo               # Includes mempoolminfee
```

Returns BTC/kB. Wallets show sat/vB equivalent.

For: smart fee setting.

## Backup wallet

```bash
bitcoin-cli -rpcwallet=myname backupwallet /backup/wallet.dat
```

Encrypt + back up regularly. wallet.dat = funds.

For: never lose funds.

## Address management

```bash
bitcoin-cli -rpcwallet=myname getnewaddress "label" bech32
bitcoin-cli -rpcwallet=myname getaddressesbylabel "label"
bitcoin-cli -rpcwallet=myname listreceivedbyaddress
```

For: tracking received funds.

## Peer management

```bash
bitcoin-cli getpeerinfo                   # Connected peers
bitcoin-cli getconnectioncount             # Count
bitcoin-cli addnode "ip:port" "add"        # Manually add peer
```

For: network ops.

## Useful RPCs

```bash
bitcoin-cli help                          # All RPC commands
bitcoin-cli help getblockchaininfo        # Specific help
bitcoin-cli logging                        # Adjust logging
bitcoin-cli stop                           # Graceful shutdown
```

For: discovery + ops.

## Scripting with cli

```bash
# Total Bitcoin in your wallet (approx)
btc=$(bitcoin-cli -rpcwallet=myname getbalance)
echo "Balance: $btc BTC"

# Send daily summary
new_count=$(bitcoin-cli getmempoolinfo | jq '.size')
echo "Mempool: $new_count txs"
```

For: automation.

## RPC over network

```bash
curl --user user:pass --data-binary '{"jsonrpc":"1.0","method":"getblockcount"}' \
     -H "content-type:text/plain;" http://127.0.0.1:8332/
```

Programmatic access from any language.

For: integration.

## Mistakes to avoid

- **Exposing RPC port.** Wallet drain risk.
- **No regular backups.** Lose disk = lose funds.
- **Storing big wallet on hot node.** Use hardware wallet for serious sums.

## Summary

- bitcoin-cli for ops; rich RPC API.
- Wallet ops via -rpcwallet= flag.
- estimatesmartfee for fee setting.
- Always backup wallet.dat.

Next: RPC + indexing.
