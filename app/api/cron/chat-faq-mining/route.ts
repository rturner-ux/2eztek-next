// app/api/cron/chat-faq-mining/route.ts
// Mines recent chat conversations to extract FAQ candidates and add to the FAQ table.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MINING_SYSTEM = `You are an FAQ curator for 2EZ TEK, a fitness equipment repair company in Dallas Fort Worth, TX.

You analyze real customer chat conversations and extract the most useful questions and answers to add to the public FAQ page.

Rules for extracted FAQs:
- Questions must be things real customers genuinely want to know
- Answers should be 2-4 sentences, helpful and accurate to what was discussed
- Naturally mention 2EZ TEK and Dallas Fort Worth where relevant
- Do not say same-day service, say same-week
- Do not make guarantees without inspection
- Only extract questions that are clearly and accurately answered in the conversation
- Skip questions about pricing specifics or warranty claims
- Category must be one of: Treadmill Repair, Elliptical Repair, Commercial Service, Assembly, Maintenance, General
- Return ONLY valid JSON array, no extra text`

type ChatMessage = { role: string; content: string }

async function mineChatSession(
  messages: ChatMessage[],
  existingQuestions: string[]
): Promise<Array<{ question: string; answer: string; category: string }>> {
  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'Customer' : 'Support'}: ${m.content}`)
    .join('\n')

  const userMessage = `Extract 0-3 FAQ question/answer pairs from this customer support conversation.

Existing FAQ questions to avoid duplicating:
${existingQuestions.slice(0, 30).join('\n')}

Conversation:
${transcript}

Return ONLY valid JSON array (empty array if nothing useful):
[
  { "question": "", "answer": "", "category": "" }
]`

  const outputText = await callClaude({
    system: MINING_SYSTEM,
    userMessage,
    maxTokens: 768,
    temperature: 0.3,
  })

  try {
    return JSON.parse(cleanJsonOutput(outputText))
  } catch {
    return []
  }
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

    // Fetch up to 20 unprocessed chat sessions from the past 7 days
    const { data: chatLogs, error: logsError } = await supabase
      .from('chat_logs')
      .select('id, messages, detected_brand')
      .eq('mined', false)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20)

    if (logsError) throw new Error(logsError.message)
    if (!chatLogs || chatLogs.length === 0) {
      return NextResponse.json({ success: true, message: 'No unprocessed chat sessions', added: 0 })
    }

    // Get existing FAQ questions to avoid duplicates
    const { data: existingFaqs } = await supabase
      .from('faqs')
      .select('question')
      .eq('active', true)

    const existingQuestions = (existingFaqs || []).map((f) => f.question)

    const newFaqs: Array<{ question: string; answer: string; category: string }> = []
    const processedIds: string[] = []

    for (const log of chatLogs) {
      try {
        const extracted = await mineChatSession(log.messages as ChatMessage[], [
          ...existingQuestions,
          ...newFaqs.map((f) => f.question),
        ])

        for (const faq of extracted) {
          if (!faq.question || !faq.answer) continue
          const isDuplicate = existingQuestions.some(
            (q) => q.toLowerCase().includes(faq.question.toLowerCase().slice(0, 30))
          )
          if (!isDuplicate) {
            newFaqs.push(faq)
            existingQuestions.push(faq.question)
          }
        }

        processedIds.push(log.id)
        await new Promise((r) => setTimeout(r, 300))
      } catch (err) {
        console.error('Chat mining failed for log:', log.id, err)
        processedIds.push(log.id) // Mark as mined anyway to avoid retry loops
      }
    }

    // Mark all processed logs as mined
    if (processedIds.length > 0) {
      await supabase
        .from('chat_logs')
        .update({ mined: true })
        .in('id', processedIds)
    }

    if (newFaqs.length === 0) {
      return NextResponse.json({ success: true, message: 'No new FAQs extracted from chat logs', added: 0 })
    }

    // Get current max sort order
    const { data: maxOrder } = await supabase
      .from('faqs')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const startOrder = (maxOrder?.sort_order || 0) + 1

    const { data: inserted, error: insertError } = await supabase
      .from('faqs')
      .insert(
        newFaqs.map((faq, i) => ({
          question: faq.question,
          answer: faq.answer,
          category: faq.category || 'General',
          source: 'chat-mining',
          active: true,
          sort_order: startOrder + i,
        }))
      )
      .select('id, question')

    if (insertError) throw new Error(insertError.message)

    if (process.env.RESEND_API_KEY && newFaqs.length > 0) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: `Chat FAQ Mining: ${newFaqs.length} new FAQs extracted from ${chatLogs.length} conversations`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:600px">
              <h2 style="color:#0891B2">Chat FAQ Mining Report</h2>
              <p>Analyzed <strong>${chatLogs.length} chat conversations</strong> and extracted <strong>${newFaqs.length} new FAQ entries</strong>.</p>
              <hr/>
              ${newFaqs.map((f) => `
                <div style="margin-bottom:16px;padding:12px;background:#f7f7f7;border-radius:8px">
                  <strong>Q: ${f.question}</strong>
                  <p style="margin:8px 0 0">A: ${f.answer}</p>
                  <small style="color:#666">Category: ${f.category} | Source: Real customer conversation</small>
                </div>
              `).join('')}
              <hr/>
              <p style="color:#666;font-size:13px">Auto-generated by 2EZ TEK Chat FAQ Mining Engine. Runs twice weekly.</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({
      success: true,
      sessions_analyzed: chatLogs.length,
      added: newFaqs.length,
      faqs: inserted,
    })
  } catch (error: any) {
    console.error('CHAT FAQ MINING ERROR:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Chat FAQ mining failed' },
      { status: 500 }
    )
  }
}
