"use client";

import { Sparkles } from "lucide-react";

import { CardShell } from "@/components/CardShell";
import type { REMiRiskProfile } from "@/lib/types";

interface RiskCardProps {
  riskProfile: REMiRiskProfile;
}

const riskStyles = {
  low: {
    label: "Low friction",
    badge: "bg-[#e8f1eb] text-[#53725d]",
    bar: "from-[#a8c6b1] to-[#c9dbce]",
  },
  medium: {
    label: "Medium friction",
    badge: "bg-[#f3eadf] text-[#8b694a]",
    bar: "from-[#d4b994] to-[#e6d5b9]",
  },
  high: {
    label: "High friction",
    badge: "bg-[#f5e4e5] text-[#8d5d68]",
    bar: "from-[#bf8e9c] to-[#d9abb1]",
  },
};

export function RiskCard({ riskProfile }: RiskCardProps) {
  const style = riskStyles[riskProfile.risk_level];
  const percentage = Math.min(100, riskProfile.risk_score * 10);

  return (
    <CardShell className="p-6 sm:p-8" delay={0.04}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Tonight's outlook</p>
          <h2 className="display-font mt-2 text-[2rem] leading-none">
            A softer night may help.
          </h2>
        </div>
        <span
          className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold ${style.badge}`}
        >
          {style.label}
        </span>
      </div>

      <div className="mt-7">
        <div className="mb-2 flex items-end justify-between">
          <span className="text-xs text-[#7d7685]">Sleep-friction score</span>
          <span className="display-font text-3xl text-plum">
            {riskProfile.risk_score}
            <span className="ml-1 text-sm text-[#9d96a5]">/ 10</span>
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#eee8f0]">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${style.bar}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="soft-divider my-6" />

      <div className="space-y-3">
        {riskProfile.risk_drivers.map((driver) => (
          <div key={driver} className="flex gap-3 text-sm leading-relaxed">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f0eaf5] text-plum">
              <Sparkles size={12} />
            </span>
            <p className="text-[#5f5b68]">{driver}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs leading-relaxed text-[#8c8692]">
        This is a wellness estimate built from synthetic demo signals, not a
        medical assessment.
      </p>
    </CardShell>
  );
}
