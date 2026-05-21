---
module: 4
position: 1
title: "Reentrancy and CEI pattern"
objective: "Prevent the #1 smart contract vulnerability."
estimated_minutes: 5
---

# Reentrancy and CEI pattern

## What reentrancy is

Attacker contract recursively calls back into yours before state is updated. Drains funds because checks pass each time.

The 2016 DAO hack ($60M) was reentrancy.

For: understanding the canonical exploit.

## Vulnerable pattern

```solidity
contract Vulnerable {
    mapping(address => uint256) balances;

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");

        (bool success,) = msg.sender.call{value: amount}("");   // EXTERNAL CALL FIRST
        require(success);

        balances[msg.sender] = 0;   // STATE UPDATE AFTER (BAD)
    }
}

// Attacker contract
contract Attacker {
    receive() external payable {
        if (address(vulnerable).balance > 0) {
            vulnerable.withdraw();   // RE-ENTER
        }
    }

    function attack() external {
        vulnerable.deposit{value: 1 ether}();
        vulnerable.withdraw();
    }
}
```

Each reentrancy passes the check (balance still set) and drains 1 ether more.

For: spotting the bug.

## CEI pattern (Checks-Effects-Interactions)

```solidity
function withdraw() external {
    // 1. CHECKS
    uint256 amount = balances[msg.sender];
    require(amount > 0, "No balance");

    // 2. EFFECTS (update state)
    balances[msg.sender] = 0;

    // 3. INTERACTIONS (external calls last)
    (bool success,) = msg.sender.call{value: amount}("");
    require(success);
}
```

State zeroed before external call. Reentrant attacker sees `balances[attacker] == 0`; require fails.

For: standard secure pattern.

## ReentrancyGuard

```solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Safe is ReentrancyGuard {
    function withdraw() external nonReentrant {
        // External call here cannot recurse
    }
}
```

Locks function during execution; second call reverts.

Cost: ~5,000 gas overhead per call.

For: defense-in-depth.

## Read-only reentrancy

Newer variant: attacker doesn't recursively withdraw but reads a stale view function during reentrancy.

Example: vault reports `totalAssets` based on yet-to-be-updated state during external call; attacker exploits the stale value in another contract.

Mitigation:
- Use `nonReentrant` on critical view functions or check `_status` state.
- Snapshot in-flight state.

For: subtle exploit class.

## Cross-function reentrancy

```solidity
function deposit() external payable nonReentrant { /* */ }
function withdraw() external nonReentrant { /* */ }
function getBalance() external view returns (uint256) { /* no lock */ }
```

If `getBalance` is callable during external call (via different contract that calls back), and another caller acts on it → corrupt state seen.

Mitigation: critical view functions also use `nonReentrant` (read variant) or accept that views can be stale.

For: full cross-function defense.

## ERC-777 / ERC-1155 hooks

ERC-721/1155 send callbacks via `onERC*Received`. These callbacks can be reentrancy attack vectors.

```solidity
// Before transfer, state must be updated
function _safeTransfer(address from, address to, uint256 id) internal {
    _update(from, to, id);     // EFFECTS first
    if (to.code.length > 0) {
        // INTERACTION
        IERC1155Receiver(to).onERC1155Received(...);
    }
}
```

OpenZeppelin handles this correctly.

For: token transfer safety.

## Pull over push

```solidity
// PUSH pattern (risky)
function distribute() external {
    for (uint i; i < winners.length; i++) {
        payable(winners[i]).transfer(prize);
    }
}

// PULL pattern (safer)
mapping(address => uint256) public claimable;

function recordWinners(address[] memory winners) external {
    for (uint i; i < winners.length; i++) {
        claimable[winners[i]] += prize;
    }
}

function claim() external nonReentrant {
    uint256 amount = claimable[msg.sender];
    require(amount > 0, "Nothing to claim");
    claimable[msg.sender] = 0;
    payable(msg.sender).transfer(amount);
}
```

Users claim themselves; isolates failures.

For: robust distribution.

## transfer vs. call

```solidity
// .transfer (deprecated for ETH)
payable(to).transfer(amount);   // Fixed 2,300 gas; fails if recipient code uses more

// .call (modern)
(bool success,) = payable(to).call{value: amount}("");
require(success, "Transfer failed");
```

`.transfer` had hard 2,300 gas limit; broke with EIP-1884 gas changes. Use `.call`.

For: modern ETH sending.

## Checks-only reentrancy

Some attacks don't drain funds but corrupt state checks.

```solidity
function vote(uint256 proposalId) external {
    require(!hasVoted[msg.sender], "Already voted");
    // External call here lets attacker re-vote before flag set
    externalContract.someCall();
    hasVoted[msg.sender] = true;   // Too late
}
```

Move flag set before external call.

For: non-financial reentrancy.

## Gas-griefing reentrancy

Attacker forces revert by consuming all gas in `receive()`:

```solidity
// Vulnerable pattern: revert on transfer failure
function withdrawFromGroup() external {
    for (uint i; i < members.length; i++) {
        payable(members[i]).transfer(share);   // One member's receive() reverts everyone
    }
}

// Mitigation: don't revert on individual failure
for (uint i; i < members.length; i++) {
    (bool ok,) = payable(members[i]).call{value: share}("");
    if (!ok) failed.push(members[i]);   // Track but continue
}
```

For: batch payment robustness.

## Static analysis tools

- **Slither.** Free; catches most reentrancy patterns.
- **Mythril.** Symbolic execution; deeper bugs.
- **Echidna.** Property fuzzer; tests invariants under random inputs.

Run before deploy.

For: automated detection.

## Real-world attacks

- The DAO (2016): $60M; protocol fork.
- Cream Finance (2021): $130M; cross-asset reentrancy.
- BurgerSwap (2021): $7.2M.
- Curve / Vyper (2023): $73M; compiler reentrancy bug.

Reentrancy remains a top exploit category.

For: severity awareness.

## Mistakes to avoid

- **External call before state update.** Classic vulnerability.
- **Trusting `.transfer` gas stipend.** Use `.call` for modern Solidity.
- **Missing `nonReentrant` on critical functions.** Defense-in-depth helps.
- **Forgetting cross-function reentrancy.** Same lock should cover related functions.

## Summary

- Reentrancy = external call recursively re-enters before state update.
- CEI pattern (Checks-Effects-Interactions) prevents it.
- ReentrancyGuard adds defense-in-depth.
- Pull over push for distributions.

Next: access control and ownership.
