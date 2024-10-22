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

If you've use this contract or found the code useful feel free to drop me a bit of SOL at ERxPNh9x8eJZb3esccWVPRGbMNt9YccyEwej7sz2sSGJ

## License

This project is licensed under the [MIT License](LICENSE).