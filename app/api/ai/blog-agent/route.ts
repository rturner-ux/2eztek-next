// app/api/ai/blog-agent/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminRequest } from '@/lib/serverSecurity'
import { callClaude, cleanJsonOutput, makeSlug } from '@/lib/claude'

export const runtime = 'nodejs'

const BLOG_AGENT_SYSTEM = `You are an expert fitness equipment repair technician and marketing strategist for 2EZ TEK, a professional repair company serving Dallas Fort Worth, TX.

You generate SEO blog articles and multi-channel marketing campaigns that are technically accurate, locally relevant, and professionally written.

Business context:
2EZ TEK provides onsite fitness equipment repair, assembly, installation, diagnostics, and preventative maintenance across Dallas Fort Worth.
Phone: (972) 807-7232 | Website: 2eztek.com

Article rules:
- Write like an experienced fitness equipment repair company
- Make the article useful, local, and professional
- Mention Dallas Fort Worth naturally
- Do not make unsupported claims or diagnose without inspection
- Use paragraphs and numbered sections with practical symptoms, causes, and service CTA
- hero_image_url must be one of:
  "/images/gym-equipment-repair-dallas.webp",
  "/images/commercial-gym-maintenance.webp",
  "/images/blog-gym-background.webp",
  "/images/about-smartgymops-support.webp",
  "/images/project-5.webp"
- seo_title max 60 chars, seo_description max 160 chars

Campaign asset rules:
- facebook: polished Facebook post for local customers with CTA to call (972) 807-7232
- gbp: Google Business Profile post under 1,500 characters, local and direct
- tiktok: short TikTok caption with hook and hashtags including #2EZTEK
- googleAds: 8 short headlines (under 30 chars) and 4 descriptions (under 90 chars)
- Do not use exaggerated guarantees or promise same-day service (say fast local service or same-week)

Return ONLY valid JSON, no extra text`

function buildTopic({ topic, brand, issue, city }: {
  topic?: string; brand?: string; issue?: string; city?: string
}) {
  const t = String(topic || '').trim()
  const b = String(brand || '').trim()
  const i = String(issue || '').trim()
  const c = String(city || 'Dallas').trim() || 'Dallas'
  if (t) return t
  if (b && i) return `${b} ${i} repair in ${c}`
  if (i) return `${i} repair in ${c}`
  if (b) return `${b} fitness equipment repair in ${c}`
  return ''
}

async function fetchManualContext(brand: string, issue: string): Promise<string> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const searchTerms = [brand, issue].filter(Boolean)
    if (searchTerms.length === 0) return ''

    const { data: manuals } = await supabase
      .from('equipment_manuals_v2')
      .select('slug, description, manual_type')
      .or(
        searchTerms
          .map((term) => `slug.ilike.%${term.toLowerCase().replace(/\s+/g, '-')}%`)
          .join(',')
      )
      .limit(8)

    if (!manuals || manuals.length === 0) {
      const { data: viewManuals } = await supabase
        .from('manuals_directory_view')
        .select('model, brand, equipment_type, description')
        .or(
          searchTerms
            .map((term) => `brand.ilike.%${term}%,model.ilike.%${term}%`)
            .join(',')
        )
        .limit(8)

      if (!viewManuals || viewManuals.length === 0) return ''

      return `\nRelevant equipment documentation from 2EZ TEK manuals library:\n` +
        viewManuals
          .map((m) => `- ${m.brand} ${m.model} (${m.equipment_type || 'Fitness Equipment'}): ${m.description || 'Service manual available'}`)
          .join('\n')
    }

    return `\nRelevant equipment documentation from 2EZ TEK manuals library:\n` +
      manuals
        .map((m) => `- ${m.slug} (${m.manual_type || 'Manual'}): ${m.description || 'Documentation available'}`)
        .join('\n')
  } catch (err) {
    console.error('Manual context fetch failed:', err)
    return ''
  }
}

export async function POST(req: Request) {
  try {
    const unauthorized = requireAdminRequest(req)
    if (unauthorized) return unauthorized

    const body = await req.json()
    const { topic, brand = '', issue = '', city = 'Dallas', requestType = 'blog' } = body

    const finalTopic = buildTopic({ topic, brand, issue, city })

    if (!finalTopic) {
      return NextResponse.json(
        { success: false, message: 'Topic, brand, or issue is required.' },
        { status: 400 }
      )
    }

    const manualContext = await fetchManualContext(brand, issue)
    const isCampaign = requestType === 'campaign'

    const userMessage = `Create a professional ${isCampaign ? 'multi-channel marketing campaign' : 'SEO blog article'} for 2EZ TEK.

Topic: ${finalTopic}
Brand: ${brand || 'Not specified'}
Issue: ${issue || 'Not specified'}
City: ${city || 'Dallas'}
${manualContext ? manualContext + '\n\nUse the above documentation to write a more accurate, specific, and technically grounded article.' : ''}

Return ONLY valid JSON with this exact shape:
{
  "article": {
    "title": "",
    "category": "",
    "excerpt": "",
    "content": "",
    "seo_title": "",
    "seo_description": "",
    "hero_image_url": ""
  },
  "campaign": {
    "facebook": "",
    "gbp": "",
    "tiktok": "",
    "googleAds": ""
  }
}`

    const outputText = await callClaude({
      system: BLOG_AGENT_SYSTEM,
      userMessage,
      maxTokens: 3000,
      temperature: 0.5,
    })

    const parsed = JSON.parse(cleanJsonOutput(outputText))
    const rawArticle = parsed.article || parsed
    const rawCampaign = parsed.campaign || {}
    const title = rawArticle.title || finalTopic
    const slug = makeSlug(title)

    return NextResponse.json({
      success: true,
      article: {
        title,
        slug,
        category: rawArticle.category || 'Fitness Equipment Repair',
        excerpt: rawArticle.excerpt || '',
        content: rawArticle.content || '',
        seo_title: rawArticle.seo_title || `${title} | 2EZ TEK`,
        seo_description: rawArticle.seo_description || rawArticle.excerpt || '',
        hero_image_url: rawArticle.hero_image_url || '/images/gym-equipment-repair-dallas.webp',
      },
      campaign: {
        facebook: rawCampaign.facebook || '',
        gbp: rawCampaign.gbp || '',
        tiktok: rawCampaign.tiktok || '',
        googleAds: typeof rawCampaign.googleAds === 'string'
          ? rawCampaign.googleAds
          : rawCampaign.googleAds
            ? JSON.stringify(rawCampaign.googleAds, null, 2)
            : '',
      },
    })
  } catch (error) {
    console.error('BLOG AGENT ERROR:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate blog campaign.' },
      { status: 500 }
    )
  }
}
