alter table public.new_customers
  add column if not exists triage_score integer default null,
  add column if not exists triage_priority text default null,
  add column if not exists triage_notes text default null;

create index if not exists new_customers_triage_score_idx
  on public.new_customers (triage_score desc nulls last);
