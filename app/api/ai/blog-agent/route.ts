// app/api/ai/blog-agent/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

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

// ── Pull relevant manuals from Supabase ──────────────────────────────────────
async function fetchManualContext(brand: string, issue: string): Promise<string> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const searchTerms = [brand, issue].filter(Boolean)
    if (searchTerms.length === 0) return ''

    // Search equipment_manuals_v2 for matching slugs/descriptions
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
      // Fallback: search manuals_directory_view
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
    const body = await req.json()
    const { topic, brand = '', issue = '', city = 'Dallas', requestType = 'blog' } = body

    const finalTopic = buildTopic({ topic, brand, issue, city })

    if (!finalTopic) {
      return NextResponse.json(
        { success: false, message: 'Topic, brand, or issue is required.' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'OPENAI_API_KEY is missing.' },
        { status: 500 }
      )
    }

    // ── Fetch manual context from Supabase ───────────────────────────────────
    const manualContext = await fetchManualContext(brand, issue)

    const isCampaign = requestType === 'campaign'

    const prompt = `
Create a professional ${isCampaign ? 'multi-channel marketing campaign' : 'SEO blog article'} for 2EZ TEK.

Business:
2EZ TEK provides onsite fitness equipment repair, assembly, installation, diagnostics, and preventative maintenance across Dallas Fort Worth.

Campaign Inputs:
Topic: ${finalTopic}
Brand: ${brand || 'Not specified'}
Issue: ${issue || 'Not specified'}
City: ${city || 'Dallas'}
${manualContext ? manualContext + '\n\nUse the above documentation to write a more accurate, specific, and technically grounded article. Reference real model names and issues where relevant.' : ''}

Return ONLY valid JSON with this exact shape:
{
  "article": {
    "title": "",
    "category": "",
    "excerpt": "",
    "content": "",
    "seo_title": "",
    "seo_description": "",
    "cover_image": ""
  },
  "campaign": {
    "facebook": "",
    "gbp": "",
    "tiktok": "",
    "googleAds": ""
  }
}

Article Rules:
- Write like an experienced fitness equipment repair company.
- Make the article useful, local, and professional.
- Mention Dallas Fort Worth naturally.
- Mention the city naturally when relevant.
- Do not make unsupported claims.
- Do not claim certified technicians unless certification is specifically provided.
- Do not diagnose as guaranteed without inspection.
- Keep title clear and searchable.
- Content should be detailed, practical, and easy to read.
- Use paragraphs and numbered sections.
- Include practical symptoms, possible causes, and when to schedule service.
- Include a soft CTA for 2EZ TEK at the end.
- cover_image must be one of:
  "/images/gym-equipment-repair-dallas.webp",
  "/images/commercial-gym-maintenance.webp",
  "/images/blog-gym-background.webp",
  "/images/about-smartgymops-support.webp",
  "/images/project-5.webp"

Campaign Asset Rules:
- facebook: write a polished Facebook post for local customers. Include a CTA to call 2EZ TEK at (972) 807-7232.
- gbp: write a Google Business Profile post under 1,500 characters. Local, direct, service-focused.
- tiktok: write a short TikTok caption with a hook and hashtags. Include #2EZTEK.
- googleAds: include 8 short Google Search ad headlines and 4 descriptions. Keep headlines under 30 characters when possible and descriptions under 90 characters when possible.
- Do not use exaggerated guarantees.
- Do not say same-day service. You may say fast local service or same-week service.
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
        temperature: 0.5,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data?.error?.message || 'OpenAI request failed.' },
        { status: 500 }
      )
    }

    const outputText = getOutputText(data)
    if (!outputText) {
      return NextResponse.json(
        { success: false, message: 'No AI output returned.' },
        { status: 500 }
      )
    }

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
        cover_image: rawArticle.cover_image || '/images/gym-equipment-repair-dallas.webp',
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