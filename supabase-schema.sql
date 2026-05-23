-- Run this in your Supabase SQL editor (dashboard → SQL Editor → New query)

create extension if not exists "uuid-ossp";

create table public.email_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  token text unique not null,
  created_at timestamptz default now()
);

create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text default '',
  email_from text,
  email_from_name text,
  email_subject text,
  suggested_deadline timestamptz,
  deadline timestamptz,
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text default 'todo' check (status in ('todo', 'in_progress', 'done')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.attachments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  filename text not null,
  storage_path text not null,
  content_type text,
  size integer,
  created_at timestamptz default now()
);

alter table public.email_tokens enable row level security;
alter table public.tasks enable row level security;
alter table public.attachments enable row level security;

create policy "Users manage own tokens"
  on public.email_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own attachments"
  on public.attachments for all
  using (
    exists (
      select 1 from public.tasks
      where tasks.id = attachments.task_id
      and tasks.user_id = auth.uid()
    )
  );

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();
