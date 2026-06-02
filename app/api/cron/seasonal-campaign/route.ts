import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type SeasonalWindow = {
  name: string
  months: number[]
  angle: string
  target: 'residential' | 'commercial' | 'both'
}

const SEASONAL_WINDOWS: SeasonalWindow[] = [
  { name: 'New Year Rush', months: [12, 1], angle: 'Gym equipment breaks down in January when resolutions hit hard. Get ahead of the repair queue.', target: 'both' },
  { name: 'Spring Tune-Up', months: [3, 4], angle: 'Spring is the best time for preventative maintenance before summer outdoor season reduces gym usage.', target: 'residential' },
  { name: 'Summer Commercial', months: [6, 7], angle: 'Hotels, apartments, and corporate gyms see peak usage in summer. Keep equipment running.', target: 'commercial' },
  { name: 'Back to School', months: [8, 9], angle: 'School gyms and recreation centers ramping back up — perfect time for equipment checkups.', target: 'commercial' },
  { name: 'Holiday Pre-Season', months: [10, 11], angle: 'New home gym equipment arrives over the holidays. Pre-season assembly and tune-up bookings open now.', target: 'residential' },
]

const CAMPAIGN_SYSTEM = `You are an email marketing specialist for 2EZ TEK, a fitness equipment repair company in Dallas Fort Worth, TX.

Write a short seasonal campaign email (under 180 words) that feels timely and relevant — not generic.

Rules:
- Use the seasonal angle to open with a real, relatable scenario
- Mention the specific service opportunity (repair, maintenance, assembly)
- Keep it warm and local — we're a Dallas Fort Worth business
- CTA: call (972) 807-7232 or visit 2eztek.com/contact
- Do NOT mention pricing
- Return ONLY valid JSON: { "subject": "", "body": "" }`

function getCurrentWindow(): SeasonalWindow | null {
  const month = new Date().getMonth() + 1
  return SEASONAL_WINDOWS.find((w) => w.months.includes(month)) || null
}

async function draftSeasonalEmail(window: SeasonalWindow, serviceType?: string): Promise<{ subject: string; body: string }> {
  const userMessage = `Draft a seasonal email campaign for 2EZ TEK.

Seasonal window: ${window.name}
Angle: ${window.angle}
Target audience: ${window.target === 'both' ? 'residential and commercial clients' : window.target + ' clients'}
${serviceType ? `Common service this season: ${serviceType}` : ''}

Return ONLY valid JSON: { "subject": "", "body": "" }`

  const outputText = await callClaude({
    system: CAMPAIGN_SYSTEM,
    userMessage,
    maxTokens: 500,
    temperature: 0.7,
  })

  return JSON.parse(cleanJsonOutput(outputText))
}

async function sendCampaignEmail(
  to: string,
  subject: string,
  body: string,
  customerName: string
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false
  const firstName = customerName.trim().split(/\s+/)[0] || customerName
  const personalizedBody = body.replace(/\bHi\b|\bHello\b/i, `Hi ${firstName}`)

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
              ${personalizedBody.replace(/\n/g, '<br/>')}
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

    const window = getCurrentWindow()
    if (!window) {
      return NextResponse.json({ success: true, message: 'No seasonal window active this month', sent: 0 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Pull customers who haven't been seasonal-emailed recently
    // Target based on the window's audience
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const query = supabase
      .from('new_customers')
      .select('id, name, email, service_type, equipment_type')
      .not('email', 'is', null)
      .or('seasonal_emailed_at.is.null,seasonal_emailed_at.lt.' + ninetyDaysAgo.toISOString())
      .limit(25)

    if (window.target === 'commercial') {
      query.ilike('service_type', '%commercial%')
    } else if (window.target === 'residential') {
      query.not('service_type', 'ilike', '%commercial%')
    }

    const { data: customers, error } = await query

    if (error) throw new Error(error.message)
    if (!customers || customers.length === 0) {
      return NextResponse.json({ success: true, message: `No eligible customers for ${window.name}`, sent: 0 })
    }

    // Draft one email template, personalize per send
    const { subject, body } = await draftSeasonalEmail(window)

    const sent: string[] = []
    const failed: string[] = []

    for (const customer of customers) {
      try {
        const ok = await sendCampaignEmail(customer.email, subject, body, customer.name)
        if (ok) {
          sent.push(customer.name)
          await supabase
            .from('new_customers')
            .update({ seasonal_emailed_at: new Date().toISOString() })
            .eq('id', customer.id)
        } else {
          failed.push(customer.name)
        }
        await new Promise((r) => setTimeout(r, 400))
      } catch (err) {
        console.error('Seasonal campaign email failed:', customer.name, err)
        failed.push(customer.name)
      }
    }

    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: `Seasonal Campaign (${window.name}): ${sent.length} sent`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:580px">
              <h2 style="color:#0891B2">Seasonal Campaign: ${window.name}</h2>
              <p>Sent to <strong>${sent.length}</strong> customers. ${failed.length > 0 ? `${failed.length} failed.` : ''}</p>
              <h3>Email Sent:</h3>
              <p><strong>Subject:</strong> ${subject}</p>
              <p style="white-space:pre-wrap;background:#f9fafb;padding:12px;border-radius:8px;font-size:14px">${body}</p>
              ${sent.length > 0 ? `<p><strong>Recipients:</strong> ${sent.join(', ')}</p>` : ''}
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true, window: window.name, sent: sent.length, failed: failed.length })
  } catch (error: unknown) {
    console.error('SEASONAL CAMPAIGN ERROR:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
