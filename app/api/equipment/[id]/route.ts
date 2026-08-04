import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { escapeHtml } from '@/lib/serverSecurity'
import { sendSms } from '@/lib/customerComms'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const db = supabase()

  const { data: equipment, error } = await db
    .from('equipment')
    .select('id, customer_name, brand, model, equipment_type, address, created_at')
    .eq('id', id)
    .single()

  if (error || !equipment) {
    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  }

  const { data: history } = await db
    .from('new_customers')
    .select('id, service_type, details, status, created_at')
    .eq('equipment_id', id)
    .order('created_at', { ascending: false })

  const { data: notes } = await db
    .from('equipment_notes')
    .select('id, note, created_at')
    .eq('equipment_id', id)
    .eq('visible_to_customer', true)
    .order('created_at', { ascending: false })

  return NextResponse.json({ success: true, equipment, history: history ?? [], notes: notes ?? [] })
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const db = supabase()

  const { data: equipment, error } = await db
    .from('equipment')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !equipment) {
    return NextResponse.json({ success: false, message: 'Equipment not found' }, { status: 404 })
  }

  const body = await req.json()
  const { issue, details } = body

  if (!issue) {
    return NextResponse.json({ success: false, message: 'Issue is required' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const { error: upsertError } = await db.from('new_customers').upsert(
    {
      name: equipment.customer_name,
      email: equipment.customer_email,
      normalized_email: equipment.customer_email?.toLowerCase(),
      phone: equipment.customer_phone,
      address: equipment.address,
      brand_model: `${equipment.brand} ${equipment.model}`.trim(),
      equipment_type: equipment.equipment_type,
      service_type: issue,
      details: details || '',
      source: 'QR Code Scan',
      equipment_id: id,
      status: 'new',
      updated_at: now,
      last_request_at: now,
    },
    { onConflict: 'normalized_email' }
  )

  if (upsertError) {
    console.error('Equipment service request error:', upsertError)
    return NextResponse.json({ success: false, message: 'Unable to submit your request. Please call (972) 807-7232.' }, { status: 500 })
  }

  // Fire admin alert email (fire and forget)
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const alertEmail = process.env.SERVICE_ALERT_EMAIL || 'rturner@2eztek.com'
    const alertEmails = [...new Set([alertEmail, 'rturner@2eztek.com'])]
    const machine = `${equipment.brand} ${equipment.model}`.trim()
    const customerEmail = equipment.customer_email || ''

    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: '2EZ TEK <support@2eztek.com>',
        to: alertEmails,
        reply_to: customerEmail || undefined,
        subject: `[QR SCAN] ${escapeHtml(issue)} | ${escapeHtml(equipment.customer_name)} | ${escapeHtml(machine)}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#1e293b">
          <h2 style="color:#0891b2;margin:0 0 16px">New Service Request via QR Code</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;font-weight:bold;width:140px">Customer</td><td>${escapeHtml(equipment.customer_name)}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Phone</td><td><a href="tel:${(equipment.customer_phone || '').replace(/\D/g, '')}">${escapeHtml(equipment.customer_phone)}</a></td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Email</td><td>${escapeHtml(customerEmail)}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Equipment</td><td>${escapeHtml(machine)} (${escapeHtml(equipment.equipment_type)})</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Issue</td><td>${escapeHtml(issue)}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Details</td><td>${escapeHtml(details) || 'None provided'}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Address</td><td>${escapeHtml(equipment.address)}</td></tr>
          </table>
        </div>`,
      }),
    }).catch(err => console.error('QR alert email failed:', err))

    // Customer-facing auto-reply -- this was previously the one lead source
    // with zero acknowledgment to the customer, so a scanned QR request
    // looked identical to nothing happening at all.
    const firstName = (equipment.customer_name || '').trim().split(' ')[0] || 'there'
    if (equipment.customer_phone) {
      sendSms(
        equipment.customer_phone,
        `Hi ${firstName}, this is 2EZ TEK. We got your service request for your ${machine || 'equipment'} (${issue}). We'll call you within the hour to get you scheduled. Questions? Call (972) 807-7232.`
      ).catch(err => console.error('QR auto-reply SMS failed:', err))
    }
    if (customerEmail) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: customerEmail,
          reply_to: alertEmail,
          subject: `We got your service request, ${firstName} - 2EZ TEK`,
          html: `<div style="font-family:Arial,sans-serif;background:#f8fafc;padding:32px 16px;">
            <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
              <div style="background:#050B14;padding:28px 32px;text-align:center;">
                <p style="margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;">2EZ<span style="color:#22d3ee;">TEK</span></p>
                <p style="margin:6px 0 0;font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Fitness Equipment Repair · DFW</p>
              </div>
              <div style="padding:32px;">
                <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#0f172a;">We got your request, ${escapeHtml(firstName)}.</h2>
                <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
                  We received your service request for your <strong>${escapeHtml(machine || 'equipment')}</strong> (${escapeHtml(issue)}). We'll call you within the hour to get you scheduled.
                </p>
                <p style="margin:0 0 12px;font-size:14px;color:#475569;">Need to reach us right now?</p>
                <a href="tel:9728077232" style="display:inline-block;background:#050B14;color:#22d3ee;text-decoration:none;padding:13px 28px;border-radius:100px;font-weight:900;font-size:14px;">
                  Call (972) 807-7232
                </a>
              </div>
              <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#94a3b8;">
                  2EZ TEK · Dallas Fort Worth · <a href="https://www.2eztek.com" style="color:#22d3ee;text-decoration:none;">www.2eztek.com</a>
                </p>
              </div>
            </div>
          </div>`,
        }),
      }).catch(err => console.error('QR auto-reply email failed:', err))
    }
  }

  return NextResponse.json({ success: true })
}
