"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  CalendarCheck2,
  Check,
  DatabaseZap,
  FileHeart,
  Headphones,
  ScanHeart,
  Sparkles,
} from "lucide-react";

const stages = [
  { label: "Your Signals", note: "Wearable + cycle context", icon: ScanHeart },
  { label: "Reading Patterns", note: "Putting tonight in context", icon: DatabaseZap },
  { label: "Sleep Outlook", note: "Understanding possible friction", icon: BrainCircuit },
  { label: "Personal Plan", note: "Shaping your wind-down", icon: Sparkles },
  { label: "Helpful Context", note: "Checking the guidance", icon: FileHeart },
  { label: "Evening Setup", note: "Preparing your routine", icon: CalendarCheck2 },
  { label: "Voice Note", note: "Writing a gentle note", icon: Headphones },
  { label: "Tonight's Plan", note: "Bringing it together", icon: Check },
] as const;

interface AgentTimelineProps {
  active: boolean;
  complete?: boolean;
}

export function AgentTimeline({
  active,
  complete = false,
}: AgentTimelineProps) {
  const [activeStep, setActiveStep] = useState(active ? 0 : -1);

  useEffect(() => {
    if (!active) {
      setActiveStep(-1);
      return;
    }

    setActiveStep(0);
    const timer = window.setInterval(() => {
      setActiveStep((current) => {
        if (current >= stages.length - 1) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 520);

    return () => window.clearInterval(timer);
  }, [active]);

  useEffect(() => {
    if (complete) setActiveStep(stages.length - 1);
  }, [complete]);

  return (
    <div className="glass-card mx-auto w-full max-w-3xl rounded-[30px] p-5 sm:p-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Your nightly plan</p>
          <h2 className="display-font mt-1 text-2xl">Reading your night</h2>
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={complete ? "ready" : "working"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] ${
              complete
                ? "bg-[#e4eee7] text-[#567361]"
                : "bg-[#eee8f4] text-[#75638b]"
            }`}
          >
            {complete ? "Plan ready" : "In motion"}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="grid gap-x-7 sm:grid-cols-2">
        {stages.map(({ label, note, icon: Icon }, index) => {
          const isDone = index < activeStep || complete;
          const isCurrent = index === activeStep && !complete;
          const isReached = index <= activeStep || complete;

          return (
            <motion.div
              key={label}
              initial={{ opacity: 0.32 }}
              animate={{
                opacity: isReached ? 1 : 0.32,
                y: isCurrent ? -2 : 0,
              }}
              transition={{ duration: 0.35 }}
              className="relative flex min-h-[70px] gap-3"
            >
              <div className="relative flex w-9 shrink-0 justify-center">
                {index < stages.length - 1 && (
                  <div className="absolute bottom-0 top-8 w-px overflow-hidden bg-[#ddd4e4]">
                    {isDone && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        transition={{ duration: 0.38 }}
                        className="w-full bg-gradient-to-b from-[#9d89b8] to-[#b8a7c9]"
                      />
                    )}
                  </div>
                )}
                <motion.div
                  animate={
                    isCurrent
                      ? {
                          boxShadow: [
                            "0 0 0 0 rgba(147,126,174,.18)",
                            "0 0 0 9px rgba(147,126,174,0)",
                          ],
                        }
                      : {}
                  }
                  transition={{
                    duration: 1.4,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border ${
                    isDone
                      ? "border-[#a5bea9] bg-[#e5efe8] text-[#5d7c66]"
                      : isCurrent
                        ? "border-[#9d88b5] bg-[#eee8f4] text-plum"
                        : "border-[#ddd6e1] bg-white/55 text-[#aaa1af]"
                  }`}
                >
                  {isDone ? <Check size={13} /> : <Icon size={13} />}
                </motion.div>
              </div>
              <div className="pt-0.5">
                <p className="text-[13px] font-semibold text-ink">{label}</p>
                <p className="mt-1 text-[10px] text-[#8a8390]">{note}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
