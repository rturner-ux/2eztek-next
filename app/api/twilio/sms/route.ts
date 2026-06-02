// app/api/twilio/sms/route.ts
// Twilio SMS webhook — routes incoming texts through Claude chatbot and replies via TwiML.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SMS_SYSTEM = `You are the 2EZ TEK customer service assistant responding via SMS. 2EZ TEK is a professional fitness equipment repair company in Dallas Fort Worth, TX.

Key facts:
- Phone: (972) 807-7232
- Website: 2eztek.com/contact
- Services: treadmill, elliptical, bike, cable machine, and commercial gym repair across DFW
- Brands: Life Fitness, Precor, NordicTrack, ProForm, Peloton, Matrix, Cybex, Bowflex, StairMaster, and more
- Response time: same-week in most cases

SMS rules — CRITICAL:
- Keep replies under 160 characters when possible (one SMS segment)
- Never exceed 320 characters (two segments max)
- Be direct and helpful — no fluff
- For booking: always send them to call (972) 807-7232 or visit 2eztek.com/contact
- Do not promise same-day service
- Do not quote prices without inspection`

const KNOWN_BRANDS_LOWER = [
  'nordictrack', 'proform', 'life fitness', 'precor', 'matrix', 'technogym',
  'cybex', 'stairmaster', 'bowflex', 'peloton', 'true fitness', 'schwinn',
  'nautilus', 'octane', 'star trac', 'freemotion', 'hammer strength',
]

function detectBrand(text: string): string {
  const lower = text.toLowerCase()
  return KNOWN_BRANDS_LOWER.find(b => lower.includes(b)) || ''
}

async function fetchManualContext(brand: string): Promise<string> {
  if (!brand) return ''
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await supabase
      .from('equipment_manuals_v2')
      .select('slug, manual_type')
      .ilike('slug', `%${brand.replace(/\s+/g, '-')}%`)
      .limit(3)
    if (!data?.length) return ''
    return ` [${brand} manuals available]`
  } catch { return '' }
}

export async function POST(req: Request) {
  try {
    // Parse Twilio's URL-encoded POST body
    const text = await req.text()
    const params = new URLSearchParams(text)
    const from = params.get('From') || ''
    const body = params.get('Body') || ''

    if (!body.trim()) {
      return twimlResponse('Hi! Text us your fitness equipment question and we\'ll help. Call (972) 807-7232 to book.')
    }

    // Log to Supabase for FAQ mining (same chat_logs table, fire and forget)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const detectedBrand = detectBrand(body)
    const manualCtx = await fetchManualContext(detectedBrand)

    const systemBlocks: any[] = [
      { type: 'text', text: SMS_SYSTEM, cache_control: { type: 'ephemeral' } },
    ]
    if (manualCtx) systemBlocks.push({ type: 'text', text: manualCtx })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 256,
        system: systemBlocks,
        messages: [{ role: 'user', content: body.trim() }],
      }),
    })

    const data = await response.json()
    const reply = data.content?.[0]?.text || 'Hi! Call us at (972) 807-7232 for fitness equipment help.'

    // Log the SMS conversation
    supabase.from('chat_logs').insert({
      messages: [
        { role: 'user', content: body.trim() },
        { role: 'assistant', content: reply },
      ],
      detected_brand: detectedBrand,
      mined: false,
    }).then(() => {})

    return twimlResponse(reply)
  } catch (error) {
    console.error('SMS WEBHOOK ERROR:', error)
    return twimlResponse('Sorry, we had a hiccup. Call us at (972) 807-7232 for help.')
  }
}

function twimlResponse(message: string) {
  // Truncate to 320 chars max (2 SMS segments) to avoid runaway costs
  const safe = message.slice(0, 320)
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Message></Response>`,
    { headers: { 'Content-Type': 'text/xml' } }
  )
}
