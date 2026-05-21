---
module: 4
position: 2
title: "Access control and ownership"
objective: "Design tiered permissions for production contracts."
estimated_minutes: 5
---

# Access control and ownership

## Why access control matters

Smart contracts hold value; uncontrolled access = drain risk. Every privileged function needs:
- **Authentication.** Who is calling?
- **Authorization.** Can they do this action?
- **Audit trail.** Who did what, when?

For: secure-by-default design.

## Ownable (simplest)

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyContract is Ownable {
    constructor() Ownable(msg.sender) {}

    function setFee(uint256 fee) external onlyOwner {
        _fee = fee;
    }
}
```

Single owner; transferable; renounceable.

For: simple admin; not production multi-stakeholder.

## Two-step ownership transfer

```solidity
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract Safer is Ownable2Step {
    // transferOwnership starts pending
    // acceptOwnership completes
}
```

Prevents accidental transfer to wrong address.

For: high-stakes production.

## AccessControl (role-based)

```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Multi is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    function mint(...) external onlyRole(MINTER_ROLE) { /* */ }
    function pause() external onlyRole(PAUSER_ROLE) { /* */ }
}
```

DEFAULT_ADMIN_ROLE controls all roles; can grant / revoke.

For: distinct permission sets.

## Setting role admin

```solidity
constructor() {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setRoleAdmin(MINTER_ROLE, GOVERNANCE_ROLE);   // GOV controls MINTER
    _grantRole(GOVERNANCE_ROLE, msg.sender);
}
```

Different roles can manage different subordinate roles.

For: hierarchy.

## Multi-sig pattern

Privileged operations behind multi-sig:

```solidity
// Gnosis Safe owner of contract
// Each operation requires N-of-M signatures

contract MyContract is Ownable {
    constructor(address gnosisSafe) Ownable(gnosisSafe) {}
}
```

Gnosis Safe (Safe Wallet): industry-standard multi-sig.

For: critical control.

## Timelock controller

```solidity
import "@openzeppelin/contracts/governance/TimelockController.sol";

// Owner = TimelockController
// Critical actions must be:
// 1. Proposed (logged)
// 2. Wait timelock period (e.g., 48 hours)
// 3. Execute

constructor(uint256 minDelay, address[] memory proposers, address[] memory executors, address admin) {
    timelock = new TimelockController(minDelay, proposers, executors, admin);
}
```

Users have time to exit if change is malicious.

For: trust through transparency.

## Governance contract (Governor)

```solidity
import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";

contract MyGov is Governor, GovernorVotes, GovernorTimelockControl {
    // Token-weighted voting
    // Proposals
    // Execution via timelock
}
```

Compound Bravo / Uniswap governance use OZ Governor.

For: DAO control.

## Pausable + Guardian

```solidity
import "@openzeppelin/contracts/utils/Pausable.sol";

contract MyContract is Pausable, AccessControl {
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    function emergencyPause() external onlyRole(GUARDIAN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();   // Only main admin can unpause
    }

    function action() external whenNotPaused { /* */ }
}
```

Guardian can pause instantly; only main admin can unpause. Bias toward safety.

For: incident response.

## Role separation example

Production token:
```
DEFAULT_ADMIN_ROLE → Multi-sig (slow, deliberate)
GUARDIAN_ROLE     → Faster-key wallets (pause only)
MINTER_ROLE       → Treasury contract (predictable supply)
BURNER_ROLE       → Users themselves (only burn own tokens)
```

Each role has minimum necessary permissions.

For: principle of least privilege.

## Whitelist / blacklist

```solidity
mapping(address => bool) public whitelist;
modifier onlyWhitelisted() {
    require(whitelist[msg.sender], "Not whitelisted");
    _;
}

mapping(address => bool) public blacklist;
modifier notBlacklisted() {
    require(!blacklist[msg.sender], "Blacklisted");
    _;
}
```

Use cautiously; centralization concern. Common in regulated tokens (USDC has blacklist).

For: compliance.

## Signature-based authorization

```solidity
function actionWithSig(uint256 amount, uint256 deadline, bytes calldata sig) external {
    require(block.timestamp <= deadline, "Expired");
    bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(TYPEHASH, msg.sender, amount, deadline)));
    require(ECDSA.recover(digest, sig) == authorizedSigner, "Invalid sig");
    // Action
}
```

Off-chain authorized; user submits signature + tx.

For: gasless approval flows.

## Nonces for replay protection

```solidity
mapping(address => uint256) public nonces;

function action(uint256 nonce, bytes calldata sig) external {
    require(nonce == nonces[msg.sender]++, "Bad nonce");
    // ...
}
```

Each signature usable once.

For: preventing replay.

## tx.origin pitfall

```solidity
// VULNERABLE
modifier onlyOwner() {
    require(tx.origin == owner, "Not owner");
    _;
}

// User signs tx to attacker.maliciousAction()
// Attacker contract calls victimContract.adminAction()
// tx.origin = user (still owner) → bypasses check!
```

Always use `msg.sender` for auth.

For: phishing defense.

## Trusted forwarder (meta-transactions)

```solidity
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Meta is ERC2771Context {
    constructor(address forwarder) ERC2771Context(forwarder) {}

    function action() external {
        address user = _msgSender();   // Returns original signer, not forwarder
    }
}
```

Lets users sign; relayer pays gas.

For: gasless UX.

## Mistakes to avoid

- **Ownable in production.** Single key = single point of failure.
- **No timelock on critical params.** Trust risk.
- **`tx.origin` for auth.** Phishable.
- **Renouncing ownership accidentally.** Locked out forever.

## Summary

- Ownable for simple; AccessControl for multi-role; Governor for DAO.
- Multi-sig (Gnosis Safe) + timelock for production.
- Pausable + Guardian for incident response.
- Always use msg.sender, never tx.origin for auth.

Next: gas optimization.
