create table if not exists public.new_customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  normalized_email text not null unique,
  phone text not null,
  address text not null default '',
  service_type text not null default '',
  equipment_type text not null default '',
  brand_model text not null default '',
  details text not null default '',
  source text not null default 'Website Intake',
  page text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_request_at timestamptz not null default now()
);

alter table public.new_customers enable row level security;

create index if not exists new_customers_last_request_at_idx
  on public.new_customers (last_request_at desc);
