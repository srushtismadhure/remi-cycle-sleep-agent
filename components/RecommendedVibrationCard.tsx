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
import { formatVibrationDuration } from "@/lib/vibration/vibrationPatterns";
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

export function RecommendedVibrationCard({
  dailyData,
}: RecommendedVibrationCardProps) {
  const [selectedMockDay, setSelectedMockDay] = useState<MockDayKey>(
    getMockDayKey(dailyData),
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [supportStatus, setSupportStatus] = useState<
    "checking" | "supported" | "unsupported"
  >("checking");
  const stopTimeoutRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const selectedDailyData =
    MOCK_DAY_OPTIONS.find(({ key }) => key === selectedMockDay)?.data ?? dailyData;
  const recommendation = useMemo(
    () => selectDailyVibration(selectedDailyData),
    [selectedDailyData],
  );
  const hasPlayablePattern = recommendation.pattern.pattern.length > 0;
  const canPlay = hasPlayablePattern;
  const isUnsupported = supportStatus === "unsupported";
  const dailyScore = clampDailyScore(selectedDailyData.dailyScore);
  const sessionDurationMs = recommendation.pattern.estimatedDurationMs;
  const sessionProgress =
    sessionDurationMs > 0
      ? Math.max(0, Math.min(1, elapsedMs / sessionDurationMs))
      : 0;
  const cycleCountLabel =
    recommendation.pattern.repeatCount === 1
      ? "1 cycle"
      : `${recommendation.pattern.repeatCount} cycles`;

  const clearStopTimeout = useCallback(() => {
    if (stopTimeoutRef.current !== null) {
      window.clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
  }, []);

  const clearProgressInterval = useCallback(() => {
    if (progressIntervalRef.current !== null) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const startProgressTracking = useCallback(
    (durationMs: number) => {
      clearProgressInterval();
      setElapsedMs(0);

      const startedAt = window.performance.now();

      progressIntervalRef.current = window.setInterval(() => {
        const nextElapsed = Math.min(
          durationMs,
          Math.round(window.performance.now() - startedAt),
        );

        setElapsedMs(nextElapsed);

        if (nextElapsed >= durationMs) {
          clearProgressInterval();
        }
      }, 120);
    },
    [clearProgressInterval],
  );

  const handleStop = useCallback(() => {
    clearStopTimeout();
    clearProgressInterval();
    stopVibration();
    setIsPlaying(false);
    setElapsedMs(0);
  }, [clearProgressInterval, clearStopTimeout]);

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

    const durationMs = recommendation.pattern.estimatedDurationMs;

    clearStopTimeout();
    clearProgressInterval();
    stopVibration();

    if (supportStatus !== "unsupported") {
      const didStart = playVibration(recommendation.pattern);

      if (!didStart) {
        setSupportStatus("unsupported");
      }
    }

    setIsPlaying(true);
    startProgressTracking(durationMs);

    stopTimeoutRef.current = window.setTimeout(() => {
      clearProgressInterval();
      stopVibration();
      setIsPlaying(false);
      setElapsedMs(durationMs);
      stopTimeoutRef.current = null;
    }, durationMs + 120);
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
        <>
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
          <div
            className={`recommended-vibration-session ${
              isPlaying ? "recommended-vibration-session-active" : ""
            }`}
          >
            <div className="recommended-vibration-session-top">
              <div>
                <p className="recommended-vibration-session-kicker">
                  Session preview
                </p>
                <p className="recommended-vibration-session-duration">
                  {formatVibrationDuration(sessionDurationMs)}
                </p>
              </div>
              <p className="recommended-vibration-session-cycles">
                {cycleCountLabel}
              </p>
            </div>
            <div className="recommended-vibration-session-wave" aria-hidden="true">
              <svg
                className="recommended-vibration-session-wave-svg"
                viewBox="0 0 520 84"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,50 C38,50 52,25 92,25 C132,25 144,60 187,60 C230,60 246,34 289,34 C330,34 344,58 387,58 C430,58 443,27 480,27 C497,27 510,35 520,41"
                  fill="none"
                  stroke="rgba(244, 200, 224, 0.68)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M0,56 C38,56 52,33 92,33 C132,33 144,66 187,66 C230,66 246,43 289,43 C330,43 344,63 387,63 C430,63 443,37 480,37 C497,37 510,43 520,48 L520,84 L0,84 Z"
                  fill="rgba(211, 171, 214, 0.12)"
                />
              </svg>
              <span
                className="recommended-vibration-session-wave-glow"
                style={{
                  left: `calc(${sessionProgress * 100}% - 1.1rem)`,
                  opacity: isPlaying || elapsedMs === sessionDurationMs ? 1 : 0,
                }}
              />
            </div>
            <div
              className="recommended-vibration-session-progress"
              aria-hidden="true"
            >
              <span
                className="recommended-vibration-session-progress-fill"
                style={{ width: `${sessionProgress * 100}%` }}
              />
            </div>
            <p className="recommended-vibration-session-status" aria-live="polite">
              {isPlaying
                ? isUnsupported
                  ? "Visual-only session running. This device does not support browser vibration."
                  : "Pulse session running. Stop Pulse ends it immediately."
                : "The wave and session progress stay aligned with the full haptic runtime."}
            </p>
          </div>
        </>
      ) : null}

      {isUnsupported && hasPlayablePattern ? (
        <p className="recommended-vibration-note recommended-vibration-note-warning">
          Physical vibration is not supported on this browser or device. REMi will
          keep the visual wave active for the full session instead.
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
