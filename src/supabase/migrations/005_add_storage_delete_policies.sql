-- Boundless FC - Add DELETE Storage Policies
-- Service role bypasses RLS, but the storage API endpoint
-- may still require explicit DELETE policies to function.
-- Date: 2026-07-19

-- tournament-posters bucket
CREATE POLICY "Authenticated delete tournament-posters" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'tournament-posters'
    AND auth.role() = 'authenticated'
  );

-- product-images bucket
CREATE POLICY "Authenticated delete product-images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- sponsor-logos bucket
CREATE POLICY "Authenticated delete sponsor-logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'sponsor-logos'
    AND auth.role() = 'authenticated'
  );
