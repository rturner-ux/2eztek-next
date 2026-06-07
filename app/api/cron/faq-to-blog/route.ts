// app/api/cron/faq-to-blog/route.ts
// Takes frequently asked customer questions from the faqs table and expands
// each one into a full 900-1200 word structured blog post.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput, makeSlug } from '@/lib/claude'
import { isDuplicateInList } from '@/lib/blog-dedup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const FAQ_BLOG_SYSTEM = `You are a working fitness equipment repair technician at 2EZ TEK in Dallas Fort Worth, TX. You are expanding a real customer FAQ into a comprehensive blog post that answers the question in full detail.

Write 900 to 1200 words. The post should answer the original question completely and then go deeper — giving readers more value than just the FAQ answer.

Format the content field as structured HTML using these exact tags: <h2>, <h3>, <ul>, <ol>, <li>, <p>, <strong>. Do not use <html>, <head>, or <body> tags.

Use this structure:
1. <p> Opening: Answer the question directly in the first 2-3 sentences. No hedging, no buildup.
2. <h2>The Full Answer</h2> 2-3 <p> paragraphs expanding on the answer with technical depth and real component names.
3. <h2>Related Problems to Watch For</h2> <ul> 4-6 <li> items with <strong> labels — related issues a customer with this problem should know about.
4. <h2>What This Repair Actually Involves</h2> <ol> 3-5 <li> steps explaining the diagnostic and repair process with real technical detail.
5. <h2>When to DIY vs. Call a Technician</h2> <p> 2 paragraphs being honest about what is safe to attempt.
6. <h2>More Questions Customers Ask</h2> 2 <h3> related questions with <p> answers — questions that naturally come up alongside the original.
7. <h2>Get This Fixed in Dallas Fort Worth</h2> <p> 1-2 sentence CTA mentioning 2EZ TEK and same-week service.

Writing rules:
- NO em dashes (—). Use commas or periods instead.
- NO phrases like "it's worth noting", "furthermore", "crucial", "vital", "a testament to", "look no further"
- Use real component names: walking belt, drive motor, motor control board, reed switch, tension roller, incline actuator, flywheel, resistance magnet
- Mention Dallas Fort Worth naturally where it fits
- Do not promise same-day service, say same-week
- Sound like a technician who answers this question every week
- Write for RESIDENTIAL homeowners — people with a treadmill in the guest room or an elliptical in the garage, not facility managers. 2EZ TEK is one of the few DFW repair companies that actively serves residential clients. Many homeowners have been turned away by companies that only want commercial accounts. Acknowledge this in the CTA section.
- Return ONLY valid JSON, no extra text`

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

    // Pull active FAQs
    const { data: faqs, error: faqError } = await supabase
      .from('faqs')
      .select('id, question, answer, category')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (faqError || !faqs || faqs.length === 0) {
      return NextResponse.json({ success: true, message: 'No active FAQs found', published: 0 })
    }

    // Pull existing posts for duplicate checking
    const { data: existingPosts } = await supabase
      .from('blog_posts')
      .select('title, slug')
      .order('created_at', { ascending: false })
      .limit(200)

    const existing = existingPosts || []

    // Shuffle FAQs and find one that hasn't been blogged yet
    const shuffled = [...faqs].sort(() => Math.random() - 0.5)
    const chosen = shuffled.find(faq =>
      faq.question &&
      faq.question.length > 20 &&
      !isDuplicateInList(faq.question, existing)
    )

    if (!chosen) {
      return NextResponse.json({ success: true, message: 'All FAQs already have corresponding blog posts', published: 0 })
    }

    const userMessage = `Expand this customer FAQ into a full blog post.

Question: ${chosen.question}
Short answer we already have: ${chosen.answer}
Category: ${chosen.category || 'General'}

Return ONLY valid JSON:
{
  "title": "",
  "category": "",
  "excerpt": "",
  "content": "",
  "seo_title": "",
  "seo_description": "",
  "hero_image_url": ""
}`

    const outputText = await callClaude({
      system: FAQ_BLOG_SYSTEM,
      userMessage,
      maxTokens: 3000,
      temperature: 0.55,
    })

    const parsed = JSON.parse(cleanJsonOutput(outputText))
    const title = parsed.title || chosen.question
    const slug = makeSlug(title)

    // Final duplicate check on the generated title
    if (isDuplicateInList(title, existing)) {
      return NextResponse.json({ success: true, message: 'Generated title too similar to existing post', published: 0 })
    }

    // Check slug collision
    const { data: slugCheck } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    const finalSlug = slugCheck ? `${slug}-${Date.now()}` : slug

    const { data: saved, error: saveError } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug: finalSlug,
        category: parsed.category || chosen.category || 'Fitness Equipment Repair',
        excerpt: parsed.excerpt,
        content: parsed.content,
        seo_title: parsed.seo_title,
        seo_description: parsed.seo_description,
        hero_image_url: parsed.hero_image_url || '/images/gym-equipment-repair-dallas.webp',
        gallery_images: [],
        published: false,
        created_at: new Date().toISOString(),
      })
      .select('id, slug, title')
      .single()

    if (saveError) throw new Error(saveError.message)

    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: `FAQ Blog Post: ${title}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:580px"><h2 style="color:#0891B2">FAQ Expanded Into Blog Post</h2><p>Source FAQ: <em>${chosen.question}</em></p><p><strong>${title}</strong></p><p>${parsed.excerpt}</p><a href="https://www.2eztek.com/admin/blog">Review in Admin →</a></div>`,
        }),
      })
    }

    return NextResponse.json({
      success: true,
      published: 1,
      source_faq: chosen.question,
      post: { id: saved.id, slug: saved.slug, title: saved.title },
    })
  } catch (error: any) {
    console.error('FAQ TO BLOG ERROR:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
