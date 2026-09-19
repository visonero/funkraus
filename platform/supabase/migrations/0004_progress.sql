-- funkraus — learning progress tracking for the user dashboard.
-- Run this once in the Supabase SQL Editor, same as the earlier migrations.
--
-- Users can only READ their own progress. All writes go through server actions
-- that use the service role after checking the user's purchase, so nobody can
-- tamper with their own progress from the browser.

-- One row per chapter (course_lessons row) a user has marked as completed.
create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.course_lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- Append-only log of every answer a user gives to a quiz question.
-- "Answered / correct / wrong" and the activity chart are derived from this.
create table if not exists public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references public.quiz_questions (id) on delete cascade,
  selected_index integer not null,
  is_correct boolean not null,
  answered_at timestamptz not null default now()
);

create index if not exists question_attempts_user_answered_idx
  on public.question_attempts (user_id, answered_at desc);

alter table public.lesson_progress enable row level security;
alter table public.question_attempts enable row level security;

create policy "Users can view their own lesson progress"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

create policy "Users can view their own question attempts"
  on public.question_attempts for select
  using (auth.uid() = user_id);

-- No insert/update/delete policies on purpose: writes use the service role.
