import demoNight from "@/data/demoNight.json";
import { triggerBedtimeActions } from "@/lib/composio";
import { normalizeSignals } from "@/lib/dataAdapter";
import { generateVoiceNote } from "@/lib/elevenlabs";
import { generateSleepPlan } from "@/lib/nebius";
import { calculateRisk } from "@/lib/riskEngine";
import { retrieveEvidence } from "@/lib/tavily";
import type { REMiAgentResult } from "@/lib/types";

export function runDemoAgent(): REMiAgentResult {
  const signals = normalizeSignals(demoNight);
  const riskProfile = calculateRisk(signals);
  const plan = generateSleepPlan(riskProfile, signals);

  return {
    signals,
    riskProfile,
    plan,
    evidence: retrieveEvidence(riskProfile, signals),
    actions: triggerBedtimeActions(plan),
    voiceNote: generateVoiceNote(plan, riskProfile),
    completedSteps: [
      "User Signals",
      "Data Pipeline",
      "Risk Engine",
      "Nebius Plan Generation",
      "Tavily Evidence",
      "Composio Actions",
      "ElevenLabs Voice Note",
      "Tonight Plan Output",
    ],
  };
}
