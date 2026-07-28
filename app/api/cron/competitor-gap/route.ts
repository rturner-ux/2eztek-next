// app/api/cron/competitor-gap/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput, makeSlug } from '@/lib/claude'
import { fetchTopQueries } from '@/lib/gsc'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COMPETITORS = [
  'fitnessmachinetechnicians.com',
  'fitnessmachinetech.com',
  'servicefirst-tx.com',
  'servicefirstfitness.com',
  'fitnessrepair.com',
  'treadmillrepairman.com',
  'repairfitness.com',
  'fitnesstech.com',
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
  'treadmill repair Fort Worth',
  'fitness equipment repair Fort Worth TX',
  'StairMaster repair Fort Worth',
  'ProForm treadmill repair Fort Worth',
  'gym equipment service near 76137',
  'best rated treadmill repair Dallas',
  'fast response fitness equipment repair DFW',
  'reliable gym equipment technician Dallas Fort Worth',
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

const GAP_BLOG_SYSTEM_PROMPT = `You are a working fitness equipment repair technician at 2EZ TEK in Dallas Fort Worth, TX. You have years of hands-on experience and your customers consistently choose you over larger franchise competitors because you respond fast and do the job right.

Write a comprehensive repair or service guide — 900 to 1200 words — that genuinely helps someone who just searched this keyword. Give them real information, not marketing copy.

Format the content field as structured HTML using these exact tags: <h2>, <h3>, <ul>, <ol>, <li>, <p>, <strong>. Do not use <html>, <head>, or <body> tags.

Use this structure:
1. <p> Opening paragraph: Address the exact search intent immediately. Name the equipment or service in the first sentence. No fluff.
2. <h2>Common Symptoms</h2> <ul> with 5-7 <li> items. Bold the symptom with <strong>, then explain it briefly.
3. <h2>Root Causes: What Is Actually Happening</h2> <ol> with 4-6 <li> items. Bold the cause with <strong>, then write 2-3 sentences explaining it with real component names.
4. <h2>What NOT to Do</h2> <ul> with 3-4 <li> items. Bold the mistake with <strong>, then explain why it makes the problem worse.
5. <h2>Professional [Service] in Dallas Fort Worth</h2> 2-3 <p> paragraphs. Explain why 2EZ TEK beats the national franchise options. Mention 500-plus five-star reviews, fast response, same-week service. Name brands we service.
6. <h2>Frequently Asked Questions</h2> 2-3 <h3> questions with <p> answers. Real questions a customer would ask before booking.
7. <h2>Ready to Get It Fixed?</h2> <p> 1-2 sentences with a direct CTA.

Writing rules — follow these strictly:
- NO em dashes (—). Use commas or periods instead.
- NO phrases like: "it's worth noting", "furthermore", "moreover", "in conclusion", "delve into", "crucial", "vital", "it's important to", "let's explore", "when it comes to", "a testament to", "look no further"
- Use real component names: walking belt, drive motor, motor control board, reed switch, tension roller, incline actuator, flywheel, resistance magnet, eddy current brake
- Mention Dallas Fort Worth naturally where it fits
- Do not promise same-day service, say same-week
- Sound like a technician who has seen this problem a hundred times
- Write for RESIDENTIAL homeowners who have a machine at home. 2EZ TEK is unique in DFW because we serve residential clients — many competitors turn homeowners away or focus exclusively on commercial facilities. Mention this as a competitive differentiator in the 2EZ TEK section of the post.

Metadata:
- seo_title max 60 chars, include keyword + DFW
- seo_description max 160 chars
- hero_image_url must be one of:
  "/images/gym-equipment-repair-dallas.webp",
  "/images/commercial-gym-maintenance.webp",
  "/images/blog-gym-background.webp",
  "/images/about-smartgymops-support.webp",
  "/images/project-5.webp"
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

async function discoverKeywords(): Promise<{ keywords: string[]; gscCount: number; serperCount: number }> {
  const discovered = new Set<string>()

  // Source 1: Google Search Console — real queries people used to find us
  let gscCount = 0
  try {
    const gscRows = await fetchTopQueries(90, 150)
    for (const row of gscRows) {
      // Target queries where we appear but aren't yet top 5 (position > 5)
      if (row.query && row.impressions >= 3 && row.position > 5 && isFitnessRepairKeyword(row.query)) {
        discovered.add(row.query.trim())
        gscCount++
      }
    }
  } catch (err) {
    console.error('GSC fetch failed, continuing with Serper only:', err)
  }

  // Source 2: Serper related searches — discover queries we don't yet appear for
  let serperCount = 0
  for (const seed of DISCOVERY_SEEDS) {
    try {
      const data = await serperSearch(seed)
      if (!data) continue

      const candidates = [
        ...(data.relatedSearches || []).map((r: any) => r.query as string),
        ...(data.peopleAlsoAsk || []).map((r: any) => r.question as string),
      ]

      for (const kw of candidates) {
        if (kw && isFitnessRepairKeyword(kw) && !discovered.has(kw.trim())) {
          discovered.add(kw.trim())
          serperCount++
        }
      }

      await new Promise(r => setTimeout(r, 300))
    } catch {
      // continue if one seed fails
    }
  }

  return { keywords: Array.from(discovered), gscCount, serperCount }
}

async function loadKeywordPool(supabase: any): Promise<string[]> {
  const db = supabase as any
  const { data } = await db
    .from('keyword_pool')
    .select('keyword')
    .eq('active', true)
    .order('last_scanned_at', { ascending: true, nullsFirst: true })
    .limit(200)

  return (data || []).map((r: any) => r.keyword)
}

async function saveDiscoveredKeywords(
  supabase: any,
  keywords: string[]
): Promise<number> {
  if (keywords.length === 0) return 0
  const db = supabase as any
  const rows = keywords.map(kw => ({
    keyword: kw,
    source: 'serper-related',
    discovered_at: new Date().toISOString(),
    active: true,
  }))
  const { error } = await db
    .from('keyword_pool')
    .upsert(rows, { onConflict: 'keyword', ignoreDuplicates: true })
  return error ? 0 : keywords.length
}

async function markScanned(supabase: any, keywords: string[]) {
  if (keywords.length === 0) return
  const db = supabase as any
  await db
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
    maxTokens: 3000,
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
    const { keywords: discovered, gscCount, serperCount } = await discoverKeywords()
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

    // 3a. Fetch previous rankings for comparison BEFORE inserting new ones
    const prevRankMap: Record<string, number | null> = {}
    if (gaps.length > 0) {
      const { data: prevRows } = await supabase
        .from('competitor_rankings')
        .select('keyword, our_rank, checked_at')
        .in('keyword', gaps.map(g => g.keyword))
        .order('checked_at', { ascending: false })
      for (const row of (prevRows || [])) {
        if (!(row.keyword in prevRankMap)) prevRankMap[row.keyword] = row.our_rank
      }
    }

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
        discovered: savedCount, gscCount, serperCount,
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
      // Build rank-change data for the email
      const gapsWithDelta = gaps.map(g => {
        const prev = prevRankMap[g.keyword] ?? null
        const curr = g.ourRank ?? null
        let delta: number | null = null
        if (prev !== null && curr !== null) delta = prev - curr // positive = moved up
        else if (prev === null && curr !== null) delta = null // newly ranking
        return { ...g, prevRank: prev, delta }
      })

      const improved    = gapsWithDelta.filter(g => g.delta !== null && g.delta > 0)
      const newRanking  = gapsWithDelta.filter(g => g.prevRank === null && g.ourRank)
      const dropped     = gapsWithDelta.filter(g => g.delta !== null && g.delta < 0)

      let progressBanner = ''
      if (improved.length > 0) {
        progressBanner = `
          <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:18px 20px;margin-bottom:24px">
            <div style="font-size:26px;margin-bottom:6px">🙌 Your blog is working!</div>
            <p style="margin:0 0 10px;font-weight:700;color:#166534;font-size:15px">${improved.length} keyword${improved.length > 1 ? 's' : ''} climbed this week:</p>
            ${improved.map(g => `<div style="padding:3px 0;color:#15803d;font-size:14px">↑ <strong>${g.keyword}</strong> — #${g.prevRank} → #${g.ourRank} (+${g.delta} spot${g.delta! > 1 ? 's' : ''})</div>`).join('')}
          </div>`
      } else if (newRanking.length > 0) {
        progressBanner = `
          <div style="background:#eff6ff;border:2px solid #93c5fd;border-radius:10px;padding:18px 20px;margin-bottom:24px">
            <div style="font-size:26px;margin-bottom:6px">📈 You're showing up!</div>
            <p style="margin:0 0 10px;font-weight:700;color:#1e40af;font-size:15px">${newRanking.length} keyword${newRanking.length > 1 ? 's' : ''} started ranking this week:</p>
            ${newRanking.map(g => `<div style="padding:3px 0;color:#1d4ed8;font-size:14px">★ <strong>${g.keyword}</strong> — new at #${g.ourRank}</div>`).join('')}
          </div>`
      } else {
        progressBanner = `
          <div style="background:#fefce8;border:2px solid #fde047;border-radius:10px;padding:18px 20px;margin-bottom:24px">
            <div style="font-size:26px;margin-bottom:6px">💪 Keep pushing</div>
            <p style="margin:0;color:#854d0e;font-size:14px">Rankings holding steady this week. Blog content takes 4-8 weeks to fully index — stay consistent and the climb is coming.</p>
          </div>`
      }

      const rankCell = (g: typeof gapsWithDelta[0]) => {
        const label = g.ourRank ? `#${g.ourRank}` : 'Not ranking'
        if (g.delta === null && g.ourRank) return `<span style="color:#1d4ed8;font-weight:700">${label} ★ new</span>`
        if (g.delta && g.delta > 0) return `<span style="color:#16a34a;font-weight:700">${label} ↑${g.delta}</span>`
        if (g.delta && g.delta < 0) return `<span style="color:#dc2626">${label} ↓${Math.abs(g.delta)}</span>`
        return `<span style="color:#6b7280">${label}</span>`
      }

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: improved.length > 0
            ? `🙌 ${improved.length} keyword${improved.length > 1 ? 's' : ''} moved up — Competitor Gap Report`
            : `Competitor Gap Report: ${gaps.length} gaps found, ${published.length} posts published`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:620px">
              <h2 style="color:#0891B2;margin-bottom:6px">Weekly Competitor Gap Report</h2>
              <p style="color:#666;font-size:13px;margin-top:0">Keyword pool: ${pool.length} keywords (${savedCount} newly discovered — ${gscCount} from Search Console, ${serperCount} from Serper)</p>

              ${progressBanner}

              <p>Found <strong>${gaps.length} keyword gaps</strong> where competitors outrank 2EZ TEK.</p>
              <p>Auto-published <strong>${published.length} new blog posts</strong> targeting those gaps.</p>

              <h3 style="margin-top:24px">Keyword Rankings</h3>
              <table style="width:100%;border-collapse:collapse">
                <tr style="background:#f0f9ff">
                  <th style="padding:8px;text-align:left;border:1px solid #ddd">Keyword</th>
                  <th style="padding:8px;text-align:left;border:1px solid #ddd">Our Rank</th>
                  <th style="padding:8px;text-align:left;border:1px solid #ddd">Top Competitor</th>
                </tr>
                ${gapsWithDelta.map(g => `
                  <tr>
                    <td style="padding:8px;border:1px solid #ddd">${g.keyword}</td>
                    <td style="padding:8px;border:1px solid #ddd">${rankCell(g)}</td>
                    <td style="padding:8px;border:1px solid #ddd">${g.competitorDomain ? `${g.competitorDomain} #${g.competitorRank}` : '—'}</td>
                  </tr>
                `).join('')}
              </table>

              ${published.length > 0 ? `
                <h3 style="margin-top:24px">Posts Published This Week</h3>
                ${published.map(p => `
                  <div style="margin-bottom:12px;padding:12px;background:#f7f7f7;border-radius:8px">
                    <strong>${p.title}</strong><br/>
                    <small style="color:#666">Targeting: ${p.keyword}</small><br/>
                    <a href="https://www.2eztek.com/blog/${p.slug}" style="color:#0891B2">View Post →</a>
                  </div>
                `).join('')}
              ` : ''}

              <hr style="margin-top:24px"/>
              <p style="color:#666;font-size:12px">Auto-generated by 2EZ TEK Competitor Gap Engine. Runs every Wednesday at 10am UTC.</p>
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
