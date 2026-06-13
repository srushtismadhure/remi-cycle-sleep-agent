import { normalizeSpotQuestion } from "@/lib/spot/classify-question";
import type { SpotResearchSource, SpotTonightContext } from "@/lib/spot/types";

function unique(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}

function cleanResearchText(text?: string) {
  if (!text) {
    return null;
  }

  const normalized = text
    .replace(/\s+/g, " ")
    .replace(/\bcaused by\b/gi, "may be related to")
    .replace(/\bcauses?\b/gi, "may be associated with")
    .replace(/\bproves?\b/gi, "does not by itself prove")
    .replace(/\bdefinitely\b/gi, "not definitively")
    .trim();

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return sentences.join(" ");
}

function fallbackResearchText(question: string) {
  const normalized = normalizeSpotQuestion(question);

  if (/\bfollicle stimulating hormone\b/.test(normalized)) {
    return "FSH supports ovarian follicle development and changes across the menstrual cycle.";
  }

  if (/\bluteinizing hormone\b/.test(normalized)) {
    return "LH helps coordinate ovulation and other cycle-timing changes.";
  }

  if (/\bestrone 3 glucuronide|estrogen\b/.test(normalized)) {
    return "E3G is a urine-based estrogen metabolite used as a cycle-context signal rather than a diagnosis.";
  }

  if (/\bpregnanediol glucuronide|progesterone\b/.test(normalized)) {
    return "PdG is a urine-based progesterone metabolite that can help describe cycle context.";
  }

  if (/\bhrv\b/.test(normalized)) {
    return "Research has observed that HRV may vary across menstrual-cycle phases, although the pattern differs between individuals and study methods.";
  }

  return "Research has observed associations between menstrual-cycle context, recovery signals, stress, fatigue, and sleep, but the pattern differs substantially across individuals.";
}

export function summarizeRelevantLocalSignals(
  question: string,
  context?: SpotTonightContext,
) {
  if (!context?.hasPlan) {
    return [];
  }

  const normalized = normalizeSpotQuestion(question);
  const summary: string[] = [];

  if (context.cyclePhase) {
    summary.push(
      `${context.cyclePhase.replace(/_/g, " ")} phase${
        typeof context.cycleDay === "number" ? `, day ${context.cycleDay}` : ""
      }`,
    );
  }

  if (/\bfatigue|tired|exhausted\b/.test(normalized) && typeof context.fatigue === "number") {
    summary.push(`fatigue ${context.fatigue}/5`);
  }

  if (/\bsleep|sleeping poorly|sleep poorly\b/.test(normalized)) {
    if (typeof context.sleepIssue === "number") {
      summary.push(`sleep issue ${context.sleepIssue}/5`);
    }
    if (typeof context.sleepDebtHours === "number") {
      summary.push(`sleep debt ${context.sleepDebtHours.toFixed(1)} hours`);
    }
  }

  if (/\bstress|anxious|restless\b/.test(normalized) && typeof context.stress === "number") {
    summary.push(`stress ${context.stress}/10`);
  }

  if (typeof context.hrvRmssdMs === "number") {
    summary.push(`HRV ${context.hrvRmssdMs.toFixed(1)} ms`);
  }

  if (typeof context.restingHeartRateBpm === "number" && /\bheart|sleep\b/.test(normalized)) {
    summary.push(`resting HR ${context.restingHeartRateBpm.toFixed(1)} bpm`);
  }

  if (typeof context.skinTemperatureDeltaC === "number" && context.skinTemperatureDeltaC > 0.3) {
    summary.push("temperature above baseline");
  }

  return unique(summary).slice(0, 4);
}

export function buildHybridAnswer(params: {
  context: SpotTonightContext;
  localSignals: string[];
  question: string;
  researchAnswer?: string;
  sources: SpotResearchSource[];
}) {
  const localSummary =
    params.localSignals.length > 0
      ? `Based on tonight’s synthetic data, relevant signals include ${params.localSignals.join(", ")}.`
      : "Based on tonight’s synthetic data, REMi sees a mix of cycle, recovery, and sleep signals that could be contributing tonight.";

  const researchSummary =
    cleanResearchText(params.researchAnswer) ?? fallbackResearchText(params.question);

  return [
    localSummary,
    `What research suggests: ${researchSummary}`,
    "What this could mean: one possible contributor is the combination of cycle context, recovery signals, and sleep load, but the available signals cannot identify a single cause.",
    "Research-supported context · Not a diagnosis",
  ].join(" ");
}

export function buildResearchAnswer(params: {
  context?: SpotTonightContext | null;
  question: string;
  researchAnswer?: string;
  sources: SpotResearchSource[];
}) {
  const normalized = normalizeSpotQuestion(params.question);
  const researchSummary =
    cleanResearchText(params.researchAnswer) ?? fallbackResearchText(params.question);

  if (/\bfollicle stimulating hormone\b/.test(normalized)) {
    const noMeasurementText =
      "No FSH measurement is available in tonight’s data, so this is general research context rather than a personalized interpretation.";
    return `${researchSummary} ${noMeasurementText} Research-supported context · Not a diagnosis`;
  }

  if (
    /\b(luteinizing hormone|estrone 3 glucuronide|pregnanediol glucuronide)\b/.test(
      normalized,
    ) &&
    !params.context?.hasPlan
  ) {
    return `${researchSummary} This is general research context rather than a personalized interpretation. Research-supported context · Not a diagnosis`;
  }

  return `${researchSummary} Research-supported context · Not a diagnosis`;
}

export function buildSafetyAnswer() {
  return "Spot can offer general wellness context, but it cannot diagnose conditions, judge hormone abnormality, recommend medication changes, or triage an emergency. If symptoms are severe, sudden, or concerning, contact a qualified clinician or emergency services.";
}

export function buildUnsupportedAnswer() {
  return "Spot can help with tonight’s REMi plan, cycle and recovery signals, haptic guidance, or general research context related to sleep, stress, fatigue, and hormones.";
}
