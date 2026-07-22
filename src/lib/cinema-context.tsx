"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

interface CinemaContextType {
  cinemaMode: boolean;
  toggleCinema: () => void;
}

const CinemaContext = createContext<CinemaContextType | null>(null);

export function CinemaProvider({ children }: { children: React.ReactNode }) {
  const [cinemaMode, setCinemaMode] = useState(false);

  const toggleCinema = useCallback(() => {
    setCinemaMode((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!cinemaMode) return;
    const handleScroll = () => setCinemaMode(false);
    window.addEventListener("scroll", handleScroll, { passive: true, once: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [cinemaMode]);

  return (
    <CinemaContext.Provider value={{ cinemaMode, toggleCinema }}>
      {children}
    </CinemaContext.Provider>
  );
}

export function useCinema() {
  const ctx = useContext(CinemaContext);
  if (!ctx) throw new Error("useCinema must be used within CinemaProvider");
  return ctx;
}
