import { NextResponse } from 'next/server';
import { Connection, Transaction, TransactionConfirmationStrategy, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export async function POST(request: Request) {
  try {
    const { transaction } = await request.json();
    console.log('transaction:', transaction);
    

    if (!transaction) {
      return NextResponse.json({ error: 'No transaction provided' }, { status: 400 });
    }

    // Deserialize the transaction
    const deserializedTransaction = Transaction.from(Buffer.from(transaction, 'base64'));

    // Create a Keypair from the POA_SIGNING_AUTHORITY
    const signingAuthoritySecret = process.env.POA_SIGNING_AUTHORITY!;
    const signingAuthority = Keypair.fromSecretKey(bs58.decode(signingAuthoritySecret));

    // Sign the transaction
    deserializedTransaction.sign(signingAuthority);

    // Connect to the Solana network
    const connection = new Connection(process.env.SOLANA_RPC_ENDPOINT!);

    // Send the signed transaction
    const signature = await connection.sendRawTransaction(deserializedTransaction.serialize());

    // Get the latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    // Define the confirmation strategy
    const confirmationStrategy: TransactionConfirmationStrategy = {
      signature,
      blockhash,
      lastValidBlockHeight,
    };

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(confirmationStrategy);

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
    }

    return NextResponse.json({ signature });
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json({ error: 'Failed to process transaction' }, { status: 500 });
  }
}