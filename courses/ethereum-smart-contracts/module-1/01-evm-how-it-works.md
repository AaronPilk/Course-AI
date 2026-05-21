---
module: 1
position: 1
title: "EVM and how Ethereum works"
objective: "Understand the Ethereum Virtual Machine and execution model."
estimated_minutes: 5
---

# EVM and how Ethereum works

## What Ethereum is

Ethereum = decentralized world computer. Every node runs the same programs and reaches the same result. State changes are agreed upon by consensus.

Not just money: smart contracts can be DEXs, lending, identity, games, governance — anything expressible as code.

For: understanding scope beyond payments.

## EVM (Ethereum Virtual Machine)

The EVM is a stack-based VM. Smart contracts compile to EVM bytecode; nodes execute identically.

Key properties:
- **Deterministic.** Same input → same output everywhere.
- **Isolated.** Contracts can't access OS, network, or file system.
- **Stateful.** Storage persists on-chain.
- **Pay-per-op.** Every instruction costs gas.

For: why contracts run the way they do.

## Account types

Two account types:
- **EOA (Externally Owned Account).** Wallets. Have private key. Initiate transactions.
- **Contract Account.** Have code + storage. Triggered by tx from EOA or another contract.

Both share same address space.

For: who can do what.

## State

Global state = mapping of all addresses → account data:
```
address → { balance, nonce, code (if contract), storage (if contract) }
```

Updated atomically per block.

For: mental model of "what's on chain."

## Gas

Every EVM operation costs gas:
```
SLOAD (read storage):  ~2100 gas
SSTORE (write):        ~20000 gas (new) / ~5000 (update)
ADD:                   3 gas
CALL:                  ~2600 gas
```

Tx specifies `gasLimit` + `gasPrice` (or `maxFeePerGas` post-EIP-1559).

Total cost = gas used × gas price.

For: cost model fundamentals.

## EIP-1559 fee structure

```
totalFee = (baseFee + priorityFee) × gasUsed
```

- `baseFee` adjusts based on block fullness; burnt.
- `priorityFee` (tip) goes to validator.
- Wallets typically set both automatically.

For: modern fee mechanics.

## Block structure

Ethereum blocks (~12 seconds):
- Block header (parent hash, state root, timestamp).
- Tx list.
- Receipts.

Block gas limit: ~30M gas. Limits total work per block.

For: scaling constraints.

## Consensus: Proof of Stake

Since 2022 (the Merge):
- Validators stake 32 ETH each.
- Selected to propose blocks pseudo-randomly.
- Other validators attest to proposed block.
- Finalization in ~12-15 minutes (2 epochs).

For: trust model.

## Layer 2s

L1 mainnet expensive ($1-50 per tx). L2s:
- **Optimistic rollups.** Arbitrum, Optimism, Base. 7-day withdraw period; cheaper.
- **ZK rollups.** zkSync, StarkNet, Polygon zkEVM. Cryptographic proofs; faster withdraws.
- **Sidechains.** Polygon PoS. Independent consensus.

L2s 10-100× cheaper than L1.

For: deploy where users are.

## Transaction lifecycle

```
1. User signs tx in wallet
2. Submit to mempool (pending tx pool)
3. Validator picks tx; includes in block
4. Block proposed + attested
5. Block finalized after ~13 min
6. Tx receipt available
```

Confirmation ≠ finalization.

For: UX timing expectations.

## Smart contract execution

```
1. EOA sends tx targeting contract address
2. EVM loads contract bytecode
3. Executes function (selected by 4-byte function selector)
4. Reads/writes storage
5. Emits events
6. Returns value or reverts
7. State updated atomically (all-or-nothing)
```

For: function call model.

## Reverts

If contract reverts (insufficient gas, require fails, explicit revert):
- All state changes undone.
- Gas up to revert point consumed.
- Tx still mined; just no effect.

For: failure semantics.

## Storage vs. memory vs. calldata

- **storage.** Permanent on-chain. 32-byte slots. Expensive.
- **memory.** Temporary during execution. Cheap.
- **calldata.** Tx input data. Read-only. Cheapest.

```solidity
function f(uint256[] calldata input) external view returns (uint256 sum) {
    uint256[] memory temp = new uint256[](input.length);
    // ...
}
```

For: cost-conscious data handling.

## Mistakes to avoid

- **Putting big data in storage.** $10s of dollars per write.
- **Thinking ETH transactions are instant.** Wait for confirmations.
- **Assuming gas == ETH.** Gas is units; ETH is paid via gas price × gas.
- **Deploying to mainnet without L2 consideration.** Users pay 10-100× more.

## Summary

- EVM = deterministic, isolated, pay-per-op VM.
- Two account types: EOA + Contract.
- EIP-1559 base + priority fee model.
- L2s cut costs 10-100×; deploy where users are.

Next: accounts, transactions, gas detail.
