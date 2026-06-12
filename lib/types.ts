export type REMiRiskLevel = "low" | "medium" | "high";

export interface REMiSignals {
  date: string;
  estimated_cycle_phase: string;
  cycle_day: number;
  hrv_rmssd: number;
  baseline_hrv_rmssd: number;
  resting_hr: number;
  baseline_resting_hr: number;
  skin_temp_delta_c: number;
  sleep_debt_hours: number;
  stress_score: number;
  cramps: boolean;
  prior_sleep_quality: string;
  optional_health_context?: {
    source: string;
    sleep_relevant_context?: string[];
    notes?: string;
  };
}

export interface REMiRiskProfile {
  risk_score: number;
  risk_level: REMiRiskLevel;
  risk_drivers: string[];
}

export interface REMiSleepPlan {
  summary: string;
  protocol_name: string;
  duration_minutes: number;
  start_time: string;
  breathing_pattern: string;
  haptic_pattern: string;
  protocol_steps: string[];
  reminder_text: string;
  safety_note: string;
}

export interface REMiEvidenceItem {
  title: string;
  summary: string;
  source_type: "mock" | "tavily";
}

export interface REMiAction {
  label: string;
  status: "completed" | "drafted" | "mocked";
  detail: string;
}

export interface REMiVoiceNote {
  voice_note_title: string;
  voice_note_script: string;
  fake_audio_url: string | null;
  status: "mock_generated";
}

export interface REMiUser {
  user_id: string;
  display_name: string;
  timezone: string;
  preferred_wind_down_time: string;
  voice_enabled: boolean;
  reminder_enabled: boolean;
}

export interface REMiAgentResult {
  signals: REMiSignals;
  riskProfile: REMiRiskProfile;
  plan: REMiSleepPlan;
  evidence: REMiEvidenceItem[];
  actions: REMiAction[];
  voiceNote: REMiVoiceNote;
  completedSteps: string[];
}
