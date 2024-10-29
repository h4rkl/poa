import * as anchor from '@coral-xyz/anchor';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { findMetadataPda, mplTokenMetadata, MPL_TOKEN_METADATA_PROGRAM_ID, fetchDigitalAsset } from '@metaplex-foundation/mpl-token-metadata'
import { Program } from '@coral-xyz/anchor';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from '@solana/spl-token';
import {
  attentionTokenMetadata,
  CONFIG_SEED,
  FEE_VAULT_SEED,
  MINT_SEED,
  PROOF_ACC_SEED,
  TOKEN_VAULT_SEED,
  toLamports,
  poaFees,
} from './test-helpers';
import { Poa } from '../target/types/poa';
import { Pda, publicKey } from '@metaplex-foundation/umi';
import * as fs from 'fs';
import path from 'path';

// Configure the provider to use the local cluster
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// Load the program
const program = anchor.workspace.poa as Program<Poa>;
const umi = createUmi(provider.connection).use(mplTokenMetadata())

// Define the Jest tests
describe('Proof of Attention', () => {
  let poolOwner: Keypair;
  let mint: PublicKey;
  let userAccount: Keypair;
  let tokenPoolVault: PublicKey;
  let tokenPoolAcc: PublicKey;
  let feeVault: PublicKey;
  let mintMetadataPDA: Pda;

  const timeoutSec = 1; // 1 second
  const timeoutInit = async () => await new Promise(resolve => setTimeout(resolve, timeoutSec * 1000)); // setTimeout uses milliseconds

  // Before all tests, set up accounts and mint tokens
  beforeAll(async () => {
    const poolOwnerKeypairPath = path.join(__dirname, '..', '..', 'test-keys', 'oWN1o6G79qLrEEK4JB67GYsRNUhAoQRfAYnKJTxbrpe.json');
    poolOwner = Keypair.fromSecretKey(
      Uint8Array.from(
        JSON.parse(
          fs.readFileSync(poolOwnerKeypairPath, 'utf-8')
        )
      )
    );
    userAccount = Keypair.generate();

    // Airdrop SOL to pool owner, user, and poaFees
    await Promise.all(
      [poolOwner, userAccount, poaFees].map(async (account) => {
        const publicKey = 'publicKey' in account ? account.publicKey : account;
        await provider.connection.confirmTransaction(
          await provider.connection.requestAirdrop(
            publicKey,
            LAMPORTS_PER_SOL
          )
        );
      })
    );

    // Create a mint
    [mint] = PublicKey.findProgramAddressSync(
      [MINT_SEED, Buffer.from(attentionTokenMetadata.name)],
      program.programId
    );

    // reward token mint metadata account address
    mintMetadataPDA = findMetadataPda(umi, { mint: publicKey(mint) });

    [tokenPoolAcc] = PublicKey.findProgramAddressSync(
      [CONFIG_SEED, mint.toBuffer()],
      program.programId
    );

    [tokenPoolVault] = PublicKey.findProgramAddressSync(
      [TOKEN_VAULT_SEED, mint.toBuffer(), tokenPoolAcc.toBuffer()],
      program.programId
    );

    [feeVault] = PublicKey.findProgramAddressSync(
      [FEE_VAULT_SEED, tokenPoolAcc.toBuffer()],
      program.programId
    );

    console.log('Accounts:');
    console.log('poolOwner public key:', poolOwner.publicKey.toBase58());
    console.log('mint:', mint.toBase58());
    console.log('userAccount public key:', userAccount.publicKey.toBase58());
    console.log('tokenPoolVault:', tokenPoolVault.toBase58());
    console.log('tokenPoolAcc:', tokenPoolAcc.toBase58());
    console.log('feeVault:', feeVault.toBase58());
    console.log('poaFees:', poaFees.toBase58());
  });

  // Test initializing the token pool
  it('Initializes the token pool', async () => {
    const totalSupply = new anchor.BN(toLamports(100));
    const rewardAmount = new anchor.BN(toLamports(1));
    const poolFee = new anchor.BN(toLamports(0.01));
    const tokenDecimals = 5;
    const poaFeesBalanceBefore = await provider.connection.getBalance(poaFees);

    await program.methods
      .tokenPoolInitialise({
        tokenName: attentionTokenMetadata.name,
        uri: attentionTokenMetadata.uri,
        symbol: attentionTokenMetadata.symbol,
        timeoutSec,
        tokenDecimals,
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
      .rpc().catch(e => console.error("***initialise token error***", e));

    // Fetch the token pool config and check that the values are set correctly
    const fetchTPConfig = await program.account.tokenPoolAcc.fetch(tokenPoolAcc);
    expect(fetchTPConfig.authority.equals(poolOwner.publicKey)).toBe(true);
    expect(fetchTPConfig.rewardAmount.eq(rewardAmount)).toBe(true);
    expect(fetchTPConfig.poolFee.eq(poolFee)).toBe(true);
    expect(fetchTPConfig.poolFeeVault.equals(feeVault)).toBe(true);
    expect(fetchTPConfig.timeoutSec).toBe(timeoutSec);

    // make checks for metadata values
    const metadataAccount = await fetchDigitalAsset(umi, publicKey(mint));
    expect(metadataAccount.metadata.name).toBe(attentionTokenMetadata.name);
    expect(metadataAccount.metadata.symbol).toBe(attentionTokenMetadata.symbol);
    expect(metadataAccount.metadata.uri).toBe(attentionTokenMetadata.uri);

    // Add tests to check that token meta is correct
    const mintInfo = await getMint(provider.connection, mint);
    expect(mintInfo.decimals).toBe(tokenDecimals);
    expect(mintInfo.supply.toString()).toBe(totalSupply.toString());
    expect(mintInfo.isInitialized).toBe(true);
    expect(mintInfo.freezeAuthority).toBeNull();
    expect(mintInfo.mintAuthority?.equals(mint)).toBe(true);

    // Check pool token account balance
    const tokenPoolVaultInfo = await getAccount(
      provider.connection,
      tokenPoolVault
    );
    expect(tokenPoolVaultInfo.amount).toBe(BigInt(totalSupply.toString()));

    // Check program fee account balance
    const poaFeesBalanceAfter = await provider.connection.getBalance(poaFees);
    expect(poaFeesBalanceAfter - poaFeesBalanceBefore).toBe(1_500_000);
  });

  describe('Attention Interactions', () => {
    let proofAccount: PublicKey;
    let rewardVault: PublicKey;

    beforeAll(async () => {
      rewardVault = await getAssociatedTokenAddress(
        mint,
        userAccount.publicKey
      );
      [proofAccount] = PublicKey.findProgramAddressSync(
        [PROOF_ACC_SEED, userAccount.publicKey.toBuffer(), mint.toBuffer()],
        program.programId
      );
      console.log('proofAccount:', proofAccount.toBase58());
      console.log('rewardVault:', rewardVault.toBase58());
    });

    it('Initializes attention proof', async () => {
      await timeoutInit();
      await program.methods
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
        .rpc().catch(e => console.error("***attention init error***", e));

      // Fetch and verify the proof account
      const proofAccData = await program.account.proofAcc.fetch(proofAccount);
      expect(proofAccData.authority.equals(userAccount.publicKey)).toBe(true);
      expect(proofAccData.balance.toNumber()).toBe(0);
      expect(proofAccData.tokenMint.equals(mint)).toBe(true);
      expect(proofAccData.tokenRewardVault.equals(rewardVault)).toBe(true);
      expect(proofAccData.totalProofs.toNumber()).toBe(1);
      expect(proofAccData.totalRewards.toNumber()).toBe(1000000000);

      // Verify that the reward vault was created
      const rewardVaultInfo = await getAccount(provider.connection, rewardVault);
      expect(rewardVaultInfo.mint.equals(mint)).toBe(true);
      expect(rewardVaultInfo.owner.equals(userAccount.publicKey)).toBe(true);

      // Verify that the attention account has the correct fees
      const attentionAccInfo = await provider.connection.getAccountInfo(poaFees);
      attentionAccInfo && expect(attentionAccInfo.lamports).toBe(1_003_150_000);
    });

    it('Successfully submits a successive attention proof', async () => {
      // Wait for the timeout period which was set on initialization
      await timeoutInit(); // setTimeout uses milliseconds

      const initialProofAccount = await program.account.proofAcc.fetch(proofAccount);
      const initialRewardVaultBalance = (await getAccount(provider.connection, rewardVault)).amount;
      const initialTokenPoolVaultBalance = (await getAccount(provider.connection, tokenPoolVault)).amount;

      await program.methods
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
        .rpc().catch(e => console.error("***attention prove error***", e));

      const updatedProofAccount = await program.account.proofAcc.fetch(proofAccount);
      const updatedRewardVaultBalance = (await getAccount(provider.connection, rewardVault)).amount;
      const updatedTokenPoolVaultBalance = (await getAccount(provider.connection, tokenPoolVault)).amount;

      expect(updatedProofAccount.totalProofs.toNumber()).toEqual(initialProofAccount.totalProofs.toNumber() + 1);
      expect(updatedProofAccount.totalRewards.toNumber()).toBeGreaterThan(initialProofAccount.totalRewards.toNumber());
      expect(updatedProofAccount.lastProofAt.toNumber()).toBeGreaterThan(initialProofAccount.lastProofAt.toNumber());
      expect(updatedRewardVaultBalance).toBe(initialRewardVaultBalance + BigInt(toLamports(1)));
      expect(updatedTokenPoolVaultBalance).toBe(initialTokenPoolVaultBalance - BigInt(toLamports(1)));
    });

    it('Fails to submit attention proof before timeout', async () => {
      await expect(
        program.methods
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
          .rpc()
      ).rejects.toThrow(/CooldownNotMet/);
    });

    it('Fails to submit attention proof with invalid token name', async () => {
      await timeoutInit();
      await expect(
        program.methods
          .attentionInteract({
            tokenName: "InvalidToken",
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
          .rpc()
      ).rejects.toThrow();
    });

    it('Fails to submit attention proof with incorrect authority', async () => {
      await timeoutInit();
      const incorrectUser = Keypair.generate();
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(
          incorrectUser.publicKey,
          LAMPORTS_PER_SOL
        )
      );

      await expect(
        program.methods
          .attentionInteract({
            tokenName: attentionTokenMetadata.name,
          })
          .accountsStrict({
            tokenPoolAuthority: poolOwner.publicKey,
            attentionAuthority: incorrectUser.publicKey,
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
          .signers([incorrectUser, poolOwner])
          .rpc()
      ).rejects.toThrow();
    });

    it('Fails to submit attention proof with incorrect token mint', async () => {
      const incorrectMint = Keypair.generate().publicKey;
      await timeoutInit();

      await expect(
        program.methods
          .attentionInteract({
            tokenName: attentionTokenMetadata.name,
          })
          .accountsStrict({
            tokenPoolAuthority: poolOwner.publicKey,
            attentionAuthority: userAccount.publicKey,
            proofAccount,
            tokenMint: incorrectMint,
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
          .rpc()
      ).rejects.toThrow();
    });

    it('Fails to submit attention proof without the token pool authority', async () => {
      await timeoutInit(); // setTimeout uses milliseconds
      const incorrectTokenPoolAuthority = Keypair.generate();
      await expect(
        program.methods
          .attentionInteract({
            tokenName: attentionTokenMetadata.name,
          })
          .accountsStrict({
            tokenPoolAuthority: incorrectTokenPoolAuthority.publicKey,
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
          .signers([userAccount, incorrectTokenPoolAuthority])
          .rpc()
      ).rejects.toThrow(/InvalidTokenPoolAccount/);
    });
  });

  describe('Fee Vault Withdraw', () => {
    beforeAll(async () => {
      // Get the fee vault balance before tests
      const feeVaultBalance = await provider.connection.getBalance(feeVault);
      console.log('Initial fee vault balance:', feeVaultBalance);
    });

    it('Successfully withdraws fees from the fee vault', async () => {
      const withdrawAmount = new anchor.BN(toLamports(0.00069420)); // Withdraw 0.00069420 SOL
      const initialPoolOwnerBalance = await provider.connection.getBalance(poolOwner.publicKey);
      const initialFeeVaultBalance = await provider.connection.getBalance(feeVault);

      await program.methods
        .feeVaultWithdrawFunds({
          tokenName: attentionTokenMetadata.name,
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

      const finalPoolOwnerBalance = await provider.connection.getBalance(poolOwner.publicKey);
      const finalFeeVaultBalance = await provider.connection.getBalance(feeVault);

      expect(finalPoolOwnerBalance).toBeGreaterThan(initialPoolOwnerBalance);
      expect(finalFeeVaultBalance).toBeLessThan(initialFeeVaultBalance);
      expect(initialFeeVaultBalance - finalFeeVaultBalance).toBe(withdrawAmount.toNumber());
    });

    it('Fails to withdraw more than the fee vault balance', async () => {
      const feeVaultBalance = await provider.connection.getBalance(feeVault);
      const excessiveAmount = new anchor.BN(feeVaultBalance + toLamports(1)); // Try to withdraw more than available

      await expect(
        program.methods
          .feeVaultWithdrawFunds({
            tokenName: attentionTokenMetadata.name,
            amount: excessiveAmount,
          })
          .accountsStrict({
            authority: poolOwner.publicKey,
            mint,
            tokenPoolAcc,
            feeVault,
            systemProgram: SystemProgram.programId,
          })
          .signers([poolOwner])
          .rpc()
      ).rejects.toThrow(/InsufficientFeeVaultBalance/);
    });

    it('Fails when non-poolOwner tries to withdraw', async () => {
      const nonPoolOwner = Keypair.generate();
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(
          nonPoolOwner.publicKey,
          LAMPORTS_PER_SOL
        )
      );

      const withdrawAmount = new anchor.BN(toLamports(0.1));

      await expect(
        program.methods
          .feeVaultWithdrawFunds({
            tokenName: attentionTokenMetadata.name,
            amount: withdrawAmount,
          })
          .accountsStrict({
            authority: nonPoolOwner.publicKey,
            mint,
            tokenPoolAcc,
            feeVault,
            systemProgram: SystemProgram.programId,
          })
          .signers([nonPoolOwner])
          .rpc()
      ).rejects.toThrow(/WithdrawNotApproved/);
    });

    it('Fails when trying to withdraw with incorrect token name', async () => {
      const withdrawAmount = new anchor.BN(toLamports(0.1));

      await expect(
        program.methods
          .feeVaultWithdrawFunds({
            tokenName: "IncorrectTokenName",
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
          .rpc()
      ).rejects.toThrow();
    });
  });
});
