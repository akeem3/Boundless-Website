"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Reveal({ children, delay = 0, className, style }: RevealProps) {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <motion.div
      className={className}
      style={style}
      initial={
        prefersReduced ? { opacity: 0 } : { y: 24, opacity: 0, filter: "blur(6px)" }
      }
      whileInView={
        prefersReduced ? { opacity: 1 } : { y: 0, opacity: 1, filter: "blur(0px)" }
      }
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: prefersReduced ? 0 : 0.5,
        ease: [0.16, 1, 0.3, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
