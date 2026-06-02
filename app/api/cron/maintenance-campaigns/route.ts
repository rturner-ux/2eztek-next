// app/api/cron/maintenance-campaigns/route.ts
// Identifies customers due for maintenance based on last service date and sends personalized AI-drafted emails.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL_SYSTEM = `You are a friendly customer relations specialist for 2EZ TEK, a fitness equipment repair company in Dallas Fort Worth, TX.

You write personalized, helpful maintenance reminder emails that feel genuine — not like spam. The goal is to remind customers their equipment is due for service and make it easy to book.

Rules:
- Use the customer's first name
- Reference their specific equipment type and brand/model when available
- Mention the specific service they received last time (if known) or general maintenance
- Include a practical tip about the equipment type to add value
- Keep it under 200 words total
- Warm, professional tone — like a trusted local technician
- CTA: call (972) 807-7232 or visit 2eztek.com/contact
- Do not mention pricing
- Return ONLY valid JSON: { "subject": "", "body": "" }`

type Customer = {
  id: string
  name: string
  email: string
  equipment_type: string
  brand_model: string
  service_type: string
  last_request_at: string
}

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name
}

function monthsSince(dateStr: string): number {
  const then = new Date(dateStr)
  const now = new Date()
  return (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth())
}

async function draftMaintenanceEmail(customer: Customer): Promise<{ subject: string; body: string }> {
  const months = monthsSince(customer.last_request_at)
  const firstName = getFirstName(customer.name)

  const userMessage = `Draft a maintenance reminder email for this customer.

Customer: ${firstName}
Equipment: ${customer.equipment_type || 'fitness equipment'}
Brand/Model: ${customer.brand_model || 'Not specified'}
Last Service: ${months} months ago (service type: ${customer.service_type || 'repair/maintenance'})

Return ONLY valid JSON: { "subject": "", "body": "" }`

  const outputText = await callClaude({
    system: EMAIL_SYSTEM,
    userMessage,
    maxTokens: 512,
    temperature: 0.65,
  })

  return JSON.parse(cleanJsonOutput(outputText))
}

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: '2EZ TEK <support@2eztek.com>',
        to: [to],
        subject,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.7;color:#222;max-width:560px;margin:0 auto">
            <div style="background:#050B14;padding:20px 28px;border-radius:16px 16px 0 0">
              <div style="color:#67e8f9;font-size:20px;font-weight:900;letter-spacing:0.05em">2EZ TEK</div>
              <div style="color:#94a3b8;font-size:12px;margin-top:2px">Dallas Fort Worth Fitness Equipment Service</div>
            </div>
            <div style="padding:28px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 16px 16px">
              ${body.replace(/\n/g, '<br/>')}
              <div style="margin-top:24px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#999">
                2EZ TEK · Dallas Fort Worth, TX · (972) 807-7232 · 2eztek.com<br/>
                <a href="mailto:support@2eztek.com?subject=Unsubscribe" style="color:#999">Unsubscribe</a>
              </div>
            </div>
          </div>
        `,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    // Find customers whose last service was 6-12 months ago (due for maintenance)
    // and who haven't been emailed recently (status still 'new' or no recent activity)
    const { data: customers, error } = await supabase
      .from('new_customers')
      .select('id, name, email, equipment_type, brand_model, service_type, last_request_at')
      .gte('last_request_at', twelveMonthsAgo.toISOString())
      .lte('last_request_at', sixMonthsAgo.toISOString())
      .not('email', 'is', null)
      .limit(10) // Max 10 emails per cron run

    if (error) throw new Error(error.message)
    if (!customers || customers.length === 0) {
      return NextResponse.json({ success: true, message: 'No customers due for maintenance outreach', sent: 0 })
    }

    const sent: string[] = []
    const failed: string[] = []

    for (const customer of customers as Customer[]) {
      try {
        const { subject, body } = await draftMaintenanceEmail(customer)
        const ok = await sendEmail(customer.email, subject, body)
        if (ok) {
          sent.push(customer.name)
          // Mark as contacted so we don't email them again immediately
          await supabase
            .from('new_customers')
            .update({ status: 'maintenance-outreach', updated_at: new Date().toISOString() })
            .eq('id', customer.id)
        } else {
          failed.push(customer.name)
        }
        await new Promise((r) => setTimeout(r, 500))
      } catch (err) {
        console.error('Maintenance email failed for:', customer.name, err)
        failed.push(customer.name)
      }
    }

    // Summary to team
    if (process.env.RESEND_API_KEY && (sent.length > 0 || failed.length > 0)) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: `Maintenance Campaign: ${sent.length} emails sent`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:580px">
              <h2 style="color:#0891B2">Maintenance Email Campaign Complete</h2>
              <p>Sent personalized maintenance reminders to <strong>${sent.length} customers</strong> whose last service was 6-12 months ago.</p>
              ${sent.length > 0 ? `<h3>Sent To:</h3><p>${sent.join(', ')}</p>` : ''}
              ${failed.length > 0 ? `<h3 style="color:#e53e3e">Failed:</h3><p>${failed.join(', ')}</p>` : ''}
              <hr/>
              <p style="color:#666;font-size:13px">Auto-generated by 2EZ TEK Maintenance Campaign Engine. Runs monthly.</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true, sent: sent.length, failed: failed.length })
  } catch (error: any) {
    console.error('MAINTENANCE CAMPAIGN ERROR:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
