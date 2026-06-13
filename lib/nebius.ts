import { selectProtocol } from "@/lib/protocolBuilder";
import type {
  REMiRiskProfile,
  REMiSignals,
  REMiSleepPlan,
} from "@/lib/types";

const SAFETY_NOTE =
  "REMi is a wellness prototype and does not provide medical advice, diagnosis, or treatment.";

export function generateSleepPlan(
  riskProfile: REMiRiskProfile,
  signals: REMiSignals,
): REMiSleepPlan {
  const template = selectProtocol(riskProfile, signals);
  const isLutealDownshift = template.name === "Luteal Downshift";
  const severeStress = signals.stress_score >= 9;
  const elevatedSleepPressure = signals.sleep_debt_hours >= 2.4;
  const hasCheckInContext = Boolean(
    signals.optional_health_context?.notes?.includes("Check-in"),
  );
  const shouldDeepenPlan = severeStress || elevatedSleepPressure;
  const startTime =
    hasCheckInContext && shouldDeepenPlan ? "9:20 PM" : "9:40 PM";
  const durationMinutes =
    hasCheckInContext && shouldDeepenPlan
      ? template.duration_minutes + 4
      : template.duration_minutes;

  return {
    summary:
      hasCheckInContext && shouldDeepenPlan
        ? "Your check-in pushed tonight toward a deeper reset, so REMi is preparing a slower, earlier wind-down."
        : isLutealDownshift
          ? "Tonight may be a high-friction sleep night, so REMi is preparing a slower, cooler wind-down."
          : `${template.name} gives tonight a calm, low-effort path toward rest.`,
    protocol_name: template.name,
    duration_minutes: durationMinutes,
    start_time: startTime,
    breathing_pattern:
      hasCheckInContext && severeStress
        ? "4-second inhale, 8-second slow exhale"
        : isLutealDownshift
          ? "4-second inhale, 7-second slow exhale"
          : "4-second inhale, 6-second slow exhale",
    haptic_pattern:
      hasCheckInContext && shouldDeepenPlan
        ? "deeper slow exhale pulses"
        : isLutealDownshift
          ? "gentle slow exhale pulses"
          : "soft even breathing pulses",
    protocol_steps: [
      hasCheckInContext && signals.cramps
        ? "Lower the lights, keep the room a little cooler, and set up warmth or extra pillow support."
        : "Lower the lights and set the room a little cooler.",
      hasCheckInContext && severeStress
        ? "Step away from notifications early and give yourself a quieter buffer before bed."
        : "Put your phone into sleep focus and step away from bright content.",
      hasCheckInContext && elevatedSleepPressure
        ? "Follow eight rounds of the slower exhale rhythm instead of rushing through the transition."
        : "Follow six rounds of the slow exhale rhythm.",
      "Finish with a brief body scan from jaw to shoulders to hands.",
    ],
    reminder_text: `${template.name} begins at ${startTime}. Keep tonight soft and unhurried.`,
    safety_note: SAFETY_NOTE,
  };
}
