import type { SpotIntent, SpotTonightContext } from "@/lib/spot/types";

const LOCAL_PLAN_PATTERN =
  /\b(why this plan|why soft wave|what did remi recommend|what.*recommend tonight|why is my friction score high|what are my risk drivers|risk drivers|sleep friction score|friction score|what haptic did remi select|what haptic.*selected|which haptic|haptic|soft wave|gentle drift|deep reset|breathing session|duration|tonight'?s plan)\b/;
const LOCAL_SIGNAL_PATTERN =
  /\b(signal|signals|hrv|heart rate variability|resting heart rate|resting hr|stress score|stress|cycle phase|phase am i in|cycle day|lh|luteinizing hormone|fsh|follicle stimulating hormone|e3g|estrone|estrone 3 glucuronide|estrogen|pdg|pregnanediol glucuronide|progesterone|sleep efficiency|sleep score|sleep minutes|temperature|skin temperature)\b/;
const HYBRID_PATTERN =
  /\b(why am i|why might i|could my|could hormones|could my cycle|affect fatigue|affect sleep|sleeping poorly|sleep poorly|exhausted|fatigue|feel tonight)\b/;
const RESEARCH_PATTERN =
  /\b(what is|what does|research say|associated with|association|how can|how does|meaning of|measure|measurements?)\b/;
const SAFETY_PATTERN =
  /\b(diagnos|disorder|abnormal|medication|change my medication|heavy bleeding|feel faint|emergency|urgent|severe pain|should i change|medical emergency|hormone disorder|safe|safely|safety)\b/;
const REMI_SCOPE_PATTERN =
  /\b(remi|sleep|hrv|heart|stress|cycle|luteal|follicular|hormone|lh|fsh|e3g|pdg|fatigue|cramps|bloating|haptic|plan|friction|wellness)\b/;
const PERSONALIZED_PATTERN =
  /\b(my|me|tonight|this phase|this plan|current|selected|chosen|risk drivers|recommend(?:ed)?)\b/;

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bhrv\b/gi, "heart rate variability"],
  [/\blh\b/gi, "luteinizing hormone"],
  [/\bfsh\b/gi, "follicle stimulating hormone"],
  [/\be3g\b/gi, "estrone 3 glucuronide"],
  [/\bpdg\b/gi, "pregnanediol glucuronide"],
];

export function normalizeSpotQuestion(question: string) {
  let normalized = question.trim().toLowerCase();

  for (const [pattern, replacement] of REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function classifySpotQuestion(
  question: string,
  context?: SpotTonightContext,
): SpotIntent {
  const normalized = normalizeSpotQuestion(question);

  if (!normalized) {
    return "unsupported";
  }

  if (SAFETY_PATTERN.test(normalized)) {
    return "safety";
  }

  if (LOCAL_PLAN_PATTERN.test(normalized)) {
    return "local";
  }

  if (LOCAL_SIGNAL_PATTERN.test(normalized) && PERSONALIZED_PATTERN.test(normalized)) {
    return "local";
  }

  if (
    LOCAL_SIGNAL_PATTERN.test(normalized) &&
    /\b(what is|what s|show|tell me|explain)\b/.test(normalized) &&
    context?.hasPlan
  ) {
    return "local";
  }

  if (HYBRID_PATTERN.test(normalized)) {
    return "hybrid";
  }

  if (RESEARCH_PATTERN.test(normalized) && REMI_SCOPE_PATTERN.test(normalized)) {
    return "research";
  }

  if (LOCAL_SIGNAL_PATTERN.test(normalized) || REMI_SCOPE_PATTERN.test(normalized)) {
    return context?.hasPlan ? "local" : "research";
  }

  return "unsupported";
}
