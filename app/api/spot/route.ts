import { NextResponse } from "next/server";

import { answerLocalQuestion } from "@/lib/spot/answer-local-question";
import {
  buildHybridAnswer,
  buildResearchAnswer,
  buildSafetyAnswer,
  buildUnsupportedAnswer,
  summarizeRelevantLocalSignals,
} from "@/lib/spot/build-answer";
import { buildResearchQuery } from "@/lib/spot/build-research-query";
import {
  classifySpotQuestion,
  normalizeSpotQuestion,
} from "@/lib/spot/classify-question";
import { loadSpotTonightContext } from "@/lib/spot/load-tonight-context";
import {
  isSpotResearchError,
  searchResearch,
} from "@/lib/spot/search-research";
import type { SpotRequest, SpotResponse } from "@/lib/spot/types";

export const runtime = "nodejs";

const THROTTLE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const requestLog = new Map<string, number[]>();

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "local";
}

function isThrottled(clientKey: string) {
  const now = Date.now();
  const recent = (requestLog.get(clientKey) ?? []).filter(
    (timestamp) => now - timestamp < THROTTLE_WINDOW_MS,
  );

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(clientKey, recent);
    return true;
  }

  recent.push(now);
  requestLog.set(clientKey, recent);
  return false;
}

function jsonResponse(response: SpotResponse, status = 200) {
  return NextResponse.json(response, { status });
}

function buildPrePlanAnswer(question: string): SpotResponse {
  const normalized = normalizeSpotQuestion(question);

  if (/\b(safe|safely|medical)\b/.test(normalized)) {
    return {
      status: "success",
      intent: "local",
      sourceType: "none",
      answer: buildSafetyAnswer(),
      localSignals: [],
      sources: [],
      disclosure: "Wellness guidance only",
    };
  }

  return {
    status: "success",
    intent: "local",
    sourceType: "none",
    answer:
      "Run Tonight's Protocol first and I can explain the synthetic cycle, recovery, sleep, and haptic signals behind the current demo plan.",
    localSignals: [],
    sources: [],
    disclosure: "General REMi guidance before a plan is loaded",
  };
}

export async function POST(request: Request) {
  if (isThrottled(getClientKey(request))) {
    return jsonResponse(
      {
        status: "error",
        intent: "unsupported",
        sourceType: "none",
        answer: "Spot is getting too many requests right now. Please try again in a moment.",
        localSignals: [],
        sources: [],
      },
      429,
    );
  }

  let requestBody: SpotRequest;

  try {
    requestBody = (await request.json()) as SpotRequest;
  } catch {
    return jsonResponse(
      {
        status: "error",
        intent: "unsupported",
        sourceType: "none",
        answer: "Spot could not read that request. Please try again.",
        localSignals: [],
        sources: [],
      },
      400,
    );
  }

  const question =
    typeof requestBody.question === "string" ? requestBody.question.trim() : "";

  if (!question) {
    return jsonResponse(
      {
        status: "error",
        intent: "unsupported",
        sourceType: "none",
        answer: "Please enter a question for Spot.",
        localSignals: [],
        sources: [],
      },
      400,
    );
  }

  const demoRecordKey =
    typeof requestBody.demoRecordKey === "string" &&
    requestBody.demoRecordKey.trim()
      ? requestBody.demoRecordKey.trim()
      : undefined;

  try {
    const context = await loadSpotTonightContext(demoRecordKey);

    if (demoRecordKey && !context) {
      return jsonResponse(
        {
          status: "error",
          intent: "unsupported",
          sourceType: "none",
          answer: "Spot could not load the current demo record.",
          localSignals: [],
          sources: [],
        },
        400,
      );
    }

    const intent = classifySpotQuestion(question, context ?? { hasPlan: false });

    if (intent === "local") {
      console.info("[Spot] intent=local tavilyCalled=false");

      if (!context) {
        return jsonResponse(buildPrePlanAnswer(question));
      }

      const local = answerLocalQuestion(question, context);
      return jsonResponse({
        status: "success",
        intent,
        sourceType: "local",
        answer: local.answer,
        localSignals: local.localSignals,
        sources: [],
        disclosure: "Based on tonight’s synthetic data",
      });
    }

    if (intent === "hybrid") {
      if (!context) {
        console.info("[Spot] intent=hybrid tavilyCalled=false");
        return jsonResponse({
          status: "success",
          intent,
          sourceType: "none",
          answer:
            "I can connect this question to tonight’s signals after you run Tonight's Protocol. Right now I only have general REMi guidance, not an active synthetic plan context.",
          localSignals: [],
          sources: [],
          disclosure: "General REMi guidance before a plan is loaded",
        });
      }

      const localSignals = summarizeRelevantLocalSignals(question, context);

      try {
        console.info("[Spot] intent=hybrid tavilyCalled=true");
        const research = await searchResearch(
          buildResearchQuery(question, "hybrid", context),
          question,
        );

        return jsonResponse({
          status: "success",
          intent,
          sourceType: "local+tavily",
          answer: buildHybridAnswer({
            context,
            localSignals,
            question,
            researchAnswer: research.answer,
            sources: research.sources,
          }),
          localSignals,
          sources: research.sources,
          disclosure: "Research-supported context · Not a diagnosis",
        });
      } catch (error) {
        if (isSpotResearchError(error)) {
          return jsonResponse(
            {
              status: "unavailable",
              intent,
              sourceType: "local",
              answer: `Based on tonight’s synthetic data, relevant signals include ${localSignals.join(", ") || "the current sleep and recovery pattern"}. I could read tonight’s signals, but I couldn’t check the research right now. Please try again.`,
              localSignals,
              sources: [],
              disclosure: "Based on tonight’s synthetic data",
            },
            error.statusCode,
          );
        }

        throw error;
      }
    }

    if (intent === "research") {
      try {
        console.info("[Spot] intent=research tavilyCalled=true");
        const research = await searchResearch(
          buildResearchQuery(question, "research", context ?? undefined),
          question,
        );

        return jsonResponse({
          status: "success",
          intent,
          sourceType: "tavily",
          answer: buildResearchAnswer({
            context,
            question,
            researchAnswer: research.answer,
            sources: research.sources,
          }),
          localSignals: [],
          sources: research.sources,
          disclosure: "Research-supported context · Not a diagnosis",
        });
      } catch (error) {
        if (isSpotResearchError(error)) {
          return jsonResponse(
            {
              status: "unavailable",
              intent,
              sourceType: "none",
              answer:
                "I couldn’t check trusted research right now. Please try again.",
              localSignals: [],
              sources: [],
            },
            error.statusCode,
          );
        }

        throw error;
      }
    }

    if (intent === "safety") {
      return jsonResponse({
        status: "success",
        intent,
        sourceType: "safety",
        answer: buildSafetyAnswer(),
        localSignals: [],
        sources: [],
        disclosure: "Wellness guidance only",
      });
    }

    return jsonResponse({
      status: "success",
      intent,
      sourceType: "none",
      answer: buildUnsupportedAnswer(),
      localSignals: [],
      sources: [],
    });
  } catch {
    return jsonResponse(
      {
        status: "error",
        intent: "unsupported",
        sourceType: "none",
        answer: "Spot hit a server problem and could not answer that question.",
        localSignals: [],
        sources: [],
      },
      500,
    );
  }
}
