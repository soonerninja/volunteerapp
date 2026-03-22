-- ============================================================
-- Migration: Security hardening
-- - Block DELETE on audit_log (should be append-only)
-- - Block UPDATE on audit_log (should be immutable)
-- - Add UPDATE policy for roles table
-- - Harden RPC function to validate caller's org
-- ============================================================

-- Audit log: deny DELETE (append-only, immutable)
CREATE POLICY "Nobody can delete audit_log"
  ON public.audit_log FOR DELETE
  USING (false);

CREATE POLICY "Nobody can update audit_log"
  ON public.audit_log FOR UPDATE
  USING (false);

-- Roles: allow UPDATE within org
CREATE POLICY "Users can update roles in their org"
  ON public.roles FOR UPDATE
  USING (org_id = public.get_user_org_id());

-- Harden outreach RPC: verify caller belongs to the requested org
CREATE OR REPLACE FUNCTION public.get_needs_outreach_volunteers(
  p_org_id uuid,
  p_days int DEFAULT 60,
  p_limit int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  email text,
  last_event_date timestamptz
) AS $$
BEGIN
  -- Ensure the caller belongs to the requested org
  IF p_org_id != public.get_user_org_id() THEN
    RAISE EXCEPTION 'Access denied: you do not belong to this organization';
  END IF;

  RETURN QUERY
  SELECT
    v.id,
    v.first_name,
    v.last_name,
    v.email,
    max(e.start_date) AS last_event_date
  FROM public.volunteers v
  LEFT JOIN public.event_volunteers ev ON ev.volunteer_id = v.id
  LEFT JOIN public.events e ON e.id = ev.event_id
  WHERE v.org_id = p_org_id
    AND v.status = 'active'
  GROUP BY v.id, v.first_name, v.last_name, v.email
  HAVING max(e.start_date) IS NULL
     OR max(e.start_date) < now() - (p_days || ' days')::interval
  ORDER BY max(e.start_date) ASC NULLS FIRST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
