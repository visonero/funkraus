-- AI tower practice: one row per practice session, with the measured usage and cost so limits can be enforced.
-- Run this in the Supabase SQL Editor, same as the earlier migrations.

create table if not exists public.tower_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'ended')),
  mode text not null default 'live' check (mode in ('live', 'mock')),
  step int not null default 0,
  turns int not null default 0,
  transcript jsonb not null default '[]'::jsonb,
  feedback jsonb,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  tts_chars int not null default 0,
  stt_seconds numeric(8, 2) not null default 0,
  cost_micro_usd bigint not null default 0,
  started_at timestamptz not null default now(),
  last_turn_at timestamptz,
  ended_at timestamptz
);

create index if not exists tower_sessions_user_started_idx on public.tower_sessions (user_id, started_at desc);
create index if not exists tower_sessions_started_idx on public.tower_sessions (started_at desc);

alter table public.tower_sessions enable row level security;

-- Users may read their own sessions. All writes go through server code with the service role after limit checks.
create policy "Users can view their own tower sessions"
  on public.tower_sessions for select
  using (auth.uid() = user_id);
