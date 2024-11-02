import { ACTIONS_CORS_HEADERS } from "@solana/actions";
import { APIGatewayProxyEvent, Handler } from "aws-lambda";

export const get: Handler = async (event: APIGatewayProxyEvent, context) => {
  return {
    statusCode: 200,
    headers: ACTIONS_CORS_HEADERS,
    body: JSON.stringify({
      rules: [{ pathPattern: "/donate", apiPath: "/api/donate" }],
    }),
  };
};

export const options = get;
