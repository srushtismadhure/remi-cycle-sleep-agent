"use client";

import { BookOpenText } from "lucide-react";

import { CardShell } from "@/components/CardShell";
import type { REMiEvidenceItem } from "@/lib/types";

interface EvidenceCardProps {
  evidence: REMiEvidenceItem[];
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
  return (
    <CardShell className="p-6 sm:p-8" delay={0.12}>
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eee8f4] text-plum">
          <BookOpenText size={18} />
        </div>
        <div>
          <p className="eyebrow">Why this plan</p>
          <h2 className="display-font mt-2 text-[2rem] leading-none">
            Grounded, gently.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#716b78]">
            Mock evidence adds context to REMi's wellness recommendations.
          </p>
        </div>
      </div>

      <div className="mt-7 divide-y divide-[#e9e2eb]">
        {evidence.map((item) => (
          <article key={item.title} className="py-5 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
              <span className="rounded-full bg-[#f0edf2] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#83778c]">
                {item.source_type}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#77717e]">
              {item.summary}
            </p>
          </article>
        ))}
      </div>
    </CardShell>
  );
}
