# POA: Proof of Attention Platform on Solana

POA is a Solana-based platform that enables Proof of Interaction and rewards real-world attention. Built with the Anchor framework, it introduces a novel approach to token distribution, incentivizing genuine user engagement and attention.

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Program Structure](#program-structure)
4. [Getting Started](#getting-started)
5. [Development Commands](#development-commands)

## Overview

POA rewards users for their attention and interaction with content or real-world activities. The platform utilizes a unique mechanism where users earn tokens by demonstrating proof of their attention or interaction. This system incorporates features such as cooldown periods, dynamic reward structures, and fee collection for platform sustainability and liquidity provisioning.

## Key Features

- **Proof of Interaction**: Users earn tokens by providing evidence of their interaction or attention to content or activities.
- **Real-World Attention Rewards**: The system is designed to incentivize and validate genuine attention in various contexts.
- **Dynamic Reward Structure**: Reward rates can adjust based on factors like interaction frequency and total participation.
- **Fee Management**: SOL fees from interactions are collected in a fee vault for platform use or liquidity provision.
- **Cooldown Mechanism**: Implements a cooldown period between reward claims to ensure fair distribution and prevent system abuse.

## Program Structure

### State Accounts

1. **TokenPoolAcc**: Manages the configuration for the attention reward system.
2. **ProofAcc**: Tracks the state of each user's attention proofs and rewards.
3. **FeeVault**: Holds collected SOL fees from platform operations.

### Main Instructions

1. **token_pool_init**: Initializes the attention reward system with configurable parameters.
2. **attention_init**: Sets up a new user account for tracking attention proofs and rewards.
3. **attention_proof**: Processes a proof of attention and distributes rewards accordingly.

## Getting Started

### Prerequisites

- Node.js v18.18.0+
- Rust v1.77.2+
- Anchor CLI 0.30.1+
- Solana CLI 1.18.17+

### Installation

1. Clone the repository:
git clone <repo-url> cd <repo-name>

2. Install dependencies:
npm install

3. Start the web app:
npm run dev

## Development Commands

### Anchor Program (in `anchor` directory)

- Sync program ID: `npm run anchor keys sync`
- Build program: `npm run anchor:build`
- Start local test validator: `npm run anchor:localnet`
- Run tests: `npm run anchor:test`
- Deploy to devnet: `npm run anchor deploy --provider.cluster devnet`

### Web App (in `web` directory)

- Start development server: `npm run dev`
- Build for production: `npm run build`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Buy me a coffee

If you've used this contract or found the code useful feel free to drop me a bit of SOL at ERxPNh9x8eJZb3esccWVPRGbMNt9YccyEwej7sz2sSGJ

## Leaderboard Winners

The reward pool at attn.lol reached a total payout value of 16.23217028 SOL. Here is the list of winners with $CLICK amounts and their corresponding SOL payouts:

1. [AusX..PRGq](https://explorer.solana.com/account/AusX35Ke83FXTiAevUZZJ75Pwn6RJ9xP5ZdQCwsrPRGq?cluster=mainnet-beta) - 3900.35536 $CLICK (5.02 SOL)
2. [6oKV..LCAg](https://explorer.solana.com/account/6oKVAeWhjiXZ8MMuQF7tASbkKv8ipe4p3CWzkrynLCAg?cluster=mainnet-beta) - 2471.65834 $CLICK (3.18 SOL)
3. [CvQ2..ntqm](https://explorer.solana.com/account/CvQ2VZneUNKceTPq3WuQhUnECsZkeZh6wk6WSTcintqm?cluster=mainnet-beta) - 1194 $CLICK (1.54 SOL)
4. [D6Si..FtUG](https://explorer.solana.com/account/D6SiSoJsA93A3oAZ9VWcZ1D3gidW3pQm5BsBvt1vFtUG?cluster=mainnet-beta) - 1060 $CLICK (1.36 SOL)
5. [9tH6..WfpW](https://explorer.solana.com/account/9tH6g7MYG8Rhv1iLWhyTbNqiSjHLDsLjYjnvqA98WfpW?cluster=mainnet-beta) - 900.47398 $CLICK (1.16 SOL)
6. [GPm4..HWEo](https://explorer.solana.com/account/GPm4pWLKTWcswdGyeoWgqy6uwVfAecq7cpFmFhCKHWEo?cluster=mainnet-beta) - 890.45439 $CLICK (1.15 SOL)
7. [J3km..8qSu](https://explorer.solana.com/account/J3kmWDMoK8pUChpMbRdsntME5cT5iwba2hL4tZhd8qSu?cluster=mainnet-beta) - 787.02081 $CLICK (1.01 SOL)
8. [7bN7..gHWg](https://explorer.solana.com/account/7bN7WNegAqq537p9sqd9NATKEoq11rQFLHK56HcUgHWg?cluster=mainnet-beta) - 604.43988 $CLICK (0.78 SOL)
9. [5Gyi..bNQT](https://explorer.solana.com/account/5Gyi7jf2XDr55okh35K91Cm4kSMUbbgCCgoaPjHkbNQT?cluster=mainnet-beta) - 600 $CLICK (0.77 SOL)
10. [Gf7V..eWnA](https://explorer.solana.com/account/Gf7V4fMJbfexttVvHpaqJJbcv7rwYbwAtunsbE82eWnA?cluster=mainnet-beta) - 529 $CLICK (0.68 SOL)

All payouts were completed from [signrMdZBa1kLBMSi3Bwv4c6xT6GuThtwW4sVNJKSRv](https://explorer.solana.com/address/signrMdZBa1kLBMSi3Bwv4c6xT6GuThtwW4sVNJKSRv?cluster=mainnet-beta0) on the 15 Dec 24.


## License

This project is licensed under the [MIT License](LICENSE).