-- Add travel distance tracking to new_customers
-- Run in Supabase SQL Editor

ALTER TABLE new_customers
  ADD COLUMN IF NOT EXISTS distance_miles integer;

CREATE INDEX IF NOT EXISTS idx_new_customers_distance
  ON new_customers (distance_miles);
