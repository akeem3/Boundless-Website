# Epic 4 — Admin Panel & Content Management

**Epic Owner:** Full-Stack Engineer
**Status:** Ready for Build
**Depends On:** Epic 3
**Blocks:** Epic 5

---

## Outcome Statement

Build a password-protected admin panel at `/admin` that enables non-technical volunteer organizers to update tournaments, sessions, shop products, sponsors, contact settings, and view session registrations — all through Server Actions with the Supabase service role key, without touching code or exposing secrets to the client bundle.

---

## Problem Context

Boundless FC has 4 volunteer organizers who are not technical. They need to:
- Update the active tournament (title, date, poster, registration URL)
- Create/update weekly sessions
- Manage the shop catalogue (add products, upload images, set prices)
- Maintain the sponsor logo list
- Update contact channels (WhatsApp number, email, Instagram URL)
- View and confirm session registrations

All mutations must go through Next.js Server Actions using the Supabase service role key server-side only. The anon key (client-exposed) is read-only via RLS policies.

---

## Solution Approach

### 1. Authentication

**Login Page (`src/app/admin/login/page.tsx`):**
- Email/password sign-in using Supabase Auth
- Simple form with email input, password input, submit button
- On success, redirect to `/admin`
- On failure, show error message

**Middleware Protection (`src/middleware.ts`):**
- Extend existing middleware to protect all `/admin/*` routes except `/admin/login`
- Unauthenticated requests redirect to `/admin/login`
- Use Supabase `auth.getUser()` to check session

```typescript
// In middleware.ts
const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
const isLoginRoute = request.nextUrl.pathname === '/admin/login';

if (isAdminRoute && !isLoginRoute) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}
```

### 2. Admin Layout (`src/app/admin/layout.tsx`)

- Sidebar navigation with links to all editors
- Top bar with user email and logout button
- Responsive: sidebar collapses to hamburger on mobile

**Navigation Links:**
- Dashboard
- Tournament Editor
- Sessions Editor
- Shop Editor
- Sponsors Editor
- Contact Settings
- Registrations

### 3. Dashboard (`src/app/admin/page.tsx`)

- Quick links to all editors with icons
- Last updated timestamps for each section
- Recent registrations count (if available)

### 4. Tournament Editor (`src/app/admin/tournament/page.tsx`)

**Form Fields (single-record form):**
| Field | Type | Source |
|---|---|---|
| Title | text input | `tournaments.title` |
| Date & Time | datetime-local input | `tournaments.starts_at` |
| Location | text input | `tournaments.location` |
| Fee (MYR) | number input | `tournaments.fee_myr` |
| Description | textarea | `tournaments.description` |
| Rules | textarea | `tournaments.rules` |
| Poster Image | file upload → Supabase Storage | `tournaments.poster_url` |
| Registration Open | toggle/switch | `tournaments.registration_open` |
| Team Registration URL | URL input | `tournaments.team_registration_url` |

**Implementation:**
- Load current tournament record on mount
- Form uses React Hook Form + Zod validation
- Poster upload: upload to Supabase Storage bucket `tournament-posters`, store public URL
- Save action: Server Action that upserts the single tournament record
- Success/error toast notifications (shadcn Sonner)

**Server Action:**
```typescript
// src/app/actions/tournament.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveTournament(formData: TournamentFormData) {
  const supabase = await createClient();
  
  // Handle poster upload if present
  let posterUrl = formData.poster_url;
  if (formData.poster_file) {
    const { data, error } = await supabase.storage
      .from('tournament-posters')
      .upload(`poster-${Date.now()}`, formData.poster_file);
    if (error) throw error;
    posterUrl = supabase.storage.from('tournament-posters').getPublicUrl(data.path).data.publicUrl;
  }
  
  const { error } = await supabase
    .from('tournaments')
    .upsert({
      id: formData.id || undefined,
      title: formData.title,
      starts_at: formData.starts_at,
      location: formData.location,
      fee_myr: formData.fee_myr,
      description: formData.description,
      rules: formData.rules,
      poster_url: posterUrl,
      registration_open: formData.registration_open,
      team_registration_url: formData.team_registration_url || null,
    });
  
  if (error) throw error;
}
```

### 5. Sessions Editor (`src/app/admin/sessions/page.tsx`)

**Form Fields:**
| Field | Type | Source |
|---|---|---|
| Date & Time | datetime-local input | `sessions.starts_at` |
| Location | text input | `sessions.location` |
| Note | textarea | `sessions.note` |
| Capacity | number input | `sessions.capacity` |

**Implementation:**
- List view showing upcoming sessions
- Create new session / edit existing
- Server Action for CRUD operations

### 6. Shop Editor (`src/app/admin/shop/page.tsx`)

**Product Form Fields:**
| Field | Type | Source |
|---|---|---|
| Name | text input | `products.name` |
| Description | textarea | `products.description` |
| Price (MYR) | number input | `products.price_myr` |
| Sizes | multi-select/text input | `products.sizes` (text[]) |
| Sort Order | number input | `products.sort_order` |
| Active | toggle/switch | `products.active` |
| Order URL (optional) | URL input | `products.order_url` |
| Product Images | multi-file upload | `product_images` |

**Image Upload Implementation:**
- Upload multiple files to Supabase Storage bucket `product-images`
- Store each image URL in `product_images` table with `sort_order`
- Support drag-to-reorder (use `@dnd-kit/core` or simple up/down arrows)
- Show image previews with delete option

**Section-Level Settings:**
- `site_settings.shop_order_url` field (single URL input)
- This is the default order URL for all products unless overridden

**Server Actions:**
```typescript
// src/app/actions/shop.ts
'use server'

export async function saveProduct(formData: ProductFormData) {
  // Upsert product record
  // Upload new images to Supabase Storage
  // Insert image records into product_images
  // Delete removed images from Storage and product_images
}

export async function deleteProduct(productId: string) {
  // Delete product and cascade delete images
}
```

### 7. Sponsors Editor (`src/app/admin/sponsors/page.tsx`)

**Form Fields:**
| Field | Type | Source |
|---|---|---|
| Name | text input | `sponsors.name` |
| Logo Image | file upload | `sponsors.logo_url` |
| Sort Order | number input | `sponsors.sort_order` |
| Active | toggle/switch | `sponsors.active` |

**Implementation:**
- List view with drag-to-reorder (simple up/down buttons)
- Upload logo to Supabase Storage bucket `sponsor-logos`
- Server Action for CRUD

### 8. Contact Settings Editor (`src/app/admin/contact/page.tsx`)

**Single-Record Form:**
| Field | Type | Source |
|---|---|---|
| WhatsApp Number | text input | `contact_settings.whatsapp_number` |
| Generic WhatsApp Message | textarea | `contact_settings.whatsapp_generic_message` |
| Find-a-Team Message Template | textarea | `contact_settings.whatsapp_find_team_message_template` |
| Email Address | email input | `contact_settings.email_address` |
| Default Email Subject | text input | `contact_settings.email_default_subject` |
| Instagram URL | URL input | `contact_settings.instagram_url` |

**Note:** This is a singleton record (always id = 'singleton'). Load on mount, save on submit.

### 9. Registrations Viewer (`src/app/admin/registrations/page.tsx`)

**Read-Only List:**
- Table showing all `session_registrations` rows
- Columns: Name, WhatsApp, Session Date, Payment Method, Status, Submitted At
- Payment proof thumbnail (click to view full size)
- Manual "Mark Confirmed" button per row

**Implementation:**
- Server Action to update `status` from 'pending' to 'confirmed'
- Pagination if > 50 registrations
- Filter by status (pending/confirmed/all)

### 10. File Upload Security

**Client-Side:**
- Zod validation for file type and size
- Accept only: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- Max size: 5MB

**Server-Side (Supabase Storage Policies):**
- Bucket-level policies restricting upload to authenticated admin role
- File type validation via Storage API
- Never trust client-side validation alone

### 11. Server Actions Architecture

All mutations go through Next.js Server Actions:

```
src/app/actions/
  tournament.ts    → saveTournament
  sessions.ts      → createSession, updateSession, deleteSession
  shop.ts          → saveProduct, deleteProduct, saveShopSettings
  sponsors.ts      → saveSponsor, deleteSponsor, reorderSponsors
  contact.ts       → saveContactSettings
  registrations.ts → confirmRegistration
```

**Security Rules:**
- All actions use `createClient()` from `lib/supabase/server.ts` (service role key)
- Verify user is authenticated before any mutation
- Never expose service role key to client bundle
- Validate all inputs server-side (never trust client)

---

## Acceptance Criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | `/admin/login` shows email/password form | Navigate to `/admin`, verify redirect to login |
| 2 | Valid credentials grant access to dashboard | Log in, verify dashboard loads |
| 3 | Invalid credentials show error | Try wrong password, verify error message |
| 4 | `/admin/*` routes redirect to login when unauthenticated | Open incognito, navigate to `/admin/tournament` |
| 5 | Tournament editor loads current record | Create tournament in Supabase, verify form populates |
| 6 | Poster upload stores file in Supabase Storage | Upload image, verify it appears in Storage bucket |
| 7 | Tournament save upserts record | Fill form, submit, check Supabase table |
| 8 | Sessions editor creates/edits sessions | Create session, verify it appears in list |
| 9 | Shop editor manages products with images | Create product with images, verify display |
| 10 | Image upload supports drag-to-reorder | Upload 3 images, reorder them, verify sort_order updates |
| 11 | Sponsors editor manages logo list | Add sponsor, verify it appears in marquee |
| 12 | Contact settings editor updates singleton record | Change WhatsApp number, verify it reflects in Contact section |
| 13 | Registrations viewer shows session registrations | Submit registration via public form, verify it appears |
| 14 | "Mark Confirmed" updates registration status | Click button, verify status changes to 'confirmed' |
| 15 | Service role key never in client JS bundle | `grep -r "service_role" src/ --include='*.tsx' --include='*.ts'` — should only match server-side files |
| 16 | All file uploads validated server-side | Try uploading invalid file type via curl, verify rejection |

---

## Out of Scope

- Multi-admin roles/permissions (single admin role sufficient)
- Automated payment verification (manual proof-of-payment only)
- Real-time updates (polling or manual refresh sufficient)
- Image optimization beyond `next/image` defaults

---

## Assumptions

- A single Supabase Auth user will be created for the admin (email/password provided by organizers)
- Supabase Storage buckets will be created: `payment-proofs`, `tournament-posters`, `product-images`, `sponsor-logos`
- Organizers will supply Maybank account details and TouchNGo QR image for the Sessions payment step
- The admin panel is for internal use only — security hardening is sufficient, not enterprise-grade
