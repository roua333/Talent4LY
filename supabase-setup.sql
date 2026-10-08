-- Talent4LY Supabase setup
-- Run this in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.talent4ly_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null
    check (char_length(trim(full_name)) between 5 and 120),
  phone text not null
    check (char_length(trim(phone)) between 8 and 25),
  email text not null
    check (char_length(trim(email)) between 5 and 254),
  core_skills text[] not null
    check (cardinality(core_skills) >= 1),
  other_skill text null
    check (other_skill is null or char_length(trim(other_skill)) between 2 and 120),
  professional_link text not null
    check (char_length(trim(professional_link)) between 8 and 500),
  best_project_summary text not null
    check (char_length(trim(best_project_summary)) between 30 and 1500),
  created_at timestamptz not null default now()
);

alter table public.talent4ly_applications enable row level security;

-- Remove broad table privileges from public roles first.
revoke all on table public.talent4ly_applications from anon;
revoke all on table public.talent4ly_applications from authenticated;

-- Public website visitors can insert ONLY the fields supplied by the form.
-- They cannot set id or created_at.
grant insert (
  full_name,
  phone,
  email,
  core_skills,
  other_skill,
  professional_link,
  best_project_summary
) on table public.talent4ly_applications to anon;

-- RLS policy: anonymous website visitors may insert rows only.
drop policy if exists "Talent4LY public insert only" on public.talent4ly_applications;

create policy "Talent4LY public insert only"
on public.talent4ly_applications
for insert
to anon
with check (
  full_name is not null
  and phone is not null
  and email is not null
  and cardinality(core_skills) >= 1
  and professional_link is not null
  and best_project_summary is not null
  and (
    not ('Other' = any(core_skills))
    or (other_skill is not null and char_length(trim(other_skill)) >= 2)
  )
);

-- Intentionally DO NOT create SELECT, UPDATE, or DELETE policies for anon.
-- With RLS enabled and no such policies, those operations remain blocked.

-- Optional checks after setup:
-- select relrowsecurity from pg_class where oid = 'public.talent4ly_applications'::regclass;
-- select policyname, cmd, roles from pg_policies where schemaname='public' and tablename='talent4ly_applications';
