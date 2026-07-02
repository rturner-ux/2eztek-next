import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// IP-based rate limit: max 3 subscriptions per IP per hour
const ipHits = new Map<string, { count: number; reset: number }>()

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipHits.get(ip)
  if (!entry || now > entry.reset) { ipHits.set(ip, { count: 1, reset: now + 3_600_000 }); return true }
  entry.count++
  return entry.count <= 3
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function looksLikeBotEmail(email: string): boolean {
  const local = email.split('@')[0] || ''
  if (local.length < 6) return false

  // Obfuscated locals like m.a.r.ie.t.tatir.eco.m.p.a.n.y — many single-char dot segments
  if (local.includes('.')) {
    const segments = local.split('.')
    const singleCharCount = segments.filter((s) => s.length === 1).length
    if (singleCharCount >= 5) return true
    const dotRatio = (local.match(/\./g) || []).length / local.length
    if (dotRatio > 0.25 && local.length > 10) return true
  }

  // Random alphanumeric with no vowels like f2e24b2020@domain.com
  if (/^[a-z0-9]+$/i.test(local)) {
    const vowels = (local.match(/[aeiou]/gi) || []).length
    if (vowels / local.length < 0.15) return true
  }

  return false
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  const body = await req.json()

  // Honeypot — bots fill hidden fields, humans don't
  if (body.website || body.companyName) {
    return NextResponse.json({ success: true })
  }

  const { email, brand } = body

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Valid email required.' }, { status: 400 })
  }

  if (looksLikeBotEmail(email)) {
    return NextResponse.json({ success: true })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const normalizedEmail = email.toLowerCase().trim()

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email: normalizedEmail, source: 'manuals' }, { onConflict: 'email', ignoreDuplicates: true })

  if (error) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json({ error: 'Subscription failed.' }, { status: 500 })
  }

  const now = Date.now()
  const day = 86_400_000

  // Enqueue welcome series (days 3, 7, 14) — skip if already in sequence
  await supabase.from('email_sequences').upsert(
    { email: normalizedEmail, sequence: 'welcome', step: 0, next_send_at: new Date(now + 3 * day).toISOString() },
    { onConflict: 'email,sequence', ignoreDuplicates: true }
  )

  // Enqueue brand follow-up (day 2) if we know the brand
  if (brand && typeof brand === 'string') {
    await supabase.from('email_sequences').upsert(
      { email: normalizedEmail, sequence: 'manual_followup', brand_name: brand.slice(0, 80), step: 0, next_send_at: new Date(now + 2 * day).toISOString() },
      { onConflict: 'email,sequence', ignoreDuplicates: true }
    )
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
