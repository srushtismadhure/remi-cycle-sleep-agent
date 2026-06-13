import type { REMiHapticMode, REMiRiskLevel } from "@/lib/types";

export interface HapticProtocol {
  breathRatePerMinute: number;
  durationMinutes: number;
  intensity: "Low" | "Low–Medium" | "Medium";
  name: REMiHapticMode;
  pulseRatePerMinute: number;
}

export const HAPTIC_PROTOCOLS: Record<REMiHapticMode, HapticProtocol> = {
  "Calm Drift": {
    name: "Calm Drift",
    breathRatePerMinute: 6,
    pulseRatePerMinute: 40,
    durationMinutes: 6,
    intensity: "Low",
  },
  "Soft Wave": {
    name: "Soft Wave",
    breathRatePerMinute: 6,
    pulseRatePerMinute: 48,
    durationMinutes: 8,
    intensity: "Low–Medium",
  },
  "Deep Downshift": {
    name: "Deep Downshift",
    breathRatePerMinute: 5,
    pulseRatePerMinute: 54,
    durationMinutes: 10,
    intensity: "Medium",
  },
};

export function getRiskFallbackHapticMode(
  riskLevel: REMiRiskLevel,
): REMiHapticMode {
  if (riskLevel === "high") {
    return "Deep Downshift";
  }

  if (riskLevel === "medium") {
    return "Soft Wave";
  }

  return "Calm Drift";
}

export function getHapticProtocol(
  modeOrRiskLevel: REMiHapticMode | REMiRiskLevel,
): HapticProtocol {
  const mode =
    modeOrRiskLevel === "low" ||
    modeOrRiskLevel === "medium" ||
    modeOrRiskLevel === "high"
      ? getRiskFallbackHapticMode(modeOrRiskLevel)
      : modeOrRiskLevel;

  return HAPTIC_PROTOCOLS[mode];
}
