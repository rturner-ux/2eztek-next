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

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params
  const body = await req.json()
  const supabase = getSupabase()
  const { data, error } = await supabase.from('faqs').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, faq: data })
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params
  const supabase = getSupabase()
  const { error } = await supabase.from('faqs').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
