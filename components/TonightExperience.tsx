"use client";

import { useRef, useState } from "react";

import { CheckInCard } from "@/components/CheckInCard";
import { RemiHero } from "@/components/RemiHero";
import { ResultsView } from "@/components/ResultsView";
import type { CheckInData } from "@/lib/checkIn";
import type { REMiAgentResult } from "@/lib/types";

type RunState = "idle" | "loading" | "success" | "error";

const MIN_LOADING_MS = 1200;
const RESULT_SCROLL_DELAY_MS = 80;
const RESULT_SCROLL_SETTLE_MS = 450;

interface TonightExperienceProps {
  initialResult: REMiAgentResult;
}

export function TonightExperience({
  initialResult,
}: TonightExperienceProps) {
  const [runState, setRunState] = useState<RunState>("idle");
  const [result, setResult] = useState<REMiAgentResult>(initialResult);
  const resultRef = useRef<HTMLElement>(null);

  async function runTonightPlan(checkIn?: CheckInData) {
    if (runState === "loading") {
      return;
    }

    setRunState("loading");

    try {
      const [response] = await Promise.all([
        fetch("/api/run-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inputMode: checkIn ? "check-in" : "wearable-only",
            checkIn: checkIn ?? null,
          }),
        }),
        new Promise((resolve) => window.setTimeout(resolve, MIN_LOADING_MS)),
      ]);

      if (!response.ok) {
        throw new Error("REMi could not prepare your plan.");
      }

      const payload = (await response.json()) as REMiAgentResult;
      setResult(payload);

      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.setTimeout(() => {
          setRunState("success");
        }, RESULT_SCROLL_SETTLE_MS);
      }, RESULT_SCROLL_DELAY_MS);
    } catch {
      setRunState("error");
    }
  }

  return (
    <>
      <RemiHero
        ctaLabel="Run Tonight's Protocol"
        ctaLoadingLabel="Reading tonight's signals..."
        errorMessage={
          runState === "error"
            ? "REMi could not prepare the plan. Please try again."
            : undefined
        }
        isCtaDisabled={runState === "loading"}
        isCtaLoading={runState === "loading"}
        onCta={() => runTonightPlan()}
        riskLevel={result.riskProfile.risk_level}
      />
      <div>
        <CheckInCard
          isSubmitting={runState === "loading"}
          onSave={runTonightPlan}
          onSkip={() => runTonightPlan()}
        />
      </div>
      <section ref={resultRef}>
        <ResultsView result={result} />
      </section>
    </>
  );
}
