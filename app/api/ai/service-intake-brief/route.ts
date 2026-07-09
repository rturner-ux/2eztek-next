// app/api/ai/service-intake-brief/route.ts
// Generates a personalized AI expert brief after booking submission.
// Returns a greeting, expert insights, repair outlook, and relevant blog posts.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SYSTEM = `You are the world's most knowledgeable fitness equipment repair expert, working for 2EZ TEK in Dallas Fort Worth. You have diagnosed and repaired tens of thousands of treadmills, ellipticals, bikes, rowers, and strength machines.

When a customer submits a service request, you produce a personalized expert brief that makes them feel like they are dealing with the most impressive repair intelligence in the fitness industry.

Your brief must:
- Address the customer by first name
- Demonstrate deep knowledge of their specific equipment brand and model
- Show you understand their exact issue, not a generic problem
- Give 3 precise, genuinely useful expert insights about their machine or issue that a novice would not know
- Provide a realistic repair outlook (timeline, likelihood of same-day fix, what the tech will likely check first)
- Suggest 3 blog search keywords that would match articles about their situation (e.g. "nordictrack incline motor", "treadmill belt slipping", "peloton resistance calibration")
- Write in a warm but expert tone — confident, not clinical
- Never use em dashes in any writing
- Never use filler phrases like "Great news!" or "We're excited"

Return ONLY valid JSON:
{
  "greeting": "2-3 sentences addressing {firstName} and showing you know their exact machine and issue",
  "insights": [
    "Precise expert insight #1 about this specific machine or issue",
    "Precise expert insight #2",
    "Precise expert insight #3"
  ],
  "repairOutlook": "One paragraph: what the tech will likely check, realistic same-visit fix probability, anything the customer should have ready",
  "blogKeywords": ["keyword 1", "keyword 2", "keyword 3"]
}`

type BlogPost = {
  slug: string
  title: string
  excerpt: string
  hero_image_url: string | null
  category: string
}

async function findRelatedPosts(keywords: string[]): Promise<BlogPost[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return []

  const supabase = createClient(supabaseUrl, serviceKey)
  const found: BlogPost[] = []
  const seenSlugs = new Set<string>()

  for (const keyword of keywords) {
    if (found.length >= 3) break
    const terms = keyword.split(' ').filter(Boolean)
    if (!terms.length) continue

    let query = supabase
      .from('blog_posts')
      .select('slug, title, excerpt, hero_image_url, category')
      .eq('published', true)

    for (const term of terms) {
      query = query.ilike('title', `%${term}%`)
    }

    const { data } = await query.limit(2)
    for (const post of data || []) {
      if (!seenSlugs.has(post.slug) && found.length < 3) {
        found.push(post)
        seenSlugs.add(post.slug)
      }
    }
  }

  // Fallback: grab any recent posts if keywords returned nothing
  if (found.length === 0) {
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, title, excerpt, hero_image_url, category')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3)
    return data || []
  }

  return found
}

export async function POST(request: Request) {
  try {
    const { name, equipmentType, brandModel, details, aiDiagnosis, serviceType } =
      await request.json()

    const firstName = (name || 'there').trim().split(' ')[0]
    const equipment = [brandModel, equipmentType].filter(Boolean).join(' ') || 'fitness equipment'

    const userMessage = `Generate an expert intake brief for this service request:

Customer first name: ${firstName}
Equipment: ${equipment}
Service type: ${serviceType || 'Repair'}
Issue description: ${details || 'Not provided'}
AI photo diagnosis: ${aiDiagnosis || 'No photo submitted'}

Return ONLY valid JSON with greeting, insights (array of 3), repairOutlook, and blogKeywords (array of 3).`

    const raw = await callClaude({
      system: SYSTEM,
      userMessage,
      maxTokens: 800,
      temperature: 0.65,
    })

    const parsed = JSON.parse(cleanJsonOutput(raw))
    const blogPosts = await findRelatedPosts(parsed.blogKeywords || [])

    return NextResponse.json({
      success: true,
      greeting: parsed.greeting || '',
      insights: parsed.insights || [],
      repairOutlook: parsed.repairOutlook || '',
      blogPosts,
    })
  } catch (error: any) {
    console.error('INTAKE BRIEF ERROR:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
