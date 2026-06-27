import { NextResponse } from 'next/server'
import { db, getAccountByToken } from '@/lib/rankradar'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getToken(req: Request) {
  return req.headers.get('x-rankradar-token') || ''
}

export async function GET(req: Request) {
  const account = await getAccountByToken(getToken(req))
  if (!account) return NextResponse.json({ success: false }, { status: 401 })
  return NextResponse.json({ success: true, account })
}

export async function PATCH(req: Request) {
  const account = await getAccountByToken(getToken(req))
  if (!account) return NextResponse.json({ success: false }, { status: 401 })

  const body = await req.json()
  const allowed = ['business_name', 'website_url', 'location', 'industry', 'owner_name', 'onboarded']
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const { error } = await db().from('seo_accounts').update(update).eq('id', account.id)
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
