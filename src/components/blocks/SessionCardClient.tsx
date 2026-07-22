"use client";

import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

interface SessionCardClientProps {
  session: {
    id: string;
    starts_at: string;
    location: string;
    note: string | null;
    join_url: string | null;
  };
  description: string;
  index: number;
}

export function SessionCardClient({ session, description, index }: SessionCardClientProps) {
  const prefersReduced = usePrefersReducedMotion();
  const canAnimate = !prefersReduced;

  const sessionDate = new Date(session.starts_at);
  const day = sessionDate.getDate();
  const month = sessionDate.toLocaleString("en-US", { month: "short" });
  const sessionTime = sessionDate.toLocaleString("en-GB", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kuala_Lumpur",
  });
  const sessionUrl = session.join_url ?? "#";
  const delay = 0.2 + index * 0.1;

  return (
    <motion.div
      initial={canAnimate ? { y: 24, opacity: 0, filter: "blur(6px)" } : { opacity: 0 }}
      whileInView={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      whileHover={
        canAnimate
          ? { y: -4, boxShadow: "0 8px 30px rgba(250,234,194,0.1)", transition: { duration: 0.2 } }
          : {}
      }
      className="rounded-lg p-5 sm:p-6 md:p-8"
      style={{ border: "0.7px solid var(--border-subtle)" }}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="flex flex-col items-center justify-center min-w-18">
          <span className="text-4xl font-bold text-foreground leading-none">{day}</span>
          <span className="text-sm text-secondary uppercase tracking-wide mt-1">{month}</span>
        </div>

        <div className="flex-1 space-y-2 text-center sm:text-left">
          <p className="text-foreground font-medium">{sessionTime}</p>
          <p className="text-secondary">{session.location}</p>
          <p className="text-secondary">{description}</p>
        </div>

        <motion.div
          whileHover={canAnimate ? { scale: 1.03 } : {}}
          transition={{ duration: 0.15 }}
          className="w-full sm:w-auto sm:ml-auto"
        >
          <a
            href={sessionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonVariants({ variant: "default", size: "lg" })} w-full sm:w-auto text-center`}
          >
            Join this Session
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
}
