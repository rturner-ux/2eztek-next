import 'server-only'

import { createClient } from '@supabase/supabase-js'

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

export async function saveNewCustomer(input: NewCustomerInput) {
  const supabase = getSupabaseAdmin()
  const email = clean(input.email).toLowerCase()
  const now = new Date().toISOString()

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
      status: 'new',
      updated_at: now,
      last_request_at: now,
    },
    {
      onConflict: 'normalized_email',
    }
  )

  if (error) throw error
}

export async function captureNewCustomer(input: NewCustomerInput) {
  try {
    await saveNewCustomer(input)
    return true
  } catch (error) {
    console.error('NEW CUSTOMER CAPTURE ERROR:', error)
    return false
  }
}
