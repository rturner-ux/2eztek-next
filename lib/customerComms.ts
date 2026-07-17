import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { callClaude } from '@/lib/claude'

const PHONE = '(972) 807-7232'
const SITE = 'https://www.2eztek.com'
const FROM_EMAIL = '2EZ TEK <support@2eztek.com>'
const FROM_PHONE = process.env.TWILIO_FROM_NUMBER || ''

export type CommTrigger =
  | 'day_before_reminder'
  | 'morning_of'
  | 'tech_30_min_out'
  | 'post_visit_followup'
  | 'parts_ordered'
  | 'parts_delayed'
  | 'running_late'
  | 'reschedule_request'
  | 'general_update'

export type CustomerCommProfile = {
  id: string
  name: string
  email: string
  phone: string
  address?: string | null
  details?: string | null
  equipment_type?: string | null
  brand_model?: string | null
  appointment_date?: string | null
  appointment_time?: string | null
  job_status?: string | null
  technician_name?: string | null
  parts_status?: string | null
  tech_eta_minutes?: number | null
  appointment_notes?: string | null
}

const COMMS_SYSTEM = `You are the communication specialist for 2EZ TEK, a professional fitness equipment repair company serving Dallas Fort Worth.

Your job is to draft messages that make customers feel valued, informed, and confident. Every message should:
- Address the customer by first name
- Reference their specific equipment when relevant
- Be warm but efficient -- customers are busy
- Give clear, actionable information
- Never use em dashes in any writing
- Never use filler phrases like "Great news!" or "We're excited to..."
- Sign off from "The 2EZ TEK Team" or the technician's name if provided

SMS rules (when channel = sms):
- Under 160 characters is ideal, 320 max
- Plain text only, no HTML
- Keep it conversational
- Include the most critical info and a phone number if relevant

Email rules (when channel = email):
- Can be longer and more detailed
- Return the subject line and HTML body separately
- Use a professional but friendly tone
- Can include maintenance tips or helpful info relevant to their equipment`

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function logComm(params: {
  customerId: string
  email: string
  phone?: string
  channel: 'email' | 'sms'
  triggerType: CommTrigger
  subject?: string
  body: string
  status: 'sent' | 'failed'
  error?: string
  sentBy?: string
}) {
  const supabase = getSupabase()
  await supabase.from('customer_comms_log').insert({
    customer_id: params.customerId,
    customer_email: params.email,
    customer_phone: params.phone,
    channel: params.channel,
    trigger_type: params.triggerType,
    subject: params.subject,
    body: params.body,
    status: params.status,
    error: params.error,
    sent_by: params.sentBy || 'auto',
  })
  // Update last_comm_at on customer
  await supabase
    .from('new_customers')
    .update({ last_comm_at: new Date().toISOString() })
    .eq('id', params.customerId)
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { ok: false, error: 'Missing RESEND_API_KEY' }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    return { ok: false, error: d.message || 'Resend failed' }
  }
  return { ok: true }
}

async function sendSms(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token || !FROM_PHONE) {
    return { ok: false, error: 'Twilio credentials not configured' }
  }

  // Normalize phone to E.164
  const cleaned = to.replace(/\D/g, '')
  const e164 = cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ From: FROM_PHONE, To: e164, Body: body }),
    }
  )
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    return { ok: false, error: d.message || 'Twilio failed' }
  }
  return { ok: true }
}

function emailWrapper(content: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;line-height:1.7;background:#fff;padding:32px 28px">
  <img src="${SITE}/images/2eztek-logo.webp" alt="2EZ TEK" width="110" style="margin-bottom:24px" onerror="this.style.display='none'"/>
  ${content}
  <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;line-height:1.6">
    2EZ TEK Fitness Equipment Repair &nbsp;|&nbsp; Dallas Fort Worth, TX<br>
    <a href="${SITE}" style="color:#0891b2;text-decoration:none">2eztek.com</a> &nbsp;&middot;&nbsp;
    <a href="tel:9728077232" style="color:#0891b2;text-decoration:none">${PHONE}</a>
  </div>
</div>`
}

function buildPrompt(trigger: CommTrigger, customer: CustomerCommProfile, extra?: Record<string, string>) {
  const firstName = (customer.name || 'there').trim().split(' ')[0]
  const equipment = [customer.brand_model, customer.equipment_type].filter(Boolean).join(' ') || 'fitness equipment'
  const apptDate = customer.appointment_date
    ? new Date(customer.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : null
  const techName = customer.technician_name || 'our technician'

  const extraLines = extra ? Object.entries(extra).map(([k, v]) => `${k}: ${v}`).join('\n') : ''

  const triggerInstructions: Record<CommTrigger, string> = {
    day_before_reminder: `Write a friendly reminder that their appointment is tomorrow${apptDate ? ` (${apptDate})` : ''}. Include the appointment time if known (${customer.appointment_time || 'TBD'}). Remind them to have the equipment accessible and cleared of clutter. Mention ${techName} will be coming out. Keep email under 200 words.`,
    morning_of: `Write a brief SMS (under 160 chars) letting ${firstName} know ${techName} is scheduled to come out today${customer.appointment_time ? ` around ${customer.appointment_time}` : ''}. Mention they can call ${PHONE} with any questions.`,
    tech_30_min_out: `Write a brief SMS (under 160 chars) letting ${firstName} know ${techName} is about 30 minutes away. Keep it casual and reassuring.`,
    post_visit_followup: `Write a post-visit follow-up email. Thank ${firstName} for trusting 2EZ TEK. Include a quick tip about maintaining their ${equipment}. Mention they can reach out if anything feels off after the repair. Include the Google review link: ${process.env.GOOGLE_REVIEW_URL || `${SITE}/reviews`}`,
    parts_ordered: `Write an email letting ${firstName} know we have ordered the parts needed for their ${equipment} repair. Include parts status: ${extra?.parts_info || customer.parts_status || 'parts ordered'}. Give a realistic ETA of ${extra?.eta || '5-7 business days'} for parts to arrive, then we will schedule the repair. Keep them informed and confident we are on it.`,
    parts_delayed: `Write an email letting ${firstName} know there is a delay on the parts for their ${equipment}. Parts situation: ${extra?.parts_info || customer.parts_status || 'parts delayed'}. New estimated arrival: ${extra?.eta || 'under investigation'}. Apologize genuinely but briefly. Reassure them we are monitoring the order closely and will reach out the moment parts arrive to schedule immediately.`,
    running_late: `Write an SMS (under 160 chars) letting ${firstName} know ${techName} is running behind${extra?.new_eta ? ` and expects to arrive around ${extra.new_eta}` : ' and will be there as soon as possible'}. Apologize briefly.`,
    reschedule_request: `Write an email letting ${firstName} know we need to reschedule their ${apptDate || 'upcoming'} appointment. Reason: ${extra?.reason || 'scheduling conflict'}. Offer to reschedule as soon as possible. Ask them to reply or call ${PHONE} with preferred dates and times. Keep it brief and apologetic.`,
    general_update: `Write a brief, informative update message. Context: ${extra?.message || 'status update on service'}. Keep it professional and clear.`,
  }

  return `Draft a communication for this customer. Trigger: ${trigger}

Customer first name: ${firstName}
Equipment: ${equipment}
Appointment: ${apptDate || 'not yet scheduled'} ${customer.appointment_time ? `at ${customer.appointment_time}` : ''}
Job status: ${customer.job_status || 'pending'}
Technician: ${techName}
${extraLines}

Instructions: ${triggerInstructions[trigger]}

Return ONLY valid JSON:
{
  "channel": "email" or "sms",
  "subject": "Email subject line (omit for SMS)",
  "bodyText": "Plain text version (required for SMS, also used as SMS body)",
  "bodyHtml": "HTML version for email body content only -- no wrapper div, just the inner content (omit for SMS)"
}`
}

export async function draftAndSend(
  customer: CustomerCommProfile,
  trigger: CommTrigger,
  extra?: Record<string, string>,
  sentBy = 'auto'
): Promise<{ ok: boolean; channel: 'email' | 'sms'; error?: string }> {
  const isEmailTrigger = [
    'day_before_reminder', 'post_visit_followup', 'parts_ordered',
    'parts_delayed', 'reschedule_request',
  ].includes(trigger)

  const channel: 'email' | 'sms' = isEmailTrigger ? 'email' : 'sms'

  try {
    const prompt = buildPrompt(trigger, customer, extra)
    const raw = await callClaude({
      system: COMMS_SYSTEM,
      userMessage: prompt,
      maxTokens: 600,
      temperature: 0.55,
    })

    // Strip markdown fences if present
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned)

    const resolvedChannel = (parsed.channel === 'sms' ? 'sms' : 'email') as 'email' | 'sms'

    if (resolvedChannel === 'email') {
      const html = emailWrapper(parsed.bodyHtml || `<p>${parsed.bodyText}</p>`)
      const subject = parsed.subject || '2EZ TEK Service Update'
      const result = await sendEmail(customer.email, subject, html)
      await logComm({
        customerId: customer.id,
        email: customer.email,
        phone: customer.phone,
        channel: 'email',
        triggerType: trigger,
        subject,
        body: parsed.bodyText,
        status: result.ok ? 'sent' : 'failed',
        error: result.error,
        sentBy,
      })
      return { ok: result.ok, channel: 'email', error: result.error }
    } else {
      const body = parsed.bodyText
      const result = await sendSms(customer.phone, body)
      await logComm({
        customerId: customer.id,
        email: customer.email,
        phone: customer.phone,
        channel: 'sms',
        triggerType: trigger,
        body,
        status: result.ok ? 'sent' : 'failed',
        error: result.error,
        sentBy,
      })
      return { ok: result.ok, channel: 'sms', error: result.error }
    }
  } catch (err: any) {
    console.error('COMMS ERROR:', err)
    await logComm({
      customerId: customer.id,
      email: customer.email,
      phone: customer.phone,
      channel,
      triggerType: trigger,
      body: '',
      status: 'failed',
      error: err.message,
      sentBy,
    }).catch(() => {})
    return { ok: false, channel, error: err.message }
  }
}

export async function getCustomerCommProfile(customerId: string): Promise<CustomerCommProfile | null> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('new_customers')
    .select('id, name, email, phone, address, details, equipment_type, brand_model, appointment_date, appointment_time, job_status, technician_name, parts_status, tech_eta_minutes, appointment_notes')
    .eq('id', customerId)
    .single()
  return data || null
}
