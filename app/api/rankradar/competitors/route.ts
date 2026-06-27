import { NextResponse } from 'next/server'
import { db, getAccountByToken } from '@/lib/rankradar'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function cleanDomain(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase().trim()
}

export async function GET(req: Request) {
  const token = req.headers.get('x-rankradar-token') || ''
  const account = await getAccountByToken(token)
  if (!account) return NextResponse.json({ success: false }, { status: 401 })

  const { data } = await db()
    .from('seo_competitors')
    .select('*')
    .eq('account_id', account.id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ success: true, competitors: data ?? [] })
}

export async function POST(req: Request) {
  const token = req.headers.get('x-rankradar-token') || ''
  const account = await getAccountByToken(token)
  if (!account) return NextResponse.json({ success: false }, { status: 401 })

  const body = await req.json()
  const domains: { domain: string; label?: string }[] = Array.isArray(body.competitors)
    ? body.competitors
    : [{ domain: body.domain, label: body.label }]

  const { data: existing } = await db()
    .from('seo_competitors')
    .select('id')
    .eq('account_id', account.id)

  if ((existing?.length ?? 0) >= account.competitors_limit) {
    return NextResponse.json({ success: false, message: `Competitor limit reached (${account.competitors_limit})` }, { status: 400 })
  }

  const toInsert = domains.map((c) => ({
    account_id: account.id,
    domain: cleanDomain(c.domain),
    label: c.label || cleanDomain(c.domain),
  }))

  const { error } = await db()
    .from('seo_competitors')
    .upsert(toInsert, { onConflict: 'account_id,domain', ignoreDuplicates: true })

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const token = req.headers.get('x-rankradar-token') || ''
  const account = await getAccountByToken(token)
  if (!account) return NextResponse.json({ success: false }, { status: 401 })

  const { id } = await req.json()
  await db().from('seo_competitors').delete().eq('id', id).eq('account_id', account.id)
  return NextResponse.json({ success: true })
}
