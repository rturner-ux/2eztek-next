-- Phase 3: gate review request emails on ticket completion, not signup time
-- Run in Supabase SQL Editor

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS review_requested_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_projects_review_requested
  ON projects (review_requested_at, status, completion_date);
