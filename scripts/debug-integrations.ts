import { readFile } from "node:fs/promises";
import path from "node:path";

import { QdrantClient } from "@qdrant/js-client-rest";
import nextEnv from "@next/env";
import OpenAI from "openai";
import { tavily, type TavilyClient } from "@tavily/core";

import {
  IntegrationError,
  normalizeIntegrationError,
  withTimeout,
} from "../lib/server/integration-errors.ts";

type DiagnosticStatus = "passed" | "failed" | "skipped" | "warning";

interface IntegrationDiagnostic {
  service: string;
  status: DiagnosticStatus;
  durationMs?: number;
  message: string;
  errorCode?: string;
  remediation?: string;
}

interface RawSyntheticNightRecord {
  cycle_day?: number | null;
  cycle_phase?: string | null;
  fatigue_0_5?: number | null;
  hrv_rmssd_ms?: number | null;
  remi_sleep_risk_score_0_100?: number | null;
  restlessness_score?: number | null;
  self_report_stress_0_5?: number | null;
  sleep_debt_hours?: number | null;
  sleep_issue_0_5?: number | null;
}

const ENV_KEYS = [
  "TAVILY_API_KEY",
  "NEBIUS_API_KEY",
  "NEBIUS_BASE_URL",
  "NEBIUS_EMBEDDING_MODEL",
  "NEBIUS_CHAT_MODEL",
  "QDRANT_URL",
  "QDRANT_API_KEY",
  "QDRANT_COLLECTION",
] as const;

const TEST_EMBEDDING_TEXT = [
  "Cycle phase: luteal.",
  "Fatigue: elevated.",
  "Stress: elevated.",
  "HRV relative to baseline: lower.",
  "Sleep difficulty: elevated.",
].join("\n");

const TAVILY_QUERY =
  "systematic review menstrual cycle sleep fatigue site:pubmed.ncbi.nlm.nih.gov";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const flags = new Set(process.argv.slice(2));
const runAll = flags.size === 0 || flags.has("--all");
const envOnly = flags.has("--env-only");
const shouldRunTavily = runAll || flags.has("--tavily");
const shouldRunNebius = runAll || flags.has("--nebius");
const shouldRunQdrant = runAll || flags.has("--qdrant");

const diagnostics: IntegrationDiagnostic[] = [];
let tavilyClient: TavilyClient | null = null;
let nebiusClient: OpenAI | null = null;
let qdrantClient: QdrantClient | null = null;

function pushDiagnostic(diagnostic: IntegrationDiagnostic) {
  diagnostics.push(diagnostic);
}

function getConfiguredEnvStatus(name: (typeof ENV_KEYS)[number]) {
  return Boolean(process.env[name]?.trim());
}

function formatStatus(status: DiagnosticStatus) {
  return status.toUpperCase().padEnd(7, " ");
}

function getTavilyClient() {
  const apiKey = process.env.TAVILY_API_KEY?.trim();

  if (!apiKey) {
    throw new IntegrationError(
      "MISSING_CONFIGURATION",
      "TAVILY_API_KEY is not configured.",
    );
  }

  tavilyClient ??= tavily({ apiKey });
  return tavilyClient;
}

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

function getNebiusClient() {
  const apiKey = process.env.NEBIUS_API_KEY?.trim();

  if (!apiKey) {
    throw new IntegrationError(
      "MISSING_CONFIGURATION",
      "NEBIUS_API_KEY is not configured.",
    );
  }

  nebiusClient ??= new OpenAI({
    apiKey,
    baseURL: readNebiusBaseUrl(),
  });

  return nebiusClient;
}

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

function getQdrantCollectionName() {
  return process.env.QDRANT_COLLECTION?.trim() || "remi_similarity_cases";
}

function getQdrantClient() {
  const apiKey = process.env.QDRANT_API_KEY?.trim();

  if (!apiKey) {
    throw new IntegrationError(
      "MISSING_CONFIGURATION",
      "QDRANT_API_KEY is not configured.",
    );
  }

  qdrantClient ??= new QdrantClient({
    url: readQdrantUrl(),
    apiKey,
  });

  return qdrantClient;
}

function printDiagnostics() {
  const serviceWidth = Math.max(
    ...diagnostics.map((diagnostic) => diagnostic.service.length),
    "Service".length,
  );

  console.log("");
  console.log("Integration Diagnostics");
  console.log("=======================");

  for (const diagnostic of diagnostics) {
    const duration =
      typeof diagnostic.durationMs === "number"
        ? ` ${diagnostic.durationMs}ms`
        : "";
    const code = diagnostic.errorCode ? ` [${diagnostic.errorCode}]` : "";
    console.log(
      `${diagnostic.service.padEnd(serviceWidth)}  ${formatStatus(
        diagnostic.status,
      )}  ${diagnostic.message}${code}${duration}`,
    );

    if (diagnostic.remediation) {
      console.log(`  remediation: ${diagnostic.remediation}`);
    }
  }
}

async function runStep(
  service: string,
  action: () => Promise<Omit<IntegrationDiagnostic, "service">>,
) {
  const startedAt = Date.now();

  try {
    const result = await action();
    pushDiagnostic({
      service,
      durationMs: Date.now() - startedAt,
      ...result,
    });
    return result;
  } catch (error) {
    const normalized = normalizeIntegrationError(error);
    const result = {
      service,
      status: "failed" as const,
      durationMs: Date.now() - startedAt,
      message: normalized.message,
      errorCode: normalized.code,
      remediation: normalized.remediation,
    };
    pushDiagnostic(result);
    return result;
  }
}

function readBodyStateText(record: RawSyntheticNightRecord) {
  const entries = [
    ["Cycle phase", record.cycle_phase ?? "unknown"],
    ["Cycle day", record.cycle_day ?? 0],
    ["Stress 0-10", typeof record.self_report_stress_0_5 === "number" ? record.self_report_stress_0_5 * 2 : 0],
    ["Fatigue 0-5", record.fatigue_0_5 ?? "unknown"],
    ["Sleep issue 0-5", record.sleep_issue_0_5 ?? "unknown"],
    ["Restlessness score", record.restlessness_score ?? "unknown"],
    ["Sleep debt hours", record.sleep_debt_hours ?? "unknown"],
    ["HRV ms", record.hrv_rmssd_ms ?? "unknown"],
    ["Sleep risk score 0-100", record.remi_sleep_risk_score_0_100 ?? "unknown"],
  ];

  return entries.map(([label, value]) => `${label}: ${value}.`).join("\n");
}

async function readDeterministicRecord() {
  const datasetPath = path.join(
    process.cwd(),
    "data",
    "remi_synthetic_user_night_dataset.json",
  );
  const raw = await readFile(datasetPath, "utf-8");
  const rows = JSON.parse(raw) as RawSyntheticNightRecord[];

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new IntegrationError(
      "INVALID_RESPONSE",
      "Synthetic REMi dataset is missing or empty.",
    );
  }

  const record = rows.find(
    (row) =>
      row.cycle_phase &&
      typeof row.cycle_day === "number" &&
      typeof row.hrv_rmssd_ms === "number",
  );

  if (!record) {
    throw new IntegrationError(
      "INVALID_RESPONSE",
      "No usable deterministic synthetic record was found.",
    );
  }

  return record;
}

function extractCollectionVectorInfo(collectionInfo: any) {
  const vectorsConfig = collectionInfo?.config?.params?.vectors;

  if (!vectorsConfig) {
    return { dimension: undefined, distance: undefined };
  }

  if (typeof vectorsConfig.size === "number") {
    return {
      dimension: vectorsConfig.size,
      distance: String(vectorsConfig.distance ?? "unknown"),
    };
  }

  const namedVector = Object.values(vectorsConfig)[0] as
    | { size?: number; distance?: unknown }
    | undefined;

  return {
    dimension:
      typeof namedVector?.size === "number" ? namedVector.size : undefined,
    distance: namedVector?.distance
      ? String(namedVector.distance)
      : undefined,
  };
}

function readAssistantContent(content: unknown) {
  if (typeof content === "string") {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part: unknown) =>
      part && typeof part === "object" && "text" in part
        ? String((part as { text?: unknown }).text ?? "")
        : "",
    )
    .join("\n")
    .trim();
}

async function main() {
  await runStep("Environment", async () => {
    const configured = ENV_KEYS.filter(getConfiguredEnvStatus);
    const missing = ENV_KEYS.filter((name) => !getConfiguredEnvStatus(name));

    if (configured.length === ENV_KEYS.length) {
      return {
        status: "passed",
        message: "All required integration environment variables are configured.",
      };
    }

    return {
      status: configured.length > 0 ? "warning" : "failed",
      message: `Configured: ${configured.join(", ") || "none"}; missing: ${missing.join(", ")}`,
      errorCode:
        configured.length > 0 ? "MISSING_CONFIGURATION" : "MISSING_CONFIGURATION",
      remediation:
        "Add the missing variables to .env or the shell environment and restart the Next.js dev server.",
    };
  });

  if (envOnly) {
    printDiagnostics();
    return;
  }

  if (shouldRunTavily) {
    await runStep("Tavily SDK", async () => {
      getTavilyClient();
      return {
        status: "passed",
        message: "Tavily SDK import and client initialization passed.",
      };
    });

    await runStep("Tavily Search", async () => {
      if (!getConfiguredEnvStatus("TAVILY_API_KEY")) {
        return {
          status: "skipped",
          message: "TAVILY_API_KEY is missing, so the live Tavily search was skipped.",
        };
      }

      const response = await withTimeout(
        getTavilyClient().search(TAVILY_QUERY, {
          topic: "general",
          searchDepth: "basic",
          maxResults: 2,
          includeAnswer: false,
          includeRawContent: false,
          includeImages: false,
          includeDomains: [
            "pubmed.ncbi.nlm.nih.gov",
            "ncbi.nlm.nih.gov",
          ],
        }),
        12_000,
        "Tavily minimal search",
      );

      if (!response || !Array.isArray(response.results)) {
        throw new IntegrationError(
          "INVALID_RESPONSE",
          "Tavily search returned an invalid results payload.",
        );
      }

      const firstResult = response.results.find(
        (result) =>
          typeof result.title === "string" &&
          typeof result.url === "string" &&
          typeof result.content === "string",
      );

      return {
        status: "passed",
        message: firstResult
          ? "Tavily search returned usable scientific source results."
          : "Tavily search succeeded but returned zero usable results.",
      };
    });
  }

  let embeddingVector: number[] | null = null;

  if (shouldRunNebius) {
    await runStep("Nebius Client", async () => {
      getNebiusClient();
      return {
        status: "passed",
        message: "Nebius OpenAI-compatible client initialization passed.",
      };
    });

    await runStep("Nebius Embedding", async () => {
      if (
        !getConfiguredEnvStatus("NEBIUS_API_KEY") ||
        !getConfiguredEnvStatus("NEBIUS_EMBEDDING_MODEL")
      ) {
        return {
          status: "skipped",
          message:
            "NEBIUS_API_KEY or NEBIUS_EMBEDDING_MODEL is missing, so the embedding request was skipped.",
        };
      }

      const response = await withTimeout(
        getNebiusClient().embeddings.create({
          model: process.env.NEBIUS_EMBEDDING_MODEL!,
          input: TEST_EMBEDDING_TEXT,
          encoding_format: "float",
        }),
        15_000,
        "Nebius embedding request",
      );

      const embedding = response.data?.[0]?.embedding;

      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new IntegrationError(
          "INVALID_RESPONSE",
          "Nebius embedding response was empty.",
        );
      }

      if (!embedding.every((value) => typeof value === "number" && Number.isFinite(value))) {
        throw new IntegrationError(
          "INVALID_RESPONSE",
          "Nebius embedding vector contained nonnumeric values.",
        );
      }

      embeddingVector = embedding;

      return {
        status: "passed",
        message: `Model: ${process.env.NEBIUS_EMBEDDING_MODEL}; dimension: ${embedding.length}`,
      };
    });

    await runStep("Nebius Chat", async () => {
      if (
        !getConfiguredEnvStatus("NEBIUS_API_KEY") ||
        !getConfiguredEnvStatus("NEBIUS_CHAT_MODEL")
      ) {
        return {
          status: "skipped",
          message:
            "NEBIUS_API_KEY or NEBIUS_CHAT_MODEL is missing, so the chat request was skipped.",
        };
      }

      const response = await withTimeout(
        getNebiusClient().chat.completions.create({
          model: process.env.NEBIUS_CHAT_MODEL!,
          temperature: 0,
          max_completion_tokens: 40,
          messages: [
            {
              role: "user",
              content: 'Return exactly this JSON object: {"status":"ok"}',
            },
          ],
        }),
        20_000,
        "Nebius minimal chat request",
      );

      const text = readAssistantContent(response.choices?.[0]?.message?.content);

      if (!text) {
        throw new IntegrationError(
          "INVALID_RESPONSE",
          "Nebius chat completion was empty.",
        );
      }

      const parsed = JSON.parse(
        text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1),
      ) as { status?: unknown };

      if (parsed.status !== "ok") {
        throw new IntegrationError(
          "INVALID_RESPONSE",
          "Nebius chat completion did not return the expected JSON object.",
        );
      }

      return {
        status: "passed",
        message: `Model: ${process.env.NEBIUS_CHAT_MODEL}; minimal JSON chat passed.`,
      };
    });
  }

  let qdrantDimension: number | undefined;

  if (shouldRunQdrant) {
    await runStep("Qdrant Client", async () => {
      getQdrantClient();
      return {
        status: "passed",
        message: "Qdrant client initialization passed.",
      };
    });

    await runStep("Qdrant Collection", async () => {
      if (
        !getConfiguredEnvStatus("QDRANT_URL") ||
        !getConfiguredEnvStatus("QDRANT_API_KEY")
      ) {
        return {
          status: "skipped",
          message:
            "QDRANT_URL or QDRANT_API_KEY is missing, so collection inspection was skipped.",
        };
      }

      const client = getQdrantClient();
      const collection = getQdrantCollectionName();
      const exists = await withTimeout(
        client.collectionExists(collection),
        10_000,
        "Qdrant collection existence check",
      );

      if (!exists.exists) {
        throw new IntegrationError(
          "COLLECTION_NOT_FOUND",
          `Collection ${collection} was not found.`,
        );
      }

      const collectionInfo = await withTimeout(
        client.getCollection(collection),
        10_000,
        "Qdrant collection metadata request",
      );
      const countResponse = await withTimeout(
        client.count(collection, { exact: true }),
        10_000,
        "Qdrant collection count request",
      );
      const { dimension, distance } = extractCollectionVectorInfo(collectionInfo);
      qdrantDimension = dimension;

      const count =
        typeof countResponse?.count === "number" ? countResponse.count : undefined;

      if (!count || count <= 0) {
        throw new IntegrationError(
          "COLLECTION_EMPTY",
          `Collection ${collection} is empty.`,
        );
      }

      return {
        status: "passed",
        message: `Collection: ${collection}; points: ${count}; dimension: ${dimension ?? "unknown"}; distance: ${distance ?? "unknown"}`,
      };
    });

    await runStep("Qdrant Similarity", async () => {
      if (!embeddingVector) {
        return {
          status: "skipped",
          message:
            "Nebius embedding did not produce a vector, so the Qdrant similarity query was skipped.",
        };
      }

      const client = getQdrantClient();
      const collection = getQdrantCollectionName();
      const results = await withTimeout(
        client.search(collection, {
          vector: embeddingVector,
          limit: 3,
          with_payload: true,
          with_vector: false,
          timeout: 10,
        }),
        10_000,
        "Qdrant test similarity query",
      );

      if (!Array.isArray(results) || results.length === 0) {
        throw new IntegrationError(
          "INVALID_RESPONSE",
          "Qdrant similarity query returned zero results.",
        );
      }

      const top = results[0];
      const payload =
        top && typeof top.payload === "object" && top.payload !== null
          ? (top.payload as Record<string, unknown>)
          : {};
      const topMode = payload.haptic_mode;

      if (
        typeof top.score !== "number" ||
        !Number.isFinite(top.score) ||
        !ALLOWED_HAPTIC_MODES.includes(String(topMode) as any)
      ) {
        throw new IntegrationError(
          "INVALID_RESPONSE",
          "Qdrant similarity results did not include a valid top score and haptic mode.",
        );
      }

      return {
        status: "passed",
        message: `Matches returned: ${results.length}; top score: ${top.score.toFixed(4)}; top mode: ${String(topMode)}`,
      };
    });
  }

  await runStep("End-to-End", async () => {
    if (!shouldRunNebius && !shouldRunQdrant) {
      return {
        status: "skipped",
        message: "End-to-end test skipped because Nebius and Qdrant diagnostics were not requested.",
      };
    }

    if (!embeddingVector) {
      return {
        status: "skipped",
        message: "End-to-end test skipped because Nebius embeddings are unavailable.",
      };
    }

    if (typeof qdrantDimension === "number" && qdrantDimension !== embeddingVector.length) {
      return {
        status: "failed",
        message: `Embedding dimension mismatch: Nebius=${embeddingVector.length}, Qdrant=${qdrantDimension}`,
        errorCode: "DIMENSION_MISMATCH",
        remediation:
          "Re-ingest the collection with the current embedding model or switch runtime to the original collection model.",
      };
    }

    const record = await readDeterministicRecord();
    const bodyStateText = readBodyStateText(record);
    const client = getQdrantClient();
    const collection = getQdrantCollectionName();
    const similarCases = await withTimeout(
      client.search(collection, {
        vector: embeddingVector,
        limit: 3,
        with_payload: true,
        with_vector: false,
        timeout: 10,
      }),
      10_000,
      "Qdrant end-to-end similarity query",
    );

    const response = await withTimeout(
      getNebiusClient().chat.completions.create({
        model: process.env.NEBIUS_CHAT_MODEL!,
        temperature: 0.1,
        max_completion_tokens: 220,
        messages: [
          {
            role: "system",
            content:
              "Return strict JSON only with keys status, final_mode, and summary. final_mode must be Calm Drift, Soft Wave, or Deep Downshift.",
          },
          {
            role: "user",
            content: [
              "Current synthetic body-state profile:",
              bodyStateText,
              "",
              `Retrieved synthetic cases: ${similarCases.length}`,
              "",
              'Return JSON like {"status":"ok","final_mode":"Soft Wave","summary":"..."}',
            ].join("\n"),
          },
        ],
      }),
      25_000,
      "Nebius end-to-end recommendation request",
    );

    const text = readAssistantContent(response.choices?.[0]?.message?.content);

    const parsed = JSON.parse(
      text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1),
    ) as { final_mode?: unknown; status?: unknown };

    if (
      parsed.status !== "ok" ||
      !ALLOWED_HAPTIC_MODES.includes(String(parsed.final_mode) as any)
    ) {
      throw new IntegrationError(
        "INVALID_RESPONSE",
        "End-to-end Nebius recommendation did not return a valid final mode JSON object.",
      );
    }

    return {
      status: "passed",
      message: `Final mode: ${String(parsed.final_mode)}; body-state text and similar-case prompt passed.`,
    };
  });

  printDiagnostics();
}

const ALLOWED_HAPTIC_MODES = [
  "Calm Drift",
  "Soft Wave",
  "Deep Downshift",
] as const;

main().catch((error) => {
  const normalized = normalizeIntegrationError(error);
  pushDiagnostic({
    service: "Diagnostic Script",
    status: "failed",
    message: normalized.message,
    errorCode: normalized.code,
    remediation: normalized.remediation,
  });
  printDiagnostics();
  process.exitCode = 1;
});
