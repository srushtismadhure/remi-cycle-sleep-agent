import { NextResponse } from "next/server";

import demoNight from "@/data/demoNight.json";
import { triggerBedtimeActions } from "@/lib/composio";
import { normalizeSignals, validateSignals } from "@/lib/dataAdapter";
import { generateVoiceNote } from "@/lib/elevenlabs";
import { generateSleepPlan } from "@/lib/nebius";
import { calculateRisk } from "@/lib/riskEngine";
import { retrieveEvidence } from "@/lib/tavily";
import type { REMiAgentResult } from "@/lib/types";

export async function POST() {
  const signals = normalizeSignals(demoNight);
  const validationIssues = validateSignals(signals);

  if (validationIssues.length > 0) {
    return NextResponse.json(
      { error: "Demo signals are invalid.", validationIssues },
      { status: 422 },
    );
  }

  const riskProfile = calculateRisk(signals);
  const plan = generateSleepPlan(riskProfile, signals);
  const evidence = retrieveEvidence(riskProfile, signals);
  const actions = triggerBedtimeActions(plan);
  const voiceNote = generateVoiceNote(plan, riskProfile);

  const response: REMiAgentResult = {
    signals,
    riskProfile,
    plan,
    evidence,
    actions,
    voiceNote,
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

  return NextResponse.json(response);
}

export async function GET() {
  return POST();
}
