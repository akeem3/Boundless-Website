# Boundless FC — Product Requirements Document

**Version:** 1.1
**Status:** Ready for build
**Reference design:** `Landing_Page.png` (finalized, pixel reference — see Section 4 for per-section rules)
**Budget constraint:** $0. Every service used must run on a permanent free tier (Vercel Hobby, Supabase Free Plan). No paid CDNs, no paid video hosts, no paid fonts.

**Changelog:** v1.1 — Tournament "Join with a team" and the entire Shop section now route to admin-configurable **external links** (Google Form / Notion form) instead of an internal registration + payment flow. Tournament "Find a team" now deep-links to WhatsApp with an auto-filled message, reusing the same WhatsApp number as the Contact section. Contact section channels (WhatsApp, Email, Instagram) are now each directly clickable/deep-linked. Sessions remain the only flow with an internal form + Maybank/TouchNGo payment step. See Sections 4.5, 4.6, 4.7, 5, 6, 8 for details.

---

## 1. Overview

Boundless FC is an international grassroots futsal/football community based in Bukit Jalil, Kuala Lumpur — 400+ members from 50+ countries, running two sessions a week and roughly four tournaments a year. The website is a single-page marketing + operations site: it introduces the community, drives concrete actions (join a session, join/find a team for the upcoming tournament, browse the shop), and gives the four volunteer organisers a lightweight admin panel to update tournament and shop content without touching code.

This is not a content-heavy CMS. It is one public landing page backed by a small number of dynamic sections, plus a password-protected admin area.

## 2. Goals

1. Convert visitors into session attendees with minimal on-site friction (form → payment proof → confirmation), and into tournament/shop leads by routing them cleanly to the organisers' existing external forms.
2. Let non-technical organisers update the active tournament, its external registration link, the shop catalogue, and contact channels themselves.
3. Load fast and look correct on a mid-range Android phone on 4G — the majority of the audience is mobile.
4. Cost nothing to run at current scale.

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router, TypeScript) | SSR/ISR for fast first paint, free on Vercel Hobby |
| UI components | shadcn/ui (Radix + Tailwind) | Owned code, accessible primitives, themeable via CSS variables |
| Styling | Tailwind CSS v4 + CSS variables in `globals.css` | Single source of truth for the design system, no hardcoded colors |
| Carousel | Embla Carousel (+ `embla-carousel-autoplay` plugin) | Same engine shadcn's own carousel is built on; lightweight, no license cost |
| Forms | React Hook Form + Zod | Type-safe validation for the Sessions registration form and all admin forms |
| Backend | Supabase (Postgres, Auth, Storage) | Free tier covers this scale; RLS gives per-table security without a custom API layer |
| Hosting | Vercel (Hobby) | Free, native Next.js support, automatic image optimization |
| Media | Self-hosted, ffmpeg-compressed MP4/WebM in Supabase Storage or `/public` | No paid video CDN allowed by budget constraint |
| Icons | Lucide (bundled with shadcn) | Free, tree-shakeable |

## 4. Section-by-Section Requirements

> The build agent must treat `Landing_Page.png` as the literal source of truth for layout, spacing, type scale, and color for every section below. Nothing visual should be invented; where this PRD is silent on a visual detail, the screenshot decides.

### 4.1 Navigation
- Logo + crest, left. Links: Sessions, Tournaments, Shop, About, Contact, center/right. "Join a session" button, right.
- Mobile: collapse into a hamburger / sheet menu (shadcn `Sheet`). Nav must be sticky on scroll.

### 4.2 Hero
- Full-bleed **looping background video**, muted, autoplay, no controls, not interactive (the play-button icon seen in an earlier rough mock was only indicating "this is a video" to a human reviewer — omit it in build).
- Headline, subhead, one primary CTA ("View the upcoming tournament") linking to the Tournament section, plus a "Next up: [tournament name], [date]" microcopy line, pulled dynamically from the active tournament row.
- **Performance requirement (hard constraint):** video must never block or slow first paint.
  - Serve a compressed, audio-stripped MP4 (H.264) with a WebM fallback, encoded via ffmpeg, target ≤ 3–4MB for a 6–10s loop.
  - `<video autoplay muted loop playsInline preload="none" poster="hero-poster.jpg">` — always ship a static poster image as the first paint.
  - Only mount/load the `<video>` source once it scrolls into view (IntersectionObserver) — do not eagerly load on page mount.
  - Respect `prefers-reduced-motion: reduce` — render the poster image only, no video element, in that case.
  - On connections reporting `navigator.connection.saveData` or slow effective type (where supported), fall back to the static poster instead of loading video.

### 4.3 Sponsor / Partner Marquee
- Infinite horizontal loop of partner logos, scrolling edge-to-edge continuously, no visible seam.
- Implementation: pure CSS `@keyframes` translateX loop with the logo list duplicated once in the DOM (`aria-hidden="true"` on the duplicate) — no JavaScript animation loop, for performance.
- Pause the animation on hover (desktop) and unconditionally when `prefers-reduced-motion: reduce` is set.
- Logo list is admin-editable (see Data Model — `sponsors` table); marquee re-renders from whatever is active.

### 4.4 Sessions
- Shows only the **next upcoming session** (not a recurring schedule statement) — date, time block, location, short note, capacity indicator.
- Single CTA: "Join this Session" → registration form → payment step (Maybank transfer details + TouchNGo QR) → proof-of-payment upload → confirmation screen. This is the **only** internal form + payment flow in the whole site. This is the only session-related CTA on the page; do not duplicate a "join" CTA elsewhere for sessions.
- Secondary, low-emphasis option in the same section: "Join the WhatsApp group" — a direct `wa.me` link (see 4.7 for the shared WhatsApp number), no form.

### 4.5 Tournament (single active tournament template)

> **Updated in v1.1:** neither tournament CTA opens an internal form on this site. Both route out to channels the organisers already manage.

One tournament is "active" at a time and is rendered from a single Supabase row — organisers create a new row (or flip a flag) when a new tournament is announced; the frontend needs zero code changes for a new tournament.

**Fields (all admin-editable, see Data Model):**
- Tournament name/title
- Date + time
- Location
- Entry fee (per team)
- Description / value-proposition copy
- Poster image (uploaded per tournament)
- Rules text (e.g. squad size, nationality mix rule)
- Registration status (open / closed)
- **Team registration URL** — external link (typically a Google Form), set per-tournament by the admin

**Layout:** two columns on desktop (details + icon rows on the left, poster on the right), single column stacked on mobile with the poster first. Icon rows for date, location, and fee (calendar / pin / ticket icons), per the finalized design.

**Dual CTA — both external, no data collected on this site for tournaments:**
- **"Join with a team"** — opens the admin-set **Team registration URL** in a new tab (e.g. the tournament's Google Form or Notion form). If no URL is set for the active tournament, disable the button and show "Registration link coming soon" rather than a broken link.
- **"Find a team"** — opens a `wa.me` deep link to the community WhatsApp number (same number as the Contact section, single source of truth — see 4.7 and Data Model) with a **pre-filled message** generated from the active tournament, e.g.: *"Hi Boundless! I'd like to join a team for {tournament title} — I don't have a full squad yet."* No form, no page — it's a one-tap handoff into a real conversation with the organisers, who match solo players manually.

### 4.6 Shop

> **Updated in v1.1:** the Shop section no longer collects orders on this site. It is a browsable catalogue that hands off to one external order form.

- Fully admin-editable product catalogue (see Data Model — `products`, `product_images`), used purely for **display** — name, price, sizes, and swipeable photos per product.
- Grid: **max 3 product cards per row** on desktop, reflowing to fewer columns on smaller breakpoints (2 on tablet, 1 on mobile), wrapping to additional rows as more products are added — no hardcoded row limit in the schema, only in the CSS grid.
- Each product card supports an **arbitrary number of images**, swipeable (Embla Carousel, touch/drag enabled).
- If a product has more than one image, the carousel **auto-advances every few seconds** (configurable constant, default 3.5s) to showcase multiple angles, pausing on user interaction (drag/tap) and on hover, and pausing fully under `prefers-reduced-motion: reduce`.
- One admin-configurable **Shop order URL** (a single external Google Form or Notion form covering the whole catalogue, since the organisers take orders that way already) lives at the section level. Every product's "View and order" button opens this same external link in a new tab — the on-site catalogue is for browsing/deciding, the external form is for actually placing the order.
- If the admin needs a form specific to one product in future, the `products` table includes an optional per-product `order_url` override that takes precedence over the shop-level link when set — this is available but not required for v1.

### 4.7 About, Contact, Footer

> **Updated in v1.1:** every contact channel is now directly actionable, not just displayed as text.

- About and Footer: static content as already finalized in the reference design.
- Contact section renders three channel cards, each fully clickable and each opening the real destination directly:
  - **WhatsApp** — `wa.me` deep link using the community WhatsApp number, with a generic pre-filled message (e.g. *"Hi Boundless! I have a question."*) different from the tournament-specific message used by "Find a team" in 4.5, but pointing at the same underlying number.
  - **Email** — `mailto:` link to the community address, pre-filled with a sensible default subject (e.g. `mailto:hello@boundlessfc.com?subject=Question%20from%20the%20website`).
  - **Instagram** — direct link to `instagram.com/boundless_fc` (or whatever handle is configured), opening in a new tab.
- The WhatsApp number, email address, and Instagram URL live in one admin-editable settings record (see Data Model — `contact_settings`) so they are defined once and reused everywhere they appear (Contact section, Sessions "Join the WhatsApp group", Tournament "Find a team").

## 5. Admin Panel

- Route: `/admin`, protected by Supabase Auth (email/password), gated via Next.js middleware — unauthenticated requests redirect to `/admin/login`.
- Single admin role is sufficient at this scale (no multi-role permission system needed).
- Screens:
  - **Dashboard** — quick links to the editable modules.
  - **Tournament editor** — form bound to the single active-tournament schema (see 4.5): title, date/time, location, fee, description, rules, poster upload, registration_open toggle, and the **Team registration URL** field (external link). No internal registrations to review for tournaments — that data now lives in the organisers' Google/Notion form.
  - **Sessions editor** — create/update the next session's date, time, note, capacity.
  - **Shop editor** — CRUD for products (name, description, price, sizes, multi-image uploader with drag-to-reorder), plus the section-level **Shop order URL** field and the optional per-product `order_url` override.
  - **Sponsors editor** — CRUD for the marquee logo list.
  - **Contact settings editor** — single record: WhatsApp number, generic WhatsApp message template, tournament find-a-team message template, email address, default email subject, Instagram URL.
  - **Registrations viewer** — read-only list of **session** registrations only (the only flow that still collects data on-site), with a payment-proof thumbnail and a manual "mark confirmed" action.
- All writes go through Next.js Server Actions calling Supabase with the service role key on the server only — the anon key (client-exposed) is read-only via RLS policies.

## 6. Data Model (Supabase / Postgres)

| Table | Key columns |
|---|---|
| `tournaments` | id, title, starts_at, location, fee_myr, description, rules, poster_url, registration_open (bool), team_registration_url (text, nullable), created_at |
| `sessions` | id, starts_at, location, note, capacity, spots_taken, created_at |
| `session_registrations` | id, session_id, name, whatsapp, payment_method, proof_url, status, created_at |
| `products` | id, name, description, price_myr, sizes (text[]), sort_order, active (bool), order_url (text, nullable — overrides shop-level link when set), created_at |
| `product_images` | id, product_id, image_url, sort_order |
| `sponsors` | id, name, logo_url, sort_order, active (bool) |
| `contact_settings` | id (singleton row), whatsapp_number, whatsapp_generic_message, whatsapp_find_team_message_template, email_address, email_default_subject, instagram_url |
| `site_settings` | id (singleton row), shop_order_url |
| `admin_users` | managed via Supabase Auth, no custom table needed for a single admin |

RLS: public `select` allowed on `tournaments`, `sessions`, `products`, `product_images`, `sponsors`, `contact_settings`, `site_settings` where applicable (`active`/`registration_open` filters as relevant); public `insert` allowed only on `session_registrations` (rate-limited); all `update`/`delete` restricted to the authenticated admin role.

**Removed from v1.0:** `tournament_team_registrations`, `tournament_find_a_team`, and `product_orders` tables are no longer needed — tournament team registration happens on the organisers' external form, tournament find-a-team happens over WhatsApp, and shop orders happen on the external shop order form. None of these need to be captured or stored by this site.

## 7. Non-Functional Requirements

- **Mobile-first, not "responsive as an afterthought."** Design and build every component starting at a 375px viewport, then scale up. Breakpoints to test explicitly: 360px, 390px, 768px, 1024px, 1440px.
- **Performance budget:** Lighthouse mobile score ≥ 90 performance, ≥ 95 accessibility. LCP < 2.5s on simulated 4G. The hero video is the highest-risk element for this budget — see 4.2 for mandatory mitigations.
- **Images:** all served through `next/image` for automatic resizing/format negotiation (WebP/AVIF), never raw `<img>` for content images.
- **Accessibility:** respect `prefers-reduced-motion` everywhere motion is used (hero video, marquee, carousel autoplay). All interactive elements keyboard-navigable (inherited from Radix primitives via shadcn). External links (`wa.me`, `mailto:`, Instagram, Google/Notion forms) open in a new tab with `rel="noopener noreferrer"`.
- **Security:** RLS on every table (see Section 6); file uploads restricted by type (image/video mimetypes only) and size on both client and Supabase Storage policy; no secrets in client bundles — service role key stays server-only.
- **No hardcoded copy or color values.** All copy strings live in a central constants/content file (or are admin-editable per Section 6); all colors, spacing, radius, and typography values live in `globals.css` as CSS variables per shadcn's theming convention — components reference tokens (`bg-primary`, `text-foreground`, etc.), never raw hex values or inline styles. This includes the WhatsApp/email/Instagram destinations and message templates — none of these are hardcoded in components, all come from `contact_settings`/`site_settings`.
- **Cost:** must run entirely within Vercel Hobby + Supabase Free Plan limits at current membership scale (400 members, a few hundred form submissions per quarter is well within free-tier request/storage/bandwidth caps).

## 8. Out of Scope (v1)

- Automated payment verification/webhooks for Sessions (Maybank transfer + TouchNGo QR are manual, proof-of-payment based).
- Any on-site data collection for tournament registration, find-a-team matching, or shop orders — these are intentionally delegated to external forms/WhatsApp per Sections 4.5–4.6.
- Multi-admin roles/permissions.
- Multi-language support.
- Native mobile app.

## 9. Open Assumptions to Confirm Before Build

- Exact Maybank account details and TouchNGo QR image to be supplied by the organisers before the Sessions payment step is built.
- Final hero video footage must be supplied and will need ffmpeg compression per Section 4.2 before integration.
- Real product photography for the shop is still pending (currently placeholder in the wireframe) — the build should support any number of images per product regardless of when photography is delivered.
- The actual Google/Notion form URLs (tournament team registration, shop orders) will be supplied by the organisers and entered via the admin panel post-launch — the build should treat these as empty/nullable at launch and handle that state gracefully (disabled button + "coming soon" label) rather than assuming a placeholder URL.
- WhatsApp number, email address, and Instagram handle to be confirmed as final before the Contact settings record is seeded.
