import type {
  CheckInData,
  CheckInFeeling,
  CheckInSlider,
} from "@/lib/checkIn";
import type { REMiSignals } from "@/lib/types";

const EMPTY_DETAILS: Record<CheckInSlider, number> = {
  Stress: 1,
  Fatigue: 1,
  "Sleep issue": 1,
  Cramps: 1,
  Bloating: 1,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hasFeeling(feelings: CheckInFeeling[], feeling: CheckInFeeling) {
  return feelings.includes(feeling);
}

function mergeNote(
  baseNotes: string | undefined,
  feelings: CheckInFeeling[],
  note: string,
) {
  const parts = [baseNotes];

  if (feelings.length > 0) {
    parts.push(`Check-in feelings: ${feelings.join(", ")}.`);
  }

  if (note) {
    parts.push(`Check-in note: ${note}`);
  }

  return parts.filter(Boolean).join(" ").trim() || undefined;
}

export function applyCheckInToSignals(
  baseSignals: REMiSignals,
  checkIn?: CheckInData | null,
): REMiSignals {
  if (!checkIn) {
    return baseSignals;
  }

  const feelings = checkIn.feelings ?? [];
  const details = { ...EMPTY_DETAILS, ...checkIn.details };
  const stressFeelingBoost =
    (hasFeeling(feelings, "Wired") ? 1 : 0) +
    (hasFeeling(feelings, "Anxious") ? 1 : 0) +
    (hasFeeling(feelings, "Restless") ? 1 : 0);

  const stressScore = clamp(
    Math.max(
      baseSignals.stress_score,
      details.Stress * 2 + Math.min(stressFeelingBoost, 2),
    ),
    0,
    10,
  );

  const sleepIssueHours = Math.max(0, (details["Sleep issue"] - 1) * 0.7);
  const fatigueHours = Math.max(0, (details.Fatigue - 1) * 0.45);
  const sleepDebtHours = Number(
    Math.max(baseSignals.sleep_debt_hours, sleepIssueHours, fatigueHours).toFixed(
      1,
    ),
  );

  const cramps = details.Cramps >= 3 || hasFeeling(feelings, "Crampy");
  const warmBoost = hasFeeling(feelings, "Warm") ? 0.12 : 0;
  const priorSleepQuality =
    details["Sleep issue"] >= 4 || details.Fatigue >= 4
      ? "poor"
      : details["Sleep issue"] >= 3 || details.Fatigue >= 3
        ? "fair"
        : baseSignals.prior_sleep_quality;

  return {
    ...baseSignals,
    stress_score: stressScore,
    cramps,
    sleep_debt_hours: sleepDebtHours,
    skin_temp_delta_c: Number((baseSignals.skin_temp_delta_c + warmBoost).toFixed(2)),
    prior_sleep_quality: priorSleepQuality,
    optional_health_context: {
      source: "synthetic",
      sleep_relevant_context: [
        ...(baseSignals.optional_health_context?.sleep_relevant_context ?? []),
        ...(hasFeeling(feelings, "Headachy") ? ["headache discomfort"] : []),
        ...(details.Bloating >= 4 || hasFeeling(feelings, "Bloated")
          ? ["bloating discomfort"]
          : []),
      ],
      notes: mergeNote(baseSignals.optional_health_context?.notes, feelings, checkIn.note),
    },
  };
}
