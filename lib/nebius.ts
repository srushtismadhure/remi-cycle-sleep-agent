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

  return {
    summary: isLutealDownshift
      ? "Tonight may be a high-friction sleep night, so REMi is preparing a slower, cooler wind-down."
      : `${template.name} gives tonight a calm, low-effort path toward rest.`,
    protocol_name: template.name,
    duration_minutes: template.duration_minutes,
    start_time: "9:40 PM",
    breathing_pattern: isLutealDownshift
      ? "4-second inhale, 7-second slow exhale"
      : "4-second inhale, 6-second slow exhale",
    haptic_pattern: isLutealDownshift
      ? "gentle slow exhale pulses"
      : "soft even breathing pulses",
    protocol_steps: [
      "Lower the lights and set the room a little cooler.",
      "Put your phone into sleep focus and step away from bright content.",
      "Follow six rounds of the slow exhale rhythm.",
      "Finish with a brief body scan from jaw to shoulders to hands.",
    ],
    reminder_text: `${template.name} begins at 9:40 PM. Keep tonight soft and unhurried.`,
    safety_note: SAFETY_NOTE,
  };
}
