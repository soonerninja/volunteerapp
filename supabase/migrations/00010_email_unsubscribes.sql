-- ============================================================
-- Migration: Email unsubscribes (CAN-SPAM compliance)
-- Simple per-category opt-out. Transactional categories like
-- team_invite still send regardless; marketing-ish categories
-- (weekly_digest, feature_status) must honor this table.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_unsubscribes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category),
  UNIQUE(email, category),
  CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS email_unsubscribes_user_id_idx ON public.email_unsubscribes (user_id);
CREATE INDEX IF NOT EXISTS email_unsubscribes_email_idx ON public.email_unsubscribes (email);

ALTER TABLE public.email_unsubscribes ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own unsubscribes.
CREATE POLICY "Users can view own unsubscribes"
  ON public.email_unsubscribes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own unsubscribes"
  ON public.email_unsubscribes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own unsubscribes"
  ON public.email_unsubscribes FOR DELETE
  USING (user_id = auth.uid());

-- NOTE: The /unsubscribe route uses the service role key to allow
-- one-click unsubscribe from an email link without requiring a
-- logged-in session. Do not add a public INSERT policy here.
