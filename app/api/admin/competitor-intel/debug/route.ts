import { NextResponse } from 'next/server'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'

const COMPETITORS = [
  'fitnessmachinetech.com',
  'servicefirst-tx.com',
  'servicefirstfitness.com',
  'fitnessrepair.com',
  'treadmillrepairman.com',
  'repairfitness.com',
  'fitnesstech.com',
]

export async function GET(req: Request) {
  const unauthorized = requireAdminRequest(req)
  if (unauthorized) return unauthorized

  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || 'treadmill repair Dallas'

  const serperKey = process.env.SERPER_API_KEY
  if (!serperKey) {
    return NextResponse.json({ error: 'Missing env vars', SERPER_API_KEY: 'MISSING' })
  }

  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: keyword, num: 10 }),
  })
  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json({ error: 'Serper API error', status: response.status, details: data })
  }

  const items = (data.organic || []) as any[]
  const domains = items.map((r: any) => {
    try { return new URL(r.link).hostname.replace('www.', '') } catch { return r.link }
  })

  const ourIndex = domains.findIndex((d: string) => d.includes('2eztek.com'))
  const competitorHits = COMPETITORS.map(c => {
    const clean = c.replace('www.', '')
    const idx = domains.findIndex((d: string) => d === clean || d.endsWith(`.${clean}`))
    return { domain: c, rank: idx === -1 ? null : idx + 1 }
  })

  return NextResponse.json({
    keyword,
    totalResults: data.searchParameters?.num ?? items.length,
    ourRank: ourIndex === -1 ? 'Not in top 10' : `#${ourIndex + 1}`,
    competitors: competitorHits,
    top10Domains: domains,
  })
}
