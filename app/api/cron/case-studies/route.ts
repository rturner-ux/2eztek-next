// app/api/cron/case-studies/route.ts
// Mines completed service records and generates SEO case study blog posts.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput, makeSlug } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CASE_STUDY_SYSTEM = `You are a content writer for 2EZ TEK, a fitness equipment repair company in Dallas Fort Worth with 500+ five-star reviews.

You write compelling, SEO-optimized case study blog posts based on real service records. These posts demonstrate expertise, build trust, and rank for long-tail repair keywords.

Case study structure:
1. Introduction: The problem the customer faced (2-3 sentences, specific)
2. The Challenge: What made this repair complex or notable
3. Our Approach: How 2EZ TEK diagnosed and solved it (technical but readable)
4. The Result: Equipment restored, customer happy, outcome
5. Key Takeaway: One actionable lesson for other equipment owners
6. CTA: Book service with 2EZ TEK in Dallas Fort Worth

Rules:
- Never use the customer's real name — use their role: "a Plano homeowner", "an Arlington apartment complex", "a Dallas hotel"
- Be specific about the equipment type, brand, and issue — this drives SEO
- 500-700 words — focused and scannable
- Include Dallas Fort Worth location naturally
- hero_image_url must be one of:
  "/images/gym-equipment-repair-dallas.webp",
  "/images/commercial-gym-maintenance.webp",
  "/images/blog-gym-background.webp",
  "/images/about-smartgymops-support.webp",
  "/images/project-5.webp"
- seo_title max 60 chars
- seo_description max 160 chars
- Return ONLY valid JSON, no extra text`

type ServiceRecord = {
  name: string
  equipment_type: string | null
  brand_model: string | null
  service_type: string | null
  details: string | null
  address: string | null
}

function anonymizeLocation(address: string | null): string {
  if (!address) return 'Dallas Fort Worth'
  const cities = ['Dallas', 'Fort Worth', 'Plano', 'Frisco', 'Irving', 'Arlington', 'Richardson', 'McKinney', 'Garland', 'Mesquite', 'Carrollton', 'Addison']
  for (const city of cities) {
    if (address.toLowerCase().includes(city.toLowerCase())) return city
  }
  return 'Dallas Fort Worth'
}

function anonymizeCustomer(name: string, serviceType: string | null, address: string | null): string {
  const city = anonymizeLocation(address)
  if (serviceType?.toLowerCase().includes('commercial')) return `a ${city} commercial facility`
  if (serviceType?.toLowerCase().includes('apartment')) return `a ${city} apartment complex`
  const descriptors = ['homeowner', 'resident', 'home gym owner']
  return `a ${city} ${descriptors[Math.floor(Math.random() * descriptors.length)]}`
}

async function generateCaseStudy(record: ServiceRecord): Promise<any> {
  const customer = anonymizeCustomer(record.name, record.service_type, record.address)

  const userMessage = `Generate a case study blog post for this service record.

Customer: ${customer}
Equipment: ${record.equipment_type || 'fitness equipment'}
Brand/Model: ${record.brand_model || 'not specified'}
Service Type: ${record.service_type || 'repair'}
Issue Details: ${record.details?.slice(0, 300) || 'equipment repair needed'}

Return ONLY valid JSON:
{
  "title": "",
  "category": "Case Study",
  "excerpt": "",
  "content": "",
  "seo_title": "",
  "seo_description": "",
  "hero_image_url": ""
}`

  const outputText = await callClaude({
    system: CASE_STUDY_SYSTEM,
    userMessage,
    maxTokens: 1536,
    temperature: 0.6,
  })

  const parsed = JSON.parse(cleanJsonOutput(outputText))
  return {
    ...parsed,
    slug: makeSlug(parsed.title || `${record.equipment_type}-repair-case-study`),
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

    // Find completed service records with enough detail to generate a case study
    const { data: records, error } = await supabase
      .from('new_customers')
      .select('name, equipment_type, brand_model, service_type, details, address')
      .not('details', 'is', null)
      .not('equipment_type', 'is', null)
      .gte('details', '30') // has some detail (length proxy via ordering)
      .order('last_request_at', { ascending: false })
      .limit(50)

    if (error) throw new Error(error.message)
    if (!records || records.length === 0) {
      return NextResponse.json({ success: true, message: 'No records with sufficient detail', published: 0 })
    }

    // Filter to records with 30+ chars of details
    const qualified = (records as ServiceRecord[]).filter(r => (r.details?.length || 0) >= 30)

    if (qualified.length === 0) {
      return NextResponse.json({ success: true, message: 'No qualified records this run', published: 0 })
    }

    // Generate 1 case study per run (they're long — keep quality high)
    const record = qualified[Math.floor(Math.random() * Math.min(qualified.length, 10))]

    const post = await generateCaseStudy(record)

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', post.slug)
      .maybeSingle()

    if (existing) post.slug = `${post.slug}-${Date.now()}`

    const { data: saved, error: saveError } = await supabase
      .from('blog_posts')
      .insert({
        title: post.title,
        slug: post.slug,
        category: 'Case Study',
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

    if (saveError) throw new Error(saveError.message)

    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: `Case Study Published: ${post.title}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:580px"><h2 style="color:#0891B2">New Case Study Published</h2><p><strong>${post.title}</strong></p><p>${post.excerpt}</p><a href="https://www.2eztek.com/blog/${post.slug}">View Post →</a></div>`,
        }),
      })
    }

    return NextResponse.json({ success: true, published: 1, post: { id: saved.id, slug: saved.slug, title: saved.title } })
  } catch (error: any) {
    console.error('CASE STUDIES ERROR:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
