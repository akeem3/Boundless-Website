# Story 1.2 — Design System & Component Library

**Epic:** Epic 1 — Foundation & Design System
**Priority:** High
**Estimate:** 5 story points
**Sprint:** 1
**Dependencies:** Story 1.1
**Design Reference:** `docs/Design/Landing Page.svg`

---

## User Story

As a developer,
I want the design system extracted from the finalized design and all shadcn components installed,
so that all UI work uses consistent colors, typography, spacing, and pre-built accessible primitives.

---

## Acceptance Criteria

### Color Tokens
- [x] All design colors defined in `globals.css` under `:root`:

| Variable | Hex | Usage |
|---|---|---|
| `--background` | `#151F2B` | Dark blue primary background |
| `--foreground` | `#FAEAC2` | Gold/cream text on dark |
| `--primary` | `#FF6C47` | Orange CTAs and accents |
| `--primary-foreground` | `#FFFFFF` | White text on orange |
| `--secondary` | `#DB856A` | Pale orange secondary |
| `--muted` | `#1E2A38` | Slightly lighter dark blue |
| `--muted-foreground` | `#A0AEC0` | Muted text color |
| `--accent` | `#FAEAC2` | Gold accent |
| `--card` | `#1E2A38` | Card backgrounds |
| `--card-foreground` | `#FAEAC2` | Card text |
| `--border` | `#2D3A4A` | Border color |

- [x] Colors exposed to Tailwind via `@theme inline` block
- [x] `bg-primary`, `text-foreground`, `border-border` utilities work correctly

### Typography
- [x] `--font-display` defined for headlines (condensed, poster-style)
- [x] `--font-sans` defined for body text (clean, readable)
- [x] Fonts loaded via `next/font` (self-hosted, no runtime Google Fonts)
- [x] `font-display` and `font-sans` Tailwind utilities work

### Spacing & Radius
- [x] Section padding matches reference: `py-16 md:py-24`
- [x] Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- [x] Radius tokens defined and exposed to Tailwind

### shadcn Components
- [x] All 14 components installed in `src/components/ui/`:
  `button`, `card`, `input`, `textarea`, `select`, `label`, `form`, `dialog`, `sheet`, `carousel`, `badge`, `separator`, `tabs`, `sonner`

### Verification
- [x] Zero raw hex codes in `src/components/` (grep `#[0-9a-fA-F]{3,6}`)
- [x] TypeScript imports resolve for all shadcn components
- [x] `npm run build` succeeds

---

## Technical Notes

### globals.css Structure
```css
:root {
  --background: #151F2B;
  --foreground: #FAEAC2;
  --primary: #FF6C47;
  --primary-foreground: #FFFFFF;
  --secondary: #DB856A;
  --muted: #1E2A38;
  --muted-foreground: #A0AEC0;
  --accent: #FAEAC2;
  --card: #1E2A38;
  --card-foreground: #FAEAC2;
  --border: #2D3A4A;
  --radius: 0.5rem;
  --font-sans: var(--font-sans);
  --font-display: var(--font-display);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-border: var(--border);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --font-sans: var(--font-sans);
  --font-display: var(--font-display);
}
```

### Font Loading (src/app/layout.tsx)
```tsx
import { Inter, Oswald } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
});
```

### Install shadcn Components
```bash
npx shadcn@latest add button card input textarea select label form dialog sheet carousel badge separator tabs sonner
```

---

## Definition of Done

- [x] All color tokens defined and working
- [x] Typography loaded via `next/font` and working
- [x] Spacing/radius tokens defined
- [x] All 14 shadcn components installed
- [x] Zero hardcoded hex values in components
- [x] `npm run build` succeeds
