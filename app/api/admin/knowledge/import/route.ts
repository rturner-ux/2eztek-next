import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput, makeSlug } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function checkPassword(req: Request) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_BLOG_PASSWORD
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const FAQ_SYSTEM = `You are writing FAQ content for 2EZ TEK, a veteran-owned mobile fitness equipment repair company in Dallas Fort Worth TX (owner: Robby Turner, USMC Veteran, Six Sigma Black Belt, NCFET-certified technician). Rating: 4.9 stars, 500+ reviews. Phone: (972) 807-7232.

You receive a technical question and answer (from professional technician training material). Convert it into a customer-facing FAQ entry that a homeowner or gym manager would actually search for.

Rules:
- Rewrite the question in plain customer language (not tech exam language)
- Answer in 2-4 sentences. Plain English. Mention 2EZ TEK where it fits naturally.
- Category: one of — Treadmill Repair, Elliptical Repair, Exercise Bike Repair, Electrical Safety, Preventive Maintenance, Commercial Gym, Pricing, General
- NO em dashes. Commas or periods only.
- Return ONLY valid JSON:
{
  "question": "",
  "answer": "",
  "category": ""
}`

const BLOG_SYSTEM = `You are an expert fitness equipment repair technician and educator writing for 2EZ TEK in Dallas Fort Worth TX (owner: Robby Turner, USMC Veteran, Six Sigma Black Belt, nationally certified fitness equipment technician). Rating: 4.9 stars, 500+ reviews. Phone: (972) 807-7232.

You receive a technical topic from professional certification training. Write a blog post that teaches homeowners and gym managers about this topic and naturally positions 2EZ TEK as the expert authority.

Rules:
- Title: clear, searchable, customer-focused. Include Dallas or DFW where natural.
- 750 to 950 words. Specific, technical, genuinely educational.
- HTML: use only <h2>, <h3>, <ul>, <ol>, <li>, <p>, <strong>. No outer HTML tags.
- Structure: explain the concept in plain terms, why it matters for their equipment, signs something is wrong, what a certified tech does about it, why 2EZ TEK is the right call.
- Mention 2EZ TEK naturally — nationally certified techs, 4.9 stars, mobile/on-site, (972) 807-7232, serves all of DFW.
- NO em dashes. Use commas or periods instead.
- NO filler phrases: "it's worth noting", "furthermore", "in conclusion", "crucial", "delve into".
- Sound like a technician who has seen this a hundred times and also knows the theory behind it.
- Return ONLY valid JSON:
{
  "title": "",
  "category": "",
  "excerpt": "",
  "content": "",
  "seo_title": "",
  "seo_description": ""
}`

export async function POST(req: Request) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { pairs, mode } = body as {
    pairs: { question: string; answer: string; topic?: string }[]
    mode: 'blog' | 'faq' | 'both'
  }

  if (!pairs?.length) return NextResponse.json({ error: 'pairs required' }, { status: 400 })

  const supabase = db()
  const results: { input: string; created: { type: string; title?: string; question?: string; id: string }[] }[] = []

  for (const pair of pairs) {
    const created: { type: string; title?: string; question?: string; id: string }[] = []

    // FAQ
    if (mode === 'faq' || mode === 'both') {
      try {
        const raw = await callClaude({
          system: FAQ_SYSTEM,
          userMessage: `Technical Q&A to convert:\n\nQuestion: ${pair.question}\nAnswer: ${pair.answer}${pair.topic ? `\nTopic area: ${pair.topic}` : ''}`,
          maxTokens: 400,
          temperature: 0.4,
        })
        const parsed = JSON.parse(cleanJsonOutput(raw))

        const { data: last } = await supabase.from('faqs').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle()
        const nextOrder = ((last?.sort_order as number) ?? 0) + 10

        const { data: faq, error } = await supabase.from('faqs').insert({
          question: parsed.question,
          answer: parsed.answer,
          category: parsed.category || 'General',
          active: false,
          sort_order: nextOrder,
        }).select('id, question').single()

        if (!error && faq) created.push({ type: 'faq', question: faq.question, id: faq.id })
      } catch (e) {
        // continue
      }
    }

    // Blog
    if (mode === 'blog' || mode === 'both') {
      try {
        const topicLabel = pair.topic || pair.question
        const raw = await callClaude({
          system: BLOG_SYSTEM,
          userMessage: `Technical topic to expand into a blog post:\n\nTopic: ${topicLabel}\nCore concept: ${pair.question}\nTechnical answer: ${pair.answer}\n\nWrite a blog post targeting DFW homeowners and gym managers who need to understand this topic. Return JSON only.`,
          maxTokens: 2800,
          temperature: 0.6,
        })
        const parsed = JSON.parse(cleanJsonOutput(raw))
        const slug = makeSlug(parsed.title)

        const { data: existing } = await supabase.from('blog_posts').select('id').eq('slug', slug).maybeSingle()
        if (!existing) {
          const { data: post, error } = await supabase.from('blog_posts').insert({
            title: parsed.title,
            slug,
            category: parsed.category || 'Fitness Equipment Repair',
            excerpt: parsed.excerpt || '',
            content: parsed.content || '',
            seo_title: parsed.seo_title || `${parsed.title} | 2EZ TEK`,
            seo_description: parsed.seo_description || parsed.excerpt || '',
            hero_image_url: '/images/gym-equipment-repair-dallas.webp',
            gallery_images: [],
            published: false,
            created_at: new Date().toISOString(),
          }).select('id, title').single()

          if (!error && post) created.push({ type: 'blog', title: post.title, id: post.id })
        } else {
          created.push({ type: 'blog_skipped', title: `Slug exists: ${slug}`, id: existing.id })
        }
      } catch (e) {
        // continue
      }
    }

    results.push({ input: pair.question, created })
  }

  const totalCreated = results.flatMap((r) => r.created).filter((c) => c.type !== 'blog_skipped').length
  return NextResponse.json({ success: true, totalCreated, results })
}
