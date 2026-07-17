# Epic 2 — Landing Page Structure & Static Sections

**Epic Owner:** Frontend Engineer
**Status:** Ready for Build
**Depends On:** Epic 1
**Blocks:** Epic 3

---

## Outcome Statement

Build the complete landing page skeleton with sticky navigation, hero section with performance-optimized video background, sponsor marquee, about section, and footer — all matching the finalized design pixel-for-pixel, mobile-first, and fully accessible.

---

## Problem Context

The finalized landing page design (`docs/Design/Landing Page.png`) shows a single-page layout with 7 distinct sections in order: Nav → Hero → Marquee → Sessions → Tournaments → Shop → About → Contact → Footer. This epic builds the structural foundation (Nav, Hero, Marquee, About, Footer) and the shared layout patterns that Epic 3 will populate with dynamic content (Sessions, Tournaments, Shop, Contact). The hero section is the highest-risk element for performance — a looping background video must never block first paint on mid-range Android phones over 4G.

---

## Solution Approach

### 1. Global Layout

Create a root layout in `src/app/(public)/layout.tsx` that wraps all landing page sections:

```tsx
// src/app/(public)/layout.tsx
export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

The `src/app/(public)/page.tsx` renders all sections in order:
```tsx
export default function Home() {
  return (
    <>
      <HeroSection />
      <SponsorMarquee />
      <SessionsSection />
      <TournamentSection />
      <ShopSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
```

Each section gets an `id` attribute matching its nav link for scroll-anchor navigation.

### 2. Navigation Bar (`src/components/blocks/Navbar.tsx`)

**Desktop (≥768px):**
- Sticky on scroll (`position: sticky; top: 0; z-index: 50`)
- Logo + "Boundless fc" text on left
- Nav links centered: Sessions, Tournaments, Shop, About, Contact
- "Join a session" button on right (orange, links to `#sessions`)
- Background: `#151F2B` with subtle border-bottom or backdrop-blur

**Mobile (<768px):**
- Logo on left, hamburger icon on right
- Hamburger triggers shadcn `Sheet` (slide-in from right)
- Sheet contains all nav links stacked vertically + "Join a session" button
- Verify no horizontal scroll or overlap at 360px width

**Scroll Anchoring:**
- Each nav link uses `href="#section-id"` (e.g., `#sessions`, `#tournaments`)
- Smooth scroll behavior via CSS: `html { scroll-behavior: smooth; }`

**Copy Source:** All nav labels from `src/lib/constants/nav.ts` — never hardcoded in component.

### 3. Hero Section (`src/components/blocks/HeroSection.tsx`)

**Layout (from `docs/Design/Landing Page.png`):**
- Full-viewport height (`min-h-screen`) with dark overlay on video
- Headline: "Where 380+ players from 40+ countries on one pitch" (condensed display font, white)
- Subhead: "Boundless FC is an open futsal community in KL — no trials, no fixed teams. Two sessions a week, a tournament every few months." (body font, gold/cream)
- Primary CTA: "View the upcoming tournament" (orange button, links to `#tournaments`)
- Microcopy: "Next up: Boundless World Cup, 1st Aug 2026" (pale orange, pulled from active tournament row)

**Video Background — Performance Implementation:**

1. **Poster Image:** Ship a static `hero-poster.svg` as the first paint element. Use `next/image` with `priority` prop to ensure it's the LCP element.

2. **Lazy Video Mount:** The `<video>` element is only added to the DOM when the hero scrolls into view:
   ```tsx
   const [inView, setInView] = useState(false);
   const ref = useRef<HTMLDivElement>(null);
   
   useEffect(() => {
     const observer = new IntersectionObserver(
       ([entry]) => { if (entry.isIntersecting) setInView(true); },
       { rootMargin: '200px' } // start loading slightly before visible
     );
     if (ref.current) observer.observe(ref.current);
     return () => observer.disconnect();
   }, []);
   ```

3. **Reduced Motion Check:** Create a `usePrefersReducedMotion` hook:
   ```tsx
   function usePrefersReducedMotion() {
     const [prefersReduced, setPrefersReduced] = useState(false);
     useEffect(() => {
       const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
       setPrefersReduced(mq.matches);
       const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
       mq.addEventListener('change', handler);
       return () => mq.removeEventListener('change', handler);
     }, []);
     return prefersReduced;
   }
   ```

4. **SaveData Check:** Also check `navigator.connection?.saveData` where supported — if true, fall back to poster.

5. **Video Element:**
   ```tsx
   <video
     autoPlay
     muted
     loop
     playsInline
     preload="none"
     poster="/hero-poster.svg"
     className="absolute inset-0 w-full h-full object-cover"
   >
     <source src="/video/hero.webm" type="video/webm" />
     <source src="/video/hero.mp4" type="video/mp4" />
   </video>
   ```

6. **No Play Button:** The play-button icon seen in earlier mocks was only indicating "this is a video" to a human reviewer. Omit it entirely — the final hero has no visible video controls.

**Copy Source:** Headline and subhead from `src/lib/constants/copy.ts`. Tournament microcopy queried from `tournaments` table (single active row where `registration_open = true`).

### 4. Sponsor Marquee (`src/components/blocks/SponsorMarquee.tsx`)

**Implementation (pure CSS, no JS animation):**

```css
/* In globals.css or component CSS module */
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee 30s linear infinite;
}

/* Pause on hover (desktop) */
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

**DOM Structure:**
```tsx
<div className="overflow-hidden" role="region" aria-label="Sponsors">
  <div className="marquee-track">
    <div className="flex gap-8 px-4">
      {logos.map(logo => <SponsorLogo key={logo.id} {...logo} />)}
    </div>
    <div className="flex gap-8 px-4" aria-hidden="true">
      {logos.map(logo => <SponsorLogo key={`dup-${logo.id}`} {...logo} />)}
    </div>
  </div>
</div>
```

- Duplicate the logo list once in the DOM
- Set `aria-hidden="true"` on the duplicate set
- No JavaScript animation loop — pure CSS `@keyframes translateX`
- Logos sourced from `sponsors` table (`active = true`, ordered by `sort_order`)

### 5. About Section (`src/components/blocks/AboutSection.tsx`)

**Layout (from `docs/Design/Landing Page.png`):**
- Two-column on desktop: text left, image right
- Single column stacked on mobile
- Headline: "About — our journey" (condensed display font)
- Body text: "Boundless began in 2024 with eleven players and a shared love for football. Two years on, it's the largest international grassroots football community in Kuala Lumpur, run by 2 students — 380+ players from 40+ countries call this pitch home."
- Stats grid below body text:
  - 40+ nationalities played
  - 2yrs running
  - 7+ tournaments hosted
  - 2x sessions a week

**Copy Source:** All text from `src/lib/constants/copy.ts`. Stats values can be constants (not admin-editable at this scale).

**Image:** Use `next/image` with a placeholder or community photo. Ensure proper `alt` text.

### 6. Footer (`src/components/blocks/Footer.tsx`)

**Layout (from `docs/Design/Landing Page.png`):**
- Dark background matching nav (`#151F2B`)
- Left: Logo + "© 2026 Boundless FC"
- Right: Privacy, Terms, Instagram links
- Separator line above footer content

**Links:**
- Privacy and Terms: placeholder `#` links (not shown in design)
- Instagram: from `contact_settings.instagram_url` (via shared helper)

### 7. Section Spacing & Layout Patterns

Establish consistent section padding matching the reference image:
- Vertical padding: `py-16 md:py-24` (consistent across sections)
- Max width container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Section IDs: `id="sessions"`, `id="tournaments"`, `id="shop"`, `id="about"`, `id="contact"`

---

## Acceptance Criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Sticky nav renders correctly at all breakpoints | Test at 360px, 390px, 768px, 1024px, 1440px |
| 2 | Mobile hamburger menu opens Sheet without horizontal scroll | Test at 360px width |
| 3 | Hero video lazy-loads via IntersectionObserver | Inspect network tab — video loads only when hero visible |
| 4 | Hero poster is LCP element | Lighthouse LCP metric shows poster, not video |
| 5 | `prefers-reduced-motion: reduce` shows poster only, no video | Toggle OS setting, verify no video element rendered |
| 6 | `navigator.connection.saveData` falls back to poster | Test with Chrome DevTools throttling |
| 7 | Sponsor marquee is pure CSS animation | No JS `setInterval` or `requestAnimationFrame` for animation |
| 8 | Marquee pauses on hover (desktop) | Mouse over marquee, animation stops |
| 9 | Marquee pauses under `prefers-reduced-motion` | Toggle OS setting, verify animation paused |
| 10 | Duplicate marquee set has `aria-hidden="true"` | Inspect DOM |
| 11 | All nav links scroll to correct section IDs | Click each link, verify scroll |
| 12 | Footer matches reference design | Visual comparison |
| 13 | All copy from `lib/constants/copy.ts` | Grep for hardcoded strings in components — zero matches |
| 14 | No raw hex values in components | Grep for `#[0-9a-fA-F]` in `src/components/` — zero matches |

---

## Out of Scope

- Dynamic content in Sessions, Tournaments, Shop, Contact sections (Epic 3)
- Admin panel (Epic 4)
- Database queries for dynamic microcopy (handled in Epic 3)

---

## Assumptions

- Hero video footage will be supplied by organizers and compressed via ffmpeg to ≤ 3-4MB
- Poster image will be extracted from the video or supplied separately
- Sponsor logos will be uploaded to Supabase Storage and managed via admin panel (Epic 4)
- The "Privacy" and "Terms" footer links are placeholders — no legal pages required for v1
