-- Boundless FC - Seed Tournament Data
-- Version: 003
-- Date: 2026-07-18

-- Insert the Boundless World Cup 2026 tournament
INSERT INTO tournaments (
  title,
  starts_at,
  location,
  fee_myr,
  description,
  rules,
  poster_url,
  registration_open,
  team_registration_url
) VALUES (
  'Boundless World Cup — 2026',
  '2026-08-01T15:00:00+08:00',
  'Bukit Jalil Futsal Court, KL',
  200,
  'Countries face off, 5-a-side. Min. 5 players sharing one nationality, up to 8 per squad. Bring a full team, or come alone and we''ll place you on one.',
  'Countries that do not already have a registered team may combine with another country to form a team. Maximum 2 countries per team. Countries that already have their own registered team cannot join a combined team. A maximum of 8 members per team. At least 5 members must share the same nationality. Up to 1 member of a different nationality is allowed.',
  '/posters/boundless wc poster.png',
  true,
  NULL
);
