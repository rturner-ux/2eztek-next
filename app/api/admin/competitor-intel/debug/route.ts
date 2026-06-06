import { NextResponse } from 'next/server'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'

const COMPETITORS = [
  'fitnessmachinetech.com',
  'servicefirstfitness.com',
  'fitnessrepair.com',
  'treadmillrepairman.com',
]

export async function GET(req: Request) {
  const unauthorized = requireAdminRequest(req)
  if (unauthorized) return unauthorized

  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || 'treadmill repair Dallas'

  const apiKey = process.env.GOOGLE_SEARCH_API_KEY
  const cx = process.env.GOOGLE_SEARCH_CX

  if (!apiKey || !cx) {
    return NextResponse.json({
      error: 'Missing env vars',
      GOOGLE_SEARCH_API_KEY: apiKey ? 'set' : 'MISSING',
      GOOGLE_SEARCH_CX: cx ? 'set' : 'MISSING',
    })
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(keyword)}&num=10`
  const response = await fetch(url)
  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json({ error: 'Google API error', status: response.status, details: data })
  }

  const items = data.items || []
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
    totalResults: data.searchInformation?.totalResults,
    ourRank: ourIndex === -1 ? 'Not in top 10' : `#${ourIndex + 1}`,
    competitors: competitorHits,
    top10Domains: domains,
  })
}
