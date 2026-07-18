-- Boundless FC - Initial Schema Migration
-- Version: 001
-- Date: 2026-07-15

-- =====================================================
-- TABLES
-- =====================================================

-- Tournaments
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

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  note TEXT,
  capacity INTEGER NOT NULL DEFAULT 20,
  spots_taken INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Session Registrations
CREATE TABLE session_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products
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

-- Product Images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Sponsors
CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true
);

-- Contact Settings (singleton row)
CREATE TABLE contact_settings (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  whatsapp_number TEXT NOT NULL,
  whatsapp_generic_message TEXT NOT NULL DEFAULT 'Hi Boundless! I have a question.',
  whatsapp_find_team_message_template TEXT NOT NULL DEFAULT 'Hi Boundless! I''d like to join a team for {tournament_title} — I don''t have a full squad yet.',
  email_address TEXT NOT NULL,
  email_default_subject TEXT NOT NULL DEFAULT 'Question from the website',
  instagram_url TEXT NOT NULL,
  session_join_url TEXT
);

-- Site Settings (singleton row)
CREATE TABLE site_settings (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  shop_order_url TEXT
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies for content tables
CREATE POLICY "Public read tournaments" ON tournaments
  FOR SELECT USING (registration_open = true);

CREATE POLICY "Public read sessions" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Public read products" ON products
  FOR SELECT USING (active = true);

CREATE POLICY "Public read product_images" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "Public read sponsors" ON sponsors
  FOR SELECT USING (active = true);

CREATE POLICY "Public read contact_settings" ON contact_settings
  FOR SELECT USING (true);

CREATE POLICY "Public read site_settings" ON site_settings
  FOR SELECT USING (true);

-- Admin all-access policies for authenticated role
CREATE POLICY "Admin all tournaments" ON tournaments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin all sessions" ON sessions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin all session_registrations" ON session_registrations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin all products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin all product_images" ON product_images
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin all sponsors" ON sponsors
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin all contact_settings" ON contact_settings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin all site_settings" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');
