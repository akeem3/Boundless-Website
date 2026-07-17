"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  HERO_HEADLINE,
  HERO_SUBHEAD,
  HERO_CTA_TEXT,
  HERO_MICROCOPY,
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

export function HeroSection() {
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
      className="relative h-[calc(90vh-4.5rem)] overflow-hidden"
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

      {/* Dark overlay - #1E1E1E at 82% opacity */}
      <div className="absolute inset-0 bg-[#1E1E1E]/82" />

      {/* Content - positioned vertically centered, slightly below */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-[800px] mt-32">
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
              {HERO_HEADLINE}
            </h1>
            <p className="text-lg md:text-xl text-secondary mb-8 max-w-[600px]">
              {HERO_SUBHEAD}
            </p>
            <div className="flex flex-col items-start gap-4">
              <Link
                href="#tournaments"
                className={buttonVariants({ variant: "default", size: "xl" })}
              >
                {HERO_CTA_TEXT}
              </Link>
              <p className="text-sm text-foreground">{HERO_MICROCOPY}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
