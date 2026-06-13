import "server-only";

import { tavily, type TavilyClient } from "@tavily/core";

let client: TavilyClient | null = null;

export function getTavilyClient() {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not configured.");
  }

  client ??= tavily({ apiKey });
  return client;
}
