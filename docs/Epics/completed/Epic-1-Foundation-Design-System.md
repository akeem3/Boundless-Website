# Epic 1 — Foundation & Design System

**Epic Owner:** Engineering Lead
**Status:** ✅ Done
**Depends On:** None
**Blocks:** Epics 2, 3, 4, 5

---

## Outcome Statement

Establish a fully configured, zero-cost project skeleton with a tokenized design system extracted from the finalized landing page design (`docs/Design/Landing Page.svg`), enabling all subsequent epics to build UI components that are visually consistent, accessible, and mobile-first without hardcoding colors, copy, or external destinations.

---

## Problem Context

Boundless FC is a grassroots futsal community with 400+ members across 50+ countries. The current site is a single-page marketing + operations site backed by a small admin panel. The project requires a $0 tech stack (Vercel Hobby + Supabase Free Tier) that loads fast on mid-range Android phones over 4G. Without a proper foundation — project scaffolding, design tokens, component primitives, database schema, and environment configuration — every subsequent feature would accumulate technical debt, inconsistent styling, and hardcoded values that non-technical organizers cannot maintain.

---

## Solution Approach

### 1. Project Scaffolding

Scaffold with `create-next-app` using:
- App Router (not Pages Router)
- TypeScript (strict mode)
- Tailwind CSS v4
- `src/` directory structure
- Import alias `@/*`

### 2. shadcn/ui Initialization

Run `npx shadcn@latest init` with:
- CSS variables enabled (`cssVariables: true`)
- `globals.css` as the CSS entry point
- Verify `components.json` is generated correctly

Install all anticipated shadcn primitives:
```
button, card, input, textarea, select, label, form, dialog,
sheet, carousel, badge, separator, tabs, toast/sonner
```

**Rule:** Never hand-roll a component shadcn already provides. Components in `src/components/ui/` are shadcn output — do not hand-edit beyond shadcn's own output.

### 3. Additional Dependencies

| Package | Purpose |
|---|---|
| `@supabase/supabase-js` | Supabase client SDK |
| `@supabase/ssr` | Server-side Supabase with cookie handling |
| `embla-carousel-react` | Carousel engine (same as shadcn's carousel) |
| `embla-carousel-autoplay` | Autoplay plugin for Embla |
| `react-hook-form` | Form state management |
| `zod` | Schema validation |
| `@hookform/resolvers` | RHF + Zod integration |
| `lucide-react` | Icons (bundled with shadcn) |

### 4. Folder Structure

```
src/
  app/
    (public)/            → landing page route group
    admin/               → protected admin routes
    api/                 → route handlers
  components/
    ui/                  → raw shadcn components
    blocks/              → composed sections (Hero, SessionsSection, etc.)
    admin/               → admin-only components
  lib/
    supabase/
      client.ts          → browser client (createBrowserClient)
      server.ts          → server client (cookies-aware, createServerClient)
      middleware.ts       → session refresh helper (updateSession)
    validations/         → zod schemas (session.ts, admin forms)
    constants/           → copy.ts (all site copy), nav.ts (navigation links)
    links/               → URL builders (wa.me, mailto:, external links)
  supabase/
    migrations/          → SQL migration files
public/
  video/                 → compressed hero video + poster
```

### 5. Design System (`globals.css`)

**Extract from `docs/Design/Landing Page.svg`:**

| Design Token | Hex Value | Semantic Name | Usage |
|---|---|---|---|
| Dark Blue | `#151F2B` | `--background` | Primary background, hero, sessions, tournament, about, contact sections |
| Gold/Cream | `#FAEAC2` | `--foreground` | Primary text on dark, shop section background |
| Orange | `#FF6C47` | `--primary` | CTAs (Join a session, Join this Session, View tournament), accents |
| Pale Orange | `#DB856A` | `--secondary` | Secondary text on dark blue, subtle accents |
| White | `#FFFFFF` | `--primary-foreground` | Text on orange buttons |

**Define as CSS variables under `:root` using OKLCH values (Tailwind v4 default).**

Expose via `@theme inline` so Tailwind utilities work:
```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  /* etc. */
}
```

**Typography:**
- `--font-display`: Condensed poster-style font for headlines (loaded via `next/font`, self-hosted, not Google Fonts runtime request)
- `--font-sans`: Clean body font for paragraph text
- Reference image shows condensed uppercase headlines (e.g., "BOUNDLESS WORLD CUP — 2026") and clean body copy

**Spacing/Radius:**
- Define consistent spacing scale matching reference image's section padding
- Define radius tokens for card corners, button rounding (reference shows rounded corners on cards and buttons)

### 6. Supabase Setup

- Create Supabase project (Free Tier)
- Create `.env.local` (git-ignored) with:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ```
- **Security rule:** `SUPABASE_SERVICE_ROLE_KEY` must only be referenced in server-side files (`lib/supabase/server.ts`, server actions, route handlers). Never in client-shipped JS.

**Database Schema (SQL migrations in `supabase/migrations/`):**

```sql
-- tournaments
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  fee_myr DECIMAL(10,2) NOT NULL,
  description TEXT,
  rules TEXT,
  poster_url TEXT,
  registration_open BOOLEAN DEFAULT false,
  team_registration_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  note TEXT,
  capacity INTEGER NOT NULL DEFAULT 20,
  spots_taken INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- session_registrations
CREATE TABLE session_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_myr DECIMAL(10,2) NOT NULL,
  sizes TEXT[],
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  order_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- product_images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- sponsors
CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true
);

-- contact_settings (singleton row)
CREATE TABLE contact_settings (
  id UUID PRIMARY KEY DEFAULT 'singleton',
  whatsapp_number TEXT NOT NULL,
  whatsapp_generic_message TEXT NOT NULL DEFAULT 'Hi Boundless! I have a question.',
  whatsapp_find_team_message_template TEXT NOT NULL DEFAULT 'Hi Boundless! I''d like to join a team for {tournament_title} — I don''t have a full squad yet.',
  email_address TEXT NOT NULL,
  email_default_subject TEXT NOT NULL DEFAULT 'Question from the website',
  instagram_url TEXT NOT NULL
);

-- site_settings (singleton row)
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT 'singleton',
  shop_order_url TEXT
);
```

**RLS Policies:**
- Public `SELECT` on `tournaments`, `sessions`, `products`, `product_images`, `sponsors`, `contact_settings`, `site_settings`
- All `UPDATE`/`DELETE` restricted to authenticated admin role

### 7. Middleware

Create `src/middleware.ts` using the session refresh helper from `lib/supabase/middleware.ts`. This refreshes Supabase auth sessions on every request and will be extended in Epic 4 to protect admin routes.

### 8. Vercel Connection

- Connect repo to Vercel (Hobby plan)
- Confirm blank deploy succeeds
- Set environment variables in Vercel project settings

---

## Acceptance Criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | ✅ `npm run build` succeeds with zero errors | Run `npm run build` locally |
| 2 | ✅ Placeholder page renders on Vercel | Deploy and visit URL |
| 3 | ✅ `components.json` exists and is valid | Check file contents |
| 4 | ✅ All shadcn components installed | `ls src/components/ui/` shows button, card, input, etc. |
| 5 | ✅ Supabase client imports on server and client without runtime errors | Build passes, no import errors |
| 6 | ✅ Zero raw hex codes outside `globals.css` | `grep -r '#[0-9a-fA-F]\{3,6\}' src/ --include='*.tsx' --include='*.ts'` returns no matches |
| 7 | ✅ All design tokens defined in `globals.css` | Check `:root` and `.dark` sections |
| 8 | ✅ Database migrations applied in Supabase | Check Supabase dashboard |
| 9 | ✅ `.env.local` contains all three env vars | Check file (git-ignored) |
| 10 | ✅ Folder structure matches spec | Visual inspection |

---

## Out of Scope

- Any UI components beyond shadcn primitives
- Any hardcoded copy strings in components (all go to `lib/constants/`)
- Any hardcoded external URLs (all go to `lib/links/` built from database)
- Paid fonts, CDNs, or services

---

## Assumptions

- The organizers will supply real Supabase credentials, hero video, product photography, and external form URLs post-launch
- The hero video will need ffmpeg compression to ≤ 3-4MB before integration
- The design system tokens may need refinement once real content is populated
