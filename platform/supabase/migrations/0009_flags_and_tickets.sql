-- Saved/flagged questions and question tickets (a real person answers a learner's question).
-- Run in the Supabase SQL Editor after 0008. Like the other user-data tables: users can only READ their
-- own rows; every write goes through server actions using the service role after checking access.

create table if not exists public.flagged_questions (
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references public.quiz_questions (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table if not exists public.question_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid references public.quiz_questions (id) on delete set null,
  lesson_id uuid references public.course_lessons (id) on delete set null,
  -- Snapshot, so the ticket stays readable even if the question is edited or removed later.
  question_text text not null,
  options jsonb not null default '[]'::jsonb,
  selected_index integer,
  status text not null default 'open' check (status in ('open', 'answered', 'closed')),
  user_unread boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists question_tickets_user_idx on public.question_tickets (user_id, updated_at desc);
create index if not exists question_tickets_status_idx on public.question_tickets (status, updated_at desc);

create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.question_tickets (id) on delete cascade,
  author text not null check (author in ('user', 'staff')),
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists ticket_messages_ticket_idx on public.ticket_messages (ticket_id, created_at);

alter table public.flagged_questions enable row level security;
alter table public.question_tickets enable row level security;
alter table public.ticket_messages enable row level security;

create policy "Users can view their own flagged questions"
  on public.flagged_questions for select using (auth.uid() = user_id);

create policy "Users can view their own tickets"
  on public.question_tickets for select using (auth.uid() = user_id);

create policy "Users can view messages of their own tickets"
  on public.ticket_messages for select
  using (exists (select 1 from public.question_tickets t where t.id = ticket_id and t.user_id = auth.uid()));

-- No insert/update/delete policies on purpose: writes use the service role.
