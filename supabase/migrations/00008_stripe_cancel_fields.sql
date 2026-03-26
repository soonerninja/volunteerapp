-- Add subscription cancellation tracking fields to organizations
alter table public.organizations
  add column if not exists stripe_cancel_at_period_end boolean not null default false,
  add column if not exists stripe_current_period_end timestamptz;
