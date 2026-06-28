import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(request: NextRequest) {
  const { name, phone, email, service, page_url } = await request.json()

  if (!phone && !email) {
    return NextResponse.json({ success: false, error: 'Phone or email required' }, { status: 400 })
  }

  const supabase = getSupabase()

  await supabase.from('site_leads').insert({
    name: name || null,
    phone: phone || null,
    email: email || null,
    page_url: page_url || null,
  })

  if (process.env.RESEND_API_KEY) {
    const submittedAt = new Date().toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }) + ' CST'

    const phoneHref = phone ? `tel:${phone.replace(/\D/g, '')}` : null
    const emailHref = email ? `mailto:${email}` : null

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'leads@2eztek.com',
        to: 'rturner@2eztek.com',
        subject: `New site lead${name ? ` from ${name}` : ''}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
            <div style="background:#050B14;padding:24px 28px;border-radius:12px 12px 0 0">
              <h2 style="color:#22d3ee;margin:0;font-size:18px">New Lead — 2EZ TEK</h2>
              <p style="color:#94a3b8;margin:6px 0 0;font-size:13px">${submittedAt}</p>
            </div>
            <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px 28px">
              <table style="width:100%;border-collapse:collapse">
                ${service ? `<tr><td colspan="2" style="padding:12px 0 8px"><div style="background:#052a1a;border:2px solid #22c55e;border-radius:10px;padding:12px 16px"><p style="margin:0 0 2px;font-size:10px;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;color:#4ade80">Needs Help With</p><p style="margin:0;font-size:18px;font-weight:900;color:#ffffff">${service}</p></div></td></tr>` : ''}
                ${name   ? `<tr><td style="padding:8px 0;color:#64748b;width:80px;font-size:13px">Name</td><td style="font-weight:700;font-size:14px">${name}</td></tr>` : ''}
                ${phone  ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Phone</td><td><a href="${phoneHref}" style="font-weight:700;font-size:14px;color:#0891b2;text-decoration:none">${phone}</a></td></tr>` : ''}
                ${email  ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Email</td><td><a href="${emailHref}" style="font-weight:700;font-size:14px;color:#0891b2;text-decoration:none">${email}</a></td></tr>` : ''}
                ${page_url ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Page</td><td style="font-size:13px;color:#64748b;word-break:break-all">${page_url}</td></tr>` : ''}
              </table>
              <div style="margin-top:20px;display:flex;gap:10px">
                ${phone  ? `<a href="${phoneHref}" style="display:inline-block;background:#050B14;color:#22d3ee;text-decoration:none;padding:10px 22px;border-radius:100px;font-weight:900;font-size:13px">Call Now</a>` : ''}
                ${email  ? `<a href="${emailHref}" style="display:inline-block;background:#f1f5f9;color:#0f172a;text-decoration:none;padding:10px 22px;border-radius:100px;font-weight:900;font-size:13px">Reply by Email</a>` : ''}
              </div>
            </div>
          </div>
        `,
      }),
    })
  }

  return NextResponse.json({ success: true })
}
