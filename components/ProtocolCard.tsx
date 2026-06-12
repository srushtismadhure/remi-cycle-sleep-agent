"use client";

import { Bell, Clock3, Hand, Sparkles, Wind } from "lucide-react";

import { CardShell } from "@/components/CardShell";
import type { REMiSleepPlan } from "@/lib/types";

interface ProtocolCardProps {
  plan: REMiSleepPlan;
}

export function ProtocolCard({ plan }: ProtocolCardProps) {
  return (
    <CardShell
      className="overflow-hidden bg-[linear-gradient(145deg,rgba(79,68,105,.94),rgba(108,89,137,.9))] p-6 text-white sm:p-8"
      delay={0.08}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/56">
            Your protocol
          </p>
          <h2 className="display-font mt-2 text-[2.35rem] leading-none">
            {plan.protocol_name}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
            {plan.summary}
          </p>
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10">
          <Sparkles size={18} />
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3">
        <div className="rounded-[20px] border border-white/10 bg-white/[0.08] p-4">
          <Clock3 size={16} className="text-[#d7c7e5]" />
          <p className="mt-3 text-lg font-semibold">{plan.start_time}</p>
          <p className="text-xs text-white/55">{plan.duration_minutes} minutes</p>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-white/[0.08] p-4">
          <Wind size={16} className="text-[#d7c7e5]" />
          <p className="mt-3 text-sm font-semibold leading-snug">
            Slow exhale
          </p>
          <p className="mt-1 text-xs leading-relaxed text-white/55">
            {plan.breathing_pattern}
          </p>
        </div>
      </div>

      <div className="mt-7 space-y-4">
        {plan.protocol_steps.map((step, index) => (
          <div key={step} className="flex items-start gap-3.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-[11px] font-semibold text-white/75">
              {index + 1}
            </span>
            <p className="pt-0.5 text-sm leading-relaxed text-white/78">{step}</p>
          </div>
        ))}
      </div>

      <div className="my-6 h-px bg-white/10" />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex gap-3 rounded-[18px] bg-black/[0.08] p-4">
          <Hand size={16} className="mt-0.5 shrink-0 text-[#d7c7e5]" />
          <div>
            <p className="text-xs font-semibold text-white/88">Haptic rhythm</p>
            <p className="mt-1 text-xs leading-relaxed text-white/52">
              {plan.haptic_pattern}
            </p>
          </div>
        </div>
        <div className="flex gap-3 rounded-[18px] bg-black/[0.08] p-4">
          <Bell size={16} className="mt-0.5 shrink-0 text-[#d7c7e5]" />
          <div>
            <p className="text-xs font-semibold text-white/88">Reminder</p>
            <p className="mt-1 text-xs leading-relaxed text-white/52">
              {plan.reminder_text}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-[10px] leading-relaxed text-white/38">
        {plan.safety_note}
      </p>
    </CardShell>
  );
}
