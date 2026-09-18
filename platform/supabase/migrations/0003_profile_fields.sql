-- Adds newsletter opt-in and populates full_name/newsletter_opt_in at signup
-- time from the auth signup form. Run in the Supabase SQL Editor.

alter table public.profiles
  add column if not exists newsletter_opt_in boolean not null default false;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, newsletter_opt_in)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'newsletter_opt_in')::boolean, false)
  );
  return new;
end;
$$;

-- The existing trigger (on_auth_user_created) already points at this
-- function by name, so replacing the function body is enough — no need
-- to recreate the trigger itself.
