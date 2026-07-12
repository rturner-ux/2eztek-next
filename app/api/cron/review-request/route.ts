import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REVIEW_SYSTEM = `You are a friendly customer relations specialist for 2EZ TEK, a fitness equipment repair company in Dallas Fort Worth, TX.

Write a short, warm, personal review request email. The customer just had their fitness equipment serviced.

Rules:
- Use the customer's first name
- Reference their specific equipment or service type when available
- Make it feel personal, not automated
- Keep it under 120 words
- One clear CTA: click the Google review link
- Warm, grateful tone — like a local technician who genuinely appreciates the business
- Do NOT mention pricing
- Return ONLY valid JSON: { "subject": "", "body": "" }`

type Project = {
  id: string
  customer_name: string
  customer_email: string
  equipment_type: string
  equipment_brand: string
  equipment_model: string
  project_type: string
}

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name
}

async function draftReviewEmail(project: Project): Promise<{ subject: string; body: string }> {
  const firstName = getFirstName(project.customer_name)
  const reviewUrl = process.env.GOOGLE_REVIEW_URL || 'https://g.page/r/review'
  const brandModel = [project.equipment_brand, project.equipment_model].filter(Boolean).join(' ')

  const userMessage = `Draft a review request email for this customer whose service was just completed.

Customer first name: ${firstName}
Equipment: ${project.equipment_type || 'fitness equipment'}
Brand/Model: ${brandModel || 'not specified'}
Service type: ${project.project_type || 'repair'}
Google review link: ${reviewUrl}

Return ONLY valid JSON: { "subject": "", "body": "" }`

  const outputText = await callClaude({
    system: REVIEW_SYSTEM,
    userMessage,
    maxTokens: 400,
    temperature: 0.65,
  })

  return JSON.parse(cleanJsonOutput(outputText))
}

async function sendReviewEmail(to: string, subject: string, body: string, reviewUrl: string): Promise<boolean> {
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
              <div style="margin-top:28px;text-align:center">
                <a href="${reviewUrl}" style="display:inline-block;background:#22d3ee;color:#000;font-weight:900;font-size:14px;padding:14px 28px;border-radius:12px;text-decoration:none;letter-spacing:0.05em">
                  Leave a Google Review
                </a>
              </div>
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

    const reviewUrl = process.env.GOOGLE_REVIEW_URL || 'https://g.page/r/review'

    // Target tickets marked complete 1-5 days ago who haven't received a review request.
    // Gated on ticket status + completion_date, not signup time, so we never ask before the job is actually done.
    const now = new Date()
    const cutoffNew = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const cutoffOld = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, customer_name, customer_email, equipment_type, equipment_brand, equipment_model, project_type, completion_date')
      .eq('status', 'complete')
      .lte('completion_date', cutoffNew)
      .gte('completion_date', cutoffOld)
      .is('review_requested_at', null)
      .not('customer_email', 'is', null)
      .limit(15)

    if (error) throw new Error(error.message)
    if (!projects || projects.length === 0) {
      return NextResponse.json({ success: true, message: 'No completed tickets ready for review request', sent: 0 })
    }

    const sent: string[] = []
    const failed: string[] = []

    for (const project of projects as Project[]) {
      try {
        const { subject, body } = await draftReviewEmail(project)
        const ok = await sendReviewEmail(project.customer_email, subject, body, reviewUrl)
        if (ok) {
          sent.push(project.customer_name)
          await supabase
            .from('projects')
            .update({ review_requested_at: new Date().toISOString() })
            .eq('id', project.id)
        } else {
          failed.push(project.customer_name)
        }
        await new Promise((r) => setTimeout(r, 400))
      } catch (err) {
        console.error('Review request email failed for:', project.customer_name, err)
        failed.push(project.customer_name)
      }
    }

    if (process.env.RESEND_API_KEY && sent.length > 0) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: `Review Requests: ${sent.length} emails sent`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:580px">
              <h2 style="color:#0891B2">Review Request Campaign Complete</h2>
              <p>Sent personalized review request emails to <strong>${sent.length} customers</strong>.</p>
              ${sent.length > 0 ? `<h3>Sent To:</h3><p>${sent.join(', ')}</p>` : ''}
              ${failed.length > 0 ? `<h3 style="color:#e53e3e">Failed:</h3><p>${failed.join(', ')}</p>` : ''}
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true, sent: sent.length, failed: failed.length })
  } catch (error: unknown) {
    console.error('REVIEW REQUEST CRON ERROR:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
