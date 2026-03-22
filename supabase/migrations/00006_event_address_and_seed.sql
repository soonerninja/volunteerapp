-- ============================================================
-- Migration: Enhanced event location
-- Split location into venue name + structured address
-- ============================================================

-- Add address field (full street address for maps linking)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS address text;

-- Rename existing 'location' conceptually to be the venue/place name
-- (no schema change needed - it already stores venue names like "Ruby Grant Park")
-- The new 'address' field stores the street address for directions
