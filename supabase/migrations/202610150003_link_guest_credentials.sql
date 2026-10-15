alter table public.astra_credentials
  alter column password_hash drop not null,
  alter column first_name drop not null,
  alter column last_name drop not null,
  add column if not exists member_account_id text,
  add column if not exists avatar_url text;

create unique index if not exists astra_credentials_member_account_id_key
  on public.astra_credentials (member_account_id)
  where member_account_id is not null;
