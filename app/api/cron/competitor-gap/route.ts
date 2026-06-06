// app/api/cron/competitor-gap/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput, makeSlug } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COMPETITORS = [
  'fitnessmachinetech.com',
  'servicefirst-tx.com',
  'servicefirstfitness.com',
  'fitnessrepair.com',
  'treadmillrepairman.com',
  'repairfitness.com',
  'fitnesstech.com',
  'garagegymreviews.com',
]

const IGNORE_DOMAINS = [
  'yelp.com', 'google.com', 'facebook.com', 'thumbtack.com', 'angi.com',
  'homeadvisor.com', 'angieslist.com', 'amazon.com', 'reddit.com',
  'homedepot.com', 'lowes.com', 'youtube.com', 'heygoldie.com',
  'onepeloton.com', 'nordictrack.com', 'proform.com', 'lifefitness.com',
  'precor.com', 'bowflex.com', 'nautilus.com', 'airtasker.com',
]

// Core seeds used only for keyword discovery — not the scan list itself
const DISCOVERY_SEEDS = [
  'treadmill repair Dallas',
  'gym equipment repair Dallas Fort Worth',
  'fitness equipment service Dallas',
  'elliptical repair DFW',
  'commercial gym maintenance Dallas',
]

// Fallback pool if the DB table is empty on first run
const FALLBACK_KEYWORDS = [
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

const GAP_BLOG_SYSTEM_PROMPT = `You are a senior SEO content strategist for 2EZ TEK, a highly rated fitness equipment repair company in Dallas Fort Worth, TX.

You write competitor-beating blog content that is more specific, more technically accurate, and more locally relevant than what competitors currently rank for.

Article structure (use this exact format):
1. Introduction: Address the searcher's problem directly, 2-3 sentences with primary keyword
2. Common Symptoms: Bulleted list of 4-6 specific symptoms
3. Root Causes: Numbered list of 3-5 causes with technical detail
4. What NOT To Do: 2-3 common mistakes
5. Professional Repair in DFW: Why local expert service matters, mention 2EZ TEK
6. FAQ: 2 questions about this specific keyword/topic
7. Closing CTA: Direct to 2EZ TEK

Rules:
- Title should naturally include the target keyword and a DFW location signal
- 800-1000 words — long enough to outrank thin competitor pages
- Use specific technical terminology to signal expertise
- Mention Dallas Fort Worth multiple times naturally
- hero_image_url must be one of:
  "/images/gym-equipment-repair-dallas.webp",
  "/images/commercial-gym-maintenance.webp",
  "/images/blog-gym-background.webp",
  "/images/about-smartgymops-support.webp",
  "/images/project-5.webp"
- seo_title max 60 chars, include keyword + DFW
- seo_description max 160 chars
- Do not promise same-day service, say same-week
- Return ONLY valid JSON, no extra text`

function isFitnessRepairKeyword(query: string): boolean {
  const q = query.toLowerCase()
  const hasFitness = /treadmill|elliptical|bike|cycling|gym|fitness|exercise|equipment|peloton|nordictrack|proform|bowflex|precor|stairmaster|rowing|rower|strength|cable|weight|cardio|machine/.test(q)
  const hasService = /repair|fix|service|maintenance|assembly|install|technician|tech|replace|broken|not working/.test(q)
  const hasLocation = /dallas|fort worth|dfw|tx\b|texas|arlington|plano|frisco|mckinney|irving|garland|mesquite|richardson|allen|carrollton/.test(q)
  // Must mention fitness/equipment AND (a service term OR a location)
  return hasFitness && (hasService || hasLocation)
}

async function serperSearch(query: string): Promise<any> {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 10 }),
  })
  if (!response.ok) return null
  return response.json()
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return ''
  }
}

async function discoverKeywords(): Promise<string[]> {
  const discovered = new Set<string>()

  for (const seed of DISCOVERY_SEEDS) {
    try {
      const data = await serperSearch(seed)
      if (!data) continue

      const candidates = [
        ...(data.relatedSearches || []).map((r: any) => r.query as string),
        ...(data.peopleAlsoAsk || []).map((r: any) => r.question as string),
      ]

      for (const kw of candidates) {
        if (kw && isFitnessRepairKeyword(kw)) {
          discovered.add(kw.trim())
        }
      }

      await new Promise(r => setTimeout(r, 300))
    } catch {
      // continue if one seed fails
    }
  }

  return Array.from(discovered)
}

async function loadKeywordPool(supabase: ReturnType<typeof createClient>): Promise<string[]> {
  const { data } = await supabase
    .from('keyword_pool')
    .select('keyword')
    .eq('active', true)
    .order('last_scanned_at', { ascending: true, nullsFirst: true })
    .limit(200)

  return (data || []).map((r: any) => r.keyword)
}

async function saveDiscoveredKeywords(
  supabase: ReturnType<typeof createClient>,
  keywords: string[]
): Promise<number> {
  if (keywords.length === 0) return 0
  const rows = keywords.map(kw => ({
    keyword: kw,
    source: 'serper-related',
    discovered_at: new Date().toISOString(),
    active: true,
  }))
  const { error } = await supabase
    .from('keyword_pool')
    .upsert(rows, { onConflict: 'keyword', ignoreDuplicates: true })
  return error ? 0 : keywords.length
}

async function markScanned(supabase: ReturnType<typeof createClient>, keywords: string[]) {
  if (keywords.length === 0) return
  await supabase
    .from('keyword_pool')
    .update({ last_scanned_at: new Date().toISOString() })
    .in('keyword', keywords)
}

async function analyzeKeywordGap(
  keywords: string[]
): Promise<Array<{ keyword: string; competitorRanks: boolean; ourRank: number | null; competitorRank: number | null; competitorDomain: string | null }>> {
  const gaps: Array<{ keyword: string; competitorRanks: boolean; ourRank: number | null; competitorRank: number | null; competitorDomain: string | null }> = []

  // Prioritise keywords not recently scanned — pool is already sorted that way
  const sample = keywords.slice(0, 12)

  for (const keyword of sample) {
    const data = await serperSearch(keyword)
    if (!data) continue

    const organic: any[] = data.organic || []
    const domains = organic.map((r: any) => extractDomain(r.link))
    const ourIndex = domains.findIndex((d) => d.includes('2eztek.com'))
    const ourRank = ourIndex === -1 ? null : ourIndex + 1

    if (ourRank === null || ourRank > 5) {
      const competitorMatches = COMPETITORS.map(c => c.replace('www.', '')).flatMap(competitor => {
        const idx = domains.findIndex(d => d === competitor || d.endsWith(`.${competitor}`))
        return idx === -1 ? [] : [{ competitor, rank: idx + 1 }]
      })
      const bestKnown = competitorMatches.sort((a, b) => a.rank - b.rank)[0] || null

      const topRival = bestKnown || (() => {
        const idx = domains.findIndex(d => !d.includes('2eztek.com') && !IGNORE_DOMAINS.some(ig => d.includes(ig)))
        return idx === -1 ? null : { competitor: domains[idx], rank: idx + 1 }
      })()

      gaps.push({
        keyword,
        competitorRanks: !!topRival,
        ourRank,
        competitorRank: topRival?.rank ?? null,
        competitorDomain: topRival?.competitor ?? null,
      })
    }

    await new Promise(r => setTimeout(r, 250))
  }

  return gaps
}

async function generateBlogPostForGap(keyword: string): Promise<any> {
  const userMessage = `Write a high-quality SEO blog article targeting this keyword gap: "${keyword}"

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
}`

  const outputText = await callClaude({
    system: GAP_BLOG_SYSTEM_PROMPT,
    userMessage,
    maxTokens: 2048,
    temperature: 0.6,
  })

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

    // 1. Discover new keywords from Serper related searches
    const discovered = await discoverKeywords()
    const savedCount = await saveDiscoveredKeywords(supabase, discovered)

    // 2. Load keyword pool from DB (sorted by least-recently scanned)
    let pool = await loadKeywordPool(supabase)

    // Fall back to hardcoded list if table is empty
    if (pool.length === 0) {
      pool = FALLBACK_KEYWORDS
    }

    // 3. Run gap analysis on the pool
    const gaps = await analyzeKeywordGap(pool)

    // Mark scanned keywords
    await markScanned(supabase, pool.slice(0, 12))

    // 4. Persist ranking data
    if (gaps.length > 0) {
      const rankingRows = gaps.map(g => ({
        keyword: g.keyword,
        our_rank: g.ourRank,
        competitor_domain: g.competitorDomain,
        competitor_rank: g.competitorRank,
        checked_at: new Date().toISOString(),
      }))
      await supabase.from('competitor_rankings').insert(rankingRows)
    }

    if (gaps.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No keyword gaps found this run',
        gaps: 0,
        posts: 0,
        discovered: savedCount,
        poolSize: pool.length,
      })
    }

    // 5. Generate blog posts for top 2 gaps
    const topGaps = gaps.slice(0, 2)
    const published: any[] = []

    const { data: existingPosts } = await supabase
      .from('blog_posts')
      .select('slug')
      .order('created_at', { ascending: false })
      .limit(50)

    const existingSlugs = new Set((existingPosts || []).map((p: any) => p.slug))

    for (const gap of topGaps) {
      try {
        const post = await generateBlogPostForGap(gap.keyword)
        if (existingSlugs.has(post.slug)) post.slug = `${post.slug}-${Date.now()}`

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
          published.push({ ...saved, keyword: gap.keyword, ourPreviousRank: gap.ourRank })
          existingSlugs.add(post.slug)
        }
      } catch (err) {
        console.error(`Failed to generate post for: ${gap.keyword}`, err)
      }
    }

    // 6. Send email report
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
          subject: `Competitor Gap Report: ${gaps.length} gaps found, ${published.length} posts published`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:600px">
              <h2 style="color:#0891B2">Weekly Competitor Gap Report</h2>
              <p>Keyword pool: <strong>${pool.length} keywords</strong> (${savedCount} newly discovered this run).</p>
              <p>Found <strong>${gaps.length} keyword gaps</strong> where competitors outrank 2EZ TEK.</p>
              <p>Auto-published <strong>${published.length} new blog posts</strong> targeting those gaps.</p>
              <h3 style="margin-top:24px">Keyword Gaps Found</h3>
              <table style="width:100%;border-collapse:collapse">
                <tr style="background:#f0f9ff">
                  <th style="padding:8px;text-align:left;border:1px solid #ddd">Keyword</th>
                  <th style="padding:8px;text-align:left;border:1px solid #ddd">Our Rank</th>
                  <th style="padding:8px;text-align:left;border:1px solid #ddd">Top Competitor</th>
                </tr>
                ${gaps.map(g => `
                  <tr>
                    <td style="padding:8px;border:1px solid #ddd">${g.keyword}</td>
                    <td style="padding:8px;border:1px solid #ddd">${g.ourRank ? `#${g.ourRank}` : 'Not ranking'}</td>
                    <td style="padding:8px;border:1px solid #ddd">${g.competitorDomain ? `${g.competitorDomain} #${g.competitorRank}` : '—'}</td>
                  </tr>
                `).join('')}
              </table>
              ${published.length > 0 ? `
                <h3 style="margin-top:24px">Posts Published</h3>
                ${published.map(p => `
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
      discovered: savedCount,
      poolSize: pool.length,
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
