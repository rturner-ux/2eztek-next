import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SYSTEM = `You are a senior fitness equipment technician and analyst for 2EZ TEK in Dallas Fort Worth, TX. You have 15+ years of experience advising customers on whether to repair or replace fitness equipment.

Analyze the equipment details and give a clear, honest recommendation.

Scoring factors (weight toward Replace):
- Age over 7 years for residential, 5 years for commercial: +20 pts
- Age over 12 years: +35 pts total
- 3+ prior repairs: +15 pts
- 5+ prior repairs: +30 pts total
- High-value brand (Life Fitness, Precor, Matrix, Technogym, Cybex): -15 pts (worth repairing longer)
- Major structural failure (frame, welds, deck warped): +25 pts
- Console/electronics failure on older machine: +20 pts
- Belt/motor on newer machine: -10 pts (routine, cost-effective)
- Estimated repair cost over 50% of replacement value: +30 pts

Verdict thresholds:
- 0-25: Repair
- 26-50: Lean Repair
- 51-74: Lean Replace
- 75-100: Replace

Return ONLY valid JSON:
{
  "score": 0,
  "verdict": "Repair | Lean Repair | Lean Replace | Replace",
  "headline": "One punchy sentence summarizing the recommendation",
  "repairPros": ["reason1", "reason2"],
  "replacePros": ["reason1", "reason2"],
  "whatRepairFixes": "One sentence: what the repair would address",
  "whatRepairWontFix": "One sentence: underlying issues the repair won't resolve (or 'None — repair should fully resolve the issue')",
  "estimatedLifeIfRepaired": "e.g. '3-5 more years with proper maintenance' or 'likely 1-2 years before next major issue'",
  "recommendation": "2-3 sentences of practical advice. If repair: explain why it's worth it. If replace: explain what to look for in a replacement and mention 2EZ TEK can help with assembly.",
  "callToAction": "Repair | Get a Diagnosis First | Replace"
}`

type Payload = {
  equipmentType: string
  brandModel: string
  ageYears: number
  symptom: string
  priorRepairs: number
  repairQuote?: string
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as Payload

    if (!payload.equipmentType || !payload.symptom) {
      return NextResponse.json(
        { success: false, message: 'Equipment type and symptom are required.' },
        { status: 400 }
      )
    }

    if (
      payload.symptom.length > 2000 ||
      payload.ageYears < 0 || payload.ageYears > 50 ||
      payload.priorRepairs < 0 || payload.priorRepairs > 50
    ) {
      return NextResponse.json({ success: false, message: 'Invalid input values.' }, { status: 400 })
    }

    const userMessage = `Analyze this fitness equipment repair vs. replace decision.

Equipment type: ${payload.equipmentType}
Brand / Model: ${payload.brandModel || 'Not specified'}
Age: ${payload.ageYears} year${payload.ageYears === 1 ? '' : 's'}
Current issue: ${payload.symptom}
Number of prior repairs: ${payload.priorRepairs}
${payload.repairQuote ? `Repair quote / estimated cost: ${payload.repairQuote}` : ''}

Return ONLY valid JSON.`

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
        temperature: 0.2,
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    const data = await response.json()
    if (!response.ok || !data.content?.[0]?.text) {
      console.error('ANTHROPIC ERROR:', response.status, JSON.stringify(data))
      return NextResponse.json({ success: false, message: 'AI analysis failed.' }, { status: 500 })
    }

    const raw = data.content[0].text
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    const result = JSON.parse(raw)
    return NextResponse.json({ success: true, result })
  } catch (error: unknown) {
    console.error('REPAIR-OR-REPLACE ERROR:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
