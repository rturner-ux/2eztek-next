import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120

type ScoutLead = {
  name: string
  company?: string
  email?: string
  phone?: string
  website?: string
  location?: string
  intent_score: number
  intent_reason: string
  source_url: string
  source_title: string
  snippet: string
  mode: 'active_request' | 'business'
}

type GoogleResult = {
  title: string
  link: string
  snippet: string
  pagemap?: {
    metatags?: Array<Record<string, string>>
  }
}

function checkPassword(req: Request) {
  const pw = req.headers.get('x-admin-password')
  return Boolean(pw && pw === process.env.ADMIN_BLOG_PASSWORD)
}

async function googleSearch(query: string): Promise<GoogleResult[]> {
  const cx = process.env.GOOGLE_SCOUT_CX

  if (!cx) {
    throw new Error(
      'GOOGLE_SCOUT_CX is not set. Create a "Search the entire web" Custom Search Engine at programmablesearchengine.google.com, copy the cx ID, and add GOOGLE_SCOUT_CX=your-cx to your Vercel environment variables.'
    )
  }

  const url = new URL('https://www.googleapis.com/customsearch/v1')
  url.searchParams.set('key', process.env.GOOGLE_SEARCH_API_KEY ?? '')
  url.searchParams.set('cx', cx)
  url.searchParams.set('q', query)
  url.searchParams.set('num', '10')
  url.searchParams.set('dateRestrict', 'm6') // last 6 months for freshness

  const res = await fetch(url.toString())
  const data = await res.json()

  if (data.error) {
    throw new Error(`Google Search error: ${data.error.message}`)
  }

  return (data.items ?? []) as GoogleResult[]
}

async function generateQueries(
  client: Anthropic,
  mode: string,
  service: string,
  city: string
): Promise<string[]> {
  const serviceLabel = {
    treadmill_repair: 'treadmill repair',
    elliptical_repair: 'elliptical repair',
    bike_repair: 'exercise bike repair',
    gym_assembly: 'gym equipment assembly',
    commercial_maintenance: 'commercial gym maintenance',
    all_repair: 'fitness equipment repair and assembly',
  }[service] ?? 'fitness equipment repair'

  const cityStr = city === 'All DFW' ? 'Dallas Fort Worth' : city

  const systemPrompt = mode === 'active_requests'
    ? `You generate Google search queries to find people who are ACTIVELY RIGHT NOW looking for fitness equipment repair or assembly services in a specific city. Target: Craigslist posts, Reddit posts, local forums, Nextdoor-indexed pages, Facebook group posts indexed by Google, HomeAdvisor/Angi requests, and any page where someone says they need help with their equipment. Return 5 highly targeted queries that maximize chance of finding real service requests, not business websites. Focus on intent signals: "need", "looking for", "anyone know", "can someone fix", "help with my", etc.`
    : `You generate Google search queries to find gyms, fitness centers, hotels, apartments, corporate offices, schools, and commercial facilities in a specific city that likely have fitness equipment needing professional maintenance and repair. Target: business directories, Yelp/Google Maps listings, fitness facility websites, apartment complex sites, hotel amenity pages. Return 5 queries that surface different types of commercial facilities with fitness equipment.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Service: ${serviceLabel}\nCity/Area: ${cityStr}\n\nReturn exactly 5 Google search queries, one per line, no numbering, no quotes around them, no explanation.`,
    }],
  })

  const text = (message.content[0] as { type: string; text: string }).text.trim()
  return text.split('\n').map((q) => q.trim()).filter((q) => q.length > 5).slice(0, 5)
}

async function extractLeads(
  client: Anthropic,
  results: GoogleResult[],
  mode: string,
  service: string,
  city: string
): Promise<ScoutLead[]> {
  if (results.length === 0) return []

  const serviceLabel = {
    treadmill_repair: 'treadmill repair',
    elliptical_repair: 'elliptical repair',
    bike_repair: 'exercise bike repair',
    gym_assembly: 'gym equipment assembly',
    commercial_maintenance: 'commercial gym maintenance',
    all_repair: 'fitness equipment repair and assembly',
  }[service] ?? 'fitness equipment repair'

  const resultsText = results.map((r, i) =>
    `[${i}] TITLE: ${r.title}\nURL: ${r.link}\nSNIPPET: ${r.snippet}`
  ).join('\n\n')

  const systemPrompt = mode === 'active_requests'
    ? `You are a lead extraction assistant. Given Google search results, extract leads of people who are actively looking for fitness equipment repair or assembly services. For each relevant result, extract all available contact info and score their intent from 1-10. Score 8-10: explicit request with contact info. Score 5-7: clear need mentioned but less direct. Score 1-4: vague or low relevance. Ignore business directory listings and service provider sites — we want the CUSTOMERS, not other businesses.`
    : `You are a lead extraction assistant. Given Google search results for commercial facilities, extract gym/hotel/apartment/corporate office leads that likely have fitness equipment needing maintenance. Extract business name, contact info from the snippet/URL, and score 1-10 based on how likely they are to need professional equipment service (bigger = higher score, older facility = higher score, multiple locations = higher score).`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Service context: ${serviceLabel} in ${city === 'All DFW' ? 'Dallas Fort Worth' : city}

Search results:
${resultsText}

Extract leads and return a JSON array. Each lead object:
{
  "result_index": number,
  "name": "person name or business name",
  "company": "company/facility name if different from name",
  "email": "extracted email or null",
  "phone": "extracted phone or null",
  "website": "website URL or null",
  "location": "city/area mentioned or null",
  "intent_score": 1-10,
  "intent_reason": "1-2 sentence explanation of why this is a lead and their intent level",
  "mode": "active_request" or "business"
}

Only include results with intent_score >= 4. Return [] if none qualify. Return ONLY the JSON array, no other text.`,
    }],
  })

  const text = (message.content[0] as { type: string; text: string }).text.trim()

  let parsed: Array<ScoutLead & { result_index: number }>
  try {
    const cleaned = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim()
    parsed = JSON.parse(cleaned)
  } catch {
    return []
  }

  return parsed.map((item) => {
    const source = results[item.result_index] ?? results[0]
    return {
      name: item.name ?? 'Unknown',
      company: item.company ?? undefined,
      email: item.email ?? undefined,
      phone: item.phone ?? undefined,
      website: item.website ?? undefined,
      location: item.location ?? undefined,
      intent_score: item.intent_score ?? 5,
      intent_reason: item.intent_reason ?? '',
      source_url: source?.link ?? '',
      source_title: source?.title ?? '',
      snippet: source?.snippet ?? '',
      mode: item.mode ?? (mode === 'active_requests' ? 'active_request' : 'business'),
    }
  })
}

export async function POST(request: NextRequest) {
  if (!checkPassword(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { mode, service, city } = await request.json()

  if (!mode || !service || !city) {
    return NextResponse.json({ success: false, error: 'Missing mode, service, or city' }, { status: 400 })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    // Step 1: Generate targeted search queries
    const queries = await generateQueries(client, mode, service, city)

    // Step 2: Execute all queries and collect results
    const allResults: GoogleResult[] = []
    const queriesUsed: string[] = []

    for (const query of queries) {
      try {
        const results = await googleSearch(query)
        allResults.push(...results)
        queriesUsed.push(query)
      } catch (err: any) {
        // If it's the missing CX error, surface it immediately
        if (err.message.includes('GOOGLE_SCOUT_CX')) throw err
        // Otherwise skip this query and continue
      }
    }

    // Deduplicate by URL
    const seen = new Set<string>()
    const uniqueResults = allResults.filter((r) => {
      if (seen.has(r.link)) return false
      seen.add(r.link)
      return true
    })

    // Step 3: AI extracts and scores leads from all results
    const leads = await extractLeads(client, uniqueResults, mode, service, city)

    // Sort by intent score descending
    leads.sort((a, b) => b.intent_score - a.intent_score)

    return NextResponse.json({
      success: true,
      leads,
      queries_used: queriesUsed,
      total_results_analyzed: uniqueResults.length,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, leads: [], queries_used: [] }, { status: 500 })
  }
}
