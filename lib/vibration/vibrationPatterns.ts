import type { REMiHapticMode } from "@/lib/types";

export type VibrationPatternId =
  | "soft_wave"
  | "calm_drift"
  | "deep_downshift"
  | "no_vibration";

type VibrationPatternSeed = {
  id: VibrationPatternId;
  name: REMiHapticMode | "No Vibration Needed";
  description: string;
  // Arrays alternate between vibration duration and pause duration in milliseconds.
  pattern: number[];
  repeatCount: number;
};

export type VibrationPatternDefinition = VibrationPatternSeed & {
  cycleDurationMs: number;
  estimatedDurationMs: number;
};

export function getPatternCycleDuration(pattern: number[]) {
  return pattern.reduce((total, duration) => total + duration, 0);
}

export function formatVibrationDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function definePattern(seed: VibrationPatternSeed): VibrationPatternDefinition {
  const cycleDurationMs = getPatternCycleDuration(seed.pattern);

  return {
    ...seed,
    cycleDurationMs,
    estimatedDurationMs: cycleDurationMs * seed.repeatCount,
  };
}

export const VIBRATION_PATTERNS: Record<
  VibrationPatternId,
  VibrationPatternDefinition
> = {
  soft_wave: definePattern({
    id: "soft_wave",
    name: "Soft Wave",
    description: "Light, spacious pulses with generous breathing room between cues.",
    pattern: [180, 1800, 180, 2200],
    repeatCount: 12,
  }),
  calm_drift: definePattern({
    id: "calm_drift",
    name: "Calm Drift",
    description: "A slower, balanced rhythm that repeats without rushing the body.",
    pattern: [260, 1400, 260, 2200],
    repeatCount: 20,
  }),
  deep_downshift: definePattern({
    id: "deep_downshift",
    name: "Deep Downshift",
    description: "The longest, most gradual pattern with deeper pauses between pulses.",
    pattern: [350, 1700, 350, 2800],
    repeatCount: 20,
  }),
  no_vibration: definePattern({
    id: "no_vibration",
    name: "No Vibration Needed",
    description: "Your current signals suggest a calm night.",
    pattern: [],
    repeatCount: 0,
  }),
};
