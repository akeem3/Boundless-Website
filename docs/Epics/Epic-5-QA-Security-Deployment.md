# Epic 5 — QA, Security & Deployment

**Epic Owner:** Engineering Lead
**Status:** Ready for Build
**Depends On:** Epics 1–4
**Blocks:** None (final epic)

---

## Outcome Statement

Validate the complete site against all breakpoints and performance targets, harden security (RLS, rate limiting, secret management), and deploy to production on Vercel with proper documentation for non-technical organizers.

---

## Problem Context

The site must load fast on mid-range Android phones over 4G (Lighthouse mobile ≥ 90 performance), respect accessibility preferences, correctly handle all external deep-links, and run entirely within free-tier limits. Security must ensure public users can only read data, admin mutations are protected, and secrets never leak to the client bundle. The final deployment must be documented in plain language for non-technical organizers who will need to update external URLs and contact details post-launch.

---

## Solution Approach

### 1. Performance Audit

**Lighthouse Targets (mobile, simulated 4G):**
| Metric | Target |
|---|---|
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | ≥ 90 |

**Hero Video Verification:**
- Poster image must be the LCP element, not the video
- Video must lazy-load via IntersectionObserver (not eagerly on mount)
- `prefers-reduced-motion: reduce` must render poster only, no video element
- `navigator.connection.saveData` must fall back to poster
- Video file must be ≤ 3-4MB (compressed via ffmpeg: H.264 MP4 + WebM fallback)

**Animated Elements Verification:**
- Sponsor marquee: CSS-only animation, pauses on hover and under `prefers-reduced-motion`
- Shop carousel autoplay: pauses on user interaction, does not initialize under `prefers-reduced-motion`
- Hero video: respects all three checks (IntersectionObserver, reduced motion, saveData)

### 2. Mobile-First Responsive Audit

**Breakpoints to Test:**

| Breakpoint | Device Class | Key Checks |
|---|---|---|
| 360px | Small Android | No horizontal scroll, no overlap, text readable |
| 390px | iPhone 12/13 | Standard mobile layout correct |
| 768px | Tablet | 2-column grid for shop, nav switches to desktop |
| 1024px | Small laptop | Full desktop layout, all sections correct |
| 1440px | Desktop | Max-width container centered, no stretching |

**Per-Section Checks:**

| Section | Mobile Behavior | Desktop Behavior |
|---|---|---|
| Nav | Hamburger → Sheet menu | Horizontal links + CTA button |
| Hero | Full-bleed, text wraps, CTA full-width | Full-bleed, text centered |
| Marquee | Logos scale down, no overflow | Logos at full size |
| Sessions | Card stacks, CTA full-width | Card inline, CTA right-aligned |
| Tournaments | Poster first, stacked layout | Two-column, poster right |
| Shop | 1 column | 3 columns |
| About | Text stacks above image | Two-column, text left |
| Contact | Cards stack vertically | Cards in a row |
| Footer | Links stack | Links inline |

**Common Issues to Check:**
- No horizontal overflow (`overflow-x: hidden` on body if needed)
- No text truncation at small viewports
- Touch targets ≥ 44px for mobile tap
- Images scale correctly with `next/image`

### 3. External Link Verification

**Deep Links to Test:**

| Link Type | Expected Behavior | Test Method |
|---|---|---|
| WhatsApp (`wa.me`) | Opens WhatsApp app or web | Click on mobile + desktop |
| Email (`mailto:`) | Opens default email client | Click on mobile + desktop |
| Instagram | Opens Instagram app or web | Click on mobile + desktop |
| Tournament registration | Opens Google/Notion form in new tab | Click, verify new tab |
| Shop order form | Opens external form in new tab | Click, verify new tab |

**Fallback States to Test:**
- Tournament "Join with a team" with empty `team_registration_url`: disabled button with "Registration link coming soon"
- Shop "View and order" with no `order_url` and no `shop_order_url`: disabled button with "Coming soon"
- WhatsApp links with missing `whatsapp_number`: should not render broken link

### 4. Security Hardening

**RLS Policies (verify in Supabase dashboard):**

| Table | Public SELECT | Admin UPDATE/DELETE |
|---|---|---|
| `tournaments` | Yes (where `registration_open = true`) | Yes |
| `sessions` | Yes | Yes |
| `session_registrations` | No | Yes |
| `products` | Yes (where `active = true`) | Yes |
| `product_images` | Yes | Yes |
| `sponsors` | Yes (where `active = true`) | Yes |
| `contact_settings` | Yes | Yes |
| `site_settings` | Yes | Yes |

**File Upload Security:**
- Server-side validation: mimetype allow-list (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`)
- Max file size: 5MB (validated both client-side via Zod and server-side in Server Action)
- Supabase Storage policies: only authenticated admin can upload to protected buckets

**Secret Management Audit:**

| Secret | Location | Client Exposure |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local`, `lib/supabase/client.ts` | Public (intentional) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local`, `lib/supabase/client.ts` | Public (intentional) |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local`, `lib/supabase/server.ts`, Server Actions | **Server-only** |

**Verification:**
```bash
# Should only match server-side files
grep -r "SUPABASE_SERVICE_ROLE_KEY" src/ --include='*.ts' --include='*.tsx'
```

### 5. Hardcoded Value Audit

**Final grep checks (must return zero matches outside allowed locations):**

```bash
# No raw hex colors outside globals.css
grep -r '#[0-9a-fA-F]\{3,6\}' src/ --include='*.tsx' --include='*.ts' --exclude='globals.css'

# No hardcoded English copy outside lib/constants/
grep -r '"[A-Z][a-z]' src/components/ --include='*.tsx' | grep -v 'import\|className\|aria-'

# No hardcoded WhatsApp numbers, emails, or Instagram URLs
grep -r 'wa.me\|mailto:\|instagram.com' src/components/ --include='*.tsx'
```

### 6. Deployment

**Vercel Production Deploy:**
1. Push to `main` branch (or trigger deploy manually)
2. Verify environment variables are set in Vercel project settings (not just locally)
3. Confirm build succeeds on Vercel
4. Test all functionality on production URL

**Supabase Production:**
1. Verify project is on Free Plan
2. Apply all migrations from `supabase/migrations/`
3. Create Storage buckets: `tournament-posters`, `product-images`, `sponsor-logos`
4. Set up RLS policies (verify in dashboard)
5. Create admin user via Supabase Auth dashboard

**Documentation (`README.md` at project root):**

Plain-language document for non-technical organizers covering:

1. **Project Overview** — what the site does, who it's for
2. **Tech Stack** — Next.js, Supabase, Vercel (no jargon)
3. **How to Update Content** — step-by-step for each admin panel section:
   - Tournament: "Go to Admin → Tournament, fill in the form, click Save"
   - Sessions: "Go to Admin → Sessions, create a new session"
   - Shop: "Go to Admin → Shop, add products with photos"
   - Sponsors: "Go to Admin → Sponsors, upload logo images"
   - Contact: "Go to Admin → Contact, update WhatsApp number, email, Instagram"
4. **Where to Paste External URLs** — tournament registration form link, shop order form link, session join Google Form link
5. **Where to Update Contact Info** — WhatsApp number, email address, Instagram handle (in admin Contact Settings)
6. **Deploy Process** — "Push code to GitHub, Vercel auto-deploys"
7. **Environment Variables** — list of all env vars and where they're used

### 7. Final Smoke Tests

| Test | Expected Result |
|---|---|
| Visit production URL | Landing page loads, all sections visible |
| Click "Join a session" in nav | Scrolls to Sessions section |
| Click "Join this Session" | External Google Form opens in new tab (or disabled if no URL) |
| Click "Join the WhatsApp group" | WhatsApp opens with pre-filled message |
| Click "View the upcoming tournament" | Scrolls to Tournaments section |
| Click "Join with a team" | External form opens in new tab (or disabled if no URL) |
| Click "Find a team" | WhatsApp opens with tournament-specific message |
| Click "View and order" on product | External form opens in new tab (or disabled if no URL) |
| Click WhatsApp card in Contact | WhatsApp opens with generic message |
| Click Email card in Contact | Email client opens with pre-filled subject |
| Click Instagram card in Contact | Instagram opens in new tab |
| Log in to admin panel | Dashboard loads with all editors |
| Update tournament in admin | Landing page reflects changes |
| Add product in shop | Product appears in Shop section |
| Verify no horizontal scroll at 360px | Clean layout, no overflow |
| Run Lighthouse mobile | Performance ≥ 90, Accessibility ≥ 95 |

---

## Acceptance Criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Lighthouse mobile Performance ≥ 90 | Run Lighthouse on production URL |
| 2 | Lighthouse mobile Accessibility ≥ 95 | Run Lighthouse on production URL |
| 3 | LCP < 2.5s on simulated 4G | Lighthouse or WebPageTest |
| 4 | Hero poster is LCP element | Lighthouse LCP metric |
| 5 | `prefers-reduced-motion` respected everywhere | Toggle OS setting, test all animated elements |
| 6 | All breakpoints tested (360, 390, 768, 1024, 1440) | Visual inspection |
| 7 | No horizontal overflow at any breakpoint | Browser dev tools |
| 8 | All external links work on desktop and mobile | Manual testing |
| 9 | Disabled fallback states render correctly | Clear URL fields in admin, verify buttons |
| 10 | RLS policies correct for all tables | Supabase dashboard verification |
| 11 | File uploads validated server-side | Try invalid file type via curl |
| 12 | Service role key server-only | Grep verification |
| 13 | No hardcoded hex/copy outside allowed locations | Grep verification |
| 14 | Production deploy succeeds on Vercel | Check Vercel dashboard |
| 15 | README.md exists with plain-language docs | Check file contents |

---

## Out of Scope

- Multi-language support
- Native mobile app
- Performance monitoring beyond Lighthouse (no paid APM tools)
- A/B testing or analytics (no paid tools per budget constraint)

---

## Assumptions
- Organizers will supply real content (photos, videos, form URLs) post-launch
- The site will not exceed free-tier limits at current scale (400 members)
- Single admin user is sufficient for this scale
- No custom domain required for v1 (Vercel default URL is acceptable)
