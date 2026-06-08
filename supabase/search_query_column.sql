alter table public.new_customers
  add column if not exists search_query text default null;

create index if not exists new_customers_search_query_idx
  on public.new_customers (search_query)
  where search_query is not null;
