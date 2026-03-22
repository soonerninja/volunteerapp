-- ============================================================
-- Migration: Team invites
-- Allow org owners/admins to invite team members by email.
-- When the invited user signs up and reaches onboarding,
-- they auto-join the org with the assigned role.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.team_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'editor',
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(org_id, email)
);

ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Org members can manage invites in their org
CREATE POLICY "Users can view invites in their org"
  ON public.team_invites FOR SELECT
  USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can insert invites in their org"
  ON public.team_invites FOR INSERT
  WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY "Users can update invites in their org"
  ON public.team_invites FOR UPDATE
  USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can delete invites in their org"
  ON public.team_invites FOR DELETE
  USING (org_id = public.get_user_org_id());

-- Users with no org yet can see invites addressed to their email (for onboarding)
CREATE POLICY "Users can see invites for their own email"
  ON public.team_invites FOR SELECT
  USING (
    lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Users can accept their own invite (update status)
CREATE POLICY "Users can accept their own invite"
  ON public.team_invites FOR UPDATE
  USING (
    lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
  );
