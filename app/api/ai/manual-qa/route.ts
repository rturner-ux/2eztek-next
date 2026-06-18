// app/api/ai/manual-qa/route.ts
// Answers customer questions about specific fitness equipment manuals using Claude.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const QA_SYSTEM = `You are a senior fitness equipment technician for 2EZ TEK, serving Dallas Fort Worth, TX. You specialize in diagnosing, repairing, and maintaining fitness equipment.

A customer is asking a question about their specific equipment. Answer helpfully and accurately based on the equipment context provided. Keep answers focused and practical (3-6 sentences max).

Rules:
- Use the provided equipment details to give specific, accurate answers
- If you're not certain, say so and recommend a professional inspection
- For error codes, describe what they typically mean and what components are usually involved
- Do not suggest repairs that require specialized tools without warning the customer
- Always include a note that 2EZ TEK can provide professional diagnosis and repair in Dallas Fort Worth if needed
- Do not make guarantees about fix costs or timelines without inspection
- NO em dashes (—). Use commas or periods instead.`

export async function POST(req: Request) {
  try {
    const { slug, question, history } = await req.json()

    if (!slug || !question?.trim()) {
      return NextResponse.json({ success: false, message: 'Slug and question required.' }, { status: 400 })
    }

    // Fetch manual context from Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: manual } = await supabase
      .from('equipment_manuals_v2')
      .select('slug, description, manual_type')
      .eq('slug', slug)
      .maybeSingle()

    const manualContext = manual
      ? `Equipment: ${manual.slug}\nType: ${manual.manual_type || 'Manual'}\nDescription: ${manual.description || 'Fitness equipment manual'}`
      : `Equipment slug: ${slug}`

    // Build conversation history (last 6 exchanges max)
    const conversationMessages = (Array.isArray(history) ? history.slice(-6) : []).map(
      (m: { role: string; content: string }) => ({ role: m.role, content: m.content })
    )
    conversationMessages.push({ role: 'user', content: question.trim() })

    const systemPrompt = `${QA_SYSTEM}

Equipment context for this conversation:
${manualContext}`

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
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages: conversationMessages,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.content?.[0]?.text) {
      return NextResponse.json(
        { success: false, message: 'Could not answer question. Please call (972) 807-7232 for support.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, answer: data.content[0].text })
  } catch (error) {
    console.error('MANUAL QA ERROR:', error)
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again or call (972) 807-7232.' },
      { status: 500 }
    )
  }
}
