-- Customer Communication Engine migration
-- Run in Supabase SQL Editor

-- Add communication fields to new_customers
ALTER TABLE new_customers
  ADD COLUMN IF NOT EXISTS appointment_date        date,
  ADD COLUMN IF NOT EXISTS appointment_time        text,
  ADD COLUMN IF NOT EXISTS job_status              text DEFAULT 'pending'
    CHECK (job_status IN ('pending','confirmed','in_progress','parts_ordered','parts_delayed','completed','cancelled')),
  ADD COLUMN IF NOT EXISTS parts_status            text,
  ADD COLUMN IF NOT EXISTS tech_eta_minutes        integer,
  ADD COLUMN IF NOT EXISTS comm_sequence_step      integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_comm_at            timestamptz,
  ADD COLUMN IF NOT EXISTS technician_name         text,
  ADD COLUMN IF NOT EXISTS appointment_notes       text;

-- Communication log table
CREATE TABLE IF NOT EXISTS customer_comms_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid REFERENCES new_customers(id) ON DELETE CASCADE,
  customer_email  text NOT NULL,
  customer_phone  text,
  channel         text NOT NULL CHECK (channel IN ('email','sms')),
  trigger_type    text NOT NULL,
  subject         text,
  body            text NOT NULL,
  sent_at         timestamptz DEFAULT now(),
  status          text DEFAULT 'sent',
  error           text,
  sent_by         text DEFAULT 'auto'
);

CREATE INDEX IF NOT EXISTS idx_comms_log_customer ON customer_comms_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_comms_log_sent_at  ON customer_comms_log(sent_at DESC);

-- Index for cron job queries
CREATE INDEX IF NOT EXISTS idx_new_customers_appointment_date ON new_customers(appointment_date);
CREATE INDEX IF NOT EXISTS idx_new_customers_job_status       ON new_customers(job_status);
