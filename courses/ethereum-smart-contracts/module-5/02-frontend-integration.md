---
module: 5
position: 2
title: "Frontend: ethers.js + viem"
objective: "Connect React frontends to smart contracts."
estimated_minutes: 5
---

# Frontend: ethers.js + viem

## ethers.js vs. viem

| | ethers.js v6 | viem |
|--|--------------|------|
| Bundle size | ~70kb | ~35kb |
| TypeScript | Good | Excellent (typed contracts) |
| Maturity | Mature | Newer (2023+) |
| API style | Class-based | Function-based |
| Wagmi compat | v5 | v6+ uses viem |

Modern projects (especially with Wagmi) use viem.

For: tool selection.

## ethers.js v6 quick start

```typescript
import { JsonRpcProvider, Contract, formatEther } from "ethers"

const provider = new JsonRpcProvider(RPC_URL)
const contract = new Contract(ADDRESS, ABI, provider)

const balance = await contract.balanceOf(userAddress)
console.log(formatEther(balance), "tokens")

// Write requires signer
const signer = await provider.getSigner()
const writableContract = contract.connect(signer)
const tx = await writableContract.transfer(recipient, amount)
await tx.wait()
```

For: classic library.

## viem quick start

```typescript
import { createPublicClient, createWalletClient, http } from "viem"
import { mainnet } from "viem/chains"

const client = createPublicClient({ chain: mainnet, transport: http(RPC_URL) })

const balance = await client.readContract({
  address: TOKEN_ADDRESS,
  abi: ERC20_ABI,
  functionName: "balanceOf",
  args: [userAddress]
})

const wallet = createWalletClient({ chain: mainnet, transport: custom(window.ethereum) })
const hash = await wallet.writeContract({
  address: TOKEN_ADDRESS,
  abi: ERC20_ABI,
  functionName: "transfer",
  args: [recipient, amount]
})
```

For: modern alternative.

## Wagmi (React hooks)

```bash
npm install wagmi viem @tanstack/react-query
```

```typescript
import { createConfig, http, WagmiProvider } from "wagmi"
import { mainnet, optimism, arbitrum, base } from "wagmi/chains"
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors"

const config = createConfig({
  chains: [mainnet, optimism, arbitrum, base],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http()
  },
  connectors: [injected(), walletConnect({ projectId }), coinbaseWallet()]
})
```

```typescript
import { useAccount, useReadContract, useWriteContract } from "wagmi"

function MyComponent() {
  const { address } = useAccount()
  const { data: balance } = useReadContract({
    address: TOKEN,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address!]
  })

  const { writeContract } = useWriteContract()
  return (
    <button onClick={() => writeContract({ address: TOKEN, abi: ERC20_ABI, functionName: "transfer", args: [recipient, amount] })}>
      Transfer
    </button>
  )
}
```

For: standard React stack.

## Wallet connection

```typescript
import { ConnectButton } from "@rainbow-me/rainbowkit"

function App() {
  return (
    <div>
      <ConnectButton />
    </div>
  )
}
```

RainbowKit / ConnectKit / Web3Modal wrap Wagmi with polished UX.

For: multi-wallet support.

## ABI types

```typescript
import { Abi } from "viem"

const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view"
  },
  // ...
] as const satisfies Abi
```

`as const` enables viem's type inference; full typing on function args + returns.

For: end-to-end type safety.

## Reading data

```typescript
// Single read
const balance = await client.readContract({ address, abi, functionName: "balanceOf", args: [user] })

// Batch (multicall)
const [balance, decimals, symbol] = await client.multicall({
  contracts: [
    { address, abi, functionName: "balanceOf", args: [user] },
    { address, abi, functionName: "decimals" },
    { address, abi, functionName: "symbol" }
  ]
})
```

Multicall = single RPC for many reads.

For: efficient data fetching.

## Writing transactions

```typescript
const hash = await wallet.writeContract({
  address,
  abi,
  functionName: "transfer",
  args: [recipient, amount],
  value: 0n,
  gas: 100000n        // Optional override
})

const receipt = await client.waitForTransactionReceipt({ hash })
console.log("Block:", receipt.blockNumber, "Gas used:", receipt.gasUsed)
```

For: tx submission + confirmation.

## Event subscriptions

```typescript
const unwatch = client.watchContractEvent({
  address,
  abi,
  eventName: "Transfer",
  args: { from: userAddress },
  onLogs: (logs) => {
    for (const log of logs) {
      console.log("Transfer:", log.args)
    }
  }
})

// Cleanup
unwatch()
```

For: live UI updates.

## Historical events

```typescript
const logs = await client.getLogs({
  address,
  event: {
    type: "event",
    name: "Transfer",
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" }
    ]
  },
  args: { from: userAddress },
  fromBlock: "earliest",
  toBlock: "latest"
})
```

For: tx history.

## Errors + decoding

```typescript
try {
  await wallet.writeContract({...})
} catch (err) {
  if (err instanceof ContractFunctionExecutionError) {
    console.log("Revert reason:", err.shortMessage)
    if (err.cause instanceof BaseError) {
      const revertError = err.cause.walk((e) => e instanceof ContractFunctionRevertedError)
      if (revertError) {
        console.log("Custom error:", revertError.data?.errorName, revertError.data?.args)
      }
    }
  }
}
```

For: user-friendly error UX.

## Gas estimation

```typescript
const estimated = await client.estimateContractGas({
  address,
  abi,
  functionName: "transfer",
  args: [recipient, amount],
  account: userAddress
})

// Buffer 20%
const gas = estimated * 12n / 10n
```

For: ensure tx succeeds.

## EIP-1559 fee fetching

```typescript
const fees = await client.estimateFeesPerGas()
// { maxFeePerGas, maxPriorityFeePerGas }
```

For: dynamic gas pricing.

## Multi-chain (chains config)

```typescript
const config = createConfig({
  chains: [mainnet, optimism, arbitrum, base, polygon],
  transports: {
    [mainnet.id]: http(env.MAINNET_RPC),
    [optimism.id]: http(env.OPTIMISM_RPC),
    // ...
  }
})

// Hooks auto-switch based on user's selected chain
const { chainId } = useAccount()
```

For: L2 + multi-chain dApps.

## viem + Wagmi auth flow

```typescript
import { useSignMessage } from "wagmi"

const { signMessageAsync } = useSignMessage()

async function login() {
  const message = `Login at ${nonce}`
  const signature = await signMessageAsync({ message })
  await fetch("/api/auth", { method: "POST", body: JSON.stringify({ signature, message }) })
}
```

Server verifies with viem:
```typescript
import { verifyMessage } from "viem"
const valid = await verifyMessage({ address, message, signature })
```

For: SIWE / wallet auth.

## Mistakes to avoid

- **Polling for balance.** Use subscriptions.
- **Hard-coded RPC URLs.** Use env + fallback providers.
- **No retry on failed writes.** Network blips lose UX.
- **Trusting connected chain.** Validate chainId before write.

## Summary

- viem + Wagmi = modern React stack.
- RainbowKit / ConnectKit for wallet UX.
- Multicall for efficient batch reads.
- Watch events + handle errors typed.

Next: L2 deployment.
