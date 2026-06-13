import { normalizeSpotQuestion } from "@/lib/spot/classify-question";
import type { SpotIntent, SpotTonightContext } from "@/lib/spot/types";

function labelPhase(phase: string) {
  return phase.replace(/_/g, " ");
}

function getHybridDescriptors(context?: SpotTonightContext) {
  if (!context) {
    return [];
  }

  const descriptors: string[] = [];

  if (context.cyclePhase) {
    descriptors.push(`current ${labelPhase(context.cyclePhase)} phase`);
  }

  if (typeof context.fatigue === "number" && context.fatigue >= 3) {
    descriptors.push("reported fatigue");
  }

  if (typeof context.sleepIssue === "number" && context.sleepIssue >= 3) {
    descriptors.push("reported sleep difficulty");
  }

  if (typeof context.stress === "number" && context.stress >= 7) {
    descriptors.push("elevated stress");
  }

  if (
    typeof context.hrvRmssdMs === "number" &&
    typeof context.baselineHrvRmssdMs === "number" &&
    context.hrvRmssdMs < context.baselineHrvRmssdMs * 0.9
  ) {
    descriptors.push("lower overnight HRV");
  }

  if (typeof context.sleepEfficiencyPercent === "number" && context.sleepEfficiencyPercent < 88) {
    descriptors.push("reduced sleep quality");
  }

  if (typeof context.skinTemperatureDeltaC === "number" && context.skinTemperatureDeltaC > 0.3) {
    descriptors.push("slightly elevated temperature relative to baseline");
  }

  return descriptors;
}

function expandQuestion(question: string) {
  return normalizeSpotQuestion(question)
    .replace(/\bheart rate variability\b/g, "heart rate variability (HRV)")
    .replace(/\bluteinizing hormone\b/g, "luteinizing hormone (LH)")
    .replace(
      /\bfollicle stimulating hormone\b/g,
      "follicle-stimulating hormone (FSH)",
    )
    .replace(
      /\bestrone 3 glucuronide\b/g,
      "estrone-3-glucuronide (E3G), an estrogen metabolite",
    )
    .replace(
      /\bpregnanediol glucuronide\b/g,
      "pregnanediol glucuronide (PdG), a progesterone metabolite",
    );
}

export function buildResearchQuery(
  question: string,
  intent: Extract<SpotIntent, "hybrid" | "research">,
  context?: SpotTonightContext,
) {
  const expandedQuestion = expandQuestion(question);

  if (intent === "research") {
    return [
      `Question: ${expandedQuestion}.`,
      "Prioritize systematic reviews, meta-analyses, professional guidance, clinical reviews, and peer-reviewed human studies related to menstrual physiology, sleep, fatigue, stress, HRV, and hormones.",
      "Exclude animal-only, in-vitro, supplement-marketing, and promotional fertility-clinic content.",
    ].join(" ");
  }

  const descriptors = getHybridDescriptors(context);
  const contextSentence =
    descriptors.length > 0
      ? `Context: ${descriptors.join(", ")}.`
      : "Context: current menstrual-cycle and sleep-recovery signals.";

  return [
    `Question: ${expandedQuestion}.`,
    contextSentence,
    "Human clinical research on this question, prioritizing systematic reviews, meta-analyses, professional guidance, clinical reviews, and peer-reviewed human observational studies.",
    "Exclude animal-only, in-vitro, supplement-marketing, and promotional fertility-clinic content.",
  ].join(" ");
}
