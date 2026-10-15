create table if not exists public.astra_problems (
  problem_id text primary key,
  slug text not null unique,
  title text not null check (char_length(title) between 3 and 120),
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  topic text not null check (char_length(topic) between 2 and 60),
  tags text[] not null check (cardinality(tags) between 1 and 10),
  description text not null check (char_length(description) between 10 and 4000),
  input_format text not null check (char_length(input_format) between 1 and 2000),
  output_format text not null check (char_length(output_format) between 1 and 2000),
  constraints text not null check (char_length(constraints) between 1 and 2000),
  sample_input text not null check (char_length(sample_input) <= 10000),
  sample_output text not null check (char_length(sample_output) <= 10000),
  starter_code text not null default '' check (char_length(starter_code) <= 30000),
  test_cases jsonb not null check (
    jsonb_typeof(test_cases) = 'array'
    and jsonb_array_length(test_cases) between 1 and 25
  ),
  created_by text not null,
  created_at timestamptz not null default now()
);

create index if not exists astra_problems_created_at_idx
  on public.astra_problems (created_at desc);

alter table public.astra_problems enable row level security;
revoke all on table public.astra_problems from anon, authenticated;
grant all on table public.astra_problems to service_role;
