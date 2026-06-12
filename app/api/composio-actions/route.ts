import { NextResponse } from "next/server";

import demoNight from "@/data/demoNight.json";
import { triggerBedtimeActions } from "@/lib/composio";
import { normalizeSignals } from "@/lib/dataAdapter";
import { generateSleepPlan } from "@/lib/nebius";
import { calculateRisk } from "@/lib/riskEngine";

export async function GET() {
  const signals = normalizeSignals(demoNight);
  const plan = generateSleepPlan(calculateRisk(signals), signals);

  return NextResponse.json(triggerBedtimeActions(plan));
}

export async function POST() {
  return GET();
}
