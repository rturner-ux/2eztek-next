import 'server-only'
import { createClient } from '@supabase/supabase-js'

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

export { equipmentQrUrl, qrImageUrl } from '@/lib/equipment-utils'

/**
 * Find existing equipment by email + brand/model combination, or create a new record.
 * Returns the equipment id.
 */
export async function findOrCreateEquipment(params: {
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  brand: string
  model: string
  equipmentType: string
}): Promise<string> {
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

  if (existing) return existing.id

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
      equipment_type: params.equipmentType,
    })
    .select('id')
    .single()

  if (error) throw error
  return created.id
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
