-- RankRadar SaaS: multi-tenant SEO competitor intelligence

CREATE TABLE IF NOT EXISTS seo_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token uuid UNIQUE DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  website_url text,
  owner_email text NOT NULL,
  owner_name text,
  location text,
  industry text DEFAULT 'general',
  plan text DEFAULT 'starter',
  square_customer_id text,
  square_card_id text,
  square_subscription_id text,
  next_billing_date timestamptz,
  subscription_status text DEFAULT 'pending',
  keywords_limit integer DEFAULT 15,
  competitors_limit integer DEFAULT 5,
  scan_frequency text DEFAULT 'weekly',
  blog_generation boolean DEFAULT false,
  onboarded boolean DEFAULT false,
  last_scanned_at timestamptz,
  next_scan_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seo_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES seo_accounts(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  active boolean DEFAULT true,
  last_scanned_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(account_id, keyword)
);

CREATE TABLE IF NOT EXISTS seo_competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES seo_accounts(id) ON DELETE CASCADE,
  domain text NOT NULL,
  label text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(account_id, domain)
);

CREATE TABLE IF NOT EXISTS seo_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES seo_accounts(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  our_rank integer,
  competitor_domain text,
  competitor_rank integer,
  checked_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_rankings_account ON seo_rankings(account_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_account ON seo_keywords(account_id);
CREATE INDEX IF NOT EXISTS idx_seo_competitors_account ON seo_competitors(account_id);
