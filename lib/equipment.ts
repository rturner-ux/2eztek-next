import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { equipmentQrUrl, qrImageUrl } from '@/lib/equipment-utils'

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type Equipment = {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  address: string
  brand: string
  model: string
  serial_number: string | null
  equipment_type: string
  created_at: string
  updated_at: string
}

export type ServiceRequest = {
  id: string
  equipment_id: string
  name: string
  email: string
  phone: string
  service_type: string
  equipment_type: string
  brand_model: string
  details: string
  status: string
  source: string
  created_at: string
}

export { equipmentQrUrl, qrImageUrl }

/**
 * Find existing equipment by email + brand/model combination, or create a new record.
 * Returns the equipment id and whether it was newly created (vs. an existing match).
 */
export async function findOrCreateEquipment(params: {
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  brand: string
  model: string
  serialNumber?: string
  equipmentType: string
}): Promise<{ id: string; created: boolean }> {
  const db = supabase()
  const email = params.customerEmail.toLowerCase().trim()

  // Check for existing equipment matching this customer + brand/model
  const { data: existing } = await db
    .from('equipment')
    .select('id')
    .eq('customer_email', email)
    .ilike('brand', params.brand || '')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) return { id: existing.id, created: false }

  // Create new equipment record
  const { data: created, error } = await db
    .from('equipment')
    .insert({
      customer_name: params.customerName,
      customer_email: email,
      customer_phone: params.customerPhone,
      address: params.address,
      brand: params.brand,
      model: params.model,
      serial_number: params.serialNumber || null,
      equipment_type: params.equipmentType,
    })
    .select('id')
    .single()

  if (error) throw error
  return { id: created.id, created: true }
}

/**
 * Known-brand-aware split of a free-text "brand model" string, e.g.
 * "Life Fitness Treadmill" -> { brand: "Life Fitness", model: "Treadmill" }.
 * Shared by every path that creates equipment from a single combined field.
 */
export function parseBrand(brandModel: string): { brand: string; model: string } {
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

/**
 * Email a customer their asset tag(s): QR code, brand/model, and a link to
 * their public equipment page. Used both by the manual admin "Email
 * Customer" button and automatically the first time equipment is created
 * from a service request.
 */
export async function sendAssetTagEmail(ids: string[]): Promise<{ success: boolean; message?: string }> {
  if (ids.length === 0) return { success: false, message: 'No asset ids provided' }

  const db = supabase()
  const { data: equipment, error } = await db
    .from('equipment')
    .select('id, customer_name, customer_email, brand, model, equipment_type')
    .in('id', ids)

  if (error) return { success: false, message: error.message }
  if (!equipment || equipment.length === 0) return { success: false, message: 'No matching equipment found' }

  const primary = equipment[0] as Equipment
  if (!primary.customer_email) return { success: false, message: 'Customer has no email on file' }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return { success: false, message: 'Email is not configured' }

  const firstName = (primary.customer_name || 'there').trim().split(/\s+/)[0]
  const multiple = equipment.length > 1
  const subject = multiple
    ? `Your 2EZ TEK Asset Tags (${equipment.length})`
    : `Your 2EZ TEK Asset Tag — ${primary.brand} ${primary.model || ''}`.trim()

  const assetBlock = (eq: Equipment) => `
    <div style="border:1px solid #e5e5e5;border-radius:12px;padding:20px;margin-bottom:16px;text-align:center;">
      <span style="display:inline-block;background:#e0f7fa;color:#0891b2;font-size:10px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;padding:4px 10px;border-radius:100px;">
        ${eq.equipment_type || 'Equipment'}
      </span>
      <p style="margin:10px 0 4px;font-size:16px;font-weight:900;color:#111;">${eq.brand} ${eq.model || ''}</p>
      <img src="${qrImageUrl(eq.id, 220)}" alt="Asset QR Code" width="180" height="180" style="margin:12px 0;border-radius:8px;border:1px solid #eee;" />
      <p style="margin:0 0 12px;font-size:12px;color:#888;word-break:break-all;">${equipmentQrUrl(eq.id)}</p>
      <a href="${equipmentQrUrl(eq.id)}" style="display:inline-block;background:#22d3ee;color:#000;font-weight:900;font-size:13px;padding:10px 22px;border-radius:100px;text-decoration:none;">
        View / Print Asset Page
      </a>
    </div>
  `

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.7;color:#222;max-width:560px;margin:0 auto">
      <div style="background:#050B14;padding:20px 28px;border-radius:16px 16px 0 0">
        <div style="color:#67e8f9;font-size:20px;font-weight:900;letter-spacing:0.05em">2EZ TEK</div>
        <div style="color:#94a3b8;font-size:12px;margin-top:2px">Dallas Fort Worth Fitness Equipment Service</div>
      </div>
      <div style="padding:28px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 16px 16px">
        <p style="margin:0 0 20px;font-size:15px;">
          Hi ${firstName}, here ${multiple ? 'are the asset tags' : 'is the asset tag'} for your equipment.
          Save or print ${multiple ? 'these' : 'this'} so you can quickly scan the QR code to report an issue or check service history anytime.
        </p>
        ${(equipment as Equipment[]).map(assetBlock).join('')}
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#999">
          2EZ TEK · Dallas Fort Worth, TX · (972) 807-7232 · 2eztek.com
        </div>
      </div>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: '2EZ TEK <support@2eztek.com>',
      to: [primary.customer_email],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    return { success: false, message: `Resend error: ${errBody}` }
  }

  return { success: true }
}

export async function getEquipmentList(limit = 100) {
  const db = supabase()
  const { data, error } = await db
    .from('equipment')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as Equipment[]
}

export async function getEquipmentById(id: string) {
  const db = supabase()
  const { data: equipment, error } = await db
    .from('equipment')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error

  const { data: history } = await db
    .from('new_customers')
    .select('id, name, email, phone, service_type, equipment_type, brand_model, details, status, source, created_at')
    .eq('equipment_id', id)
    .order('created_at', { ascending: false })

  return {
    equipment: equipment as Equipment,
    history: (history ?? []) as ServiceRequest[],
  }
}
