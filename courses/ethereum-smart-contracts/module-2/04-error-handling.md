---
module: 2
position: 4
title: "Error handling and assertions"
objective: "Use require / revert / custom errors effectively."
estimated_minutes: 5
---

# Error handling and assertions

## require

```solidity
function withdraw(uint256 amount) external {
    require(amount > 0, "Amount must be positive");
    require(balances[msg.sender] >= amount, "Insufficient balance");
    require(!paused, "Contract paused");
    balances[msg.sender] -= amount;
    payable(msg.sender).transfer(amount);
}
```

`require` reverts with optional message. Gas refunded for unused.

For: input validation + business rules.

## revert

```solidity
function action(uint256 input) external {
    if (input == 0) revert("Cannot be zero");

    // Or with custom error (cheaper)
    if (input > MAX) revert ValueTooHigh(input, MAX);
}
```

Explicit revert; same effect as require.

For: complex control flow.

## Custom errors (Solidity 0.8.4+)

```solidity
error InsufficientBalance(uint256 available, uint256 required);
error Unauthorized();
error AmountTooHigh(uint256 amount, uint256 max);

function withdraw(uint256 amount) external {
    if (balances[msg.sender] < amount) {
        revert InsufficientBalance(balances[msg.sender], amount);
    }
    // ...
}
```

Cheaper than string revert: ~24 bytes vs. ~200+ bytes encoded. Typed args returned to client.

For: gas-efficient + actionable errors.

## assert

```solidity
function transfer(address to, uint256 amount) external {
    require(balances[msg.sender] >= amount, "Insufficient");
    balances[msg.sender] -= amount;
    balances[to] += amount;
    assert(balances[msg.sender] + balances[to] == totalBefore);  // Invariant check
}
```

`assert` for invariants that should NEVER fail. Triggers Panic (different from Revert).

In 0.8+: pre-checked overflow uses Panic too.

For: catching impossible conditions.

## Reverts in calls

```solidity
function callExternal() external {
    (bool success, bytes memory data) = target.call(...);

    if (!success) {
        // Propagate the revert reason
        assembly {
            revert(add(data, 0x20), mload(data))
        }
    }
}
```

Low-level `call()` returns success bool; doesn't auto-revert. Useful for try/catch alternatives.

For: handling external call failures.

## Decoding errors client-side

```typescript
try {
  await contract.withdraw(amount)
} catch (err) {
  if (err.code === "CALL_EXCEPTION") {
    console.log(err.reason)  // String revert reason
  }
  if (err.data) {
    // Custom error
    const decoded = contract.interface.parseError(err.data)
    console.log(decoded.name, decoded.args)
  }
}
```

For: actionable client UX.

## Common require patterns

```solidity
// Authorization
require(msg.sender == owner, "Not owner");

// Range check
require(amount > 0 && amount <= maxAmount, "Invalid amount");

// State machine
require(state == State.Active, "Wrong state");

// Address validation
require(recipient != address(0), "Zero address");

// Time
require(block.timestamp >= unlockTime, "Locked");

// External contract
require(token.transfer(to, amount), "Token transfer failed");
```

For: defense in depth.

## checks-effects-interactions (CEI)

```solidity
function withdraw(uint256 amount) external {
    // 1. Checks
    require(balances[msg.sender] >= amount, "Insufficient");

    // 2. Effects (update state)
    balances[msg.sender] -= amount;

    // 3. Interactions (external calls)
    payable(msg.sender).transfer(amount);
}
```

Prevents reentrancy: state updated before external call.

For: standard security pattern.

## Panic codes

Solidity 0.8+ uses Panic for:
- 0x01: assert failed.
- 0x11: arithmetic overflow.
- 0x12: divide by zero.
- 0x21: cast to bool with wrong value.
- 0x22: storage byte array invalid encoding.
- 0x31: pop empty array.
- 0x32: array out of bounds.
- 0x41: out of memory.
- 0x51: invalid function ptr.

For: debugging exception classes.

## Gas cost of revert

- Plain `revert()`: ~100 gas.
- `require(true, "msg")`: ~50 gas check.
- `require(false, "long error message...")`: includes all gas used + bytes for message.

Custom errors are cheaper than strings.

For: optimization.

## try/catch (for external calls)

```solidity
function maybeGetData(address target) external returns (uint256) {
    try IExternal(target).getData() returns (uint256 result) {
        return result;
    } catch Error(string memory reason) {
        emit Failed(reason);
        return 0;
    } catch Panic(uint256 errorCode) {
        emit PanicFailure(errorCode);
        return 0;
    } catch (bytes memory lowLevelData) {
        emit UnknownFailure(lowLevelData);
        return 0;
    }
}
```

Only works for external calls + contract creation. Local function calls can't try/catch.

For: graceful external failure handling.

## Reverts in receive / fallback

```solidity
receive() external payable {
    require(allowDeposits, "Deposits paused");
}
```

If `receive` reverts, sender's tx reverts. Good for blocking unwanted ETH.

For: controlled deposit flow.

## Errors in inheritance

```solidity
error Unauthorized();

contract Base {
    function adminOnly() external {
        if (msg.sender != admin) revert Unauthorized();
    }
}

contract Child is Base {
    function inheritedError() external {
        revert Unauthorized();  // Uses Base's error
    }
}
```

Errors can be inherited like functions.

For: shared error definitions.

## Returning errors vs. reverting

```solidity
// Pattern 1: revert on failure
function strict(uint256 a, uint256 b) external pure returns (uint256) {
    require(a > b, "a must exceed b");
    return a - b;
}

// Pattern 2: return success bool
function lenient(uint256 a, uint256 b) external pure returns (bool success, uint256 result) {
    if (a < b) return (false, 0);
    return (true, a - b);
}
```

Reverting is standard; lenient pattern for cases where caller wants to handle failure.

For: API design choice.

## Mistakes to avoid

- **Stringly-typed reverts in hot paths.** Costs gas.
- **Assert for input validation.** Burns all gas.
- **No error message.** Hard to debug.
- **Reverting in receive without explanation.** ETH transfers fail mysteriously.

## Summary

- require / revert / custom errors / assert.
- Custom errors (0.8.4+) are gas-cheap + typed.
- CEI pattern prevents reentrancy.
- try/catch for external call failures only.

Module 2 complete. Module 3: token standards.
