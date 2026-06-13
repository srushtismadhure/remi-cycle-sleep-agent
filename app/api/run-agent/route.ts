import { NextResponse } from "next/server";

import type { RunAgentRequestBody } from "@/lib/checkIn";
import { getDeterministicDemoSelection } from "@/lib/remi-data.server";
import type { REMiAgentResult } from "@/lib/types";
import { createAgentResult } from "@/lib/server/create-agent-result";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let requestBody: RunAgentRequestBody = {};

  try {
    requestBody = (await request.json()) as RunAgentRequestBody;
  } catch {
    requestBody = {};
  }

  const selection = await getDeterministicDemoSelection();
  const response: REMiAgentResult = await createAgentResult(
    selection,
    requestBody.inputMode === "check-in" ? requestBody.checkIn ?? null : null,
  );

  return NextResponse.json(response);
}

export async function GET() {
  return POST(new Request("http://localhost/api/run-agent", { method: "GET" }));
}
