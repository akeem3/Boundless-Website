"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  HERO_HEADLINE,
  HERO_SUBHEAD,
  HERO_CTA_TEXT,
  HERO_COMING_SOON,
} from "@/lib/constants/copy";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

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

export function HeroSection({ tournamentTitle }: { tournamentTitle: string | null }) {
  const prefersReduced = usePrefersReducedMotion();
  const saveData = useSaveData();
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const shouldPlayVideo = !prefersReduced && !saveData && inView;

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-[55svh] sm:min-h-[80svh] overflow-hidden"
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
      <div className="absolute inset-0 bg-[var(--hero-overlay)]/82" />

      {/* Content - positioned vertically centered, slightly below */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-[800px] mt-10 sm:mt-24 md:mt-32 mx-auto sm:mx-0 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 sm:mb-6 leading-tight">
              {HERO_HEADLINE}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-secondary mb-6 sm:mb-8 max-w-[600px] mx-auto sm:mx-0">
              {HERO_SUBHEAD}
            </p>
            <div className="flex flex-col items-center sm:items-start gap-3 sm:gap-4">
              <Link
                href="#tournaments"
                className={buttonVariants({ variant: "default", size: "xl" })}
              >
                {HERO_CTA_TEXT}
              </Link>
              <p className="text-xs sm:text-sm text-foreground">
                {tournamentTitle ? `Next up: ${tournamentTitle}` : HERO_COMING_SOON}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
