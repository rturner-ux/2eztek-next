import { NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { draftAndSend, getCustomerCommProfile } from '@/lib/customerComms'
import type { CommTrigger } from '@/lib/customerComms'
import { createAppointmentEvent } from '@/lib/msGraph'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID_TRIGGERS: CommTrigger[] = [
  'day_before_reminder',
  'morning_of',
  'tech_30_min_out',
  'post_visit_followup',
  'parts_ordered',
  'parts_delayed',
  'running_late',
  'reschedule_request',
  'general_update',
]

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function requireAdmin(request: Request) {
  const secret = request.headers.get('x-admin-password')
  if (!process.env.ADMIN_BLOG_PASSWORD || secret !== process.env.ADMIN_BLOG_PASSWORD) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

function maybeCreateAppointmentEvent(
  customerId: string,
  customer: { name: string; phone: string; email: string; address?: string | null; brand_model?: string | null; equipment_type?: string | null; appointment_time?: string | null; technician_name?: string | null },
  appointmentDate: string | undefined,
  appointmentTime: string | undefined,
  technicianName: string | undefined
) {
  if (!appointmentDate) return
  return createAppointmentEvent({
    customerName:   customer.name,
    customerPhone:  customer.phone,
    customerEmail:  customer.email,
    address:        customer.address || undefined,
    equipment:      [customer.brand_model, customer.equipment_type].filter(Boolean).join(' ') || undefined,
    appointmentDate,
    appointmentTime: appointmentTime || customer.appointment_time || undefined,
    technicianName:  technicianName || customer.technician_name || undefined,
  }).catch(err => console.error('Calendar event error:', err))
}

// GET /api/admin/communications?customerId=xxx -- fetch comms log for a customer
// GET /api/admin/communications -- fetch all recent comms
export async function GET(request: Request) {
  const unauth = requireAdmin(request)
  if (unauth) return unauth

  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId')
  const supabase = getSupabase()

  let query = supabase
    .from('customer_comms_log')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(100)

  if (customerId) {
    query = query.eq('customer_id', customerId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, comms: data || [] })
}

// POST /api/admin/communications
// Body: { customerId, trigger, extra?, jobStatus?, appointmentDate?, appointmentTime?, technicianName?, partsStatus? }
export async function POST(request: Request) {
  const unauth = requireAdmin(request)
  if (unauth) return unauth

  try {
    const body = await request.json()
    const { customerId, trigger, extra, jobStatus, appointmentDate, appointmentTime, technicianName, partsStatus } = body

    if (!customerId || !trigger) {
      return NextResponse.json({ success: false, error: 'customerId and trigger required' }, { status: 400 })
    }

    if (!VALID_TRIGGERS.includes(trigger)) {
      return NextResponse.json({ success: false, error: `Invalid trigger. Valid: ${VALID_TRIGGERS.join(', ')}` }, { status: 400 })
    }

    const customer = await getCustomerCommProfile(customerId)
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 })
    }

    // Apply any field updates passed from admin before drafting
    const supabase = getSupabase()
    const updates: Record<string, unknown> = {}
    if (jobStatus) { updates.job_status = jobStatus; customer.job_status = jobStatus }
    if (appointmentDate) { updates.appointment_date = appointmentDate; customer.appointment_date = appointmentDate }
    if (appointmentTime) { updates.appointment_time = appointmentTime; customer.appointment_time = appointmentTime }
    if (technicianName) { updates.technician_name = technicianName; customer.technician_name = technicianName }
    if (partsStatus) { updates.parts_status = partsStatus; customer.parts_status = partsStatus }

    if (Object.keys(updates).length > 0) {
      await supabase.from('new_customers').update(updates).eq('id', customerId)
    }

    if (appointmentDate) {
      after(() => maybeCreateAppointmentEvent(customerId, customer, appointmentDate, appointmentTime, technicianName))
    }

    const result = await draftAndSend(customer, trigger as CommTrigger, extra || {}, 'admin')

    return NextResponse.json({
      success: result.ok,
      channel: result.channel,
      error: result.error,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// PATCH /api/admin/communications -- update customer job fields only (no message sent)
export async function PATCH(request: Request) {
  const unauth = requireAdmin(request)
  if (unauth) return unauth

  try {
    const body = await request.json()
    const { customerId, ...fields } = body

    if (!customerId) {
      return NextResponse.json({ success: false, error: 'customerId required' }, { status: 400 })
    }

    const allowed = ['job_status', 'appointment_date', 'appointment_time', 'technician_name', 'parts_status', 'appointment_notes', 'tech_eta_minutes']
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (fields[key] !== undefined) updates[key] = fields[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 })
    }

    const supabase = getSupabase()
    const { error } = await supabase.from('new_customers').update(updates).eq('id', customerId)
    if (error) throw error

    // If an appointment_date was set, create a calendar event (fire and forget)
    if (fields.appointment_date) {
      const customer = await getCustomerCommProfile(customerId)
      if (customer) {
        after(() => maybeCreateAppointmentEvent(customerId, customer, fields.appointment_date, fields.appointment_time, fields.technician_name))
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
