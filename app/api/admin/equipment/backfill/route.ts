import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { findOrCreateEquipment } from '@/lib/equipment'

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

function parseBrand(brandModel: string) {
  const known = [
    'NordicTrack', 'ProForm', 'Life Fitness', 'LifeFitness', 'Precor', 'Peloton',
    'Bowflex', 'Matrix', 'Cybex', 'StairMaster', 'Schwinn', 'Technogym',
    'TRUE Fitness', 'Nautilus', 'Star Trac', 'FreeMotion', 'Hammer Strength',
    'Sole', 'Horizon', 'Tonal', 'iFIT', 'Concept2', 'Echelon',
  ]
  for (const b of known) {
    if (brandModel.toLowerCase().includes(b.toLowerCase())) {
      return { brand: b, model: brandModel.replace(new RegExp(b, 'i'), '').trim() }
    }
  }
  const parts = brandModel.trim().split(/\s+/).filter(Boolean)
  return { brand: parts[0] || '', model: parts.slice(1).join(' ') }
}

export async function POST(req: Request) {
  const denied = auth(req)
  if (denied) return denied

  const db = supabase()

  // Fetch customers from last 30 days with no equipment_id
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: customers, error } = await db
    .from('new_customers')
    .select('id, name, email, phone, address, brand_model, equipment_type')
    .is('equipment_id', null)
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }

  if (!customers || customers.length === 0) {
    return NextResponse.json({ success: true, created: 0, skipped: 0, message: 'No unlinked customers found in the past 30 days.' })
  }

  let created = 0
  let skipped = 0
  const results: { name: string; brand: string; equipmentId: string }[] = []

  for (const customer of customers) {
    if (!customer.email || !customer.brand_model?.trim()) {
      skipped++
      continue
    }

    try {
      const { brand, model } = parseBrand(customer.brand_model)
      if (!brand) {
        skipped++
        continue
      }

      const equipmentId = await findOrCreateEquipment({
        customerName: customer.name || '',
        customerEmail: customer.email,
        customerPhone: customer.phone || '',
        address: customer.address || '',
        brand,
        model,
        equipmentType: customer.equipment_type || '',
      })

      await db
        .from('new_customers')
        .update({ equipment_id: equipmentId })
        .eq('id', customer.id)

      results.push({ name: customer.name || customer.email, brand, equipmentId })
      created++
    } catch (err) {
      console.error('Backfill error for', customer.email, err)
      skipped++
    }
  }

  return NextResponse.json({
    success: true,
    created,
    skipped,
    total: customers.length,
    results,
  })
}
