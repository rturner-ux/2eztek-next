import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET all listings + all messages
export async function GET(request: Request) {
  const authError = requireAdminRequest(request)
  if (authError) return authError

  const supabase = getSupabase()

  const [{ data: listings, error: listErr }, { data: messages, error: msgErr }] =
    await Promise.all([
      supabase
        .from('equipment_listings')
        .select('id, title, category, brand, condition, city, state, price, seller_name, seller_email, seller_phone, status, photo_url, created_at')
        .order('created_at', { ascending: false })
        .limit(200),
      supabase
        .from('listing_messages')
        .select('id, listing_id, sender_name, sender_email, message, created_at, flagged')
        .order('created_at', { ascending: false })
        .limit(500),
    ])

  if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 })

  return NextResponse.json({
    listings: listings || [],
    messages: messages || [],
  })
}

// PATCH listing status OR flag a message
export async function PATCH(request: Request) {
  const authError = requireAdminRequest(request)
  if (authError) return authError

  const body = await request.json()
  const supabase = getSupabase()

  if (body.type === 'listing') {
    const { error } = await supabase
      .from('equipment_listings')
      .update({ status: body.status })
      .eq('id', body.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (body.type === 'message') {
    const { error } = await supabase
      .from('listing_messages')
      .update({ flagged: body.flagged })
      .eq('id', body.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// DELETE a listing, message, or all pending listings
export async function DELETE(request: Request) {
  const authError = requireAdminRequest(request)
  if (authError) return authError

  const body = await request.json()
  const supabase = getSupabase()

  if (body.type === 'bulk-pending') {
    const { error, count } = await supabase
      .from('equipment_listings')
      .delete({ count: 'exact' })
      .eq('status', 'pending')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, deleted: count })
  }

  const table = body.type === 'message' ? 'listing_messages' : 'equipment_listings'
  const { error } = await supabase.from(table).delete().eq('id', body.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
