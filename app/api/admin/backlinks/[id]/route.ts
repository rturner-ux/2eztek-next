import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function checkPassword(req: Request) {
  const pw = req.headers.get('x-admin-password')
  return Boolean(pw && pw === process.env.ADMIN_BLOG_PASSWORD)
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

  // Auto-timestamp status transitions
  const update: Record<string, unknown> = { ...body, updated_at: new Date().toISOString() }
  if (body.status === 'submitted' && !body.submitted_at) update.submitted_at = new Date().toISOString()
  if (body.status === 'live'      && !body.live_at)      update.live_at      = new Date().toISOString()

  const supabase = getSupabase()
  const { data, error } = await supabase.from('backlink_targets').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, target: data })
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params
  const supabase = getSupabase()
  const { error } = await supabase.from('backlink_targets').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
