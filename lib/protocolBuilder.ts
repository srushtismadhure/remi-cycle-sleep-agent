import protocols from "@/data/protocols.json";
import type { REMiRiskProfile, REMiSignals } from "@/lib/types";

export interface REMiProtocolTemplate {
  name: string;
  description: string;
  duration_minutes: number;
}

export function selectProtocol(
  riskProfile: REMiRiskProfile,
  signals: REMiSignals,
): REMiProtocolTemplate {
  let name = "Light Drift";

  if (
    riskProfile.risk_level === "high" &&
    signals.estimated_cycle_phase === "late_luteal"
  ) {
    name = "Luteal Downshift";
  } else if (riskProfile.risk_level === "high") {
    name = "Recovery Moon";
  } else if (riskProfile.risk_level === "medium") {
    name = "Soft Landing";
  }

  return (
    protocols.find((protocol) => protocol.name === name) ?? protocols[0]
  );
}
