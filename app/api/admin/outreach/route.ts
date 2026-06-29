import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function checkPassword(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_BLOG_PASSWORD
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/admin/outreach — list prospects
export async function GET(req: NextRequest) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const status = new URL(req.url).searchParams.get('status')
  let query = db().from('outreach_prospects').select('*').order('created_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('status', status)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ prospects: data })
}

// POST /api/admin/outreach — save prospect(s) from discovery
export async function POST(req: NextRequest) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()

  // Accept single prospect or array
  const items = Array.isArray(body) ? body : [body]
  const { data, error } = await db()
    .from('outreach_prospects')
    .upsert(
      items.map((p) => ({
        business_name: p.business_name || p.name,
        business_type: p.business_type,
        address: p.address,
        city: p.city,
        phone: p.phone,
        website: p.website,
        email: p.email || null,
        intent_score: p.intent_score || 0,
        status: 'new',
      })),
      { onConflict: 'business_name,address', ignoreDuplicates: true }
    )
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ saved: data?.length ?? 0 })
}

// PUT /api/admin/outreach — update prospect (status, email, notes)
export async function PUT(req: NextRequest) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const { error } = await db().from('outreach_prospects').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE /api/admin/outreach — remove prospect
export async function DELETE(req: NextRequest) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await db().from('outreach_prospects').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
