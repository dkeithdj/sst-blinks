import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { clusterApiUrl, Connection } from "@solana/web3.js";

export const connection = new Connection(
  process.env.SOLANA_RPC! || clusterApiUrl("devnet"),
);

async function prepareTransaction(
  instructions: TransactionInstruction[],
  payer: PublicKey,
) {
  const blockhash = await connection
    .getLatestBlockhash({ commitment: "max" })
    .then((res) => res.blockhash);
  const messageV0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  return new VersionedTransaction(messageV0);
}

export async function prepareDonateTransaction(
  sender: PublicKey,
  recipient: PublicKey,
  lamports: number,
): Promise<VersionedTransaction> {
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: new PublicKey(recipient),
      lamports: lamports,
    }),
  ];
  return prepareTransaction(instructions, sender);
}
