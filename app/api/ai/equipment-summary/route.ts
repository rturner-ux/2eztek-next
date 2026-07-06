import { NextResponse } from 'next/server'
import { callClaude, cleanJsonOutput } from '@/lib/claude'

export const runtime = 'nodejs'

const SUMMARY_SYSTEM = `You are a senior fitness equipment repair expert at 2EZ TEK in Dallas Fort Worth. You have encyclopedic knowledge of fitness equipment brands, models, and their known failure patterns.

When a customer tells you their brand and model (and optionally describes a problem), you give them a brief, expert response that:
1. Names the 2-3 most common failure points specific to that exact brand and model
2. Asks ONE smart, specific follow-up question that would genuinely help a technician prepare for the visit

Rules:
- Be specific to the brand and model. Generic answers are useless.
- If the input is vague (just "treadmill" or "NordicTrack" with no model), ask them to specify the model number.
- Never give repair or troubleshooting instructions.
- Never use em dashes. Use commas or periods instead.
- Keep "summary" under 55 words.
- The follow-up "question" must be answerable and specific, not vague (bad: "can you describe the issue?", good: "Does the belt stop suddenly or slow down gradually?").
- Tone: confident, knowledgeable, and warm. Like a trusted technician who knows this machine well.

Return ONLY valid JSON, no other text:
{ "summary": "...", "question": "..." }`

export async function POST(req: Request) {
  try {
    const { brandModel, equipmentType, details } = await req.json()

    if (!brandModel || String(brandModel).trim().length < 3) {
      return NextResponse.json({ success: false, message: 'Brand/model required.' }, { status: 400 })
    }

    const userMessage = [
      `Brand/Model: ${brandModel}`,
      equipmentType ? `Equipment type: ${equipmentType}` : null,
      details ? `Customer description: ${details}` : null,
    ].filter(Boolean).join('\n')

    const raw = await callClaude({
      system: SUMMARY_SYSTEM,
      userMessage,
      maxTokens: 256,
      temperature: 0.3,
    })

    const parsed = JSON.parse(cleanJsonOutput(raw))
    return NextResponse.json({ success: true, summary: parsed.summary, question: parsed.question })
  } catch (err) {
    console.error('EQUIPMENT SUMMARY ERROR:', err)
    return NextResponse.json({ success: false, message: 'Could not generate summary.' }, { status: 500 })
  }
}
