-- Run this in your Supabase SQL editor
-- 2EZ TEK Project Planner Tables

CREATE TABLE IF NOT EXISTS projects (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name                  TEXT NOT NULL,
  project_type          TEXT DEFAULT 'repair',        -- repair | install | dispatch | maintenance
  job_source            TEXT DEFAULT 'direct',         -- direct | dispatch

  -- Customer
  customer_name         TEXT,
  customer_phone        TEXT,
  customer_email        TEXT,
  site_address          TEXT,

  -- Dispatch details (only for dispatch jobs)
  dispatch_company      TEXT,
  dispatch_job_number   TEXT,
  dispatch_contact      TEXT,
  dispatch_billing_email TEXT,
  dispatch_tech_support TEXT,

  -- Equipment
  equipment_type        TEXT,
  equipment_brand       TEXT,
  equipment_model       TEXT,
  issue_description     TEXT,

  -- Status
  status                TEXT DEFAULT 'new',
  -- new | quoted | parts_ordered | parts_received | scheduled | in_progress | punch_list | complete | invoiced | paid
  priority              TEXT DEFAULT 'medium',        -- low | medium | high | urgent

  -- Money
  quote_amount          NUMERIC(10,2),
  invoice_amount        NUMERIC(10,2),
  payment_status        TEXT DEFAULT 'unpaid',        -- unpaid | invoiced | paid
  payment_method        TEXT,

  -- Logistics
  parts_status          TEXT DEFAULT 'none',          -- none | ordered | received | installed
  parts_notes           TEXT,
  technician            TEXT,
  scheduled_date        DATE,
  completion_date       DATE,

  -- POD
  pod_required          BOOLEAN DEFAULT false,
  pod_signed            BOOLEAN DEFAULT false,
  pod_url               TEXT,

  -- Notes
  notes                 TEXT,
  internal_notes        TEXT,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_tasks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT DEFAULT 'todo',    -- todo | in_progress | done | blocked
  priority    TEXT DEFAULT 'medium',
  assigned_to TEXT,
  due_date    DATE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast project task lookups
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_job_source ON projects(job_source);
CREATE INDEX IF NOT EXISTS idx_projects_scheduled_date ON projects(scheduled_date);
