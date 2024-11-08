import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import path from "path";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  TokenStandard,
  createV1,
  findMetadataPda,
  mintV1,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { Program } from "@coral-xyz/anchor";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  CONFIG_SEED,
  FEE_VAULT_SEED,
  PROOF_ACC_SEED,
  TOKEN_VAULT_SEED,
  attentionTokenMetadata,
  poaFees,
  toLamports,
  toTokenAmount,
} from "../src";
import { Poa } from "../target/types/poa";
import {
  Pda,
  createSignerFromKeypair,
  generateSigner,
  percentAmount,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";

// Configure the provider to use the local cluster
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// Load the program
const program = anchor.workspace.poa as Program<Poa>;
const umi = createUmi(provider.connection).use(mplTokenMetadata());

// Define the Jest tests
describe("Proof of Attention", () => {
  let poolOwner: Keypair;
  let poolOwnerAta: PublicKey;
  let mint: PublicKey;
  let userAccount: Keypair;
  let tokenPoolVault: PublicKey;
  let tokenPoolAcc: PublicKey;
  let feeVault: PublicKey;

  const timeoutSec = 1; // 1 second
  const supply = 100_000;
  const reward = 1;
  const tokenDecimals = 5;
  const timeoutInit = async () =>
    await new Promise((resolve) => setTimeout(resolve, timeoutSec * 1000)); // setTimeout uses milliseconds
  const tokenPoolName = "my-pool";

  jest.setTimeout(30000);

  // Before all tests, set up accounts and mint tokens
  beforeAll(async () => {
    const poolOwnerKeypairPath = path.join(
      __dirname,
      "..",
      "..",
      "test-keys",
      "oWN1o6G79qLrEEK4JB67GYsRNUhAoQRfAYnKJTxbrpe.json"
    );
    poolOwner = Keypair.fromSecretKey(
      Uint8Array.from(
        JSON.parse(fs.readFileSync(poolOwnerKeypairPath, "utf-8"))
      )
    );
    userAccount = Keypair.generate();

    try {
      // Airdrop SOL to pool owner, user, and poaFees
      await Promise.all(
        [poolOwner, userAccount, poaFees].map(async (account) => {
          const publicKey = "publicKey" in account ? account.publicKey : account;
          await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL)
          );
        })
      );
      // Create and mint test tokens
      const mintSigner = generateSigner(umi);

      const poolOwnerUmi = umi.eddsa.createKeypairFromSecretKey(poolOwner.secretKey);
      const poolOwnerUmiSigner = createSignerFromKeypair(umi, poolOwnerUmi);
      umi.use(signerIdentity(poolOwnerUmiSigner));

      await createV1(umi, {
        mint: mintSigner,
        authority: poolOwnerUmiSigner,
        name: attentionTokenMetadata.name,
        symbol: attentionTokenMetadata.symbol,
        uri: attentionTokenMetadata.uri,
        sellerFeeBasisPoints: percentAmount(0),
        decimals: 5,
        tokenStandard: TokenStandard.Fungible,
      }).sendAndConfirm(umi);

      await mintV1(umi, {
        mint: mintSigner.publicKey,
        authority: poolOwnerUmiSigner,
        amount: toTokenAmount(100_000, 5),
        tokenOwner: poolOwnerUmiSigner.publicKey,
        tokenStandard: TokenStandard.Fungible,
      }).sendAndConfirm(umi);
      mint = new PublicKey(mintSigner.publicKey);
    } catch (error) {
      console.error("Error creating test tokens:", error);
    }

    poolOwnerAta = await getAssociatedTokenAddress(mint, poolOwner.publicKey);

    [tokenPoolAcc] = PublicKey.findProgramAddressSync(
      [CONFIG_SEED, mint.toBuffer(), Buffer.from(tokenPoolName)],
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

    console.log("Accounts:");
    console.log("poolOwner public key:", poolOwner.publicKey.toBase58());
    console.log("poolOwnerAta:", poolOwnerAta.toBase58());
    console.log("mint:", mint.toBase58());
    console.log("userAccount public key:", userAccount.publicKey.toBase58());
    console.log("tokenPoolVault:", tokenPoolVault.toBase58());
    console.log("tokenPoolAcc:", tokenPoolAcc.toBase58());
    console.log("feeVault:", feeVault.toBase58());
    console.log("poaFees:", poaFees.toBase58());
  });

  // Test initializing the token pool
  it("Initializes the token pool", async () => {
    const totalSupply = new anchor.BN(toTokenAmount(supply, tokenDecimals));
    const rewardAmount = new anchor.BN(toTokenAmount(reward, tokenDecimals));
    const poolFee = new anchor.BN(toLamports(0.001));
    const poaFeesBalanceBefore = await provider.connection.getBalance(poaFees);

    await program.methods
      .tokenPoolInitialise({
        tokenPoolName,
        timeoutSec,
        tokenDecimals,
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
      .rpc()
      .catch((e) => console.error("***initialise token error***", e));

    // Fetch the token pool config and check that the values are set correctly
    const fetchTPConfig = await program.account.tokenPoolAcc.fetch(
      tokenPoolAcc
    );
    expect(fetchTPConfig.authority.equals(poolOwner.publicKey)).toBe(true);
    expect(fetchTPConfig.rewardAmount.eq(rewardAmount)).toBe(true);
    expect(fetchTPConfig.poolFee.eq(poolFee)).toBe(true);
    expect(fetchTPConfig.poolFeeVault.equals(feeVault)).toBe(true);
    expect(fetchTPConfig.timeoutSec).toBe(timeoutSec);

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

  describe("Attention Interactions", () => {
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
      console.log("proofAccount:", proofAccount.toBase58());
      console.log("rewardVault:", rewardVault.toBase58());
    });

    it("Initializes attention proof", async () => {
      await timeoutInit();
      await program.methods
        .attentionInteract({
          tokenPoolName,
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
        .catch((e) => console.error("***attention init error***", e));

      // Fetch and verify the proof account
      const proofAccData = await program.account.proofAcc.fetch(proofAccount);
      expect(proofAccData.authority.equals(userAccount.publicKey)).toBe(true);
      expect(proofAccData.balance.toNumber()).toBe(0);
      expect(proofAccData.tokenMint.equals(mint)).toBe(true);
      expect(proofAccData.tokenRewardVault.equals(rewardVault)).toBe(true);
      expect(proofAccData.totalProofs.toNumber()).toBe(1);
      expect(proofAccData.totalRewards.toNumber()).toBe(
        toTokenAmount(reward, tokenDecimals)
      );

      // Verify that the reward vault was created
      const rewardVaultInfo = await getAccount(
        provider.connection,
        rewardVault
      );
      expect(rewardVaultInfo.mint.equals(mint)).toBe(true);
      expect(rewardVaultInfo.owner.equals(userAccount.publicKey)).toBe(true);

      // Verify that the attention account has the correct fees
      const attentionAccInfo = await provider.connection.getAccountInfo(
        poaFees
      );
      attentionAccInfo && expect(attentionAccInfo.lamports).toBe(1_003_150_000);
    });

    it("Successfully submits a successive attention proof", async () => {
      // Wait for the timeout period which was set on initialization
      await timeoutInit(); // setTimeout uses milliseconds

      const initialProofAccount = await program.account.proofAcc.fetch(
        proofAccount
      );
      const initialRewardVaultBalance = (
        await getAccount(provider.connection, rewardVault)
      ).amount;
      const initialTokenPoolVaultBalance = (
        await getAccount(provider.connection, tokenPoolVault)
      ).amount;

      await program.methods
        .attentionInteract({
          tokenPoolName,
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
        .catch((e) => console.error("***attention prove error***", e));

      const updatedProofAccount = await program.account.proofAcc.fetch(
        proofAccount
      );
      const updatedRewardVaultBalance = (
        await getAccount(provider.connection, rewardVault)
      ).amount;
      const updatedTokenPoolVaultBalance = (
        await getAccount(provider.connection, tokenPoolVault)
      ).amount;

      expect(updatedProofAccount.totalProofs.toNumber()).toEqual(
        initialProofAccount.totalProofs.toNumber() + 1
      );
      expect(updatedProofAccount.totalRewards.toNumber()).toBeGreaterThan(
        initialProofAccount.totalRewards.toNumber()
      );
      expect(updatedProofAccount.lastProofAt.toNumber()).toBeGreaterThan(
        initialProofAccount.lastProofAt.toNumber()
      );
      expect(updatedRewardVaultBalance).toBe(
        initialRewardVaultBalance + BigInt(toTokenAmount(reward, tokenDecimals))
      );
      expect(updatedTokenPoolVaultBalance).toBe(
        initialTokenPoolVaultBalance -
        BigInt(toTokenAmount(reward, tokenDecimals))
      );
    });

    it("Fails to submit attention proof before timeout", async () => {
      await expect(
        program.methods
          .attentionInteract({
            tokenPoolName,
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

    it("Fails to submit attention proof with invalid token name", async () => {
      await timeoutInit();
      await expect(
        program.methods
          .attentionInteract({
            tokenPoolName: "InvalidToken",
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

    it("Fails to submit attention proof with incorrect authority", async () => {
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
            tokenPoolName,
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

    it("Fails to submit attention proof with incorrect token mint", async () => {
      const incorrectMint = Keypair.generate().publicKey;
      await timeoutInit();

      await expect(
        program.methods
          .attentionInteract({
            tokenPoolName,
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

    it("Fails to submit attention proof without the token pool authority", async () => {
      await timeoutInit(); // setTimeout uses milliseconds
      const incorrectTokenPoolAuthority = Keypair.generate();
      await expect(
        program.methods
          .attentionInteract({
            tokenPoolName,
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

  describe("Fee Vault Withdraw", () => {
    beforeAll(async () => {
      // Get the fee vault balance before tests
      const feeVaultBalance = await provider.connection.getBalance(feeVault);
      console.log("Initial fee vault balance:", feeVaultBalance);
    });

    it("Successfully withdraws fees from the fee vault", async () => {
      const withdrawAmount = new anchor.BN(toLamports(0.0006942)); // Withdraw 0.00069420 SOL
      const initialPoolOwnerBalance = await provider.connection.getBalance(
        poolOwner.publicKey
      );
      const initialFeeVaultBalance = await provider.connection.getBalance(
        feeVault
      );

      await program.methods
        .feeVaultWithdrawFunds({
          tokenPoolName,
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

      const finalPoolOwnerBalance = await provider.connection.getBalance(
        poolOwner.publicKey
      );
      const finalFeeVaultBalance = await provider.connection.getBalance(
        feeVault
      );

      expect(finalPoolOwnerBalance).toBeGreaterThan(initialPoolOwnerBalance);
      expect(finalFeeVaultBalance).toBeLessThan(initialFeeVaultBalance);
      expect(initialFeeVaultBalance - finalFeeVaultBalance).toBe(
        withdrawAmount.toNumber()
      );
    });

    it("Fails to withdraw more than the fee vault balance", async () => {
      const feeVaultBalance = await provider.connection.getBalance(feeVault);
      const excessiveAmount = new anchor.BN(feeVaultBalance + toLamports(1)); // Try to withdraw more than available

      await expect(
        program.methods
          .feeVaultWithdrawFunds({
            tokenPoolName,
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

    it("Fails when non-poolOwner tries to withdraw", async () => {
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
            tokenPoolName,
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

    it("Fails when trying to withdraw with incorrect token name", async () => {
      const withdrawAmount = new anchor.BN(toLamports(0.1));

      await expect(
        program.methods
          .feeVaultWithdrawFunds({
            tokenPoolName: "IncorrectTokenName",
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
