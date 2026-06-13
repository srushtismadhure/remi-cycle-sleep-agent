import { normalizeSignals } from "@/lib/dataAdapter";
import { getHapticProtocol } from "@/lib/getHapticProtocol";
import type { RawSyntheticNightRecord } from "@/lib/map-remi-record";
import { getDemoSelectionByRecordKey } from "@/lib/remi-data.server";
import { generateSleepPlan } from "@/lib/nebius";
import { calculateRisk } from "@/lib/riskEngine";
import type { SpotTonightContext } from "@/lib/spot/types";

function toOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function toOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function buildSpotTonightContext(
  recordKey: string,
  rawRecord: RawSyntheticNightRecord,
  signals: ReturnType<typeof normalizeSignals>,
  riskProfile: ReturnType<typeof calculateRisk>,
  plan: ReturnType<typeof generateSleepPlan>,
): SpotTonightContext {
  const haptic = getHapticProtocol(riskProfile.risk_level);

  return {
    hasPlan: true,
    recordKey,
    syntheticDate: toOptionalString(rawRecord.synthetic_date),
    cyclePhase: signals.estimated_cycle_phase,
    cycleDay: signals.cycle_day,
    lh: toOptionalNumber((rawRecord as Record<string, unknown>).lh_mIU_mL),
    fsh: toOptionalNumber((rawRecord as Record<string, unknown>).fsh_mIU_mL),
    estrogenE3g: toOptionalNumber(
      (rawRecord as Record<string, unknown>).estrogen_e3g_ng_mL,
    ),
    progesteronePdg: toOptionalNumber(
      (rawRecord as Record<string, unknown>).pdg_ug_mL,
    ),
    fatigue: toOptionalNumber(rawRecord.fatigue_0_5),
    sleepIssue: toOptionalNumber(rawRecord.sleep_issue_0_5),
    stress: signals.stress_score,
    cramps: toOptionalNumber(rawRecord.cramps_0_5),
    headaches: toOptionalNumber(
      (rawRecord as Record<string, unknown>).headaches_0_5,
    ),
    moodSwing: toOptionalNumber(
      (rawRecord as Record<string, unknown>).mood_swing_0_5,
    ),
    bloating: toOptionalNumber(
      (rawRecord as Record<string, unknown>).bloating_0_5,
    ),
    hrvRmssdMs: signals.hrv_rmssd,
    baselineHrvRmssdMs: signals.baseline_hrv_rmssd,
    restingHeartRateBpm: signals.resting_hr,
    baselineRestingHeartRateBpm: signals.baseline_resting_hr,
    skinTemperatureDeltaC: signals.skin_temp_delta_c,
    sleepScore: toOptionalNumber(
      (rawRecord as Record<string, unknown>).fitbit_sleep_score_0_100,
    ),
    sleepEfficiencyPercent: toOptionalNumber(rawRecord.sleep_efficiency_pct),
    sleepMinutes: toOptionalNumber(rawRecord.minutes_asleep),
    sleepDebtHours: signals.sleep_debt_hours,
    sleepRiskScore: toOptionalNumber(rawRecord.remi_sleep_risk_score_0_100),
    sleepFrictionScore: Math.min(10, Math.max(0, riskProfile.risk_score)),
    riskLevel: riskProfile.risk_level,
    riskDrivers: riskProfile.risk_drivers,
    selectedHaptic: haptic.name,
    hapticDurationMinutes: haptic.durationMinutes,
    breathRatePerMinute: haptic.breathRatePerMinute,
    hapticPulsePerMinute: haptic.pulseRatePerMinute,
    hapticIntensity: haptic.intensity,
    recommendedProtocol: plan.protocol_steps,
    recommendationText: plan.protocol_name,
    planSummary: plan.summary,
    safetyNote: plan.safety_note,
  };
}

export async function loadSpotTonightContext(demoRecordKey?: string) {
  if (!demoRecordKey) {
    return null;
  }

  const selection = await getDemoSelectionByRecordKey(demoRecordKey);

  if (!selection) {
    return null;
  }

  const signals = normalizeSignals(selection.signals);
  const riskProfile = calculateRisk(signals);
  const plan = generateSleepPlan(riskProfile, signals);

  return buildSpotTonightContext(
    selection.record_key,
    selection.rawRecord,
    signals,
    riskProfile,
    plan,
  );
}
