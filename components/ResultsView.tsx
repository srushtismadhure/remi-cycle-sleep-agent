"use client";

import { useEffect } from "react";

import { BodyRhythm } from "@/components/BodyRhythm";
import { useSpot } from "@/components/SpotProvider";
import { TodaySuggestion } from "@/components/TodaySuggestion";
import type { REMiAgentResult } from "@/lib/types";

interface ResultsViewProps {
  result: REMiAgentResult;
}

export function ResultsView({ result }: ResultsViewProps) {
  const { setResult } = useSpot();

  useEffect(() => {
    setResult(result);
  }, [result, setResult]);

  return (
    <>
      <TodaySuggestion result={result} />
      <BodyRhythm signals={result.signals} />
    </>
  );
}
