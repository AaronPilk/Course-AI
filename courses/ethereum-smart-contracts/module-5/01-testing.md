---
module: 5
position: 1
title: "Testing strategies"
objective: "Comprehensive test coverage from units to invariants."
estimated_minutes: 5
---

# Testing strategies

## Test pyramid

```
        E2E tests (few)
      ──────────────────
     Integration tests
    ────────────────────
   Unit tests (many)
```

Each layer covers different scope.

For: comprehensive coverage strategy.

## Unit tests

Test individual functions in isolation:

```solidity
// Foundry
function test_TransferReducesSenderBalance() public {
    token.mint(alice, 100);
    vm.prank(alice);
    token.transfer(bob, 30);
    assertEq(token.balanceOf(alice), 70);
}
```

```typescript
// Hardhat
it("transfer reduces sender balance", async () => {
    await token.mint(alice.address, 100)
    await token.connect(alice).transfer(bob.address, 30)
    expect(await token.balanceOf(alice.address)).to.equal(70)
})
```

For: precise function behavior.

## vm cheats (Foundry)

```solidity
vm.prank(alice);                  // Next call as alice
vm.startPrank(alice);             // All calls until stopPrank
vm.deal(alice, 100 ether);        // Give ETH
vm.warp(block.timestamp + 1 days); // Time travel
vm.roll(blockNumber);              // Block jump
vm.expectRevert("Error message");  // Assert revert
vm.expectEmit();                   // Assert event
emit Transfer(alice, bob, 100);
vm.mockCall(target, calldata, returnData);  // Mock external
```

Powerful test utilities; no Hardhat equivalent.

For: complex scenario testing.

## Integration tests

Test multiple contracts together:

```solidity
function test_LendingFlow() public {
    // 1. Deposit collateral
    vm.startPrank(borrower);
    weth.approve(address(lending), 10 ether);
    lending.depositCollateral(weth, 10 ether);

    // 2. Borrow
    lending.borrow(usdc, 10000e6);
    assertEq(usdc.balanceOf(borrower), 10000e6);

    // 3. Liquidation conditions
    vm.warp(block.timestamp + 30 days);
    vm.stopPrank();

    vm.prank(liquidator);
    lending.liquidate(borrower);
}
```

For: cross-contract behavior.

## Mainnet fork testing

```bash
forge test --fork-url $MAINNET_RPC --fork-block-number 18000000
```

```solidity
// Use real DAI on forked mainnet
IERC20 dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);

function test_DepositRealDAI() public {
    address whale = 0x...; // Account with DAI
    vm.prank(whale);
    dai.transfer(user, 1000e18);

    // Test against real DAI contract behavior
}
```

For: realistic external interactions.

## Fuzzing

```solidity
function testFuzz_TransferConservation(uint96 amount) public {
    vm.assume(amount < token.balanceOf(alice));
    uint256 totalBefore = token.totalSupply();

    vm.prank(alice);
    token.transfer(bob, amount);

    assertEq(token.totalSupply(), totalBefore);
    assertEq(token.balanceOf(alice) + token.balanceOf(bob), totalBefore);
}
```

Foundry auto-generates random inputs; finds edge cases manually missed.

Set runs:
```bash
forge test --fuzz-runs 10000
```

For: edge case discovery.

## Invariant testing

```solidity
contract InvariantHandler {
    Token token;
    address[] actors;

    function transfer(uint8 fromIdx, uint8 toIdx, uint96 amount) public {
        address from = actors[fromIdx % actors.length];
        address to = actors[toIdx % actors.length];
        amount = bound(amount, 0, token.balanceOf(from));

        vm.prank(from);
        token.transfer(to, amount);
    }
}

contract InvariantTest is Test {
    function invariant_TotalSupplyConstant() public {
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
    }
}
```

Foundry runs random sequences; checks invariants always hold.

For: protocol-level safety.

## Mock contracts

```solidity
contract MockOracle {
    uint256 public price;
    function setPrice(uint256 _price) external { price = _price; }
    function getPrice() external view returns (uint256) { return price; }
}

function setUp() public {
    mockOracle = new MockOracle();
    lending = new Lending(address(mockOracle));
}
```

Control external dependencies in tests.

For: deterministic scenarios.

## Event assertion

```solidity
vm.expectEmit(true, true, false, true);
emit Transfer(alice, bob, 100);  // Expected event
token.transfer(bob, 100);         // Triggers event
```

Args = (checkTopic1, checkTopic2, checkTopic3, checkData).

For: log verification.

## Gas snapshot testing

```bash
forge snapshot   # Generates .gas-snapshot file
git diff .gas-snapshot   # See gas regressions per PR
```

For: tracking gas changes over time.

## Coverage

```bash
forge coverage --report summary
```

Aim for:
- 100% line coverage.
- 100% branch coverage.
- All revert paths tested.

For: comprehensive testing.

## Negative test cases

```solidity
function test_RevertWhen_NotOwner() public {
    vm.prank(notOwner);
    vm.expectRevert("Ownable: caller is not the owner");
    contract.adminAction();
}

function test_RevertWhen_AmountZero() public {
    vm.expectRevert(MyContract.AmountZero.selector);
    contract.withdraw(0);
}
```

Every revert path needs a test.

For: catching missing guards.

## Hardhat-Foundry hybrid

```toml
# foundry.toml
[profile.default]
src = "contracts"
test = "test/foundry"
```

```typescript
// hardhat.config.ts
import "@nomicfoundation/hardhat-foundry"
```

Tests in both frameworks; pick best tool per case.

For: maximum coverage tooling.

## Test organization

```
test/
  unit/
    Token.t.sol
    Vault.t.sol
  integration/
    LendingFlow.t.sol
  invariant/
    InvariantTest.t.sol
  fork/
    MainnetIntegration.t.sol
```

Cleaner structure for large codebases.

For: maintainability.

## Common patterns

### Test setup
```solidity
function setUp() public {
    token = new Token();
    alice = makeAddr("alice");
    bob = makeAddr("bob");
    vm.deal(alice, 100 ether);
    token.mint(alice, 1000e18);
}
```

### makeAddr / makeAccount
```solidity
address alice = makeAddr("alice");   // Deterministic address
(address bob, uint256 bobKey) = makeAccountWithKey("bob");
```

For: readable test addresses.

## CI integration

```yaml
# .github/workflows/test.yml
- run: forge test --gas-report
- run: forge coverage --report summary
- run: forge snapshot --diff   # Block PRs that regress gas
```

For: catch regressions automatically.

## Mistakes to avoid

- **Happy path only.** Catch reverts + edge cases.
- **No invariant tests for protocols.** Whole-system bugs slip through.
- **Mocking what you should test.** Mock external deps, test your contracts.
- **Skipping fuzz tests.** Manual cases miss edge cases.

## Summary

- Unit + integration + fork + fuzz + invariant tests.
- Foundry: vm cheats, fuzzing, invariants built-in.
- Coverage 100% + test every revert path.
- CI enforces; gas snapshots track regressions.

Next: frontend integration with ethers.js + viem.
