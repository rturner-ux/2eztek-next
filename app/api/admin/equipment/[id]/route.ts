import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEquipmentById } from '@/lib/equipment'

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

  try {
    const data = await getEquipmentById(id)
    return NextResponse.json({ success: true, ...data })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const denied = auth(req)
  if (denied) return denied

  const { id } = await context.params
  const body = await req.json()

  const { error } = await supabase()
    .from('equipment')
    .update({
      customer_name:  body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone,
      address:        body.address,
      brand:          body.brand,
      model:          body.model,
      equipment_type: body.equipment_type,
      updated_at:     new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
