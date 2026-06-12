// app/api/cron/customer-inquiry-blog/route.ts
// Mines real customer service records from the intake form and generates
// data-driven blog posts about the actual problems 2EZ TEK sees in the field.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput, makeSlug } from '@/lib/claude'
import { isDuplicateInList } from '@/lib/blog-dedup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const INQUIRY_BLOG_SYSTEM = `You are a working fitness equipment repair technician at 2EZ TEK in Dallas Fort Worth, TX. You are writing a blog post grounded in real service data — actual customer problems seen in the field across Dallas Fort Worth.

Write a comprehensive, data-driven repair guide — 900 to 1200 words. This post carries authority because it comes from real repair experience, not generic internet advice.

Format the content field as structured HTML using these exact tags: <h2>, <h3>, <ul>, <ol>, <li>, <p>, <strong>. Do not use <html>, <head>, or <body> tags.

Use this structure:
1. <p> Opening: Reference that this is based on real service calls in Dallas Fort Worth. Name the equipment and the pattern you are seeing in the field.
2. <h2>The Most Common Problems We See</h2> <ol> 4-6 real problems with <strong> cause labels and 2-3 sentence explanations with real component names (motor control board, walking belt, reed switch, tension roller, incline actuator).
3. <h2>Warning Signs You Should Not Ignore</h2> <ul> 4-5 <li> items with <strong> symptom labels.
4. <h2>Why Dallas Fort Worth Conditions Matter</h2> <p> 1-2 paragraphs on local factors: heat in unconditioned garages, apartment gym wear patterns, commercial gym volume.
5. <h2>DIY vs. Calling a Technician</h2> <p> 2 paragraphs being honest about what is safe to attempt and what risks making the problem worse.
6. <h2>Frequently Asked Questions</h2> 2-3 <h3> questions with <p> answers based on what customers actually ask.
7. <h2>Book [Equipment Type] Repair in Dallas Fort Worth</h2> <p> 1-2 sentence CTA mentioning 2EZ TEK and same-week service.

Writing rules:
- NO em dashes (—). Use commas or periods instead.
- NO phrases like "it's worth noting", "furthermore", "crucial", "vital", "a testament to", "look no further"
- Use real component names throughout
- Sound like a technician writing from experience
- Do not promise same-day service, say same-week
- Most of these service calls are RESIDENTIAL homeowners, not commercial facilities. 2EZ TEK is one of the few DFW companies that actively serves residential clients. Many companies turn homeowners away. Mention this clearly in the DIY vs. Technician section and the CTA: you do not need to be a gym to get professional service.
- Return ONLY valid JSON, no extra text`

type ServiceRecord = {
  equipment_type: string | null
  brand_model: string | null
  service_type: string | null
  details: string | null
  search_query: string | null
}

type EquipmentGroup = {
  equipment_type: string
  count: number
  brands: string[]
  issues: string[]
  service_types: string[]
  search_queries: string[]
}

function normalizeEquipment(raw: string | null): string {
  if (!raw) return 'fitness equipment'
  const r = raw.toLowerCase()
  if (r.includes('treadmill')) return 'treadmill'
  if (r.includes('elliptical')) return 'elliptical'
  if (r.includes('bike') || r.includes('cycle')) return 'exercise bike'
  if (r.includes('stair') || r.includes('step')) return 'stairmaster'
  if (r.includes('cable') || r.includes('functional')) return 'cable machine'
  if (r.includes('rower') || r.includes('rowing')) return 'rowing machine'
  if (r.includes('strength') || r.includes('weight') || r.includes('rack')) return 'strength equipment'
  return raw.toLowerCase()
}

function groupByEquipment(records: ServiceRecord[]): EquipmentGroup[] {
  const map = new Map<string, EquipmentGroup>()

  for (const r of records) {
    const key = normalizeEquipment(r.equipment_type)
    if (!map.has(key)) {
      map.set(key, { equipment_type: key, count: 0, brands: [], issues: [], service_types: [], search_queries: [] })
    }
    const g = map.get(key)!
    g.count++
    if (r.brand_model && !g.brands.includes(r.brand_model)) g.brands.push(r.brand_model)
    if (r.details && r.details.length > 10) g.issues.push(r.details.slice(0, 120))
    if (r.service_type && !g.service_types.includes(r.service_type)) g.service_types.push(r.service_type)
    if (r.search_query && r.search_query.length > 3 && !g.search_queries.includes(r.search_query)) g.search_queries.push(r.search_query)
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count)
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

    // Pull recent customer intake records
    const { data: records, error: recordsError } = await supabase
      .from('new_customers')
      .select('equipment_type, brand_model, service_type, details, search_query')
      .not('equipment_type', 'is', null)
      .order('last_request_at', { ascending: false })
      .limit(200)

    if (recordsError || !records || records.length === 0) {
      return NextResponse.json({ success: true, message: 'No customer records found', published: 0 })
    }

    // Group by equipment type to find patterns
    const groups = groupByEquipment(records as ServiceRecord[])
    if (groups.length === 0) {
      return NextResponse.json({ success: true, message: 'No groupable records', published: 0 })
    }

    // Pull existing posts for duplicate checking
    const { data: existingPosts } = await supabase
      .from('blog_posts')
      .select('title, slug')
      .order('created_at', { ascending: false })
      .limit(150)

    const existing = existingPosts || []

    // Pick the highest-volume equipment type that doesn't already have a recent post
    const PRIORITY_TITLES = [
      'treadmill', 'elliptical', 'exercise bike', 'stairmaster',
      'cable machine', 'rowing machine', 'strength equipment',
    ]

    let chosen: EquipmentGroup | null = null
    for (const priority of PRIORITY_TITLES) {
      const group = groups.find(g => g.equipment_type === priority)
      if (!group || group.count < 3) continue
      const candidateTitle = `${group.equipment_type} repair problems dallas fort worth real service data`
      if (!isDuplicateInList(candidateTitle, existing)) {
        chosen = group
        break
      }
    }

    // Fallback: pick highest count group not already covered
    if (!chosen) {
      for (const group of groups) {
        if (group.count < 3) continue
        const candidateTitle = `${group.equipment_type} repair problems dallas fort worth`
        if (!isDuplicateInList(candidateTitle, existing)) {
          chosen = group
          break
        }
      }
    }

    if (!chosen) {
      return NextResponse.json({ success: true, message: 'All equipment types already have recent posts', published: 0 })
    }

    const topBrands = chosen.brands.slice(0, 5).join(', ')
    const topIssues = chosen.issues.slice(0, 8).join(' | ')
    const topSearches = chosen.search_queries.slice(0, 6).join(' | ')

    const userMessage = `Generate a data-driven blog post about real ${chosen.equipment_type} repair problems in Dallas Fort Worth.

Equipment type: ${chosen.equipment_type}
Service volume this period: ${chosen.count} service calls
Brands we are seeing: ${topBrands || 'various brands'}
Real issues from customer intake forms: ${topIssues || 'general repair and maintenance needs'}
Service types: ${chosen.service_types.slice(0, 4).join(', ') || 'repair, maintenance'}${topSearches ? `\nActual searches customers used to find us: ${topSearches}` : ''}

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
      system: INQUIRY_BLOG_SYSTEM,
      userMessage,
      maxTokens: 3000,
      temperature: 0.55,
    })

    const parsed = JSON.parse(cleanJsonOutput(outputText))
    const slug = makeSlug(parsed.title || `${chosen.equipment_type}-repair-problems-dallas`)

    // Final duplicate check on generated title
    if (isDuplicateInList(parsed.title || '', existing)) {
      return NextResponse.json({ success: true, message: 'Generated title too similar to existing post', published: 0 })
    }

    // Slug collision means a concurrent run just saved the same post — skip rather than rename
    const { data: slugConflict } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (slugConflict) {
      return NextResponse.json({ success: true, message: 'Slug already exists (concurrent run) — skipped', published: 0 })
    }

    const { data: saved, error: saveError } = await supabase
      .from('blog_posts')
      .insert({
        title: parsed.title,
        slug,
        category: parsed.category || `${chosen.equipment_type.charAt(0).toUpperCase() + chosen.equipment_type.slice(1)} Repair`,
        excerpt: parsed.excerpt,
        content: parsed.content,
        seo_title: parsed.seo_title,
        seo_description: parsed.seo_description,
        hero_image_url: parsed.hero_image_url || '/images/gym-equipment-repair-dallas.webp',
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
          subject: `Customer Inquiry Blog: ${parsed.title}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:580px"><h2 style="color:#0891B2">New Data-Driven Blog Post</h2><p>Generated from <strong>${chosen.count} customer intake records</strong> for ${chosen.equipment_type}.</p><p><strong>${parsed.title}</strong></p><p>${parsed.excerpt}</p><a href="https://www.2eztek.com/admin/blog">Review in Admin →</a></div>`,
        }),
      })
    }

    return NextResponse.json({
      success: true,
      published: 1,
      source_records: chosen.count,
      equipment: chosen.equipment_type,
      post: { id: saved.id, slug: saved.slug, title: saved.title },
    })
  } catch (error: any) {
    console.error('CUSTOMER INQUIRY BLOG ERROR:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
