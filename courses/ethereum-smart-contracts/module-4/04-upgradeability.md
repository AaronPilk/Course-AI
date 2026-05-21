---
module: 4
position: 4
title: "Upgradeability patterns"
objective: "Design upgradable contracts without breaking storage."
estimated_minutes: 5
---

# Upgradeability patterns

## Why upgradeability

Contracts are immutable by default. Upgradeability lets you:
- Fix bugs.
- Add features.
- Adapt to new conditions.

Tradeoff: trust assumption (admin can change code) vs. immutability (no fixes possible).

For: design choice.

## Proxy pattern

```
User → Proxy contract → Implementation contract
       (storage)        (logic)
```

Proxy has storage. Calls delegatecall to implementation. Replacing implementation = upgrade.

For: state preservation across upgrades.

## Transparent Upgradeable Proxy

```solidity
// Deploy via OpenZeppelin
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MyContractV1 is Initializable {
    uint256 public value;

    function initialize(uint256 _value) public initializer {
        value = _value;
    }
}
```

```typescript
// hardhat-upgrades plugin
const Factory = await ethers.getContractFactory("MyContractV1")
const proxy = await upgrades.deployProxy(Factory, [42])
```

Admin can upgrade; users call same proxy address.

For: standard upgradeability.

## UUPS (Universal Upgradeable Proxy Standard)

```solidity
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract MyContractV1 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    function initialize() public initializer {
        __Ownable_init(msg.sender);
    }

    function _authorizeUpgrade(address newImpl) internal override onlyOwner {}
}
```

Upgrade logic lives in implementation, not proxy. Smaller proxy bytecode; saves gas per call.

For: gas-optimized upgrades.

## Initializer instead of constructor

```solidity
function initialize(uint256 _value) public initializer {
    // Replaces constructor
    value = _value;
}
```

Constructors don't run on proxy storage. Use `initializer` modifier (once-only).

For: upgradeable initialization.

## Storage slots layout

```solidity
contract V1 {
    uint256 public a;     // Slot 0
    uint256 public b;     // Slot 1
}

contract V2 {
    uint256 public a;     // Slot 0 — KEEP
    uint256 public b;     // Slot 1 — KEEP
    uint256 public c;     // Slot 2 — NEW (append only)
}
```

Never reorder or remove storage variables; only append.

For: avoiding storage collisions.

## Storage gaps

```solidity
contract V1 is Initializable {
    uint256 public a;
    uint256 public b;
    uint256[48] private __gap;   // Reserve 48 slots for future
}
```

Allows adding fields later without breaking inherited contracts.

For: future-proofing inheritance.

## OpenZeppelin Upgrades plugin

```typescript
// Deploy V1
const V1 = await ethers.getContractFactory("MyContractV1")
const proxy = await upgrades.deployProxy(V1, [42])

// Later: upgrade to V2
const V2 = await ethers.getContractFactory("MyContractV2")
await upgrades.upgradeProxy(await proxy.getAddress(), V2)
```

Plugin validates:
- Storage layout compatibility.
- No constructor (only initializer).
- No selfdestruct / delegatecall to non-allowlist.

For: safe upgrade automation.

## Diamond pattern (EIP-2535)

```
Diamond proxy → routes calls to multiple facets
                Facet A: token logic
                Facet B: governance logic
                Facet C: admin logic
```

Multiple implementations behind one address; modular updates.

Complex; mostly large protocols (Aavegotchi).

For: very large systems.

## Beacon proxy

```
User → Many proxies → Beacon → Implementation
```

One beacon controls implementation for many proxies. Upgrade all NFT contracts at once (e.g., per-game item contracts).

For: factory deployments.

## Initialize gotchas

```solidity
contract V2 is V1 {
    function initialize() public reinitializer(2) {
        // Runs once for upgrade
    }
}
```

`reinitializer(N)` runs once per version. Don't try `initializer` twice.

For: post-upgrade init.

## Self-destruct hazard

Upgradeable contracts shouldn't selfdestruct (would zero everything). OZ validator catches this.

For: avoid; EIP-6780 mostly killed selfdestruct anyway.

## OpenZeppelin Defender

UI for managing upgrades:
- Proposal queue with multi-sig.
- Storage validation.
- Audit log.
- Mainnet-safe automation.

For: production-grade upgrade workflow.

## Pause + freeze options

```solidity
contract MyContract is PausableUpgradeable, UUPSUpgradeable {
    function _authorizeUpgrade(address) internal override onlyOwner whenPaused {
        // Can only upgrade when paused
    }
}
```

Force pause before upgrades; reduces in-flight transaction issues.

For: smoother upgrade UX.

## Reverting trust

```solidity
function _authorizeUpgrade(address newImpl) internal override {
    revert("Upgrades disabled");
}
```

Or set owner to address(0) once happy:
```solidity
owner = address(0);   // Renounce; no more upgrades possible
```

For: progressive decentralization.

## Multi-sig + Timelock for upgrade auth

```
Implementation owner = Timelock controller
Timelock proposer = Multi-sig
```

Best practice for production:
- Multi-sig proposes.
- Timelock delays 48-72 hours.
- Users can exit before bad upgrade.

For: serious projects.

## Audit considerations

Auditors look for:
- Storage layout integrity across versions.
- Initialization protected.
- Upgrade auth secured.
- No selfdestruct paths.

For: avoid common pitfalls.

## When NOT to upgrade

Some contracts should be immutable:
- Token contracts (trust signaling).
- Final governance contracts.
- Library / utility contracts.

Then: deploy with no proxy, or renounce upgrade authority.

For: trust optimization.

## Mistakes to avoid

- **Reordering storage variables.** Catastrophic; reads wrong data.
- **No initializer modifier.** Anyone can re-init.
- **Single-key upgrade authority.** Rug risk.
- **No timelock on upgrades.** Surprise users; lose trust.

## Summary

- Proxy + Implementation = upgradeable.
- UUPS for gas-optimized; Transparent for compatibility.
- Storage append-only; use `__gap` arrays.
- Multi-sig + Timelock for production upgrade auth.
- Sometimes immutable is the right choice.

Module 4 complete. Module 5: testing + deployment.
