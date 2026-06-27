import { NextResponse } from 'next/server'
import { db, getAccountByToken } from '@/lib/rankradar'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const token = req.headers.get('x-rankradar-token') || ''
  const account = await getAccountByToken(token)
  if (!account) return NextResponse.json({ success: false }, { status: 401 })

  const { data } = await db()
    .from('seo_keywords')
    .select('*')
    .eq('account_id', account.id)
    .eq('active', true)
    .order('created_at', { ascending: true })

  return NextResponse.json({ success: true, keywords: data ?? [] })
}

export async function POST(req: Request) {
  const token = req.headers.get('x-rankradar-token') || ''
  const account = await getAccountByToken(token)
  if (!account) return NextResponse.json({ success: false }, { status: 401 })

  const body = await req.json()
  const keywords: string[] = Array.isArray(body.keywords)
    ? body.keywords.map((k: string) => k.trim().toLowerCase()).filter(Boolean)
    : []

  if (!keywords.length) return NextResponse.json({ success: false, message: 'No keywords provided' }, { status: 400 })

  const { data: existing } = await db()
    .from('seo_keywords')
    .select('id')
    .eq('account_id', account.id)
    .eq('active', true)

  const currentCount = existing?.length ?? 0
  const canAdd = account.keywords_limit - currentCount
  if (canAdd <= 0) {
    return NextResponse.json({ success: false, message: `Keyword limit reached (${account.keywords_limit})` }, { status: 400 })
  }

  const toInsert = keywords.slice(0, canAdd).map((keyword) => ({
    account_id: account.id,
    keyword,
  }))

  const { error } = await db()
    .from('seo_keywords')
    .upsert(toInsert, { onConflict: 'account_id,keyword', ignoreDuplicates: true })

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  return NextResponse.json({ success: true, added: toInsert.length })
}

export async function DELETE(req: Request) {
  const token = req.headers.get('x-rankradar-token') || ''
  const account = await getAccountByToken(token)
  if (!account) return NextResponse.json({ success: false }, { status: 401 })

  const { id } = await req.json()
  await db().from('seo_keywords').update({ active: false }).eq('id', id).eq('account_id', account.id)
  return NextResponse.json({ success: true })
}
