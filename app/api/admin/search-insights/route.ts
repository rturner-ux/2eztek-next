import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function checkPassword(req: Request) {
  const password = req.headers.get('x-admin-password')
  return Boolean(password && password === process.env.ADMIN_BLOG_PASSWORD)
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: Request) {
  if (!checkPassword(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getSupabase()

    const [queriesResult, faqsResult] = await Promise.all([
      supabase
        .from('new_customers')
        .select('search_query, last_request_at, name')
        .not('search_query', 'is', null)
        .not('search_query', 'eq', '')
        .order('last_request_at', { ascending: false })
        .limit(500),
      supabase
        .from('faqs')
        .select('id, question, answer, category, active, sort_order')
        .order('sort_order', { ascending: true }),
    ])

    // Platform names customers enter instead of their actual search query.
    // These tell us the traffic source channel, not the keyword — keep them
    // separate so they don't pollute the gap analysis.
    const PLATFORM_NAMES = new Set([
      'google', 'bing', 'yahoo', 'duckduckgo', 'chatgpt', 'chat gpt',
      'gemini', 'copilot', 'perplexity', 'claude', 'gpt', 'ai', 'siri',
      'alexa', 'facebook', 'instagram', 'nextdoor', 'yelp', 'thumbtack',
      'google maps', 'apple maps', 'maps',
    ])

    // Group search queries by normalized text
    const queryMap    = new Map<string, { count: number; lastSeen: string }>()
    const platformMap = new Map<string, { count: number; lastSeen: string }>()

    for (const row of queriesResult.data || []) {
      const q   = (row.search_query || '').trim()
      if (!q || q.length < 2) continue
      const key = q.toLowerCase()

      if (PLATFORM_NAMES.has(key)) {
        const ex = platformMap.get(key)
        if (ex) { ex.count++; if (row.last_request_at > ex.lastSeen) ex.lastSeen = row.last_request_at }
        else platformMap.set(key, { count: 1, lastSeen: row.last_request_at || '' })
      } else {
        if (q.length < 4) continue
        const ex = queryMap.get(key)
        if (ex) { ex.count++; if (row.last_request_at > ex.lastSeen) ex.lastSeen = row.last_request_at }
        else queryMap.set(key, { count: 1, lastSeen: row.last_request_at || '' })
      }
    }

    const faqs    = faqsResult.data || []
    const faqText = faqs.map((f) => (f.question + ' ' + f.answer).toLowerCase())

    // Determine coverage: does any FAQ answer this query?
    const queries = Array.from(queryMap.entries())
      .map(([query, stats]) => {
        const words   = query.split(/\s+/).filter((w) => w.length > 3)
        const covered = faqText.some((ft) => words.filter((w) => ft.includes(w)).length >= Math.max(1, Math.floor(words.length * 0.4)))
        return { query, ...stats, covered }
      })
      .sort((a, b) => b.count - a.count || b.lastSeen.localeCompare(a.lastSeen))

    // Platform traffic sorted by count — shows AI/search channel attribution
    const platforms = Array.from(platformMap.entries())
      .map(([platform, stats]) => ({ platform, ...stats }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ success: true, queries, faqs, platforms })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
