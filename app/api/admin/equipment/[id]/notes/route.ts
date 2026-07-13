import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function auth(req: Request) {
  const pw = req.headers.get('x-admin-password')
  if (!pw || pw !== process.env.ADMIN_BLOG_PASSWORD) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const denied = auth(req)
  if (denied) return denied

  const { id } = await context.params

  const { data, error } = await supabase()
    .from('equipment_notes')
    .select('*')
    .eq('equipment_id', id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  return NextResponse.json({ success: true, notes: data ?? [] })
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const denied = auth(req)
  if (denied) return denied

  const { id } = await context.params
  const body = await req.json()

  const note = String(body.note || '').trim()
  if (!note) {
    return NextResponse.json({ success: false, message: 'Note text is required' }, { status: 400 })
  }

  const { data, error } = await supabase()
    .from('equipment_notes')
    .insert({
      equipment_id: id,
      note,
      visible_to_customer: body.visible_to_customer !== false,
      created_by: body.created_by || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  return NextResponse.json({ success: true, note: data })
}
