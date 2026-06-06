// app/api/cron/auto-faq/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const FAQ_SEARCH_TOPICS = [
  'treadmill repair Dallas common problems',
  'elliptical repair questions Dallas',
  'gym equipment repair FAQ',
  'treadmill belt slipping fix',
  'treadmill motor problems symptoms',
  'elliptical resistance not working',
  'exercise bike repair common issues',
  'NordicTrack treadmill problems',
  'Precor elliptical error codes',
  'Life Fitness treadmill repair',
  'commercial gym equipment maintenance questions',
  'home gym assembly tips questions',
  'treadmill error codes meaning',
  'fitness equipment preventive maintenance',
  'apartment gym equipment repair',
]

const FAQ_SYSTEM_PROMPT = `You are a working fitness equipment repair technician at 2EZ TEK in Dallas Fort Worth, TX. You talk to customers every day and know exactly what they ask before booking a service call.

Write FAQ answers the way you'd actually explain something to a customer on the phone — direct, helpful, no fluff.

Rules:
- Questions must sound like something a real person would actually type or ask
- Answers are 2-4 sentences, conversational and specific — no bullet points, no em dashes (—)
- Mention 2EZ TEK and Dallas Fort Worth naturally where it fits, not forced
- Do not say same-day service, say same-week
- No phrases like "it's important to note", "furthermore", "in conclusion", "crucial"
- Category must be one of: Treadmill Repair, Elliptical Repair, Commercial Service, Assembly, Maintenance, General
- Return ONLY valid JSON array, no extra text`

async function searchForQuestions(topic: string): Promise<string> {
  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: topic + ' questions', num: 5 }),
    })
    if (!response.ok) return ''
    const data = await response.json()
    const snippets = (data.organic || []).map((r: any) => r.title + ' ' + (r.snippet || '')).join('\n')
    const paa = (data.peopleAlsoAsk || []).map((r: any) => r.question).join('\n')
    return [snippets, paa].filter(Boolean).join('\n')
  } catch {
    return ''
  }
}

async function generateFAQs(
  topic: string,
  context: string,
  existingQuestions: string[]
): Promise<Array<{ question: string; answer: string; category: string }>> {
  const userMessage = `Based on this search topic and context, generate 3 genuinely useful FAQ questions and answers.

Topic: ${topic}
Search context: ${context || 'General fitness equipment repair questions'}

Existing questions to avoid duplicating:
${existingQuestions.slice(0, 20).join('\n')}

Return ONLY valid JSON array:
[
  { "question": "", "answer": "", "category": "" },
  { "question": "", "answer": "", "category": "" },
  { "question": "", "answer": "", "category": "" }
]`

  const outputText = await callClaude({
    system: FAQ_SYSTEM_PROMPT,
    userMessage,
    maxTokens: 1024,
    temperature: 0.5,
  })

  const clean = cleanJsonOutput(outputText)
  return JSON.parse(clean)
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: existingFaqs } = await supabase
      .from('faqs')
      .select('question')
      .eq('active', true)

    const existingQuestions = (existingFaqs || []).map((f) => f.question)

    const shuffled = FAQ_SEARCH_TOPICS.sort(() => Math.random() - 0.5).slice(0, 2)

    const newFaqs: Array<{ question: string; answer: string; category: string }> = []

    for (const topic of shuffled) {
      const context = await searchForQuestions(topic)
      const generated = await generateFAQs(topic, context, existingQuestions)

      for (const faq of generated) {
        const isDuplicate = existingQuestions.some(
          (q) => q.toLowerCase().includes(faq.question.toLowerCase().slice(0, 30))
        )
        if (!isDuplicate && faq.question && faq.answer) {
          newFaqs.push(faq)
          existingQuestions.push(faq.question)
        }
      }
    }

    if (newFaqs.length === 0) {
      return NextResponse.json({ success: true, message: 'No new unique FAQs generated', added: 0 })
    }

    const { data: maxOrder } = await supabase
      .from('faqs')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const startOrder = (maxOrder?.sort_order || 0) + 1

    const { data: inserted, error } = await supabase
      .from('faqs')
      .insert(
        newFaqs.map((faq, i) => ({
          question: faq.question,
          answer: faq.answer,
          category: faq.category || 'General',
          source: 'auto',
          active: true,
          sort_order: startOrder + i,
        }))
      )
      .select('id, question')

    if (error) throw new Error(error.message)

    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: `Auto FAQ Update: ${newFaqs.length} new questions added`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:600px">
              <h2 style="color:#0891B2">FAQ Page Auto-Updated</h2>
              <p>${newFaqs.length} new FAQ questions were added to your website.</p>
              <hr/>
              ${newFaqs.map((f) => `
                <div style="margin-bottom:16px;padding:12px;background:#f7f7f7;border-radius:8px">
                  <strong>Q: ${f.question}</strong>
                  <p style="margin:8px 0 0">A: ${f.answer}</p>
                  <small style="color:#666">Category: ${f.category}</small>
                </div>
              `).join('')}
              <hr/>
              <p style="color:#666;font-size:14px">Auto-generated by 2EZ TEK FAQ Engine (Claude Sonnet). Review at <a href="https://www.2eztek.com/admin/blog">your admin panel</a>.</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true, added: newFaqs.length, faqs: inserted })
  } catch (error: any) {
    console.error('AUTO FAQ ERROR:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Auto FAQ failed' },
      { status: 500 }
    )
  }
}
