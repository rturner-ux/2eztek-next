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
}

export async function POST(req: Request) {
  try {
    const { topic } = await req.json()

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Topic is required.' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'OPENAI_API_KEY is missing.' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: `
Create a professional SEO blog article for 2EZ TEK.

Business:
2EZ TEK provides onsite fitness equipment repair, assembly, installation, diagnostics, and preventative maintenance across Dallas Fort Worth.

Topic:
${topic}

Return ONLY valid JSON with this exact shape:
{
  "title": "",
  "category": "",
  "excerpt": "",
  "content": "",
  "seo_title": "",
  "seo_description": "",
  "cover_image": ""
}

Rules:
- Write like an experienced fitness equipment repair company.
- Make the article useful, local, and professional.
- Mention Dallas Fort Worth naturally.
- Do not make unsupported claims.
- Do not diagnose as guaranteed without inspection.
- Keep title clear and searchable.
- Content should be detailed, practical, and easy to read.
- Use paragraphs and numbered sections.
- cover_image must be one of:
  "/images/gym-equipment-repair-dallas.webp",
  "/images/commercial-gym-maintenance.webp",
  "/images/blog-gym-background.webp",
  "/images/about-smartgymops-support.webp",
  "/images/project-5.webp"
`,
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

    const outputText =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      ''

    if (!outputText) {
      return NextResponse.json(
        { success: false, message: 'No AI output returned.' },
        { status: 500 }
      )
    }

    const article = JSON.parse(outputText)

    const title = article.title || topic
    const slug = makeSlug(title)

    return NextResponse.json({
      success: true,
      article: {
        title,
        slug,
        category: article.category || 'Fitness Equipment Repair',
        excerpt: article.excerpt || '',
        content: article.content || '',
        seo_title: article.seo_title || `${title} | 2EZ TEK`,
        seo_description: article.seo_description || article.excerpt || '',
        cover_image:
          article.cover_image || '/images/gym-equipment-repair-dallas.webp',
      },
    })
  } catch (error) {
    console.error('BLOG AGENT ERROR:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate blog article.',
      },
      { status: 500 }
    )
  }
}