// app/api/cron/auto-blog/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Popular equipment combos to rotate through
const POPULAR_TOPICS = [
  { brand: 'NordicTrack', issue: 'belt slipping', equipment: 'treadmill' },
  { brand: 'NordicTrack', issue: 'incline not working', equipment: 'treadmill' },
  { brand: 'NordicTrack', issue: 'error code', equipment: 'treadmill' },
  { brand: 'ProForm', issue: 'belt slipping', equipment: 'treadmill' },
  { brand: 'ProForm', issue: 'motor problems', equipment: 'treadmill' },
  { brand: 'Life Fitness', issue: 'console not working', equipment: 'treadmill' },
  { brand: 'Life Fitness', issue: 'resistance not working', equipment: 'elliptical' },
  { brand: 'Precor', issue: 'error code', equipment: 'treadmill' },
  { brand: 'Precor', issue: 'incline motor failure', equipment: 'treadmill' },
  { brand: 'Bowflex', issue: 'cable broken', equipment: 'home gym' },
  { brand: 'Bowflex', issue: 'resistance not working', equipment: 'elliptical' },
  { brand: 'Peloton', issue: 'screen not working', equipment: 'bike' },
  { brand: 'Peloton', issue: 'resistance not adjusting', equipment: 'bike' },
  { brand: 'Matrix', issue: 'console error', equipment: 'treadmill' },
  { brand: 'Matrix', issue: 'belt worn out', equipment: 'treadmill' },
  { brand: 'Cybex', issue: 'resistance failure', equipment: 'elliptical' },
  { brand: 'StairMaster', issue: 'steps not moving', equipment: 'stairmaster' },
  { brand: 'Schwinn', issue: 'resistance not working', equipment: 'bike' },
  { brand: 'Technogym', issue: 'console not responding', equipment: 'treadmill' },
  { brand: 'TRUE Fitness', issue: 'belt slipping', equipment: 'treadmill' },
  { brand: 'Nautilus', issue: 'cable snapped', equipment: 'home gym' },
  { brand: 'Star Trac', issue: 'belt issue', equipment: 'treadmill' },
  { brand: 'FreeMotion', issue: 'cable pulley broken', equipment: 'cable machine' },
  { brand: 'Hammer Strength', issue: 'weight stack problem', equipment: 'strength machine' },
]

function makeSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function cleanJsonOutput(text: string) {
  return text
    .replace(/^```json/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim()
}

function getOutputText(data: any) {
  return (
    data.output_text ||
    data.output
      ?.flatMap((item: any) => item.content || [])
      ?.map((c: any) => c.text || '')
      ?.join('') ||
    ''
  )
}

async function fetchManualContext(brand: string, issue: string): Promise<string> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: manuals } = await supabase
      .from('equipment_manuals_v2')
      .select('slug, description, manual_type')
      .ilike('slug', `%${brand.toLowerCase().replace(/\s+/g, '-')}%`)
      .limit(6)

    if (!manuals || manuals.length === 0) return ''

    return `\nRelevant equipment documentation from 2EZ TEK manuals library:\n` +
      manuals.map((m) => `- ${m.slug} (${m.manual_type || 'Manual'}): ${m.description || 'Documentation available'}`).join('\n')
  } catch {
    return ''
  }
}

async function generateBlogPost(topic: typeof POPULAR_TOPICS[0], city = 'Dallas') {
  const finalTopic = `${topic.brand} ${topic.equipment} ${topic.issue} repair in ${city}`
  const manualContext = await fetchManualContext(topic.brand, topic.issue)

  const prompt = `
Create a professional SEO blog article for 2EZ TEK, a fitness equipment repair company in Dallas Fort Worth.

Topic: ${finalTopic}
Brand: ${topic.brand}
Issue: ${topic.issue}
Equipment: ${topic.equipment}
City: ${city}
${manualContext ? manualContext + '\n\nUse the above documentation to write a technically accurate article.' : ''}

Return ONLY valid JSON with this exact shape:
{
  "title": "",
  "category": "",
  "excerpt": "",
  "content": "",
  "seo_title": "",
  "seo_description": "",
  "hero_image_url": ""
}

Rules:
- Write like an experienced fitness equipment repair company in Dallas Fort Worth
- Title should be clear and searchable e.g. "NordicTrack Treadmill Belt Slipping? Here's What To Do"
- Content should be 600-900 words, use paragraphs and numbered sections
- Include symptoms, possible causes, when to call a technician, and a soft CTA for 2EZ TEK
- Mention Dallas Fort Worth naturally
- hero_image_url must be one of:
  "/images/gym-equipment-repair-dallas.webp",
  "/images/commercial-gym-maintenance.webp",
  "/images/blog-gym-background.webp",
  "/images/about-smartgymops-support.webp",
  "/images/project-5.webp"
- seo_title max 60 characters
- seo_description max 160 characters
- Do not claim same-day service, say same-week
- Do not make unsupported guarantees
`

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: prompt,
      temperature: 0.6,
    }),
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data?.error?.message || 'OpenAI failed')

  const outputText = getOutputText(data)
  if (!outputText) throw new Error('No AI output')

  const parsed = JSON.parse(cleanJsonOutput(outputText))
  const title = parsed.title || finalTopic
  const slug = makeSlug(title)

  return {
    title,
    slug,
    category: parsed.category || `${topic.brand} Repair`,
    excerpt: parsed.excerpt || '',
    content: parsed.content || '',
    seo_title: parsed.seo_title || `${title} | 2EZ TEK`,
    seo_description: parsed.seo_description || parsed.excerpt || '',
    hero_image_url: parsed.hero_image_url || '/images/gym-equipment-repair-dallas.webp',
    gallery_images: [],
    published: true,
  }
}

export async function GET(request: Request) {
  try {
    // Verify this is called by Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get recently used slugs to avoid duplicates
    const { data: recentPosts } = await supabase
      .from('blog_posts')
      .select('slug')
      .order('created_at', { ascending: false })
      .limit(30)

    const recentSlugs = new Set((recentPosts || []).map((p) => p.slug))

    // Pick a topic we haven't used recently
    const available = POPULAR_TOPICS.filter((t) => {
      const slug = makeSlug(`${t.brand} ${t.equipment} ${t.issue} repair dallas`)
      return !recentSlugs.has(slug)
    })

    // Fallback to any topic if all have been used
    const topicPool = available.length > 0 ? available : POPULAR_TOPICS
    const topic = topicPool[Math.floor(Math.random() * topicPool.length)]

    // Generate the blog post
    const post = await generateBlogPost(topic)

    // Check slug isn't already taken
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', post.slug)
      .maybeSingle()

    if (existing) {
      // Add timestamp to make unique
      post.slug = `${post.slug}-${Date.now()}`
    }

    // Save to Supabase
    const { data: saved, error: saveError } = await supabase
      .from('blog_posts')
      .insert({
        title: post.title,
        slug: post.slug,
        category: post.category,
        excerpt: post.excerpt,
        content: post.content,
        seo_title: post.seo_title,
        seo_description: post.seo_description,
        hero_image_url: post.hero_image_url,
        gallery_images: [],
        published: true,
        created_at: new Date().toISOString(),
      })
      .select('id, slug')
      .single()

    if (saveError) throw new Error(saveError.message)

    // Send email notification
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
          subject: `Auto Blog Published: ${post.title}`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:600px">
              <h2 style="color:#0891B2">New Blog Post Auto-Published</h2>
              <p><strong>Title:</strong> ${post.title}</p>
              <p><strong>Category:</strong> ${post.category}</p>
              <p><strong>Excerpt:</strong> ${post.excerpt}</p>
              <p><strong>URL:</strong> <a href="https://www.2eztek.com/blog/${post.slug}">https://www.2eztek.com/blog/${post.slug}</a></p>
              <p><strong>Published:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST</p>
              <hr/>
              <p style="color:#666;font-size:14px">This post was auto-generated by 2EZ TEK AI Blog Engine.</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({
      success: true,
      post: { id: saved.id, slug: saved.slug, title: post.title },
    })
  } catch (error: any) {
    console.error('AUTO BLOG ERROR:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Auto blog failed' },
      { status: 500 }
    )
  }
}