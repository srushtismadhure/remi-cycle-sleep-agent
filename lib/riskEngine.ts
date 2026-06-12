import type { REMiRiskProfile, REMiSignals } from "@/lib/types";

export function calculateRisk(signals: REMiSignals): REMiRiskProfile {
  let riskScore = 0;
  const riskDrivers: string[] = [];

  if (signals.estimated_cycle_phase === "late_luteal") {
    riskScore += 2;
    riskDrivers.push("Late-luteal phase may make tonight feel more sensitive.");
  }

  if (signals.hrv_rmssd < signals.baseline_hrv_rmssd * 0.85) {
    riskScore += 2;
    riskDrivers.push("HRV is below 85% of your synthetic baseline.");
  }

  if (signals.resting_hr > signals.baseline_resting_hr + 5) {
    riskScore += 1;
    riskDrivers.push("Resting heart rate is elevated versus baseline.");
  }

  if (signals.skin_temp_delta_c > 0.3) {
    riskScore += 1;
    riskDrivers.push("Skin temperature is above the recent baseline.");
  }

  if (signals.sleep_debt_hours > 1.5) {
    riskScore += 1;
    riskDrivers.push("Recent sleep debt may increase tonight's sleep load.");
  }

  if (signals.stress_score >= 7) {
    riskScore += 1;
    riskDrivers.push("Today's stress input is elevated.");
  }

  if (signals.cramps) {
    riskScore += 1;
    riskDrivers.push("Cramps may make settling down less comfortable.");
  }

  if (signals.prior_sleep_quality.toLowerCase() === "poor") {
    riskScore += 1;
    riskDrivers.push("Last night's sleep was marked as poor.");
  }

  const riskLevel =
    riskScore <= 2 ? "low" : riskScore <= 5 ? "medium" : "high";

  return {
    risk_score: riskScore,
    risk_level: riskLevel,
    risk_drivers: riskDrivers,
  };
}
