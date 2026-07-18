# Epic 3 — Dynamic Sections & User Flows

**Epic Owner:** Full-Stack Engineer
**Status:** Ready for Build
**Depends On:** Epic 2
**Blocks:** Epic 4

---

## Outcome Statement

Build the four dynamic content sections (Sessions, Tournaments, Shop, Contact) with their respective user flows — all external hand-off patterns driven by Supabase data and admin-configurable, with shared link-building helpers that ensure zero hardcoded external URLs. No data is collected on this site.

---

## Problem Context

The landing page has four sections that pull data from Supabase and drive user actions:

1. **Sessions** — displays the next upcoming session with two external CTAs (Google Form for registration, WhatsApp for group join). All links are admin-configurable.
2. **Tournaments** — displays the active tournament with two CTAs that route to external channels (Google Form for team registration, WhatsApp for find-a-team).
3. **Shop** — browsable product catalogue with image carousels that routes to an external order form.
4. **Contact** — three clickable cards (WhatsApp, Email, Instagram) that deep-link directly to real destinations.

The key architectural decision: **no data is collected on this site**. All sections route externally. This simplifies the data model, reduces security surface, and aligns with how the organizers already work (Google Forms, WhatsApp, external order forms).

---

## Solution Approach

### 1. Shared Link Helpers (`src/lib/links/index.ts`)

Build ONE shared module that constructs all external URLs from database values. Every component that links externally uses these helpers — never constructs URLs inline.

```typescript
// src/lib/links/index.ts

interface ContactSettings {
  whatsapp_number: string;
  whatsapp_generic_message: string;
  whatsapp_find_team_message_template: string;
  email_address: string;
  email_default_subject: string;
  instagram_url: string;
}

export function buildWhatsAppLink(number: string, message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

export function buildMailtoLink(email: string, subject: string): string {
  const encoded = encodeURIComponent(subject);
  return `mailto:${email}?subject=${encoded}`;
}

export function buildFindTeamLink(
  contact: ContactSettings,
  tournamentTitle: string
): string {
  const message = contact.whatsapp_find_team_message_template
    .replace("{tournament_title}", tournamentTitle);
  return buildWhatsAppLink(contact.whatsapp_number, message);
}

export function buildGenericWhatsAppLink(contact: ContactSettings): string {
  return buildWhatsAppLink(contact.whatsapp_number, contact.whatsapp_generic_message);
}

export function buildEmailLink(contact: ContactSettings): string {
  return buildMailtoLink(contact.email_address, contact.email_default_subject);
}

export function buildProductOrderLink(
  productOrderUrl: string | null,
  shopOrderUrl: string
): string | null {
  return productOrderUrl || shopOrderUrl || null;
}
```

**Reuse across components:**
- Contact section → `buildGenericWhatsAppLink`, `buildEmailLink`, direct Instagram link
- Sessions "Join WhatsApp group" → `buildGenericWhatsAppLink`
- Sessions "Join this Session" → reads `contact_settings.session_join_url` directly
- Tournament "Find a team" → `buildFindTeamLink`
- Shop "View and order" → `buildProductOrderLink`

### 2. Sessions Section (`src/components/blocks/SessionsSection.tsx`)

**Data Source:** Query the next upcoming session from `sessions` table:
```typescript
const { data } = await supabase
  .from('sessions')
  .select('*')
  .gte('starts_at', new Date().toISOString())
  .order('starts_at', { ascending: true })
  .limit(1)
  .single();
```

**Layout (from `docs/Design/Landing Page.svg`):**
- Section headline: "Weekly Sessions"
- Subtext: "Two ways in — join the group chat, or come straight to the next session below."
- Session card with:
  - Date: large number ("11") + month ("JULY") on left
  - Details: "Next session — Bukit Jalil Futsal Court", "4–6PM. Bibs and balls provided."
  - CTA: "Join this Session" button (orange, primary)
- Secondary link: "Join the WhatsApp group" (top-right of section, lower visual weight)

**"Join this Session" — External Link:**
- Reads `contact_settings.session_join_url` (admin-configurable Google Form URL)
- If URL is set: opens in new tab with `target="_blank" rel="noopener noreferrer"`
- If URL is null: disabled button with "Coming soon" label
- No internal form, no payment step, no data collection

**"Join the WhatsApp group" Link:**
- Uses `buildGenericWhatsAppLink(contact)` from shared helpers
- Styled with lower visual weight (ghost button or text link)
- Opens `wa.me` link in new tab

### 3. Tournament Section (`src/components/blocks/TournamentSection.tsx`)

**Data Source:** Query active tournament:
```typescript
const { data } = await supabase
  .from('tournaments')
  .select('*')
  .eq('registration_open', true)
  .order('starts_at', { ascending: false })
  .limit(1)
  .single();
```

**Layout (from `docs/Design/Landing Page.svg`):**

**Desktop:** Two columns
- Left column: Headline + icon rows + description + CTAs
- Right column: Tournament poster image

**Mobile:** Single column, poster first (stacked)
- Poster image on top
- Headline below
- Icon rows
- Description
- CTAs

**Icon Rows (matching reference design):**
- Calendar icon + "Sat, 1 Aug 2026 - 3:00 PM"
- Pin icon + "Bukit Jalil Futsal Court, KL"
- Ticket icon + "RM200 per team"

**Description:** "Countries face off, 5-a-side. Min. 5 players same one nationality, up to 8 per squad. Bring a team, or come alone and we'll place you on one."

**Dual CTA — Both External:**

1. **"Join with a team"** button:
   ```tsx
   <a
     href={tournament.team_registration_url}
     target="_blank"
     rel="noopener noreferrer"
     className={cn(
       "inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium",
       tournament.team_registration_url
         ? "bg-primary text-primary-foreground hover:bg-primary/90"
         : "bg-muted text-muted-foreground cursor-not-allowed"
     )}
     aria-disabled={!tournament.team_registration_url}
   >
     {tournament.team_registration_url ? "Join with a team" : "Registration link coming soon"}
   </a>
   ```
   - If `team_registration_url` is null/empty: disabled state with "Registration link coming soon"
   - No fallback URL, no placeholder — graceful degradation

2. **"Find a team"** button:
   ```tsx
   <a
     href={buildFindTeamLink(contactSettings, tournament.title)}
     target="_blank"
     rel="noopener noreferrer"
     className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-medium"
   >
     Find a Team
   </a>
   ```
   - Uses shared `buildFindTeamLink` helper
   - Message template from `contact_settings.whatsapp_find_team_message_template`
   - `{tournament_title}` interpolated — NOT hardcoded in component

**Copy Note:** "Join with a team" — you already have players. "Find a team" — we'll place you on one that needs a player." (from reference design)

### 4. Shop Section (`src/components/blocks/ShopSection.tsx`)

**Data Source:** Query active products with images:
```typescript
const { data: products } = await supabase
  .from('products')
  .select('*, product_images(*)')
  .eq('active', true)
  .order('sort_order');

const { data: siteSettings } = await supabase
  .from('site_settings')
  .select('shop_order_url')
  .single();
```

**Layout (from `docs/Design/Landing Page.svg`):**
- Section headline: "Shop"
- Subtext: "Add your name and number free — the shirt is printed either way."
- Product grid: 3 columns desktop, 2 tablet, 1 mobile
- Each card wraps to new row automatically as products are added

**Product Card:**
- Image area: Embla Carousel bound to `product_images`, ordered by `sort_order`
- If >1 image: attach `embla-carousel-autoplay` with 3.5s delay
- Autoplay must stop on user drag/tap
- Autoplay must NOT initialize under `prefers-reduced-motion: reduce`

```typescript
const [prefersReducedMotion] = usePrefersReducedMotion();
const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

useEffect(() => {
  if (!emblaApi || prefersReducedMotion) return;
  const autoplay = emblaAutoplay(emblaApi, { delay: 3500, stopOnInteraction: true });
  return () => autoplay.destroy();
}, [emblaApi, prefersReducedMotion]);
```

- Product name, price (RM XX), sizes displayed below carousel
- "View and order" button: external link
  - Uses `buildProductOrderLink(product.order_url, siteSettings.shop_order_url)`
  - If both are null: disabled button with "Coming soon" label

### 5. Contact Section (`src/components/blocks/ContactSection.tsx`)

**Data Source:** Query `contact_settings` singleton:
```typescript
const { data: contact } = await supabase
  .from('contact_settings')
  .select('*')
  .single();
```

**Layout (from `docs/Design/Landing Page.svg`):**
- Section headline: "Contact"
- Subtext: "reach us directly."
- Three clickable cards in a row (stacks on mobile)

**Card 1: WhatsApp**
- WhatsApp icon + "WhatsApp" label
- Phone number displayed
- Click → `buildGenericWhatsAppLink(contact)` → `wa.me` deep link
- Opens in new tab

**Card 2: Email**
- Email icon + "Email" label
- Email address displayed
- Click → `buildEmailLink(contact)` → `mailto:` link
- Opens default email client

**Card 3: Instagram**
- Instagram icon + "Instagram" label
- Handle displayed
- Click → `contact.instagram_url` → `instagram.com` link
- Opens in new tab with `rel="noopener noreferrer"`

**Card Styling:** Each card is fully clickable (entire card is the link), with hover state showing subtle background change.

---

## Acceptance Criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Sessions section shows only next upcoming session | Create test session in past/future, verify correct one displays |
| 2 | "Join this Session" opens external Google Form | Set URL in admin, verify link opens in new tab |
| 3 | "Join this Session" shows disabled state when URL is null | Clear URL in admin, verify disabled button with "coming soon" |
| 4 | "Join WhatsApp group" opens `wa.me` link | Click link, verify WhatsApp opens with correct message |
| 5 | Tournament section shows active tournament | Check `tournaments` table, verify correct row displays |
| 6 | "Join with a team" links to `team_registration_url` | Set URL in admin, verify link works |
| 7 | "Join with a team" shows disabled state when URL is null | Clear URL in admin, verify disabled button with "coming soon" |
| 8 | "Find a team" opens `wa.me` with tournament-specific message | Verify message contains tournament title |
| 9 | Shop grid shows 3/2/1 columns at desktop/tablet/mobile | Test at 1440px, 768px, 375px |
| 10 | Product carousel auto-advances every ~3.5s | Watch carousel, verify timing |
| 11 | Carousel pauses on user interaction | Drag carousel, verify autoplay stops |
| 12 | Carousel does NOT autoplay under `prefers-reduced-motion` | Toggle OS setting, verify no autoplay |
| 13 | "View and order" links to product `order_url` or shop-level URL | Test both scenarios |
| 14 | "View and order" shows disabled "Coming soon" when no URL set | Clear all order URLs, verify disabled state |
| 15 | Contact cards are fully clickable | Click each card, verify correct destination |
| 16 | WhatsApp links use shared helper, not hardcoded URLs | Grep for `wa.me` in components — should only be in `lib/links/` |
| 17 | Email links use shared helper, not hardcoded URLs | Grep for `mailto:` in components — should only be in `lib/links/` |
| 18 | All external links open in new tab with `rel="noopener noreferrer"` | Inspect link elements |

---

## Out of Scope

- Tournament registration forms (delegated to external Google Form)
- Shop order forms (delegated to external order form)
- Session registration forms (delegated to external Google Form)
- Any on-site data collection — all CTAs route externally
- Product order data collection (external form only)

---

## Assumptions

- External Google/Notion form URLs will be entered via admin panel post-launch
- WhatsApp number, email address, and Instagram handle will be confirmed before launch
- Product photography will be uploaded to Supabase Storage via admin panel
