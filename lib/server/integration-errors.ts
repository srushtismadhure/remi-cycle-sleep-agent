export type IntegrationErrorCode =
  | "MISSING_CONFIGURATION"
  | "AUTHENTICATION_FAILED"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "MODEL_UNAVAILABLE"
  | "COLLECTION_NOT_FOUND"
  | "COLLECTION_EMPTY"
  | "DIMENSION_MISMATCH"
  | "INVALID_RESPONSE"
  | "UNKNOWN_ERROR";

export class IntegrationError extends Error {
  public readonly code: IntegrationErrorCode;
  public readonly remediation?: string;

  constructor(
    code: IntegrationErrorCode,
    message: string,
    remediation?: string,
  ) {
    super(message);
    this.name = "IntegrationError";
    this.code = code;
    this.remediation = remediation;
  }
}

function extractMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "string" ? error : "Unknown integration error";
}

function extractStatusCode(error: unknown) {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const candidate = error as {
    status?: unknown;
    statusCode?: unknown;
    response?: { status?: unknown };
  };

  if (typeof candidate.status === "number") {
    return candidate.status;
  }

  if (typeof candidate.statusCode === "number") {
    return candidate.statusCode;
  }

  if (typeof candidate.response?.status === "number") {
    return candidate.response.status;
  }

  return undefined;
}

export function normalizeIntegrationError(error: unknown): IntegrationError {
  if (error instanceof IntegrationError) {
    return error;
  }

  const message = extractMessage(error);
  const statusCode = extractStatusCode(error);
  const normalized = message.toLowerCase();

  if (statusCode === 401 || /unauthori[sz]ed|invalid api key|authentication/i.test(message)) {
    return new IntegrationError(
      "AUTHENTICATION_FAILED",
      message,
      "Check that the server process is using the correct API key.",
    );
  }

  if (statusCode === 429 || /rate limit|too many requests/i.test(message)) {
    return new IntegrationError(
      "RATE_LIMITED",
      message,
      "Reduce diagnostic frequency and retry after the provider limit resets.",
    );
  }

  if (/timed out|timeout|aborted/i.test(normalized)) {
    return new IntegrationError(
      "TIMEOUT",
      message,
      "Retry the request and verify the provider endpoint is reachable.",
    );
  }

  if (
    /enotfound|econnrefused|econnreset|network|fetch failed|tls|certificate/i.test(
      normalized,
    )
  ) {
    return new IntegrationError(
      "NETWORK_ERROR",
      message,
      "Verify the provider URL, network reachability, and TLS configuration.",
    );
  }

  if (/not configured|missing configuration|missing env|missing required/i.test(normalized)) {
    return new IntegrationError(
      "MISSING_CONFIGURATION",
      message,
      "Add the required environment variable and restart the development server.",
    );
  }

  if (/model|deployment/i.test(normalized) && /not found|unavailable|unsupported/i.test(normalized)) {
    return new IntegrationError(
      "MODEL_UNAVAILABLE",
      message,
      "Verify the configured Nebius model name and region endpoint.",
    );
  }

  if (/collection/i.test(normalized) && /not found|does not exist|missing/i.test(normalized)) {
    return new IntegrationError(
      "COLLECTION_NOT_FOUND",
      message,
      "Check QDRANT_COLLECTION and confirm the hosted collection exists.",
    );
  }

  if (/collection/i.test(normalized) && /empty|zero points|no points/i.test(normalized)) {
    return new IntegrationError(
      "COLLECTION_EMPTY",
      message,
      "Ingest vectors into the existing collection before running similarity search.",
    );
  }

  if (/dimension|shape|size mismatch/i.test(normalized)) {
    return new IntegrationError(
      "DIMENSION_MISMATCH",
      message,
      "Use the same embedding model for runtime queries and collection ingestion.",
    );
  }

  if (/invalid|malformed|parse|schema|response/i.test(normalized)) {
    return new IntegrationError(
      "INVALID_RESPONSE",
      message,
      "Check provider response parsing and request schema assumptions.",
    );
  }

  return new IntegrationError("UNKNOWN_ERROR", message);
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string,
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new IntegrationError(
          "TIMEOUT",
          `${label} timed out after ${timeoutMs}ms.`,
        ),
      );
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
