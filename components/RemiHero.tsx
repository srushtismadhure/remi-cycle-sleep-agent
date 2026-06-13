"use client";

import { motion } from "framer-motion";
import { ArrowRight, LoaderCircle } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { MoonOrb } from "@/components/MoonOrb";
import type { REMiRiskLevel } from "@/lib/types";

interface RemiHeroProps {
  ctaLabel: string;
  ctaLoadingLabel?: string;
  errorMessage?: string;
  isCtaLoading?: boolean;
  isCtaDisabled?: boolean;
  onCta: () => void;
  riskLevel?: REMiRiskLevel;
}

export function RemiHero({
  ctaLabel,
  ctaLoadingLabel = "Reading tonight's signals...",
  errorMessage,
  isCtaLoading = false,
  isCtaDisabled = false,
  onCta,
  riskLevel = "low",
}: RemiHeroProps) {
  return (
    <section className="remi-hero relative min-h-[100svh] overflow-hidden">
      <div className="hero-celestial" aria-hidden="true">
        <div className="hero-nebula hero-nebula-one" />
        <div className="hero-nebula hero-nebula-two" />
        <div className="hero-star-field hero-star-field-far" />
        <div className="hero-star-field hero-star-field-near" />
        <div className="hero-grain" />
        <div className="hero-vignette" />
      </div>

      <AppHeader variant="dark" showMenu />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.25, delay: 0.12, ease: "easeOut" }}
        className="hero-moon-stage pointer-events-none absolute z-[2]"
      >
        <MoonOrb riskLevel={riskLevel} />
      </motion.div>

      <div className="hero-content relative z-10 mx-auto flex min-h-[calc(100svh-92px)] w-full max-w-7xl items-end px-5 pb-8 pt-[40vh] sm:px-8 sm:pb-12 sm:pt-[44vh] lg:items-center lg:px-10 lg:pb-20 lg:pt-4">
        <div className="w-full max-w-[46rem] lg:max-w-[43rem]">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.68, delay: 0.18 }}
            className="hero-kicker mb-5 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[#e7c8d6] sm:text-xs"
          >
            CYCLE-AWARE &bull; SIGNAL-DRIVEN &bull; BUILT FOR WOMEN&apos;S
            BIOLOGY
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.92, delay: 0.24, ease: "easeOut" }}
            className="hero-headline max-w-[8.5ch] text-[clamp(3.25rem,14vw,5.7rem)] font-semibold leading-[0.84] tracking-[-0.065em] text-[#f8f5ff] sm:text-[clamp(4.25rem,12vw,6.6rem)] lg:max-w-[9ch] lg:text-[clamp(6rem,8.8vw,8.8rem)]"
          >
            <span className="block">Rhythm.</span>
            <span className="block">Rest.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.42 }}
            className="mt-5 max-w-[31rem] text-[1rem] leading-[1.55] text-[#e3d8ea] sm:mt-6 sm:text-[1.08rem] lg:text-[1.24rem]"
          >
            Sleep support designed for women&apos;s biology.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.78, delay: 0.5 }}
            className="hero-body-copy mt-4 max-w-[35rem] text-[0.92rem] leading-[1.75] text-[#bfaecc] sm:text-[0.97rem] lg:text-[1.02rem]"
          >
            REMi interprets hormonal rhythms, recovery signals, and cycle
            patterns to personalize how you wind down each night.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.62 }}
            className="mt-7 flex items-center gap-4 sm:mt-9"
          >
            <button
              type="button"
              onClick={onCta}
              disabled={isCtaDisabled || isCtaLoading}
              aria-busy={isCtaLoading}
              className="hero-cta group flex min-h-14 items-center justify-center gap-4 rounded-2xl px-6 text-sm font-semibold tracking-[0.02em] text-[#f8f5ff] transition duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 sm:px-8"
            >
              <span className="relative flex items-center justify-center whitespace-nowrap">
                <span
                  className={`flex items-center gap-4 transition-opacity duration-200 ${
                    isCtaLoading ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <span>{ctaLabel}</span>
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
                {isCtaLoading ? (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 px-1">
                    <LoaderCircle size={16} className="animate-spin" />
                    <span className="truncate">{ctaLoadingLabel}</span>
                  </span>
                ) : null}
              </span>
            </button>
          </motion.div>
          {errorMessage ? (
            <p className="mt-4 text-sm text-[#efb0c7]">{errorMessage}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
