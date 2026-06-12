import { NextResponse } from "next/server";

import demoNight from "@/data/demoNight.json";
import { normalizeSignals } from "@/lib/dataAdapter";
import { generateSleepPlan } from "@/lib/nebius";
import { calculateRisk } from "@/lib/riskEngine";

export async function GET() {
  const signals = normalizeSignals(demoNight);
  const riskProfile = calculateRisk(signals);

  return NextResponse.json(generateSleepPlan(riskProfile, signals));
}

export async function POST() {
  return GET();
}
