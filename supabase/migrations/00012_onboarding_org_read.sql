-- ============================================================
-- Migration: Allow pending invitees to read their target org
--
-- Problem: the onboarding page fetches `organizations` by id to show
-- the org name on the "You've been invited!" card. The existing policy
-- `Users can view their own organization` uses `id = get_user_org_id()`,
-- which only matches AFTER a user has joined the org. Brand-new users
-- landing via an invite link have no org yet, so the lookup returns
-- zero rows and the UI falls back to "an organization".
--
-- Fix: add a SELECT policy that also lets a user read an org if they
-- have a pending invite to it (as identified by their email address).
-- ============================================================

CREATE POLICY "Users can view orgs with a pending invite for them"
  ON public.organizations FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM public.team_invites
      WHERE status = 'pending'
        AND lower(email) = lower((SELECT email FROM public.profiles WHERE id = auth.uid()))
    )
  );
