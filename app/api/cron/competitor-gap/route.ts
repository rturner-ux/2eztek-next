// app/api/cron/competitor-gap/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Main competitors to analyze
const COMPETITORS = [
  'fitnessmachinetech.com',
  'servicefirstfitness.com',
  'fitnessrepair.com',
  'treadmillrepairman.com',
]

// Keywords to check gap opportunities
const SEED_KEYWORDS = [
  'treadmill repair Dallas',
  'elliptical repair Dallas',
  'exercise bike repair Dallas',
  'gym equipment repair Dallas Fort Worth',
  'NordicTrack repair Dallas',
  'ProForm treadmill repair Dallas',
  'Life Fitness repair Dallas',
  'Precor repair Dallas',
  'commercial gym maintenance Dallas',
  'fitness equipment assembly Dallas',
  'treadmill belt replacement Dallas',
  'treadmill motor repair Dallas',
  'elliptical resistance repair Dallas',
  'home gym assembly Dallas',
  'peloton repair Dallas',
  'bowflex repair Dallas',
  'matrix treadmill repair Dallas',
  'cybex repair Dallas',
  'stairmaster repair Dallas',
  'cable machine repair Dallas',
  'strength equipment repair Dallas',
  'apartment gym maintenance Dallas',
  'hotel gym maintenance Dallas',
  'fitness equipment relocation Dallas',
  'preventative maintenance gym Dallas',
]

async function searchGoogle(query: string): Promise<any[]> {
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_CX}&q=${encodeURIComponent(query)}&num=10`
    const response = await fetch(url)
    if (!response.ok) return []
    const data = await response.json()
    return data.items || []
  } catch {
    return []
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return ''
  }
}

async function analyzeKeywordGap(): Promise<Array<{ keyword: string; competitorRanks: boolean; ourRank: number | null }>> {
  const gaps: Array<{ keyword: string; competitorRanks: boolean; ourRank: number | null }> = []

  // Sample a subset of keywords to stay within API quota (100/day free)
  const sampleSize = Math.min(10, SEED_KEYWORDS.length)
  const shuffled = [...SEED_KEYWORDS].sort(() => Math.random() - 0.5).slice(0, sampleSize)

  for (const keyword of shuffled) {
    const results = await searchGoogle(keyword)
    if (results.length === 0) continue

    const domains = results.map((r: any) => extractDomain(r.link))

    // Check if any competitor ranks in top 10
    const competitorRanks = COMPETITORS.some((c) =>
      domains.some((d) => d.includes(c.replace('www.', '')))
    )

    // Check where 2EZ TEK ranks
    const ourIndex = domains.findIndex((d) => d.includes('2eztek.com'))
    const ourRank = ourIndex === -1 ? null : ourIndex + 1

    // It's a gap if competitor ranks but we don't (or rank below position 5)
    if (competitorRanks && (ourRank === null || ourRank > 5)) {
      gaps.push({ keyword, competitorRanks, ourRank })
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  return gaps
}

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

async function generateBlogPostForGap(keyword: string): Promise<any> {
  const prompt = `You are an SEO expert writing for 2EZ TEK, a professional fitness equipment repair company in Dallas Fort Worth.

Write a high-quality SEO blog article targeting this keyword gap: "${keyword}"

This keyword is one where competitors outrank 2EZ TEK. Write content that is more helpful, more detailed, and more locally relevant than typical competitor content.

Return ONLY valid JSON:
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
- Title should naturally include the keyword
- Content 700-1000 words, well structured with headings
- Include specific Dallas Fort Worth local context
- Mention 2EZ TEK naturally as the solution
- hero_image_url must be one of:
  "/images/gym-equipment-repair-dallas.webp",
  "/images/commercial-gym-maintenance.webp",
  "/images/blog-gym-background.webp",
  "/images/about-smartgymops-support.webp",
  "/images/project-5.webp"
- seo_title max 60 chars
- seo_description max 160 chars
- Do not promise same-day service, say same-week
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

  const outputText =
    data.output_text ||
    data.output?.flatMap((i: any) => i.content || [])?.map((c: any) => c.text || '')?.join('') ||
    ''

  if (!outputText) throw new Error('No AI output')

  const parsed = JSON.parse(cleanJsonOutput(outputText))
  return {
    ...parsed,
    slug: makeSlug(parsed.title || keyword),
    gallery_images: [],
    published: true,
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

    // Step 1: Find keyword gaps
    const gaps = await analyzeKeywordGap()

    if (gaps.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No keyword gaps found this run',
        gaps: 0,
        posts: 0,
      })
    }

    // Step 2: Generate blog posts for top gaps (max 2 per run to save API quota)
    const topGaps = gaps.slice(0, 2)
    const published: any[] = []

    // Get existing slugs to avoid duplicates
    const { data: existingPosts } = await supabase
      .from('blog_posts')
      .select('slug')
      .order('created_at', { ascending: false })
      .limit(50)

    const existingSlugs = new Set((existingPosts || []).map((p) => p.slug))

    for (const gap of topGaps) {
      try {
        const post = await generateBlogPostForGap(gap.keyword)

        // Avoid duplicate slugs
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
            published: true,
            created_at: new Date().toISOString(),
          })
          .select('id, slug, title')
          .single()

        if (!error && saved) {
          published.push({
            ...saved,
            keyword: gap.keyword,
            ourPreviousRank: gap.ourRank,
          })
          existingSlugs.add(post.slug)
        }
      } catch (err) {
        console.error(`Failed to generate post for: ${gap.keyword}`, err)
      }
    }

    // Step 3: Email summary
    if (process.env.RESEND_API_KEY && (gaps.length > 0 || published.length > 0)) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: `Competitor Gap Report: ${gaps.length} gaps found, ${published.length} posts published`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:600px">
              <h2 style="color:#0891B2">Weekly Competitor Gap Report</h2>
              <p>Found <strong>${gaps.length} keyword gaps</strong> where competitors outrank 2EZ TEK.</p>
              <p>Auto-published <strong>${published.length} new blog posts</strong> targeting those gaps.</p>

              <h3 style="margin-top:24px">Keyword Gaps Found</h3>
              <table style="width:100%;border-collapse:collapse">
                <tr style="background:#f0f9ff">
                  <th style="padding:8px;text-align:left;border:1px solid #ddd">Keyword</th>
                  <th style="padding:8px;text-align:left;border:1px solid #ddd">Our Rank</th>
                </tr>
                ${gaps.map((g) => `
                  <tr>
                    <td style="padding:8px;border:1px solid #ddd">${g.keyword}</td>
                    <td style="padding:8px;border:1px solid #ddd">${g.ourRank ? `#${g.ourRank}` : 'Not ranking'}</td>
                  </tr>
                `).join('')}
              </table>

              ${published.length > 0 ? `
                <h3 style="margin-top:24px">Posts Published</h3>
                ${published.map((p) => `
                  <div style="margin-bottom:12px;padding:12px;background:#f7f7f7;border-radius:8px">
                    <strong>${p.title}</strong><br/>
                    <small>Targeting: ${p.keyword}</small><br/>
                    <a href="https://www.2eztek.com/blog/${p.slug}">View Post →</a>
                  </div>
                `).join('')}
              ` : ''}

              <hr style="margin-top:24px"/>
              <p style="color:#666;font-size:13px">Auto-generated by 2EZ TEK Competitor Gap Engine. Runs every Wednesday at 10am UTC.</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({
      success: true,
      gaps: gaps.length,
      posts: published.length,
      published,
    })
  } catch (error: any) {
    console.error('COMPETITOR GAP ERROR:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Competitor gap analysis failed' },
      { status: 500 }
    )
  }
}