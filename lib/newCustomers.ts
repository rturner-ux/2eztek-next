import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { findOrCreateEquipment } from '@/lib/equipment'

export type NewCustomerInput = {
  name: string
  email: string
  phone: string
  address?: string
  serviceType?: string
  equipmentType?: string
  brandModel?: string
  details?: string
  source?: string
  page?: string
  distanceMiles?: number
  searchQuery?: string
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables.')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

function clean(value: unknown) {
  return String(value || '').trim()
}

export async function saveNewCustomer(input: NewCustomerInput): Promise<{ equipmentId: string | null }> {
  const supabase = getSupabaseAdmin()
  const email = clean(input.email).toLowerCase()
  const now = new Date().toISOString()

  // Auto-create or find equipment record for this machine
  let equipmentId: string | null = null
  if (email && input.brandModel) {
    const brand = clean(input.brandModel).split(' ')[0]
    try {
      equipmentId = await findOrCreateEquipment({
        customerName: clean(input.name),
        customerEmail: email,
        customerPhone: clean(input.phone),
        address: clean(input.address),
        brand,
        model: clean(input.brandModel).replace(brand, '').trim(),
        equipmentType: clean(input.equipmentType),
      })
    } catch (e) {
      console.error('Equipment record error:', e)
    }
  }

  const { error } = await supabase.from('new_customers').upsert(
    {
      name: clean(input.name),
      email,
      normalized_email: email,
      phone: clean(input.phone),
      address: clean(input.address),
      service_type: clean(input.serviceType),
      equipment_type: clean(input.equipmentType),
      brand_model: clean(input.brandModel),
      details: clean(input.details),
      source: clean(input.source) || 'Website Intake',
      page: clean(input.page),
      search_query: clean(input.searchQuery),
      ...(input.distanceMiles !== undefined && { distance_miles: input.distanceMiles }),
      ...(equipmentId && { equipment_id: equipmentId }),
      status: 'new',
      updated_at: now,
      last_request_at: now,
    },
    {
      onConflict: 'normalized_email',
    }
  )

  if (error) throw error
  return { equipmentId }
}

export async function captureNewCustomer(input: NewCustomerInput) {
  try {
    const { equipmentId } = await saveNewCustomer(input)
    return { success: true, equipmentId }
  } catch (error) {
    console.error('NEW CUSTOMER CAPTURE ERROR:', error)
    return { success: false, equipmentId: null }
  }
}
