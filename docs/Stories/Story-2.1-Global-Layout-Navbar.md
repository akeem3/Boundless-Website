# Story 2.1 — Global Layout & Navigation Bar

**Epic:** Epic 2 — Landing Page Structure & Static Sections
**Priority:** High
**Estimate:** 3 story points
**Sprint:** 3
**Dependencies:** Epic 1
**Design Reference:** `docs/Design/Landing Page.png`

---

## User Story

As a developer,
I want a responsive navigation bar with smooth-scroll anchor links and a mobile hamburger menu,
so that users can navigate between sections seamlessly on any device.

---

## Acceptance Criteria

### Public Layout
- [ ] `src/app/(public)/layout.tsx` renders `<Navbar />` before `{children}` and `<Footer />` after
- [ ] Layout does NOT render footer (footer is in page.tsx for now, will be moved in Story 2.5)
- [ ] `src/app/(public)/page.tsx` imports and renders sections in correct order

### Navbar — Desktop (≥768px)
- [ ] Sticky on scroll: `position: sticky; top: 0; z-index: 50`
- [ ] Background: `bg-background` with `border-b` or `backdrop-blur`
- [ ] Left: Logo image + "Boundless fc" text (from `lib/constants/copy.ts`)
- [ ] Center: Nav links — Sessions, Tournaments, Shop, About, Contact
- [ ] Right: "Join a session" orange button linking to `#sessions`
- [ ] All nav labels sourced from `src/lib/constants/nav.ts` — zero hardcoded strings

### Navbar — Mobile (<768px)
- [ ] Logo on left, hamburger icon (Menu from lucide-react) on right
- [ ] Hamburger triggers shadcn `Sheet` component (slide-in from right)
- [ ] Sheet contains all nav links stacked vertically + "Join a session" button
- [ ] Sheet closes when a link is clicked
- [ ] No horizontal scroll or overlap at 360px width

### Scroll Anchoring
- [ ] Each nav link uses `href="#section-id"` (e.g., `#sessions`, `#tournaments`)
- [ ] Smooth scroll behavior: `html { scroll-behavior: smooth; }` in globals.css
- [ ] Clicking a nav link scrolls to the correct section

### Accessibility
- [ ] Navbar has `role="navigation"` or uses `<nav>` element
- [ ] Mobile hamburger has `aria-label="Open menu"` / `aria-label="Close menu"`
- [ ] Sheet has proper ARIA attributes from shadcn
- [ ] All interactive elements are keyboard-focusable

### Verification
- [ ] `npm run build` succeeds
- [ ] Zero hardcoded hex values in `src/components/blocks/Navbar.tsx`
- [ ] Zero hardcoded copy strings in `src/components/blocks/Navbar.tsx`
- [ ] Visual match to reference at 360px, 390px, 768px, 1024px, 1440px

---

## Technical Notes

### File Structure
```
src/
  components/
    blocks/
      Navbar.tsx          → Main navbar component
  app/
    (public)/
      layout.tsx          → Wraps page with Navbar
      page.tsx            → Renders all sections
```

### Key Imports
```tsx
// src/components/blocks/Navbar.tsx
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants/nav";
import { SITE_NAME } from "@/lib/constants/copy";
```

### Layout Pattern
```tsx
// src/app/(public)/layout.tsx
import { Navbar } from "@/components/blocks/Navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
```

### Scroll Behavior (globals.css)
```css
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

---

## Definition of Done

- [ ] `npm run build` succeeds with zero errors
- [ ] Navbar renders correctly at all breakpoints
- [ ] Mobile Sheet menu works without horizontal scroll
- [ ] All nav links scroll to correct sections
- [ ] Zero hardcoded strings in Navbar component
