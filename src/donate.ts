import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import {
  ActionGetResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  LinkedAction,
} from "@solana/actions";

import { prepareDonateTransaction } from "./util";
import { APIGatewayProxyEvent, Handler } from "aws-lambda";

const DONATION_DESTINATION_WALLET =
  "EQb8LApPTtZFk3cY7WcaAmEvuL6s3Q1q8ozxcPcBJ5dc";
const DONATION_AMOUNT_SOL_OPTIONS = [1, 5, 10];
const DEFAULT_DONATION_AMOUNT_SOL = 1;

export const get: Handler = async (event: APIGatewayProxyEvent, context) => {
  const amountParameterName = "amount";
  const actionMetadata: ActionGetResponse = {
    icon: "https://avatars.githubusercontent.com/u/42316655?v=4",
    label: `${DEFAULT_DONATION_AMOUNT_SOL} SOL`,
    title: "Donate",
    description: "Donate to support the project",
    links: {
      actions: [
        ...DONATION_AMOUNT_SOL_OPTIONS.map(
          (amount): LinkedAction => ({
            type: "post",
            label: `${amount} SOL`,
            href: `/api/donate/${amount}`,
          }),
        ),
        {
          type: "post",
          href: `/api/donate/{${amountParameterName}}`,
          label: "Donate",
          parameters: [
            {
              name: amountParameterName,
              label: "Enter a custom SOL amount",
            },
          ],
        },
      ],
    },
  };
  const response = {
    statusCode: 200,
    headers: ACTIONS_CORS_HEADERS,
    body: JSON.stringify(actionMetadata),
  };
  return response;
};
export const post: Handler = async (event: APIGatewayProxyEvent, context) => {
  const amount =
    event.pathParameters?.amount ?? DEFAULT_DONATION_AMOUNT_SOL.toString();

  const body = await JSON.parse(event.body || "{}");
  let account;

  try {
    account = new PublicKey(body.account);
  } catch (error) {
    return {
      statusCode: 400,
      body: "Invalid account",
      headers: ACTIONS_CORS_HEADERS,
    };
  }

  const parsedAmount = parseFloat(amount);
  const transaction = await prepareDonateTransaction(
    new PublicKey(account),
    new PublicKey(DONATION_DESTINATION_WALLET),
    parsedAmount * LAMPORTS_PER_SOL,
  );

  const response = await createPostResponse({
    fields: {
      type: "transaction",
      transaction: transaction,
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify(response),
    headers: ACTIONS_CORS_HEADERS,
  };
};

export const options = get;
