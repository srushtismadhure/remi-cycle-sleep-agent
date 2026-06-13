import type { SpotResearchSource, SpotResponse } from "@/lib/spot/types";

export type SpotSide = "left" | "right";
export type SpotMessageRole = "assistant" | "user";

export interface SpotMessage {
  id: string;
  role: SpotMessageRole;
  text: string;
  disclosure?: string;
  localSignals?: string[];
  sources?: SpotResearchSource[];
  sourceType?: SpotResponse["sourceType"] | "loading";
}

export const SPOT_GREETING =
  "Hi, I’m Spot. I can help explain tonight’s plan.";

export const SPOT_LOADING_LOCAL = "Spot is checking tonight’s data…";
export const SPOT_LOADING_RESEARCH = "Spot is checking trusted research…";

export const SPOT_QUICK_PROMPTS = [
  "Why this plan?",
  "Explain my signals",
  "Why Soft Wave?",
  "How do I use this safely?",
] as const;
