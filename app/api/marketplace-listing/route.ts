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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Honeypot: bots fill the website field, humans never see it
    if (body._hp && body._hp.trim() !== '') {
      return NextResponse.json({ success: true })
    }

    // Timing: reject submissions faster than 4 seconds (bots)
    const loadedAt = parseInt(body._t || '0', 10)
    if (!loadedAt || Date.now() - loadedAt < 4000) {
      return NextResponse.json({ success: true })
    }

    const title = String(body.title || '').trim()
    const sellerName = String(body.seller_name || '').trim()
    const sellerEmail = String(body.seller_email || '').trim()

    if (!title || !sellerName || !sellerEmail) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields.' },
        { status: 400 }
      )
    }

    if (
      title.length > 200 ||
      sellerName.length > 100 ||
      sellerEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellerEmail)
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid field values.' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    const { error } = await supabase.from('equipment_listings').insert({
      title,
      brand: String(body.brand || '').trim().slice(0, 100),
      model: String(body.model || '').trim().slice(0, 100),
      category: String(body.category || '').trim().slice(0, 80),
      condition: String(body.condition || '').trim().slice(0, 40),
      price: body.price ? Number(body.price) : null,
      city: String(body.city || '').trim().slice(0, 80),
      state: String(body.state || 'TX').trim().slice(0, 10),
      description: String(body.description || '').trim().slice(0, 3000),
      seller_name: sellerName,
      seller_email: sellerEmail,
      seller_phone: String(body.seller_phone || '').trim().slice(0, 30),
      photo_url: body.photo_url || null,
      status: 'pending',
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Server error.' },
      { status: 500 }
    )
  }
}
