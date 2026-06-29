import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function checkPassword(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_BLOG_PASSWORD
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prospect_id, to_email, subject, body } = await req.json()
  if (!to_email || !subject || !body) {
    return NextResponse.json({ error: 'to_email, subject, and body are required' }, { status: 400 })
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;font-size:15px;line-height:1.7;">
      ${body.split('\n').filter(Boolean).map((line: string) =>
        `<p style="margin:0 0 14px;">${line}</p>`
      ).join('')}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />
      <p style="margin:0;font-size:13px;color:#64748b;">
        Robby Turner · 2EZ TEK · Fitness Equipment Repair · DFW<br/>
        <a href="tel:9728077232" style="color:#0891b2;text-decoration:none;">(972) 807-7232</a> ·
        <a href="https://www.2eztek.com" style="color:#0891b2;text-decoration:none;">www.2eztek.com</a>
      </p>
    </div>
  `

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: '2EZ TEK <outreach@2eztek.com>',
      to: [to_email],
      reply_to: 'rturner@2eztek.com',
      subject,
      html,
    }),
  })

  const resendData = await resendRes.json()

  if (!resendRes.ok) {
    return NextResponse.json({ error: resendData.message || 'Resend error' }, { status: 500 })
  }

  const supabase = db()
  const now = new Date().toISOString()

  await Promise.all([
    supabase.from('outreach_emails').insert({
      prospect_id: prospect_id || null,
      subject,
      body,
      sent_at: now,
      resend_id: resendData.id,
    }),
    prospect_id
      ? supabase.from('outreach_prospects').update({ status: 'sent', last_contacted_at: now }).eq('id', prospect_id)
      : Promise.resolve(),
  ])

  return NextResponse.json({ success: true, resend_id: resendData.id })
}
