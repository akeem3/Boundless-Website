# Story 2.4 — About Section

**Epic:** Epic 2 — Landing Page Structure & Static Sections
**Priority:** Medium
**Estimate:** 2 story points
**Sprint:** 3
**Dependencies:** Story 2.1
**Design Reference:** `docs/Design/Landing Page.svg`

---

## User Story

As a developer,
I want an About section with a two-column layout and stats grid,
so that users can learn about the community's history and impact.

---

## Acceptance Criteria

### Layout — Desktop (≥768px)
- [ ] Two-column layout: text left, image right
- [ ] Headline: "About — our journey" (Inter font, gold accent via `text-foreground`)
- [ ] Body text below headline
- [ ] Stats grid below body text (2x2 grid)

### Layout — Mobile (<768px)
- [ ] Single column stacked layout
- [ ] Image appears below text (or above, matching reference)

### Content
- [ ] Headline from `src/lib/constants/copy.ts` — `ABOUT_HEADLINE`
- [ ] Body text from `src/lib/constants/copy.ts` — `ABOUT_BODY`
- [ ] Stats from `src/lib/constants/copy.ts` — `ABOUT_STATS` array

### Stats Grid
- [ ] 4 stats displayed in 2x2 grid
- [ ] Each stat: value (large, gold accent via `text-foreground`) + label (small, light orange via `text-secondary`)
- [ ] Stats:
  - 40+ nationalities played
  - 2yrs running
  - 7+ tournaments hosted
  - 2x sessions a week

### Image
- [ ] Uses `next/image` component
- [ ] Placeholder image (`public/about-community.jpg`)
- [ ] Proper `alt` text: "Boundless FC community gathering"
- [ ] Responsive sizing (fills right column on desktop, full width on mobile)

### Verification
- [ ] `npm run build` succeeds
- [ ] Zero hardcoded hex values in `src/components/blocks/AboutSection.tsx`
- [ ] Zero hardcoded copy strings in `src/components/blocks/AboutSection.tsx`
- [ ] Visual match to reference at 360px, 768px, 1024px, 1440px

---

## Technical Notes

### File Structure
```
src/
  components/
    blocks/
      AboutSection.tsx    → Main about component
public/
  about-community.jpg     → Placeholder community image
```

### Key Imports
```tsx
// src/components/blocks/AboutSection.tsx
import Image from "next/image";
import { ABOUT_HEADLINE, ABOUT_BODY, ABOUT_STATS } from "@/lib/constants/copy";
```

### Layout Pattern
```tsx
<section id="about" className="py-16 md:py-24">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      {/* Text Column */}
      <div>
        <h2 className="text-3xl md:text-4xl text-foreground mb-6">
          {ABOUT_HEADLINE}
        </h2>
        <p className="text-secondary leading-relaxed mb-8">
          {ABOUT_BODY}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          {ABOUT_STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl text-foreground">{stat.value}</div>
              <div className="text-sm text-secondary">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Column */}
      <div className="relative aspect-[4/3] md:aspect-square">
        <Image
          src="/about-community.jpg"
          alt="Boundless FC community gathering"
          fill
          className="object-cover rounded-lg"
        />
      </div>
    </div>
  </div>
</section>
```

### Constants (copy.ts)
```tsx
export const ABOUT_HEADLINE = "About — our journey";

export const ABOUT_BODY = "Boundless began in 2024 with eleven players and a shared love for football. Two years on, it's the largest international grassroots football community in Kuala Lumpur, run by 2 students — 380+ players from 40+ countries call this pitch home.";

export const ABOUT_STATS = [
  { value: "40+", label: "nationalities played" },
  { value: "2yrs", label: "running" },
  { value: "7+", label: "tournaments hosted" },
  { value: "2x", label: "sessions a week" },
];
```

---

## Definition of Done

- [ ] `npm run build` succeeds with zero errors
- [ ] Two-column layout on desktop, stacked on mobile
- [ ] All copy from `lib/constants/copy.ts`
- [ ] Stats grid displays correctly
- [ ] Zero hardcoded strings in AboutSection component
