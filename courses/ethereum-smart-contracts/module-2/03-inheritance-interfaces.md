---
module: 2
position: 3
title: "Inheritance and interfaces"
objective: "Compose contracts with inheritance and define interfaces."
estimated_minutes: 5
---

# Inheritance and interfaces

## Single inheritance

```solidity
contract Animal {
    string public name;

    function speak() public virtual returns (string memory) {
        return "...";
    }
}

contract Dog is Animal {
    function speak() public pure override returns (string memory) {
        return "Woof";
    }
}
```

`virtual` = can be overridden; `override` = overriding.

For: code reuse.

## Multiple inheritance

```solidity
contract Ownable { /* ... */ }
contract Pausable { /* ... */ }

contract MyContract is Ownable, Pausable {
    // Inherits both
}
```

C3 linearization handles diamond problem.

For: composition.

## Constructor chaining

```solidity
contract Parent {
    uint256 immutable parentVal;
    constructor(uint256 v) { parentVal = v; }
}

contract Child is Parent(42) {
    constructor() Parent(42) {}  // Or set above
}

// With args from child
contract DynamicChild is Parent {
    constructor(uint256 v) Parent(v) {}
}
```

For: layered initialization.

## Interfaces

```solidity
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
    event Transfer(address indexed from, address indexed to, uint256 value);
}

contract MyContract {
    IERC20 public token = IERC20(0x...);

    function pay(address to, uint256 amount) external {
        require(token.transfer(to, amount), "Transfer failed");
    }
}
```

Interfaces define ABI only; no implementation.

For: typed external contract calls.

## Abstract contracts

```solidity
abstract contract Vault {
    function withdraw() public virtual;

    function deposit() public payable {
        // Concrete implementation
    }
}

contract MyVault is Vault {
    function withdraw() public override {
        // Required
    }
}
```

Can have implemented + unimplemented functions. Not deployable directly.

For: partial templates.

## using for

```solidity
library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        unchecked { return a + b; }    // 0.8+ has overflow check by default
    }
}

contract Counter {
    using SafeMath for uint256;
    uint256 public count;

    function increment() external {
        count = count.add(1);    // count.add() instead of SafeMath.add(count, ...)
    }
}
```

For: extension methods on types.

## Libraries

```solidity
library StringUtils {
    function length(string memory s) internal pure returns (uint256) {
        return bytes(s).length;
    }
}

contract User {
    using StringUtils for string;

    function nameLength(string memory name) external pure returns (uint256) {
        return name.length();
    }
}
```

Libraries linked at deploy:
- `internal` functions: inlined.
- `external` functions: DELEGATECALL'd; needs library deployed separately.

For: reusable logic.

## OpenZeppelin contracts

Industry-standard library:

```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor() ERC20("MyToken", "MTK") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
```

Audited; conventional patterns.

For: don't reinvent the wheel.

## ERC interfaces

```solidity
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
```

Use OpenZeppelin's interfaces; they match standards exactly.

For: interop with any token.

## Interface ID + supportsInterface

```solidity
interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
    // ...
}

// ERC-165: query interface support
function supportsInterface(bytes4 interfaceId) external view returns (bool) {
    return interfaceId == type(IERC721).interfaceId;
}
```

Lets contracts ask "are you a XYZ?"

For: dynamic typing on-chain.

## Function selector clash

```solidity
contract A {
    function foo() external returns (uint256) { return 1; }
}

contract B is A {
    function foo() external returns (uint256) { /* No override! */ }
}
```

Compile error. Use `override` explicitly.

For: catching ambiguity.

## Visibility inheritance

| Inherited | child can call as |
|-----------|-------------------|
| public    | public |
| external  | only external |
| internal  | internal |
| private   | not accessible |

For: layered API design.

## Storage layout inheritance

```solidity
contract A {
    uint256 a;     // Slot 0
}

contract B is A {
    uint256 b;     // Slot 1 (continues from A)
}
```

Adding state vars to parent shifts child's layout. Breaks upgrades.

For: upgrade-safe design.

## Selfdestruct (deprecated)

```solidity
// Used to clear contract + send remaining ETH
function destroy() external onlyOwner {
    selfdestruct(payable(owner));  // Use sparingly; Cancun changes semantics
}
```

EIP-6780 (Cancun) changed selfdestruct: no longer deletes storage; only transfers ETH (when called in same tx as deploy). Generally avoid.

For: legacy awareness.

## CREATE2 deterministic deploy

```solidity
function deploy(bytes32 salt, bytes memory bytecode) external returns (address) {
    address addr;
    assembly {
        addr := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
    }
    return addr;
}
```

Address = keccak256(0xff, deployer, salt, bytecode). Same contract, same address — even before deploy.

For: counterfactual contracts; meta-tx.

## Mistakes to avoid

- **Forgetting `virtual` / `override`.** Compile error.
- **Storage slot order in inheritance.** Upgrades break.
- **Library `delegatecall` without same storage layout.** Catastrophic.
- **Diamond problem without C3 awareness.** Surprising behavior.

## Summary

- Inheritance: virtual / override; C3 linearization.
- Interfaces define ABI; for external calls.
- OpenZeppelin = audited standard library.
- Libraries with `using for` for extension methods.

Next: error handling and assertions.
