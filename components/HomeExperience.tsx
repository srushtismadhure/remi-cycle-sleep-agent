"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { MoonOrb } from "@/components/MoonOrb";
import { ResultsView } from "@/components/ResultsView";
import { SignalWaves } from "@/components/SignalWaves";
import type { REMiAgentResult } from "@/lib/types";

type RunState = "idle" | "running" | "complete" | "error";

export function HomeExperience() {
  const [runState, setRunState] = useState<RunState>("idle");
  const [result, setResult] = useState<REMiAgentResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function runTonightPlan() {
    setRunState("running");
    setResult(null);

    try {
      const [response] = await Promise.all([
        fetch("/api/run-agent", { method: "POST" }),
        new Promise((resolve) => window.setTimeout(resolve, 900)),
      ]);

      if (!response.ok) throw new Error("REMi could not prepare your plan.");

      const payload = (await response.json()) as REMiAgentResult;
      setResult(payload);
      setRunState("complete");

      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    } catch {
      setRunState("error");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AppHeader />

      <section className="relative mx-auto flex min-h-[calc(100vh-86px)] w-full max-w-6xl flex-col items-center px-5 pb-16 pt-4 text-center sm:px-8 lg:grid lg:grid-cols-[1.05fr_.95fr] lg:text-left">
        <div className="relative z-10 order-2 max-w-xl lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-white/80 bg-white/45 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#766b84] backdrop-blur lg:mx-0"
          >
            <Sparkles size={12} />
            Your body has a bedtime story
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, delay: 0.08 }}
            className="display-font text-[3.5rem] leading-[0.93] text-ink sm:text-[4.5rem] lg:text-[5.25rem]"
          >
            Meet tonight
            <br />
            <span className="italic text-[#8a72a0]">where you are.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-lg text-[15px] leading-[1.8] text-[#6f6976] sm:text-base lg:mx-0"
          >
            A cycle-aware sleep guide that turns body signals into bedtime
            actions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start"
          >
            <button
              type="button"
              onClick={runTonightPlan}
              disabled={runState === "running"}
              className="primary-button group flex min-h-14 items-center justify-center gap-3 rounded-full px-7 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-80"
            >
              {runState === "running" ? "REMi is reading tonight" : "Run tonight's plan"}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
            <div className="flex items-center gap-2 pt-0 text-[11px] text-[#8d8691] sm:pt-5">
              <LockKeyhole size={12} />
              Synthetic demo data only
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.15 }}
          className="relative order-1 mb-4 grid min-h-[370px] place-items-center sm:min-h-[440px] lg:order-2 lg:mb-0"
        >
          <div className="absolute h-[350px] w-[350px] rounded-full border border-white/45 sm:h-[500px] sm:w-[500px]" />
          <div className="absolute h-[290px] w-[290px] rounded-full border border-white/55 sm:h-[410px] sm:w-[410px]" />
          <MoonOrb riskLevel={result?.riskProfile.risk_level ?? "low"} />
          <div className="absolute -bottom-1 left-1/2 w-[350px] -translate-x-1/2 sm:w-[520px]">
            <SignalWaves compact />
          </div>
          <div className="glass-card absolute right-0 top-[21%] hidden rounded-[18px] px-4 py-3 text-left sm:block lg:-right-4">
            <p className="section-label text-[9px]">Signal</p>
            <p className="mt-1 text-xs font-semibold">Recovery is asking</p>
            <p className="text-[10px] text-[#8b8490]">for a softer landing.</p>
          </div>
          <div className="glass-card absolute bottom-[14%] left-0 hidden rounded-[18px] px-4 py-3 text-left sm:block lg:-left-2">
            <p className="section-label text-[9px]">Tonight</p>
            <p className="mt-1 text-xs font-semibold">Late luteal</p>
            <p className="text-[10px] text-[#8b8490]">Cycle day 23</p>
          </div>
        </motion.div>

      </section>

      {runState === "error" && (
        <div className="mx-auto mb-10 max-w-3xl rounded-2xl bg-[#f7e8e8] p-4 text-center text-sm text-[#8b5d64]">
          REMi could not prepare the plan. Please try the demo again.
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.section
            ref={resultRef}
            initial={{ opacity: 0, y: 45, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="mx-auto w-full max-w-3xl scroll-mt-8 px-5 pb-28 pt-8 sm:px-8"
          >
            <div className="mb-10 text-center">
              <p className="eyebrow">Tonight's plan is ready</p>
              <h2 className="display-font mt-3 text-4xl sm:text-5xl">
                Your softer landing.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#766f7c]">
                REMi translated your synthetic body signals into a clear,
                actionable evening.
              </p>
            </div>
            <ResultsView result={result} />
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
