-- Phase 4: technician notes on equipment, optionally visible to the customer
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS equipment_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  visible_to_customer BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_equipment_notes_equipment_id
  ON equipment_notes (equipment_id, created_at DESC);
