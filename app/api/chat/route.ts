// app/api/chat/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function logChatSession(
  messages: Array<{ role: string; content: string }>,
  detectedBrand: string
) {
  // Only log sessions with at least one back-and-forth (user + assistant)
  if (messages.length < 2) return
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  // Fire and forget — don't await, don't block the response
  supabase
    .from('chat_logs')
    .insert({ messages, detected_brand: detectedBrand, mined: false })
    .then(({ error }) => {
      if (error) console.error('CHAT LOG ERROR:', error.message)
    })
}

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `You are the 2EZ TEK customer service assistant. 2EZ TEK is a professional fitness equipment repair, assembly, installation, and maintenance company serving Dallas Fort Worth, TX.

Key facts:
- Phone: (972) 807-7232
- Email: support@2eztek.com
- Website: 2eztek.com
- Service area: Dallas, Fort Worth, Plano, Frisco, Irving, Arlington, Richardson, McKinney, Garland, Mesquite, Carrollton, Addison, and all of DFW
- Services: Treadmill repair, elliptical repair, exercise bike repair, cable machine repair, strength equipment repair, home gym assembly, commercial gym maintenance, preventative maintenance, equipment installation
- Brands serviced: Life Fitness, Precor, Matrix, Technogym, Cybex, StairMaster, NordicTrack, Bowflex, TRUE Fitness, Schwinn, Nautilus, Octane Fitness, Star Trac, FreeMotion, Hammer Strength, SportsArt, and many more
- SmartGymOps: 2EZ TEK uses SmartGymOps for service tracking, QR reporting, and equipment history
- Pricing: Diagnose first, quote before repair. No guaranteed pricing without inspection.
- Response time: Same-week service in most cases. Next-day availability often possible.
- Reviews: 500+ five-star reviews across DFW

Your job:
- Answer questions about services, coverage, brands, and general fitness equipment repair
- When manual context is provided below, use it to give technically accurate answers about specific models
- Help users understand what might be wrong with their equipment based on symptoms
- If a manual is available for their equipment, mention that 2EZ TEK has documentation for that model
- Guide users toward booking a service at 2eztek.com/contact or calling (972) 807-7232
- Be conversational, helpful, and concise — keep responses under 3 sentences when possible
- Never guarantee a specific price without saying "it depends on the diagnosis"
- Never promise same-day service — say "same-week in most cases"
- If you don't know something specific, say so and direct them to call

Do not:
- Make up certifications or guarantees
- Give detailed DIY repair instructions that could void warranties
- Discuss competitors negatively`

// Known brands to detect in user messages
const KNOWN_BRANDS = [
  'nordictrack', 'nordic track', 'proform', 'life fitness', 'precor', 'matrix',
  'technogym', 'cybex', 'stairmaster', 'bowflex', 'peloton', 'true fitness',
  'schwinn', 'nautilus', 'octane', 'star trac', 'freemotion', 'hammer strength',
  'sportsart', 'spirit', 'sole', 'horizon', 'healthrider', 'reebok', 'marcy',
  'body solid', 'bodycraft', 'landice', 'woodway', 'johnson', 'vision fitness',
]

function extractBrandFromMessages(messages: Array<{ role: string; content: string }>): string {
  // Look at the last 3 messages for brand mentions
  const recentText = messages
    .slice(-3)
    .map((m) => (typeof m.content === 'string' ? m.content : ''))
    .join(' ')
    .toLowerCase()

  for (const brand of KNOWN_BRANDS) {
    if (recentText.includes(brand)) return brand
  }
  return ''
}

async function fetchManualContext(brandQuery: string): Promise<string> {
  if (!brandQuery) return ''
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: manuals } = await supabase
      .from('equipment_manuals_v2')
      .select('slug, description, manual_type')
      .ilike('slug', `%${brandQuery.replace(/\s+/g, '-')}%`)
      .limit(5)

    if (!manuals || manuals.length === 0) return ''

    return `\nEquipment documentation available for this customer's brand:\n` +
      manuals
        .map((m) => `- ${m.slug} (${m.manual_type || 'Manual'}): ${m.description || 'Service documentation available'}`)
        .join('\n') +
      `\n\nUse this documentation to give technically accurate answers. You can mention that 2EZ TEK has the service manual for their equipment.`
  } catch {
    return ''
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, message: 'Invalid messages.' }, { status: 400 })
    }

    const detectedBrand = extractBrandFromMessages(messages)
    const manualContext = await fetchManualContext(detectedBrand)

    // Build system blocks: static (cached) + dynamic manual context if present
    const systemBlocks: any[] = [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ]

    if (manualContext) {
      systemBlocks.push({ type: 'text', text: manualContext })
    }

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
        max_tokens: 1024,
        system: systemBlocks,
        messages: messages.slice(-10),
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.content?.[0]?.text) {
      console.error('ANTHROPIC ERROR:', response.status, JSON.stringify(data))
      return NextResponse.json(
        { success: false, message: 'AI response failed.', debug: { status: response.status, error: data?.error } },
        { status: 500 }
      )
    }

    // Log the full conversation including this new assistant reply for FAQ mining
    logChatSession(
      [...messages.slice(-10), { role: 'assistant', content: data.content[0].text }],
      detectedBrand
    )

    return NextResponse.json({
      success: true,
      message: data.content[0].text,
    })
  } catch (error) {
    console.error('CHAT API ERROR:', error)
    return NextResponse.json(
      { success: false, message: 'Server error.' },
      { status: 500 }
    )
  }
}
