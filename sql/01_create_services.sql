-- Creates the table only if it doesn't exist
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  package_id  uuid references public.packages(id) on delete cascade,
  name        text  not null,
  price       numeric not null,            -- € or whatever currency
  cycle       text  not null  check (cycle in ('one-off','monthly')),
  created_at  timestamp with time zone default now()
);
