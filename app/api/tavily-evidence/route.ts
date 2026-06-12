import { NextResponse } from "next/server";

import { retrieveEvidence } from "@/lib/tavily";

export async function GET() {
  return NextResponse.json(retrieveEvidence());
}

export async function POST() {
  return GET();
}
