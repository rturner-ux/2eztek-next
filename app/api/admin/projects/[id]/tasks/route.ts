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

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdminRequest(request)
  if (denied) return denied

  const { id: project_id } = await params

  try {
    const { title, description, status, priority, assigned_to, due_date, sort_order } = await request.json()
    if (!title?.trim()) return NextResponse.json({ success: false, error: 'Title required' }, { status: 400 })

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('project_tasks')
      .insert({ project_id, title, description, status: status || 'todo', priority: priority || 'medium', assigned_to, due_date: due_date || null, sort_order: sort_order || 0 })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, task: data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create task'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdminRequest(request)
  if (denied) return denied

  try {
    const { task_id, ...fields } = await request.json()
    if (!task_id) return NextResponse.json({ success: false, error: 'task_id required' }, { status: 400 })

    const allowed = ['title', 'description', 'status', 'priority', 'assigned_to', 'due_date', 'sort_order']
    const update: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in fields) update[key] = fields[key]
    }

    const supabase = getSupabase()
    const { data, error } = await supabase.from('project_tasks').update(update).eq('id', task_id).select().single()
    if (error) throw error

    return NextResponse.json({ success: true, task: data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update task'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const denied = requireAdminRequest(request)
  if (denied) return denied

  try {
    const { task_id } = await request.json()
    if (!task_id) return NextResponse.json({ success: false, error: 'task_id required' }, { status: 400 })

    const supabase = getSupabase()
    const { error } = await supabase.from('project_tasks').delete().eq('id', task_id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete task'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
