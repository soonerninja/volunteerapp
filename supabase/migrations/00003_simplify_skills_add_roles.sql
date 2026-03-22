-- ============================================================
-- Migration: Simplify skills, add roles
-- - Remove category from skills (back to simple checkboxes)
-- - Remove certification tracking from volunteer_skills
-- - Add roles table and volunteer_roles junction
-- - Add role column to volunteer_committees
-- - Add UPDATE policy for volunteer_committees
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

CREATE POLICY "Users can view roles in their org"
  ON public.roles FOR SELECT
  USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can insert roles in their org"
  ON public.roles FOR INSERT
  WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY "Users can delete roles in their org"
  ON public.roles FOR DELETE
  USING (org_id = public.get_user_org_id());

-- Create volunteer_roles junction table
CREATE TABLE IF NOT EXISTS public.volunteer_roles (
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  PRIMARY KEY (volunteer_id, role_id)
);

ALTER TABLE public.volunteer_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view volunteer_roles in their org"
  ON public.volunteer_roles FOR SELECT
  USING (
    volunteer_id IN (
      SELECT id FROM public.volunteers WHERE org_id = public.get_user_org_id()
    )
  );

CREATE POLICY "Users can insert volunteer_roles in their org"
  ON public.volunteer_roles FOR INSERT
  WITH CHECK (
    volunteer_id IN (
      SELECT id FROM public.volunteers WHERE org_id = public.get_user_org_id()
    )
  );

CREATE POLICY "Users can delete volunteer_roles in their org"
  ON public.volunteer_roles FOR DELETE
  USING (
    volunteer_id IN (
      SELECT id FROM public.volunteers WHERE org_id = public.get_user_org_id()
    )
  );

-- Add role column to volunteer_committees (e.g., "Chair", "Member")
ALTER TABLE public.volunteer_committees
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'Member';

-- Add UPDATE policy for volunteer_committees (missing from initial schema)
CREATE POLICY "Users can update volunteer_committees in their org"
  ON public.volunteer_committees FOR UPDATE
  USING (
    volunteer_id IN (
      SELECT id FROM public.volunteers WHERE org_id = public.get_user_org_id()
    )
  );
