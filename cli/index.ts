#!/usr/bin/env node

import { Command } from 'commander';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { findMetadataPda, mplTokenMetadata, MPL_TOKEN_METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import fs from 'fs';

// Import these from your project
import {
    attentionTokenMetadata,
    CONFIG_SEED,
    FEE_VAULT_SEED,
    MINT_SEED,
    PROOF_ACC_SEED,
    TOKEN_VAULT_SEED,
    toLamports,
    poaFees,
    toTokenAmount,
    POA_PROGRAM_ID
} from './constants';
import { publicKey } from '@metaplex-foundation/umi';

const program = new Command();

// Configure anchor provider
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const umi = createUmi(provider.connection).use(mplTokenMetadata());

// Load your program ID and IDL here
const idl = JSON.parse(fs.readFileSync('./idl.json', 'utf8'));
const anchorProgram = new anchor.Program(idl, provider);

program
    .name('poa-cli')
    .description('CLI for Proof of Attention Protocol')
    .version('1.0.0');

program
    .command('init')
    .description('Initialize a new token pool')
    .requiredOption('--keypair <path>', 'Path to keypair file')
    .option('--timeout <seconds>', 'Timeout in seconds', '1')
    .option('--supply <number>', 'Total supply', '100000')
    .option('--reward <number>', 'Reward amount', '1')
    .option('--decimals <number>', 'Token decimals', '5')
    .action(async (options) => {
        try {
            const poolOwner = Keypair.fromSecretKey(
                Uint8Array.from(JSON.parse(fs.readFileSync(options.keypair, 'utf-8')))
            );

            const [mint] = PublicKey.findProgramAddressSync(
                [MINT_SEED, Buffer.from(attentionTokenMetadata.name)],
                POA_PROGRAM_ID
            );

            const mintMetadataPDA = findMetadataPda(umi, { mint: publicKey(mint) });
            const [tokenPoolAcc] = PublicKey.findProgramAddressSync(
                [CONFIG_SEED, mint.toBuffer()],
                POA_PROGRAM_ID
            );

            const [tokenPoolVault] = PublicKey.findProgramAddressSync(
                [TOKEN_VAULT_SEED, mint.toBuffer(), tokenPoolAcc.toBuffer()],
                POA_PROGRAM_ID
            );

            const [feeVault] = PublicKey.findProgramAddressSync(
                [FEE_VAULT_SEED, tokenPoolAcc.toBuffer()],
                POA_PROGRAM_ID
            );

            const totalSupply = new anchor.BN(toTokenAmount(Number(options.supply), Number(options.decimals)));
            const rewardAmount = new anchor.BN(toTokenAmount(Number(options.reward), Number(options.decimals)));
            const poolFee = new anchor.BN(toLamports(0.001));

            await anchorProgram.methods
                .tokenPoolInitialise({
                    tokenName: attentionTokenMetadata.name,
                    uri: attentionTokenMetadata.uri,
                    symbol: attentionTokenMetadata.symbol,
                    timeoutSec: Number(options.timeout),
                    tokenDecimals: Number(options.decimals),
                    rewardAmount,
                    poolFee,
                    totalSupply,
                })
                .accountsStrict({
                    authority: poolOwner.publicKey,
                    mint,
                    metadataAccount: mintMetadataPDA[0],
                    tokenPoolAcc,
                    tokenPoolVault,
                    feeVault,
                    poaFees,
                    tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY,
                })
                .signers([poolOwner])
                .rpc();

            console.log('Token pool initialized successfully!');
        } catch (error) {
            console.error('Error initializing token pool:', error);
        }
    });

program
    .command('interact')
    .description('Submit an attention interaction')
    .requiredOption('--user-keypair <path>', 'Path to user keypair file')
    .requiredOption('--pool-keypair <path>', 'Path to pool owner keypair file')
    .action(async (options) => {
        try {
            const userAccount = Keypair.fromSecretKey(
                Uint8Array.from(JSON.parse(fs.readFileSync(options.userKeypair, 'utf-8')))
            );
            const poolOwner = Keypair.fromSecretKey(
                Uint8Array.from(JSON.parse(fs.readFileSync(options.poolKeypair, 'utf-8')))
            );

            const [mint] = PublicKey.findProgramAddressSync(
                [MINT_SEED, Buffer.from(attentionTokenMetadata.name)],
                POA_PROGRAM_ID
            );

            const [tokenPoolAcc] = PublicKey.findProgramAddressSync(
                [CONFIG_SEED, mint.toBuffer()],
                POA_PROGRAM_ID
            );

            const [tokenPoolVault] = PublicKey.findProgramAddressSync(
                [TOKEN_VAULT_SEED, mint.toBuffer(), tokenPoolAcc.toBuffer()],
                POA_PROGRAM_ID
            );

            const [feeVault] = PublicKey.findProgramAddressSync(
                [FEE_VAULT_SEED, tokenPoolAcc.toBuffer()],
                POA_PROGRAM_ID
            );

            const rewardVault = await getAssociatedTokenAddress(
                mint,
                userAccount.publicKey
            );

            const [proofAccount] = PublicKey.findProgramAddressSync(
                [PROOF_ACC_SEED, userAccount.publicKey.toBuffer(), mint.toBuffer()],
                POA_PROGRAM_ID
            );

            await anchorProgram.methods
                .attentionInteract({
                    tokenName: attentionTokenMetadata.name,
                })
                .accountsStrict({
                    tokenPoolAuthority: poolOwner.publicKey,
                    attentionAuthority: userAccount.publicKey,
                    proofAccount,
                    tokenMint: mint,
                    tokenPoolAcc,
                    tokenPoolVault,
                    feeVault,
                    rewardVault,
                    poaFees,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
                })
                .signers([userAccount, poolOwner])
                .rpc();

            console.log('Attention interaction submitted successfully!');
        } catch (error) {
            console.error('Error submitting attention interaction:', error);
        }
    });

program.parse();