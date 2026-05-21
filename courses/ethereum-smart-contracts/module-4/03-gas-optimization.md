---
module: 4
position: 3
title: "Gas optimization"
objective: "Reduce gas costs through proven patterns."
estimated_minutes: 5
---

# Gas optimization

## Storage is expensive

| Op | Gas |
|----|-----|
| SSTORE zero → nonzero | 20,000 |
| SSTORE nonzero → zero | 5,000 + refund |
| SSTORE nonzero → nonzero | 5,000 |
| SLOAD warm | 100 |
| SLOAD cold (first access) | 2,100 |

Storage is the dominant cost.

For: prioritizing optimizations.

## Pack structs

```solidity
// BAD: 3 slots
struct UserBad {
    uint256 amount;
    uint64 timestamp;
    address user;
    bool active;
}

// GOOD: 2 slots
struct UserGood {
    uint128 amount;    // 16 bytes
    uint64 timestamp;  // 8 bytes
    bool active;       // 1 byte  → packed in slot 0 (still 7 bytes free)
    address user;      // 20 bytes → slot 1
}
```

Order from largest to smallest; pack same-slot fields.

For: 50%+ storage savings.

## Cache storage reads

```solidity
// BAD: 3 SLOADs
function bad() external view returns (uint256) {
    return data.x + data.x + data.x;
}

// GOOD: 1 SLOAD
function good() external view returns (uint256) {
    uint256 cached = data.x;
    return cached + cached + cached;
}
```

For: easy win in loops.

## Read length once in loops

```solidity
// BAD
for (uint256 i = 0; i < array.length; i++) { /* re-reads length each iter */ }

// GOOD
uint256 len = array.length;
for (uint256 i = 0; i < len; ) {
    // body
    unchecked { ++i; }
}
```

For: large loops.

## unchecked arithmetic

```solidity
// Solidity 0.8+ checks overflow by default; costs gas
for (uint256 i = 0; i < n; i++) { /* check on i+1 */ }

// Safe to use unchecked when overflow impossible
for (uint256 i = 0; i < n; ) {
    // body
    unchecked { ++i; }   // i can't overflow in realistic loops
}
```

For: loop counters; known-safe math.

## immutable for deploy-time constants

```solidity
// BAD: storage read each time
address owner;
constructor() { owner = msg.sender; }

// GOOD: bytecode-embedded; no storage
address immutable owner;
constructor() { owner = msg.sender; }
```

`constant` for hardcoded; `immutable` for set in constructor.

For: free reads.

## Custom errors over strings

```solidity
// BAD: ~200 bytes
require(amount > 0, "Amount must be greater than zero");

// GOOD: ~24 bytes
error AmountZero();
if (amount == 0) revert AmountZero();
```

Saves ~150-200 gas per revert + deploy bytes.

For: any contract with reverts.

## Function visibility costs

```solidity
function f(uint256[] memory data) public { /* */ }      // Higher gas
function f(uint256[] calldata data) external { /* */ }  // Lower gas
```

`calldata` skips copy to memory; `external` if not called internally.

For: external-facing functions.

## Optimizer settings

```
optimizer.runs: 200 → smaller deploy; slower runtime
optimizer.runs: 1000000 → larger deploy; faster runtime
```

Runtime-heavy contracts: high runs. Deploy-cost-sensitive: low runs.

For: tuning.

## viaIR

```toml
optimizer = true
via_ir = true
```

Compiles via intermediate representation; significantly better optimization.

Caveat: longer compile time.

For: production deployments.

## Bitmaps for booleans

```solidity
// BAD: 256 separate storage slots
mapping(uint256 => bool) claimed;

// GOOD: 1 slot per 256 flags
mapping(uint256 => uint256) claimedBitmap;

function isClaimed(uint256 id) external view returns (bool) {
    return claimedBitmap[id / 256] & (1 << (id % 256)) != 0;
}

function claim(uint256 id) external {
    claimedBitmap[id / 256] |= (1 << (id % 256));
}
```

256× less storage.

For: tracking many flags.

## Short-circuit evaluation

```solidity
// Cheap check first
require(amount > 0 && balances[msg.sender] >= amount, "Invalid");

// If amount == 0, second check skipped
```

For: micro-optimization.

## Avoid duplicate calls

```solidity
// BAD
if (balanceOf(user) > 0 && balanceOf(user) >= amount) { /* 2x SLOAD */ }

// GOOD
uint256 balance = balanceOf(user);
if (balance > 0 && balance >= amount) { /* 1x SLOAD */ }
```

For: cached values.

## Batch operations

```solidity
// BAD: deploy + tx overhead per
function transfer(address to, uint256 amount) external { /* */ }

// GOOD: amortize overhead
function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external {
    for (uint256 i = 0; i < recipients.length; ) {
        _transfer(msg.sender, recipients[i], amounts[i]);
        unchecked { ++i; }
    }
}
```

For: high-volume ops.

## Avoid copying arrays to memory

```solidity
// BAD
function process(uint256[] memory data) external { /* copies */ }

// GOOD if read-only
function process(uint256[] calldata data) external { /* zero copy */ }
```

For: large input arrays.

## Use events vs. storage for log data

```solidity
// BAD: storage every transaction
mapping(uint256 => Trade[]) public history;

// GOOD: emit only
event TradeEvent(uint256 indexed pair, address indexed user, uint256 amount);
```

History queryable off-chain via subgraph / indexer.

For: cheap event log instead of expensive storage.

## Assembly for extreme cases

```solidity
function efficientHash(bytes32 a, bytes32 b) external pure returns (bytes32 result) {
    assembly {
        mstore(0x00, a)
        mstore(0x20, b)
        result := keccak256(0x00, 0x40)
    }
}
```

Avoid unless profiling shows hot path.

For: last-mile optimization.

## Gas reporting

```bash
forge test --gas-report
```

Hardhat:
```typescript
import "hardhat-gas-reporter"
// In hardhat.config.ts:
gasReporter: { enabled: true, currency: "USD", coinmarketcap: KEY }
```

Identifies hot paths.

For: data-driven optimization.

## Realistic targets

- Standard ERC-20 transfer: ~50k gas.
- Standard ERC-721 mint: ~80k gas.
- Optimized ERC-721A mint of 5: ~150k total (~30k each).
- Uniswap V3 swap: 100-180k.
- AAVE deposit: 200-300k.

For: gas budgets.

## Mistakes to avoid

- **Over-optimizing.** Readability > marginal gas savings.
- **Premature optimization.** Profile first.
- **Unsafe `unchecked`.** Overflow exploits.
- **Inline assembly without profiling.** Maintenance burden, marginal win.

## Summary

- Storage is dominant cost; pack + cache + bitmap.
- `calldata` + `unchecked` + `immutable` for free wins.
- Custom errors over strings.
- `forge test --gas-report` for profiling.

Next: upgradeability patterns.
