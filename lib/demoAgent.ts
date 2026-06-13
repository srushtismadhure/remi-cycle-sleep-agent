import { getDeterministicDemoSelection } from "@/lib/remi-data.server";
import { createAgentResult } from "@/lib/server/create-agent-result";
import type { REMiAgentResult } from "@/lib/types";

export async function runDemoAgent(): Promise<REMiAgentResult> {
  const selection = await getDeterministicDemoSelection();

  return createAgentResult(selection);
}
