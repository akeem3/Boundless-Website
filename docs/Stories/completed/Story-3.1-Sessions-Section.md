# Story 3.1 — Sessions Section

**Epic:** Epic 3 — Dynamic Sections & User Flows
**Priority:** High
**Estimate:** 5 story points
**Sprint:** 4
**Dependencies:** Story 2.5
**Design Reference:** `docs/Design/Landing Page.svg` (y1332–y2168)

---

## User Story

As a developer,
I want a Sessions section that shows upcoming session details with two external CTAs (WhatsApp group + Google Form),
so that users can quickly join the community or register for the next session via admin-configured links.

---

## Acceptance Criteria

### Layout
- [ ] Full-width section with dark background (`bg-background`)
- [ ] Section ID: `id="sessions"` for smooth-scroll navigation
- [ ] Section headline: "Weekly Sessions" (Inter, large, `text-foreground`)
- [ ] Subtitle: "Two ways in — join the group chat, or come straight to the next session below." (`text-secondary`)
- [ ] Session card: single card with border (`border-border-subtle`), padding, max-width constrained
- [ ] Card layout: left side = session details, right side = CTA button (responsive: stacked on mobile)

### Session Card Content
- [ ] Date display: large number + abbreviated month (e.g., "18" stacked above "Jul")
- [ ] Session time: "Every Tuesday & Friday, 8:30 PM"
- [ ] Location: "Jalan 2/14, Taman Bukit Jalil"
- [ ] Description: "Casual drop-in sessions — just show up."
- [ ] Orange CTA button: "Join this Session" — links to external Google Form (`session_join_url` from `contact_settings`)
- [ ] "Join the WhatsApp group" link at top-right of card — links to WhatsApp with `whatsapp_generic_message` from `contact_settings`

### Data Source
- [ ] Session data fetched from Supabase `contact_settings` singleton table (Server Component)
- [ ] Fields used: `session_join_url`, `whatsapp_number`, `whatsapp_generic_message`
- [ ] Fallback: if `contact_settings` row doesn't exist, render section with placeholder links (`#`)

### Link Behavior
- [ ] "Join this Session" button: `target="_blank" rel="noopener noreferrer"`
- [ ] "Join the WhatsApp group" link: `target="_blank" rel="noopener noreferrer"`
- [ ] WhatsApp link built using `buildGenericWhatsAppLink()` from `src/lib/links/index.ts`
- [ ] Session join link uses `buildProductOrderLink()` pattern or direct URL from `contact_settings.session_join_url`

### Responsive
- [ ] Desktop: card with date + details + CTA in a row
- [ ] Mobile: stacked layout — date on top, details below, CTA full-width

### Accessibility
- [ ] Section uses `<section>` element with `aria-labelledby` pointing to headline
- [ ] CTA buttons are keyboard-focusable
- [ ] External links have `target="_blank"` with `rel="noopener noreferrer"`

### Copy Source
- [ ] Headline from `src/lib/constants/copy.ts` — add `SESSIONS_HEADLINE`
- [ ] Subtitle from `src/lib/constants/copy.ts` — add `SESSIONS_SUBTITLE`
- [ ] Session time from `src/lib/constants/copy.ts` — add `SESSIONS_TIME`
- [ ] Session location from `src/lib/constants/copy.ts` — add `SESSIONS_LOCATION`
- [ ] Session description from `src/lib/constants/copy.ts` — add `SESSIONS_DESCRIPTION`

### Verification
- [ ] `npm run build` succeeds
- [ ] Zero hardcoded hex values in `SessionsSection.tsx`
- [ ] Zero hardcoded copy strings in `SessionsSection.tsx`
- [ ] Section visible and styled correctly on desktop and mobile
- [ ] External links open in new tabs
- [ ] Fallback rendering works when `contact_settings` is empty

---

## Technical Notes

### File Structure
```
src/
  components/
    blocks/
      SessionsSection.tsx        → Main sessions component (REPLACE PLACEHOLDER)
  lib/
    constants/
      copy.ts                    → Add SESSIONS_* constants
    supabase/
      server.ts                  → Already exists, used for data fetch
```

### Key Imports
```tsx
// src/components/blocks/SessionsSection.tsx
import { Button } from "@/components/ui/button";
import {
  SESSIONS_HEADLINE,
  SESSIONS_SUBTITLE,
  SESSIONS_TIME,
  SESSIONS_LOCATION,
  SESSIONS_DESCRIPTION,
} from "@/lib/constants/copy";
import { buildGenericWhatsAppLink } from "@/lib/links";
import { createClient } from "@/lib/supabase/server";
```

### Data Fetching Pattern (Server Component)
```tsx
async function getSessionSettings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_settings")
    .select("session_join_url, whatsapp_number, whatsapp_generic_message")
    .eq("id", "singleton")
    .single();
  return data;
}
```

### Design Details (from SVG at 1440px)
- Card border: `0.3px solid var(--border-subtle)` (cream at 30% opacity)
- Date number: large font, `text-foreground`
- Month abbreviation: smaller font, `text-secondary`
- CTA button: `bg-primary text-primary-foreground` (orange accent)
- "Join WhatsApp" link: `text-secondary`, underlined or styled as link
- Card max-width: ~800px centered

---

## Definition of Done

- [ ] `npm run build` passes
- [ ] Sessions section renders with Supabase data or fallback
- [ ] Both external CTAs work (WhatsApp + Google Form)
- [ ] Responsive layout verified on mobile/desktop
- [ ] Zero hardcoded values in component
- [ ] Story moved to `docs/Stories/completed/`
