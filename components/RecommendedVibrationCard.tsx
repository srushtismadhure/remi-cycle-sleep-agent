"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PauseCircle, Smartphone, Sparkles, Waves } from "lucide-react";

import {
  MOCK_DAILY_REMI_DAYS,
  type MockDailyRemiData,
} from "@/data/mockDailyRemiData";
import { selectDailyVibration } from "@/lib/vibration/selectDailyVibration";
import {
  isVibrationSupported,
  playVibration,
  stopVibration,
} from "@/lib/vibration/vibrationEngine";

interface RecommendedVibrationCardProps {
  dailyData: MockDailyRemiData;
}

const MOCK_DAY_OPTIONS = [
  { key: "high", label: "High-risk mock day", data: MOCK_DAILY_REMI_DAYS.high },
  {
    key: "medium",
    label: "Medium-risk mock day",
    data: MOCK_DAILY_REMI_DAYS.medium,
  },
  { key: "low", label: "Low-risk mock day", data: MOCK_DAILY_REMI_DAYS.low },
] as const;

type MockDayKey = (typeof MOCK_DAY_OPTIONS)[number]["key"];

function clampDailyScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

function getMockDayKey(dailyData: MockDailyRemiData): MockDayKey {
  return (
    MOCK_DAY_OPTIONS.find(
      ({ data }) =>
        data.date === dailyData.date && data.userId === dailyData.userId,
    )?.key ?? "high"
  );
}

function getDataModeLabel(dailyData: MockDailyRemiData) {
  return dailyData.dataMode === "wearable_plus_subjective"
    ? "Wearable data + subjective check-in"
    : "Wearable data only";
}

function getTotalPatternDuration(pattern: number[]) {
  return pattern.reduce((total, duration) => total + duration, 0);
}

export function RecommendedVibrationCard({
  dailyData,
}: RecommendedVibrationCardProps) {
  const [selectedMockDay, setSelectedMockDay] = useState<MockDayKey>(
    getMockDayKey(dailyData),
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [supportStatus, setSupportStatus] = useState<
    "checking" | "supported" | "unsupported"
  >("checking");
  const stopTimeoutRef = useRef<number | null>(null);

  const selectedDailyData =
    MOCK_DAY_OPTIONS.find(({ key }) => key === selectedMockDay)?.data ?? dailyData;
  const recommendation = useMemo(
    () => selectDailyVibration(selectedDailyData),
    [selectedDailyData],
  );
  const hasPlayablePattern = recommendation.pattern.pattern.length > 0;
  const canPlay = hasPlayablePattern && supportStatus === "supported";
  const isUnsupported = supportStatus === "unsupported";
  const dailyScore = clampDailyScore(selectedDailyData.dailyScore);

  const clearStopTimeout = useCallback(() => {
    if (stopTimeoutRef.current !== null) {
      window.clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
  }, []);

  const handleStop = useCallback(() => {
    clearStopTimeout();
    stopVibration();
    setIsPlaying(false);
  }, [clearStopTimeout]);

  useEffect(() => {
    setSelectedMockDay(getMockDayKey(dailyData));
  }, [dailyData]);

  useEffect(() => {
    setSupportStatus(isVibrationSupported() ? "supported" : "unsupported");
  }, []);

  useEffect(() => {
    handleStop();
  }, [handleStop, selectedMockDay]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        handleStop();
      }
    }

    window.addEventListener("pagehide", handleStop);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleStop);
      handleStop();
    };
  }, [handleStop]);

  function handlePlay() {
    if (!canPlay) {
      return;
    }

    const didStart = playVibration(recommendation.pattern.pattern);

    if (!didStart) {
      setIsPlaying(false);
      return;
    }

    clearStopTimeout();
    setIsPlaying(true);

    stopTimeoutRef.current = window.setTimeout(() => {
      setIsPlaying(false);
      stopTimeoutRef.current = null;
    }, getTotalPatternDuration(recommendation.pattern.pattern) + 120);
  }

  return (
    <div className="recommended-vibration-card">
      <div className="recommended-vibration-header">
        <div>
          <p className="recommended-vibration-kicker">Tonight's vibration</p>
          <h3 className="display-font recommended-vibration-title">
            {recommendation.pattern.id === "no_vibration"
              ? "No vibration is recommended tonight."
              : recommendation.pattern.name}
          </h3>
        </div>
        <span
          className={`recommended-vibration-risk recommended-vibration-risk-${selectedDailyData.riskLevel}`}
        >
          {selectedDailyData.riskLevel} risk
        </span>
      </div>

      <div
        className="recommended-vibration-selector"
        role="tablist"
        aria-label="Select mock REMi day"
      >
        {MOCK_DAY_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={selectedMockDay === key}
            className={`recommended-vibration-selector-button ${
              selectedMockDay === key
                ? "recommended-vibration-selector-button-active"
                : ""
            }`}
            onClick={() => setSelectedMockDay(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="recommended-vibration-score-row">
        <div>
          <p className="recommended-vibration-score-label">Daily REMi score</p>
          <p className="recommended-vibration-score">
            {dailyScore}
            <span>/100</span>
          </p>
        </div>
        <div className="recommended-vibration-meta">
          <span>
            <Smartphone size={14} aria-hidden="true" />
            {getDataModeLabel(selectedDailyData)}
          </span>
          <span>
            <Sparkles size={14} aria-hidden="true" />
            Based on local daily-score rules
          </span>
        </div>
      </div>

      <p className="recommended-vibration-reason">
        {recommendation.pattern.id === "no_vibration"
          ? "Your signals look calm."
          : recommendation.reason}
      </p>

      {recommendation.pattern.id !== "no_vibration" ? (
        <div className="recommended-vibration-pattern">
          <span className="recommended-vibration-pattern-icon">
            <Waves size={18} strokeWidth={1.8} />
          </span>
          <div>
            <p className="recommended-vibration-pattern-name">
              {recommendation.pattern.name}
            </p>
            <p className="recommended-vibration-pattern-description">
              {recommendation.pattern.description}
            </p>
          </div>
        </div>
      ) : null}

      {isUnsupported && hasPlayablePattern ? (
        <p className="recommended-vibration-note recommended-vibration-note-warning">
          Physical vibration is not supported on this browser or device.
        </p>
      ) : null}

      {hasPlayablePattern ? (
        <div className="recommended-vibration-actions">
          <button
            type="button"
            className="recommended-vibration-play"
            disabled={!canPlay}
            onClick={handlePlay}
          >
            Pulse
          </button>
          <button
            type="button"
            className="recommended-vibration-stop"
            disabled={!isPlaying}
            onClick={handleStop}
          >
            <PauseCircle size={16} aria-hidden="true" />
            Stop Pulse
          </button>
        </div>
      ) : (
        <p className="recommended-vibration-note">
          No vibration is recommended tonight. Your signals look calm.
        </p>
      )}
    </div>
  );
}
