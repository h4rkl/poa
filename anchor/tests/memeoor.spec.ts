import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  AuthorityType,
  TOKEN_PROGRAM_ID,
  createAccount,
  createMint,
  getAccount,
  mintTo,
  setAuthority,
} from '@solana/spl-token';
import {
  CONFIG_SEED,
  FEE_VAULT_SEED,
  MINT_SEED,
  TOKEN_VAULT_SEED,
  toLamports,
} from './test-helpers';
import { Memeoor } from '../target/types/memeoor';

// Configure the provider to use the local cluster
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// Load the program
const program = anchor.workspace.Memeoor as Program<Memeoor>;

// Define the Jest tests
describe('Memeoor Program', () => {
  let poolOwner: Keypair;
  let poolOwnerTokenAccount: PublicKey;
  let mint: PublicKey;
  let userAccount: Keypair;
  let userTokenAccount: PublicKey;
  let userClaim: PublicKey;
  let tokenPoolVault: PublicKey;
  let tokenPoolAcc: PublicKey;
  let feeVault: PublicKey;
  const memeTokenName = "meme";

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
      [Buffer.from(MINT_SEED), Buffer.from(memeTokenName)],
      program.programId
    )[0]

    // poolOwnerTokenAccount = await createAccount(
    //   provider.connection,
    //   poolOwner,
    //   mint,
    //   poolOwner.publicKey
    // );
    // userTokenAccount = await createAccount(
    //   provider.connection,
    //   userAccount,
    //   mint,
    //   userAccount.publicKey
    // );

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

    // [userClaim] = PublicKey.findProgramAddressSync(
    //   [
    //     userAccount.publicKey.toBuffer(),
    //     tokenPoolAcc.toBuffer(),
    //     Buffer.from(MEMEOOR_PROTOCOL),
    //   ],
    //   program.programId
    // );
    console.log('Accounts:');
    console.log('poolOwner public key:', poolOwner.publicKey.toBase58());
    // console.log('poolOwnerTokenAccount:', poolOwnerTokenAccount.toBase58());
    console.log('mint:', mint.toBase58());
    console.log('userAccount public key:', userAccount.publicKey.toBase58());
    // console.log('userTokenAccount:', userTokenAccount.toBase58());
    // console.log('userClaim:', userClaim.toBase58());
    console.log('tokenPoolVault:', tokenPoolVault.toBase58());
    console.log('tokenPoolAcc:', tokenPoolAcc.toBase58());
    console.log('feeVault:', feeVault.toBase58());
  });

  // Test initializing the token pool
  it('Initializes the token pool', async () => {
    const initialCost = new anchor.BN(toLamports(1));
    const stepInterval = new anchor.BN(toLamports(10));
    const stepFactor = new anchor.BN(toLamports(2));
    const totalSupply = new anchor.BN(toLamports(100));

    await program.methods
      .initializeToken({
        tokenName: memeTokenName,
        initialCost,
        stepInterval,
        stepFactor,
        totalSupply,
      })
      .accountsStrict({
        authority: poolOwner.publicKey,
        mint,
        tokenPoolAcc,
        tokenPoolVault,
        feeVault,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([poolOwner])
      .rpc().catch(e => console.error("***************", e));

    // Fetch the token pool config and check that the values are set correctly
    const fetchTPConfig = await program.account.tokenPoolAcc.fetch(tokenPoolAcc);
    expect(fetchTPConfig.authority.equals(poolOwner.publicKey)).toBe(true);
    expect(fetchTPConfig.initialCost.eq(initialCost)).toBe(true);
    expect(fetchTPConfig.stepInterval.eq(stepInterval)).toBe(true);
    expect(fetchTPConfig.stepFactor.eq(stepFactor)).toBe(true);
    expect(fetchTPConfig.poolFeeVault.equals(feeVault)).toBe(true);

    // Check pool token account balance
    const tokenPoolVaultInfo = await getAccount(
      provider.connection,
      tokenPoolVault
    );
    console.log(JSON.stringify(tokenPoolVaultInfo));
    
    expect(tokenPoolVaultInfo.amount).toBe(BigInt(totalSupply.toString()));
  });

  //   // Test claiming tokens
  //   it('Claims tokens from the airdrop pool', async () => {
  //     // Perform the claim
  //     await program.methods
  //       .claimTokens(new anchor.BN(toLamports(1000)))
  //       .accountsStrict({
  //         poolAuthority: tokenPoolConfig,
  //         userTokenAccount,
  //         user: userAccount.publicKey,
  //         tokenPoolVault,
  //         userClaim,
  //         mint,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         systemProgram: SystemProgram.programId,
  //       })
  //       .signers([userAccount])
  //       .rpc();

  //     const tokenPoolVaultInfo = await getAccount(
  //       provider.connection,
  //       tokenPoolVault
  //     );
  //     const userTokenAccountInfo = await getAccount(
  //       provider.connection,
  //       userTokenAccount
  //     );
  //     const userClaimData = await program.account.userClaim.fetch(userClaim);

  //     expect(userClaimData.hasClaimed).toBe(true);
  //     expect(userTokenAccountInfo.amount).toBe(BigInt(toLamports(1000)));
  //     expect(tokenPoolVaultInfo.amount).toBe(BigInt(toLamports(599000)));
  //   });
});