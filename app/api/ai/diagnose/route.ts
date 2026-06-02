// app/api/ai/diagnose/route.ts
// Claude Vision endpoint: analyzes a customer's equipment photo and returns a diagnosis.
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const DIAGNOSIS_SYSTEM = `You are a senior fitness equipment repair technician for 2EZ TEK, serving Dallas Fort Worth, TX.

A customer has uploaded a photo of their fitness equipment. Analyze it and provide a helpful, professional assessment.

Your response must be concise (3-5 sentences total) and structured like this:
1. What you can see (equipment type, brand if visible, visible condition)
2. The most likely issue based on what's visible
3. Recommended next step (schedule a service call with 2EZ TEK)

Rules:
- Be specific about what you actually see — never guess if the image is unclear
- Do not guarantee a diagnosis without physical inspection
- Do not suggest DIY repairs that could void warranties or cause injury
- Always recommend a professional service call for confirmed issues
- If the image is too blurry, dark, or unclear, say so and ask for a better photo
- Keep the tone helpful and professional, not alarming`

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
        max_tokens: 512,
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
