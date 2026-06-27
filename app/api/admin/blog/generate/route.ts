import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput, makeSlug } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BLOG_SYSTEM_PROMPT = `You are a working fitness equipment repair technician at 2EZ TEK in Dallas Fort Worth, TX. You have years of hands-on experience diagnosing and fixing treadmills, ellipticals, bikes, and strength equipment for homeowners and commercial gyms across DFW.

Write a comprehensive repair guide — 900 to 1200 words — that genuinely helps someone understand what is wrong with their equipment and what to do about it. Use specific technical terms and real brand knowledge.

Format the content field as structured HTML using these exact tags: <h2>, <h3>, <ul>, <ol>, <li>, <p>, <strong>. Do not use <html>, <head>, or <body> tags.

Use this structure:
1. <p> Opening paragraph: Name the equipment and symptom in the first sentence. Address the problem directly with no fluff.
2. <h2>Common Symptoms</h2> <ul> with 5-7 <li> items. Bold the symptom name with <strong>, then explain it in a phrase.
3. <h2>Root Causes: What Is Actually Happening</h2> <ol> with 4-6 <li> items. Bold the cause with <strong>, then write 2-3 sentences explaining it in plain language with real component names.
4. <h2>What NOT to Do</h2> <ul> with 3-4 <li> items. Bold the mistake with <strong>, then explain why it makes things worse.
5. <h2>Professional [Equipment Type] Repair in Dallas Fort Worth</h2> 2-3 <p> paragraphs. Explain why 2EZ TEK is the right choice. Mention fast response, 500-plus five-star reviews, and that we service all major brands. Name brands like NordicTrack, ProForm, Life Fitness, Precor. Mention same-week service. In one sentence, naturally mention that 2EZ TEK also maintains a free manual library at 2eztek.com/manuals where owners can find assembly guides, service docs, and owner manuals for their equipment.
6. <h2>Frequently Asked Questions</h2> 2-3 <h3> questions with <p> answers. Questions should sound like real things a customer would ask before booking.
7. <h2>Get Your [Equipment] Running Again</h2> <p> 1-2 sentences with a direct CTA mentioning 2EZ TEK and Dallas Fort Worth.

Writing rules — follow these strictly:
- NO em dashes (—). Use commas or periods instead.
- NO phrases like: "it's worth noting", "furthermore", "moreover", "in conclusion", "delve into", "crucial", "vital", "it's important to", "let's explore", "when it comes to", "a testament to", "look no further"
- Use real component names: walking belt, drive motor, motor control board, reed switch, tension roller, incline actuator, flywheel, resistance magnet, eddy current brake
- Mention Dallas Fort Worth naturally where it fits
- Do not promise same-day service, say same-week
- Sound like a technician who has seen this problem a hundred times, not a content writer
- Write for RESIDENTIAL homeowners with personal fitness equipment in their home or garage gym, not facility managers. Most people searching "[brand] repair near me" have a machine at home. Many competitors ignore residential clients or focus only on commercial gyms. 2EZ TEK is different — we welcome homeowners. Make this clear naturally in the professional repair section.

Metadata rules:
- title: clear, searchable, problem-focused — MUST include the brand name
- seo_title: max 60 characters
- seo_description: max 160 characters
- excerpt: 1-2 sentences that make someone click
- hero_image_url: leave as empty string ""
- Return ONLY valid JSON, no extra text`

async function fetchPexelsImage(equipment: string): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY
  if (!key) return null

  const query = encodeURIComponent(`${equipment} gym fitness equipment`)
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=5&orientation=landscape`,
      { headers: { Authorization: key } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.photos?.length) return null
    const pick = data.photos[Math.floor(Math.random() * Math.min(data.photos.length, 5))]
    return (pick.src?.large as string) ?? null
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_BLOG_PASSWORD) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await req.json()
  const { brand, equipment, issue, freeform } = body

  if (!brand && !freeform) {
    return NextResponse.json({ success: false, message: 'Provide brand+equipment+issue or freeform topic' }, { status: 400 })
  }

  const topicLabel = freeform || `${brand} ${equipment} ${issue} repair in Dallas Fort Worth`

  const userMessage = `Generate a blog article for this specific repair topic: ${topicLabel}

${brand ? `TITLE REQUIREMENT: The title MUST include the brand name "${brand}". Do NOT write a generic title.` : ''}
${brand ? `Brand: ${brand}` : ''}
${equipment ? `Equipment: ${equipment}` : ''}
${issue ? `Issue: ${issue}` : ''}
City: Dallas Fort Worth, TX

Return ONLY valid JSON with this exact shape:
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
    system: BLOG_SYSTEM_PROMPT,
    userMessage,
    maxTokens: 3500,
    temperature: 0.6,
  })

  const parsed = JSON.parse(cleanJsonOutput(outputText))
  const title = parsed.title || topicLabel
  const slug = makeSlug(title)

  if (brand && !title.toLowerCase().includes(brand.toLowerCase())) {
    return NextResponse.json({ success: false, message: `Generated title missing brand "${brand}" — try again` }, { status: 422 })
  }

  const { data: existing } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ success: false, message: `Slug "${slug}" already exists` }, { status: 409 })
  }

  const heroImage = await fetchPexelsImage(equipment || 'treadmill fitness')

  const { data: saved, error } = await supabase
    .from('blog_posts')
    .insert({
      title,
      slug,
      category: parsed.category || (brand ? `${brand} Repair` : 'Fitness Equipment Repair'),
      excerpt: parsed.excerpt || '',
      content: parsed.content || '',
      seo_title: parsed.seo_title || `${title} | 2EZ TEK`,
      seo_description: parsed.seo_description || parsed.excerpt || '',
      hero_image_url: heroImage || parsed.hero_image_url || '/images/gym-equipment-repair-dallas.webp',
      gallery_images: [],
      published: false,
      created_at: new Date().toISOString(),
    })
    .select('id, slug, title')
    .single()

  if (error) throw new Error(error.message)

  return NextResponse.json({ success: true, post: saved })
}
