-- ============================================================
-- Migration: Simplify skills, add roles
-- - Remove category from skills (back to simple checkboxes)
-- - Remove certification tracking from volunteer_skills
-- - Add roles table and volunteer_roles junction
-- - Add role column to volunteer_committees
-- ============================================================

-- Simplify skills: drop category
ALTER TABLE public.skills DROP COLUMN IF EXISTS category;
DROP INDEX IF EXISTS idx_skills_category;

-- Simplify volunteer_skills: drop cert tracking fields
ALTER TABLE public.volunteer_skills
  DROP COLUMN IF EXISTS earned_date,
  DROP COLUMN IF EXISTS expires_date,
  DROP COLUMN IF EXISTS notes;

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(org_id, name)
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view roles"
  ON public.roles FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON public.roles FOR ALL
  USING (org_id IN (
    SELECT org_id FROM public.profiles
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Create volunteer_roles junction table
CREATE TABLE IF NOT EXISTS public.volunteer_roles (
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  PRIMARY KEY (volunteer_id, role_id)
);

ALTER TABLE public.volunteer_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view volunteer_roles"
  ON public.volunteer_roles FOR SELECT
  USING (volunteer_id IN (
    SELECT v.id FROM public.volunteers v
    JOIN public.profiles p ON p.org_id = v.org_id
    WHERE p.id = auth.uid()
  ));

CREATE POLICY "Editors can manage volunteer_roles"
  ON public.volunteer_roles FOR ALL
  USING (volunteer_id IN (
    SELECT v.id FROM public.volunteers v
    JOIN public.profiles p ON p.org_id = v.org_id
    WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin', 'editor')
  ));

-- Add role column to volunteer_committees (e.g., "Chair", "Member")
ALTER TABLE public.volunteer_committees
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'Member';
