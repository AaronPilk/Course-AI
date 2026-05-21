---
module: 2
position: 4
title: "Fees and mempool"
objective: "Estimate fees and understand mempool dynamics."
estimated_minutes: 5
---

# Fees and mempool

## What the mempool is

Memory pool: unconfirmed txs waiting to be mined. Each node maintains its own (may differ across nodes).

Tx flow:
```
1. Wallet broadcasts tx.
2. Nearby nodes validate + add to mempool.
3. Propagate to other nodes.
4. Miners select highest-fee txs.
5. Mined → removed from mempool.
```

For: pre-confirmation life.

## Fee unit: sat/vB

Bitcoin fees measured in satoshis per virtual byte (sat/vB).

Tx size:
- P2PKH transfer: ~226 vB → 4,520 sats fee at 20 sat/vB.
- P2WPKH transfer: ~141 vB → 2,820 sats.
- Taproot transfer: ~111 vB → 2,220 sats.

For: fee math.

## Fee market

When mempool full, miners pick highest sat/vB first. Users compete.

Typical levels (varies wildly):
- Low congestion: 1-5 sat/vB.
- Medium: 10-30 sat/vB.
- High (NFT mania, halving): 100-1000+ sat/vB.

For: time-of-day pricing.

## Fee estimation

```bash
bitcoin-cli estimatesmartfee 6   # ~6 block confirmation target
```

Returns sat/kB. Most wallets do this automatically.

Common targets:
- Next block (10 min): high fee.
- 6 blocks (~1 hour): medium.
- 144 blocks (~1 day): low.

For: tradeoff cost vs. speed.

## Mempool clearing

When demand drops below block space:
- Mempool drains.
- Fees fall.
- Next mempool full → fees spike.

Cyclical. Use mempool.space to see real-time.

For: time tx for cheap windows.

## Tx priority

Mempool selection priority (modern Bitcoin Core):
1. Highest fee rate (sat/vB) wins.
2. Ancestor / descendant relationships considered.
3. CPFP allows child tx fee to lift parent.

For: maximize tx inclusion probability.

## RBF (Replace-By-Fee)

Sender can replace unconfirmed tx with higher fee version:
```
Tx 1: 5 sat/vB → mempool, not mined
Tx 2 (replaces Tx 1): 25 sat/vB → mempool replaces Tx 1
```

Required: original tx signaled RBF (sequence number < 0xFFFFFFFE).

For: stuck tx recovery.

## CPFP (Child-Pays-For-Parent)

Receiver speeds up someone else's tx:
```
Parent (5 sat/vB stuck) → Child spending parent output (50 sat/vB)
Miner must include both to get child's fee → high effective rate.
```

For: accelerating incoming tx.

## Ancestor / descendant limits

Bitcoin Core limits:
- 25 unconfirmed ancestors per tx.
- 101 KB total ancestor + descendant size.

Prevents mempool spam attacks.

For: protocol-level guard.

## Pinning attacks

Attacker can pin a tx in mempool:
1. Spend output before victim confirms.
2. Low fee + high size → can't RBF easily.
3. Victim's tx stuck.

Lightning watchtowers + careful tx construction mitigate.

For: aware of edge case.

## Tx propagation

Goal: every node sees same mempool eventually.

Reality:
- Slight differences across nodes.
- Miner pool may have private mempool (some prefer not to leak strategy).
- Tx propagation usually <1 second globally.

For: network behavior.

## Fee estimation tools

- **mempool.space.** Real-time mempool + fee recommendations.
- **bitcoiner.live.** Historical fee data.
- **Bitcoin Core RPC.** estimatesmartfee.

Wallets often integrate.

For: practical fee setting.

## Replacing stuck tx walkthrough

```bash
# 1. Find your stuck tx
bitcoin-cli gettransaction <txid>

# 2. Create new tx with higher fee, same outputs, RBF flag
bitcoin-cli createrawtransaction ...

# 3. Sign + broadcast
bitcoin-cli signrawtransactionwithkey ...
bitcoin-cli sendrawtransaction ...
```

Wallet UIs (Electrum, Sparrow) automate.

For: hands-on unsticking.

## Fee tips

- **Off-peak hours.** US night → cheaper.
- **Weekend.** Often cheaper than weekday.
- **Use Taproot.** Smaller tx = lower fee.
- **Consolidate UTXOs in low-fee periods.** Reduce input count later.

For: economic tx management.

## Mistakes to avoid

- **Fee too low.** Tx stuck for days.
- **Fee too high.** Wasted money.
- **No RBF.** Can't recover from miscalculation.
- **Many tiny UTXOs.** Larger input count = higher fee.

## Summary

- Mempool: unconfirmed tx pool; per-node.
- Fees measured in sat/vB.
- Miners pick highest sat/vB; competitive market.
- RBF + CPFP for unsticking.
- mempool.space for real-time fee estimation.

Module 2 complete. Module 3: running a Bitcoin node.
