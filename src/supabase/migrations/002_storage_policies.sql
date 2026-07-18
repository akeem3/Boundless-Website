-- Boundless FC - Storage Policies
-- Run this AFTER creating storage buckets in Supabase Dashboard
-- Date: 2026-07-15

-- =====================================================
-- AUTHENTICATED UPLOAD POLICIES
-- =====================================================

-- tournament-posters bucket
CREATE POLICY "Authenticated upload tournament-posters" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'tournament-posters'
    AND auth.role() = 'authenticated'
  );

-- product-images bucket
CREATE POLICY "Authenticated upload product-images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- sponsor-logos bucket
CREATE POLICY "Authenticated upload sponsor-logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'sponsor-logos'
    AND auth.role() = 'authenticated'
  );

-- =====================================================
-- PUBLIC READ POLICIES
-- =====================================================

CREATE POLICY "Public read tournament-posters" ON storage.objects
  FOR SELECT USING (bucket_id = 'tournament-posters');

CREATE POLICY "Public read product-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Public read sponsor-logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'sponsor-logos');
