"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";

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

const heroCraters = [
  { left: "12%", top: "20%", size: "15%", opacity: 0.58, blur: "0.2px", rotate: "-8deg" },
  { left: "28%", top: "12%", size: "6%", opacity: 0.38, blur: "0.5px", rotate: "12deg" },
  { left: "45%", top: "18%", size: "10%", opacity: 0.5, blur: "0px", rotate: "-4deg" },
  { left: "64%", top: "13%", size: "5%", opacity: 0.34, blur: "0.6px", rotate: "9deg" },
  { left: "74%", top: "24%", size: "13%", opacity: 0.56, blur: "0.15px", rotate: "5deg" },
  { left: "20%", top: "42%", size: "7%", opacity: 0.44, blur: "0.35px", rotate: "15deg" },
  { left: "35%", top: "35%", size: "4%", opacity: 0.28, blur: "0.7px", rotate: "-12deg" },
  { left: "49%", top: "40%", size: "17%", opacity: 0.5, blur: "0.25px", rotate: "7deg" },
  { left: "68%", top: "45%", size: "5%", opacity: 0.35, blur: "0.5px", rotate: "-7deg" },
  { left: "82%", top: "48%", size: "8%", opacity: 0.42, blur: "0.3px", rotate: "11deg" },
  { left: "9%", top: "60%", size: "5%", opacity: 0.3, blur: "0.7px", rotate: "-3deg" },
  { left: "24%", top: "65%", size: "12%", opacity: 0.54, blur: "0.2px", rotate: "9deg" },
  { left: "41%", top: "72%", size: "6%", opacity: 0.38, blur: "0.5px", rotate: "-10deg" },
  { left: "56%", top: "61%", size: "4%", opacity: 0.28, blur: "0.8px", rotate: "4deg" },
  { left: "65%", top: "69%", size: "15%", opacity: 0.48, blur: "0.35px", rotate: "-6deg" },
  { left: "80%", top: "71%", size: "5%", opacity: 0.32, blur: "0.65px", rotate: "14deg" },
  { left: "35%", top: "52%", size: "3.5%", opacity: 0.32, blur: "0.55px", rotate: "2deg" },
  { left: "58%", top: "29%", size: "3%", opacity: 0.3, blur: "0.75px", rotate: "-8deg" },
] as const;

export function MoonOrb({
  riskLevel = "low",
  size = "hero",
}: MoonOrbProps) {
  const config = riskMotion[riskLevel];
  const reduceMotion = useReducedMotion();

  if (size === "hero") {
    return (
      <motion.div
        className="hero-moon-shell relative aspect-square"
        animate={
          reduceMotion
            ? { y: 0, rotate: 0, scale: 1 }
            : {
                y: [0, -4, 0],
                rotate: [-0.35, 0.35, -0.35],
                scale: [1, 1.01, 1],
              }
        }
        transition={
          reduceMotion
            ? undefined
            : {
                duration: 18,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
              }
        }
        aria-label="Detailed glowing moon"
        role="img"
      >
        <motion.div
          className="hero-moon-halo absolute -inset-[7%] rounded-full"
          animate={
            reduceMotion
              ? { scale: 1, opacity: 0.56 }
              : {
                  scale: [0.98, 1.035, 0.98],
                  opacity: [0.48, 0.68, 0.48],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 6.2,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }
          }
        />
        <div className="hero-moon-rim absolute inset-[1.5%] rounded-full" />
        <div className="hero-moon-surface absolute inset-[3%] overflow-hidden rounded-full">
          <div className="hero-moon-drift-layer absolute -inset-[4%]">
            <div className="hero-maria-layer absolute inset-0">
              <div className="hero-maria hero-maria-one" />
              <div className="hero-maria hero-maria-two" />
              <div className="hero-maria hero-maria-three" />
              <div className="hero-maria hero-maria-four" />
              <div className="hero-maria hero-maria-five" />
              <div className="hero-maria hero-maria-six" />
            </div>
            <div className="hero-crater-field absolute inset-0">
              {heroCraters.map((crater, index) => (
                <div
                  key={`${crater.left}-${crater.top}`}
                  className={`hero-crater ${
                    index === 7 || index === 14 ? "hero-crater-deep" : ""
                  }`}
                  style={
                    {
                      left: crater.left,
                      top: crater.top,
                      width: crater.size,
                      height: crater.size,
                      opacity: crater.opacity,
                      filter: `blur(${crater.blur})`,
                      transform: `rotate(${crater.rotate})`,
                    } satisfies CSSProperties
                  }
                />
              ))}
            </div>
            <div className="hero-moon-roughness absolute inset-0" />
          </div>
          <div className="hero-moon-light absolute inset-0 rounded-full" />
          <div className="hero-moon-grain absolute inset-0 rounded-full" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative grid h-[154px] w-[154px] place-items-center sm:h-[180px] sm:w-[180px]"
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
