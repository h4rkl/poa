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
  attentionAccount,
} from './test-helpers';
import { Memeoor } from '../target/types/memeoor';
import { Pda, publicKey } from '@metaplex-foundation/umi';

// Configure the provider to use the local cluster
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// Load the program
const program = anchor.workspace.Memeoor as Program<Memeoor>;
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

  // Before all tests, set up accounts and mint tokens
  beforeAll(async () => {
    poolOwner = Keypair.generate();
    userAccount = Keypair.generate();

    // Airdrop SOL to pool owner and user
    await Promise.all(
      [poolOwner, userAccount].map(async (keypair) => {
        await provider.connection.confirmTransaction(
          await provider.connection.requestAirdrop(
            keypair.publicKey,
            LAMPORTS_PER_SOL
          )
        );
      })
    );

    // Create a mint
    mint = PublicKey.findProgramAddressSync(
      [Buffer.from(MINT_SEED), Buffer.from(attentionTokenMetadata.name)],
      program.programId
    )[0]

    // reward token mint metadata account address
    mintMetadataPDA = findMetadataPda(umi, { mint: publicKey(mint) });

    tokenPoolAcc = PublicKey.findProgramAddressSync(
      [Buffer.from(CONFIG_SEED), mint.toBuffer()],
      program.programId
    )[0];

    tokenPoolVault = PublicKey.findProgramAddressSync(
      [Buffer.from(TOKEN_VAULT_SEED), mint.toBuffer(), tokenPoolAcc.toBuffer()],
      program.programId
    )[0];

    feeVault = PublicKey.findProgramAddressSync(
      [Buffer.from(FEE_VAULT_SEED), tokenPoolAcc.toBuffer()],
      program.programId
    )[0];

    console.log('Accounts:');
    console.log('poolOwner public key:', poolOwner.publicKey.toBase58());
    console.log('mint:', mint.toBase58());
    console.log('userAccount public key:', userAccount.publicKey.toBase58());
    console.log('tokenPoolVault:', tokenPoolVault.toBase58());
    console.log('tokenPoolAcc:', tokenPoolAcc.toBase58());
    console.log('feeVault:', feeVault.toBase58());
  });

  // Test initializing the token pool
  it('Initializes the token pool', async () => {
    const totalSupply = new anchor.BN(toLamports(100));
    const rewardAmount = new anchor.BN(toLamports(1));
    const poolFee = new anchor.BN(toLamports(0.01));
    const timeout = 30; // 30 seconds
    const tokenDecimals = 5;

    await program.methods
      .tokenPoolInitialise({
        tokenName: attentionTokenMetadata.name,
        uri: attentionTokenMetadata.uri,
        symbol: attentionTokenMetadata.symbol,
        timeout,
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
    expect(fetchTPConfig.timeout).toBe(timeout);

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
  });

  describe('Attention Init', () => {
    let rewardVault: PublicKey;
    let proofAccount: PublicKey;

    beforeAll(async () => {
      rewardVault = await getAssociatedTokenAddress(
        mint,
        userAccount.publicKey
      );
      [proofAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from(PROOF_ACC_SEED), userAccount.publicKey.toBuffer(), mint.toBuffer()],
        program.programId
      );
      console.log('proofAccount:', proofAccount.toBase58());
      console.log('rewardVault:', rewardVault.toBase58());
    });

    it('Initializes attention proof', async () => {
      await program.methods
        .attentionInitialise({
          tokenName: attentionTokenMetadata.name,
        })
        .accountsStrict({
          authority: userAccount.publicKey,
          tokenMint: mint,
          rewardVault,
          proofAccount,
          attentionAccount,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([userAccount])
        .rpc().catch(e => console.error("***attention init error***", e));

      // Fetch and verify the proof account
      const proofAccData = await program.account.proofAcc.fetch(proofAccount);
      expect(proofAccData.authority.equals(userAccount.publicKey)).toBe(true);
      expect(proofAccData.balance.toNumber()).toBe(0);
      expect(proofAccData.tokenMint.equals(mint)).toBe(true);
      expect(proofAccData.tokenRewardVault.equals(rewardVault)).toBe(true);
      expect(proofAccData.totalProofs.toNumber()).toBe(0);
      expect(proofAccData.totalRewards.toNumber()).toBe(0);

      // Verify that the reward vault was created
      const rewardVaultInfo = await getAccount(provider.connection, rewardVault);
      expect(rewardVaultInfo.mint.equals(mint)).toBe(true);
      expect(rewardVaultInfo.owner.equals(userAccount.publicKey)).toBe(true);

      // Verify that the attention account has the correct fees
      const attentionAccInfo = await provider.connection.getAccountInfo(attentionAccount);
      attentionAccInfo && expect(attentionAccInfo.lamports).toBe(1_500_000);
    });

    it('Fails to initialize with invalid token name', async () => {
      const invalidTokenName = "InvalidToken";

      await expect(
        program.methods
          .attentionInitialise({
            tokenName: invalidTokenName,
          })
          .accountsStrict({
            authority: userAccount.publicKey,
            tokenMint: mint,
            rewardVault,
            proofAccount,
            attentionAccount,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([userAccount])
          .rpc()
      ).rejects.toThrow();
    });

    it('Fails to initialize with existing proof account', async () => {

      await expect(
        program.methods
          .attentionInitialise({
            tokenName: attentionTokenMetadata.name,
          })
          .accountsStrict({
            authority: userAccount.publicKey,
            tokenMint: mint,
            rewardVault,
            proofAccount,
            attentionAccount,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([userAccount])
          .rpc()
      ).rejects.toThrow();
    });
  });
});
