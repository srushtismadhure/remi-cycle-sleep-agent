import { NextResponse } from "next/server";

import demoNight from "@/data/demoNight.json";
import { normalizeSignals } from "@/lib/dataAdapter";
import { generateVoiceNote } from "@/lib/elevenlabs";
import { generateSleepPlan } from "@/lib/nebius";
import { calculateRisk } from "@/lib/riskEngine";

export async function GET() {
  const signals = normalizeSignals(demoNight);
  const riskProfile = calculateRisk(signals);
  const plan = generateSleepPlan(riskProfile, signals);

  return NextResponse.json(generateVoiceNote(plan, riskProfile));
}

export async function POST() {
  return GET();
}
