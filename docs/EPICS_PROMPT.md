# Boundless FC — Build Prompt & Epic Breakdown for OpenCode Agent

**Version 1.1** — updated to reflect: Tournament "Join with a team" and the whole Shop section now hand off to admin-configurable external links (Google Form / Notion form) instead of collecting data on-site; Tournament "Find a team" and all Contact channels are now direct deep links (WhatsApp, mailto, Instagram). See Epics 6, 7, 8, 9, 10 below for the changed scope.

## How to use this document

You (the coding agent) are building the Boundless FC website end to end. Before writing any code:

1. You will be given `Landing_Page.png` — the finalized, pixel-accurate design of the full landing page. Treat it as ground truth for every visual detail: layout, spacing, type scale, colors, corner radii, section order. **Do not guess or invent any visual detail that is visible in the image.** If something is genuinely not shown in the image (e.g. a hover state, an admin screen, an error state), use the design tokens defined in Epic 1 to stay consistent, and note the assumption in your PR description.
2. Work through the epics below **in order**. Do not start Epic 2 until Epic 0 and Epic 1 are complete and committed. Each epic should be its own commit or small set of commits with a clear message.
3. Read the accompanying `PRD.md` in full before starting — it defines the data model, the non-functional requirements, and the reasoning behind each dynamic section. This prompt tells you *how* to sequence the build; the PRD tells you *what* each piece must do.
4. Budget constraint: **$0**. Only use services with a permanent free tier at this project's scale (Vercel Hobby, Supabase Free Plan). Do not add paid dependencies, paid fonts, or paid media CDNs.

---

## Epic 0 — Environment & Tooling Setup

**Goal:** a clean, correctly configured project skeleton that every later epic builds on.

- Scaffold with `create-next-app` — App Router, TypeScript, ESLint, Tailwind CSS v4, `src/` directory, import alias `@/*`.
- Initialize shadcn/ui (`npx shadcn@latest init`): enable CSS variables (`cssVariables: true`), set `css` path to `app/globals.css`. Confirm `components.json` is generated correctly.
- Install and configure: `@supabase/supabase-js`, `@supabase/ssr`, `embla-carousel-react`, `embla-carousel-autoplay`, `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react` (comes with shadcn).
- Set up Prettier + ESLint config consistent with Next.js defaults; add a `.editorconfig`.
- Folder structure (indented, not fenced, so it can't break this document when pasted downstream):

    app/
      (public)/            → landing page route group
      admin/                → protected admin routes
      api/                  → route handlers if/when needed
    components/
      ui/                  → raw shadcn components — do not hand-edit beyond shadcn's own output
      blocks/              → composed sections (Hero, SessionsSection, TournamentSection, ShopSection, etc.)
      admin/                → admin-only components
    lib/
      supabase/
        client.ts          → browser client
        server.ts          → server client (cookies-aware)
        middleware.ts       → session refresh helper
      validations/          → zod schemas
      constants/             → copy strings, site-wide constants — no hardcoded strings in components
      links/                 → helpers that build wa.me / mailto: / external URLs from contact_settings + site_settings (see Epic 8)
    supabase/
      migrations/            → SQL migration files for every table in the PRD's data model
    public/
      video/                 → compressed hero video + poster

- Create a Supabase project (free tier). Add `.env.local` (git-ignored) with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only, never exposed to the client bundle — verify with a build check).
- Connect the repo to Vercel (Hobby plan). Confirm a blank deploy succeeds before continuing.
- Acceptance check: `npm run build` succeeds with zero errors, a placeholder page renders on Vercel, Supabase client can be imported on both server and client without runtime errors.

---

## Epic 1 — Design System (`globals.css`)

**Goal:** every color, spacing, radius, shadow, and font used anywhere in the app is a token defined once here. No component may use a raw hex value, an inline `style` color, or hardcoded copy string.

- Study `Landing_Page.png` and extract the actual palette in use: the dark navy background, the warm cream/parchment surface (shop section), the amber/gold accent (CTAs, numerals), muted secondary text color, success/turf-green accent if present. Define these as semantic shadcn tokens under `:root` and `.dark` (even if the site only ships one theme initially, define both so the convention holds) — e.g. `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--muted`, `--muted-foreground`, `--accent`, `--border`, `--card`, `--card-foreground`.
- Use OKLCH color values (Tailwind v4 / shadcn 2026 default) for perceptually-even contrast, not raw hex.
- Expose new tokens to Tailwind via `@theme inline` so utilities like `bg-primary`, `text-muted-foreground`, `border-border` work project-wide.
- Define the type scale (display/heading font for headlines matching the condensed poster-style type seen in the reference image, body font for paragraph text) as CSS variables (`--font-display`, `--font-sans`) loaded via `next/font` (self-hosted, not a runtime Google Fonts request — keeps it free and fast).
- Define a spacing/radius scale consistent with the reference image's rounded corners and section padding.
- Run `npx shadcn@latest add` for every primitive you anticipate needing: `button`, `card`, `input`, `textarea`, `select`, `label`, `form`, `dialog`, `sheet`, `carousel`, `badge`, `separator`, `tabs`, `toast`/`sonner`. Do not hand-roll a component shadcn already provides.
- Acceptance check: grep the codebase for raw hex codes (pattern `#[0-9a-fA-F]{3,6}`) outside of `globals.css` — there should be zero matches once later epics are complete. Same check for hardcoded English copy strings outside `lib/constants/`.

---

## Epic 2 — Global Layout: Nav + Footer

- Build the sticky nav and footer exactly as shown in `Landing_Page.png`.
- Mobile: nav collapses into a shadcn `Sheet` triggered by a hamburger icon. Verify no horizontal scroll or overlap at 360px width.
- Nav links scroll-anchor to their matching section IDs on the single-page layout.

---

## Epic 3 — Hero Section (video background)

- Build per PRD Section 4.2. Key implementation notes for you specifically:
  - Do **not** render the play-button icon seen in an earlier rough mock — it was only there to indicate "this is a video" to a human reviewer, not a real UI element. The final hero has no visible video controls at all.
  - Component must lazy-mount the `<video>` element only when it enters the viewport (`IntersectionObserver`), start from a poster image (`priority` `next/image`) as the actual LCP element so first paint is not blocked by video weight.
  - Wrap the video-vs-poster decision in a hook that also checks `window.matchMedia('(prefers-reduced-motion: reduce)')` and `navigator.connection?.saveData` where available, falling back to the poster image in both cases.
  - Headline, subhead, and CTA copy pull from `lib/constants/copy.ts`, not hardcoded JSX strings.
  - The "Next up: [tournament], [date]" microcopy line queries the same `tournaments` table used by Epic 6 (single active row) — do not duplicate tournament data entry.

---

## Epic 4 — Sponsor Marquee

- Pure CSS `@keyframes translateX` implementation, content list duplicated once in the DOM with `aria-hidden="true"` on the duplicate set — do not use a JS animation library for this.
- Pause via `animation-play-state: paused` on `:hover` and unconditionally under `prefers-reduced-motion: reduce`.
- Logos + names come from the `sponsors` table (Epic 9 admin panel manages this table) — render whatever is `active`, ordered by `sort_order`.

---

## Epic 5 — Sessions Section + Join Flow

This is the **only** section on the site with an internal form + payment step. Everything else (Epics 6 and 7) routes externally.

- Render only the next upcoming `sessions` row.
- "Join this Session" button → multi-step flow: registration form (React Hook Form + Zod) → payment step (shows Maybank account details + TouchNGo QR image, sourced from a `site_settings` record, not hardcoded) → file upload of payment proof to Supabase Storage → confirmation screen with a reference code.
- "Join the WhatsApp group" is a plain `wa.me` link built from `contact_settings.whatsapp_number` and a generic pre-filled message (see Epic 8 for the shared link-building helper) — no form, styled with lower visual weight than the primary CTA.
- Persist registrations to `session_registrations` with `status: 'pending'`.

---

## Epic 6 — Tournament Section (dynamic template, external hand-off)

> **Scope change from v1.0:** neither CTA in this section collects data on this site anymore. Build accordingly — there is no internal tournament registration form, no payment step, and no `tournament_*` submission tables to build.

- Build the single-tournament template per PRD Section 4.5, matching the two-column desktop / stacked mobile layout with icon rows for date, location, and fee, exactly as shown in the finalized reference image.
- Query the one active row from `tournaments` (where `registration_open = true`, most recent `starts_at`), including the new `team_registration_url` field.
- **"Join with a team"** → plain `<a>` to `tournament.team_registration_url`, `target="_blank" rel="noopener noreferrer"`. If that field is empty/null, render the button in a disabled state with the label "Registration link coming soon" instead of a dead link — do not fall back to a placeholder URL.
- **"Find a team"** → plain `<a>` built with the shared link helper (Epic 8) to `wa.me/{contact_settings.whatsapp_number}?text={encoded tournament-specific message}`. The message template comes from `contact_settings.whatsapp_find_team_message_template`, with `{tournament_title}` interpolated in — do not hardcode the message text in the component.
- No Supabase tables to create for tournament submissions. Remove/skip any earlier plan to build `tournament_team_registrations` or `tournament_find_a_team` — they are not needed.

---

## Epic 7 — Shop Section (browsable catalogue, external hand-off)

> **Scope change from v1.0:** the Shop no longer takes orders on-site. It is a browsable catalogue with images/prices/sizes that hands off to one external order form.

- Grid per PRD 4.6: 3 columns desktop, 2 tablet, 1 mobile, wrapping automatically as more `products` rows are added (`active = true`, ordered by `sort_order`).
- Each card's image area is an Embla Carousel bound to that product's `product_images`, ordered by `sort_order`.
- If a product has more than one image, attach `embla-carousel-autoplay` with a ~3.5s delay; autoplay must stop on user drag/tap and must not initialize at all under `prefers-reduced-motion: reduce`.
- "View and order" on each card is a plain external link: use the product's own `order_url` if set, otherwise fall back to the shop-level `site_settings.shop_order_url`. If neither is set, disable the button with a "Coming soon" label rather than linking nowhere.
- No product order form, no payment step, and no `product_orders` table for this section — remove that from scope if it was planned earlier.

---

## Epic 8 — About, Contact, Footer + Shared Link Helpers

- About and Footer: static sections, content sourced from `lib/constants/copy.ts`.
- Contact section: three fully clickable channel cards, matching the reference image's layout, each opening its real destination directly:
  - **WhatsApp card** → `wa.me` link using `contact_settings.whatsapp_number` + `contact_settings.whatsapp_generic_message` (different message text from the tournament "Find a team" link in Epic 6, but the same phone number — single source of truth).
  - **Email card** → `mailto:{contact_settings.email_address}?subject={encoded contact_settings.email_default_subject}`.
  - **Instagram card** → direct link to `contact_settings.instagram_url`, `target="_blank" rel="noopener noreferrer"`.
- Build one small shared helper module (`lib/links/`) that constructs all of these (`wa.me`, `mailto:`) from `contact_settings`/`site_settings` so the URL-building logic exists in exactly one place and is reused by: Contact section, Sessions "Join the WhatsApp group", and Tournament "Find a team". Do not re-implement the encoding/formatting logic separately in each component.

---

## Epic 9 — Admin Panel

- `/admin/login` — Supabase Auth email/password sign-in.
- `middleware.ts` protects all `/admin/*` routes except `/admin/login`, redirecting unauthenticated requests.
- `/admin` dashboard with links to: Tournament editor, Sessions editor, Shop editor, Sponsors editor, Contact settings editor, Registrations viewer.
- **Tournament editor**: single-record form bound to the `tournaments` schema — title, date/time, location, fee, description, rules, poster upload, registration_open toggle, and the **Team registration URL** field (plain text/URL input, e.g. their Google Form link). Poster upload goes to Supabase Storage; store the resulting public URL.
- **Sessions editor**: create/update the next session's date, time, note, capacity.
- **Shop editor**: full CRUD list + form for `products` (name, description, price, sizes, multi-image uploader with drag-to-reorder setting `product_images.sort_order`, and an optional per-product `order_url` override). Also exposes the section-level `site_settings.shop_order_url` field for the default catalogue-wide order link.
- **Sponsors editor**: CRUD list for `sponsors` (name, logo upload, active toggle, sort order).
- **Contact settings editor**: single-record form for `contact_settings` (WhatsApp number, generic WhatsApp message, find-a-team message template, email address, default email subject, Instagram URL).
- **Registrations viewer**: read-only list of **session registrations only** (the only on-site submission flow remaining) — payment-proof thumbnail per submission, with a manual "Mark confirmed" action.
- All mutations go through Next.js Server Actions using the Supabase service role key server-side only — verify the service role key never appears in any client-shipped JS bundle.

---

## Epic 10 — Payments Integration (Maybank + TouchNGo) — Sessions only

> **Scope change from v1.0:** this epic now applies only to the Sessions join flow (Epic 5). Tournament and Shop no longer have an on-site payment step — see Epics 6 and 7.

- No payment gateway API — this is manual, proof-of-payment based, per PRD Section 8 (Out of Scope: automated verification).
- Build a `<PaymentStep>` component, used by the Sessions join flow, that: shows a summary of what's owed, tabs between "Maybank transfer" (account name/number/reference code) and "TouchNGo QR" (QR image), and a file upload control for the proof screenshot/receipt (image or PDF, size-limited).
- Account details and QR image are placeholders until the organisers supply real ones (flagged in PRD Section 9) — implement them as `site_settings` fields, not hardcoded inline in the component, so swapping them later requires no code change.

---

## Epic 11 — Performance & Mobile-First QA

- Audit every section against breakpoints: 360px, 390px, 768px, 1024px, 1440px. Fix any overflow, overlap, or truncation issues at each.
- Run Lighthouse (mobile, simulated 4G) against the deployed Vercel preview. Target: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
- Confirm the hero video does not regress LCP — the poster image should be the LCP element, not the video.
- Confirm the sponsor marquee and shop carousel autoplay both fully respect `prefers-reduced-motion: reduce` (test via OS/browser setting, not just code review).
- Confirm every external link (`wa.me`, `mailto:`, Instagram, Google/Notion form links) opens correctly on both desktop and mobile, and that the disabled/"coming soon" fallback states render correctly when a URL field is empty.
- Run the "no hardcoded hex/copy" grep check from Epic 1 one more time as a final gate.

---

## Epic 12 — Security Hardening

- Verify RLS policies exist and are correct for every table per PRD Section 6 (public read on active/open content, public insert only on `session_registrations`, all writes elsewhere admin-only).
- Add basic rate-limiting (e.g. a simple IP+timestamp check in the server action, or Vercel's built-in protections) to the `session_registrations` insert endpoint to prevent spam submissions.
- Validate file uploads server-side (mimetype allow-list, max size) in addition to client-side Zod validation — never trust the client alone.
- Confirm all environment secrets are only referenced in server-side files (`lib/supabase/server.ts`, server actions, route handlers) and never in files that ship to the browser.

---

## Epic 13 — Deployment

- Final production deploy to Vercel (Hobby). Confirm environment variables are set in the Vercel project settings, not just locally.
- Confirm Supabase project is on the Free Plan with the migrations from `supabase/migrations/` applied.
- Document the deploy process and environment variable list in a `README.md` at the project root for the organisers' future reference (they are non-technical, so keep this plain-language). Include a short note on where to paste the real Google/Notion form links, WhatsApp number, and Maybank/TouchNGo details once the organisers supply them (per PRD Section 9).

---

## General rules that apply across every epic

- Match `Landing_Page.png` exactly for anything it shows. Ask (leave a `// ASSUMPTION:` comment) rather than guess for anything it doesn't show.
- No hardcoded color values or copy strings anywhere outside `globals.css` and `lib/constants/`. This includes external destinations — WhatsApp numbers, email addresses, Instagram URLs, and Google/Notion form links all come from `contact_settings`/`site_settings`/`tournaments`/`products`, never typed directly into a component.
- Mobile-first: write the base (no-prefix) Tailwind classes for the smallest viewport first, then layer `md:`/`lg:` overrides — never the reverse.
- Every animated/autoplaying element (hero video, marquee, shop carousel) must respect `prefers-reduced-motion: reduce`.
- Every external service used must have a permanent free tier at this project's scale — flag anything that doesn't before adding it as a dependency.
