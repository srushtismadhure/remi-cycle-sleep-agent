export type REMiRiskLevel = "low" | "medium" | "high";
export type REMiHapticMode = "Calm Drift" | "Soft Wave" | "Deep Downshift";
export type REMiRecommendationConfidence = "low" | "medium" | "high";
export type REMiRecommendationBasis =
  | "similar synthetic cases"
  | "deterministic fallback";

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

export interface REMiBodyStateContext {
  affect_state?: string;
  appetite_0_5?: number;
  bloating_0_5?: number;
  cramps_0_5?: number;
  cycle_day?: number;
  cycle_phase?: string;
  estrogen_e3g_ng_mL?: number;
  fatigue_0_5?: number;
  fitbit_sleep_score_0_100?: number;
  headaches_0_5?: number;
  hrv_delta_from_baseline?: number;
  hrv_relative_label?: string;
  lh_mIU_mL?: number;
  minutes_asleep?: number;
  mood_swing_0_5?: number;
  pdg_ug_mL?: number;
  resting_hr_delta_from_baseline?: number;
  resting_hr_relative_label?: string;
  restlessness_score?: number;
  sleep_debt_hours?: number;
  sleep_debt_label?: string;
  sleep_efficiency_pct?: number;
  sleep_issue_0_5?: number;
  sleep_risk_score_0_100?: number;
  skin_temperature_delta_c?: number;
  skin_temperature_relative_label?: string;
  stress_0_10?: number;
}

export interface RemiTonightResult {
  bodyState: REMiBodyStateContext;
  demoRecord?: REMiDemoRecord;
  riskProfile: REMiRiskProfile;
  signals: REMiSignals;
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

export interface REMiWaveRecommendation {
  sleep_friction_score: number;
  friction_level: "Low" | "Medium" | "High";
  haptic_mode: REMiHapticMode;
  breath_rhythm_per_min: number;
  haptic_pulse_per_min: number;
  haptic_duration_min: number;
  haptic_intensity: "Low" | "Low–Medium" | "Medium";
  drivers: string[];
  spot_message: string;
  moon_body_summary: string;
  confidence: REMiRecommendationConfidence;
  matched_case_count: number;
  similarity_summary: string;
  recommendation_basis: REMiRecommendationBasis;
}

export interface REMiSimilarCasePreview {
  hapticMode: REMiHapticMode;
  recordId: string;
  similarityScore: number;
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

export interface REMiDemoRecord {
  day_in_study?: number;
  record_key: string;
  source: "synthetic";
  study_interval?: string;
  synthetic_date: string;
  user_id: string;
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
  bodyState?: REMiBodyStateContext;
  demoRecord?: REMiDemoRecord;
  signals: REMiSignals;
  riskProfile: REMiRiskProfile;
  plan: REMiSleepPlan;
  recommendation?: REMiWaveRecommendation;
  recommendationBasis?: string;
  disclosure?: string;
  matches?: REMiSimilarCasePreview[];
  evidence: REMiEvidenceItem[];
  actions: REMiAction[];
  voiceNote: REMiVoiceNote;
  completedSteps: string[];
}
