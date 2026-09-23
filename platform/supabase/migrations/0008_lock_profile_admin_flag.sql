-- Security fix: the original "Users can update their own profile" policy (0001_init.sql)
-- only checked row ownership (auth.uid() = id), not which columns changed. Since is_admin
-- lives on the same row (added later in 0002_admin_role.sql), any signed-in user could call
-- the Supabase client directly (bypassing the app entirely, using the public anon key) with:
--   supabase.from('profiles').update({ is_admin: true }).eq('id', <their own id>)
-- and grant themselves admin access to /admin. Run this in the Supabase SQL Editor before
-- launch.

drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid())
  );

-- Service-role writes (e.g. manually promoting an admin via the SQL Editor) bypass RLS
-- entirely and are unaffected by this policy.
