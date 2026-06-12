import type { REMiSignals } from "@/lib/types";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value !== null && typeof value === "object"
    ? (value as UnknownRecord)
    : {};
}

function readString(
  record: UnknownRecord,
  key: string,
  fallback: string,
): string {
  return typeof record[key] === "string" ? record[key] : fallback;
}

function readNumber(
  record: UnknownRecord,
  key: string,
  fallback: number,
): number {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readBoolean(
  record: UnknownRecord,
  key: string,
  fallback: boolean,
): boolean {
  return typeof record[key] === "boolean" ? record[key] : fallback;
}

export function normalizeSignals(input: unknown): REMiSignals {
  const source = asRecord(input);
  const healthContext = asRecord(source.optional_health_context);
  const date = readString(source, "date", new Date().toISOString().slice(0, 10));

  return {
    date,
    estimated_cycle_phase: readString(
      source,
      "estimated_cycle_phase",
      "unknown",
    ),
    cycle_day: Math.max(0, readNumber(source, "cycle_day", 0)),
    hrv_rmssd: Math.max(0, readNumber(source, "hrv_rmssd", 0)),
    baseline_hrv_rmssd: Math.max(
      1,
      readNumber(source, "baseline_hrv_rmssd", 1),
    ),
    resting_hr: Math.max(0, readNumber(source, "resting_hr", 0)),
    baseline_resting_hr: Math.max(
      1,
      readNumber(source, "baseline_resting_hr", 1),
    ),
    skin_temp_delta_c: readNumber(source, "skin_temp_delta_c", 0),
    sleep_debt_hours: Math.max(0, readNumber(source, "sleep_debt_hours", 0)),
    stress_score: Math.min(
      10,
      Math.max(0, readNumber(source, "stress_score", 0)),
    ),
    cramps: readBoolean(source, "cramps", false),
    prior_sleep_quality: readString(
      source,
      "prior_sleep_quality",
      "unknown",
    ),
    optional_health_context:
      Object.keys(healthContext).length > 0
        ? {
            source: readString(healthContext, "source", "unspecified"),
            sleep_relevant_context: Array.isArray(
              healthContext.sleep_relevant_context,
            )
              ? healthContext.sleep_relevant_context.filter(
                  (item): item is string => typeof item === "string",
                )
              : undefined,
            notes:
              typeof healthContext.notes === "string"
                ? healthContext.notes
                : undefined,
          }
        : undefined,
  };
}

export function validateSignals(signals: REMiSignals): string[] {
  const issues: string[] = [];

  if (!signals.date) issues.push("A date is required.");
  if (signals.baseline_hrv_rmssd <= 0) {
    issues.push("Baseline HRV must be greater than zero.");
  }
  if (signals.baseline_resting_hr <= 0) {
    issues.push("Baseline resting heart rate must be greater than zero.");
  }

  return issues;
}
