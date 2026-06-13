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

  if (hasSelectedTag(dailyData, "Structured breathing")) {
    return {
      pattern: VIBRATION_PATTERNS.box_breathing,
      reason:
        "You selected structured breathing, so tonight's vibration uses an even guided rhythm.",
      source: "daily_score_rule",
    };
  }

  if (dailyScore >= 70) {
    if (restlessness >= 4 || hasSelectedTag(dailyData, "Restless")) {
      return {
        pattern: VIBRATION_PATTERNS.grounding_pulse,
        reason:
          "Your REMi daily score is elevated and tonight looks physically restless, so REMi is using a grounding pulse.",
        source: "daily_score_rule",
      };
    }

    return {
      pattern: VIBRATION_PATTERNS.slow_exhale,
      reason:
        "Your REMi daily score is elevated, so tonight's vibration uses a gentle longer-exhale rhythm.",
      source: "daily_score_rule",
    };
  }

  if (dailyScore >= 40) {
    return {
      pattern: VIBRATION_PATTERNS.lunar_breathing,
      reason:
        "Your REMi daily score suggests a moderate wind-down need, so tonight's vibration uses a gentle breathing rhythm.",
      source: "daily_score_rule",
    };
  }

  if (hasSelectedTag(dailyData, "Calm")) {
    return {
      pattern: VIBRATION_PATTERNS.no_vibration,
      reason: "Your signals look calm tonight, so REMi is not suggesting vibration.",
      source: "daily_score_rule",
    };
  }

  return {
    pattern: VIBRATION_PATTERNS.soft_pulse,
    reason:
      "Your signals look relatively calm tonight, so only a very gentle settling pulse is suggested.",
    source: "daily_score_rule",
  };
}
