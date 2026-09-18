-- Adds an admin flag to profiles, gating the /admin CMS.
-- Run this in the Supabase SQL Editor, same as 0001_init.sql.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- After running this, promote your own account to admin with:
--   update public.profiles set is_admin = true where email = 'you@example.com';
