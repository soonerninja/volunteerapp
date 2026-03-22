-- ============================================================
-- Migration: Add categories to skills system
-- Adds category column to skills, and date/notes fields to
-- volunteer_skills for certification tracking.
-- ============================================================

-- Add category to skills
ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'skill'
  CHECK (category IN ('skill', 'certification', 'interest'));

CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(org_id, category);

-- Add certification tracking fields to volunteer_skills
ALTER TABLE public.volunteer_skills
  ADD COLUMN IF NOT EXISTS earned_date date,
  ADD COLUMN IF NOT EXISTS expires_date date,
  ADD COLUMN IF NOT EXISTS notes text;
