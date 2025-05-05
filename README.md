# [🤑 Dispas](https://dispas.vercel.app)

**Fancy a quick demo? 👉 https://youtu.be/3-H7Bsy21SU**

### Disburse Funds in ONE transaction

![Dispas](https://valentinecodes.github.io/dispas/assets/dispas.png)

## Architecture

Dispas follows a modern web3 architecture with the following components:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Next.js Front  │◄────┤  Smart Contract │◄────┤  Local/Test     │
│  End            │     │  Layer          │     │  Network        │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  User Interface │     │  Fund Disbursal │     │  Lukso       │
│  Components     │     │  Logic          │     │  Blockchain     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Key Components:

1. **Frontend (Next.js)**

   - User interface components
   - Web3 integration
   - Transaction handling
   - State management

2. **Smart Contract Layer**

   - Fund disbursal logic
   - Transaction validation
   - Security checks
   - Event emission

3. **Blockchain Network**
   - Local development network (Hardhat)
   - Test network support
   - Mainnet integration

## Funds Disbursal Flow

The following diagram illustrates how funds are disbursed in a single transaction:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│   User      │────►│  Smart      │────►│  Batch      │────►│  Recipients │
│  Interface  │     │  Contract   │     │  Processing │     │  Receive    │
│             │     │             │     │             │     │  Funds      │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Input      │     │  Validate   │     │  Execute    │     │  Transaction│
│  Recipients │     │  Amounts    │     │  Batch      │     │  Confirmed  │
│  & Amounts  │     │  & Addresses│     │  Transfer   │     │  & Complete │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Funds Disbursal Process Steps:

1. **User Input**

   - Enter recipient addresses
   - Specify amounts for each recipient or split total amount
   - Review total transaction cost

2. **Smart Contract Validation**

   - Verify sender's balance
   - Validate recipient addresses
   - Check for duplicate addresses
   - Ensure amounts are within limits

3. **Batch Processing**

   - Aggregate all transfers
   - Calculate total amount
   - Prepare single transaction
   - Optimize gas usage

4. **Transaction Execution**
   - Submit to Lukso network
   - Process all transfers atomically
   - Emit events for tracking
   - Confirm successful completion

## Local Development

Before you begin, you need to install the following tools:

- [Node (>= v18.18)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Dispas, follow the steps below:

1. Clone repo and install dependencies:

```
git clone https://github.com/dewdrip/dispas-web.git
cd dispas-web
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Lukso network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `packages/hardhat/hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test`

- Edit smart contracts in `packages/hardhat/contracts`
- Edit frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit deployment scripts in `packages/hardhat/deploy`

## Contributing to Dispas

We welcome contributions to Dispas!

Please see [CONTRIBUTING.MD](https://github.com/valentinecodes/dispas/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Dispas.
