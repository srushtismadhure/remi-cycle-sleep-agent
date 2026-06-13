"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { REMiSignals } from "@/lib/types";

interface BodyRhythmProps {
  signals: REMiSignals;
}

const legend = [
  { label: "LH", color: "#aa8fc8" },
  { label: "FSH", color: "#a9c9e3" },
  { label: "Estrogen", color: "#e99ab9" },
  { label: "Progesterone", color: "#e2b86f" },
];

export function BodyRhythm({ signals }: BodyRhythmProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="rhythm-section relative overflow-hidden px-5 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-24">
      <div className="rhythm-stars" aria-hidden="true" />
      <div className="rhythm-haze" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl text-center">
        <motion.div
          className="rhythm-moon mx-auto"
          animate={
            reduceMotion
              ? undefined
              : { y: [0, -8, 0], scale: [1, 1.025, 1] }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 9,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }
          }
          aria-hidden="true"
        />
        <p className="section-kicker mt-5">Moon &amp; body rhythm</p>
        <h2 className="display-font mx-auto mt-3 max-w-4xl text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] text-[#41324f]">
          Your rhythm is in a warmer, slower phase tonight.
        </h2>
      </div>

      <div className="rhythm-landscape relative z-10 mx-auto mt-10 max-w-[90rem]">
        <svg
          viewBox="0 0 1440 520"
          preserveAspectRatio="none"
          className="h-[330px] w-full sm:h-[430px] lg:h-[500px]"
          aria-label="Estimated hormone rhythm landscape for cycle day 23"
          role="img"
        >
          <defs>
            <linearGradient id="waveLavender" x1="0" x2="1">
              <stop offset="0%" stopColor="#cab7e4" stopOpacity="0.26" />
              <stop offset="52%" stopColor="#aa8fc8" stopOpacity="0.58" />
              <stop offset="100%" stopColor="#d9c9eb" stopOpacity="0.22" />
            </linearGradient>
            <linearGradient id="waveBlue" x1="0" x2="1">
              <stop offset="0%" stopColor="#c8deec" stopOpacity="0.18" />
              <stop offset="60%" stopColor="#a9c9e3" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#dbe9f2" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="wavePink" x1="0" x2="1">
              <stop offset="0%" stopColor="#f4bdcf" stopOpacity="0.25" />
              <stop offset="48%" stopColor="#e99ab9" stopOpacity="0.66" />
              <stop offset="100%" stopColor="#f6cedb" stopOpacity="0.22" />
            </linearGradient>
            <linearGradient id="waveGold" x1="0" x2="1">
              <stop offset="0%" stopColor="#f3d7a7" stopOpacity="0.16" />
              <stop offset="70%" stopColor="#e2b86f" stopOpacity="0.46" />
              <stop offset="100%" stopColor="#f6dfb8" stopOpacity="0.18" />
            </linearGradient>
            <filter id="waveBlur">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          <motion.path
            d="M0,350 C150,280 250,300 390,350 C545,407 655,385 790,286 C950,170 1085,190 1235,285 C1320,338 1385,345 1440,310 L1440,520 L0,520 Z"
            fill="url(#waveLavender)"
            animate={reduceMotion ? undefined : { d: [
              "M0,350 C150,280 250,300 390,350 C545,407 655,385 790,286 C950,170 1085,190 1235,285 C1320,338 1385,345 1440,310 L1440,520 L0,520 Z",
              "M0,340 C150,300 260,285 400,345 C540,405 665,372 800,278 C955,172 1090,206 1230,294 C1320,350 1388,334 1440,302 L1440,520 L0,520 Z",
              "M0,350 C150,280 250,300 390,350 C545,407 655,385 790,286 C950,170 1085,190 1235,285 C1320,338 1385,345 1440,310 L1440,520 L0,520 Z",
            ] }}
            transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,400 C170,340 285,360 430,395 C580,430 700,390 840,325 C980,260 1090,255 1230,340 C1320,395 1388,390 1440,360 L1440,520 L0,520 Z"
            fill="url(#waveBlue)"
            animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
            transition={{ duration: 13, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,430 C120,370 260,375 390,430 C520,485 690,430 820,350 C970,258 1100,290 1220,380 C1310,448 1385,425 1440,395 L1440,520 L0,520 Z"
            fill="url(#wavePink)"
            animate={reduceMotion ? undefined : { x: [0, 9, 0] }}
            transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,468 C175,420 300,438 455,470 C620,503 745,450 870,386 C1025,306 1140,343 1260,415 C1340,465 1395,462 1440,438 L1440,520 L0,520 Z"
            fill="url(#waveGold)"
            animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <path
            d="M0,350 C150,280 250,300 390,350 C545,407 655,385 790,286 C950,170 1085,190 1235,285 C1320,338 1385,345 1440,310"
            fill="none"
            stroke="rgba(255,255,255,.36)"
            strokeWidth="2"
            filter="url(#waveBlur)"
          />

        </svg>

        <div className="rhythm-marker" aria-hidden="true">
          <span>Day {signals.cycle_day}</span>
          <i />
          <b />
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-2 flex max-w-3xl flex-wrap justify-center gap-x-7 gap-y-3">
        {legend.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs font-semibold text-[#6f6377]">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>
      <p className="relative z-10 mt-5 text-center text-[11px] text-[#84798a]">
        Hormone patterns are estimates and may vary.
      </p>
    </section>
  );
}
