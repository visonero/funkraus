-- funkraus — initial schema
-- Run this once in the Supabase SQL Editor (Studio → SQL Editor → New query → paste → Run).
-- Structure only: no course content yet, that's added later through the admin panel.

-- ============================================================
-- profiles: one row per auth user, created automatically on signup
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- purchases: one row per completed course purchase
-- Written only by the Stripe webhook (service role), never by clients directly.
-- ============================================================
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_checkout_session_id text unique,
  stripe_customer_id text,
  amount_cents integer,
  currency text default 'eur',
  status text not null default 'pending', -- pending | paid | refunded
  created_at timestamptz not null default now()
);

alter table public.purchases enable row level security;

create policy "Users can view their own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

-- No insert/update policy for regular users: only the service role
-- (used server-side by the Stripe webhook handler) can write here.

-- ============================================================
-- Course structure — empty for now, filled in later via the admin panel.
-- ============================================================
create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  track text not null check (track in ('bzf1', 'bzf2')),
  num text not null,
  title text not null,
  description text,
  duration_minutes integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules (id) on delete cascade,
  title text not null,
  content_type text not null default 'text', -- video | audio | text | quiz
  body text,
  media_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.course_lessons (id) on delete cascade,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_index integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.course_modules enable row level security;
alter table public.course_lessons enable row level security;
alter table public.quiz_questions enable row level security;

-- Readable by anyone for now (tables are empty; access will be tightened
-- to "purchased users only" once real content and Stripe gating exist).
create policy "Course structure is publicly readable"
  on public.course_modules for select using (true);
create policy "Lessons are publicly readable"
  on public.course_lessons for select using (true);
create policy "Quiz questions are publicly readable"
  on public.quiz_questions for select using (true);

-- No insert/update/delete policies: writes happen only through the admin
-- panel's server-side route, using the service role key.
