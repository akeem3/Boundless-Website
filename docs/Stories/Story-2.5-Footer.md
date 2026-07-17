# Story 2.5 — Footer

**Epic:** Epic 2 — Landing Page Structure & Static Sections
**Priority:** Medium
**Estimate:** 2 story points
**Sprint:** 3
**Dependencies:** Story 2.1
**Design Reference:** `docs/Design/Landing Page.png`

---

## User Story

As a developer,
I want a footer with logo, copyright, and navigation links,
so that users can access secondary pages and social links at the bottom of the site.

---

## Acceptance Criteria

### Layout
- [ ] Dark background matching navbar (`bg-background`)
- [ ] Separator line above footer content (`border-t border-border-subtle`)
- [ ] Left: Logo + "© 2026 Boundless FC"
- [ ] Right: Privacy, Terms, Instagram links

### Content
- [ ] Copyright text: "© 2026 Boundless FC"
- [ ] Privacy link: placeholder `#` (no legal page for v1)
- [ ] Terms link: placeholder `#` (no legal page for v1)
- [ ] Instagram link: from `src/lib/links/index.ts` — `buildInstagramUrl()`

### Link Behavior
- [ ] Instagram opens in new tab: `target="_blank" rel="noopener noreferrer"`
- [ ] Privacy and Terms are placeholder links (`href="#"`)

### Accessibility
- [ ] Footer uses `<footer>` element
- [ ] Navigation links are keyboard-focusable
- [ ] Instagram link has descriptive text (not just icon)

### Verification
- [ ] `npm run build` succeeds
- [ ] Zero hardcoded hex values in `src/components/blocks/Footer.tsx`
- [ ] Zero hardcoded copy strings in `src/components/blocks/Footer.tsx`
- [ ] Visual match to reference at 360px, 768px, 1024px, 1440px

---

## Technical Notes

### File Structure
```
src/
  components/
    blocks/
      Footer.tsx    → Main footer component
```

### Key Imports
```tsx
// src/components/blocks/Footer.tsx
import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants/nav";
import { buildInstagramUrl } from "@/lib/links";
```

### Layout Pattern
```tsx
<footer className="border-t border-border-subtle bg-background">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
      {/* Left: Logo + Copyright */}
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="Boundless FC" className="h-8 w-auto" />
        <span className="text-sm text-foreground">
          © {new Date().getFullYear()} Boundless FC
        </span>
      </div>

      {/* Right: Links */}
      <nav className="flex items-center gap-6 text-sm text-foreground">
        <Link href="#" className="hover:text-secondary transition-colors">
          Privacy
        </Link>
        <Link href="#" className="hover:text-secondary transition-colors">
          Terms
        </Link>
        <a
          href={buildInstagramUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-secondary transition-colors"
        >
          Instagram
        </a>
      </nav>
    </div>
  </div>
</footer>
```

### Integration
Footer is rendered in `src/app/(public)/page.tsx` after all sections:

```tsx
// src/app/(public)/page.tsx
import { Footer } from "@/components/blocks/Footer";

export default function Home() {
  return (
    <>
      {/* ... sections ... */}
      <Footer />
    </>
  );
}
```

---

## Definition of Done

- [ ] `npm run build` succeeds with zero errors
- [ ] Footer matches reference design
- [ ] Instagram link opens in new tab
- [ ] Privacy and Terms are placeholder links
- [ ] Zero hardcoded strings in Footer component
