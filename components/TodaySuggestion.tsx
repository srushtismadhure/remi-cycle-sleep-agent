"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Brain,
  HeartPulse,
  MoonStar,
  Waves,
} from "lucide-react";

import { RecommendedVibrationCard } from "@/components/RecommendedVibrationCard";
import { highRiskMockDay } from "@/data/mockDailyRemiData";
import { getHapticProtocol } from "@/lib/getHapticProtocol";
import type { REMiAgentResult } from "@/lib/types";

interface TodaySuggestionProps {
  result: REMiAgentResult;
}

function labelPhase(phase: string) {
  return phase
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function TodaySuggestion({ result }: TodaySuggestionProps) {
  const { demoRecord, plan, riskProfile, signals } = result;
  const liveRecommendation = result.recommendation;
  const haptic = liveRecommendation
    ? {
        name: liveRecommendation.haptic_mode,
        breathRatePerMinute: liveRecommendation.breath_rhythm_per_min,
        pulseRatePerMinute: liveRecommendation.haptic_pulse_per_min,
        durationMinutes: liveRecommendation.haptic_duration_min,
        intensity: liveRecommendation.haptic_intensity,
      }
    : getHapticProtocol(riskProfile.risk_level);
  const frictionScore = liveRecommendation
    ? liveRecommendation.sleep_friction_score
    : Math.min(10, Math.max(0, riskProfile.risk_score));
  const frictionPercent = `${(frictionScore / 10) * 100}%`;
  const frictionLabel = liveRecommendation
    ? `${liveRecommendation.friction_level} friction`
    : riskProfile.risk_level === "high"
      ? "High friction"
      : riskProfile.risk_level === "medium"
        ? "Moderate friction"
        : "Low friction";
  const supportCopy =
    liveRecommendation?.drivers[0] ??
    riskProfile.risk_drivers[0] ??
    "Tonight's signals look relatively steady.";
  const metrics = [
    {
      icon: MoonStar,
      title: labelPhase(signals.estimated_cycle_phase),
      value: `Day ${signals.cycle_day}`,
    },
    {
      icon: HeartPulse,
      title: "HRV",
      value: `${signals.hrv_rmssd} ms`,
    },
    {
      icon: Activity,
      title: "Resting HR",
      value: `${signals.resting_hr} bpm`,
    },
    {
      icon: Brain,
      title: "Stress",
      value: `${signals.stress_score}/10`,
    },
  ];

  return (
    <section className="suggestion-section px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="section-kicker">Today&apos;s suggestion</p>
          <h2 className="display-font mt-3 text-[clamp(2.6rem,6vw,4.7rem)] leading-none text-ink">
            A plan, just for tonight.
          </h2>
          <p className="section-kicker mt-4">Synthetic demonstration data</p>
          {demoRecord ? (
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#8f8393]">
              {demoRecord.user_id} • {demoRecord.synthetic_date} •{" "}
              {demoRecord.record_key}
            </p>
          ) : null}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="suggestion-card relative mt-12 overflow-hidden rounded-[2.25rem] px-5 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-8 lg:px-10"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(({ icon: Icon, title, value }) => (
              <div key={title} className="metric-chip">
                <span className="metric-chip-icon">
                  <Icon size={16} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-0.5 text-xs text-[#8b8190]">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-9 grid gap-10 border-t border-[#eee5ea] pt-9 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <div className="lg:border-r lg:border-[#eee5ea] lg:pr-14">
              <p className="section-kicker text-left">Sleep friction score</p>
              <p className="display-font mt-3 text-6xl leading-none text-[#4b365b]">
                {frictionScore}
                <span className="text-3xl text-[#9c8ca4]">/10</span>
              </p>
              <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-[#f2e8ed]">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: frictionPercent }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.25, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[#e990b2] via-[#eeaac2] to-[#d78caf]"
                />
              </div>
              <p className="mt-3 text-sm font-semibold text-[#b06582]">
                {frictionLabel}
              </p>
              <p className="mt-5 max-w-sm text-[1.05rem] leading-relaxed text-[#615867]">
                {supportCopy}
              </p>
            </div>

            <div className="relative min-w-0 lg:pr-28">
              <p className="section-kicker text-left">Suggested haptic</p>
              <div className="mt-4 flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#f4e8f2] text-[#836397]">
                  <Waves size={23} strokeWidth={1.7} />
                </span>
                <h3 className="display-font text-4xl text-ink">{haptic.name}</h3>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                {[
                  ["Breath rhythm", `${haptic.breathRatePerMinute} breaths/min`],
                  ["Haptic pulse", `${haptic.pulseRatePerMinute} beats/min`],
                  ["Duration", `${haptic.durationMinutes} min`],
                  ["Intensity", haptic.intensity],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9a8e9f]">
                      {label}
                    </p>
                    <p className="mt-2 text-xs font-semibold leading-snug text-[#514957]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="soft-waveform mt-7" aria-hidden="true">
                <svg viewBox="0 0 520 90" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="softWaveFill" x1="0" x2="1">
                      <stop offset="0%" stopColor="#f4bfd0" stopOpacity="0.16" />
                      <stop offset="50%" stopColor="#d7b8ea" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#efacc5" stopOpacity="0.18" />
                    </linearGradient>
                    <linearGradient id="softWaveStroke" x1="0" x2="1">
                      <stop offset="0%" stopColor="#e9a5bd" />
                      <stop offset="52%" stopColor="#b99bd5" />
                      <stop offset="100%" stopColor="#e89bb9" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,52 C48,52 55,24 96,24 C139,24 145,66 190,66 C232,66 245,35 286,35 C330,35 337,58 378,58 C421,58 438,31 475,31 C493,31 507,40 520,46 L520,90 L0,90 Z"
                    fill="url(#softWaveFill)"
                  />
                  <path
                    d="M0,52 C48,52 55,24 96,24 C139,24 145,66 190,66 C232,66 245,35 286,35 C330,35 337,58 378,58 C421,58 438,31 475,31 C493,31 507,40 520,46"
                    fill="none"
                    stroke="url(#softWaveStroke)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-[#615867]">
                {liveRecommendation?.moon_body_summary ?? plan.summary}
              </p>
            </div>
          </div>

          <div className="mt-10 border-t border-[#eee5ea] pt-8">
            <RecommendedVibrationCard dailyData={highRiskMockDay} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
