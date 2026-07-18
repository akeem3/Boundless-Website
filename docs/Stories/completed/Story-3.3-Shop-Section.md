# Story 3.3 — Shop Section

**Epic:** Epic 3 — Dynamic Sections & User Flows
**Priority:** Medium
**Estimate:** 5 story points
**Sprint:** 4
**Dependencies:** Story 2.5, Story 3.1
**Design Reference:** `docs/Design/Landing Page.svg` (y3300–y4290)

---

## User Story

As a developer,
I want a Shop section that displays products with image carousels and links to an external order form,
so that users can browse merchandise and order via an admin-configured external link (Google/Notion form).

---

## Acceptance Criteria

### Layout
- [ ] Section with light cream background: `bg-accent/10` or similar warm cream tone
- [ ] Section ID: `id="shop"` for smooth-scroll navigation
- [ ] Section headline: "Shop" (Inter, large, `text-foreground`)
- [ ] Subtitle: "Rep the community. All orders go through our external form." (`text-secondary`)
- [ ] Product grid: 3 columns on desktop, 1 column on mobile
- [ ] Each product card: image carousel on top, details below

### Product Card
- [ ] Image carousel: uses shadcn `Carousel` component with autoplay
- [ ] Carousel shows one image at a time, with dots/indicators
- [ ] Product name below carousel (`text-foreground`)
- [ ] Price in orange wine color (`text-primary` or custom) — e.g., "RM 45"
- [ ] Sizes: "S, M, L, XL" displayed as text (`text-secondary`)
- [ ] "View and order" button: orange accent, links to external order form
- [ ] Product card has border: `border-border-subtle`

### Image Carousel
- [ ] Uses shadcn `Carousel` + `CarouselContent` + `CarouselItem` from `src/components/ui/carousel.tsx`
- [ ] Autoplay: 3-second interval using `Autoplay` plugin from `embla-carousel-autoplay`
- [ ] Pause on hover
- [ ] Responsive: single image visible at a time
- [ ] Fallback: if no images, show placeholder or empty state

### Data Source
- [ ] Products fetched from Supabase `products` table (Server Component)
- [ ] Query: `SELECT * FROM products ORDER BY created_at DESC`
- [ ] Fields used: `id`, `name`, `price`, `sizes`, `images` (array of storage paths), `product_order_url`
- [ ] Storage images resolved via Supabase storage public URLs
- [ ] Fallback: if no products, render empty state message

### Order Link
- [ ] Each product's "View and order" button links to external form
- [ ] URL priority: `product.product_order_url` → `site_settings.shop_order_url` → fallback `#`
- [ ] Use `buildProductOrderLink()` from `src/lib/links/index.ts`
- [ ] All order links: `target="_blank" rel="noopener noreferrer"`

### Responsive
- [ ] Desktop: 3-column grid
- [ ] Tablet: 2-column grid
- [ ] Mobile: single column, full-width cards

### Accessibility
- [ ] Section uses `<section>` element with `aria-labelledby`
- [ ] Product images have meaningful `alt` text (product name)
- [ ] Carousel has `aria-label` for screen readers
- [ ] CTA buttons are keyboard-focusable

### Copy Source
- [ ] Headline from `src/lib/constants/copy.ts` — add `SHOP_HEADLINE`
- [ ] Subtitle from `src/lib/constants/copy.ts` — add `SHOP_SUBTITLE`
- [ ] CTA text from `src/lib/constants/copy.ts` — add `SHOP_CTA_TEXT`

### Dependencies
- [ ] `embla-carousel-react` installed (already in package.json)
- [ ] `embla-carousel-autoplay` installed (already in package.json)
- [ ] shadcn `Carousel` component exists at `src/components/ui/carousel.tsx`

### Verification
- [ ] `npm run build` succeeds
- [ ] Zero hardcoded hex values in `ShopSection.tsx`
- [ ] Zero hardcoded copy strings in `ShopSection.tsx`
- [ ] Product images load from Supabase storage
- [ ] Carousel autoplay works and pauses on hover
- [ ] "View and order" links open correct external forms
- [ ] Fallback rendering works when no products exist
- [ ] Section has warm cream background (distinct from other dark sections)

---

## Technical Notes

### File Structure
```
src/
  components/
    blocks/
      ShopSection.tsx            → Main shop component (REPLACE PLACEHOLDER)
  lib/
    constants/
      copy.ts                    → Add SHOP_* constants
    links/
      index.ts                   → buildProductOrderLink() already exists
    supabase/
      server.ts                  → Already exists
```

### Key Imports
```tsx
// src/components/blocks/ShopSection.tsx
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
  SHOP_HEADLINE,
  SHOP_SUBTITLE,
  SHOP_CTA_TEXT,
} from "@/lib/constants/copy";
import { buildProductOrderLink } from "@/lib/links";
import { createClient } from "@/lib/supabase/server";
```

### Data Fetching Pattern (Server Component)
```tsx
async function getProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

async function getShopOrderUrl() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("shop_order_url")
    .eq("id", "singleton")
    .single();
  return data?.shop_order_url ?? "#";
}
```

### Carousel Pattern (Client Component)
```tsx
"use client";
import Autoplay from "embla-carousel-autoplay";

// Inside component:
<Carousel
  plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]}
  opts={{ loop: true }}
>
  <CarouselContent>
    {images.map((src, i) => (
      <CarouselItem key={i}>
        <Image src={src} alt={name} width={400} height={300} />
      </CarouselItem>
    ))}
  </CarouselContent>
</Carousel>
```

### Design Details (from SVG at 1440px)
- Background: light cream (`#FAEAC2` at reduced opacity or `bg-accent/10`)
- Product grid: 3 columns, ~320px each
- Card border: `0.3px solid var(--border-subtle)`
- Price color: orange wine (`text-primary` or `text-secondary`)
- CTA button: orange accent, full-width on card
- Carousel indicators: small dots below image

### Important Notes
- `ShopSection.tsx` must be a **Client Component** (`"use client"`) because it uses Carousel (interactive)
- The Server Component pattern for data fetching should be extracted to a separate wrapper or use `React.use()` if needed
- Alternative: make ShopSection a server component that renders a client `ProductCard` sub-component

---

## Definition of Done

- [ ] `npm run build` passes
- [ ] Shop section renders with products from Supabase
- [ ] Image carousels autoplay and pause on hover
- [ ] "View and order" links open correct external forms
- [ ] Warm cream background distinct from other sections
- [ ] Responsive layout verified on mobile/desktop/tablet
- [ ] Zero hardcoded values in component
- [ ] Story moved to `docs/Stories/completed/`
