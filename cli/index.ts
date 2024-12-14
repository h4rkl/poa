#!/usr/bin/env node

import * as anchor from '@coral-xyz/anchor';
import fs from 'fs';
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Command } from 'commander';
import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { createBundlrUploader } from '@metaplex-foundation/umi-uploader-bundlr';
import { createGenericFile, createSignerFromKeypair, generateSigner, percentAmount, signerIdentity, Umi } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createV1, mintV1, mplTokenMetadata, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import chalk from 'chalk';

// Import these from your project
import {
    CONFIG_SEED,
    FEE_VAULT_SEED,
    PROOF_ACC_SEED,
    TOKEN_VAULT_SEED,
    toLamports,
    poaFees,
    toTokenAmount,
    POA_PROGRAM_ID
} from './constants';

const program = new Command();

program
    .name('poa-cli')
    .description('CLI for Proof of Attention Protocol')
    .version('1.0.0');

program
    .command('init')
    .description('Initialize a new token pool')
    .requiredOption('--keypair <path>', 'Path to keypair file')
    .requiredOption('--name <string>', 'Token pool name')
    .requiredOption('--mint <string>', 'Mint address')
    .requiredOption('--pool-fee <number>', 'Pool fee', '0.001')
    .requiredOption('--connection <url>', 'The Solana RPC connection URL')
    .option('--timeout <seconds>', 'Timeout in seconds', '1')
    .option('--supply <number>', 'Total supply', '100000')
    .option('--reward <number>', 'Reward amount', '1')
    .option('--decimals <number>', 'Token decimals', '5')
    .action(async (options) => {
        const { anchorProgram } = setupAnchor(options.connection, options.keypair);
        try {
            const poolOwner = Keypair.fromSecretKey(
                Uint8Array.from(JSON.parse(fs.readFileSync(options.keypair, 'utf-8')))
            );
            const mint = new PublicKey(options.mint);
            const poolOwnerAta = await getAssociatedTokenAddress(mint, poolOwner.publicKey);

            const [tokenPoolAcc] = PublicKey.findProgramAddressSync(
                [CONFIG_SEED, mint.toBuffer(), Buffer.from(options.name)],
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
            const poolFee = new anchor.BN(toLamports(options.poolFee));

            console.log('Initializing with params:', {
                tokenPoolName: options.name,
                timeoutSec: Number(options.timeout),
                tokenDecimals: Number(options.decimals),
                rewardAmount: rewardAmount.toString(),
                poolFee: poolFee.toString(),
                totalSupply: totalSupply.toString()
            });

            console.log('PDAs:', {
                mint: mint.toBase58(),
                tokenPoolAcc: tokenPoolAcc.toBase58(),
                tokenPoolVault: tokenPoolVault.toBase58(),
                feeVault: feeVault.toBase58()
            });

            await anchorProgram.methods
                .tokenPoolInitialise({
                    tokenPoolName: options.name,
                    timeoutSec: Number(options.timeout),
                    tokenDecimals: Number(options.decimals),
                    rewardAmount,
                    poolFee,
                    totalSupply,
                })
                .accountsStrict({
                    authority: poolOwner.publicKey,
                    authorityTokenAccount: poolOwnerAta,
                    mint,
                    tokenPoolAcc,
                    tokenPoolVault,
                    feeVault,
                    poaFees,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .signers([poolOwner])
                .rpc();

            console.log(chalk.green('Token pool initialized successfully!'));
            console.log(chalk.blue(`NEXT_PUBLIC_SIGNING_AUTHORITY=${poolOwner.publicKey.toBase58()}`));
            console.log(chalk.blue(`NEXT_PUBLIC_SIGNING_AUTHORITY_ATA=${poolOwnerAta.toBase58()}`));
            console.log(chalk.blue(`NEXT_PUBLIC_MINT=${mint.toBase58()}`));
            console.log(chalk.blue(`NEXT_PUBLIC_TOKEN_POOL_VAULT=${tokenPoolVault.toBase58()}`));
            console.log(chalk.blue(`NEXT_PUBLIC_TOKEN_FEE_VAULT=${feeVault.toBase58()}`));
            console.log(chalk.blue(`NEXT_PUBLIC_COOLDOWN_SECONDS=${options.timeout}`));
        } catch (error) {
            console.error('Error initializing token pool:', error);
        }
    });

program
    .command('interact')
    .description('Submit an attention interaction')
    .requiredOption('--user-keypair <path>', 'Path to user keypair file')
    .requiredOption('--pool-keypair <path>', 'Path to pool owner keypair file')
    .requiredOption('--connection <url>', 'The Solana RPC connection URL')
    .requiredOption('--name <string>', 'Token pool name')
    .requiredOption('--mint <string>', 'Mint address')
    .action(async (options) => {
        const { anchorProgram } = setupAnchor(options.connection, options.userKeypair);
        try {
            const userAccount = Keypair.fromSecretKey(
                Uint8Array.from(JSON.parse(fs.readFileSync(options.userKeypair, 'utf-8')))
            );
            const poolOwner = Keypair.fromSecretKey(
                Uint8Array.from(JSON.parse(fs.readFileSync(options.poolKeypair, 'utf-8')))
            );

            const mint = new PublicKey(options.mint);

            const [tokenPoolAcc] = PublicKey.findProgramAddressSync(
                [CONFIG_SEED, mint.toBuffer(), Buffer.from(options.name)],
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

            const signature = await anchorProgram.methods
                .attentionInteract({
                    tokenPoolName: options.name,
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

            console.log(`Attention interaction submitted successfully! ${chalk.blue('Transaction hash:')} ${chalk.yellow(signature)}`);
        } catch (error) {
            console.error('Error submitting attention interaction:', error);
        }
    });

program
    .command('create_token')
    .description('Create a new SPL token')
    .requiredOption('--keypair <path>', 'Path to keypair file')
    .requiredOption('--name <string>', 'Token name')
    .requiredOption('--symbol <string>', 'Token symbol')
    .requiredOption('--description <string>', 'Token description')
    .requiredOption('--image <path>', 'Path to token image file')
    .requiredOption('--connection <url>', 'The Solana RPC connection URL')
    .requiredOption('--metadataUri <url>', 'Path to token metadata file')
    .option('--amount <number>', 'Initial token supply', '100000')
    .option('--decimals <number>', 'Token decimals', '9')
    .action(async (options) => {
        const { umi } = setupAnchor(options.connection, options.keypair);
        const signerKeyArray = Uint8Array.from(JSON.parse(fs.readFileSync(options.keypair, 'utf-8')));
        const umiAuthority = umi.eddsa.createKeypairFromSecretKey(signerKeyArray)
        const umiSigner = createSignerFromKeypair(umi, umiAuthority);
        umi.use(signerIdentity(umiSigner));

        try {
            // const imageBuffer = fs.readFileSync(options.image);
            // const { metadataUri } = await uploadToArweave(
            //     umi,
            //     imageBuffer,
            //     options.name,
            //     options.symbol,
            //     options.description
            // );

            const mint = generateSigner(umi);

            await createV1(umi, {
                mint,
                authority: umiSigner,
                name: options.name,
                symbol: options.symbol,
                uri: options.metadataUri,
                sellerFeeBasisPoints: percentAmount(0),
                decimals: options.decimals,
                tokenStandard: TokenStandard.Fungible,
            }).sendAndConfirm(umi);

            await mintV1(umi, {
                mint: mint.publicKey,
                authority: umiSigner,
                amount: toTokenAmount(options.amount, options.decimals),
                tokenOwner: umiSigner.publicKey,
                tokenStandard: TokenStandard.Fungible,
            }).sendAndConfirm(umi);

            console.log(chalk.green('Token created successfully!'));
            console.log(chalk.blue('Mint address:'), chalk.yellow(mint.publicKey));
            console.log(chalk.blue('Metadata:'), chalk.yellow(options.metadataUri));
            console.log(chalk.blue('Authority:'), chalk.yellow(umi.identity.publicKey));
        } catch (error) {
            console.error('Error creating token:', error);
        }
    })

program
    .command('withdraw-fees')
    .description('Withdraw fees from the fee vault to the pool owner')
    .requiredOption('--keypair <path>', 'Path to pool owner keypair file')
    .requiredOption('--connection <url>', 'The Solana RPC connection URL')
    .requiredOption('--name <string>', 'Token pool name')
    .requiredOption('--mint <string>', 'Mint address')
    .requiredOption('--amount <number>', 'Amount to withdraw in SOL')
    .action(async (options) => {
        const { anchorProgram } = setupAnchor(options.connection, options.keypair);
        try {
            const poolOwner = Keypair.fromSecretKey(
                Uint8Array.from(JSON.parse(fs.readFileSync(options.keypair, 'utf-8')))
            );

            const mint = new PublicKey(options.mint);

            const [tokenPoolAcc] = PublicKey.findProgramAddressSync(
                [CONFIG_SEED, mint.toBuffer(), Buffer.from(options.name)],
                POA_PROGRAM_ID
            );

            const [feeVault] = PublicKey.findProgramAddressSync(
                [FEE_VAULT_SEED, tokenPoolAcc.toBuffer()],
                POA_PROGRAM_ID
            );

            const withdrawAmount = new anchor.BN(toLamports(options.amount));

            const signature = await anchorProgram.methods
                .feeVaultWithdrawFunds({
                    tokenPoolName: options.name,
                    amount: withdrawAmount,
                })
                .accountsStrict({
                    authority: poolOwner.publicKey,
                    mint,
                    tokenPoolAcc,
                    feeVault,
                    systemProgram: SystemProgram.programId,
                })
                .signers([poolOwner])
                .rpc();

            console.log(chalk.green('Fees withdrawn successfully!'));
            console.log(chalk.blue('Transaction hash:'), chalk.yellow(signature));
            console.log(chalk.blue('Amount withdrawn:'), chalk.yellow(`${options.amount} SOL`));

        } catch (error) {
            console.error('Error withdrawing fees:', error);
        }
    });

program.parse();

function setupAnchor(url: string, keypairPath: string) {
    // Read and parse the keypair file
    const secretKey = Uint8Array.from(
        JSON.parse(fs.readFileSync(keypairPath, 'utf-8'))
    );
    const keypair = Keypair.fromSecretKey(secretKey);

    // Create Anchor wallet from keypair
    const wallet = new anchor.Wallet(keypair);

    // Setup Anchor provider
    const connection = new anchor.web3.Connection(url);
    const anchorProvider = new anchor.AnchorProvider(
        connection,
        wallet,
        { commitment: "confirmed" }
    );

    anchor.setProvider(anchorProvider);

    // Create UMI instance with the same keypair
    const umi = createUmi(connection)
        .use(mplTokenMetadata())

    // Setup Anchor program
    const idl = JSON.parse(fs.readFileSync('./idl.json', 'utf8'));
    const anchorProgram = new anchor.Program(idl, anchorProvider);

    return { anchorProvider, umi, anchorProgram };
}

async function uploadToArweave(
    umi: Umi,
    imageBuffer: Buffer,
    name: string,
    symbol: string,
    description: string
) {
    const bundlrUploader = createBundlrUploader(umi);

    // Upload image first
    const imageFile = createGenericFile(new Uint8Array(imageBuffer), `${name}.png`, { contentType: "image/png" });
    const [imageUri] = await bundlrUploader.upload([imageFile]);

    // Create and upload metadata
    const metadata = {
        name,
        symbol,
        description,
        image: imageUri,
    };

    const metadataFile = createGenericFile(
        new Uint8Array(Buffer.from(JSON.stringify(metadata))),
        'metadata.json',
        { contentType: "application/json" }
    );

    const [metadataUri] = await bundlrUploader.upload([metadataFile]);

    return {
        imageUri,
        metadataUri,
        metadata
    };
}