---
module: 1
position: 2
title: "Accounts, transactions, and gas"
objective: "Master Ethereum's account model and transaction lifecycle."
estimated_minutes: 5
---

# Accounts, transactions, and gas

## EOA vs. Contract Account

| | EOA | Contract |
|--|-----|----------|
| Private key | Yes | No |
| Initiate tx | Yes | No (called by EOA) |
| Has code | No | Yes |
| Has storage | No | Yes |
| Created by | Key generation | Deployment tx |

For: who controls what.

## Account fields

Every Ethereum account has:
- `nonce`. Counter (anti-replay; tx ordering).
- `balance`. Wei (1 ETH = 10^18 wei).
- `storageRoot`. Merkle root of storage (contracts only).
- `codeHash`. Hash of code (contracts only).

For: state representation.

## Wei + units

```
1 wei = 10^-18 ETH
1 gwei = 10^9 wei
1 ETH = 10^18 wei

Common amounts:
0.01 ETH = 10000000000000000 wei
1 gwei gas price = 0.000000001 ETH per gas unit
```

JS bigint or BigNumber library for safe math.

For: avoiding precision errors.

## Transaction fields

```typescript
{
  from: "0x...",        // EOA address (signer)
  to: "0x...",          // EOA, contract, or null (deploy)
  value: 1000000n,      // Wei amount
  data: "0x...",        // Function call data (encoded)
  nonce: 42,            // Account-specific counter
  gasLimit: 21000n,     // Max gas willing to spend
  maxFeePerGas: 30n,    // EIP-1559
  maxPriorityFeePerGas: 2n,
  chainId: 1            // 1 = mainnet, 11155111 = sepolia
}
```

For: tx construction.

## Calldata encoding

Contract function calls encoded as:
```
0xa9059cbb                                                    <- function selector (first 4 bytes of keccak256("transfer(address,uint256)"))
000000000000000000000000abcdef1234567890abcdef1234567890abcd  <- recipient address (padded)
0000000000000000000000000000000000000000000000000000000000000064 <- amount (100)
```

ABI encoding standard.

For: how tools talk to contracts.

## Gas mechanics

Each opcode consumes gas:
- Cheap: arithmetic, comparisons (3-5 gas).
- Moderate: memory access (3 gas + linear scaling).
- Expensive: storage (~20k gas SSTORE new, ~5k update).
- Very expensive: external call (~2600 gas baseline + execution).

Total gas paid even on revert (up to revert point).

For: cost intuition.

## Gas limit estimation

Wallets / clients estimate:
```typescript
const estimate = await contract.transfer.estimateGas(to, amount)
const gasLimit = estimate * 12n / 10n  // 20% buffer
```

If actual gas exceeds limit, tx reverts with "out of gas."

For: avoiding stuck txs.

## EIP-1559 detail

Pre-2021: simple `gasPrice` auction; users overpaid.
Post-2021:
- `baseFee` per block; adjusts based on previous block fullness; burnt.
- `maxPriorityFeePerGas` (tip); paid to validator.
- `maxFeePerGas` (cap); total user willing to pay.

Effective price = `min(maxFeePerGas, baseFee + maxPriorityFeePerGas)`.

For: efficient gas pricing.

## Gas tokens (deprecated)

Old hack: mint gas tokens cheaply during low-gas periods; redeem during high-gas. Killed by EIP-3529 (lower refund cap).

For: historical context.

## Tx confirmation levels

After submission:
- **Pending.** In mempool; not mined.
- **Mined.** In block; may re-org.
- **Confirmed.** N blocks deep (N typically 12-24).
- **Finalized.** Locked by consensus (~13 min).

```typescript
const tx = await contract.foo(...)
await tx.wait(1)    // 1 confirmation
await tx.wait(12)   // ~3 min; high confidence
```

For: UX timing.

## Mempool dynamics

Validators select txs by:
1. `gasPrice` / `maxFeePerGas` (higher first).
2. `nonce` ordering per sender.
3. Block gas limit.

Result: high-gas txs jump queue; under-priced txs stall.

For: choosing gas prices.

## MEV (Maximal Extractable Value)

Validators see mempool; can:
- Front-run user trades.
- Back-run trades (capture arbitrage).
- Sandwich attacks (buy + sell around user).

MEV tax: $1M+/day on Ethereum. Mitigations: Flashbots, private mempools, batch auctions.

For: aware of execution risk on big trades.

## Nonce gotchas

Nonce must be sequential per account:
- Nonce 5 sent then 7 sent: tx 7 stuck until 6 mined.
- Cancel stuck tx: send same nonce with higher gas + 0 value to self.

```typescript
await wallet.sendTransaction({
  to: wallet.address,
  value: 0,
  nonce: stuckNonce,
  maxFeePerGas: high,
  maxPriorityFeePerGas: high
})
```

For: unstucking.

## L2 differences

- Different gas pricing (lower base; some L2 fee + L1 calldata fee).
- Different blocktimes (Arbitrum 250ms).
- Different finality (Optimistic: 7d; ZK: hours).

Bridging required to move funds L1 ↔ L2.

For: L2-aware development.

## Mistakes to avoid

- **Wei vs. ETH confusion.** Off-by-18 disasters.
- **Same nonce reuse.** Tx replacement issues.
- **No gas estimation buffer.** OOG reverts.
- **Trusting pending tx.** Reorg possible.

## Summary

- EOA + Contract account types; both share address space.
- Wei is base unit; 10^18 wei per ETH.
- EIP-1559: baseFee (burnt) + priorityFee (tip).
- Confirmation < finalization; wait 12+ blocks for high stakes.

Next: blocks, finality, consensus.
