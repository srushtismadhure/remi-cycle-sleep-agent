export type VibrationPatternId =
  | "soft_pulse"
  | "lunar_breathing"
  | "slow_exhale"
  | "grounding_pulse"
  | "box_breathing"
  | "no_vibration";

export type VibrationPatternDefinition = {
  id: VibrationPatternId;
  name: string;
  description: string;
  // Arrays alternate between vibration duration and pause duration in milliseconds.
  pattern: number[];
};

export const VIBRATION_PATTERNS: Record<
  VibrationPatternId,
  VibrationPatternDefinition
> = {
  soft_pulse: {
    id: "soft_pulse",
    name: "Soft Pulse",
    description: "A brief, gentle settling cue.",
    pattern: [80],
  },
  lunar_breathing: {
    id: "lunar_breathing",
    name: "Lunar Breathing",
    description: "A gentle breathing rhythm with a longer exhale.",
    pattern: [90, 3910, 90, 180, 90, 5620],
  },
  slow_exhale: {
    id: "slow_exhale",
    name: "Slow Exhale",
    description: "A calm tactile rhythm emphasizing a longer exhale.",
    pattern: [90, 3910, 90, 180, 90, 6620],
  },
  grounding_pulse: {
    id: "grounding_pulse",
    name: "Grounding Pulse",
    description: "Three gently spaced pulses for physical restlessness.",
    pattern: [80, 250, 80, 400, 80],
  },
  box_breathing: {
    id: "box_breathing",
    name: "Box Breathing",
    description: "An evenly timed structured breathing rhythm.",
    pattern: [80, 3920, 80, 3920, 80, 3920, 80, 3920],
  },
  no_vibration: {
    id: "no_vibration",
    name: "No Vibration Needed",
    description: "Your current signals suggest a calm night.",
    pattern: [],
  },
};
