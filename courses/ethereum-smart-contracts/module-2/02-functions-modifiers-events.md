---
module: 2
position: 2
title: "Functions, modifiers, events"
objective: "Master function signatures, modifiers, and event emission."
estimated_minutes: 5
---

# Functions, modifiers, events

## Function visibility

```solidity
function publicFn() public { /* internal + external */ }
function externalFn() external { /* called from outside; cheaper for big calldata */ }
function internalFn() internal { /* same contract + inheritors */ }
function privateFn() private { /* this contract only */ }
```

For: access control.

## State mutability

```solidity
function view_() external view returns (uint256) { return state; }
function pure_() external pure returns (uint256) { return 42; }
function modifying() external { state++; }
function payable_() external payable { /* receives ETH */ }
```

- `view`. Reads state; no modify.
- `pure`. No state interaction.
- `payable`. Accepts ETH.

For: cost + safety.

## Function selectors

First 4 bytes of `keccak256(signature)`:

```
keccak256("transfer(address,uint256)") = 0xa9059cbb...
                                          ^^^^^^^^ selector
```

Tx calldata: selector + abi-encoded args.

For: how calls dispatch.

## Modifiers

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}

function withdraw() external onlyOwner {
    payable(owner).transfer(address(this).balance);
}

// Multiple modifiers run in order
function action() external onlyOwner whenNotPaused {
    // ...
}
```

`_;` marks where function body runs.

For: reusable pre/post checks.

## Modifier patterns

```solidity
modifier nonReentrant() {
    require(!_locked, "ReentrancyGuard: reentrant");
    _locked = true;
    _;
    _locked = false;
}

modifier validAmount(uint256 amount) {
    require(amount > 0 && amount <= maxAmount, "Invalid amount");
    _;
}
```

For: composable guards.

## Function overloading

```solidity
function transfer(address to, uint256 amount) external { /* */ }
function transfer(address to, uint256 amount, bytes calldata data) external { /* */ }
```

Solidity dispatches by full signature.

For: API flexibility.

## Events

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

function transfer(address to, uint256 amount) external {
    balances[msg.sender] -= amount;
    balances[to] += amount;
    emit Transfer(msg.sender, to, amount);
}
```

`indexed` lets you filter on the field; max 3 indexed params.

For: client notifications + off-chain indexers.

## Event log structure

```
Topic 0: keccak256(event signature)
Topic 1: indexed param 1
Topic 2: indexed param 2
Topic 3: indexed param 3
Data: non-indexed params (ABI-encoded)
```

Indexed strings → keccak256 hash stored, not the string. Filterable but not retrievable.

For: efficient on-chain notifications.

## Listening to events

```typescript
import { ethers } from "ethers"

const filter = contract.filters.Transfer(null, userAddress)
const events = await contract.queryFilter(filter, fromBlock, "latest")

contract.on("Transfer", (from, to, amount, event) => {
  console.log(`${from} → ${to}: ${amount}`)
})
```

For: building UIs from on-chain data.

## Constructor

```solidity
contract MyContract {
    address public immutable owner;
    uint256 public initialSupply;

    constructor(uint256 _supply) {
        owner = msg.sender;
        initialSupply = _supply;
    }
}
```

Runs once at deploy; can't be called later.

For: initialization.

## Fallback + receive

```solidity
contract Vault {
    receive() external payable {
        // Plain ETH transfer (no calldata)
    }

    fallback() external payable {
        // ETH with unknown calldata OR no receive defined
    }
}
```

`receive` catches plain ETH; `fallback` catches everything else.

For: ETH acceptance + proxy contracts.

## Returning multiple values

```solidity
function getInfo() external view returns (uint256 a, address b, bool c) {
    return (1, msg.sender, true);
}

// Tuple destructuring
(uint256 x, address y, bool z) = contract.getInfo();
```

For: bundled output.

## Public state variables auto-generate getters

```solidity
uint256 public count;        // count() returns uint256
mapping(address => uint256) public balances;  // balances(address) returns uint256
struct User { string name; uint256 age; }
mapping(uint256 => User) public users;        // users(id) returns name, age
```

For: read-only API without writing functions.

## Function return data limits

External returns size matters:
- Returned via memory.
- Costs gas to copy + return.
- Avoid returning huge arrays.

Use events for large data; let client subscribe.

For: cost-conscious design.

## try/catch

```solidity
try externalContract.someFunction() returns (uint256 result) {
    // Success
} catch Error(string memory reason) {
    // Revert with reason
} catch Panic(uint256 errorCode) {
    // Solidity panic
} catch (bytes memory lowLevelData) {
    // Anything else
}
```

Only works for external calls + contract creations.

For: defensive composition.

## Mistakes to avoid

- **tx.origin for auth.** Vulnerable to phishing contracts.
- **Forgetting `payable` on receiving function.** Reverts.
- **Public when external sufficient.** Higher gas on internal-from-external calls.
- **Emitting after state change inconsistency.** Listeners see inconsistent state.

## Summary

- Visibility: public / external / internal / private.
- Mutability: view / pure / payable.
- Modifiers compose pre/post checks.
- Events with `indexed` for off-chain indexers.

Next: inheritance and interfaces.
