import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function checkPassword(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_BLOG_PASSWORD
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET — last 30 runs + latest result breakdown
export async function GET(req: NextRequest) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = db()

  const [{ data: runs }, { data: latestResults }] = await Promise.all([
    supabase
      .from('ai_visibility_runs')
      .select('id, score, mentions, total_prompts, platform, created_at')
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('ai_visibility_results')
      .select('id, prompt_id, prompt, category, mentioned, preferred, response, created_at')
      .order('created_at', { ascending: false })
      .limit(12),
  ])

  return NextResponse.json({ runs: runs ?? [], latestResults: latestResults ?? [] })
}
