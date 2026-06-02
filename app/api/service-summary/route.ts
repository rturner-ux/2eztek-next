import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/claude'
import { escapeHtml } from '@/lib/serverSecurity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUMMARY_SYSTEM = `You are a friendly service technician writing a plain-English summary of completed fitness equipment repair work for a customer.

Rules:
- Write in second person ("Your treadmill...", "We found...", "We replaced...")
- Be specific about what was found and what was done — no vague language
- Explain WHY the issue happened in simple terms (no jargon)
- Include one practical tip to help prevent the issue from recurring
- Keep it under 150 words
- Warm, professional tone — like a technician who takes pride in their work
- Do NOT mention pricing
- Return ONLY the plain-text email body (no subject line, no JSON)`

type ServiceSummaryPayload = {
  customerName: string
  customerEmail: string
  equipmentType: string
  brandModel?: string
  issueReported: string
  workPerformed: string
  technicianName?: string
}

async function generateSummary(payload: ServiceSummaryPayload): Promise<string> {
  const userMessage = `Generate a service completion summary email body.

Customer: ${payload.customerName}
Equipment: ${payload.equipmentType}${payload.brandModel ? ' — ' + payload.brandModel : ''}
Issue reported: ${payload.issueReported}
Work performed: ${payload.workPerformed}
${payload.technicianName ? 'Technician: ' + payload.technicianName : ''}

Return ONLY the plain-text email body.`

  return callClaude({
    system: SUMMARY_SYSTEM,
    userMessage,
    maxTokens: 400,
    temperature: 0.55,
  })
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.CRON_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const payload = (await request.json()) as ServiceSummaryPayload

    if (!payload.customerName || !payload.customerEmail || !payload.equipmentType || !payload.workPerformed) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: customerName, customerEmail, equipmentType, workPerformed' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.customerEmail)) {
      return NextResponse.json({ success: false, error: 'Invalid customer email' }, { status: 400 })
    }

    const summaryBody = await generateSummary(payload)
    const firstName = payload.customerName.trim().split(/\s+/)[0]

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: true, preview: summaryBody, sent: false })
    }

    const subject = `Your ${escapeHtml(payload.equipmentType)} Service is Complete — 2EZ TEK`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: '2EZ TEK <support@2eztek.com>',
        to: [payload.customerEmail],
        subject,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.7;color:#222;max-width:560px;margin:0 auto">
            <div style="background:#050B14;padding:20px 28px;border-radius:16px 16px 0 0">
              <div style="color:#67e8f9;font-size:20px;font-weight:900;letter-spacing:0.05em">2EZ TEK</div>
              <div style="color:#94a3b8;font-size:12px;margin-top:2px">Dallas Fort Worth Fitness Equipment Service</div>
            </div>
            <div style="padding:28px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 16px 16px">
              <p>Hi ${escapeHtml(firstName)},</p>
              ${summaryBody.replace(/\n/g, '<br/>')}
              <div style="margin-top:24px;padding:16px;border-radius:12px;background:#f0fdf4;border:1px solid #bbf7d0">
                <p style="margin:0;font-size:14px;color:#166534">
                  If you have any questions or notice anything unusual, give us a call at
                  <strong>(972) 807-7232</strong> — we stand behind our work.
                </p>
              </div>
              <div style="margin-top:24px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#999">
                2EZ TEK · Dallas Fort Worth, TX · (972) 807-7232 · 2eztek.com
              </div>
            </div>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ success: false, error: 'Email send failed', details: err }, { status: 502 })
    }

    return NextResponse.json({ success: true, sent: true })
  } catch (error: unknown) {
    console.error('SERVICE SUMMARY ERROR:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
