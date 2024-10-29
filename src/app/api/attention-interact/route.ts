import { NextResponse } from 'next/server';
import { Connection, Transaction, TransactionConfirmationStrategy, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export async function POST(request: Request) {
  try {
    const { transaction } = await request.json();

    if (!transaction) {
      return NextResponse.json({ error: 'No transaction provided' }, { status: 400 });
    }

    // Deserialize the transaction from base64
    const deserializedTx = Transaction.from(Buffer.from(transaction, 'base64'));

    // Create a Keypair from the POA_SIGNING_AUTHORITY
    const signingAuthoritySecret = process.env.POA_SIGNING_AUTHORITY!;
    let signingAuthority: Keypair;
    try {
      // Parse the JSON string to an array of numbers
      const secretKeyArray = JSON.parse(signingAuthoritySecret);
      if (!Array.isArray(secretKeyArray) || secretKeyArray.length !== 64) {
        throw new Error('Invalid secret key format');
      }
      // Convert the array of numbers to Uint8Array
      const secretKeyUint8Array = new Uint8Array(secretKeyArray);
      signingAuthority = Keypair.fromSecretKey(secretKeyUint8Array);
    } catch (error) {
      console.error('Error parsing POA_SIGNING_AUTHORITY:', error);
      throw new Error('Invalid POA_SIGNING_AUTHORITY format');
    }

    // Verify the transaction structure if needed
    // ... (add verification logic here)

    // Sign the transaction
    deserializedTx.partialSign(signingAuthority);

    // Connect to the Solana network
    const connection = new Connection(process.env.SOLANA_RPC_ENDPOINT!);

    // Send the fully signed transaction
    const signature = await connection.sendRawTransaction(deserializedTx.serialize());

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