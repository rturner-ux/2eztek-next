-- ============================================================
-- 2EZ TEK — Enable Row Level Security on all tables
-- Safe version: skips tables that don't exist yet
-- Run this in Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'blog_posts', 'faqs', 'brands', 'equipment_categories',
    'equipment_models', 'equipment_manuals', 'equipment_listings',
    'featured_athletes', 'facility_spotlights', 'area_updates',
    'equipment', 'new_customers', 'site_leads', 'newsletter_subscribers',
    'blog_comments', 'blog_followers', 'listing_messages',
    'ai_visibility_results', 'ai_visibility_runs', 'backlink_targets',
    'chat_logs', 'competitor_rankings', 'keyword_pool',
    'manual_conversions', 'outreach_emails', 'outreach_prospects',
    'security_log', 'seo_accounts', 'seo_competitors',
    'seo_keywords', 'seo_rankings', 'manuals', 'equipment_manuals_v2'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (
      SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
      RAISE NOTICE 'RLS enabled: %', t;
    ELSE
      RAISE NOTICE 'Skipped (not found): %', t;
    END IF;
  END LOOP;
END $$;


-- ── Public READ policies ──────────────────────────────────────

-- Blog: only published posts
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='blog_posts') THEN
    DROP POLICY IF EXISTS "public_read_blog_posts" ON blog_posts;
    CREATE POLICY "public_read_blog_posts" ON blog_posts FOR SELECT USING (published = true);
  END IF;
END $$;

-- FAQs: only active
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='faqs') THEN
    DROP POLICY IF EXISTS "public_read_faqs" ON faqs;
    CREATE POLICY "public_read_faqs" ON faqs FOR SELECT USING (active = true);
  END IF;
END $$;

-- Equipment manuals (both tables)
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='equipment_manuals') THEN
    DROP POLICY IF EXISTS "public_read_equipment_manuals" ON equipment_manuals;
    CREATE POLICY "public_read_equipment_manuals" ON equipment_manuals FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='equipment_manuals_v2') THEN
    DROP POLICY IF EXISTS "public_read_equipment_manuals_v2" ON equipment_manuals_v2;
    CREATE POLICY "public_read_equipment_manuals_v2" ON equipment_manuals_v2 FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='manuals') THEN
    DROP POLICY IF EXISTS "public_read_manuals" ON manuals;
    CREATE POLICY "public_read_manuals" ON manuals FOR SELECT USING (true);
  END IF;
END $$;

-- Brands, categories, models
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='brands') THEN
    DROP POLICY IF EXISTS "public_read_brands" ON brands;
    CREATE POLICY "public_read_brands" ON brands FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='equipment_categories') THEN
    DROP POLICY IF EXISTS "public_read_equipment_categories" ON equipment_categories;
    CREATE POLICY "public_read_equipment_categories" ON equipment_categories FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='equipment_models') THEN
    DROP POLICY IF EXISTS "public_read_equipment_models" ON equipment_models;
    CREATE POLICY "public_read_equipment_models" ON equipment_models FOR SELECT USING (true);
  END IF;
END $$;

-- Public content
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='featured_athletes') THEN
    DROP POLICY IF EXISTS "public_read_featured_athletes" ON featured_athletes;
    CREATE POLICY "public_read_featured_athletes" ON featured_athletes FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='facility_spotlights') THEN
    DROP POLICY IF EXISTS "public_read_facility_spotlights" ON facility_spotlights;
    CREATE POLICY "public_read_facility_spotlights" ON facility_spotlights FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='area_updates') THEN
    DROP POLICY IF EXISTS "public_read_area_updates" ON area_updates;
    CREATE POLICY "public_read_area_updates" ON area_updates FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='equipment_listings') THEN
    DROP POLICY IF EXISTS "public_read_equipment_listings" ON equipment_listings;
    CREATE POLICY "public_read_equipment_listings" ON equipment_listings FOR SELECT USING (true);
  END IF;
END $$;

-- Equipment tags: QR scan page
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='equipment') THEN
    DROP POLICY IF EXISTS "public_read_equipment" ON equipment;
    CREATE POLICY "public_read_equipment" ON equipment FOR SELECT USING (true);
  END IF;
END $$;


-- ── Public INSERT policies ────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='site_leads') THEN
    DROP POLICY IF EXISTS "public_insert_site_leads" ON site_leads;
    CREATE POLICY "public_insert_site_leads" ON site_leads FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='newsletter_subscribers') THEN
    DROP POLICY IF EXISTS "public_insert_newsletter_subscribers" ON newsletter_subscribers;
    CREATE POLICY "public_insert_newsletter_subscribers" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='new_customers') THEN
    DROP POLICY IF EXISTS "public_insert_new_customers" ON new_customers;
    CREATE POLICY "public_insert_new_customers" ON new_customers FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='blog_comments') THEN
    DROP POLICY IF EXISTS "public_insert_blog_comments" ON blog_comments;
    CREATE POLICY "public_insert_blog_comments" ON blog_comments FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='blog_followers') THEN
    DROP POLICY IF EXISTS "public_insert_blog_followers" ON blog_followers;
    CREATE POLICY "public_insert_blog_followers" ON blog_followers FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='listing_messages') THEN
    DROP POLICY IF EXISTS "public_insert_listing_messages" ON listing_messages;
    CREATE POLICY "public_insert_listing_messages" ON listing_messages FOR INSERT WITH CHECK (true);
  END IF;
END $$;


-- ── Verification ──────────────────────────────────────────────
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
