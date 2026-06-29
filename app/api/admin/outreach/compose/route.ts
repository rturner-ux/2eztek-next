import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function checkPassword(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_BLOG_PASSWORD
}

const COMPOSE_SYSTEM = `You are writing cold outreach emails on behalf of Robby Turner, owner of 2EZ TEK — a fitness equipment repair and maintenance company serving Dallas Fort Worth, TX.

2EZ TEK specializes in:
- Commercial fitness equipment repair (treadmills, ellipticals, bikes, rowers, strength machines)
- Preventive maintenance contracts for gyms, hotels, apartment complexes, and corporate facilities
- Emergency same-week service calls across DFW
- Equipment assembly and installation

Robby is a Six Sigma Black Belt, Certified Personal Trainer, and USMC veteran. These credentials build immediate credibility.

## Your job
Write a short, personal-sounding cold outreach email to a specific business. The goal is to start a conversation, not close a deal.

## Rules
- Maximum 120 words in the body
- Sound like a real person writing to a specific business — NOT a form letter
- Mention ONE specific pain point relevant to their business type (e.g., for hotels: equipment downtime frustrates guests and triggers bad reviews; for gyms: broken equipment = lost memberships; for apartments: residents expect working fitness centers)
- Do NOT list features or bullet points
- Do NOT be overly complimentary ("I love what you do!")
- Sign off as Robby Turner, 2EZ TEK
- Include a soft CTA: "Would it make sense to connect?" or "Worth a quick call?"

## Output format
Respond ONLY with valid JSON (no markdown, no explanation):
{"subject":"...","body":"..."}`

export async function POST(req: NextRequest) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { business_name, business_type, address, city } = await req.json()

  const typeContext: Record<string, string> = {
    hotel: 'hotel with a guest fitness center',
    apartment: 'apartment complex with a resident fitness center',
    gym: 'commercial gym or fitness studio',
    corporate: 'corporate office with an employee fitness facility',
    crossfit: 'CrossFit box or functional fitness gym',
    school: 'school or university athletic facility',
  }

  const painPoints: Record<string, string> = {
    hotel: 'A broken treadmill in a hotel gym is one of the fastest ways to earn a negative review — guests expect that equipment to work.',
    apartment: 'Apartment residents rank fitness centers as one of their top amenities. When equipment is down, it becomes a lease renewal issue.',
    gym: 'Broken equipment means members train somewhere else. Every down machine is a retention risk.',
    corporate: 'When employees lose access to their on-site gym, productivity and morale take a hit.',
    crossfit: 'Your equipment is your programming. Downtime means cancelled classes and unhappy members.',
    school: 'Student athletes depend on reliable equipment. Downtime during the season is not an option.',
  }

  const typeLabel = typeContext[business_type ?? ''] || 'fitness facility'
  const painPoint = painPoints[business_type ?? ''] || 'Equipment downtime is expensive — both in repairs and in the business it costs you.'

  const userPrompt = `Business: ${business_name}
Type: ${typeLabel}
Location: ${city || address || 'Dallas Fort Worth, TX'}
Pain point to reference: ${painPoint}

Write the outreach email.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: COMPOSE_SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  const data = await res.json()
  const raw = data.content?.[0]?.text ?? ''

  try {
    const parsed = JSON.parse(raw)
    return NextResponse.json({ subject: parsed.subject, body: parsed.body })
  } catch {
    return NextResponse.json({ error: 'AI did not return valid JSON', raw }, { status: 500 })
  }
}
