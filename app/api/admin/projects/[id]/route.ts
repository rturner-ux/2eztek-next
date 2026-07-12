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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdminRequest(request)
  if (denied) return denied

  const { id } = await params

  try {
    const supabase = getSupabase()
    const [{ data: project, error: pErr }, { data: tasks, error: tErr }] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('project_tasks').select('*').eq('project_id', id).order('sort_order'),
    ])

    if (pErr) throw pErr
    if (tErr) throw tErr

    return NextResponse.json({ success: true, project, tasks: tasks || [] })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load project'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdminRequest(request)
  if (denied) return denied

  const { id } = await params

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

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
      if (key in body) update[key] = body[key]
    }

    if (update.status === 'complete' && !update.completion_date) {
      update.completion_date = new Date().toISOString().split('T')[0]
    }

    const { data, error } = await supabase.from('projects').update(update).eq('id', id).select().single()
    if (error) throw error

    return NextResponse.json({ success: true, project: data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update project'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdminRequest(request)
  if (denied) return denied

  const { id } = await params

  try {
    const supabase = getSupabase()
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete project'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
