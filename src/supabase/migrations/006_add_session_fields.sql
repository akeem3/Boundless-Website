-- Boundless FC - Add join_url to sessions + whatsapp_group_url to contact_settings
-- Version: 006
-- Date: 2026-07-19

-- Add per-session join URL
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS join_url TEXT;

-- Add global WhatsApp group URL
ALTER TABLE contact_settings ADD COLUMN IF NOT EXISTS whatsapp_group_url TEXT;
