---
module: 3
position: 4
title: "OpenZeppelin contracts library"
objective: "Master the most-used Solidity library."
estimated_minutes: 5
---

# OpenZeppelin contracts library

## What OpenZeppelin is

Audited, conventional library covering:
- All ERC standards (20, 721, 1155, 4626).
- Access control (Ownable, AccessControl, AccessManager).
- Security (ReentrancyGuard, Pausable).
- Cryptography (ECDSA, MerkleProof).
- Proxies + upgradeability.
- Utilities (math, strings, arrays).

```bash
npm install @openzeppelin/contracts
```

Industry standard; used by Uniswap, Compound, Aave.

For: production-ready building blocks.

## Ownable

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyContract is Ownable {
    constructor() Ownable(msg.sender) {}

    function adminAction() external onlyOwner { /* */ }
    function transferOwner(address newOwner) external onlyOwner {
        transferOwnership(newOwner);
    }
    function renounce() external onlyOwner {
        renounceOwnership();   // Sets owner to address(0)
    }
}
```

Single-owner pattern; not great for production multi-stakeholder governance.

For: simple admin.

## AccessControl (role-based)

```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MyContract is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mint(...) external onlyRole(MINTER_ROLE) { /* */ }
    function pause() external onlyRole(PAUSER_ROLE) { /* */ }
}
```

Multiple distinct roles; flexible permissions.

For: multi-stakeholder apps.

## AccessManager (v5)

Newer, more flexible:
```solidity
import "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import "@openzeppelin/contracts/access/manager/AccessManager.sol";
```

Centralized manager contract; permissions defined externally; admin can grant scheduled access.

For: complex DAO-like permissions.

## ReentrancyGuard

```solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Vault is ReentrancyGuard {
    function withdraw() external nonReentrant {
        // External call here safe from reentrancy
    }
}
```

Locks function during execution.

For: prevention layer in addition to CEI.

## Pausable

```solidity
import "@openzeppelin/contracts/utils/Pausable.sol";

contract MyContract is Pausable, Ownable {
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function action() external whenNotPaused { /* */ }
}
```

Emergency halt.

For: incident response.

## SafeERC20

```solidity
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

using SafeERC20 for IERC20;

function deposit(uint256 amount) external {
    IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
}
```

Handles tokens that don't return bool (USDT), tokens that revert on failure, fee-on-transfer.

For: any token integration.

## ECDSA signatures

```solidity
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
using ECDSA for bytes32;

function verify(bytes32 messageHash, bytes calldata signature) external view returns (bool) {
    address signer = messageHash.toEthSignedMessageHash().recover(signature);
    return signer == authorizedSigner;
}
```

Verifies off-chain signed messages on-chain.

For: meta-transactions, auth, EIP-712.

## EIP-712 typed data

```solidity
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract MyContract is EIP712 {
    bytes32 private constant TYPEHASH = keccak256("Order(address user,uint256 amount,uint256 nonce)");

    constructor() EIP712("MyApp", "1") {}

    function verify(Order calldata o, bytes calldata sig) external view returns (bool) {
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(TYPEHASH, o.user, o.amount, o.nonce)));
        return ECDSA.recover(digest, sig) == o.user;
    }
}
```

Wallets display structured data clearly; not just hash blobs.

For: better UX in signed orders / permits.

## MerkleProof

```solidity
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

function claim(bytes32[] calldata proof, uint256 amount) external {
    bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
    require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid proof");
    // ...
}
```

Compact allowlists; airdrops.

For: scalable off-chain → on-chain proofs.

## Math + utilities

```solidity
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Address.sol";

uint256 min = Math.min(a, b);
uint256 sqrt = Math.sqrt(x);
string memory s = Strings.toString(123);    // "123"
bool isContract = target.code.length > 0;
```

For: common operations.

## ERC4626 (tokenized vaults)

```solidity
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

contract MyVault is ERC4626 {
    constructor(IERC20 _asset) ERC4626(_asset) ERC20("Vault Shares", "vSHR") {}
}
```

Standard interface for yield-bearing vaults; depositors get shares.

For: DeFi vault interop.

## Proxy + upgradeability

```solidity
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// Implementation
contract MyContractV1 is Initializable, OwnableUpgradeable {
    function initialize() public initializer {
        __Ownable_init(msg.sender);
    }
}

// Deployed via TransparentUpgradeableProxy
// Later: upgrade to V2 with same proxy address
```

Use `@openzeppelin/contracts-upgradeable` for upgradeable variants; storage gaps required.

For: maintainable contracts.

## OZ Upgrades plugin

```bash
npm install @openzeppelin/hardhat-upgrades
```

```typescript
import { ethers, upgrades } from "hardhat"

const MyContract = await ethers.getContractFactory("MyContract")
const instance = await upgrades.deployProxy(MyContract, [arg1, arg2])
await instance.waitForDeployment()

// Later upgrade
const V2 = await ethers.getContractFactory("MyContractV2")
await upgrades.upgradeProxy(await instance.getAddress(), V2)
```

Validates storage layout compatibility automatically.

For: safe upgrades.

## Contracts Wizard

`https://wizard.openzeppelin.com` — interactive UI generates token contracts:
- ERC-20, 721, 1155, Governor.
- Toggle features (mintable, burnable, pausable, votes).
- Copy generated code.

For: starting fast.

## Versioning

```bash
npm install @openzeppelin/contracts@^5.0.0   # Current
npm install @openzeppelin/contracts@^4.9.0   # Legacy
```

Major versions break APIs. v5 introduced AccessManager, removed deprecated patterns.

For: dependency hygiene.

## Mistakes to avoid

- **Custom implementations of standards.** Use OZ; audited.
- **Mixing upgradeable + non-upgradeable.** Causes storage layout chaos.
- **Skipping upgrades plugin validation.** Brick contracts.
- **Old OZ versions for new projects.** Pin v5+ for current security model.

## Summary

- OpenZeppelin = audited library for everything ERC + access control + upgradeability.
- Use it for any production contract; don't reinvent.
- Contracts Wizard generates starter code.
- @openzeppelin/contracts-upgradeable + hardhat-upgrades for safe upgrades.

Module 3 complete. Module 4: security and patterns.
