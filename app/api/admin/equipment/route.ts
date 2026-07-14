import { NextResponse } from 'next/server'
import { getEquipmentList, findOrCreateEquipment } from '@/lib/equipment'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function auth(req: Request) {
  const pw = req.headers.get('x-admin-password')
  if (!pw || pw !== process.env.ADMIN_BLOG_PASSWORD) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET(req: Request) {
  const denied = auth(req)
  if (denied) return denied

  try {
    const equipment = await getEquipmentList(200)
    return NextResponse.json({ success: true, equipment })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const denied = auth(req)
  if (denied) return denied

  try {
    const body = await req.json()
    const { customer_name, customer_email, customer_phone, address, brand, model, serial_number, equipment_type } = body

    if (!customer_name || !customer_email || !brand) {
      return NextResponse.json({ success: false, message: 'Customer name, email, and brand are required' }, { status: 400 })
    }

    const { id } = await findOrCreateEquipment({
      customerName: customer_name,
      customerEmail: customer_email,
      customerPhone: customer_phone || '',
      address: address || '',
      brand,
      model: model || '',
      serialNumber: serial_number || '',
      equipmentType: equipment_type || '',
    })

    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}
