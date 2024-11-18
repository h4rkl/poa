/**
 * Solana Actions Example
 */

import {
    ActionPostResponse,
    createPostResponse,
    ActionGetResponse,
    ActionPostRequest,
    createActionHeaders,
    ActionError,
} from "@solana/actions";
import {
    clusterApiUrl,
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
} from "@solana/web3.js";

// create the standard headers for this route (including CORS)
const headers = createActionHeaders();

export const GET = async (req: Request) => {
    try {
        const requestUrl = new URL(req.url);

        const baseHref = new URL(
            `/api/blink`,
            requestUrl.origin,
        ).toString();

        const payload: ActionGetResponse = {
            type: "action",
            title: "Farm 1 $CLICK",
            icon: new URL("/attn.png", requestUrl.origin).toString(),
            description: "Click the Button to prove you are human",
            label: "I am human",
            links: {
                actions: [
                    {
                        label: "Send 1 SOL",
                        href: baseHref,
                        type: "transaction",
                    },
                ],
            },
        };

        return Response.json(payload, {
            headers,
        });
    } catch (err) {
        console.log(err);
        let actionError: ActionError = { message: "An unknown error occurred" };
        if (typeof err == "string") actionError.message = err;
        return Response.json(actionError, {
            status: 400,
            headers,
        });
    }
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = async () => Response.json(null, { headers });

export const POST = async (req: Request) => {
    try {
        const body: ActionPostRequest = await req.json();

        // validate the client provided input
        let account: PublicKey;
        try {
            account = new PublicKey(body.account);
        } catch (err) {
            throw 'Invalid "account" provided';
        }

        const connection = new Connection(
            process.env.SOLANA_RPC! || clusterApiUrl("devnet"),
        );

        // ensure the receiving account will be rent exempt
        const minimumBalance = await connection.getMinimumBalanceForRentExemption(
            0, // note: simple accounts that just store native SOL have `0` bytes of data
        );
        if (amount * LAMPORTS_PER_SOL < minimumBalance) {
            throw `account may not be rent exempt: ${toPubkey.toBase58()}`;
        }

        // create an instruction to transfer native SOL from one wallet to another
        const transferSolInstruction = SystemProgram.transfer({
            fromPubkey: account,
            toPubkey: toPubkey,
            lamports: amount * LAMPORTS_PER_SOL,
        });

        // get the latest blockhash amd block height
        const { blockhash, lastValidBlockHeight } =
            await connection.getLatestBlockhash();

        // create a legacy transaction
        const transaction = new Transaction({
            feePayer: account,
            blockhash,
            lastValidBlockHeight,
        }).add(transferSolInstruction);

        // versioned transactions are also supported
        // const transaction = new VersionedTransaction(
        //   new TransactionMessage({
        //     payerKey: account,
        //     recentBlockhash: blockhash,
        //     instructions: [transferSolInstruction],
        //   }).compileToV0Message(),
        //   // note: you can also use `compileToLegacyMessage`
        // );

        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                transaction,
                message: `Send ${amount} SOL to ${toPubkey.toBase58()}`,
            },
            // note: no additional signers are needed
            // signers: [],
        });

        return Response.json(payload, {
            headers,
        });
    } catch (err) {
        console.log(err);
        let actionError: ActionError = { message: "An unknown error occurred" };
        if (typeof err == "string") actionError.message = err;
        return Response.json(actionError, {
            status: 400,
            headers,
        });
    }
};