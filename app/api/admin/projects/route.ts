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

export async function GET(request: Request) {
  const denied = requireAdminRequest(request)
  if (denied) return denied

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const source = searchParams.get('source')
  const limit = parseInt(searchParams.get('limit') || '200')

  try {
    const supabase = getSupabase()
    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status && status !== 'all') query = query.eq('status', status)
    if (source && source !== 'all') query = query.eq('job_source', source)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ success: true, projects: data || [] })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load projects'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const denied = requireAdminRequest(request)
  if (denied) return denied

  try {
    const body = await request.json()
    const supabase = getSupabase()

    const allowed = [
      'name', 'project_type', 'job_source',
      'customer_name', 'customer_phone', 'customer_email', 'site_address',
      'dispatch_company', 'dispatch_job_number', 'dispatch_contact',
      'dispatch_billing_email', 'dispatch_tech_support',
      'equipment_type', 'equipment_brand', 'equipment_model', 'issue_description',
      'status', 'priority',
      'quote_amount', 'invoice_amount', 'payment_status', 'payment_method',
      'parts_status', 'parts_notes', 'technician', 'scheduled_date', 'completion_date',
      'pod_required', 'pod_signed', 'pod_url',
      'notes', 'internal_notes',
    ]

    const insert: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
      if (key in body) insert[key] = body[key]
    }

    const { data, error } = await supabase.from('projects').insert(insert).select().single()
    if (error) throw error

    return NextResponse.json({ success: true, project: data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create project'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
