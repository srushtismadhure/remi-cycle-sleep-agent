import "server-only";

import { QdrantClient } from "@qdrant/js-client-rest";

import { IntegrationError } from "./integration-errors";

function readQdrantUrl() {
  const configured = process.env.QDRANT_URL?.trim();

  if (!configured) {
    throw new IntegrationError(
      "MISSING_CONFIGURATION",
      "QDRANT_URL is not configured.",
    );
  }

  if (/^https?:\/\/https?:\/\//i.test(configured)) {
    throw new IntegrationError(
      "MISSING_CONFIGURATION",
      "QDRANT_URL contains a duplicate protocol prefix.",
      "Use a single https:// prefix in QDRANT_URL.",
    );
  }

  if (!/^https?:\/\//i.test(configured)) {
    throw new IntegrationError(
      "MISSING_CONFIGURATION",
      "QDRANT_URL must start with http:// or https://.",
      "Copy the full HTTPS endpoint from the Qdrant deployment.",
    );
  }

  return configured;
}

export function getQdrantCollectionName() {
  return process.env.QDRANT_COLLECTION?.trim() || "remi_similarity_cases";
}

export function getQdrantClient(): QdrantClient {
  const apiKey = process.env.QDRANT_API_KEY?.trim();

  if (!apiKey) {
    throw new IntegrationError(
      "MISSING_CONFIGURATION",
      "QDRANT_API_KEY is not configured.",
    );
  }

  return new QdrantClient({
    url: readQdrantUrl(),
    apiKey,
  });
}

