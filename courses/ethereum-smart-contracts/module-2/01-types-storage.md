---
module: 2
position: 1
title: "Types, storage, memory"
objective: "Master Solidity types and data location."
estimated_minutes: 5
---

# Types, storage, memory

## Value types

```solidity
bool flag = true;
uint256 amount = 1000;        // Default 256-bit unsigned
int128 signed = -50;          // Signed; smaller saves storage
address user = 0xAbc...;
address payable recipient;    // Can receive ETH
bytes32 hash = keccak256("data");
```

`uint` defaults to `uint256`. Smaller types (uint8, uint16) save gas only when packed.

For: numeric + identity data.

## Reference types

```solidity
string memory name = "Alice";    // Dynamic UTF-8
bytes memory data = hex"deadbeef"; // Dynamic bytes
uint256[] memory array;
uint256[10] storage fixedArray;  // Fixed size
mapping(address => uint256) public balances;
```

Reference types need explicit data location (storage / memory / calldata).

For: complex data.

## Mappings

```solidity
mapping(address => uint256) public balances;
mapping(address => mapping(address => uint256)) public allowances;

function get(address user) external view returns (uint256) {
    return balances[user];
}
```

Mappings can only be in storage. No iteration. Default value = 0 / empty for any key.

For: indexed lookups.

## Structs

```solidity
struct User {
    address wallet;
    uint128 balance;
    uint64 createdAt;
    bool isActive;
}

mapping(address => User) public users;

function createUser() external {
    users[msg.sender] = User(msg.sender, 0, uint64(block.timestamp), true);
}
```

For: bundled state.

## Data location: storage

- **storage.** Permanent on-chain.
- 32-byte slots.
- Most expensive (~20k gas for new write).
- State variables default to storage.

```solidity
uint256 public count;            // Storage
mapping(...) private balances;   // Storage
```

For: persistent data.

## Data location: memory

- **memory.** Temporary during execution.
- Cleared at function end.
- Cheap.

```solidity
function process(uint256[] memory input) external pure returns (uint256[] memory) {
    uint256[] memory result = new uint256[](input.length);
    for (uint i; i < input.length; i++) result[i] = input[i] * 2;
    return result;
}
```

For: scratch work.

## Data location: calldata

- **calldata.** Function input bytes.
- Read-only.
- Cheapest.

```solidity
function read(uint256[] calldata input) external pure returns (uint256) {
    return input[0];   // Direct access; no copy
}
```

Use calldata when you don't need to modify input.

For: gas-optimal external function inputs.

## Storage layout

Each state variable lives in one or more 32-byte slots:
- `uint256`: 1 slot.
- `uint128`: half slot (packed if next field fits).
- `bool`: 1 byte (packed).
- `address`: 20 bytes (packed if room).

Packing example:
```solidity
contract Packed {
    uint128 a;       // Slot 0 (bytes 0-15)
    uint128 b;       // Slot 0 (bytes 16-31) — packed!
    uint256 c;       // Slot 1
}
```

For: gas optimization.

## Constants vs. immutable

```solidity
uint256 public constant TAX = 50;       // Bytecode; no slot
address public immutable owner;          // Set in constructor; bytecode

constructor() {
    owner = msg.sender;
}
```

Both saved in bytecode (zero storage cost) but immutable allows runtime values.

For: cheap config.

## Type conversions

```solidity
uint256 a = 100;
uint8 b = uint8(a);             // Explicit downcast
uint128 c = uint128(a);
int256 d = int256(a);           // Same size cast
bytes32 e = bytes32(a);          // Cast to fixed bytes

address payable r = payable(someAddr);   // For .transfer() / .send()
```

For: type juggling.

## msg, tx, block globals

```solidity
msg.sender      // Caller (EOA or contract)
msg.value       // ETH sent with call
msg.data        // Full calldata
msg.sig         // First 4 bytes (function selector)

tx.origin       // Original EOA (avoid using for auth!)
tx.gasprice     // Effective gas price

block.timestamp // Current block time (seconds)
block.number    // Current block height
block.coinbase  // Validator address
```

For: contextual info.

## Strings vs. bytes

Strings are bytes with UTF-8 expectations. Most ops:
```solidity
string memory s = "hello";
bytes memory b = bytes(s);
uint256 len = b.length;          // bytes length, not char count
```

Comparing strings:
```solidity
keccak256(bytes(a)) == keccak256(bytes(b))
```

Direct == not supported for strings.

For: string handling pitfalls.

## Arrays

```solidity
uint256[] public dynamicArray;          // Length grows
uint256[10] fixed;                       // Length 10

function append(uint256 x) external {
    dynamicArray.push(x);
}

function len() external view returns (uint256) {
    return dynamicArray.length;
}
```

`.push()` and `.pop()` modify length.

For: collections.

## bytes vs. bytes32

- `bytes32`: fixed; one slot; faster comparisons.
- `bytes`: dynamic; multiple slots; flexible.

Prefer bytes32 for hashes, keys.

For: storage efficiency.

## Mistakes to avoid

- **Storage variable in loop.** Re-reads slot every iteration.
- **Returning storage struct copy.** Costs ~2100 gas per field.
- **Mixed-size struct without ordering.** Misses packing.
- **Default uint = uint256.** Larger than needed; saves nothing without packing.

## Summary

- Value types vs. reference types.
- storage (perm) / memory (temp) / calldata (input).
- Packing: same-slot tiny types save gas.
- constant / immutable for cheap config.

Next: functions, modifiers, events.
