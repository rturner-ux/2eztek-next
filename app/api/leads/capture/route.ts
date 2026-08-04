import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendSms } from '@/lib/customerComms'
import { escapeHtml } from '@/lib/serverSecurity'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const AUTO_REPLY_HTML = (firstName: string, service?: string) => `
  <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:32px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:#050B14;padding:28px 32px;text-align:center;">
        <p style="margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;">2EZ<span style="color:#22d3ee;">TEK</span></p>
        <p style="margin:6px 0 0;font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Fitness Equipment Repair · DFW</p>
      </div>

      <!-- Body -->
      <div style="padding:32px;">
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#0f172a;">We got your message, ${escapeHtml(firstName)}!</h2>
        <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
          ${service
            ? `You reached out about <strong>${escapeHtml(service)}</strong>. Our team will call you within the hour to get you scheduled.`
            : `Our team will call you within the hour to get you scheduled.`
          }
        </p>

        <!-- What to expect -->
        <div style="background:#f1f5f9;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#64748b;">What happens next</p>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <span style="background:#22d3ee;color:#050B14;font-weight:900;font-size:11px;border-radius:100px;padding:2px 8px;flex-shrink:0;margin-top:1px;">1</span>
              <p style="margin:0;font-size:14px;color:#334155;">We call you within the hour to confirm details</p>
            </div>
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <span style="background:#22d3ee;color:#050B14;font-weight:900;font-size:11px;border-radius:100px;padding:2px 8px;flex-shrink:0;margin-top:1px;">2</span>
              <p style="margin:0;font-size:14px;color:#334155;">We schedule your same-week appointment</p>
            </div>
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <span style="background:#22d3ee;color:#050B14;font-weight:900;font-size:11px;border-radius:100px;padding:2px 8px;flex-shrink:0;margin-top:1px;">3</span>
              <p style="margin:0;font-size:14px;color:#334155;">Our certified technician comes to you, no shop drop-off needed</p>
            </div>
          </div>
        </div>

        <!-- Need it faster -->
        <p style="margin:0 0 12px;font-size:14px;color:#475569;">Need to reach us right now?</p>
        <a href="tel:9728077232" style="display:inline-block;background:#050B14;color:#22d3ee;text-decoration:none;padding:13px 28px;border-radius:100px;font-weight:900;font-size:14px;letter-spacing:0.02em;">
          Call (972) 807-7232
        </a>
      </div>

      <!-- Footer -->
      <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">
          2EZ TEK · Dallas Fort Worth · <a href="https://www.2eztek.com" style="color:#22d3ee;text-decoration:none;">www.2eztek.com</a>
        </p>
      </div>

    </div>
  </div>
`

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
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    }) + ' CST'

    const phoneHref = phone ? `tel:${phone.replace(/\D/g, '')}` : null
    const emailHref = email ? `mailto:${email}` : null
    const firstName = name ? name.trim().split(' ')[0] : 'there'

    // Fire both emails in parallel
    await Promise.all([
      // 1. Internal notification to Robby
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'leads@2eztek.com',
          to: 'rturner@2eztek.com',
          subject: `New lead${name ? ` from ${name}` : ''}${service ? ` - ${service}` : ''}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
              <div style="background:#050B14;padding:24px 28px;border-radius:12px 12px 0 0">
                <h2 style="color:#22d3ee;margin:0;font-size:18px">New Lead - 2EZ TEK</h2>
                <p style="color:#94a3b8;margin:6px 0 0;font-size:13px">${submittedAt}</p>
              </div>
              <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px 28px">
                <table style="width:100%;border-collapse:collapse">
                  ${service ? `<tr><td colspan="2" style="padding:12px 0 8px"><div style="background:#052a1a;border:2px solid #22c55e;border-radius:10px;padding:12px 16px"><p style="margin:0 0 2px;font-size:10px;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;color:#4ade80">Needs Help With</p><p style="margin:0;font-size:18px;font-weight:900;color:#ffffff">${escapeHtml(service)}</p></div></td></tr>` : ''}
                  ${name   ? `<tr><td style="padding:8px 0;color:#64748b;width:80px;font-size:13px">Name</td><td style="font-weight:700;font-size:14px">${escapeHtml(name)}</td></tr>` : ''}
                  ${phone  ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Phone</td><td><a href="${phoneHref}" style="font-weight:700;font-size:14px;color:#0891b2;text-decoration:none">${escapeHtml(phone)}</a></td></tr>` : ''}
                  ${email  ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Email</td><td><a href="${emailHref}" style="font-weight:700;font-size:14px;color:#0891b2;text-decoration:none">${escapeHtml(email)}</a></td></tr>` : ''}
                  ${page_url ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Page</td><td style="font-size:13px;color:#64748b;word-break:break-all">${escapeHtml(page_url)}</td></tr>` : ''}
                </table>
                <div style="margin-top:20px;display:flex;gap:10px">
                  ${phone ? `<a href="${phoneHref}" style="display:inline-block;background:#050B14;color:#22d3ee;text-decoration:none;padding:10px 22px;border-radius:100px;font-weight:900;font-size:13px">Call Now</a>` : ''}
                  ${email ? `<a href="${emailHref}" style="display:inline-block;background:#f1f5f9;color:#0f172a;text-decoration:none;padding:10px 22px;border-radius:100px;font-weight:900;font-size:13px">Reply by Email</a>` : ''}
                </div>
              </div>
            </div>
          `,
        }),
      }),

      // 2. Instant auto-reply to customer (only if they gave an email)
      email ? fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: email,
          reply_to: 'rturner@2eztek.com',
          subject: `We got your message, ${firstName} - 2EZ TEK`,
          html: AUTO_REPLY_HTML(firstName, service),
        }),
      }) : Promise.resolve(),

      // 3. Instant auto-reply text (only if they gave a phone) -- this lead
      // source previously left phone-only submitters with zero
      // acknowledgment, same gap the QR code route had.
      phone
        ? sendSms(
            phone,
            `Hi ${firstName}, this is 2EZ TEK. We got your message${service ? ` about ${service}` : ''}. We'll call you within the hour to get you scheduled. Questions? Call (972) 807-7232.`
          ).catch(err => console.error('Lead auto-reply SMS failed:', err))
        : Promise.resolve(),
    ])
  }

  return NextResponse.json({ success: true })
}
