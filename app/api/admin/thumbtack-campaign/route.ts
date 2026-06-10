import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function requireAuth(request: NextRequest) {
  const password = request.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_BLOG_PASSWORD) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
  }
  return null
}

function buildEmail(firstName: string): string {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.75;color:#222;max-width:560px;margin:0 auto">
      <div style="background:#050B14;padding:22px 28px;border-radius:16px 16px 0 0">
        <div style="color:#67e8f9;font-size:20px;font-weight:900;letter-spacing:0.05em">2EZ TEK</div>
        <div style="color:#94a3b8;font-size:12px;margin-top:3px">Dallas Fort Worth Fitness Equipment Service</div>
      </div>
      <div style="padding:28px 32px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 16px 16px;background:#fff">
        <p style="margin:0 0 16px">Hi ${firstName},</p>

        <p style="margin:0 0 16px">
          We just wanted to take a moment to say thank you for trusting 2EZ TEK with your fitness
          equipment. Customers like you are the reason we do what we do, and we genuinely appreciate
          your support.
        </p>

        <p style="margin:0 0 16px">
          Whether you need a tune-up, a repair, or have new equipment you want assembled, we are
          always here and ready to help. As a returning customer you get priority scheduling and
          our best response time.
        </p>

        <p style="margin:0 0 16px">
          And if you know anyone in the Dallas Fort Worth area who could use our services, a referral
          means the world to a small business. Feel free to pass along our number or send them to
          <a href="https://2eztek.com" style="color:#0891b2">2eztek.com</a>.
        </p>

        <div style="margin:28px 0;padding:20px 24px;background:#f0f9ff;border-radius:12px;border-left:4px solid #0891b2">
          <div style="font-weight:700;margin-bottom:6px">Ready to book?</div>
          <div>Call or text: <a href="tel:9728077232" style="color:#0891b2;font-weight:700">(972) 807-7232</a></div>
          <div style="margin-top:4px">Book online: <a href="https://2eztek.com/contact" style="color:#0891b2">2eztek.com/contact</a></div>
        </div>

        <p style="margin:0">Thanks again, ${firstName}. We look forward to seeing you.</p>
        <p style="margin:16px 0 0;font-weight:700">Robby Turner<br/><span style="font-weight:400;color:#555">2EZ TEK LLC</span></p>

        <div style="margin-top:28px;padding-top:18px;border-top:1px solid #eee;font-size:12px;color:#999">
          2EZ TEK &middot; Dallas Fort Worth, TX &middot; (972) 807-7232 &middot; 2eztek.com<br/>
          <a href="mailto:support@2eztek.com?subject=Unsubscribe" style="color:#bbb">Unsubscribe</a>
        </div>
      </div>
    </div>
  `
}

export async function GET(request: NextRequest) {
  try {
    const unauthorized = requireAuth(request)
    if (unauthorized) return unauthorized

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('new_customers')
      .select('id, name, email, status')
      .eq('source', 'Square')
      .neq('status', 'thumbtack-outreach')
      .not('email', 'is', null)
      .order('name')

    if (error) throw error

    return NextResponse.json({ success: true, customers: data || [] })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = requireAuth(request)
    if (unauthorized) return unauthorized

    const body = await request.json()
    const ids: string[] = Array.isArray(body.ids) ? body.ids : []
    if (ids.length === 0) {
      return NextResponse.json({ success: false, message: 'No customer IDs provided.' }, { status: 400 })
    }

    const supabase = getSupabase()
    const { data: customers, error } = await supabase
      .from('new_customers')
      .select('id, name, email')
      .in('id', ids)
      .not('email', 'is', null)

    if (error) throw error
    if (!customers || customers.length === 0) {
      return NextResponse.json({ success: false, message: 'No matching customers found.' }, { status: 404 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, message: 'RESEND_API_KEY not configured.' }, { status: 500 })
    }

    const sent: string[] = []
    const failed: string[] = []

    for (const customer of customers) {
      const firstName = customer.name.trim().split(/\s+/)[0]
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: '2EZ TEK <support@2eztek.com>',
            to: [customer.email],
            subject: `${firstName}, thank you for being a 2EZ TEK customer`,
            html: buildEmail(firstName),
          }),
        })

        if (res.ok) {
          sent.push(customer.name)
          await supabase
            .from('new_customers')
            .update({ status: 'thumbtack-outreach' })
            .eq('id', customer.id)
        } else {
          failed.push(customer.name)
        }
      } catch {
        failed.push(customer.name)
      }

      // Respect Resend rate limit
      await new Promise((r) => setTimeout(r, 400))
    }

    // Summary email to admin
    if (sent.length > 0) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: `Thumbtack Thank-You Campaign: ${sent.length} sent`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:580px">
              <h2 style="color:#0891B2">Thumbtack Campaign Complete</h2>
              <p>Sent to <strong>${sent.length}</strong> customers.${failed.length > 0 ? ` ${failed.length} failed.` : ''}</p>
              <p><strong>Sent to:</strong><br/>${sent.join('<br/>')}</p>
              ${failed.length > 0 ? `<p><strong>Failed:</strong><br/>${failed.join('<br/>')}</p>` : ''}
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true, sent: sent.length, failed: failed.length, sentNames: sent })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Campaign failed.' },
      { status: 500 }
    )
  }
}
