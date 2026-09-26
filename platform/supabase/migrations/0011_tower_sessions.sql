-- AI tower practice: one row per practice session, with the measured usage and cost so limits can be enforced.
-- Run this in the Supabase SQL Editor, same as the earlier migrations.

create table if not exists public.tower_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id text not null,
  variant int not null default 0,
  trial boolean not null default false,
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
  ended_at timestamptz,
  busy_until timestamptz
);

create index if not exists tower_sessions_user_started_idx on public.tower_sessions (user_id, started_at desc);
create index if not exists tower_sessions_started_idx on public.tower_sessions (started_at desc);

alter table public.tower_sessions enable row level security;

-- Users may read their own sessions. All writes go through server code with the service role after limit checks.
create policy "Users can view their own tower sessions"
  on public.tower_sessions for select
  using (auth.uid() = user_id);

-- Safe to re-run if an earlier version of this table already exists.
alter table public.tower_sessions add column if not exists variant int not null default 0;

alter table public.tower_sessions add column if not exists trial boolean not null default false;
alter table public.tower_sessions add column if not exists busy_until timestamptz;

-- At most one running practice per user. Parallel "start" requests cannot open many sessions at once.
create unique index if not exists tower_one_active_per_user on public.tower_sessions (user_id) where status = 'active';

-- Atomic turn claim: checks status, turn cap, minimum spacing and that no other transmission of this session is still
-- being processed, and books the turn in one statement, so parallel requests cannot slip past the limits or overwrite
-- each other's cost bookkeeping. Only the server (service role) may call it.
create or replace function public.tower_claim_turn(p_session uuid, p_min_seconds int, p_max_turns int)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  n int;
begin
  update public.tower_sessions
     set last_turn_at = now(), turns = turns + 1, busy_until = now() + interval '40 seconds'
   where id = p_session
     and status = 'active'
     and turns < p_max_turns
     and (busy_until is null or busy_until < now())
     and (last_turn_at is null or last_turn_at < now() - make_interval(secs => p_min_seconds));
  get diagnostics n = row_count;
  return n = 1;
end;
$$;

revoke all on function public.tower_claim_turn(uuid, int, int) from public, anon, authenticated;
grant execute on function public.tower_claim_turn(uuid, int, int) to service_role;
