import "server-only";

import type { CheckInData } from "@/lib/checkIn";
import { triggerBedtimeActions } from "@/lib/composio";
import { generateVoiceNote } from "@/lib/elevenlabs";
import { generateSleepPlan } from "@/lib/nebius";
import { buildRemiTonightResult } from "@/lib/build-remi-tonight-result";
import type { DeterministicDemoSelection } from "@/lib/remi-data.server";
import { retrieveEvidence } from "@/lib/tavily";
import type { REMiAgentResult } from "@/lib/types";

import { normalizeIntegrationError } from "./integration-errors";
import {
  hasLiveRecommendationConfig,
  runLiveRecommendationPipeline,
} from "./live-recommendation";

export async function createAgentResult(
  selection: DeterministicDemoSelection,
  checkIn?: CheckInData | null,
): Promise<REMiAgentResult> {
  const tonight = buildRemiTonightResult(selection, checkIn);
  const plan = generateSleepPlan(tonight.riskProfile, tonight.signals);
  const evidence = retrieveEvidence(tonight.riskProfile, tonight.signals);
  const actions = triggerBedtimeActions(plan);
  const voiceNote = generateVoiceNote(plan, tonight.riskProfile);

  let disclosure = "Local deterministic fallback";
  let recommendationBasis = "deterministic fallback";
  let recommendation: REMiAgentResult["recommendation"];
  let matches: REMiAgentResult["matches"] = [];
  const completedSteps = [
    "User Signals",
    "Data Pipeline",
    "Risk Engine",
    "Deterministic Plan Generation",
  ];

  if (hasLiveRecommendationConfig()) {
    try {
      const live = await runLiveRecommendationPipeline(tonight);
      recommendation = live.recommendation;
      matches = live.matches;
      recommendationBasis = live.recommendation.recommendation_basis;
      disclosure = "live Nebius + live Qdrant";
      completedSteps.push(
        "Nebius Embedding",
        "Qdrant Similarity Search",
        "Nebius Recommendation Generation",
      );
    } catch (error) {
      const normalized = normalizeIntegrationError(error);
      disclosure = `local deterministic fallback (${normalized.code})`;
      completedSteps.push(`Live recommendation fallback: ${normalized.code}`);
      console.warn(
        `[RunAgent] liveRecommendation status=fallback code=${normalized.code} message=${normalized.message}`,
      );
    }
  } else {
    completedSteps.push("Live recommendation fallback: MISSING_CONFIGURATION");
  }

  completedSteps.push(
    "Local Evidence",
    "Composio Actions",
    "ElevenLabs Voice Note",
    "Tonight Plan Output",
  );

  return {
    bodyState: tonight.bodyState,
    demoRecord: tonight.demoRecord,
    signals: tonight.signals,
    riskProfile: tonight.riskProfile,
    plan,
    recommendation,
    recommendationBasis,
    disclosure,
    matches,
    evidence,
    actions,
    voiceNote,
    completedSteps,
  };
}
