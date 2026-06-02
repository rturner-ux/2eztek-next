// app/api/ai/parts-lookup/route.ts
// Identifies fitness equipment parts from text description and/or photo using Claude Vision.
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const PARTS_SYSTEM = `You are a senior fitness equipment parts specialist for 2EZ TEK in Dallas Fort Worth, TX. You have deep knowledge of fitness equipment components across all major brands including Life Fitness, Precor, Matrix, NordicTrack, ProForm, Peloton, Bowflex, Cybex, Technogym, StairMaster, and many more.

When given a description or photo of a fitness equipment part, you identify it precisely and provide actionable information.

Return ONLY valid JSON with this exact shape:
{
  "partName": "Official name of the part",
  "partFunction": "One sentence: what this part does in the machine",
  "likelyBrands": ["Brand1", "Brand2"],
  "commonPartNumbers": "General OEM part number format or known numbers if confident (say 'varies by model' if unsure)",
  "difficulty": "DIY-Friendly | Moderate | Professional Required",
  "difficultyReason": "One sentence explaining why",
  "urgency": "Non-Critical | Should Service Soon | Critical — Stop Using Equipment",
  "urgencyReason": "One sentence explaining safety or damage risk",
  "nextStep": "Specific recommendation (e.g. 'Schedule diagnosis with 2EZ TEK to confirm exact part number and prevent motor damage')",
  "confidence": "High | Medium | Low",
  "confidenceNote": "One sentence — what would make identification more certain if confidence is not High"
}

Rules:
- Be specific: name the exact component (e.g. "Drive Belt" not just "belt", "Motor Control Board" not just "board")
- If the image/description is unclear, set confidence to Low and explain what additional info would help
- For safety-critical parts (motor mounts, safety keys, drive belts on commercial equipment), flag as Critical
- Never guess a specific part number if not confident — use ranges or say 'varies by model'
- Always end nextStep with a reference to 2EZ TEK service in Dallas Fort Worth`

export async function POST(req: Request) {
  try {
    const { description, imageBase64, mediaType, brand, equipmentType } = await req.json()

    if (!description && !imageBase64) {
      return NextResponse.json({ success: false, message: 'Description or image required.' }, { status: 400 })
    }

    const contextLines = [
      brand ? `Equipment brand: ${brand}` : null,
      equipmentType ? `Equipment type: ${equipmentType}` : null,
      description ? `Customer description: "${description}"` : null,
    ].filter(Boolean).join('\n')

    const userText = `Identify this fitness equipment part and provide the requested information.\n\n${contextLines}`

    // Build message content — include image if provided
    const messageContent: any[] = []

    if (imageBase64 && mediaType) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (allowedTypes.includes(mediaType)) {
        messageContent.push({
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: imageBase64 },
        })
      }
    }

    messageContent.push({ type: 'text', text: userText })

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
        system: [{ type: 'text', text: PARTS_SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: messageContent }],
      }),
    })

    const data = await response.json()
    if (!response.ok || !data.content?.[0]?.text) {
      return NextResponse.json(
        { success: false, message: 'Could not identify part. Please call (972) 807-7232.' },
        { status: 500 }
      )
    }

    const text = data.content[0].text
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    const result = JSON.parse(text)
    return NextResponse.json({ success: true, part: result })
  } catch (error) {
    console.error('PARTS LOOKUP ERROR:', error)
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again or call (972) 807-7232.' },
      { status: 500 }
    )
  }
}
