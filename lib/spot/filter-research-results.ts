import { normalizeSpotQuestion } from "@/lib/spot/classify-question";
import {
  containsNonHumanTerms,
  detectEvidenceType,
  getDomainFromUrl,
  isExcludedDomain,
  isTrustedResearchDomain,
  looksPromotional,
} from "@/lib/spot/research-policy";
import type { SpotResearchSource } from "@/lib/spot/types";

interface RawResearchResult {
  content?: string;
  score?: number;
  title?: string;
  url?: string;
}

const STOP_WORDS = new Set([
  "a",
  "about",
  "am",
  "and",
  "are",
  "can",
  "could",
  "do",
  "does",
  "how",
  "i",
  "in",
  "is",
  "it",
  "might",
  "my",
  "of",
  "say",
  "sleep",
  "the",
  "this",
  "to",
  "tonight",
  "what",
  "why",
]);

const EXTRA_KEYWORDS: Record<string, string[]> = {
  e3g: ["estrone", "glucuronide", "estrogen"],
  fsh: ["follicle", "stimulating", "hormone"],
  hrv: ["heart", "rate", "variability"],
  lh: ["luteinizing", "hormone"],
  pdg: ["pregnanediol", "glucuronide", "progesterone"],
};

function canonicalizeUrl(value: string) {
  const parsed = new URL(value);
  parsed.hash = "";
  parsed.search = "";
  return parsed.toString().replace(/\/$/, "");
}

function truncateSnippet(snippet: string, limit = 220) {
  const normalized = snippet.replace(/\s+/g, " ").trim();

  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit - 1).trimEnd()}…`;
}

function extractKeywords(question: string) {
  const keywords = new Set<string>();

  for (const term of normalizeSpotQuestion(question).split(" ")) {
    if (!term || STOP_WORDS.has(term) || term.length < 3) {
      continue;
    }

    keywords.add(term);

    for (const extra of EXTRA_KEYWORDS[term] ?? []) {
      keywords.add(extra);
    }
  }

  return [...keywords];
}

function keywordHits(text: string, keywords: string[]) {
  const normalized = text.toLowerCase();
  return keywords.filter((keyword) => normalized.includes(keyword)).length;
}

function evidenceRank(evidenceType: SpotResearchSource["evidenceType"]) {
  switch (evidenceType) {
    case "systematic-review":
      return 0;
    case "meta-analysis":
      return 1;
    case "guideline":
      return 2;
    case "review":
      return 3;
    case "observational-study":
      return 4;
    case "clinical-study":
      return 5;
    default:
      return 6;
  }
}

export function filterResearchResults(
  question: string,
  results: RawResearchResult[],
): SpotResearchSource[] {
  const keywords = extractKeywords(question);
  const dedupe = new Set<string>();
  const filtered: SpotResearchSource[] = [];

  for (const result of results) {
    if (!result.url || !result.title || !result.content) {
      continue;
    }

    const domain = getDomainFromUrl(result.url);
    if (!domain || !isTrustedResearchDomain(domain) || isExcludedDomain(domain)) {
      continue;
    }

    let canonicalUrl: string;
    try {
      canonicalUrl = canonicalizeUrl(result.url);
    } catch {
      continue;
    }

    if (dedupe.has(canonicalUrl)) {
      continue;
    }

    const combinedText = `${result.title} ${result.content}`;
    if (containsNonHumanTerms(combinedText) || looksPromotional(combinedText)) {
      continue;
    }

    if (keywords.length > 0 && keywordHits(combinedText, keywords) === 0) {
      continue;
    }

    dedupe.add(canonicalUrl);
    filtered.push({
      title: result.title.trim(),
      url: canonicalUrl,
      domain,
      snippet: truncateSnippet(result.content),
      score: typeof result.score === "number" ? result.score : undefined,
      evidenceType: detectEvidenceType(combinedText),
    });
  }

  return filtered
    .sort((left, right) => {
      const evidenceDelta =
        evidenceRank(left.evidenceType) - evidenceRank(right.evidenceType);

      if (evidenceDelta !== 0) {
        return evidenceDelta;
      }

      return (right.score ?? 0) - (left.score ?? 0);
    })
    .slice(0, 3);
}
