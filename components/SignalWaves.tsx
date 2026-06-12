"use client";

import { motion } from "framer-motion";

interface SignalWavesProps {
  compact?: boolean;
}

const waves = [
  {
    color: "linear-gradient(90deg, rgba(159,205,190,.14), rgba(155,214,221,.46), rgba(159,205,190,.08))",
    top: "14%",
    rotate: -4,
    duration: 8,
  },
  {
    color: "linear-gradient(90deg, rgba(205,179,222,.08), rgba(177,151,210,.48), rgba(237,193,207,.18))",
    top: "36%",
    rotate: 3,
    duration: 10,
  },
  {
    color: "linear-gradient(90deg, rgba(242,189,200,.05), rgba(240,192,201,.42), rgba(181,213,210,.16))",
    top: "58%",
    rotate: -2,
    duration: 9,
  },
];

export function SignalWaves({ compact = false }: SignalWavesProps) {
  return (
    <div
      className={`pointer-events-none relative overflow-hidden ${
        compact ? "h-24" : "h-40 sm:h-52"
      }`}
      aria-hidden="true"
    >
      {waves.map((wave, index) => (
        <motion.div
          key={wave.top}
          className="absolute -left-[16%] h-[30%] w-[132%] rounded-[50%] blur-xl"
          style={{
            top: wave.top,
            background: wave.color,
            rotate: wave.rotate,
          }}
          animate={{
            x: index % 2 === 0 ? ["-3%", "4%", "-3%"] : ["3%", "-4%", "3%"],
            scaleY: [0.82, 1.18, 0.82],
            borderRadius: [
              "50% 40% 55% 43%",
              "43% 58% 41% 56%",
              "50% 40% 55% 43%",
            ],
          }}
          transition={{
            duration: wave.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
      <div className="absolute inset-x-[15%] top-[39%] h-8 rounded-full bg-white/50 blur-2xl" />
    </div>
  );
}
