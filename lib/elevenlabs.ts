import type {
  REMiRiskProfile,
  REMiSleepPlan,
  REMiVoiceNote,
} from "@/lib/types";

export function generateVoiceNote(
  plan: REMiSleepPlan,
  riskProfile: REMiRiskProfile,
): REMiVoiceNote {
  return {
    voice_note_title: "A quiet note for tonight",
    voice_note_script: `Tonight looks like a ${riskProfile.risk_level}-friction sleep night. Your ${plan.protocol_name} starts at ${plan.start_time}. Dim the lights, cool the room, and follow the slow exhale rhythm.`,
    fake_audio_url: null,
    status: "mock_generated",
  };
}
