"use client";

import {
  Activity,
  CloudMoon,
  Droplets,
  FlameKindling,
  HeartPulse,
  Thermometer,
} from "lucide-react";

import { CardShell } from "@/components/CardShell";
import { SignalWaves } from "@/components/SignalWaves";
import type { REMiSignals } from "@/lib/types";

interface TonightCardProps {
  signals: REMiSignals;
}

function labelPhase(phase: string) {
  return phase
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function TonightCard({ signals }: TonightCardProps) {
  const metrics = [
    {
      icon: HeartPulse,
      label: "HRV",
      value: `${signals.hrv_rmssd} ms`,
      detail: `${signals.baseline_hrv_rmssd} baseline`,
    },
    {
      icon: Activity,
      label: "Resting HR",
      value: `${signals.resting_hr} bpm`,
      detail: `${signals.baseline_resting_hr} baseline`,
    },
    {
      icon: Thermometer,
      label: "Skin temp",
      value: `+${signals.skin_temp_delta_c.toFixed(2)}°`,
      detail: "from baseline",
    },
    {
      icon: CloudMoon,
      label: "Sleep debt",
      value: `${signals.sleep_debt_hours} hrs`,
      detail: "recent load",
    },
    {
      icon: FlameKindling,
      label: "Stress",
      value: `${signals.stress_score}/10`,
      detail: "self-reported",
    },
    {
      icon: Droplets,
      label: "Comfort",
      value: signals.cramps ? "Cramps" : "Comfortable",
      detail: "optional input",
    },
  ];

  return (
    <CardShell className="relative overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-x-0 bottom-0 opacity-75">
        <SignalWaves compact />
      </div>
      <div className="relative">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Body signals</p>
            <h2 className="display-font mt-2 text-[2rem] leading-none text-ink">
              Your night, in context
            </h2>
          </div>
          <div className="rounded-full border border-white/80 bg-white/55 px-3 py-2 text-right shadow-sm backdrop-blur">
            <p className="text-xs font-semibold text-plum">
              {labelPhase(signals.estimated_cycle_phase)}
            </p>
            <p className="mt-0.5 text-[10px] text-[#837c8c]">
              Cycle day {signals.cycle_day}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {metrics.map(({ icon: Icon, label, value, detail }) => (
            <div
              key={label}
              className="rounded-[20px] border border-white/70 bg-white/45 p-3.5 backdrop-blur-sm"
            >
              <div className="mb-3 flex items-center gap-2 text-[#8b7d9d]">
                <Icon size={14} strokeWidth={1.8} />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                  {label}
                </span>
              </div>
              <p className="text-[15px] font-semibold text-ink">{value}</p>
              <p className="mt-0.5 text-[10px] text-[#87818d]">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}
