// app/api/cron/auto-blog/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput, makeSlug } from '@/lib/claude'
import {
  isFacebookAutoPostEnabled,
  publishFacebookPagePost,
} from '@/lib/facebook'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

const BLOG_SYSTEM_PROMPT = `You are a working fitness equipment repair technician at 2EZ TEK in Dallas Fort Worth, TX. You have years of hands-on experience diagnosing and fixing treadmills, ellipticals, bikes, and strength equipment for homeowners and commercial gyms across DFW.

Write like a knowledgeable technician talking directly to a customer — clear, direct, and conversational. Not corporate. Not robotic.

Article structure:
1. Opening paragraph: Get straight to the problem the reader is facing. No fluff. Name the equipment and symptom in the first sentence.
2. What you're actually dealing with: 2-3 paragraphs explaining what causes this problem in plain language. Use real technical terms where they help (drive belt, motor control board, tension roller, incline actuator) but explain them naturally in context.
3. What not to do: One paragraph, written as advice from one person to another. No numbered lists.
4. When to call someone: One honest paragraph about when this crosses from DIY-possible to "you need a tech."
5. Two Q&A questions that real customers ask, written as natural conversation.
6. Closing: 2 sentences mentioning 2EZ TEK serves Dallas Fort Worth, known for fast response and strong reviews.

Writing rules — follow these strictly:
- NO em dashes (—). Use commas, periods, or rewrite the sentence instead.
- NO bullet points or numbered lists anywhere in the content field. Write every section as flowing paragraphs.
- NO phrases like: "it's worth noting", "furthermore", "moreover", "in conclusion", "delve into", "crucial", "vital", "it's important to", "let's explore", "when it comes to", "a testament to"
- NO headers like "What You Might Notice" or "Root Causes" or section labels — just write the content naturally
- Short paragraphs. 2-4 sentences each. Leave whitespace.
- Start sentences with the subject, not with "Additionally" or "However"
- Sound like a real person wrote this at 10pm after a long day of service calls

Technical accuracy:
- Use specific component names (e.g. "the walking belt", "the drive motor", "the reed switch")
- Mention real brand-specific quirks when relevant
- Mention Dallas Fort Worth naturally — not forced

Metadata rules:
- Title: clear, searchable, problem-focused
- seo_title: max 60 characters
- seo_description: max 160 characters
- excerpt: 1-2 sentences that make someone click
- hero_image_url must be one of:
  "/images/gym-equipment-repair-dallas.webp",
  "/images/commercial-gym-maintenance.webp",
  "/images/blog-gym-background.webp",
  "/images/about-smartgymops-support.webp",
  "/images/project-5.webp"
- Do not claim same-day service, say same-week
- Return ONLY valid JSON, no extra text`

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

  const userMessage = `Generate a blog article for this topic: ${finalTopic}
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
}`

  const outputText = await callClaude({
    system: BLOG_SYSTEM_PROMPT,
    userMessage,
    maxTokens: 2048,
    temperature: 0.6,
  })

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
    published: false,
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

    const { data: recentPosts } = await supabase
      .from('blog_posts')
      .select('slug')
      .order('created_at', { ascending: false })
      .limit(30)

    const recentSlugs = new Set((recentPosts || []).map((p) => p.slug))

    const available = POPULAR_TOPICS.filter((t) => {
      const slug = makeSlug(`${t.brand} ${t.equipment} ${t.issue} repair dallas`)
      return !recentSlugs.has(slug)
    })

    const topicPool = available.length > 0 ? available : POPULAR_TOPICS
    const topic = topicPool[Math.floor(Math.random() * topicPool.length)]

    const post = await generateBlogPost(topic)

    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', post.slug)
      .maybeSingle()

    if (existing) {
      post.slug = `${post.slug}-${Date.now()}`
    }

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
        published: false,
        created_at: new Date().toISOString(),
      })
      .select('id, slug')
      .single()

    if (saveError) throw new Error(saveError.message)

    const blogUrl = `https://www.2eztek.com/blog/${post.slug}`
    let facebookPostId: string | null = null
    let facebookPostError: string | null = null

    if (isFacebookAutoPostEnabled()) {
      try {
        const facebookPost = await publishFacebookPagePost({
          message: `${post.title}\n\n${post.excerpt}\n\nRead more: ${blogUrl}\n\nNeed fitness equipment repair or maintenance in Dallas Fort Worth? Call 2EZ TEK at (972) 807-7232.`,
          link: blogUrl,
        })
        facebookPostId = facebookPost.id
      } catch (error) {
        facebookPostError = error instanceof Error ? error.message : 'Facebook autopost failed.'
        console.error('FACEBOOK AUTOPOST ERROR:', error)
      }
    }

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
              <p><strong>URL:</strong> <a href="${blogUrl}">${blogUrl}</a></p>
              <p><strong>Facebook:</strong> ${facebookPostId ? `Posted (${facebookPostId})` : facebookPostError || 'Autopost disabled'}</p>
              <p><strong>Published:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST</p>
              <hr/>
              <p style="color:#666;font-size:14px">This post was auto-generated by 2EZ TEK AI Blog Engine (Claude Sonnet).</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({
      success: true,
      post: { id: saved.id, slug: saved.slug, title: post.title },
      facebook: {
        enabled: isFacebookAutoPostEnabled(),
        postId: facebookPostId,
        error: facebookPostError,
      },
    })
  } catch (error: any) {
    console.error('AUTO BLOG ERROR:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Auto blog failed' },
      { status: 500 }
    )
  }
}
