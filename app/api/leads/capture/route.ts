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
  const { name, phone, email, page_url } = await request.json()

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
    const contactLine = [
      name ? `Name: ${name}` : null,
      phone ? `Phone: ${phone}` : null,
      email ? `Email: ${email}` : null,
      page_url ? `Page: ${page_url}` : null,
    ].filter(Boolean).join('\n')

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
        text: `New lead captured on 2eztek.com:\n\n${contactLine}`,
      }),
    })
  }

  return NextResponse.json({ success: true })
}
