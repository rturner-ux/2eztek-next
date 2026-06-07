import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function checkPassword(req: Request) {
  const password = req.headers.get('x-admin-password')
  return Boolean(password && password === process.env.ADMIN_BLOG_PASSWORD)
}

const CONVERT_SYSTEM = `You are a working fitness equipment repair technician at 2EZ TEK in Dallas Fort Worth, TX. You are rewriting an existing blog post into a better structured format. Keep the same topic, title, and SEO intent — just rewrite and expand the content into a comprehensive 900-1200 word guide.

Format the content field as structured HTML using these exact tags: <h2>, <h3>, <ul>, <ol>, <li>, <p>, <strong>. Do not use <html>, <head>, or <body> tags.

Use this structure:
1. <p> Opening paragraph: Name the equipment and symptom in the first sentence. Address the problem directly with no fluff.
2. <h2>Common Symptoms</h2> <ul> with 5-7 <li> items. Bold the symptom name with <strong>, then explain it in a phrase.
3. <h2>Root Causes: What Is Actually Happening</h2> <ol> with 4-6 <li> items. Bold the cause with <strong>, then write 2-3 sentences explaining it with real component names.
4. <h2>What NOT to Do</h2> <ul> with 3-4 <li> items. Bold the mistake with <strong>, then explain why it makes things worse.
5. <h2>Professional Repair in Dallas Fort Worth</h2> 2-3 <p> paragraphs. Mention 2EZ TEK, 500-plus five-star reviews, fast response, same-week service, major brands serviced.
6. <h2>Frequently Asked Questions</h2> 2-3 <h3> questions with <p> answers. Real customer questions.
7. <h2>Get It Fixed This Week</h2> <p> 1-2 sentence CTA mentioning 2EZ TEK and Dallas Fort Worth.

Writing rules:
- NO em dashes (—). Use commas or periods instead.
- NO phrases like "it's worth noting", "furthermore", "in conclusion", "delve into", "crucial", "vital", "a testament to", "look no further"
- Use real component names: walking belt, drive motor, motor control board, reed switch, tension roller, incline actuator, flywheel, resistance magnet
- Mention Dallas Fort Worth naturally where it fits
- Do not promise same-day service, say same-week
- Sound like a technician who has seen this problem a hundred times

Return ONLY valid JSON with this exact shape — no extra text:
{
  "content": ""
}`

export async function POST(req: Request) {
  try {
    if (!checkPassword(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ success: false, message: 'Post ID required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: post, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, content, category, excerpt')
      .eq('id', id)
      .single()

    if (fetchError || !post) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 })
    }

    const userMessage = `Rewrite this blog post into the structured HTML format. Keep the same topic and SEO intent.

Title: ${post.title}
Category: ${post.category || 'Fitness Equipment Repair'}
Excerpt: ${post.excerpt || ''}

Existing content (use as reference for the topic — rewrite and expand it, do not copy it verbatim):
${post.content.slice(0, 2000)}

Return ONLY valid JSON: { "content": "" }`

    const outputText = await callClaude({
      system: CONVERT_SYSTEM,
      userMessage,
      maxTokens: 3000,
      temperature: 0.5,
    })

    const parsed = JSON.parse(cleanJsonOutput(outputText))
    if (!parsed.content) {
      return NextResponse.json({ success: false, message: 'AI returned empty content' }, { status: 500 })
    }

    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ content: parsed.content })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ success: false, message: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, content: parsed.content })
  } catch (error: any) {
    console.error('CONVERT ERROR:', error)
    return NextResponse.json({ success: false, message: error.message || 'Convert failed' }, { status: 500 })
  }
}
