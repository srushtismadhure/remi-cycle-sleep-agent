"use client";

import { motion } from "framer-motion";

import type { REMiRiskLevel } from "@/lib/types";

interface MoonOrbProps {
  riskLevel?: REMiRiskLevel;
  size?: "hero" | "compact";
}

const riskMotion = {
  low: {
    duration: 6.8,
    scale: [1, 1.035, 1],
    glow: "rgba(189, 172, 219, 0.34)",
    tint: "rgba(248, 224, 226, 0.28)",
  },
  medium: {
    duration: 5.2,
    scale: [1, 1.045, 1],
    glow: "rgba(174, 151, 207, 0.42)",
    tint: "rgba(239, 202, 207, 0.34)",
  },
  high: {
    duration: 4.1,
    scale: [0.99, 1.04, 0.99],
    glow: "rgba(183, 148, 177, 0.38)",
    tint: "rgba(220, 174, 173, 0.4)",
  },
};

export function MoonOrb({
  riskLevel = "low",
  size = "hero",
}: MoonOrbProps) {
  const config = riskMotion[riskLevel];
  const dimensions =
    size === "hero"
      ? "h-[300px] w-[300px] sm:h-[360px] sm:w-[360px]"
      : "h-[154px] w-[154px] sm:h-[180px] sm:w-[180px]";

  return (
    <motion.div
      className={`relative grid place-items-center ${dimensions}`}
      animate={{ y: [0, -7, 0], rotate: [-0.8, 0.8, -0.8] }}
      transition={{
        duration: 8,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
      }}
      aria-label={`${riskLevel} sleep-friction moon`}
      role="img"
    >
      <motion.div
        className="absolute inset-[2%] rounded-full blur-2xl"
        animate={{
          scale: [0.92, 1.12, 0.92],
          opacity: [0.5, 0.86, 0.5],
        }}
        transition={{
          duration: config.duration,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
        }}
        style={{
          background: `radial-gradient(circle, ${config.glow}, transparent 68%)`,
        }}
      />
      <motion.div
        className="orb-texture absolute inset-[8%] overflow-hidden rounded-full"
        animate={{ scale: config.scale }}
        transition={{
          duration: config.duration,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
        }}
      >
        <div
          className="absolute inset-0 rounded-[inherit]"
          style={{
            background: `radial-gradient(circle at 65% 70%, ${config.tint}, transparent 52%)`,
          }}
        />
        <div className="lunar-crater left-[17%] top-[24%] h-[17%] w-[17%]" />
        <div className="lunar-crater right-[18%] top-[17%] h-[11%] w-[11%] opacity-65" />
        <div className="lunar-crater bottom-[22%] left-[26%] h-[12%] w-[12%] opacity-55" />
        <div className="lunar-crater bottom-[16%] right-[22%] h-[19%] w-[19%] opacity-40" />
        <div className="lunar-mark left-[42%] top-[38%] h-[9%] w-[21%] -rotate-12" />
        <div className="lunar-mark bottom-[34%] right-[36%] h-[7%] w-[14%] rotate-[18deg] opacity-55" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_28%_25%,rgba(255,255,255,.55),transparent_30%),linear-gradient(115deg,transparent_48%,rgba(93,72,119,.13)_100%)]" />
      </motion.div>
      <motion.div
        className="absolute left-[20%] top-[17%] h-[16%] w-[25%] rounded-full bg-white/45 blur-lg"
        animate={{ opacity: [0.25, 0.62, 0.25] }}
        transition={{
          duration: config.duration + 1,
          repeat: Number.POSITIVE_INFINITY,
        }}
      />
      <div className="absolute bottom-[3%] h-[8%] w-[54%] rounded-full bg-[#8f7ba8]/20 blur-xl" />
    </motion.div>
  );
}
