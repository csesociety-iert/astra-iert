create table if not exists public.astra_streak_activity (
  id uuid primary key default gen_random_uuid(),
  account_type text not null check (account_type in ('member', 'outsider')),
  user_id text not null,
  activity_date date not null,
  created_at timestamptz not null default now(),
  unique (account_type, user_id, activity_date)
);

create index if not exists astra_streak_activity_user_date_idx
  on public.astra_streak_activity (account_type, user_id, activity_date desc);

alter table public.astra_streak_activity enable row level security;
revoke all on table public.astra_streak_activity from anon, authenticated;
grant all on table public.astra_streak_activity to service_role;

create table if not exists public.astra_submissions (
  id uuid primary key default gen_random_uuid(),
  account_type text not null check (account_type in ('member', 'outsider')),
  user_id text not null,
  problem_slug text not null,
  problem_title text not null,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  problem_tags text[] not null default '{}',
  language text not null,
  verdict text not null,
  failed_test_case integer,
  created_at timestamptz not null default now()
);

create index if not exists astra_submissions_user_created_idx
  on public.astra_submissions (account_type, user_id, created_at desc);

create index if not exists astra_submissions_accepted_problem_idx
  on public.astra_submissions (account_type, user_id, problem_slug)
  where verdict = 'Accepted';

alter table public.astra_submissions enable row level security;
revoke all on table public.astra_submissions from anon, authenticated;
grant all on table public.astra_submissions to service_role;

create or replace function public.record_astra_submission_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.verdict = 'Accepted' then
    insert into public.astra_streak_activity (account_type, user_id, activity_date)
    values (new.account_type, new.user_id, (now() at time zone 'Asia/Kolkata')::date)
    on conflict (account_type, user_id, activity_date) do nothing;
  end if;
  return new;
end;
$$;

revoke all on function public.record_astra_submission_activity() from public, anon, authenticated;

drop trigger if exists astra_submission_activity_after_insert on public.astra_submissions;
create trigger astra_submission_activity_after_insert
  after insert on public.astra_submissions
  for each row execute function public.record_astra_submission_activity();
