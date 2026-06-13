import type { CheckInData, CheckInFeeling } from "@/lib/checkIn";
import { applyCheckInToSignals } from "@/lib/applyCheckInToSignals";
import { normalizeSignals } from "@/lib/dataAdapter";
import type { DeterministicDemoSelection } from "@/lib/remi-data.server";
import { calculateRisk } from "@/lib/riskEngine";
import type {
  REMiBodyStateContext,
  REMiDemoRecord,
  RemiTonightResult,
} from "@/lib/types";

function hasFeeling(feelings: CheckInFeeling[], feeling: CheckInFeeling) {
  return feelings.includes(feeling);
}

function normalizeStress(
  rawStress0to5: number | null | undefined,
  checkIn?: CheckInData | null,
) {
  const base = typeof rawStress0to5 === "number" ? rawStress0to5 * 2 : 0;
  if (!checkIn) {
    return base;
  }

  return Math.min(10, Math.max(base, (checkIn.details.Stress ?? 1) * 2));
}

function withCheckInSymptom(
  rawValue: number | null | undefined,
  overrideValue: number | undefined,
  isSelected: boolean,
) {
  const base = typeof rawValue === "number" ? rawValue : undefined;
  const selectedBoost = isSelected ? 4 : undefined;

  return [base, overrideValue, selectedBoost]
    .filter((value): value is number => typeof value === "number")
    .reduce<number | undefined>(
      (current, value) => (typeof current === "number" ? Math.max(current, value) : value),
      undefined,
    );
}

function labelRelativeDelta(
  value: number,
  positiveThreshold: number,
  negativeThreshold: number,
) {
  if (value >= positiveThreshold) {
    return "above baseline";
  }

  if (value <= negativeThreshold) {
    return "below baseline";
  }

  return "near baseline";
}

function labelSleepDebt(hours: number) {
  if (hours >= 3) {
    return "high";
  }

  if (hours >= 1.5) {
    return "moderate";
  }

  if (hours > 0.25) {
    return "low";
  }

  return "minimal";
}

function deriveAffectState({
  fatigue,
  feelings,
  stress,
}: {
  fatigue?: number;
  feelings: CheckInFeeling[];
  stress: number;
}) {
  if (hasFeeling(feelings, "Calm")) {
    return "calm";
  }

  if (
    hasFeeling(feelings, "Wired") ||
    hasFeeling(feelings, "Anxious") ||
    hasFeeling(feelings, "Restless")
  ) {
    return "stressed";
  }

  if (
    hasFeeling(feelings, "Crampy") ||
    hasFeeling(feelings, "Bloated") ||
    hasFeeling(feelings, "Headachy")
  ) {
    return "physically uncomfortable";
  }

  if (stress >= 7) {
    return "stressed";
  }

  if (typeof fatigue === "number" && fatigue >= 4) {
    return "tired";
  }

  return "steady";
}

function buildDemoRecord(selection: DeterministicDemoSelection, date: string): REMiDemoRecord {
  return {
    source: "synthetic",
    record_key: selection.record_key,
    user_id: selection.rawRecord.user_id ?? "synthetic_user_unknown",
    synthetic_date: selection.rawRecord.synthetic_date ?? date,
    day_in_study:
      typeof selection.rawRecord.day_in_study === "number"
        ? selection.rawRecord.day_in_study
        : undefined,
    study_interval:
      typeof selection.rawRecord.study_interval === "string"
        ? selection.rawRecord.study_interval
        : undefined,
  };
}

function buildBodyStateContext(
  selection: DeterministicDemoSelection,
  checkIn: CheckInData | null | undefined,
) {
  const raw = selection.rawRecord;
  const baseSignals = normalizeSignals(selection.signals);
  const signals = checkIn ? applyCheckInToSignals(baseSignals, checkIn) : baseSignals;
  const feelings = checkIn?.feelings ?? [];
  const fatigue = withCheckInSymptom(raw.fatigue_0_5, checkIn?.details.Fatigue, hasFeeling(feelings, "Tired"));
  const sleepIssue = withCheckInSymptom(
    raw.sleep_issue_0_5,
    checkIn?.details["Sleep issue"],
    false,
  );
  const cramps = withCheckInSymptom(raw.cramps_0_5, checkIn?.details.Cramps, hasFeeling(feelings, "Crampy"));
  const bloating = withCheckInSymptom(
    (raw as Record<string, unknown>).bloating_0_5 as number | null | undefined,
    checkIn?.details.Bloating,
    hasFeeling(feelings, "Bloated"),
  );
  const headaches = withCheckInSymptom(
    (raw as Record<string, unknown>).headaches_0_5 as number | null | undefined,
    undefined,
    hasFeeling(feelings, "Headachy"),
  );
  const appetite =
    typeof (raw as Record<string, unknown>).appetite_0_5 === "number"
      ? ((raw as Record<string, unknown>).appetite_0_5 as number)
      : undefined;
  const moodSwing =
    typeof (raw as Record<string, unknown>).mood_swing_0_5 === "number"
      ? ((raw as Record<string, unknown>).mood_swing_0_5 as number)
      : undefined;
  const sleepScore =
    typeof (raw as Record<string, unknown>).fitbit_sleep_score_0_100 === "number"
      ? ((raw as Record<string, unknown>).fitbit_sleep_score_0_100 as number)
      : undefined;
  const restlessness =
    typeof (raw as Record<string, unknown>).restlessness_score === "number"
      ? ((raw as Record<string, unknown>).restlessness_score as number)
      : undefined;
  const hrvDelta = Number((signals.hrv_rmssd - signals.baseline_hrv_rmssd).toFixed(1));
  const restingHrDelta = Number((signals.resting_hr - signals.baseline_resting_hr).toFixed(1));
  const stress = normalizeStress(raw.self_report_stress_0_5, checkIn);

  return {
    signals,
    bodyState: {
      affect_state: deriveAffectState({ fatigue, feelings, stress }),
      appetite_0_5: appetite,
      bloating_0_5: bloating,
      cramps_0_5: cramps,
      cycle_day:
        typeof raw.cycle_day === "number" ? raw.cycle_day : signals.cycle_day,
      cycle_phase:
        typeof raw.cycle_phase === "string"
          ? raw.cycle_phase
          : signals.estimated_cycle_phase,
      estrogen_e3g_ng_mL:
        typeof (raw as Record<string, unknown>).estrogen_e3g_ng_mL === "number"
          ? ((raw as Record<string, unknown>).estrogen_e3g_ng_mL as number)
          : undefined,
      fatigue_0_5: fatigue,
      fitbit_sleep_score_0_100: sleepScore,
      headaches_0_5: headaches,
      hrv_delta_from_baseline: hrvDelta,
      hrv_relative_label: labelRelativeDelta(hrvDelta, 4, -4),
      lh_mIU_mL:
        typeof (raw as Record<string, unknown>).lh_mIU_mL === "number"
          ? ((raw as Record<string, unknown>).lh_mIU_mL as number)
          : undefined,
      minutes_asleep:
        typeof raw.minutes_asleep === "number" ? raw.minutes_asleep : undefined,
      mood_swing_0_5: moodSwing,
      pdg_ug_mL:
        typeof (raw as Record<string, unknown>).pdg_ug_mL === "number"
          ? ((raw as Record<string, unknown>).pdg_ug_mL as number)
          : undefined,
      resting_hr_delta_from_baseline: restingHrDelta,
      resting_hr_relative_label: labelRelativeDelta(restingHrDelta, 3, -3),
      restlessness_score: restlessness,
      sleep_debt_hours: signals.sleep_debt_hours,
      sleep_debt_label: labelSleepDebt(signals.sleep_debt_hours),
      sleep_efficiency_pct:
        typeof raw.sleep_efficiency_pct === "number"
          ? raw.sleep_efficiency_pct
          : undefined,
      sleep_issue_0_5: sleepIssue,
      sleep_risk_score_0_100:
        typeof raw.remi_sleep_risk_score_0_100 === "number"
          ? raw.remi_sleep_risk_score_0_100
          : undefined,
      skin_temperature_delta_c: signals.skin_temp_delta_c,
      skin_temperature_relative_label: labelRelativeDelta(
        signals.skin_temp_delta_c,
        0.3,
        -0.3,
      ),
      stress_0_10: stress,
    } satisfies REMiBodyStateContext,
  };
}

export function buildRemiTonightResult(
  selection: DeterministicDemoSelection,
  checkIn?: CheckInData | null,
): RemiTonightResult {
  const { signals, bodyState } = buildBodyStateContext(selection, checkIn);
  const riskProfile = calculateRisk(signals);

  return {
    bodyState,
    demoRecord: buildDemoRecord(selection, signals.date),
    riskProfile,
    signals,
  };
}
