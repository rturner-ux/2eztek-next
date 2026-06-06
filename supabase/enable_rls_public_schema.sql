-- Supabase Advisor remediation: rls_disabled_in_public
-- Run in the Supabase SQL Editor for the FitServ Pro project.
--
-- Server-side routes use the service role key, which bypasses RLS. Anonymous
-- access is granted only where the public website needs it.

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'area_updates',
    'blog_posts',
    'brands',
    'chat_logs',
    'competitor_rankings',
    'equipment_categories',
    'equipment_listings',
    'equipment_manuals',
    'equipment_manuals_v2',
    'equipment_models',
    'facility_spotlights',
    'faqs',
    'manual_conversions',
    'manuals',
    'new_customers'
  ]
  loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I enable row level security', table_name);
    end if;
  end loop;
end
$$;

-- Recreate the explicit anonymous policies idempotently.
drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts"
  on public.blog_posts
  for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Public can read approved equipment listings" on public.equipment_listings;
create policy "Public can read approved equipment listings"
  on public.equipment_listings
  for select
  to anon, authenticated
  using (status = 'approved');

drop policy if exists "Public can submit pending equipment listings" on public.equipment_listings;
create policy "Public can submit pending equipment listings"
  on public.equipment_listings
  for insert
  to anon, authenticated
  with check (status = 'pending');

drop policy if exists "Public can read manual directory entries" on public.equipment_manuals_v2;
create policy "Public can read manual directory entries"
  on public.equipment_manuals_v2
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read manual brands" on public.brands;
create policy "Public can read manual brands"
  on public.brands
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read equipment categories" on public.equipment_categories;
create policy "Public can read equipment categories"
  on public.equipment_categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read area updates" on public.area_updates;
create policy "Public can read area updates"
  on public.area_updates
  for select
  to anon, authenticated
  using (true);
