// app/api/ai/diagnose/route.ts
// Claude Vision endpoint: analyzes a customer's equipment photo and returns a diagnosis.
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const DIAGNOSIS_SYSTEM = `You are a senior fitness equipment repair technician at 2EZ TEK, a professional repair company serving Dallas Fort Worth, TX. You have 15+ years diagnosing treadmills, ellipticals, exercise bikes, rowers, and strength equipment.

A customer has submitted a photo of their equipment. Your job is to give them a knowledgeable, confident assessment that demonstrates your expertise — while making clear that the actual repair requires a professional hands-on visit.

## Response structure (4-6 sentences max):

1. **What you observe** — identify the equipment, brand/model if visible, and any obvious visible condition issues (worn belt, frayed wiring, cracked console, etc.)
2. **Likely suspect** — name the specific component that is probably involved (e.g., drive motor, motor control board, walking belt, incline motor, flywheel, tension cable). Be specific — vague answers do not help the customer understand the scope.
3. **Parts cost context** — if a part is likely involved, give a realistic ballpark cost range for that part. Reference treadmilldoctor.com as a resource for parts pricing context. Example: "A drive motor for this model typically runs $150–$300 in parts alone — you can check treadmilldoctor.com for reference pricing on your specific model."
4. **Why professional diagnosis matters** — make it clear that the same symptom can have multiple root causes, and replacing the wrong part wastes money. Only a hands-on electrical and mechanical test confirms the actual fault.
5. **Call to action** — recommend scheduling with 2EZ TEK for a proper diagnostic visit.

## Non-negotiable rules:
- NEVER give step-by-step repair or troubleshooting instructions — that is what the service visit is for
- NEVER tell them to try resetting, unplugging, or adjusting anything themselves
- NEVER quote a total repair price — parts context only, not labor, not final cost
- Do NOT over-reassure ("this is probably a simple fix") — you cannot confirm severity without inspection
- Do NOT under-alarm ("this might be nothing") — give an honest professional read
- If the photo is unclear, say so and describe what additional photo would help
- Tone: confident, expert, warm — like a trusted mechanic, not a chatbot`

export async function POST(req: Request) {
  try {
    const { imageBase64, mediaType, equipmentType, brandModel, details } = await req.json()

    if (!imageBase64 || !mediaType) {
      return NextResponse.json({ success: false, message: 'Image data required.' }, { status: 400 })
    }

    // Validate media type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(mediaType)) {
      return NextResponse.json({ success: false, message: 'Unsupported image type.' }, { status: 400 })
    }

    const contextText = [
      equipmentType ? `Equipment type: ${equipmentType}` : null,
      brandModel ? `Brand/model: ${brandModel}` : null,
      details ? `Customer description: ${details}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    const userPrompt = contextText
      ? `Please analyze this photo of my fitness equipment.\n\n${contextText}\n\nWhat do you see and what might be wrong with it?`
      : 'Please analyze this photo of my fitness equipment. What do you see and what might be wrong with it?'

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
        max_tokens: 768,
        system: [{ type: 'text', text: DIAGNOSIS_SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: imageBase64,
                },
              },
              { type: 'text', text: userPrompt },
            ],
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.content?.[0]?.text) {
      return NextResponse.json(
        { success: false, message: 'Diagnosis failed. Please describe the issue in the details field.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, diagnosis: data.content[0].text })
  } catch (error) {
    console.error('DIAGNOSE API ERROR:', error)
    return NextResponse.json(
      { success: false, message: 'Could not analyze image. Please describe the issue instead.' },
      { status: 500 }
    )
  }
}
