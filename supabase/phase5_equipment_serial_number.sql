-- Phase 5: separate model number from serial number on equipment
-- Run in Supabase SQL Editor

ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS serial_number TEXT;
