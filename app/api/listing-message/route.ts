import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { listing_id, sender_name, sender_email, sender_phone, message } = body

    if (!listing_id || !sender_name?.trim() || !sender_email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender_email.trim())) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: msgError } = await supabase
      .from('listing_messages')
      .insert({
        listing_id,
        sender_name: sender_name.trim(),
        sender_email: sender_email.trim().toLowerCase(),
        sender_phone: sender_phone?.trim() || null,
        message: message.trim(),
      })

    if (msgError) throw msgError

    const { data: listing } = await supabase
      .from('equipment_listings')
      .select('title, seller_name, seller_email')
      .eq('id', listing_id)
      .maybeSingle()

    if (process.env.RESEND_API_KEY && listing?.seller_email) {
      const emailHtml = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:600px">
          <h2 style="color:#0891B2">New Message About Your Listing</h2>
          <p>Hi ${listing.seller_name},</p>
          <p>Someone is interested in your listing: <strong>${listing.title}</strong></p>
          <div style="margin:24px 0;padding:20px;background:#f7f7f7;border-left:4px solid #0891B2;border-radius:8px">
            <p style="margin:0 0 8px"><strong>From:</strong> ${sender_name.trim()}</p>
            <p style="margin:0 0 8px"><strong>Email:</strong> ${sender_email.trim()}</p>
            ${sender_phone?.trim() ? `<p style="margin:0 0 8px"><strong>Phone:</strong> ${sender_phone.trim()}</p>` : ''}
            <p style="margin:12px 0 4px"><strong>Message:</strong></p>
            <p style="margin:0;white-space:pre-wrap">${message.trim()}</p>
          </div>
          <p>Reply directly to <a href="mailto:${sender_email.trim()}">${sender_email.trim()}</a>.</p>
          <hr style="margin-top:32px;border:none;border-top:1px solid #eee"/>
          <p style="color:#666;font-size:13px">Sent via the 2EZ TEK Equipment Marketplace. All messages are monitored by 2EZ TEK for safety.</p>
        </div>
      `

      const emailPayload = (to: string[], subject: string) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: '2EZ TEK Marketplace <support@2eztek.com>',
            to,
            reply_to: sender_email.trim(),
            subject,
            html: emailHtml,
          }),
        })

      await Promise.all([
        emailPayload([listing.seller_email], `New Message: ${listing.title}`),
        emailPayload(['support@2eztek.com'], `[Marketplace] Message for: ${listing.title}`),
      ])
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('LISTING MESSAGE ERROR:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}
