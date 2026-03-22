-- ============================================================
-- Volunteer Management SaaS - Complete Database Schema
-- Multi-tenant with Row-Level Security
-- ============================================================

-- Enable necessary extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  tier text not null default 'free' check (tier in ('free', 'starter', 'growth')),
  stripe_customer_id text,
  stripe_subscription_id text,
  max_volunteers int not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete set null,
  email text not null,
  full_name text,
  role text not null default 'owner' check (role in ('owner', 'admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- VOLUNTEERS
-- ============================================================
create table public.volunteers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  status text not null default 'active' check (status in ('active', 'inactive', 'on_leave')),
  notes text,
  joined_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_volunteers_org on public.volunteers(org_id);
create index idx_volunteers_status on public.volunteers(org_id, status);

-- ============================================================
-- SKILLS
-- ============================================================
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique(org_id, name)
);
create index idx_skills_org on public.skills(org_id);

-- ============================================================
-- VOLUNTEER_SKILLS (junction)
-- ============================================================
create table public.volunteer_skills (
  volunteer_id uuid not null references public.volunteers(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  primary key (volunteer_id, skill_id)
);

-- ============================================================
-- COMMITTEES
-- ============================================================
create table public.committees (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_committees_org on public.committees(org_id);

-- ============================================================
-- VOLUNTEER_COMMITTEES (junction)
-- ============================================================
create table public.volunteer_committees (
  volunteer_id uuid not null references public.volunteers(id) on delete cascade,
  committee_id uuid not null references public.committees(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (volunteer_id, committee_id)
);

-- ============================================================
-- EVENTS
-- ============================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  location text,
  start_date timestamptz not null,
  end_date timestamptz not null,
  max_volunteers int,
  status text not null default 'upcoming' check (status in ('upcoming', 'active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_events_org on public.events(org_id);
create index idx_events_status on public.events(org_id, status);
create index idx_events_dates on public.events(org_id, start_date);

-- ============================================================
-- EVENT_VOLUNTEERS
-- ============================================================
create table public.event_volunteers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  volunteer_id uuid not null references public.volunteers(id) on delete cascade,
  hours_logged numeric(6,2) not null default 0,
  checked_in boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  unique(event_id, volunteer_id)
);
create index idx_event_volunteers_event on public.event_volunteers(event_id);
create index idx_event_volunteers_volunteer on public.event_volunteers(volunteer_id);

-- ============================================================
-- AUDIT_LOG
-- ============================================================
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index idx_audit_log_org on public.audit_log(org_id, created_at desc);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_organizations_updated
  before update on public.organizations
  for each row execute function public.handle_updated_at();

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger on_volunteers_updated
  before update on public.volunteers
  for each row execute function public.handle_updated_at();

create trigger on_committees_updated
  before update on public.committees
  for each row execute function public.handle_updated_at();

create trigger on_events_updated
  before update on public.events
  for each row execute function public.handle_updated_at();

-- Auto-create profile on new auth.user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper function: get the current user's org_id
create or replace function public.get_user_org_id()
returns uuid as $$
  select org_id from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- ============================================================
-- ROW-LEVEL SECURITY POLICIES
-- ============================================================

-- Organizations: users can only see/edit their own org
alter table public.organizations enable row level security;

create policy "Users can view their own organization"
  on public.organizations for select
  using (id = public.get_user_org_id());

create policy "Users can update their own organization"
  on public.organizations for update
  using (id = public.get_user_org_id());

-- Allow insert during onboarding (no org_id set yet)
create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check (auth.uid() is not null);

-- Profiles: users can see/edit own profile, view org members
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can view profiles in their org"
  on public.profiles for select
  using (org_id = public.get_user_org_id());

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid());

-- Volunteers: org-scoped
alter table public.volunteers enable row level security;

create policy "Users can view volunteers in their org"
  on public.volunteers for select
  using (org_id = public.get_user_org_id());

create policy "Users can insert volunteers in their org"
  on public.volunteers for insert
  with check (org_id = public.get_user_org_id());

create policy "Users can update volunteers in their org"
  on public.volunteers for update
  using (org_id = public.get_user_org_id());

create policy "Users can delete volunteers in their org"
  on public.volunteers for delete
  using (org_id = public.get_user_org_id());

-- Skills: org-scoped
alter table public.skills enable row level security;

create policy "Users can view skills in their org"
  on public.skills for select
  using (org_id = public.get_user_org_id());

create policy "Users can insert skills in their org"
  on public.skills for insert
  with check (org_id = public.get_user_org_id());

create policy "Users can delete skills in their org"
  on public.skills for delete
  using (org_id = public.get_user_org_id());

-- Volunteer Skills: accessible if volunteer is in user's org
alter table public.volunteer_skills enable row level security;

create policy "Users can view volunteer_skills in their org"
  on public.volunteer_skills for select
  using (
    volunteer_id in (
      select id from public.volunteers where org_id = public.get_user_org_id()
    )
  );

create policy "Users can insert volunteer_skills in their org"
  on public.volunteer_skills for insert
  with check (
    volunteer_id in (
      select id from public.volunteers where org_id = public.get_user_org_id()
    )
  );

create policy "Users can delete volunteer_skills in their org"
  on public.volunteer_skills for delete
  using (
    volunteer_id in (
      select id from public.volunteers where org_id = public.get_user_org_id()
    )
  );

-- Committees: org-scoped
alter table public.committees enable row level security;

create policy "Users can view committees in their org"
  on public.committees for select
  using (org_id = public.get_user_org_id());

create policy "Users can insert committees in their org"
  on public.committees for insert
  with check (org_id = public.get_user_org_id());

create policy "Users can update committees in their org"
  on public.committees for update
  using (org_id = public.get_user_org_id());

create policy "Users can delete committees in their org"
  on public.committees for delete
  using (org_id = public.get_user_org_id());

-- Volunteer Committees: accessible if volunteer is in user's org
alter table public.volunteer_committees enable row level security;

create policy "Users can view volunteer_committees in their org"
  on public.volunteer_committees for select
  using (
    volunteer_id in (
      select id from public.volunteers where org_id = public.get_user_org_id()
    )
  );

create policy "Users can insert volunteer_committees in their org"
  on public.volunteer_committees for insert
  with check (
    volunteer_id in (
      select id from public.volunteers where org_id = public.get_user_org_id()
    )
  );

create policy "Users can delete volunteer_committees in their org"
  on public.volunteer_committees for delete
  using (
    volunteer_id in (
      select id from public.volunteers where org_id = public.get_user_org_id()
    )
  );

-- Events: org-scoped
alter table public.events enable row level security;

create policy "Users can view events in their org"
  on public.events for select
  using (org_id = public.get_user_org_id());

create policy "Users can insert events in their org"
  on public.events for insert
  with check (org_id = public.get_user_org_id());

create policy "Users can update events in their org"
  on public.events for update
  using (org_id = public.get_user_org_id());

create policy "Users can delete events in their org"
  on public.events for delete
  using (org_id = public.get_user_org_id());

-- Event Volunteers: accessible if event is in user's org
alter table public.event_volunteers enable row level security;

create policy "Users can view event_volunteers in their org"
  on public.event_volunteers for select
  using (
    event_id in (
      select id from public.events where org_id = public.get_user_org_id()
    )
  );

create policy "Users can insert event_volunteers in their org"
  on public.event_volunteers for insert
  with check (
    event_id in (
      select id from public.events where org_id = public.get_user_org_id()
    )
  );

create policy "Users can update event_volunteers in their org"
  on public.event_volunteers for update
  using (
    event_id in (
      select id from public.events where org_id = public.get_user_org_id()
    )
  );

create policy "Users can delete event_volunteers in their org"
  on public.event_volunteers for delete
  using (
    event_id in (
      select id from public.events where org_id = public.get_user_org_id()
    )
  );

-- Audit Log: org-scoped, read-only for users, insert via app
alter table public.audit_log enable row level security;

create policy "Users can view audit_log in their org"
  on public.audit_log for select
  using (org_id = public.get_user_org_id());

create policy "Users can insert audit_log in their org"
  on public.audit_log for insert
  with check (org_id = public.get_user_org_id());

-- ============================================================
-- RPC: Get volunteers needing outreach
-- (active volunteers with no event participation in N days)
-- ============================================================
create or replace function public.get_needs_outreach_volunteers(
  p_org_id uuid,
  p_days int default 60,
  p_limit int default 5
)
returns table (
  id uuid,
  first_name text,
  last_name text,
  email text,
  last_event_date timestamptz
) as $$
begin
  return query
  select
    v.id,
    v.first_name,
    v.last_name,
    v.email,
    max(e.start_date) as last_event_date
  from public.volunteers v
  left join public.event_volunteers ev on ev.volunteer_id = v.id
  left join public.events e on e.id = ev.event_id
  where v.org_id = p_org_id
    and v.status = 'active'
  group by v.id, v.first_name, v.last_name, v.email
  having max(e.start_date) is null
     or max(e.start_date) < now() - (p_days || ' days')::interval
  order by max(e.start_date) asc nulls first
  limit p_limit;
end;
$$ language plpgsql security definer;
