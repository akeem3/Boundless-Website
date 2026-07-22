"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Easing } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import {
  HERO_HEADLINE,
  HERO_SUBHEAD,
  HERO_CTA_TEXT,
  HERO_COMING_SOON,
} from "@/lib/constants/copy";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useCinema } from "@/lib/cinema-context";

function useSaveData(): boolean {
  const [saveData, setSaveData] = useState(() => {
    if (typeof navigator === "undefined") return false;
    if (!("connection" in navigator)) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (navigator as any).connection?.saveData ?? false;
  });

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    if (!("connection" in navigator)) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conn = (navigator as any).connection;
    if (!conn) return;

    const handler = () => setSaveData(conn.saveData ?? false);
    conn.addEventListener("change", handler);
    return () => conn.removeEventListener("change", handler);
  }, []);

  return saveData;
}

const DURATION = 0.5;
const EASE: Easing = [0.16, 1, 0.3, 1];

export function HeroSection({ tournamentTitle }: { tournamentTitle: string | null }) {
  const prefersReduced = usePrefersReducedMotion();
  const saveData = useSaveData();
  const [inView, setInView] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { cinemaMode, toggleCinema } = useCinema();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReduced) {
      setEntranceDone(true);
      return;
    }
    const timer = setTimeout(() => setEntranceDone(true), 1100);
    return () => clearTimeout(timer);
  }, [prefersReduced]);

  const shouldPlayVideo = !prefersReduced && !saveData && inView;
  const canAnimate = !prefersReduced;

  const entranceInitial = canAnimate ? { y: 24, opacity: 0, filter: "blur(6px)" } : false;

  const entranceVisible = { y: 0, opacity: 1, filter: "blur(0px)" };

  const entranceCinema = { y: 0, opacity: 0 };

  const entranceT = (delay: number) => ({
    duration: canAnimate ? DURATION : 0,
    ease: EASE,
    delay: cinemaMode || entranceDone ? 0 : delay,
  });

  const handleClick = (e: React.MouseEvent) => {
    if (!entranceDone) return;
    const target = e.target as HTMLElement;
    if (target.closest("a, button, [role='button']")) return;
    toggleCinema();
  };

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-[55svh] sm:min-h-[80svh] overflow-hidden"
      onClick={handleClick}
    >
      {/* Poster — always rendered, is LCP element */}
      <Image
        src="/hero-poster.svg"
        alt="Boundless FC futsal community"
        fill
        priority
        className="object-cover"
      />

      {/* Video — only mounts when in view and allowed */}
      {shouldPlayVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/video/hero-vid.mp4" type="video/mp4" />
        </video>
      )}

      {/* Dark overlay */}
      <motion.div
        className="absolute inset-0 bg-[var(--hero-overlay)]/82"
        animate={cinemaMode ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: canAnimate ? 0.4 : 0, ease: EASE }}
      />

      {/* Content */}
      <motion.div
        className="absolute inset-x-0 top-0 z-10 flex items-center"
        animate={cinemaMode ? { y: 80, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: canAnimate ? 0.4 : 0, ease: EASE }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-[800px] mt-10 sm:mt-24 md:mt-32 mx-auto sm:mx-0 text-center sm:text-left">
            <motion.h1
              initial={entranceInitial}
              animate={cinemaMode ? entranceCinema : entranceVisible}
              transition={entranceT(0.15)}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 sm:mb-6 leading-tight"
            >
              {HERO_HEADLINE}
            </motion.h1>
            <motion.p
              initial={entranceInitial}
              animate={cinemaMode ? entranceCinema : entranceVisible}
              transition={entranceT(0.25)}
              className="text-base sm:text-lg md:text-xl text-secondary mb-6 sm:mb-8 max-w-[600px] mx-auto sm:mx-0"
            >
              {HERO_SUBHEAD}
            </motion.p>
            <div className="flex flex-col items-center sm:items-start gap-3 sm:gap-4">
              <motion.div
                initial={entranceInitial}
                animate={cinemaMode ? entranceCinema : entranceVisible}
                transition={entranceT(0.35)}
              >
                <Link
                  href="#tournaments"
                  className={buttonVariants({ variant: "default", size: "xl" })}
                >
                  {HERO_CTA_TEXT}
                </Link>
              </motion.div>
              <motion.p
                initial={entranceInitial}
                animate={cinemaMode ? entranceCinema : entranceVisible}
                transition={entranceT(0.45)}
                className="text-xs sm:text-sm text-foreground"
              >
                {tournamentTitle ? `Next up: ${tournamentTitle}` : HERO_COMING_SOON}
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
