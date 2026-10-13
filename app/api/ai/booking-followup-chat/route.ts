// app/api/ai/booking-followup-chat/route.ts
// Powers the "Ask us anything about your appointment" box on the booking
// confirmation screen -- the interactive piece that's supposed to feel like
// real customer service instead of a static confirmation readout. Each
// question is answered fresh, grounded in the actual booking just
// submitted, not a persisted multi-turn conversation (keeps this simple and
// cheap while still feeling responsive).
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const SYSTEM = `You are a friendly, knowledgeable customer service rep for 2EZ TEK, a fitness equipment repair and assembly company in Dallas Fort Worth, TX. A customer just submitted a booking request and is asking a follow-up question right on the confirmation page.

Answer ONLY using the booking context you're given below -- never invent details that weren't provided (technician name, exact arrival time beyond the window given, part availability, etc.).

Rules:
- If the question is about pricing or cost, do not quote or estimate a number. Say pricing is confirmed on-site or by calling (972) 807-7232.
- If the job is an assembly/installation (not a repair), never suggest there's a fault to diagnose -- there's nothing broken, it just needs to be built.
- If you genuinely don't have enough information to answer honestly, say so plainly and point them to call (972) 807-7232 rather than guessing.
- Keep the answer to 2-4 sentences, warm but efficient.
- Never use em dashes.
- Do not sign off with a name or "The 2EZ TEK Team" -- this is a live reply, not an email.`

export async function POST(req: Request) {
  try {
    const {
      question,
      name,
      equipmentType,
      brandModel,
      details,
      serviceType,
      aiDiagnosis,
      autoApproved,
      confirmedDateIso,
      confirmedWindow,
      address,
      lang,
    } = await req.json()

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json({ success: false, message: 'A question is required.' }, { status: 400 })
    }
    if (question.length > 500) {
      return NextResponse.json({ success: false, message: 'Question is too long.' }, { status: 400 })
    }

    const firstName = (typeof name === 'string' ? name : 'there').trim().split(' ')[0] || 'there'
    const equipment = [brandModel, equipmentType].filter(Boolean).join(' ') || 'their fitness equipment'
    const isAssembly = typeof serviceType === 'string' && /^(assembly|installation)$/i.test(serviceType.trim())

    const contextLines = [
      `Customer first name: ${firstName}`,
      `Service type: ${serviceType || 'not specified'}`,
      `Equipment: ${equipment}`,
      details ? `Issue/details as submitted: ${details}` : null,
      aiDiagnosis ? `AI photo assessment given earlier: ${aiDiagnosis}` : null,
      address ? `Service address: ${address}` : null,
      autoApproved && confirmedDateIso
        ? `This appointment is CONFIRMED for ${confirmedDateIso}${confirmedWindow ? ` (${confirmedWindow})` : ''}.`
        : `This appointment is NOT YET confirmed -- our team is still reviewing availability and will follow up.`,
      isAssembly ? 'This is an assembly/installation job, not a repair -- there is nothing broken to diagnose.' : null,
    ].filter(Boolean).join('\n')

    const userMessage = `Booking context:\n${contextLines}\n\nCustomer's question: ${question.trim()}\n\nAnswer the question directly using only this context.`

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
        max_tokens: 400,
        system: [{
          type: 'text',
          text: SYSTEM + (lang === 'es' ? '\n\nRespond entirely in Spanish (español). The customer only reads Spanish.' : ''),
          cache_control: { type: 'ephemeral' },
        }],
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    const data = await response.json()
    if (!response.ok || !data.content?.[0]?.text) {
      return NextResponse.json({ success: false, message: 'Could not get an answer right now. Please call (972) 807-7232.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, answer: data.content[0].text })
  } catch (error) {
    console.error('BOOKING FOLLOWUP CHAT ERROR:', error)
    return NextResponse.json({ success: false, message: 'Could not get an answer right now. Please call (972) 807-7232.' }, { status: 500 })
  }
}
