import { NextResponse } from 'next/server'
import { db, getAccountByToken } from '@/lib/rankradar'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function serperSearch(keyword: string): Promise<{ domain: string; position: number }[]> {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: keyword, num: 10 }),
  })
  const data = await res.json()
  return (data.organic || []).map((r: { link: string }, i: number) => {
    const domain = r.link.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    return { domain, position: i + 1 }
  })
}

function findRank(results: { domain: string; position: number }[], targetDomain: string): number | null {
  const cleaned = targetDomain.replace(/^www\./, '').toLowerCase()
  const found = results.find((r) => r.domain.toLowerCase().includes(cleaned))
  return found ? found.position : null
}

export async function POST(req: Request) {
  const token = req.headers.get('x-rankradar-token') || ''
  const account = await getAccountByToken(token)
  if (!account) return NextResponse.json({ success: false }, { status: 401 })

  if (account.subscription_status !== 'active' && account.subscription_status !== 'trialing') {
    return NextResponse.json({ success: false, message: 'Active subscription required' }, { status: 403 })
  }

  const supabase = db()

  const { data: keywordRows } = await supabase
    .from('seo_keywords')
    .select('keyword')
    .eq('account_id', account.id)
    .eq('active', true)
    .limit(50)

  const { data: competitorRows } = await supabase
    .from('seo_competitors')
    .select('domain')
    .eq('account_id', account.id)

  const keywords = (keywordRows ?? []).map((r) => r.keyword)
  const competitors = (competitorRows ?? []).map((r) => r.domain)

  if (!keywords.length) {
    return NextResponse.json({ success: false, message: 'No keywords configured' }, { status: 400 })
  }

  const ourDomain = account.website_url?.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || ''
  const toScan = keywords.slice(0, 12)
  const rows: object[] = []

  for (const keyword of toScan) {
    try {
      const results = await serperSearch(keyword)
      const ourRank = ourDomain ? findRank(results, ourDomain) : null
      const topCompetitor = results.find((r) =>
        competitors.some((c) => r.domain.toLowerCase().includes(c.toLowerCase()))
      )

      rows.push({
        account_id: account.id,
        keyword,
        our_rank: ourRank,
        competitor_domain: topCompetitor?.domain || null,
        competitor_rank: topCompetitor?.position || null,
        checked_at: new Date().toISOString(),
      })

      await new Promise((r) => setTimeout(r, 300))
    } catch {
      // skip failed keywords
    }
  }

  if (rows.length) {
    await supabase.from('seo_rankings').insert(rows)
    await supabase
      .from('seo_accounts')
      .update({ last_scanned_at: new Date().toISOString() })
      .eq('id', account.id)
    await supabase
      .from('seo_keywords')
      .update({ last_scanned_at: new Date().toISOString() })
      .eq('account_id', account.id)
      .in('keyword', toScan)
  }

  return NextResponse.json({ success: true, scanned: rows.length, keywords: toScan })
}
