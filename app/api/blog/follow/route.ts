import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

export function unsubToken(email: string) {
  return createHmac('sha256', process.env.CRON_SECRET || 'fallback-secret')
    .update(email.toLowerCase().trim())
    .digest('hex')
    .slice(0, 32)
}

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json()

    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ success: false, message: 'Valid email required.' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: existing } = await supabase
      .from('blog_followers')
      .select('id, unsubscribed')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (existing && !existing.unsubscribed) {
      return NextResponse.json({ success: true }) // already following
    }

    if (existing?.unsubscribed) {
      await supabase.from('blog_followers').update({ unsubscribed: false }).eq('id', existing.id)
    } else {
      await supabase.from('blog_followers').insert({
        email: cleanEmail,
        name: name?.trim() || null,
      })
    }

    if (process.env.RESEND_API_KEY) {
      const unsubLink = `https://www.2eztek.com/api/blog/unsubscribe?email=${encodeURIComponent(cleanEmail)}&token=${unsubToken(cleanEmail)}`
      const firstName = name?.trim().split(' ')[0] || null

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: [cleanEmail],
          subject: "You're now following 2EZ TEK",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111;line-height:1.7">
              <div style="background:#050e1e;padding:32px 32px 24px;border-radius:16px 16px 0 0">
                <div style="font-size:11px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#22d3ee">2EZ TEK</div>
              </div>
              <div style="background:#fff;padding:32px;border:1px solid #eee;border-top:none;border-radius:0 0 16px 16px">
                <h2 style="margin:0 0 16px;font-size:22px;color:#050e1e">You're following 2EZ TEK.</h2>
                <p style="margin:0 0 16px;color:#444">${firstName ? `Hey ${firstName},` : 'Hey,'}</p>
                <p style="margin:0 0 16px;color:#444">You'll get an email every time we publish a new article on fitness equipment repair, maintenance tips, and industry insights for the Dallas Fort Worth area.</p>
                <p style="margin:0 0 28px;color:#444">No daily blasts. Just real articles when they go live.</p>
                <a href="https://www.2eztek.com/blog" style="display:inline-block;background:#0891B2;color:#fff;padding:14px 28px;text-decoration:none;border-radius:10px;font-weight:900;font-size:13px;letter-spacing:0.05em">Browse Recent Articles</a>
                <hr style="margin:32px 0;border:none;border-top:1px solid #eee"/>
                <p style="font-size:12px;color:#999;margin:0">
                  2EZ TEK &middot; Dallas Fort Worth, TX &middot; (972) 807-7232<br/>
                  <a href="${unsubLink}" style="color:#999">Unsubscribe</a>
                </p>
              </div>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error. Try again.' }, { status: 500 })
  }
}
