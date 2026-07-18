# Story 2.2 — Hero Section

**Epic:** Epic 2 — Landing Page Structure & Static Sections
**Priority:** High
**Estimate:** 5 story points
**Sprint:** 3
**Dependencies:** Story 2.1
**Design Reference:** `docs/Design/Landing Page.svg`

---

## User Story

As a developer,
I want a performance-optimized hero section with a lazy-loaded video background,
so that the landing page loads fast on mid-range Android phones over 4G while still delivering an immersive visual experience.

---

## Acceptance Criteria

### Layout
- [ ] Full-viewport height: `min-h-screen`
- [ ] Dark overlay on video/poster (semi-transparent gradient or solid overlay)
- [ ] Content centered vertically and horizontally
- [ ] Headline: "Where 380+ players from 40+ countries on one pitch" (Inter font, gold accent via `text-foreground`)
- [ ] Subhead: "Boundless FC is an open futsal community in KL — no trials, no fixed teams. Two sessions a week, a tournament every few months." (body font, light orange via `text-secondary`)
- [ ] Primary CTA: "View the upcoming tournament" (gold accent button via `bg-accent text-accent-foreground`, links to `#tournaments`)
- [ ] Microcopy: "Next up: Boundless World Cup, 1st Aug 2026" (pale orange)

### Copy Source
- [ ] Headline from `src/lib/constants/copy.ts` — `HERO_HEADLINE`
- [ ] Subhead from `src/lib/constants/copy.ts` — `HERO_SUBHEAD`
- [ ] CTA text from `src/lib/constants/copy.ts` — `HERO_CTA_TEXT`
- [ ] Microcopy uses placeholder string from `src/lib/constants/copy.ts` — `HERO_MICROCOPY`

### Video Background — Performance
- [ ] Static poster image (`public/hero-poster.svg`) ships as first paint element
- [ ] Poster uses `next/image` with `priority` prop (LCP element)
- [ ] `<video>` element only mounts when hero scrolls into view (IntersectionObserver)
- [ ] IntersectionObserver uses `rootMargin: '200px'` for pre-loading
- [ ] Video has `preload="none"` attribute
- [ ] Video has `autoPlay`, `muted`, `loop`, `playsInline` attributes
- [ ] Video sources: `/video/hero.webm` and `/video/hero.mp4`

### Accessibility — Reduced Motion
- [ ] `usePrefersReducedMotion` hook created in `src/hooks/use-prefers-reduced-motion.ts`
- [ ] When `prefers-reduced-motion: reduce` is active, video does NOT mount
- [ ] Only poster image is shown when reduced motion is preferred

### Accessibility — SaveData
- [ ] Check `navigator.connection?.saveData` where supported
- [ ] When saveData is true, video does NOT mount (poster only)

### No Play Button
- [ ] No visible play button or video controls on the hero

### Verification
- [ ] `npm run build` succeeds
- [ ] Lighthouse LCP metric shows poster, not video
- [ ] Network tab: video loads only when hero is visible
- [ ] Toggle `prefers-reduced-motion: reduce` — video element not rendered
- [ ] Zero hardcoded hex values in `src/components/blocks/HeroSection.tsx`
- [ ] Zero hardcoded copy strings in `src/components/blocks/HeroSection.tsx`

---

## Technical Notes

### File Structure
```
src/
  hooks/
    use-prefers-reduced-motion.ts    → Reduced motion hook
  components/
    blocks/
      HeroSection.tsx                → Main hero component
public/
  hero-poster.svg                    → Static poster image (placeholder)
  video/
    hero.webm                        → Compressed hero video (webm)
    hero.mp4                         → Compressed hero video (mp4)
```

### Key Imports
```tsx
// src/components/blocks/HeroSection.tsx
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HERO_HEADLINE, HERO_SUBHEAD, HERO_CTA_TEXT, HERO_MICROCOPY } from "@/lib/constants/copy";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
```

### usePrefersReducedMotion Hook

### IntersectionObserver Pattern
```tsx
const [inView, setInView] = useState(false);
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) setInView(true);
    },
    { rootMargin: "200px" }
  );

  if (ref.current) observer.observe(ref.current);
  return () => observer.disconnect();
}, []);
```

### SaveData Check
```tsx
const saveData = typeof navigator !== "undefined" && "connection" in navigator
  ? (navigator as any).connection?.saveData
  : false;

const shouldPlayVideo = !prefersReduced && !saveData && inView;
```

### Hero Layout Pattern

---

## Definition of Done

- [ ] `npm run build` succeeds with zero errors
- [ ] Hero poster is LCP element (Lighthouse verified)
- [ ] Video lazy-loads via IntersectionObserver (network tab verified)
- [ ] Reduced motion preference disables video
- [ ] SaveData check disables video
- [ ] Zero hardcoded strings in HeroSection component
