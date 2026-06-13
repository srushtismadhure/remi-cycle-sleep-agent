import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  computeUserBaselines,
  createRecordKey,
  mapRawRecordToSignals,
  type RawSyntheticNightRecord,
} from "@/lib/map-remi-record";

const DATASET_PATH = path.join(
  process.cwd(),
  "data",
  "remi_synthetic_user_night_dataset.json",
);
const PREFERRED_USER_ID = "synthetic_user_001";
const PREFERRED_DATE = "2026-06-11";

function isCompleteRecord(record: RawSyntheticNightRecord) {
  return Boolean(
    record.user_id &&
      record.synthetic_date &&
      record.cycle_phase &&
      typeof record.cycle_day === "number" &&
      typeof record.hrv_rmssd_ms === "number" &&
      typeof record.resting_hr_bpm === "number" &&
      typeof record.self_report_stress_0_5 === "number" &&
      typeof record.remi_sleep_risk_score_0_100 === "number" &&
      record.risk_level &&
      record.recommended_protocol &&
      record.main_risk_drivers &&
      record.gentle_briefing_text,
  );
}

async function readDataset() {
  const raw = await readFile(DATASET_PATH, "utf-8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Synthetic REMi dataset is not an array.");
  }

  return parsed as RawSyntheticNightRecord[];
}

export interface DeterministicDemoSelection {
  rawRecord: RawSyntheticNightRecord;
  record_key: string;
  signals: ReturnType<typeof mapRawRecordToSignals>;
}

function mapSelection(
  rows: RawSyntheticNightRecord[],
  selected: RawSyntheticNightRecord,
): DeterministicDemoSelection {
  const record_key = createRecordKey(selected);
  const baselines = computeUserBaselines(rows, String(selected.user_id));

  return {
    rawRecord: selected,
    record_key,
    signals: mapRawRecordToSignals(selected, {
      ...baselines,
      record_key,
    }),
  };
}

export async function getDeterministicDemoSelection(): Promise<DeterministicDemoSelection> {
  const rows = await readDataset();
  const completeRows = rows.filter(isCompleteRecord);

  if (completeRows.length === 0) {
    throw new Error("No complete synthetic REMi records were found.");
  }

  const exactPreferred = completeRows.find(
    (record) =>
      record.user_id === PREFERRED_USER_ID &&
      record.synthetic_date === PREFERRED_DATE,
  );

  const selected =
    exactPreferred ??
    completeRows
      .filter((record) => record.user_id === PREFERRED_USER_ID)
      .sort((left, right) =>
        String(right.synthetic_date).localeCompare(String(left.synthetic_date)),
      )[0] ??
    completeRows[0];

  return mapSelection(rows, selected);
}

export async function getDemoSelectionByRecordKey(
  recordKey: string,
): Promise<DeterministicDemoSelection | null> {
  const rows = await readDataset();
  const completeRows = rows.filter(isCompleteRecord);
  const match = completeRows.find((record) => createRecordKey(record) === recordKey);

  if (!match) {
    return null;
  }

  return mapSelection(rows, match);
}
