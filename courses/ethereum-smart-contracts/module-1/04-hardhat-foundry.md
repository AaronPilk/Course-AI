---
module: 1
position: 4
title: "Hardhat + Foundry dev setup"
objective: "Set up the modern Solidity development environment."
estimated_minutes: 5
---

# Hardhat + Foundry dev setup

## Hardhat vs. Foundry

| Hardhat | Foundry |
|---------|---------|
| Node.js / JS / TS | Rust + Solidity |
| TypeScript tests | Solidity tests (faster) |
| Mature; large ecosystem | Faster compilation + tests |
| Plugin ecosystem | Built-in fuzzing |

Modern projects often use both: Foundry for tests, Hardhat for deploy / scripts.

For: tool selection.

## Hardhat setup

```bash
mkdir my-project && cd my-project
npm init -y
npm install --save-dev hardhat
npx hardhat init    # Choose TypeScript project
```

Generates structure:
```
contracts/
  Lock.sol
test/
  Lock.ts
scripts/
  deploy.ts
hardhat.config.ts
```

For: starting a project.

## hardhat.config.ts

```typescript
import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true
    }
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL!,
      accounts: [process.env.PRIVATE_KEY!]
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL!,
      accounts: [process.env.PRIVATE_KEY!]
    }
  },
  etherscan: { apiKey: process.env.ETHERSCAN_API_KEY }
}
export default config
```

For: cross-network config.

## Foundry setup

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup

forge init my-project
cd my-project
forge build
forge test
```

Three tools:
- `forge`. Build / test.
- `cast`. CLI for contract calls / queries.
- `anvil`. Local node.

For: alternative dev flow.

## Foundry project structure

```
src/
  Counter.sol
test/
  Counter.t.sol
script/
  Counter.s.sol
foundry.toml
remappings.txt
```

For: file layout.

## foundry.toml

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.24"
optimizer = true
optimizer_runs = 200
via_ir = true

[fmt]
line_length = 120

[rpc_endpoints]
mainnet = "${MAINNET_RPC}"
sepolia = "${SEPOLIA_RPC}"
arbitrum = "${ARBITRUM_RPC}"

[etherscan]
mainnet = { key = "${ETHERSCAN_KEY}" }
arbitrum = { key = "${ARBISCAN_KEY}" }
```

For: Foundry config.

## Sample contract

```solidity
// src/Counter.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    uint256 public count;

    event Incremented(address indexed by, uint256 newCount);

    function increment() external {
        count++;
        emit Incremented(msg.sender, count);
    }

    function decrement() external {
        require(count > 0, "Cannot underflow");
        count--;
    }
}
```

For: hello world.

## Hardhat tests

```typescript
// test/Counter.ts
import { expect } from "chai"
import { ethers } from "hardhat"

describe("Counter", () => {
  it("increments", async () => {
    const Counter = await ethers.getContractFactory("Counter")
    const counter = await Counter.deploy()

    await counter.increment()
    expect(await counter.count()).to.equal(1)
  })
})
```

```bash
npx hardhat test
```

For: behavior verification.

## Foundry tests (Solidity)

```solidity
// test/Counter.t.sol
import "forge-std/Test.sol";
import "../src/Counter.sol";

contract CounterTest is Test {
    Counter public counter;

    function setUp() public {
        counter = new Counter();
    }

    function test_Increment() public {
        counter.increment();
        assertEq(counter.count(), 1);
    }

    function testFuzz_Increment(uint8 times) public {
        for (uint8 i = 0; i < times; i++) {
            counter.increment();
        }
        assertEq(counter.count(), times);
    }
}
```

```bash
forge test
```

Fuzzing built-in!

For: fast Solidity-native testing.

## Local node

```bash
# Hardhat
npx hardhat node

# Foundry
anvil
```

Local fork:
```bash
anvil --fork-url $MAINNET_RPC_URL --fork-block-number 18000000
```

For: realistic testing against mainnet state.

## Deploy script

```typescript
// scripts/deploy.ts (Hardhat)
import { ethers } from "hardhat"

async function main() {
  const Counter = await ethers.getContractFactory("Counter")
  const counter = await Counter.deploy()
  await counter.waitForDeployment()
  console.log("Counter:", await counter.getAddress())
}

main().catch(console.error)
```

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

For: deployment automation.

## Foundry deploy

```solidity
// script/Counter.s.sol
import "forge-std/Script.sol";
import "../src/Counter.sol";

contract Deploy is Script {
    function run() public {
        vm.startBroadcast();
        new Counter();
        vm.stopBroadcast();
    }
}
```

```bash
forge script script/Counter.s.sol --rpc-url sepolia --broadcast --verify
```

`--verify` auto-submits to Etherscan.

For: production deploy.

## Etherscan verification

```bash
npx hardhat verify --network sepolia <ADDRESS>
```

Publishes source code on Etherscan; users can read + verify.

For: transparency.

## Useful commands

```bash
# Hardhat
npx hardhat compile
npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts

# Foundry
forge build
forge test --gas-report
forge coverage
forge fmt
cast call <addr> "balanceOf(address)" 0x...
cast send <addr> "transfer(address,uint256)" 0x... 100
```

For: workflow muscle memory.

## RPC providers

| Service | Strengths | Pricing |
|---------|-----------|---------|
| Alchemy | Mature, multi-chain | Free → $$ |
| Infura | Veteran; ConsenSys | Free → $$ |
| QuickNode | Multi-chain | Free → $$ |
| Tenderly | Debugging + sim | $$ |
| Public (LlamaNodes, Ankr) | Free tier | Free |

For: production reliability.

## Mistakes to avoid

- **Committing private keys.** Use .env + .gitignore.
- **Compiling with debug symbols on mainnet.** Larger contracts; higher gas.
- **No tests before deploy.** Common cause of bugs in prod.
- **Skipping Etherscan verify.** Users can't trust the code.

## Summary

- Hardhat for JS/TS workflows; Foundry for fast Solidity tests.
- Both compile / test / deploy / verify.
- Local nodes (Hardhat / anvil) for instant iteration.
- Use both: Foundry tests, Hardhat scripts.

Module 1 complete. Module 2: Solidity language.
