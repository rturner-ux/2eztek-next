import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Valid email required.' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email: email.toLowerCase().trim(), source: 'manuals' }, { onConflict: 'email', ignoreDuplicates: true })

  if (error) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json({ error: 'Subscription failed.' }, { status: 500 })
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
        to: [email],
        subject: "You're subscribed to 2EZ TEK equipment updates",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;color:#111;line-height:1.6">
            <h2 style="color:#0891B2">Thanks for subscribing!</h2>
            <p>You'll receive updates from 2EZ TEK covering:</p>
            <ul>
              <li>Common equipment issues and how to prevent them</li>
              <li>Maintenance tips for treadmills, ellipticals, bikes, and more</li>
              <li>New manuals added to our library</li>
              <li>FAQ updates and repair articles</li>
            </ul>
            <p>If your equipment needs service now, call us at <strong>(972) 807-7232</strong> or visit <a href="https://www.2eztek.com">2eztek.com</a>.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
            <p style="color:#666;font-size:13px">2EZ TEK Fitness Equipment Repair | Dallas Fort Worth, TX</p>
          </div>
        `,
      }),
    }).catch(() => null)
  }

  return NextResponse.json({ success: true })
}
