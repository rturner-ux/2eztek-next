create table if not exists public.chat_logs (
  id uuid primary key default gen_random_uuid(),
  messages jsonb not null,
  detected_brand text not null default '',
  mined boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.chat_logs enable row level security;

create index if not exists chat_logs_mined_created_idx
  on public.chat_logs (mined, created_at desc);
