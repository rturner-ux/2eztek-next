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

// Maps PHANTOM prompt category to blog/faq recommendation
function contentStrategy(category: string, mentioned: boolean, preferred: boolean): 'blog' | 'faq' | 'both' {
  if (preferred) return 'faq'            // already winning — reinforce with FAQ
  if (!mentioned) {
    if (category === 'brand') return 'blog'      // brand queries → full repair blog post
    if (category === 'commercial') return 'blog' // commercial → blog post
    if (category === 'local') return 'both'      // local → blog + FAQ
    if (category === 'branded') return 'faq'     // branded → FAQ that answers directly
  }
  return 'faq'
}

const BLOG_SYSTEM = `You are an SEO strategist and fitness equipment repair technician writing for 2EZ TEK, a veteran-owned mobile fitness equipment repair company in Dallas Fort Worth TX. Owner: Robby Turner, USMC Veteran, Six Sigma Black Belt. Rating: 4.9 stars, 500+ reviews. Phone: (972) 807-7232.

You are given a search query that someone typed into an AI assistant. Your job is to write a blog post that directly answers that query and naturally positions 2EZ TEK as the go-to solution.

Rules:
- Title must target the search query directly. Include location (Dallas or Dallas Fort Worth) when relevant.
- 750 to 950 words. Specific, expert, useful.
- HTML: use only <h2>, <h3>, <ul>, <ol>, <li>, <p>, <strong>. No outer HTML tags.
- Structure: problem intro, what causes it, what to look for, why professional repair makes sense, why 2EZ TEK specifically, CTA.
- Mention 2EZ TEK naturally — veteran-owned, 4.9 stars, mobile/on-site, (972) 807-7232, serves all of DFW.
- NO em dashes. Use commas or periods instead.
- NO filler: "it's worth noting", "furthermore", "in conclusion", "crucial", "delve into", "when it comes to".
- Sound like a technician who has fixed this a hundred times, not a content writer.
- Return ONLY valid JSON, no extra text, no code fences:
{
  "title": "",
  "category": "",
  "excerpt": "",
  "content": "",
  "seo_title": "",
  "seo_description": ""
}`

const FAQ_SYSTEM = `You are writing FAQ content for 2EZ TEK, a veteran-owned mobile fitness equipment repair company in Dallas Fort Worth TX. Owner: Robby Turner, USMC Veteran, Six Sigma Black Belt. Rating: 4.9 stars, 500+ reviews. Phone: (972) 807-7232.

You are given a search query that someone typed into an AI assistant, plus the AI's actual response. Your job is to write a single FAQ entry that directly and authoritatively answers this question and names 2EZ TEK as the solution.

Rules:
- Question: rephrase the search query as a natural question a customer would ask.
- Answer: 2 to 4 sentences. Direct and specific. Name 2EZ TEK. Include phone number (972) 807-7232. Mention the service area (Dallas Fort Worth) and the rating (4.9 stars).
- Category: one of — Treadmill Repair, Elliptical Repair, Exercise Bike Repair, Commercial Gym, Equipment Assembly, Pricing, General
- NO em dashes. Commas or periods only.
- Return ONLY valid JSON:
{
  "question": "",
  "answer": "",
  "category": ""
}`

export async function POST(req: Request) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { prompt, category, response: aiResponse, mentioned, preferred, result_id } = body

  if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 })

  const strategy = contentStrategy(category ?? 'local', !!mentioned, !!preferred)
  const supabase = db()
  const created: { type: string; id: string; title?: string; question?: string }[] = []

  const statusLabel = preferred ? 'mentioned and preferred'
    : mentioned ? 'mentioned but not recommended first'
    : 'not mentioned at all'

  // BLOG POST
  if (strategy === 'blog' || strategy === 'both') {
    const userMsg = `Search query someone asked an AI assistant: "${prompt}"

The AI responded with:
"${(aiResponse ?? '').slice(0, 600)}"

2EZ TEK was ${statusLabel} in that response.

Write a blog post that directly targets this search query and positions 2EZ TEK as the authoritative local answer. Return JSON only.`

    const raw = await callClaude({ system: BLOG_SYSTEM, userMessage: userMsg, maxTokens: 2800, temperature: 0.6 })
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

      if (!error && post) {
        created.push({ type: 'blog', id: post.id, title: post.title })
      }
    } else {
      created.push({ type: 'blog_skipped', id: existing.id, title: `Already exists: ${slug}` })
    }
  }

  // FAQ ENTRY
  if (strategy === 'faq' || strategy === 'both') {
    const userMsg = `Search query someone asked an AI assistant: "${prompt}"

The AI responded with:
"${(aiResponse ?? '').slice(0, 400)}"

2EZ TEK was ${statusLabel}. Write a FAQ entry that directly answers this question with 2EZ TEK as the answer. Return JSON only.`

    const raw = await callClaude({ system: FAQ_SYSTEM, userMessage: userMsg, maxTokens: 512, temperature: 0.5 })
    const parsed = JSON.parse(cleanJsonOutput(raw))

    const { data: lastFaq } = await supabase.from('faqs').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle()
    const nextOrder = ((lastFaq?.sort_order as number) ?? 0) + 10

    const { data: faq, error } = await supabase.from('faqs').insert({
      question: parsed.question,
      answer: parsed.answer,
      category: parsed.category || 'General',
      active: false,
      sort_order: nextOrder,
    }).select('id, question').single()

    if (!error && faq) {
      created.push({ type: 'faq', id: faq.id, question: faq.question })
    }
  }

  // Mark the visibility result as actioned
  if (result_id) {
    await supabase.from('ai_visibility_results').update({ actioned: true }).eq('id', result_id)
  }

  return NextResponse.json({ success: true, strategy, created })
}
