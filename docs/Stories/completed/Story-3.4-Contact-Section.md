# Story 3.4 — Contact Section

**Epic:** Epic 3 — Dynamic Sections & User Flows
**Priority:** Medium
**Estimate:** 3 story points
**Sprint:** 4
**Dependencies:** Story 2.5, Story 3.1
**Design Reference:** `docs/Design/Landing Page.svg` (below y4290)

---

## User Story

As a developer,
I want a Contact section with three fully clickable cards (WhatsApp, Email, Instagram),
so that users can reach us directly via their preferred channel using admin-configured contact details.

---

## Acceptance Criteria

### Layout
- [ ] Full-width section with dark background (`bg-background`)
- [ ] Section ID: `id="contact"` for smooth-scroll navigation
- [ ] Section headline: "Contact" (Inter, large, `text-foreground`)
- [ ] Subtitle: "reach us directly." (`text-secondary`)
- [ ] Three cards in a row on desktop, stacked on mobile
- [ ] Each card: fully clickable (entire card is a link), icon + label + detail

### Contact Cards
1. **WhatsApp Card**
   - Icon: WhatsApp logo or phone icon (use shadcn `Phone` icon or SVG)
   - Label: "WhatsApp"
   - Detail: phone number (formatted from `contact_settings.whatsapp_number`)
   - Link: `buildGenericWhatsAppLink(contact)` → `target="_blank" rel="noopener noreferrer"`

2. **Email Card**
   - Icon: email icon (use shadcn `Mail` icon)
   - Label: "Email"
   - Detail: email address (from `contact_settings.email_address`)
   - Link: `buildEmailLink(contact)` → `target="_blank" rel="noopener noreferrer"`

3. **Instagram Card**
   - Icon: Instagram icon (use shadcn `Instagram` icon or SVG)
   - Label: "Instagram"
   - Detail: "@boundlessfc" or handle (from `contact_settings.instagram_url`)
   - Link: `buildInstagramLink(contact.instagram_url)` → `target="_blank" rel="noopener noreferrer"`

### Card Behavior
- [ ] Entire card is wrapped in an `<a>` tag (not just a button inside)
- [ ] Cards have hover state: subtle background change or border highlight
- [ ] Cards have border: `border-border-subtle`
- [ ] Cards are keyboard-focusable and accessible

### Data Source
- [ ] Contact data fetched from Supabase `contact_settings` singleton table (Server Component)
- [ ] Fields used: `whatsapp_number`, `email_address`, `instagram_url`
- [ ] Fallback: if `contact_settings` doesn't exist, render with placeholder values

### Link Helpers
- [ ] WhatsApp: `buildGenericWhatsAppLink()` from `src/lib/links/index.ts`
- [ ] Email: `buildEmailLink()` from `src/lib/links/index.ts`
- [ ] Instagram: `buildInstagramLink()` from `src/lib/links/index.ts`

### Responsive
- [ ] Desktop: three cards in a row (3-col grid)
- [ ] Mobile: stacked vertically (single column)

### Accessibility
- [ ] Section uses `<section>` element with `aria-labelledby`
- [ ] Each card has `role="link"` or is a proper `<a>` element
- [ ] Icon + text have sufficient contrast
- [ ] Cards are keyboard-focusable

### Copy Source
- [ ] Headline from `src/lib/constants/copy.ts` — add `CONTACT_HEADLINE`
- [ ] Subtitle from `src/lib/constants/copy.ts` — add `CONTACT_SUBTITLE`
- [ ] Card labels from `src/lib/constants/copy.ts` — add `CONTACT_WHATSAPP_LABEL`, `CONTACT_EMAIL_LABEL`, `CONTACT_INSTAGRAM_LABEL`

### Verification
- [ ] `npm run build` succeeds
- [ ] Zero hardcoded hex values in `ContactSection.tsx`
- [ ] Zero hardcoded copy strings in `ContactSection.tsx`
- [ ] All three cards link to correct external channels
- [ ] WhatsApp link includes generic message
- [ ] Email link includes default subject
- [ ] Instagram link opens correct profile
- [ ] Fallback rendering works when contact_settings is empty

---

## Technical Notes

### File Structure
```
src/
  components/
    blocks/
      ContactSection.tsx         → Main contact component (REPLACE PLACEHOLDER)
  lib/
    constants/
      copy.ts                    → Add CONTACT_* constants
    links/
      index.ts                   → All 3 link helpers already exist
    supabase/
      server.ts                  → Already exists
```

### Key Imports
```tsx
// src/components/blocks/ContactSection.tsx
import { Phone, Mail, Instagram } from "lucide-react";
import {
  CONTACT_HEADLINE,
  CONTACT_SUBTITLE,
  CONTACT_WHATSAPP_LABEL,
  CONTACT_EMAIL_LABEL,
  CONTACT_INSTAGRAM_LABEL,
} from "@/lib/constants/copy";
import {
  buildGenericWhatsAppLink,
  buildEmailLink,
  buildInstagramLink,
} from "@/lib/links";
import { createClient } from "@/lib/supabase/server";
```

### Data Fetching Pattern (Server Component)
```tsx
async function getContactSettings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_settings")
    .select("whatsapp_number, email_address, instagram_url")
    .eq("id", "singleton")
    .single();
  return data;
}
```

### Card Component Pattern
```tsx
function ContactCard({ icon: Icon, label, detail, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center p-6 border border-border-subtle rounded-lg
                 hover:bg-accent/5 transition-colors cursor-pointer"
    >
      <Icon className="w-8 h-8 text-foreground mb-3" />
      <h3 className="text-foreground font-semibold">{label}</h3>
      <p className="text-secondary text-sm mt-1">{detail}</p>
    </a>
  );
}
```

### Design Details (from SVG at 1440px)
- Cards: equal width, ~30% each with gaps
- Card styling: dark background, border, centered content
- Icons: large, `text-foreground`
- Labels: medium text, `text-foreground`
- Detail text: small, `text-secondary`
- Hover: subtle background change

---

## Definition of Done

- [ ] `npm run build` passes
- [ ] Contact section renders with 3 clickable cards
- [ ] WhatsApp link opens wa.me with correct number + message
- [ ] Email link opens mailto with correct address + subject
- [ ] Instagram link opens correct profile
- [ ] Responsive layout verified on mobile/desktop
- [ ] Zero hardcoded values in component
- [ ] Story moved to `docs/Stories/completed/`
