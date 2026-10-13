create table if not exists public.astra_credentials (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_hash text not null,
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  gender text check (gender is null or gender in ('female', 'male', 'non_binary', 'prefer_not_to_say')),
  blood_group text check (blood_group is null or blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  avatar_path text,
  aktu_enrollment_number text,
  admission_batch_year smallint check (
    admission_batch_year is null or admission_batch_year between 2000 and 2100
  ),
  branch text,
  secondary_email text,
  mobile_number text,
  whatsapp_number text,
  whatsapp_same_as_mobile boolean not null default true,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists astra_credentials_email_lower_key
  on public.astra_credentials (lower(email));

alter table public.astra_credentials enable row level security;

revoke all on table public.astra_credentials from anon, authenticated;
grant all on table public.astra_credentials to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'astra-profile-photos',
  'astra-profile-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
