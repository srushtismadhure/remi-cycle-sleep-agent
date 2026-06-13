import type { REMiRiskLevel } from "@/lib/types";

export type SpotIntent =
  | "local"
  | "hybrid"
  | "research"
  | "safety"
  | "unsupported";

export interface SpotTonightContext {
  hasPlan: boolean;
  recordKey?: string;
  syntheticDate?: string;
  cyclePhase?: string;
  cycleDay?: number;
  lh?: number;
  fsh?: number;
  estrogenE3g?: number;
  progesteronePdg?: number;
  fatigue?: number;
  sleepIssue?: number;
  stress?: number;
  cramps?: number;
  headaches?: number;
  moodSwing?: number;
  bloating?: number;
  hrvRmssdMs?: number;
  baselineHrvRmssdMs?: number;
  restingHeartRateBpm?: number;
  baselineRestingHeartRateBpm?: number;
  skinTemperatureDeltaC?: number;
  sleepScore?: number;
  sleepEfficiencyPercent?: number;
  sleepMinutes?: number;
  sleepDebtHours?: number;
  sleepRiskScore?: number;
  sleepFrictionScore?: number;
  riskLevel?: REMiRiskLevel;
  riskDrivers?: string[];
  selectedHaptic?: string;
  hapticDurationMinutes?: number;
  breathRatePerMinute?: number;
  hapticPulsePerMinute?: number;
  hapticIntensity?: string;
  recommendedProtocol?: string[];
  recommendationText?: string;
  planSummary?: string;
  safetyNote?: string;
}

export interface SpotRequest {
  question: string;
  demoRecordKey?: string;
}

export interface SpotResearchSource {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  score?: number;
  evidenceType?:
    | "systematic-review"
    | "meta-analysis"
    | "guideline"
    | "review"
    | "observational-study"
    | "clinical-study"
    | "unknown";
}

export interface SpotResponse {
  status: "success" | "unavailable" | "error";
  intent: SpotIntent;
  sourceType:
    | "local"
    | "tavily"
    | "local+tavily"
    | "safety"
    | "none";
  answer: string;
  localSignals: string[];
  sources: SpotResearchSource[];
  disclosure?: string;
}
