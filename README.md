# Meme Token Mining Platform on Solana

This repository contains a Solana program built using the Anchor framework. The platform allows users to create meme tokens with a stepped mining cost model. Tokens can be mined by multiple participants, with rewards sent to the miner’s wallet and mining fees collected in a fee vault. The program also supports adding liquidity to decentralized exchanges (DEXs).

## Table of Contents

1. [Program Overview](#program-overview)
2. [Models (State Accounts)](#models-state-accounts)
3. [Methods (Program Instructions)](#methods-program-instructions)
4. [Mining Cost Calculation](#mining-cost-calculation)
5. [Hash-Based Proof of Mining](#hash-based-proof-of-mining)
6. [Fee Management and Liquidity Provisioning](#fee-management-and-liquidity-provisioning)

---

## Program Overview

The program supports the following operations:

- **Create Meme Tokens:** Users can initialize a meme token with customizable parameters like mining cost, step intervals, and total supply.
- **Mining Tokens:** Users mine tokens by solving hash-based challenges. Tokens are rewarded to the miner's wallet, while the corresponding mining fees in SOL are stored in a fee vault.
- **Fee Management:** Collected fees are stored in a fee vault, which can later be used for liquidity provisioning or other platform uses.

### Key Features:
- **Stepped Mining Cost:** Mining cost increases in steps based on predefined intervals and a step factor.
- **Hash-Based Proofs:** Miners must solve hash-based challenges to mine tokens.
- **Fee Vault:** SOL fees from mining are stored in a vault for liquidity or platform usage.

---

## Models (State Accounts)

### `TokenPoolAcc` (PDA Account for Each Token)
This account stores the configuration for each meme token, including minting details, reward parameters, and mining configuration.

- `authority: Pubkey` – The token pool authority (typically the creator).
- `mint_address: Pubkey` – Public key of the token mint.
- `pool_fee_vault: Pubkey` – Public key of the fee vault that holds collected SOL fees.
- `initial_cost: u64` – Initial cost for mining (in SOL).
- `step_interval: u64` – Number of tokens after which the mining cost increases.
- `step_factor: u64` – Factor by which the mining cost increases after each step.

---

### `MinerProof` (PDA Account for Each Miner)
This account tracks the state of each miner in relation to a specific token mint.

- `authority: Pubkey` – Wallet address of the miner.
- `balance: u64` – Balance of rewards earned so far.
- `challenge: [u8; 32]` – Current hash challenge for mining.
- `last_hash: [u8; 32]` – Last successfully solved hash.
- `last_hash_at: i64` – Timestamp of the last mining attempt.
- `last_stake_at: i64` – Timestamp of the last reward distribution.
- `token_mint: Pubkey` – Public key of the token mint being mined.
- `token_reward_vault: Pubkey` – Vault that holds the miner's rewards.
- `total_hashes: u64` – Total number of hashes solved by the miner.
- `total_rewards: u64` – Total number of tokens rewarded to the miner.

---

### `FeeVault` (PDA Account for Collecting Fees)
This account holds SOL fees collected from mining operations.

- `token_pool_acc: Pubkey` – Public key of the token pool associated with this fee vault.

---

## Methods (Program Instructions)

### `token_pool_init`
**Purpose:** Initializes a new meme token pool with parameters such as mining cost, step intervals, and total supply.

**Parameters:**
- `initial_cost: u64` – Initial cost to mine tokens.
- `step_factor: u64` – Factor by which the mining cost increases after each interval.
- `step_interval: u64` – Number of tokens after which the mining cost steps up.
- `token_name: String` – Name of the token.
- `total_supply: u64` – Total supply of the meme token.
- `symbol: String` – Symbol of the token (optional).
- `uri: String` – URI pointing to token metadata (optional).

**Actions:**
- Mints the total token supply to the program's control.
- Initializes the `TokenPoolAcc` and associated vaults for mining rewards and fees.
- Creates metadata for the token mint.

---

### `open_account`
**Purpose:** Opens a new miner account for a user who wants to mine tokens.

**Parameters:**
- `token_name: String` – The name of the token the user wants to mine.

**Actions:**
- Initializes a `MinerProof` account that tracks the miner’s progress.
- Creates a reward vault for the miner, which will hold their mined tokens.

---

### `mine_token_pool`
**Purpose:** Mines tokens by solving a hash-based challenge, rewarding the miner with tokens and charging SOL fees.

**Parameters:**
- `provided_hash: [u8; 32]` – The hash provided by the miner, used to verify they solved the challenge.

**Actions:**
- Verifies that at least one minute has passed since the last mining attempt.
- Compares the provided hash with the expected hash to confirm the mining attempt.
- If successful, calculates the reward based on the token pool configuration and miner’s history.
- Transfers the calculated reward to the miner’s reward vault.
- Deposits the SOL mining fees in the fee vault.

---

## Mining Cost Calculation

The mining cost increases based on a **stepped approach**. The parameters `step_interval` and `step_factor` defined in the `TokenPoolAcc` control how the cost increases after a certain number of tokens have been mined.

**Formula:**
\[
\text{mining cost} = \text{initial cost} \times (\text{step factor})^{\left(\frac{\text{total hashes}}{\text{step interval}}\right)}
\]

This means that the mining cost increases by the `step_factor` every `step_interval` tokens mined.

---

## Hash-Based Proof of Mining

Miners must provide a valid hash that solves the current challenge, which is derived from:
- The miner's previous hash.
- The current blockchain slot.
- The miner’s challenge.

If the provided hash matches the expected hash, the miner is rewarded with tokens.

---

## Fee Management and Liquidity Provisioning

### Fee Vault:
- SOL fees from mining operations are deposited into a `FeeVault`, which is associated with each token pool.
- The `FeeVault` holds the fees until they are either distributed for liquidity provisioning or used for other platform activities.

### Liquidity Provisioning:
- Once the total fees in the `FeeVault` reach a predefined threshold, a portion of the fees can be converted to USDC and added to a DEX liquidity pool (e.g., `Token/USDC`).

---

This README serves as a guide for understanding the structure and operation of the meme token mining platform on Solana. The platform leverages hash-based mining challenges and a stepped cost model to reward users while collecting fees in SOL for liquidity or platform usage.

## Getting Started

### Prerequisites

- Node v18.18.0 or higher

- Rust v1.77.2 or higher
- Anchor CLI 0.30.1 or higher
- Solana CLI 1.18.17 or higher

### Installation

#### Clone the repo

```shell
git clone <repo-url>
cd <repo-name>
```

#### Install Dependencies

```shell
npm install
```

#### Start the web app

```
npm run dev
```

## Apps

### anchor

This is a Solana program written in Rust using the Anchor framework.

#### Commands

You can use any normal anchor commands. Either move to the `anchor` directory and run the `anchor` command or prefix the command with `npm run`, eg: `npm run anchor`.

#### Sync the program id:

Running this command will create a new keypair in the `anchor/target/deploy` directory and save the address to the Anchor config file and update the `declare_id!` macro in the `./src/lib.rs` file of the program.

You will manually need to update the constant in `anchor/lib/basic-exports.ts` to match the new program id.

```shell
npm run anchor keys sync
```

#### Build the program:

```shell
npm run anchor-build
```

#### Start the test validator with the program deployed:

```shell
npm run anchor-localnet
```

#### Run the tests

```shell
npm run anchor-test
```

#### Deploy to Devnet

```shell
npm run anchor deploy --provider.cluster devnet
```

### web

This is a React app that uses the Anchor generated client to interact with the Solana program.

#### Commands

Start the web app

```shell
npm run dev
```

Build the web app

```shell
npm run build
```
