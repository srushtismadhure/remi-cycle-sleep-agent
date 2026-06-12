"use client";

import { motion } from "framer-motion";

interface CardShellProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function CardShell({
  children,
  className = "",
  delay = 0,
}: CardShellProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ type: "spring", stiffness: 95, damping: 20, delay }}
      className={`glass-card rounded-[28px] ${className}`}
    >
      {children}
    </motion.section>
  );
}
