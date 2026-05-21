---
module: 5
position: 3
title: "L2 deployment"
objective: "Deploy to Arbitrum, Optimism, Base, and other L2s."
estimated_minutes: 5
---

# L2 deployment

## Why L2

L1 mainnet costs:
- Simple transfer: $2-20.
- DEX swap: $20-100.
- NFT mint: $20-200.

L2 costs (post EIP-4844):
- Simple transfer: $0.02-0.10.
- DEX swap: $0.10-1.
- NFT mint: $0.05-0.50.

10-100× cheaper. Users live on L2.

For: economic deployment choice.

## L2 categories

| Type | Examples | Withdraw | Security |
|------|----------|----------|----------|
| Optimistic Rollups | Arbitrum, Optimism, Base | 7 days | Fraud proofs |
| ZK Rollups | zkSync, Polygon zkEVM, StarkNet, Scroll | Minutes-hours | ZK proofs |
| Validium | Immutable X | Days-weeks | Off-chain data |
| Sidechains | Polygon PoS | Bridge-dependent | Own validators |

EVM-equivalent rollups (Arbitrum, Optimism, Base) = drop-in deploy.

For: tradeoff understanding.

## Arbitrum

```typescript
// hardhat.config.ts
networks: {
  arbitrum: {
    url: "https://arb1.arbitrum.io/rpc",
    accounts: [PK],
    chainId: 42161
  },
  arbitrumSepolia: {
    url: "https://sepolia-rollup.arbitrum.io/rpc",
    chainId: 421614
  }
}
```

- Largest L2 by TVL.
- ~250ms block times.
- Largest DeFi ecosystem.

For: most active L2.

## Optimism + Base

- Optimism mainnet. Original optimistic rollup.
- Base. Coinbase's L2 on OP Stack.
- Both EVM-equivalent.
- OP Superchain: shared interop.

```typescript
optimism: { url: "https://mainnet.optimism.io", chainId: 10 },
base: { url: "https://mainnet.base.org", chainId: 8453 },
```

For: consumer-grade L2s.

## zkSync Era

Different VM (zkEVM, not 100% EVM-equivalent):
- Some opcodes behave differently.
- Native account abstraction.
- Different gas model.

```typescript
zkSync: { url: "https://mainnet.era.zksync.io", chainId: 324 }
```

Requires hardhat-zksync plugin for deployment.

For: when you need ZK-rollup benefits.

## Polygon zkEVM

EVM-equivalent ZK rollup:
- 100% bytecode compatible.
- Faster finality than optimistic.

```typescript
polygonZkEvm: { url: "https://zkevm-rpc.com", chainId: 1101 }
```

For: ZK security without code changes.

## Deploy script

```typescript
// Same script, just different --network flag
npx hardhat run scripts/deploy.ts --network arbitrum
npx hardhat run scripts/deploy.ts --network base
npx hardhat run scripts/deploy.ts --network optimism
```

For: multi-chain workflow.

## Etherscan equivalents

Each L2 has its own explorer:
- Arbitrum: Arbiscan.
- Optimism: Optimistic Etherscan.
- Base: Basescan.
- zkSync: zkSync Era Explorer.

Verify on each separately. Some support multi-chain verification via Etherscan.

For: transparency per chain.

## Bridge architecture

```
L1 (Ethereum) ←→ Bridge contract ←→ L2 sequencer
```

Deposit: L1 → L2 takes minutes.
Withdraw: L2 → L1 takes:
- 7 days (optimistic).
- Minutes-hours (ZK).

For: timing user expectations.

## Native bridges vs. third-party

- **Native (official).** Trustless but slow withdraw.
- **Third-party (Hop, Across, Stargate).** Faster (minutes) but charges fee + adds trust assumption.

```typescript
// Always recommend native bridge for highest security
const officialBridge = "https://bridge.arbitrum.io"
```

For: user education.

## Address consistency

Often deploy to same address across chains using CREATE2 + salt:

```typescript
import { computeAddress } from "viem"

const salt = keccak256(toHex("MyApp"))
const initCode = "0x..."  // Contract bytecode
const address = computeAddress({ from: deployer, salt, initCode })
// Same address on every chain
```

Better UX: users recognize same address.

For: cross-chain consistency.

## Multi-chain factory

```solidity
contract Factory {
    function deploy(bytes32 salt) external returns (address) {
        return address(new MyContract{salt: salt}());
    }
}
```

Deploy Factory once per chain at same address; then deploy any contract via factory at predictable addresses.

For: programmable deploys.

## Per-chain fork testing

```typescript
// Foundry foundry.toml
[rpc_endpoints]
mainnet = "${MAINNET_RPC}"
arbitrum = "${ARBITRUM_RPC}"
optimism = "${OPTIMISM_RPC}"
base = "${BASE_RPC}"

// Run tests per chain
forge test --fork-url arbitrum
```

For: realistic per-chain testing.

## L2-specific considerations

Differences from L1:
- **block.timestamp.** L2 sequencer sets; may drift slightly.
- **block.number.** Different cadence; don't use for time calculations.
- **gas semantics.** L2 charges different opcodes differently.
- **MEV.** Less MEV on L2 currently.
- **Sequencer downtime.** Sometimes L2 pauses; users can't transact.
- **Bridges.** Each bridge has different trust model.

For: aware of L2 quirks.

## Cross-chain messaging

```solidity
import "@openzeppelin/contracts/crosschain/CrossChainEnabled.sol";
```

Hyperlane / LayerZero / Axelar / Wormhole let contracts talk across chains.

For: cross-chain dApps.

## Account abstraction (ERC-4337)

```typescript
// Smart wallet pays gas via paymaster
const aa = createSmartWalletClient({...})
await aa.sendUserOperation({...})
```

zkSync, Base, Arbitrum support ERC-4337. Use cases: gasless tx, social recovery, batched ops.

For: modern wallet UX.

## Cost considerations

L2 deploy cost:
- Arbitrum: $5-20 (varies).
- Optimism: $5-15.
- Base: $5-15.
- zkSync: $5-15.

Verify cost = small.

Mainnet: $50-500+ per deploy.

For: economic shipping plan.

## Mistakes to avoid

- **Hardcoded chainId.** Use `block.chainid`.
- **Reusing L1 patterns blindly on L2.** Timestamps, MEV, gas differ.
- **No L2 testing.** L1 fork doesn't catch L2 quirks.
- **Forgetting to verify each chain.** Users can't read code.

## Summary

- L2 is 10-100× cheaper; deploy there for consumer dApps.
- Arbitrum/Optimism/Base = EVM-equivalent; drop-in.
- ZK rollups have faster withdraw but some compatibility quirks.
- Same address across chains via CREATE2.
- Test on each L2 fork.

Next: audits and monitoring.
