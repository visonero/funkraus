-- Free tier: everyone with an account can use the modules flagged is_free (Modules 0 and 1);
-- all other modules need the paid purchase.
--
-- Run this in the Supabase SQL Editor after 0005_lesson_media_and_explanations.sql.

alter table public.course_modules
  add column if not exists is_free boolean not null default false;

update public.course_modules set is_free = true where num in ('00', '01');

-- Lessons (text, media paths) and quiz questions (including the correct answers) are no longer readable
-- with the public anon key. The app reads them server-side with the service role after checking the access
-- rules (free module or paid purchase). With row level security enabled and no policy, only the service role
-- can read these tables. course_modules stays readable (it only holds titles, descriptions and the is_free flag).
drop policy if exists "Lessons are publicly readable" on public.course_lessons;
drop policy if exists "Quiz questions are publicly readable" on public.quiz_questions;
