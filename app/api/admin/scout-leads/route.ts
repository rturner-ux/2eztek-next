import { NextRequest, NextResponse } from 'next/server'

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
  if (!process.env.SERPER_API_KEY) {
    throw new Error(
      'SERPER_API_KEY is not set. Sign up at serper.dev (free 2,500 queries), copy your API key, and add SERPER_API_KEY=your-key to Vercel environment variables.'
    )
  }

  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 10, tbs: 'qdr:m6' }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(`Serper error: ${data.message ?? res.statusText}`)
  }

  // Normalize Serper results to the same shape as Google CSE
  const organic: Array<{ title: string; link: string; snippet: string }> = data.organic ?? []
  return organic.map((r) => ({ title: r.title, link: r.link, snippet: r.snippet }))
}

async function claude(system: string, user: string, model = 'claude-haiku-4-5-20251001', max_tokens = 400): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(`Claude error: ${data.error.message}`)
  return data.content?.[0]?.text?.trim() ?? ''
}

async function generateQueries(mode: string, service: string, city: string): Promise<string[]> {
  const serviceLabel = {
    treadmill_repair: 'treadmill repair',
    elliptical_repair: 'elliptical repair',
    bike_repair: 'exercise bike repair',
    gym_assembly: 'gym equipment assembly',
    commercial_maintenance: 'commercial gym maintenance',
    all_repair: 'fitness equipment repair and assembly',
  }[service] ?? 'fitness equipment repair'

  const cityStr = city === 'All DFW' ? 'Dallas Fort Worth' : city

  const system = mode === 'active_requests'
    ? `You generate Google search queries to find people who are ACTIVELY RIGHT NOW looking for fitness equipment repair or assembly services in a specific city. Target: Craigslist posts, Reddit posts, local forums, Nextdoor-indexed pages, Facebook group posts indexed by Google, HomeAdvisor/Angi requests, and any page where someone says they need help with their equipment. Return 5 highly targeted queries that maximize chance of finding real service requests, not business websites. Focus on intent signals: "need", "looking for", "anyone know", "can someone fix", "help with my", etc.`
    : `You generate Google search queries to find gyms, fitness centers, hotels, apartments, corporate offices, schools, and commercial facilities in a specific city that likely have fitness equipment needing professional maintenance and repair. Target: business directories, Yelp/Google Maps listings, fitness facility websites, apartment complex sites, hotel amenity pages. Return 5 queries that surface different types of commercial facilities with fitness equipment.`

  const text = await claude(system, `Service: ${serviceLabel}\nCity/Area: ${cityStr}\n\nReturn exactly 5 Google search queries, one per line, no numbering, no quotes around them, no explanation.`)
  return text.split('\n').map((q) => q.trim()).filter((q) => q.length > 5).slice(0, 5)
}

async function extractLeads(results: GoogleResult[], mode: string, service: string, city: string): Promise<ScoutLead[]> {
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

  const system = mode === 'active_requests'
    ? `You are a lead extraction assistant. Given Google search results, extract leads of people who are actively looking for fitness equipment repair or assembly services. For each relevant result, extract all available contact info and score their intent from 1-10. Score 8-10: explicit request with contact info. Score 5-7: clear need mentioned but less direct. Score 1-4: vague or low relevance. Ignore business directory listings and service provider sites — we want the CUSTOMERS, not other businesses.`
    : `You are a lead extraction assistant. Given Google search results for commercial facilities, extract gym/hotel/apartment/corporate office leads that likely have fitness equipment needing maintenance. Extract business name, contact info from the snippet/URL, and score 1-10 based on how likely they are to need professional equipment service (bigger = higher score, older facility = higher score, multiple locations = higher score).`

  const user = `Service context: ${serviceLabel} in ${city === 'All DFW' ? 'Dallas Fort Worth' : city}

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

Only include results with intent_score >= 4. Return [] if none qualify. Return ONLY the JSON array, no other text.`

  const text = await claude(system, user, 'claude-sonnet-4-6', 2000)

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

  try {
    // Step 1: Generate targeted search queries
    const queries = await generateQueries(mode, service, city)

    // Step 2: Execute all queries and collect results
    const allResults: GoogleResult[] = []
    const queriesUsed: string[] = []

    for (const query of queries) {
      try {
        const results = await googleSearch(query)
        allResults.push(...results)
        queriesUsed.push(query)
      } catch (err: any) {
        if (err.message.includes('GOOGLE_SCOUT_CX')) throw err
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
    const leads = await extractLeads(uniqueResults, mode, service, city)

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
