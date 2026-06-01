import { Agent } from "node:https";
import { GigaChat } from "langchain-gigachat";

const httpsAgent = new Agent({ rejectUnauthorized: false });

export function createGigaChat(): GigaChat {
  const credentials = process.env.GIGACHAT_CREDENTIALS;
  if (!credentials) {
    throw new Error("GIGACHAT_CREDENTIALS is not set in .env");
  }
  return new GigaChat({
    credentials,
    model: "GigaChat",
    httpsAgent,
  });
}
