import { NextResponse } from 'next/server'
import { db, getAccountByToken } from '@/lib/rankradar'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const token = req.headers.get('x-rankradar-token') || ''
  const account = await getAccountByToken(token)
  if (!account) return NextResponse.json({ success: false }, { status: 401 })

  const { data: rankings } = await db()
    .from('seo_rankings')
    .select('*')
    .eq('account_id', account.id)
    .order('checked_at', { ascending: false })
    .limit(500)

  return NextResponse.json({ success: true, rankings: rankings ?? [] })
}
