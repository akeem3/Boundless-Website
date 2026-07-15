# Story 1.3 — Supabase Infrastructure

**Epic:** Epic 1 — Foundation & Design System
**Priority:** High
**Estimate:** 5 story points
**Sprint:** 2
**Dependencies:** Story 1.1
**Design Reference:** None

---

## User Story

As a developer,
I want the Supabase project configured with database schema, security policies, and storage buckets,
so that the application has a secure, version-controlled backend ready for feature development.

---

## Acceptance Criteria

### Supabase Project
- [x] Supabase project created (Free Tier)
- [x] `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [x] `.env.local` is git-ignored

### Database Schema
- [x] Migration file created: `src/supabase/migrations/001_initial_schema.sql`
- [x] All 8 tables created with correct columns, types, and constraints:

| Table | Key Columns |
|---|---|
| `tournaments` | id, title, starts_at, location, fee_myr, description, rules, poster_url, registration_open, team_registration_url |
| `sessions` | id, starts_at, location, note, capacity, spots_taken |
| `session_registrations` | id, session_id, name, whatsapp, payment_method, proof_url, status |
| `products` | id, name, description, price_myr, sizes, sort_order, active, order_url |
| `product_images` | id, product_id, image_url, sort_order |
| `sponsors` | id, name, logo_url, sort_order, active |
| `contact_settings` | id (singleton), whatsapp_number, whatsapp_generic_message, whatsapp_find_team_message_template, email_address, email_default_subject, instagram_url |
| `site_settings` | id (singleton), shop_order_url |

- [x] CHECK constraints on `session_registrations.payment_method` (`maybank` or `tng`)
- [x] CHECK constraints on `session_registrations.status` (`pending` or `confirmed`)
- [x] CASCADE delete on `product_images.product_id`

### Row Level Security
- [x] RLS enabled on all 8 tables
- [x] Public SELECT on content tables (with `active`/`registration_open` filters)
- [x] Public INSERT on `session_registrations` only
- [x] Admin ALL on all tables for authenticated role

### Storage Buckets
- [x] 4 buckets created: `payment-proofs`, `tournament-posters`, `product-images`, `sponsor-logos`
- [x] File size limit: 5MB
- [x] MIME type restrictions: images and PDFs
- [x] Authenticated upload policies
- [x] Public read policies

### Admin User
- [x] Admin user created in Supabase Auth (email/password)

### Verification
- [x] Supabase client imports work on server and client
- [x] `npm run build` succeeds

---

## Technical Notes

### Migration File
```sql
-- Create all tables
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

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  note TEXT,
  capacity INTEGER NOT NULL DEFAULT 20,
  spots_taken INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE session_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('maybank', 'tng')),
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true
);

CREATE TABLE contact_settings (
  id UUID PRIMARY KEY DEFAULT 'singleton',
  whatsapp_number TEXT NOT NULL,
  whatsapp_generic_message TEXT NOT NULL DEFAULT 'Hi Boundless! I have a question.',
  whatsapp_find_team_message_template TEXT NOT NULL DEFAULT 'Hi Boundless! I''d like to join a team for {tournament_title} — I don''t have a full squad yet.',
  email_address TEXT NOT NULL,
  email_default_subject TEXT NOT NULL DEFAULT 'Question from the website',
  instagram_url TEXT NOT NULL
);

CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT 'singleton',
  shop_order_url TEXT
);

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (registration_open = true);
CREATE POLICY "Public read sessions" ON sessions FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (active = true);
CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read sponsors" ON sponsors FOR SELECT USING (active = true);
CREATE POLICY "Public read contact_settings" ON contact_settings FOR SELECT USING (true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

-- Public insert for session_registrations
CREATE POLICY "Public insert session_registrations" ON session_registrations FOR INSERT WITH CHECK (true);

-- Admin policies
CREATE POLICY "Admin all tournaments" ON tournaments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all sessions" ON sessions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all session_registrations" ON session_registrations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all product_images" ON product_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all sponsors" ON sponsors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all contact_settings" ON contact_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
```

### Storage Policies
```sql
-- Authenticated uploads
CREATE POLICY "Authenticated upload payment-proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated upload tournament-posters" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tournament-posters' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated upload product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated upload sponsor-logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'sponsor-logos' AND auth.role() = 'authenticated');

-- Public read
CREATE POLICY "Public read payment-proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs');
CREATE POLICY "Public read tournament-posters" ON storage.objects FOR SELECT USING (bucket_id = 'tournament-posters');
CREATE POLICY "Public read product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Public read sponsor-logos" ON storage.objects FOR SELECT USING (bucket_id = 'sponsor-logos');
```

---

## Definition of Done

- [x] Supabase project created and connected
- [x] All 8 tables exist with correct schema
- [x] RLS policies applied and verified
- [x] Storage buckets created with policies
- [x] Admin user created in Auth
- [x] `npm run build` succeeds
