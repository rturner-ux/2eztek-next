create table if not exists public.competitor_rankings (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  our_rank integer,
  competitor_domain text,
  competitor_rank integer,
  checked_at timestamptz not null default now()
);

alter table public.competitor_rankings enable row level security;

create index if not exists competitor_rankings_keyword_idx
  on public.competitor_rankings (keyword, checked_at desc);

create index if not exists competitor_rankings_date_idx
  on public.competitor_rankings (checked_at desc);
