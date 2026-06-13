export const CHECK_IN_FEELINGS = [
  "Wired",
  "Tired",
  "Crampy",
  "Bloated",
  "Anxious",
  "Restless",
  "Calm",
  "Warm",
  "Headachy",
] as const;

export const CHECK_IN_SLIDERS = [
  "Stress",
  "Fatigue",
  "Sleep issue",
  "Cramps",
  "Bloating",
] as const;

export type CheckInFeeling = (typeof CHECK_IN_FEELINGS)[number];
export type CheckInSlider = (typeof CHECK_IN_SLIDERS)[number];

export interface CheckInData {
  feelings: CheckInFeeling[];
  details: Record<CheckInSlider, number>;
  note: string;
}

export interface RunAgentRequestBody {
  inputMode?: "check-in" | "wearable-only";
  checkIn?: CheckInData | null;
}
