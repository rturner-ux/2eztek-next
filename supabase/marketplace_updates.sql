-- marketplace_updates.sql
-- Run in FitServ Pro Supabase SQL Editor

-- 1. Add photo_url column to equipment_listings
alter table public.equipment_listings
  add column if not exists photo_url text default null;

-- 2. Create listing_messages table for marketplace chat
create table if not exists public.listing_messages (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid not null references public.equipment_listings(id) on delete cascade,
  sender_name text not null,
  sender_email text not null,
  sender_phone text default null,
  message text not null,
  created_at timestamptz default now() not null,
  read_by_admin boolean default false not null,
  flagged boolean default false not null
);

create index if not exists listing_messages_listing_id_idx
  on public.listing_messages (listing_id);

create index if not exists listing_messages_created_at_idx
  on public.listing_messages (created_at desc);

-- NOTE: Create a Storage bucket named "equipment-photos" in Supabase dashboard
-- Storage → New bucket → Name: equipment-photos → Public: ON
-- This allows uploaded equipment photos to be served via public URL.
