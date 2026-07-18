# Story 2.3 — Sponsor Marquee

**Epic:** Epic 2 — Landing Page Structure & Static Sections
**Priority:** Medium
**Estimate:** 3 story points
**Sprint:** 3
**Dependencies:** Story 2.1
**Design Reference:** `docs/Design/Landing Page.svg`

---

## User Story

As a developer,
I want a pure-CSS infinite-scrolling sponsor marquee,
so that sponsors are displayed dynamically without impacting performance or blocking the main thread.

---

## Acceptance Criteria

### Layout
- [ ] Full-width section below hero
- [ ] Horizontal scrolling logos (infinite loop)
- [ ] Logos displayed in a single row
- [ ] Consistent spacing between logos

### CSS Animation
- [ ] Pure CSS `@keyframes translateX` animation — NO JavaScript animation
- [ ] Animation duration: ~30 seconds for full cycle
- [ ] Animation is `linear` and `infinite`
- [ ] Duplicate the logo list once in DOM for seamless loop
- [ ] Duplicate set has `aria-hidden="true"`

### Hover Behavior (Desktop)
- [ ] Animation pauses on hover (desktop only: `@media (hover: hover)`)
- [ ] Animation resumes when hover ends

### Reduced Motion
- [ ] Animation pauses under `prefers-reduced-motion: reduce`
- [ ] Logos remain visible but static

### Accessibility
- [ ] Section has `role="region"` and `aria-label="Sponsors"`
- [ ] Duplicate logo set has `aria-hidden="true"`
- [ ] Each logo image has descriptive `alt` text (sponsor name)

### Data Source
- [ ] Logos hardcoded as placeholder array (Supabase query in Epic 3)
- [ ] Placeholder includes 4-6 sample logos with name and image URL

### Verification
- [ ] `npm run build` succeeds
- [ ] No JS `setInterval` or `requestAnimationFrame` for animation
- [ ] Animation pauses on hover (desktop)
- [ ] Animation pauses under `prefers-reduced-motion: reduce`
- [ ] Duplicate set has `aria-hidden="true"` (DOM inspection)
- [ ] Zero hardcoded hex values in `src/components/blocks/SponsorMarquee.tsx`

---

## Technical Notes

### File Structure
```
src/
  components/
    blocks/
      SponsorMarquee.tsx    → Main marquee component
```

### CSS (globals.css)
```css
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee 30s linear infinite;
}

/* Pause on hover (desktop only) */
@media (hover: hover) {
  .marquee-track:hover {
    animation-play-state: paused;
  }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation-play-state: paused;
  }
}
```

### DOM Structure
```tsx
<section role="region" aria-label="Sponsors" className="py-8 border-b border-border-subtle">
  <div className="overflow-hidden">
    <div className="marquee-track">
      {/* Original set */}
      <div className="flex items-center gap-12 px-6">
        {logos.map((logo) => (
          <SponsorLogo key={logo.id} {...logo} />
        ))}
      </div>
      {/* Duplicate set for seamless loop */}
      <div className="flex items-center gap-12 px-6" aria-hidden="true">
        {logos.map((logo) => (
          <SponsorLogo key={`dup-${logo.id}`} {...logo} />
        ))}
      </div>
    </div>
  </div>
</section>
```

### SponsorLogo Sub-Component
```tsx
function SponsorLogo({ name, logoUrl }: { name: string; logoUrl: string }) {
  return (
    <div className="flex-shrink-0">
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className="h-12 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
      />
    </div>
  );
}
```

### Placeholder Data
```tsx
const SPONSOR_LOGOS = [
  { id: "1", name: "Sponsor A", logoUrl: "/sponsors/sponsor-a.svg" },
  { id: "2", name: "Sponsor B", logoUrl: "/sponsors/sponsor-b.svg" },
  { id: "3", name: "Sponsor C", logoUrl: "/sponsors/sponsor-c.svg" },
  { id: "4", name: "Sponsor D", logoUrl: "/sponsors/sponsor-d.svg" },
];
```

---

## Definition of Done

- [ ] `npm run build` succeeds with zero errors
- [ ] Marquee animates smoothly with pure CSS
- [ ] Animation pauses on hover (desktop)
- [ ] Animation pauses under `prefers-reduced-motion: reduce`
- [ ] Duplicate set has `aria-hidden="true"`
- [ ] Zero hardcoded hex values in component
