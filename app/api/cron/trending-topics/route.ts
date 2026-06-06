// app/api/cron/trending-topics/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput, makeSlug } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BASE_KEYWORDS = [
  'treadmill repair Dallas',
  'elliptical repair Dallas',
  'exercise bike repair Dallas',
  'gym equipment repair Dallas',
  'fitness equipment repair Dallas Fort Worth',
  'NordicTrack repair Dallas',
  'ProForm repair Dallas',
  'Life Fitness repair Dallas',
  'Precor repair Dallas',
  'Peloton repair Dallas',
  'treadmill belt replacement Dallas',
  'treadmill motor repair Dallas',
  'elliptical resistance repair Dallas',
  'home gym assembly Dallas',
  'commercial gym maintenance Dallas',
  'apartment gym repair Dallas',
  'hotel fitness center repair Dallas',
  'cable machine repair Dallas',
  'strength equipment repair Dallas',
  'StairMaster repair Dallas',
]

const TOPIC_EXTRACT_SYSTEM = `You are an SEO analyst for 2EZ TEK, a fitness equipment repair company in Dallas Fort Worth.

You identify specific blog post topics from Google search result titles that 2EZ TEK should write to capture local repair traffic.

Rules:
- Topics must be specific and actionable
- Include Dallas or Dallas Fort Worth naturally in each topic
- Focus on problems people are actively searching for
- Do not duplicate topics already covered by basic brand + repair combinations
- Return ONLY a valid JSON array of 2-3 specific blog topic strings, no extra text`

const TRENDING_BLOG_SYSTEM = `You are a working fitness equipment repair technician at 2EZ TEK in Dallas Fort Worth, TX. Write like you're talking directly to a customer who just searched this topic — clear, direct, no filler.

- NO em dashes (—). Use commas or periods instead.
- NO bullet points or numbered lists in the content. Write flowing paragraphs only.
- NO phrases like "it's worth noting", "furthermore", "in conclusion", "delve into", "crucial", "vital", "let's explore"
- Short paragraphs, 2-4 sentences each. Sound like a real person wrote this.
- 650-900 words
- Include Dallas Fort Worth naturally
- Mention 2EZ TEK as the local solution, not oversold
- hero_image_url must be one of:
  "/images/gym-equipment-repair-dallas.webp",
  "/images/commercial-gym-maintenance.webp",
  "/images/blog-gym-background.webp",
  "/images/about-smartgymops-support.webp",
  "/images/project-5.webp"
- seo_title max 60 chars
- seo_description max 160 chars
- Do not promise same-day service, say same-week
- Return ONLY valid JSON, no extra text`

async function searchForTrendingTopics(keyword: string): Promise<string[]> {
  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: keyword, num: 10 }),
    })
    if (!response.ok) return []
    const data = await response.json()
    const titles = (data.organic || []).map((r: any) => r.title || '')
    const paa = (data.peopleAlsoAsk || []).map((r: any) => r.question || '')
    return [...titles, ...paa].filter(Boolean)
  } catch {
    return []
  }
}

async function extractTrendingTopics(keyword: string, searchResults: string[]): Promise<string[]> {
  if (searchResults.length === 0) return []

  const userMessage = `Based on these Google search result titles for "${keyword}", identify specific blog post topics that 2EZ TEK should write about to capture this search traffic.

Search result titles:
${searchResults.slice(0, 8).join('\n')}

Return ONLY a valid JSON array of 2-3 specific blog topic strings. Each topic should be a complete blog post title targeting a specific repair keyword in Dallas Fort Worth.

Example format:
["NordicTrack Treadmill Belt Slipping in Dallas? Here's How to Fix It", "Why Your ProForm Treadmill Stops Mid-Workout in Dallas Fort Worth"]`

  const outputText = await callClaude({
    system: TOPIC_EXTRACT_SYSTEM,
    userMessage,
    maxTokens: 512,
    temperature: 0.6,
  })

  try {
    return JSON.parse(cleanJsonOutput(outputText))
  } catch {
    return []
  }
}

async function generateBlogPost(topic: string): Promise<any> {
  const userMessage = `Write a high-quality SEO blog article for this trending topic: "${topic}"

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
    system: TRENDING_BLOG_SYSTEM,
    userMessage,
    maxTokens: 2048,
    temperature: 0.6,
  })

  const parsed = JSON.parse(cleanJsonOutput(outputText))
  return {
    ...parsed,
    slug: makeSlug(parsed.title || topic),
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

    const { data: existingPosts } = await supabase
      .from('blog_posts')
      .select('slug, title')
      .order('created_at', { ascending: false })
      .limit(60)

    const existingSlugs = new Set((existingPosts || []).map((p) => p.slug))
    const existingTitles = (existingPosts || []).map((p) => p.title?.toLowerCase() || '')

    const shuffled = [...BASE_KEYWORDS].sort(() => Math.random() - 0.5).slice(0, 3)

    const trendingTopics: string[] = []

    for (const keyword of shuffled) {
      const searchResults = await searchForTrendingTopics(keyword)
      const topics = await extractTrendingTopics(keyword, searchResults)

      for (const topic of topics) {
        const slug = makeSlug(topic)
        const isDuplicate =
          existingSlugs.has(slug) ||
          existingTitles.some((t) => t.includes(topic.toLowerCase().slice(0, 30)))

        if (!isDuplicate && topic.length > 20) {
          trendingTopics.push(topic)
        }
      }

      await new Promise((r) => setTimeout(r, 300))
    }

    if (trendingTopics.length === 0) {
      return NextResponse.json({ success: true, message: 'No new trending topics found', published: 0 })
    }

    const toPublish = trendingTopics.slice(0, 2)
    const published: any[] = []

    for (const topic of toPublish) {
      try {
        const post = await generateBlogPost(topic)

        if (existingSlugs.has(post.slug)) {
          post.slug = `${post.slug}-${Date.now()}`
        }

        const { data: saved, error } = await supabase
          .from('blog_posts')
          .insert({
            title: post.title,
            slug: post.slug,
            category: post.category || 'Fitness Equipment Repair',
            excerpt: post.excerpt,
            content: post.content,
            seo_title: post.seo_title,
            seo_description: post.seo_description,
            hero_image_url: post.hero_image_url,
            gallery_images: [],
            published: false,
            created_at: new Date().toISOString(),
          })
          .select('id, slug, title')
          .single()

        if (!error && saved) {
          published.push({ ...saved, topic })
          existingSlugs.add(post.slug)
        }
      } catch (err) {
        console.error(`Failed to generate post for trending topic: ${topic}`, err)
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
          subject: `Trending Topics Report: ${published.length} posts published`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:600px">
              <h2 style="color:#0891B2">Weekly Trending Topics Report</h2>
              <p>Found <strong>${trendingTopics.length} trending topics</strong> from Google search data.</p>
              <p>Auto-published <strong>${published.length} new blog posts</strong> targeting trending searches.</p>
              <h3 style="margin-top:24px">All Trending Topics Found</h3>
              <ul>${trendingTopics.map((t) => `<li>${t}</li>`).join('')}</ul>
              ${published.length > 0 ? `
                <h3 style="margin-top:24px">Posts Published</h3>
                ${published.map((p) => `
                  <div style="margin-bottom:12px;padding:12px;background:#f7f7f7;border-radius:8px">
                    <strong>${p.title}</strong><br/>
                    <a href="https://www.2eztek.com/blog/${p.slug}">View Post →</a>
                  </div>
                `).join('')}
              ` : ''}
              <hr style="margin-top:24px"/>
              <p style="color:#666;font-size:13px">Auto-generated by 2EZ TEK Trending Topics Engine (Claude Sonnet). Runs every Friday at 10am UTC.</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({
      success: true,
      trending: trendingTopics.length,
      published: published.length,
      posts: published,
    })
  } catch (error: any) {
    console.error('TRENDING TOPICS ERROR:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
