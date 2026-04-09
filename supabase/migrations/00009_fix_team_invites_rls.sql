-- ============================================================
-- Migration: Fix team_invites RLS policies
-- The original policies referenced auth.users directly, which
-- the authenticated role cannot SELECT from. Replace with
-- public.profiles which is readable by authenticated users.
-- ============================================================

DROP POLICY IF EXISTS "Users can see invites for their own email" ON public.team_invites;
DROP POLICY IF EXISTS "Users can accept their own invite" ON public.team_invites;

CREATE POLICY "Users can see invites for their own email"
  ON public.team_invites FOR SELECT
  USING (
    lower(email) = lower((SELECT email FROM public.profiles WHERE id = auth.uid()))
  );

CREATE POLICY "Users can accept their own invite"
  ON public.team_invites FOR UPDATE
  USING (
    lower(email) = lower((SELECT email FROM public.profiles WHERE id = auth.uid()))
  );
