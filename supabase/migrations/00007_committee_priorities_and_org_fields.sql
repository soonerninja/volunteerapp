-- ============================================================
-- Committee Priorities + Expanded Organization Fields
-- ============================================================

-- ── Committee Priorities ──────────────────────────────────────
create table public.committee_priorities (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  text text not null,
  due_date date,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_committee_priorities_committee on public.committee_priorities(committee_id);
create index idx_committee_priorities_org on public.committee_priorities(org_id);

-- RLS
alter table public.committee_priorities enable row level security;

create policy "Org members can view committee priorities"
  on public.committee_priorities for select
  using (org_id = public.get_user_org_id());

create policy "Org members can insert committee priorities"
  on public.committee_priorities for insert
  with check (org_id = public.get_user_org_id());

create policy "Org members can update committee priorities"
  on public.committee_priorities for update
  using (org_id = public.get_user_org_id());

create policy "Org members can delete committee priorities"
  on public.committee_priorities for delete
  using (org_id = public.get_user_org_id());

-- Auto-update updated_at
create trigger set_committee_priorities_updated_at
  before update on public.committee_priorities
  for each row
  execute function public.update_updated_at();

-- ── Expanded Organization Fields ─────────────────────────────
alter table public.organizations
  add column if not exists description text,
  add column if not exists contact_email text,
  add column if not exists phone text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists timezone text default 'America/Chicago',
  add column if not exists fiscal_year_start int default 1 check (fiscal_year_start between 1 and 12);
