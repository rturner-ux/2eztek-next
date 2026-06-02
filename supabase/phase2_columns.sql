-- Phase 2 AI upgrade columns for new_customers
-- Run in Supabase SQL Editor

-- #21: review request tracking
ALTER TABLE new_customers
  ADD COLUMN IF NOT EXISTS review_requested_at TIMESTAMPTZ;

-- #26: seasonal campaign tracking
ALTER TABLE new_customers
  ADD COLUMN IF NOT EXISTS seasonal_emailed_at TIMESTAMPTZ;

-- Optional: index for cron query performance
CREATE INDEX IF NOT EXISTS idx_new_customers_review_requested
  ON new_customers (review_requested_at, created_at);

CREATE INDEX IF NOT EXISTS idx_new_customers_seasonal_emailed
  ON new_customers (seasonal_emailed_at);
