# Story 3.2 — Tournaments Section

**Epic:** Epic 3 — Dynamic Sections & User Flows
**Priority:** High
**Estimate:** 5 story points
**Sprint:** 4
**Dependencies:** Story 2.5
**Design Reference:** `docs/Design/Landing Page.svg` (y2168–y3300)

---

## User Story

As a developer,
I want a Tournaments section that displays the latest tournament with poster, event details, and two external CTAs,
so that users can join a team or find teammates via admin-configured external links.

---

## Acceptance Criteria

### Layout
- [ ] Full-width section with dark background (`bg-background`)
- [ ] Section ID: `id="tournaments"` for smooth-scroll navigation
- [ ] Two-column layout: left = text content (6/12 cols), right = poster image (6/12 cols)
- [ ] Responsive: stacked on mobile — poster first, then text content

### Left Column — Text Content
- [ ] Section headline: "Upcoming Tournament" (Inter, large, `text-foreground`)
- [ ] Event details with icons (use simple text icons or shadcn icons):
  - Calendar icon + date: "August 1st, 2026" (`text-secondary`)
  - Map pin icon: "Bukit Jalil, KL" (`text-secondary`)
  - Ticket icon: "Entry: RM30/person" (`text-secondary`)
- [ ] Description paragraph: "Our biggest tournament yet. 40+ nationalities, one pitch." (`text-secondary`)
- [ ] Two CTA buttons side-by-side:
  - Primary (orange): "Join with a team" → external link from `tournaments.register_url`
  - Secondary (ghost/border): "Find a team" → WhatsApp link with team-finding message template

### Right Column — Poster Image
- [ ] Tournament poster image displayed in a card-like container
- [ ] Image from `tournaments.poster_url` (Supabase storage URL or admin-provided)
- [ ] Border on image container: `border-border-subtle`
- [ ] Fallback: if no poster, show a placeholder or empty state

### Data Source
- [ ] Tournament data fetched from Supabase `tournaments` table (Server Component)
- [ ] Query: `SELECT * FROM tournaments ORDER BY event_date DESC LIMIT 1`
- [ ] Fields used: `title`, `event_date`, `location`, `description`, `poster_url`, `register_url`
- [ ] Fallback: if no tournaments exist, render section with placeholder content

### Link Behavior
- [ ] "Join with a team" button: `target="_blank" rel="noopener noreferrer"`, links to `tournament.register_url`
- [ ] "Find a team" button: `target="_blank" rel="noopener noreferrer"`, links to WhatsApp via `buildFindTeamLink()`
- [ ] WhatsApp link uses `whatsapp_find_team_message_template` from `contact_settings` with `{tournament_title}` replaced

### Responsive
- [ ] Desktop: two columns (text left, poster right)
- [ ] Mobile: stacked — poster on top (full-width), text below
- [ ] CTA buttons stack vertically on mobile

### Accessibility
- [ ] Section uses `<section>` element with `aria-labelledby`
- [ ] Poster image has meaningful `alt` text (tournament title)
- [ ] CTA buttons are keyboard-focusable

### Copy Source
- [ ] Headline from `src/lib/constants/copy.ts` — add `TOURNAMENTS_HEADLINE`
- [ ] Description from `src/lib/constants/copy.ts` — add `TOURNAMENTS_DESCRIPTION`
- [ ] CTA text from `src/lib/constants/copy.ts` — add `TOURNAMENTS_CTA_JOIN`, `TOURNAMENTS_CTA_FIND`

### Verification
- [ ] `npm run build` succeeds
- [ ] Zero hardcoded hex values in `TournamentSection.tsx`
- [ ] Zero hardcoded copy strings in `TournamentSection.tsx`
- [ ] Poster image loads from Supabase storage
- [ ] External links open in new tabs
- [ ] "Find a team" WhatsApp message includes tournament title
- [ ] Fallback rendering works when no tournaments exist

---

## Technical Notes

### File Structure
```
src/
  components/
    blocks/
      TournamentSection.tsx      → Main tournament component (REPLACE PLACEHOLDER)
  lib/
    constants/
      copy.ts                    → Add TOURNAMENTS_* constants
    links/
      index.ts                   → buildFindTeamLink() already exists
    supabase/
      server.ts                  → Already exists
```

### Key Imports
```tsx
// src/components/blocks/TournamentSection.tsx
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  TOURNAMENTS_HEADLINE,
  TOURNAMENTS_DESCRIPTION,
  TOURNAMENTS_CTA_JOIN,
  TOURNAMENTS_CTA_FIND,
} from "@/lib/constants/copy";
import { buildFindTeamLink } from "@/lib/links";
import { createClient } from "@/lib/supabase/server";
```

### Data Fetching Pattern (Server Component)
```tsx
async function getLatestTournament() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tournaments")
    .select("*")
    .order("event_date", { ascending: false })
    .limit(1)
    .single();
  return data;
}

async function getContactSettings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_settings")
    .select("whatsapp_number, whatsapp_find_team_message_template")
    .eq("id", "singleton")
    .single();
  return data;
}
```

### Design Details (from SVG at 1440px)
- Left column width: ~48% (6/12 cols)
- Right column width: ~48% (6/12 cols)
- Poster image: aspect-ratio ~3/4 (portrait), contained in card with border
- Icon rows: small icons with text, stacked vertically
- CTA buttons: orange primary + outlined secondary, side-by-side
- Card border on poster: `0.3px solid var(--border-subtle)`

---

## Definition of Done

- [ ] `npm run build` passes
- [ ] Tournaments section renders with latest tournament from Supabase
- [ ] Poster image loads and displays correctly
- [ ] "Join with a team" links to external registration
- [ ] "Find a team" links to WhatsApp with correct message template
- [ ] Responsive layout verified on mobile/desktop
- [ ] Zero hardcoded values in component
- [ ] Story moved to `docs/Stories/completed/`
