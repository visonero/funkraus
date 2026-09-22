-- funkraus — mock exam simulation (Module 6 / Module 10): one row per timed 100-question attempt.
-- Run this once in the Supabase SQL Editor, same as the earlier migrations.
--
-- Users can only READ their own attempts. All writes go through server actions that use the
-- service role after checking course access, same pattern as lesson_progress/question_attempts.

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.course_lessons (id) on delete cascade,
  track text not null check (track in ('bzf1', 'bzf2')),
  question_ids uuid[] not null,
  answers jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  duration_seconds integer not null default 3600,
  score integer,
  passed boolean,
  created_at timestamptz not null default now()
);

create index if not exists exam_attempts_user_lesson_idx
  on public.exam_attempts (user_id, lesson_id, started_at desc);

alter table public.exam_attempts enable row level security;

create policy "Users can view their own exam attempts"
  on public.exam_attempts for select
  using (auth.uid() = user_id);

-- No insert/update/delete policies on purpose: writes use the service role.
