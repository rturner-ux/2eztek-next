import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { draftAndSend } from '@/lib/customerComms'
import type { CustomerCommProfile, CommTrigger } from '@/lib/customerComms'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function requireCron(request: Request) {
  const secret = request.headers.get('x-cron-secret') || new URL(request.url).searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export async function GET(request: Request) {
  const unauth = requireCron(request)
  if (unauth) return unauth

  const supabase = getSupabase()
  const today = todayStr()
  const tomorrow = tomorrowStr()
  const results: { id: string; trigger: CommTrigger; ok: boolean; error?: string }[] = []

  // 1. Day-before reminders: appointment_date = tomorrow, step < 1
  {
    const { data: upcoming } = await supabase
      .from('new_customers')
      .select('id, name, email, phone, equipment_type, brand_model, appointment_date, appointment_time, job_status, technician_name, parts_status, tech_eta_minutes, appointment_notes, comm_sequence_step')
      .eq('appointment_date', tomorrow)
      .not('job_status', 'in', '("cancelled","completed")')
      .lt('comm_sequence_step', 1)
      .limit(25)

    for (const c of upcoming || []) {
      const result = await draftAndSend(c as CustomerCommProfile, 'day_before_reminder')
      if (result.ok) {
        await supabase.from('new_customers').update({ comm_sequence_step: 1 }).eq('id', c.id)
      }
      results.push({ id: c.id, trigger: 'day_before_reminder', ok: result.ok, error: result.error })
    }
  }

  // 2. Morning-of SMS: appointment_date = today, step < 2
  {
    const { data: todayAppts } = await supabase
      .from('new_customers')
      .select('id, name, email, phone, equipment_type, brand_model, appointment_date, appointment_time, job_status, technician_name, parts_status, tech_eta_minutes, appointment_notes, comm_sequence_step')
      .eq('appointment_date', today)
      .not('job_status', 'in', '("cancelled","completed")')
      .lt('comm_sequence_step', 2)
      .limit(25)

    for (const c of todayAppts || []) {
      const result = await draftAndSend(c as CustomerCommProfile, 'morning_of')
      if (result.ok) {
        await supabase.from('new_customers').update({ comm_sequence_step: 2 }).eq('id', c.id)
      }
      results.push({ id: c.id, trigger: 'morning_of', ok: result.ok, error: result.error })
    }
  }

  // 3. Post-visit follow-up: job_status = 'completed', step < 5, within last 48h
  {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    const { data: completed } = await supabase
      .from('new_customers')
      .select('id, name, email, phone, equipment_type, brand_model, appointment_date, appointment_time, job_status, technician_name, parts_status, tech_eta_minutes, appointment_notes, comm_sequence_step')
      .eq('job_status', 'completed')
      .lt('comm_sequence_step', 5)
      .gte('updated_at', cutoff)
      .limit(25)

    for (const c of completed || []) {
      const result = await draftAndSend(c as CustomerCommProfile, 'post_visit_followup')
      if (result.ok) {
        await supabase.from('new_customers').update({ comm_sequence_step: 5 }).eq('id', c.id)
      }
      results.push({ id: c.id, trigger: 'post_visit_followup', ok: result.ok, error: result.error })
    }
  }

  return NextResponse.json({
    success: true,
    processed: results.length,
    results,
    runAt: new Date().toISOString(),
  })
}
