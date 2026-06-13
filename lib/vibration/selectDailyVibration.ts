import type { MockDailyRemiData } from "@/data/mockDailyRemiData";

import {
  VIBRATION_PATTERNS,
  type VibrationPatternDefinition,
} from "@/lib/vibration/vibrationPatterns";

export type DailyVibrationRecommendation = {
  pattern: VibrationPatternDefinition;
  reason: string;
  source: "daily_score_rule";
};

function clampDailyScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

function hasSelectedTag(dailyData: MockDailyRemiData, tag: string) {
  return (
    dailyData.subjective?.selectedTags.some(
      (selectedTag) => selectedTag.toLowerCase() === tag.toLowerCase(),
    ) ?? false
  );
}

export function selectDailyVibration(
  dailyData: MockDailyRemiData,
): DailyVibrationRecommendation {
  const dailyScore = clampDailyScore(dailyData.dailyScore);
  const restlessness = dailyData.subjective?.restlessness0To5 ?? 0;

  if (hasSelectedTag(dailyData, "Calm") && dailyScore < 35) {
    return {
      pattern: VIBRATION_PATTERNS.no_vibration,
      reason: "Your signals look calm tonight, so REMi is not suggesting vibration.",
      source: "daily_score_rule",
    };
  }

  if (hasSelectedTag(dailyData, "Structured breathing")) {
    return {
      pattern: VIBRATION_PATTERNS.calm_drift,
      reason:
        "You selected structured breathing, so tonight's session uses a slow, even rhythm.",
      source: "daily_score_rule",
    };
  }

  if (dailyScore >= 70) {
    return {
      pattern: VIBRATION_PATTERNS.deep_downshift,
      reason:
        restlessness >= 4 || hasSelectedTag(dailyData, "Restless")
          ? "Your REMi daily score is elevated and tonight looks physically restless, so REMi is using its longest, most gradual downshift."
          : "Your REMi daily score is elevated, so tonight's session uses REMi's deepest, slowest downshift rhythm.",
      source: "daily_score_rule",
    };
  }

  if (dailyScore >= 40) {
    return {
      pattern: VIBRATION_PATTERNS.calm_drift,
      reason:
        "Your REMi daily score suggests a moderate wind-down need, so tonight's session uses a slow, balanced drift.",
      source: "daily_score_rule",
    };
  }

  return {
    pattern: VIBRATION_PATTERNS.soft_wave,
    reason:
      "Your signals look relatively steady tonight, so only a light, spacious soft wave is suggested.",
    source: "daily_score_rule",
  };
}
