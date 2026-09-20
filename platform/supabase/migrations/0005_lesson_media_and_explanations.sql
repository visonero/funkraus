-- funkraus — lesson media, quiz explanations and stable import IDs.
-- Run this once in the Supabase SQL Editor, same as the earlier migrations.

-- Lessons: separate audio and PDF next to the existing media_url (used for the video).
-- external_id ("2.1") lets the content import script update a lesson instead of duplicating it.
alter table public.course_lessons
  add column if not exists audio_url text,
  add column if not exists pdf_url text,
  add column if not exists external_id text;

create unique index if not exists course_lessons_external_id_key
  on public.course_lessons (external_id);

-- Questions: an explanation shown after answering, where the question comes from
-- (official catalogue number or own practice question) and a stable import ID.
alter table public.quiz_questions
  add column if not exists explanation text,
  add column if not exists source_ref text,
  add column if not exists external_id text;

create unique index if not exists quiz_questions_external_id_key
  on public.quiz_questions (external_id);
