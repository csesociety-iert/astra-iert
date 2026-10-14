create table if not exists public.astra_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  message text not null check (char_length(message) between 1 and 1200),
  created_by text not null,
  created_at timestamptz not null default now()
);

create index if not exists astra_notifications_created_at_idx
  on public.astra_notifications (created_at desc);

create table if not exists public.astra_notification_reads (
  notification_id uuid not null references public.astra_notifications (id) on delete cascade,
  account_type text not null check (account_type in ('member', 'outsider')),
  user_id text not null,
  read_at timestamptz not null default now(),
  primary key (notification_id, account_type, user_id)
);

create index if not exists astra_notification_reads_user_idx
  on public.astra_notification_reads (account_type, user_id, notification_id);

alter table public.astra_notifications enable row level security;
revoke all on table public.astra_notifications from anon, authenticated;
grant all on table public.astra_notifications to service_role;

alter table public.astra_notification_reads enable row level security;
revoke all on table public.astra_notification_reads from anon, authenticated;
grant all on table public.astra_notification_reads to service_role;
