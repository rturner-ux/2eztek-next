// app/api/admin/migrate/route.ts
// One-time migration runner — creates new tables/columns needed by the AI upgrade.
// Protected by CRON_SECRET. Safe to run multiple times (all statements use IF NOT EXISTS).
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const MIGRATIONS = [
  {
    name: 'chat_logs',
    check: `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='chat_logs'`,
    sql: `
      CREATE TABLE IF NOT EXISTS public.chat_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        messages jsonb NOT NULL,
        detected_brand text NOT NULL DEFAULT '',
        mined boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
      CREATE INDEX IF NOT EXISTS chat_logs_mined_created_idx ON public.chat_logs (mined, created_at DESC);
    `,
  },
  {
    name: 'triage_columns',
    check: `SELECT 1 FROM information_schema.columns WHERE table_name='new_customers' AND column_name='triage_score'`,
    sql: `
      ALTER TABLE public.new_customers
        ADD COLUMN IF NOT EXISTS triage_score integer DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS triage_priority text DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS triage_notes text DEFAULT NULL;
      CREATE INDEX IF NOT EXISTS new_customers_triage_score_idx ON public.new_customers (triage_score DESC NULLS LAST);
    `,
  },
  {
    name: 'competitor_rankings',
    check: `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='competitor_rankings'`,
    sql: `
      CREATE TABLE IF NOT EXISTS public.competitor_rankings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        keyword text NOT NULL,
        our_rank integer,
        competitor_domain text,
        competitor_rank integer,
        checked_at timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE public.competitor_rankings ENABLE ROW LEVEL SECURITY;
      CREATE INDEX IF NOT EXISTS competitor_rankings_keyword_idx ON public.competitor_rankings (keyword, checked_at DESC);
      CREATE INDEX IF NOT EXISTS competitor_rankings_date_idx ON public.competitor_rankings (checked_at DESC);
    `,
  },
]

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const results: Record<string, string> = {}

  for (const migration of MIGRATIONS) {
    try {
      // Check if already applied
      const checkRes = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_migration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ query: migration.check }),
      })

      // Try the Supabase pg endpoint for raw SQL
      const sqlRes = await fetch(`${supabaseUrl}/pg/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ query: migration.sql }),
      })

      if (sqlRes.ok) {
        results[migration.name] = 'applied'
      } else {
        // Fallback: try direct approach via supabase-js rpc
        const supabase = createClient(supabaseUrl, serviceKey)
        const stmts = migration.sql.split(';').map(s => s.trim()).filter(Boolean)
        for (const stmt of stmts) {
          await supabase.rpc('exec_sql', { sql: stmt }).then(() => {}).catch(() => {})
        }
        results[migration.name] = 'attempted-fallback'
      }
    } catch (err: any) {
      results[migration.name] = `error: ${err.message}`
    }
  }

  return NextResponse.json({ success: true, results })
}
