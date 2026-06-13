import { type TavilySearchResponse } from "@tavily/core";

import { normalizeSpotQuestion } from "@/lib/spot/classify-question";
import { getTavilyClient } from "@/lib/server/tavily";
import {
  EXCLUDED_DOMAINS,
  TRUSTED_RESEARCH_DOMAINS,
} from "@/lib/spot/research-policy";
import { filterResearchResults } from "@/lib/spot/filter-research-results";
import type { SpotResearchSource } from "@/lib/spot/types";

const CACHE_TTL_MS = 10 * 60 * 1000;

interface CachedResearchResult {
  answer?: string;
  sources: SpotResearchSource[];
}

class SpotResearchError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

function getStatusCode(error: unknown) {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const candidate = error as {
    status?: unknown;
    statusCode?: unknown;
    response?: { status?: unknown };
  };

  if (typeof candidate.status === "number") {
    return candidate.status;
  }

  if (typeof candidate.statusCode === "number") {
    return candidate.statusCode;
  }

  if (typeof candidate.response?.status === "number") {
    return candidate.response.status;
  }

  return undefined;
}

const researchCache = new Map<string, { expiresAt: number; value: CachedResearchResult }>();
const pendingSearches = new Map<string, Promise<CachedResearchResult>>();

const QUERY_STOP_WORDS = new Set([
  "a",
  "about",
  "and",
  "are",
  "can",
  "could",
  "does",
  "how",
  "in",
  "is",
  "it",
  "my",
  "of",
  "research",
  "say",
  "the",
  "this",
  "to",
  "tonight",
  "what",
  "why",
]);

function buildFallbackQuery(question: string) {
  const normalized = normalizeSpotQuestion(question);
  const keywords = normalized
    .split(" ")
    .filter(
      (term) => term && term.length > 2 && !QUERY_STOP_WORDS.has(term),
    );

  const compactTerms = new Set(keywords);

  if (
    normalized.includes("progesterone") ||
    normalized.includes("estrogen") ||
    normalized.includes("lh") ||
    normalized.includes("fsh") ||
    normalized.includes("pdg") ||
    normalized.includes("e3g")
  ) {
    compactTerms.add("menstrual");
    compactTerms.add("cycle");
    compactTerms.add("women");
  }

  compactTerms.add("review");

  return [...compactTerms].join(" ");
}

async function executeTavilySearch(query: string) {
  return getTavilyClient().search(query, {
    topic: "general",
    searchDepth: process.env.NODE_ENV === "production" ? "advanced" : "basic",
    maxResults: 6,
    chunksPerSource: 2,
    includeAnswer: "basic",
    includeRawContent: false,
    includeImages: false,
    includeDomains: [...TRUSTED_RESEARCH_DOMAINS],
    excludeDomains: [...EXCLUDED_DOMAINS],
    autoParameters: false,
    timeout: 12_000,
  });
}

async function runSearch(query: string, question: string): Promise<CachedResearchResult> {
  let response: TavilySearchResponse;

  try {
    response = await executeTavilySearch(query);
  } catch (error) {
    if (
      error instanceof Error &&
      /TAVILY_API_KEY|configured/i.test(error.message)
    ) {
      throw new SpotResearchError(
        "Trusted research is not configured on the server.",
        500,
      );
    }

    const statusCode = getStatusCode(error);
    const message =
      error instanceof Error ? error.message : "Trusted research failed.";

    if (statusCode === 401 || /unauthori[sz]ed|invalid api key/i.test(message)) {
      throw new SpotResearchError(
        "Trusted research authentication failed.",
        401,
      );
    }

    if (statusCode === 429 || /rate limit|too many requests/i.test(message)) {
      throw new SpotResearchError(
        "Trusted research is rate limited right now.",
        429,
      );
    }

    if (statusCode === 400 || /bad request|invalid request/i.test(message)) {
      throw new SpotResearchError(
        "Trusted research rejected the request format.",
        400,
      );
    }

    if (/timeout|timed out|aborted/i.test(message)) {
      throw new SpotResearchError(
        "Trusted research timed out.",
        504,
      );
    }

    throw new SpotResearchError(
      "Trusted research is temporarily unavailable.",
      503,
    );
  }

  if (!response || !Array.isArray(response.results)) {
    throw new SpotResearchError(
      "Trusted research returned an invalid response.",
      503,
    );
  }

  let sources = filterResearchResults(question, response.results);

  if (sources.length === 0) {
    const fallbackQuery = buildFallbackQuery(question);

    if (fallbackQuery && fallbackQuery !== query) {
      const fallbackResponse = await executeTavilySearch(fallbackQuery);

      if (fallbackResponse && Array.isArray(fallbackResponse.results)) {
        sources = filterResearchResults(question, fallbackResponse.results);
        response = fallbackResponse;
      }
    }
  }

  if (sources.length === 0) {
    throw new SpotResearchError(
      "Trusted research did not return usable sources.",
      200,
    );
  }

  return {
    answer:
      typeof response.answer === "string" && response.answer.trim()
        ? response.answer.trim()
        : undefined,
    sources,
  };
}

export async function searchResearch(query: string, question: string) {
  const cached = researchCache.get(query);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const pending = pendingSearches.get(query);
  if (pending) {
    return pending;
  }

  const searchPromise = runSearch(query, question)
    .then((value) => {
      researchCache.set(query, {
        expiresAt: Date.now() + CACHE_TTL_MS,
        value,
      });
      return value;
    })
    .finally(() => {
      pendingSearches.delete(query);
    });

  pendingSearches.set(query, searchPromise);
  return searchPromise;
}

export function isSpotResearchError(error: unknown): error is SpotResearchError {
  return error instanceof SpotResearchError;
}
