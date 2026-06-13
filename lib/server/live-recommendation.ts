import "server-only";

import { z } from "zod";

import type { RemiTonightResult } from "@/lib/types";

import { getNebiusClient } from "./nebius-client";
import { getQdrantClient, getQdrantCollectionName } from "./qdrant-client";
import {
  IntegrationError,
  normalizeIntegrationError,
  withTimeout,
} from "./integration-errors";

const ALLOWED_HAPTIC_MODES = [
  "Calm Drift",
  "Soft Wave",
  "Deep Downshift",
] as const;

const recommendationSchema = z.object({
  sleep_friction_score: z.number().min(0).max(10),
  friction_level: z.enum(["Low", "Medium", "High"]),
  haptic_mode: z.enum(ALLOWED_HAPTIC_MODES),
  breath_rhythm_per_min: z.number().int().positive(),
  haptic_pulse_per_min: z.number().int().positive(),
  haptic_duration_min: z.number().int().positive(),
  haptic_intensity: z.enum(["Low", "Low–Medium", "Medium"]),
  drivers: z.array(z.string()).min(1).max(5),
  spot_message: z.string().min(1),
  moon_body_summary: z.string().min(1),
  confidence: z.enum(["low", "medium", "high"]),
  matched_case_count: z.number().int().nonnegative(),
  similarity_summary: z.string().min(1),
  recommendation_basis: z.enum(["similar synthetic cases", "deterministic fallback"]),
});

type RecommendationPayload = z.infer<typeof recommendationSchema>;

interface SimilarCasePayloadSummary {
  frictionLevel: string;
  hapticMode: (typeof ALLOWED_HAPTIC_MODES)[number];
  rationale?: string;
  recordId: string;
  similarityScore: number;
  sleepFrictionScore?: number;
  targetRecommendationJson?: string;
}

function readRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new IntegrationError(
      "MISSING_CONFIGURATION",
      `${name} is not configured.`,
    );
  }

  return value;
}

function cleanText(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  return undefined;
}

function buildField(label: string, value: unknown) {
  const normalized = cleanText(value);
  return normalized ? `${label}: ${normalized}.` : null;
}

export function hasLiveRecommendationConfig() {
  return Boolean(
    process.env.NEBIUS_API_KEY?.trim() &&
      process.env.NEBIUS_EMBEDDING_MODEL?.trim() &&
      process.env.NEBIUS_CHAT_MODEL?.trim() &&
      process.env.QDRANT_URL?.trim() &&
      process.env.QDRANT_API_KEY?.trim(),
  );
}

export function buildCanonicalBodyStateText(tonight: RemiTonightResult) {
  const bodyState = tonight.bodyState;

  return [
    buildField("Cycle phase", bodyState.cycle_phase ?? tonight.signals.estimated_cycle_phase),
    buildField("Cycle day", bodyState.cycle_day ?? tonight.signals.cycle_day),
    buildField("Affect state", bodyState.affect_state ?? "steady"),
    buildField("Stress 0-10", bodyState.stress_0_10 ?? tonight.signals.stress_score),
    buildField("Fatigue 0-5", bodyState.fatigue_0_5),
    buildField("Sleep issue 0-5", bodyState.sleep_issue_0_5),
    buildField("Restlessness score", bodyState.restlessness_score),
    buildField("Sleep debt hours", bodyState.sleep_debt_hours ?? tonight.signals.sleep_debt_hours),
    buildField("Sleep debt label", bodyState.sleep_debt_label),
    buildField("HRV relative", bodyState.hrv_relative_label),
    buildField("HRV delta from baseline", bodyState.hrv_delta_from_baseline),
    buildField("Resting HR relative", bodyState.resting_hr_relative_label),
    buildField("Resting HR delta from baseline", bodyState.resting_hr_delta_from_baseline),
    buildField("Skin temperature relative", bodyState.skin_temperature_relative_label),
    buildField("Skin temperature delta C", bodyState.skin_temperature_delta_c),
    buildField("Sleep risk score 0-100", bodyState.sleep_risk_score_0_100),
    buildField("Fitbit sleep score 0-100", bodyState.fitbit_sleep_score_0_100),
  ]
    .filter((value): value is string => Boolean(value))
    .join("\n");
}

function parseChatContent(content: unknown) {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const text = content
      .map((part) =>
        part && typeof part === "object" && "text" in part
          ? cleanText((part as { text?: unknown }).text)
          : undefined,
      )
      .filter((value): value is string => Boolean(value))
      .join("\n");

    return text.trim();
  }

  return "";
}

function extractJsonObject(text: string) {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return text;
  }

  return text.slice(start, end + 1);
}

export async function createNebiusEmbedding(input: string) {
  const model = readRequiredEnv("NEBIUS_EMBEDDING_MODEL");
  const client = getNebiusClient();

  const response = await withTimeout(
    client.embeddings.create({
      model,
      input,
      encoding_format: "float",
    }),
    15_000,
    "Nebius embedding request",
  );

  const embedding = response.data?.[0]?.embedding;

  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new IntegrationError(
      "INVALID_RESPONSE",
      "Nebius embedding response did not include a non-empty vector.",
    );
  }

  if (!embedding.every((value) => typeof value === "number" && Number.isFinite(value))) {
    throw new IntegrationError(
      "INVALID_RESPONSE",
      "Nebius embedding response contained non-numeric vector values.",
    );
  }

  return { model, vector: embedding };
}

export async function searchSimilarCases(vector: number[]) {
  const client = getQdrantClient();
  const collection = getQdrantCollectionName();

  const matches = await withTimeout(
    client.search(collection, {
      vector,
      limit: 5,
      with_payload: true,
      with_vector: false,
      timeout: 10,
    }),
    10_000,
    "Qdrant similarity query",
  );

  if (!Array.isArray(matches)) {
    throw new IntegrationError(
      "INVALID_RESPONSE",
      "Qdrant similarity query did not return an array.",
    );
  }

  if (matches.length === 0) {
    throw new IntegrationError(
      "COLLECTION_EMPTY",
      "Qdrant returned zero similarity matches for the test vector.",
    );
  }

  const summaries = matches.flatMap((match) => {
    const payload =
      match && typeof match.payload === "object" && match.payload !== null
        ? (match.payload as Record<string, unknown>)
        : null;

    const hapticMode = cleanText(payload?.haptic_mode);
    const recordId =
      cleanText(payload?.record_id) ??
      cleanText(payload?.record_key) ??
      cleanText(payload?.id);
    const score = typeof match.score === "number" ? match.score : undefined;

    if (
      !payload ||
      !recordId ||
      !hapticMode ||
      !ALLOWED_HAPTIC_MODES.includes(
        hapticMode as (typeof ALLOWED_HAPTIC_MODES)[number],
      ) ||
      typeof score !== "number" ||
      !Number.isFinite(score)
    ) {
      return [];
    }

    return [
      {
        frictionLevel: cleanText(payload.friction_level) ?? "Unknown",
        hapticMode: hapticMode as (typeof ALLOWED_HAPTIC_MODES)[number],
        rationale: cleanText(payload.recommendation_rationale),
        recordId,
        similarityScore: Number(score.toFixed(4)),
        sleepFrictionScore:
          typeof payload.sleep_friction_score === "number"
            ? payload.sleep_friction_score
            : undefined,
        targetRecommendationJson: cleanText(payload.target_recommendation_json),
      } satisfies SimilarCasePayloadSummary,
    ];
  });

  if (summaries.length === 0) {
    throw new IntegrationError(
      "INVALID_RESPONSE",
      "Qdrant matches did not contain valid REMi haptic payloads.",
    );
  }

  return summaries;
}

function buildMatchesPrompt(matches: SimilarCasePayloadSummary[]) {
  return matches
    .map((match, index) => {
      const lines = [
        `Case ${index + 1}`,
        `record_id: ${match.recordId}`,
        `haptic_mode: ${match.hapticMode}`,
        `similarity_score: ${match.similarityScore}`,
        `friction_level: ${match.frictionLevel}`,
      ];

      if (typeof match.sleepFrictionScore === "number") {
        lines.push(`sleep_friction_score: ${match.sleepFrictionScore}`);
      }

      if (match.rationale) {
        lines.push(`recommendation_rationale: ${match.rationale}`);
      }

      if (match.targetRecommendationJson) {
        lines.push(
          `target_recommendation_json: ${match.targetRecommendationJson}`,
        );
      }

      return lines.join("\n");
    })
    .join("\n\n");
}

export async function requestWaveRecommendation(
  tonightText: string,
  matches: SimilarCasePayloadSummary[],
) {
  const model = readRequiredEnv("NEBIUS_CHAT_MODEL");
  const client = getNebiusClient();

  const response = await withTimeout(
    client.chat.completions.create({
      model,
      temperature: 0.1,
      max_completion_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "You are REMi. Return strict JSON only. Use only the allowed haptic modes Calm Drift, Soft Wave, or Deep Downshift.",
        },
        {
          role: "user",
          content: [
            "Current REMi body-state profile:",
            tonightText,
            "",
            "Retrieved similar synthetic cases:",
            buildMatchesPrompt(matches),
            "",
            "Return exactly one JSON object with keys:",
            "sleep_friction_score, friction_level, haptic_mode, breath_rhythm_per_min, haptic_pulse_per_min, haptic_duration_min, haptic_intensity, drivers, spot_message, moon_body_summary, confidence, matched_case_count, similarity_summary, recommendation_basis",
          ].join("\n"),
        },
      ],
    }),
    25_000,
    "Nebius chat recommendation request",
  );

  const content = parseChatContent(response.choices?.[0]?.message?.content);

  if (!content) {
    throw new IntegrationError(
      "INVALID_RESPONSE",
      "Nebius chat response did not include message content.",
    );
  }

  let parsed: RecommendationPayload;

  try {
    parsed = recommendationSchema.parse(JSON.parse(extractJsonObject(content)));
  } catch (error) {
    throw new IntegrationError(
      "INVALID_RESPONSE",
      `Nebius chat response was not valid strict JSON: ${normalizeIntegrationError(error).message}`,
    );
  }

  return {
    ...parsed,
    matched_case_count: matches.length,
    recommendation_basis: "similar synthetic cases" as const,
  };
}

export async function runLiveRecommendationPipeline(tonight: RemiTonightResult) {
  if (!hasLiveRecommendationConfig()) {
    throw new IntegrationError(
      "MISSING_CONFIGURATION",
      "Live Nebius and Qdrant recommendation configuration is incomplete.",
    );
  }

  const embeddingText = buildCanonicalBodyStateText(tonight);

  if (!embeddingText) {
    throw new IntegrationError(
      "INVALID_RESPONSE",
      "Canonical REMi body-state text was empty.",
    );
  }

  const embedding = await createNebiusEmbedding(embeddingText);
  const similarCases = await searchSimilarCases(embedding.vector);
  const recommendation = await requestWaveRecommendation(
    embeddingText,
    similarCases,
  );

  return {
    embeddingModel: embedding.model,
    embeddingText,
    matches: similarCases.map((match) => ({
      hapticMode: match.hapticMode,
      recordId: match.recordId,
      similarityScore: match.similarityScore,
    })),
    recommendation,
  };
}

