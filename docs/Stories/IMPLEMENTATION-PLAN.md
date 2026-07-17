# Epic 2 — Implementation Plan

**Epic:** Landing Page Structure & Static Sections
**Total Points:** 15
**Sprint:** 3

---

## Story Overview

| Story | Title | Points | Dependencies |
|---|---|---|---|
| 2.1 | Global Layout & Navigation Bar | 3 | Epic 1 |
| 2.2 | Hero Section | 5 | Story 2.1 |
| 2.3 | Sponsor Marquee | 3 | Story 2.1 |
| 2.4 | About Section | 2 | Story 2.1 |
| 2.5 | Footer | 2 | Story 2.1 |

---

## Execution Order

```
Story 2.1 (Layout + Navbar)
    ├── Story 2.2 (Hero) — highest risk, do first
    ├── Story 2.3 (Marquee) — independent of Hero
    ├── Story 2.4 (About) — independent of Hero
    └── Story 2.5 (Footer) — independent of Hero
```

**Recommended:** Build in order 2.1 → 2.2 → 2.3 → 2.4 → 2.5

---

## Story 2.1 — Global Layout & Navigation Bar (3 pts)

### Files to Create
- `src/components/blocks/Navbar.tsx`

### Files to Modify
- `src/app/(public)/layout.tsx` — add Navbar import
- `src/app/(public)/page.tsx` — add section order
- `src/app/globals.css` — add `scroll-behavior: smooth`

### Key Components
- shadcn: `Sheet`, `SheetContent`, `SheetTrigger`, `Button`
- lucide-react: `Menu`, `X`
- Custom: `NAV_LINKS`, `SITE_NAME`

### Verification
- [ ] Build passes
- [ ] Navbar sticky at all breakpoints
- [ ] Mobile Sheet works
- [ ] Scroll links work

---

## Story 2.2 — Hero Section (5 pts)

### Files to Create
- `src/components/blocks/HeroSection.tsx`
- `src/hooks/use-prefers-reduced-motion.ts`
- `public/hero-poster.svg` (placeholder)
- `public/video/hero.mp4` (placeholder)
- `public/video/hero.webm` (placeholder)

### Files to Modify
- `src/app/(public)/page.tsx` — add HeroSection

### Key Components
- next/image: `Image`
- next/link: `Link`
- shadcn: `Button`
- Custom: `usePrefersReducedMotion`

### Risk Factors
- Video file size (must be ≤ 3-4MB)
- Poster image quality
- IntersectionObserver browser support

### Verification
- [ ] Build passes
- [ ] Lighthouse LCP shows poster
- [ ] Video lazy-loads
- [ ] Reduced motion works

---

## Story 2.3 — Sponsor Marquee (3 pts)

### Files to Create
- `src/components/blocks/SponsorMarquee.tsx`

### Files to Modify
- `src/app/(public)/page.tsx` — add SponsorMarquee
- `src/app/globals.css` — add marquee keyframes and classes

### Key Components
- CSS: `@keyframes marquee`, `.marquee-track`
- Placeholder: `SPONSOR_LOGOS` array

### Verification
- [ ] Build passes
- [ ] Pure CSS animation
- [ ] Hover pauses
- [ ] Reduced motion pauses

---

## Story 2.4 — About Section (2 pts)

### Files to Create
- `src/components/blocks/AboutSection.tsx`
- `public/about-community.jpg` (placeholder)

### Files to Modify
- `src/app/(public)/page.tsx` — add AboutSection

### Key Components
- next/image: `Image`
- Custom: `ABOUT_HEADLINE`, `ABOUT_BODY`, `ABOUT_STATS`

### Verification
- [ ] Build passes
- [ ] Two-column layout
- [ ] Stats grid

---

## Story 2.5 — Footer (2 pts)

### Files to Create
- `src/components/blocks/Footer.tsx`

### Files to Modify
- `src/app/(public)/page.tsx` — add Footer

### Key Components
- next/link: `Link`
- Custom: `buildInstagramUrl`

### Verification
- [ ] Build passes
- [ ] Instagram link works
- [ ] Placeholder links

---

## Final Verification

After all stories are complete:

```bash
npm run build
npm run lint
```

### Checklist
- [ ] All sections render in correct order
- [ ] Navbar sticky at all breakpoints
- [ ] Mobile Sheet works
- [ ] Hero video lazy-loads
- [ ] Hero poster is LCP
- [ ] Reduced motion works
- [ ] Marquee animates
- [ ] Marquee pauses on hover
- [ ] About section two-column
- [ ] Footer matches reference
- [ ] All copy from constants
- [ ] Zero hardcoded hex
- [ ] Zero hardcoded strings
