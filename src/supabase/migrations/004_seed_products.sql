-- Boundless FC - Seed Products
-- Version: 004
-- Date: 2026-07-18
-- After running this, add product_images rows referencing the uploaded bucket URLs.

INSERT INTO products (name, description, price_myr, sizes, sort_order, active, order_url)
VALUES
  (
    'Boundless Jersey — 2026',
    'Community jersey. Add your name and number free — the shirt is printed either way.',
    79.00,
    ARRAY['S', 'M', 'L', 'XL', 'XXL'],
    1,
    true,
    NULL
  ),
  (
    'Boundless Training Top',
    'Lightweight training top for sessions.',
    59.00,
    ARRAY['S', 'M', 'L', 'XL'],
    2,
    true,
    NULL
  );

-- After uploading images to Supabase Storage, run:
-- INSERT INTO product_images (product_id, image_url, sort_order)
-- VALUES
--   ((SELECT id FROM products WHERE name = 'Boundless Jersey — 2026'), 'YOUR_BUCKET_URL/jersey-front.jpg', 0),
--   ((SELECT id FROM products WHERE name = 'Boundless Jersey — 2026'), 'YOUR_BUCKET_URL/jersey-back.jpg', 1),
--   ((SELECT id FROM products WHERE name = 'Boundless Training Top'), 'YOUR_BUCKET_URL/top-front.jpg', 0);
