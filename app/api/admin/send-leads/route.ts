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

2EZ TEK is a professional fitness equipment repair and maintenance company serving Dallas Fort Worth. Services include treadmill repair, elliptical repair, commercial gym maintenance, equipment assembly, and preventative maintenance programs.

Lead details:
- Name: ${lead.name}
- Title: ${lead.title}
- Company: ${lead.company}
- Industry: ${lead.industry}

Write a personalized pitch that:
- Addresses them by first name
- References their company naturally
- Explains what 2EZ TEK does in 1-2 sentences
- Mentions one specific benefit relevant to their industry
- Has a simple CTA to reply or call (972) 807-7232
- Is 4-6 sentences max — short and direct
- Does NOT sound like a template or mass email
- Signs off from Robby at 2EZ TEK

Return ONLY valid JSON:
{
  "subject": "",
  "text": "",
  "html": ""
}

For html, wrap paragraphs in <p> tags. Keep it clean with no complex styling.`

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

async function sendEmail(to: string, subject: string, html: string, text: string) {
  const response = await fetch('https://api.resend.com/emails', {
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
        <div style="font-family:Arial,sans-serif;max-width:600px;line-height:1.6;color:#111">
          ${html}
          <hr style="margin-top:32px;border:none;border-top:1px solid #eee"/>
          <p style="font-size:12px;color:#999">
            2EZ TEK — Fitness Equipment Repair Dallas Fort Worth<br/>
            (972) 807-7232 | support@2eztek.com | www.2eztek.com<br/>
            <a href="https://www.2eztek.com/unsubscribe" style="color:#999">Unsubscribe</a>
          </p>
        </div>
      `,
      text: `${text}\n\n---\n2EZ TEK — Fitness Equipment Repair Dallas Fort Worth\n(972) 807-7232 | support@2eztek.com | www.2eztek.com`,
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
