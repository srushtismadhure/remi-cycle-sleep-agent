import type { SpotResearchSource } from "@/lib/spot/types";

export const TRUSTED_RESEARCH_DOMAINS = [
  "pubmed.ncbi.nlm.nih.gov",
  "pmc.ncbi.nlm.nih.gov",
  "ncbi.nlm.nih.gov",
  "nih.gov",
  "acog.org",
  "asrm.org",
  "endocrine.org",
  "womenshealth.gov",
  "cdc.gov",
  "who.int",
  "jamanetwork.com",
  "bmj.com",
  "nature.com",
  "academic.oup.com",
] as const;

export const EXCLUDED_DOMAINS = [
  "reddit.com",
  "quora.com",
  "medium.com",
  "youtube.com",
  "tiktok.com",
  "instagram.com",
  "facebook.com",
  "pinterest.com",
  "amazon.com",
  "healthline.com",
  "webmd.com",
  "verywellhealth.com",
] as const;

export const NON_HUMAN_TERMS = [
  "mouse",
  "mice",
  "murine",
  "rat model",
  "animal model",
  "bovine",
  "in vitro",
  "cell line",
] as const;

const PROMOTIONAL_TERMS = [
  "shop",
  "coupon",
  "buy now",
  "supplement",
  "fertility clinic",
  "sponsored",
  "promotion",
  "advertorial",
  "symptom checker",
  "product review",
] as const;

const EVIDENCE_PATTERNS: Array<{
  evidenceType: NonNullable<SpotResearchSource["evidenceType"]>;
  pattern: RegExp;
}> = [
  { evidenceType: "meta-analysis", pattern: /\bmeta[- ]analysis\b/i },
  { evidenceType: "systematic-review", pattern: /\bsystematic review\b/i },
  { evidenceType: "guideline", pattern: /\b(guideline|practice bulletin|committee opinion|clinical guidance|recommendation)\b/i },
  { evidenceType: "review", pattern: /\breview\b/i },
  { evidenceType: "observational-study", pattern: /\b(cohort|observational|cross-sectional|longitudinal)\b/i },
  { evidenceType: "clinical-study", pattern: /\b(trial|clinical study|randomized|pilot study)\b/i },
];

export function getDomainFromUrl(value: string) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isTrustedResearchDomain(hostname: string) {
  return TRUSTED_RESEARCH_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
}

export function isExcludedDomain(hostname: string) {
  return EXCLUDED_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
}

export function containsNonHumanTerms(text: string) {
  const normalized = text.toLowerCase();
  return NON_HUMAN_TERMS.some((term) => normalized.includes(term));
}

export function looksPromotional(text: string) {
  const normalized = text.toLowerCase();
  return PROMOTIONAL_TERMS.some((term) => normalized.includes(term));
}

export function detectEvidenceType(text: string): SpotResearchSource["evidenceType"] {
  const match = EVIDENCE_PATTERNS.find(({ pattern }) => pattern.test(text));
  return match?.evidenceType ?? "unknown";
}
