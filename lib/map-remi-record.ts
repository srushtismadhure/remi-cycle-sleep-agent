import { normalizeSignals } from "@/lib/dataAdapter";
import type { REMiSignals } from "@/lib/types";

type NullableNumber = null | number | undefined;
type NullableString = null | string | undefined;

export interface RawSyntheticNightRecord {
  bedtime_action?: NullableString;
  cramps_0_5?: NullableNumber;
  cycle_day?: NullableNumber;
  cycle_phase?: NullableString;
  day_in_study?: NullableNumber;
  fatigue_0_5?: NullableNumber;
  gentle_briefing_text?: NullableString;
  hrv_rmssd_ms?: NullableNumber;
  main_risk_drivers?: NullableString;
  minutes_asleep?: NullableNumber;
  recommended_protocol?: NullableString;
  remi_sleep_risk_score_0_100?: NullableNumber;
  resting_hr_bpm?: NullableNumber;
  risk_level?: NullableString;
  self_report_stress_0_5?: NullableNumber;
  sleep_debt_hours?: NullableNumber;
  sleep_efficiency_pct?: NullableNumber;
  sleep_issue_0_5?: NullableNumber;
  skin_temp_delta_c?: NullableNumber;
  study_interval?: NullableString;
  synthetic_date?: NullableString;
  user_id?: NullableString;
}

export interface SyntheticRecordMeta {
  baseline_hrv_rmssd: number;
  baseline_resting_hr: number;
  record_key: string;
}

function average(values: number[]) {
  if (values.length === 0) {
    return 1;
  }

  const sum = values.reduce((total, value) => total + value, 0);
  return Number((sum / values.length).toFixed(1));
}

function toNumber(value: NullableNumber | undefined, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toString(value: NullableString | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function computeUserBaselines(
  rows: RawSyntheticNightRecord[],
  userId: string,
) {
  const userRows = rows.filter((row) => row.user_id === userId);

  return {
    baseline_hrv_rmssd: average(
      userRows
        .map((row) => row.hrv_rmssd_ms)
        .filter((value): value is number => typeof value === "number"),
    ),
    baseline_resting_hr: average(
      userRows
        .map((row) => row.resting_hr_bpm)
        .filter((value): value is number => typeof value === "number"),
    ),
  };
}

export function createRecordKey(record: RawSyntheticNightRecord) {
  return `${toString(record.user_id, "synthetic_user_unknown")}:${toString(
    record.synthetic_date,
    "unknown-date",
  )}`;
}

export function mapRawRecordToSignals(
  record: RawSyntheticNightRecord,
  meta: SyntheticRecordMeta,
): REMiSignals {
  const sleepIssue = toNumber(record.sleep_issue_0_5);
  const stressScore = Math.min(10, Math.max(0, toNumber(record.self_report_stress_0_5) * 2));
  const cramps = toNumber(record.cramps_0_5) >= 3;
  const priorSleepQuality =
    sleepIssue >= 4 ? "poor" : sleepIssue >= 2 ? "fair" : "good";

  return normalizeSignals({
    date: toString(record.synthetic_date, "2026-06-11"),
    estimated_cycle_phase: toString(record.cycle_phase, "unknown"),
    cycle_day: Math.max(0, toNumber(record.cycle_day)),
    hrv_rmssd: Math.max(0, toNumber(record.hrv_rmssd_ms)),
    baseline_hrv_rmssd: Math.max(1, meta.baseline_hrv_rmssd),
    resting_hr: Math.max(0, toNumber(record.resting_hr_bpm)),
    baseline_resting_hr: Math.max(1, meta.baseline_resting_hr),
    skin_temp_delta_c: toNumber(record.skin_temp_delta_c),
    sleep_debt_hours: Math.max(0, toNumber(record.sleep_debt_hours)),
    stress_score: stressScore,
    cramps,
    prior_sleep_quality: priorSleepQuality,
    optional_health_context: {
      source: "synthetic",
      sleep_relevant_context: [
        `Dataset record ${meta.record_key}`,
        `Study day ${Math.max(0, toNumber(record.day_in_study))}`,
      ],
      notes: `Synthetic dataset record ${meta.record_key} from ${toString(
        record.study_interval,
        "study interval unavailable",
      )}.`,
    },
  });
}
