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

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const db = supabase()

  const { data: equipment, error } = await db
    .from('equipment')
    .select('id, customer_name, brand, model, equipment_type, address, created_at')
    .eq('id', id)
    .single()

  if (error || !equipment) {
    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  }

  const { data: history } = await db
    .from('new_customers')
    .select('id, service_type, details, status, created_at')
    .eq('equipment_id', id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ success: true, equipment, history: history ?? [] })
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const db = supabase()

  const { data: equipment, error } = await db
    .from('equipment')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !equipment) {
    return NextResponse.json({ success: false, message: 'Equipment not found' }, { status: 404 })
  }

  const body = await req.json()
  const { issue, details } = body

  if (!issue) {
    return NextResponse.json({ success: false, message: 'Issue is required' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const { error: upsertError } = await db.from('new_customers').upsert(
    {
      name: equipment.customer_name,
      email: equipment.customer_email,
      normalized_email: equipment.customer_email?.toLowerCase(),
      phone: equipment.customer_phone,
      address: equipment.address,
      brand_model: `${equipment.brand} ${equipment.model}`.trim(),
      equipment_type: equipment.equipment_type,
      service_type: issue,
      details: details || '',
      source: 'QR Code Scan',
      equipment_id: id,
      status: 'new',
      updated_at: now,
      last_request_at: now,
    },
    { onConflict: 'normalized_email' }
  )

  if (upsertError) {
    console.error('Equipment service request error:', upsertError)
    return NextResponse.json({ success: false, message: 'Unable to submit your request. Please call (972) 807-7232.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
