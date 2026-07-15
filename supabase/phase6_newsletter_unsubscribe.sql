-- Phase 6: real unsubscribe support for the newsletter / welcome-series emails
-- Run in Supabase SQL Editor

ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_unsubscribed
  ON newsletter_subscribers (email, unsubscribed_at);
