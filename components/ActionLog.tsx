"use client";

import { Check, CircleDashed } from "lucide-react";

import { CardShell } from "@/components/CardShell";
import type { REMiAction } from "@/lib/types";

interface ActionLogProps {
  actions: REMiAction[];
}

export function ActionLog({ actions }: ActionLogProps) {
  return (
    <CardShell className="p-6 sm:p-8" delay={0.16}>
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">Made real</p>
          <h2 className="display-font mt-2 text-[2rem] leading-none">
            Bedtime, handled.
          </h2>
        </div>
        <span className="text-xs font-medium text-[#8b8490]">
          {actions.length} actions
        </span>
      </div>

      <div className="mt-7 space-y-3">
        {actions.map((action) => {
          const isCompleted = action.status === "completed";
          return (
            <div
              key={action.label}
              className="flex gap-3.5 rounded-[20px] border border-white/80 bg-white/46 p-4"
            >
              <span
                className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                  isCompleted
                    ? "bg-[#e5efe8] text-[#5d7e68]"
                    : "bg-[#eee9f3] text-[#76658a]"
                }`}
              >
                {isCompleted ? <Check size={15} /> : <CircleDashed size={15} />}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{action.label}</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#9a929f]">
                    {action.status}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#77717e]">
                  {action.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}
