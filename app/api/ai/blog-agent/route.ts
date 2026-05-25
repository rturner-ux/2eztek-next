import { NextResponse } from 'next/server'

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

function cleanJsonOutput(outputText: string) {
  return outputText
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
      ?.map((content: any) => content.text || '')
      ?.join('') ||
    ''
  )
}

function buildTopic({
  topic,
  brand,
  issue,
  city,
}: {
  topic?: string
  brand?: string
  issue?: string
  city?: string
}) {
  const cleanTopic = String(topic || '').trim()
  const cleanBrand = String(brand || '').trim()
  const cleanIssue = String(issue || '').trim()
  const cleanCity = String(city || 'Dallas').trim() || 'Dallas'

  if (cleanTopic) return cleanTopic

  if (cleanBrand && cleanIssue) {
    return `${cleanBrand} ${cleanIssue} repair in ${cleanCity}`
  }

  if (cleanIssue) {
    return `${cleanIssue} repair in ${cleanCity}`
  }

  if (cleanBrand) {
    return `${cleanBrand} fitness equipment repair in ${cleanCity}`
  }

  return ''
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      topic,
      brand = '',
      issue = '',
      city = 'Dallas',
      requestType = 'blog',
    } = body

    const finalTopic = buildTopic({
      topic,
      brand,
      issue,
      city,
    })

    if (!finalTopic || typeof finalTopic !== 'string') {
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
- Include a soft CTA for 2EZ TEK.
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
        {
          success: false,
          message: data?.error?.message || 'OpenAI request failed.',
        },
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

    const cleanedOutput = cleanJsonOutput(outputText)
    const parsed = JSON.parse(cleanedOutput)

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
        cover_image:
          rawArticle.cover_image || '/images/gym-equipment-repair-dallas.webp',
      },
      campaign: {
        facebook: rawCampaign.facebook || '',
        gbp: rawCampaign.gbp || '',
        tiktok: rawCampaign.tiktok || '',
        googleAds:
          typeof rawCampaign.googleAds === 'string'
            ? rawCampaign.googleAds
            : rawCampaign.googleAds
              ? JSON.stringify(rawCampaign.googleAds, null, 2)
              : '',
              },
    })
  } catch (error) {
    console.error('BLOG AGENT ERROR:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate blog campaign.',
      },
      { status: 500 }
    )
  }
}