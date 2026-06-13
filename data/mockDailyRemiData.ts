export type MockDailyRemiData = {
  userId: string;
  date: string;
  dailyScore: number;
  riskLevel: "low" | "medium" | "high";
  dataMode: "wearable_only" | "wearable_plus_subjective";
  wearable: {
    hrvMs: number;
    restingHeartRateBpm: number;
    skinTemperatureDeltaC: number;
    sleepDebtHours: number;
    wearableStressScore: number;
    previousSleepScore: number;
    cyclePhase: "menstrual" | "follicular" | "ovulation" | "luteal";
  };
  subjective?: {
    stress0To5: number;
    fatigue0To5: number;
    sleepDifficulty0To5: number;
    restlessness0To5: number;
    selectedTags: string[];
  };
};

export const highRiskMockDay: MockDailyRemiData = {
  userId: "demo_user_001",
  date: "2026-06-12",
  dailyScore: 82,
  riskLevel: "high",
  dataMode: "wearable_plus_subjective",
  wearable: {
    hrvMs: 31,
    restingHeartRateBpm: 76,
    skinTemperatureDeltaC: 0.6,
    sleepDebtHours: 2.8,
    wearableStressScore: 78,
    previousSleepScore: 61,
    cyclePhase: "luteal",
  },
  subjective: {
    stress0To5: 4,
    fatigue0To5: 4,
    sleepDifficulty0To5: 4,
    restlessness0To5: 4,
    selectedTags: ["Wired", "Anxious", "Restless", "Hot / warm"],
  },
};

export const mediumRiskMockDay: MockDailyRemiData = {
  userId: "demo_user_001",
  date: "2026-06-13",
  dailyScore: 57,
  riskLevel: "medium",
  dataMode: "wearable_only",
  wearable: {
    hrvMs: 43,
    restingHeartRateBpm: 69,
    skinTemperatureDeltaC: 0.3,
    sleepDebtHours: 1.4,
    wearableStressScore: 58,
    previousSleepScore: 72,
    cyclePhase: "luteal",
  },
};

export const lowRiskMockDay: MockDailyRemiData = {
  userId: "demo_user_001",
  date: "2026-06-14",
  dailyScore: 24,
  riskLevel: "low",
  dataMode: "wearable_plus_subjective",
  wearable: {
    hrvMs: 62,
    restingHeartRateBpm: 59,
    skinTemperatureDeltaC: -0.1,
    sleepDebtHours: 0.3,
    wearableStressScore: 29,
    previousSleepScore: 86,
    cyclePhase: "follicular",
  },
  subjective: {
    stress0To5: 1,
    fatigue0To5: 1,
    sleepDifficulty0To5: 1,
    restlessness0To5: 0,
    selectedTags: ["Calm"],
  },
};

export const MOCK_DAILY_REMI_DAYS = {
  high: highRiskMockDay,
  medium: mediumRiskMockDay,
  low: lowRiskMockDay,
} as const;
