import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Execute SQL via Supabase pg/query endpoint (internal API)
async function runSql(sql: string, label: string) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/pg/query`
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ query: sql }),
  })

  if (res.ok) {
    console.log(`✅ ${label}`)
    return true
  }

  const text = await res.text()
  console.log(`⚠️  ${label} — pg/query returned ${res.status}: ${text.slice(0, 120)}`)

  // Fallback: try running as RPC via exec_sql stored procedure
  const { error } = await supabase.rpc('exec_sql', { query: sql })
  if (error) {
    console.log(`   rpc fallback error: ${error.message}`)
    return false
  }

  console.log(`✅ ${label} (via rpc)`)
  return true
}

async function main() {
  console.log('Running 2EZ TEK AI upgrade migrations...\n')

  const ok1 = await runSql(`
    CREATE TABLE IF NOT EXISTS public.chat_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      messages jsonb NOT NULL,
      detected_brand text NOT NULL DEFAULT '',
      mined boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
    CREATE INDEX IF NOT EXISTS chat_logs_mined_created_idx ON public.chat_logs (mined, created_at DESC);
  `, 'chat_logs table')

  const ok2 = await runSql(`
    ALTER TABLE public.new_customers
      ADD COLUMN IF NOT EXISTS triage_score integer DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS triage_priority text DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS triage_notes text DEFAULT NULL;
    CREATE INDEX IF NOT EXISTS new_customers_triage_score_idx ON public.new_customers (triage_score DESC NULLS LAST);
  `, 'triage columns on new_customers')

  const ok3 = await runSql(`
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
  `, 'competitor_rankings table')

  if (ok1 && ok2 && ok3) {
    console.log('\n✅ All migrations complete.')
  } else {
    console.log('\n⚠️  Some migrations may need to be run manually in the Supabase dashboard.')
    console.log('   Files: supabase/chat_logs.sql, supabase/triage_columns.sql, supabase/competitor_rankings.sql')
  }
}

main().catch(console.error)
