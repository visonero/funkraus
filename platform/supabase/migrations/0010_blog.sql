-- Blog: articles written in the admin panel and shown on /blog.
-- Run this in the Supabase SQL Editor, same as the earlier migrations.

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text not null default '',
  topic text,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_published_idx on public.blog_posts (status, published_at desc);

alter table public.blog_posts enable row level security;

-- Visitors may read published articles only. All writes go through server actions
-- with the service role after an admin check, so there is no insert/update policy.
create policy "Anyone can read published blog posts"
  on public.blog_posts for select
  using (status = 'published');
