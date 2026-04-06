-- ============================================================
-- Migration: Feature requests (in-app voting board)
-- Authed users across any org can view and submit. Voting is
-- one vote per user per request. Status/pin/merge are super-admin
-- only, enforced in the application layer (super-admin is an env
-- var allowlist, not a DB role).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.feature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 140),
  description text CHECK (char_length(description) <= 4000),
  category text DEFAULT 'general',
  status text NOT NULL DEFAULT 'under_review'
    CHECK (status IN ('under_review', 'planned', 'in_progress', 'shipped', 'declined')),
  pinned boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feature_requests_status_idx ON public.feature_requests (status);
CREATE INDEX IF NOT EXISTS feature_requests_created_at_idx ON public.feature_requests (created_at DESC);

CREATE TABLE IF NOT EXISTS public.feature_request_votes (
  request_id uuid NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (request_id, user_id)
);

CREATE INDEX IF NOT EXISTS feature_request_votes_request_idx ON public.feature_request_votes (request_id);

-- Convenience view: request with vote count.
-- security_invoker=on so RLS policies run as the querying user, not the view owner.
CREATE OR REPLACE VIEW public.feature_requests_with_votes
WITH (security_invoker = on) AS
SELECT
  fr.*,
  COALESCE(vc.vote_count, 0) AS vote_count
FROM public.feature_requests fr
LEFT JOIN (
  SELECT request_id, COUNT(*)::int AS vote_count
  FROM public.feature_request_votes
  GROUP BY request_id
) vc ON vc.request_id = fr.id;

ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_request_votes ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read all requests.
CREATE POLICY "Authenticated users can read feature requests"
  ON public.feature_requests FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Any authenticated user can submit a new request.
CREATE POLICY "Authenticated users can insert feature requests"
  ON public.feature_requests FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Status changes / pins / edits come through the service role in an API route
-- gated by the super-admin allowlist. No user-facing UPDATE or DELETE policy.

-- Votes: users can see all votes (so we can show counts), insert their own,
-- delete their own (unvote).
CREATE POLICY "Authenticated users can read votes"
  ON public.feature_request_votes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own vote"
  ON public.feature_request_votes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own vote"
  ON public.feature_request_votes FOR DELETE
  USING (user_id = auth.uid());

-- Seed initial requests so the board isn't empty on launch day.
INSERT INTO public.feature_requests (title, description, category, status, pinned) VALUES
  ('Volunteer self-service portal', 'Let volunteers sign themselves up for events without admin intervention.', 'volunteers', 'planned', true),
  ('Automated email notifications for volunteers', 'Send event reminders, thank-yous, and sign-up confirmations directly to volunteers.', 'notifications', 'planned', false),
  ('Google Calendar & Outlook sync', 'Two-way sync for events so admins don''t manage two calendars.', 'integrations', 'under_review', false),
  ('Recurring events', 'Create a weekly or monthly event in one click.', 'events', 'under_review', false),
  ('Volunteer availability & scheduling', 'Capture when each volunteer is available so you can match them to shifts.', 'volunteers', 'under_review', false),
  ('Custom fields on volunteer profiles', 'Add your own fields (shirt size, dietary needs, background check date, etc).', 'volunteers', 'under_review', false),
  ('Mobile app', 'Native iOS/Android app for admins on the go.', 'platform', 'under_review', false),
  ('Integration with donor management tools', 'Sync volunteers with Bloomerang, Little Green Light, and similar CRMs.', 'integrations', 'under_review', false)
ON CONFLICT DO NOTHING;
