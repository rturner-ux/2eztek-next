import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Lead = {
  name: string
  title: string
  company: string
  industry: string
  email: string
}

function cleanJsonOutput(text: string) {
  return text
    .replace(/^```json/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim()
}

async function isRelevantLead(lead: Lead): Promise<boolean> {
  const relevantKeywords = [
    'fitness', 'gym', 'sport', 'recreation', 'health club',
    'pilates', 'yoga', 'crossfit', 'training', 'wellness',
    'athletic', 'exercise', 'workout', 'nutrition', 'supplement',
    'apartment', 'hotel', 'hospitality', 'property management',
    'facilities', 'corporate', 'university', 'school', 'government'
  ]

  const combined = `${lead.industry} ${lead.company} ${lead.title}`.toLowerCase()
  return relevantKeywords.some((kw) => combined.includes(kw))
}

async function generateEmail(lead: Lead): Promise<{ subject: string; html: string; text: string }> {
  const prompt = `Write a short, professional cold outreach email from 2EZ TEK to ${lead.name} at ${lead.company}.

2EZ TEK is a professional fitness equipment repair and maintenance company serving Dallas Fort Worth. We handle treadmill repair, elliptical repair, commercial gym maintenance, equipment assembly, and preventative maintenance programs for gyms, hotels, apartments, and corporate facilities.

We also offer SmartGymOps — our facility management platform that gives clients QR equipment reporting (staff scan a code to report issues instantly), preventative maintenance scheduling, full asset history per machine, a client portal for real-time service visibility, and GPS technician tracking. It's included with our commercial maintenance programs.

Lead details:
- Name: ${lead.name}
- Title: ${lead.title}
- Company: ${lead.company}
- Industry: ${lead.industry}

Write a personalized pitch that:
- Addresses them by first name only
- References their company or industry naturally in the opening
- Explains what 2EZ TEK does in 1 sentence
- Briefly mentions SmartGymOps as a value-add — what it does for their facility in 1 sentence (pick the most relevant feature for their industry: hotels/apartments → QR reporting + client portal; gyms → preventative maintenance + asset history; corporate → uptime + reporting)
- Ends with a soft CTA to reply or call (972) 807-7232
- Is 4–5 sentences total — short, direct, not salesy
- Does NOT sound like a mass email template
- No sign-off line — the signature block is added separately

Return ONLY valid JSON with these three keys:
{
  "subject": "",
  "html": "",
  "text": ""
}

For html: wrap each paragraph in <p style="margin:0 0 16px;color:#1f2937;font-size:15px;line-height:1.7"> tags. No other tags or styling.`

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: prompt,
      temperature: 0.7,
    }),
  })

  const data = await response.json()
  const outputText =
    data.output_text ||
    data.output?.flatMap((i: any) => i.content || [])?.map((c: any) => c.text || '')?.join('') || ''

  const parsed = JSON.parse(cleanJsonOutput(outputText))
  return parsed
}

function buildEmailHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

        <!-- Header -->
        <tr>
          <td style="background:#0f2a4a;padding:24px 32px">
            <img src="https://www.2eztek.com/logo.png" alt="2EZ TEK" height="48" style="height:48px;width:auto;display:block"/>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px 8px">
            ${bodyHtml}
          </td>
        </tr>

        <!-- SmartGymOps callout -->
        <tr>
          <td style="padding:8px 32px 32px">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border-radius:10px;border-left:4px solid #22d3ee;overflow:hidden">
              <tr>
                <td style="padding:20px 24px">
                  <p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0f2a4a">SmartGymOps — Included With Our Service</p>
                  <p style="margin:0 0 14px;font-size:14px;color:#374151;line-height:1.6">Our facility platform gives your team QR equipment reporting, preventative maintenance scheduling, full asset history per machine, real-time service visibility through a client portal, and GPS technician tracking — all tied directly to your 2EZ TEK service.</p>
                  <a href="https://www.2eztek.com/smartgymops-features" style="display:inline-block;background:#22d3ee;color:#0f2a4a;font-size:13px;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:6px;letter-spacing:0.05em">See SmartGymOps Features &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Signature -->
        <tr>
          <td style="padding:0 32px 32px;border-top:1px solid #e5e7eb">
            <table cellpadding="0" cellspacing="0" style="margin-top:24px">
              <tr>
                <td style="padding-right:16px;vertical-align:top">
                  <div style="width:44px;height:44px;background:#0f2a4a;border-radius:50%;display:flex;align-items:center;justify-content:center">
                    <span style="color:#22d3ee;font-weight:700;font-size:16px">R</span>
                  </div>
                </td>
                <td style="vertical-align:top">
                  <p style="margin:0;font-size:15px;font-weight:700;color:#0f2a4a">Robby Turner</p>
                  <p style="margin:2px 0 0;font-size:13px;color:#6b7280">2EZ TEK &mdash; Fitness Equipment Repair &amp; Maintenance</p>
                  <p style="margin:6px 0 0;font-size:13px;color:#374151">
                    <a href="tel:9728077232" style="color:#0284c7;text-decoration:none">(972) 807-7232</a>
                    &nbsp;&bull;&nbsp;
                    <a href="mailto:robby@2eztek.com" style="color:#0284c7;text-decoration:none">robby@2eztek.com</a>
                    &nbsp;&bull;&nbsp;
                    <a href="https://www.2eztek.com" style="color:#0284c7;text-decoration:none">2eztek.com</a>
                  </p>
                  <p style="margin:4px 0 0;font-size:12px;color:#9ca3af">Dallas &bull; Fort Worth &bull; Plano &bull; Frisco &bull; All DFW</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center">
            <p style="margin:0;font-size:11px;color:#9ca3af">
              You're receiving this because your organization may benefit from fitness equipment maintenance services in DFW.
              &nbsp;&bull;&nbsp;
              <a href="https://www.2eztek.com/unsubscribe" style="color:#9ca3af">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

async function sendEmail(to: string, subject: string, html: string, text: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Robby Turner <robby@2eztek.com>',
      to: [to],
      subject,
      html: buildEmailHtml(html),
      text: `${text}\n\n---\nSmartGymOps — QR reporting, preventative maintenance, asset history, client portal, and GPS tracking. Included with our commercial service.\nhttps://www.2eztek.com/smartgymops-features\n\nRobby Turner\n2EZ TEK — Fitness Equipment Repair & Maintenance\n(972) 807-7232 | robby@2eztek.com | www.2eztek.com\nDallas · Fort Worth · Plano · Frisco · All DFW`,
    }),
  })

  return response.ok
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-password')
    if (authHeader !== process.env.ADMIN_BLOG_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { leads, dryRun = false }: { leads: Lead[]; dryRun: boolean } = body

    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: false, error: 'No leads provided' }, { status: 400 })
    }

    const results: Array<{
      name: string
      company: string
      email: string
      relevant: boolean
      sent: boolean
      subject?: string
      preview?: string
      error?: string
    }> = []

    for (const lead of leads) {
      try {
        const relevant = await isRelevantLead(lead)

        if (!relevant) {
          results.push({ name: lead.name, company: lead.company, email: lead.email, relevant: false, sent: false })
          continue
        }

        const email = await generateEmail(lead)

        if (dryRun) {
          results.push({
            name: lead.name,
            company: lead.company,
            email: lead.email,
            relevant: true,
            sent: false,
            subject: email.subject,
            preview: email.text.slice(0, 200),
          })
        } else {
          const sent = await sendEmail(lead.email, email.subject, email.html, email.text)
          results.push({
            name: lead.name,
            company: lead.company,
            email: lead.email,
            relevant: true,
            sent,
            subject: email.subject,
            preview: email.text.slice(0, 200),
          })
        }

        await new Promise((r) => setTimeout(r, 500))
      } catch (err: any) {
        results.push({
          name: lead.name,
          company: lead.company,
          email: lead.email,
          relevant: false,
          sent: false,
          error: err.message,
        })
      }
    }

    const relevant = results.filter((r) => r.relevant)
    const sent = results.filter((r) => r.sent)
    const skipped = results.filter((r) => !r.relevant)

    return NextResponse.json({
      success: true,
      dryRun,
      total: leads.length,
      relevant: relevant.length,
      sent: sent.length,
      skipped: skipped.length,
      results,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
