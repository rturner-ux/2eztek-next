-- Outreach Prospects: businesses discovered for cold outreach
CREATE TABLE IF NOT EXISTS outreach_prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  business_type text, -- gym, hotel, apartment, corporate, crossfit, school
  address text,
  city text,
  phone text,
  website text,
  email text,
  contact_name text,
  intent_score integer DEFAULT 0,
  notes text,
  status text DEFAULT 'new', -- new | drafted | sent | replied | booked | not_interested
  last_contacted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Emails sent to prospects
CREATE TABLE IF NOT EXISTS outreach_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid REFERENCES outreach_prospects(id) ON DELETE CASCADE,
  subject text NOT NULL,
  body text NOT NULL,
  sent_at timestamptz,
  resend_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS outreach_prospects_status ON outreach_prospects(status);
CREATE INDEX IF NOT EXISTS outreach_prospects_created ON outreach_prospects(created_at DESC);
CREATE INDEX IF NOT EXISTS outreach_emails_prospect ON outreach_emails(prospect_id);

-- Enable RLS (admin only — service role key bypasses RLS)
ALTER TABLE outreach_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_emails ENABLE ROW LEVEL SECURITY;
