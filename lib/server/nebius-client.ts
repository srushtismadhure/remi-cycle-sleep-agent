import "server-only";

import OpenAI from "openai";

import { IntegrationError } from "./integration-errors";

function readNebiusBaseUrl() {
  const configured = process.env.NEBIUS_BASE_URL?.trim();

  if (!configured) {
    return "https://api.tokenfactory.nebius.com/v1/";
  }

  if (/^https?:\/\/https?:\/\//i.test(configured)) {
    throw new IntegrationError(
      "MISSING_CONFIGURATION",
      "NEBIUS_BASE_URL contains a duplicate protocol prefix.",
      "Use a single https:// prefix in NEBIUS_BASE_URL.",
    );
  }

  if (!/^https?:\/\//i.test(configured)) {
    throw new IntegrationError(
      "MISSING_CONFIGURATION",
      "NEBIUS_BASE_URL must start with http:// or https://.",
      "Set NEBIUS_BASE_URL to the full OpenAI-compatible Nebius endpoint.",
    );
  }

  return configured;
}

export function getNebiusClient(): OpenAI {
  const apiKey = process.env.NEBIUS_API_KEY?.trim();

  if (!apiKey) {
    throw new IntegrationError(
      "MISSING_CONFIGURATION",
      "NEBIUS_API_KEY is not configured.",
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: readNebiusBaseUrl(),
  });
}

