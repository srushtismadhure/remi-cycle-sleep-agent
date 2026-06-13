"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { SpotCompanion } from "@/components/SpotCompanion";
import type { REMiAgentResult } from "@/lib/types";

interface SpotContextValue {
  result: REMiAgentResult | null;
  setResult: (result: REMiAgentResult) => void;
}

const SpotContext = createContext<SpotContextValue | null>(null);

export function SpotProvider({ children }: { children: ReactNode }) {
  const [result, setStoredResult] = useState<REMiAgentResult | null>(null);
  const setResult = useCallback((nextResult: REMiAgentResult) => {
    setStoredResult(nextResult);
  }, []);
  const value = useMemo(() => ({ result, setResult }), [result, setResult]);

  return (
    <SpotContext.Provider value={value}>
      {children}
      <SpotCompanion />
    </SpotContext.Provider>
  );
}

export function useSpot() {
  const context = useContext(SpotContext);

  if (!context) {
    throw new Error("useSpot must be used within SpotProvider.");
  }

  return context;
}
