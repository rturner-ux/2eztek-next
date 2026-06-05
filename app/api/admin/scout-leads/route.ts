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

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong'
}

async function googleSearch(query: string, recency: string): Promise<GoogleResult[]> {
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
    body: JSON.stringify({ q: query, num: 10, tbs: recency }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(`Serper error: ${data.message ?? res.statusText}`)
  }

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

function serviceLabelFor(service: string) {
  return {
    treadmill_repair: 'treadmill repair',
    elliptical_repair: 'elliptical repair',
    bike_repair: 'exercise bike repair',
    gym_assembly: 'gym equipment assembly',
    commercial_maintenance: 'commercial gym maintenance',
    all_repair: 'fitness equipment repair and assembly',
  }[service] ?? 'fitness equipment repair'
}

function sourceInstruction(sourceFocus: string) {
  return {
    nextdoor_local: 'Prioritize publicly indexed Nextdoor pages, neighborhood posts, and local community discussions. Use Nextdoor language like "anyone know", "recommend", "looking for", "need someone", and "near me". Avoid private or login-only scraping; only use public search result snippets and URLs.',
    neighborhood_groups: 'Prioritize local community sources such as Nextdoor-indexed pages, Facebook group posts indexed by Google, Reddit city subreddits, Craigslist, city forums, HOA/community pages, and neighborhood bulletin boards.',
    reddit_forums: 'Prioritize Reddit city subreddits, DIY forums, fitness equipment forums, and local discussion boards where people ask for repair recommendations.',
    craigslist_marketplace: 'Prioritize Craigslist, Facebook Marketplace pages indexed by Google, used equipment listings, moving sale posts, and assembly/help wanted posts where a buyer or seller may need disassembly, transport, assembly, or repair.',
    commercial_facilities: 'Prioritize gyms, apartments, hotels, schools, country clubs, corporate fitness centers, physical therapy clinics, and facility pages that show onsite fitness equipment.',
  }[sourceFocus] ?? 'Search across all high-intent local sources, with extra weight on publicly indexed neighborhood recommendation posts.'
}

function seedQueries(mode: string, serviceLabel: string, cityStr: string, sourceFocus: string) {
  if (mode === 'business_discovery') {
    return [
      `"${cityStr}" "fitness center" "treadmill" maintenance`,
      `"${cityStr}" apartment gym fitness center`,
      `"${cityStr}" hotel gym "fitness center"`,
    ]
  }

  const core = [
    `"${cityStr}" "${serviceLabel}" "anyone know"`,
    `"${cityStr}" "need someone" "${serviceLabel}"`,
  ]

  const bySource: Record<string, string[]> = {
    nextdoor_local: [
      `site:nextdoor.com "${cityStr}" "treadmill" "recommend"`,
      `site:nextdoor.com "${cityStr}" "fitness equipment" "anyone know"`,
      `site:nextdoor.com "${cityStr}" "exercise bike" "repair"`,
    ],
    neighborhood_groups: [
      `"${cityStr}" "anyone know" "treadmill repair"`,
      `"${cityStr}" "recommend" "fitness equipment repair"`,
      `"${cityStr}" "help with my treadmill"`,
    ],
    reddit_forums: [
      `site:reddit.com/r/Dallas "treadmill" "repair"`,
      `site:reddit.com/r/FortWorth "treadmill" "repair"`,
      `site:reddit.com "${cityStr}" "fitness equipment repair"`,
    ],
    craigslist_marketplace: [
      `site:craigslist.org "${cityStr}" "treadmill" "assembly"`,
      `site:craigslist.org "${cityStr}" "home gym" "disassemble"`,
      `site:craigslist.org "${cityStr}" "exercise equipment" "repair"`,
    ],
  }

  return [...(bySource[sourceFocus] ?? []), ...core]
}

async function generateQueries(mode: string, service: string, city: string, sourceFocus: string): Promise<string[]> {
  const serviceLabel = serviceLabelFor(service)
  const cityStr = city === 'All DFW' ? 'Dallas Fort Worth' : city
  const sourceGuidance = sourceInstruction(sourceFocus)
  const seeds = seedQueries(mode, serviceLabel, cityStr, sourceFocus)

  const system = mode === 'active_requests'
    ? `You generate Google search queries to find people who are ACTIVELY RIGHT NOW looking for fitness equipment repair or assembly services in a specific city. ${sourceGuidance} Return highly targeted queries that maximize chance of finding real service requests, not business websites. Focus on intent signals: "need", "looking for", "anyone know", "can someone fix", "help with my", "recommend", and "who do you use".`
    : `You generate Google search queries to find gyms, fitness centers, hotels, apartments, corporate offices, schools, and commercial facilities in a specific city that likely have fitness equipment needing professional maintenance and repair. ${sourceGuidance} Return queries that surface different types of commercial facilities with fitness equipment.`

  const text = await claude(system, `Service: ${serviceLabel}
City/Area: ${cityStr}
Source focus: ${sourceFocus}

Seed queries to improve or complement:
${seeds.join('\n')}

Return exactly 5 Google search queries, one per line, no numbering, no quotes around the whole line, no explanation.`)
  const aiQueries = text.split('\n').map((q) => q.trim()).filter((q) => q.length > 5)
  return [...seeds, ...aiQueries].filter((q, index, arr) => arr.indexOf(q) === index).slice(0, 8)
}

async function extractLeads(results: GoogleResult[], mode: string, service: string, city: string, sourceFocus: string): Promise<ScoutLead[]> {
  if (results.length === 0) return []

  const serviceLabel = serviceLabelFor(service)
  const resultsText = results.map((r, i) =>
    `[${i}] TITLE: ${r.title}\nURL: ${r.link}\nSNIPPET: ${r.snippet}`
  ).join('\n\n')

  const system = mode === 'active_requests'
    ? `You are a lead extraction assistant. Given Google search results, extract leads of people who are actively looking for fitness equipment repair or assembly services. For each relevant result, extract all available contact info and score their intent from 1-10. Score 8-10: explicit request or recommendation request from a local person, even if contact info requires replying on the source page. Score 5-7: clear need mentioned but less direct. Score 1-4: vague or low relevance. Ignore business directory listings and service provider sites - we want the CUSTOMERS, not other businesses. Favor local neighborhood intent from ${sourceFocus}.`
    : `You are a lead extraction assistant. Given Google search results for commercial facilities, extract gym/hotel/apartment/corporate office leads that likely have fitness equipment needing maintenance. Extract business name, contact info from the snippet/URL, and score 1-10 based on how likely they are to need professional equipment service (bigger = higher score, older facility = higher score, multiple locations = higher score).`

  const user = `Service context: ${serviceLabel} in ${city === 'All DFW' ? 'Dallas Fort Worth' : city}
Source focus: ${sourceFocus}

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

Only include results with intent_score >= 4. For neighborhood sources like Nextdoor, Reddit, Craigslist, or Facebook, include leads even when email/phone are missing if the source URL is actionable for a manual reply. Return [] if none qualify. Return ONLY the JSON array, no other text.`

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
    const hasEnvVar = Boolean(process.env.ADMIN_BLOG_PASSWORD)
    return NextResponse.json({
      success: false,
      error: hasEnvVar ? 'Unauthorized - wrong password' : 'Unauthorized - ADMIN_BLOG_PASSWORD not set in Vercel env vars',
    }, { status: 401 })
  }

  const { mode, service, city, recency = 'qdr:w', sourceFocus = 'nextdoor_local' } = await request.json()

  if (!mode || !service || !city) {
    return NextResponse.json({ success: false, error: 'Missing mode, service, or city' }, { status: 400 })
  }

  try {
    const queries = await generateQueries(mode, service, city, sourceFocus)

    const allResults: GoogleResult[] = []
    const queriesUsed: string[] = []

    for (const query of queries) {
      try {
        const results = await googleSearch(query, recency)
        allResults.push(...results)
        queriesUsed.push(query)
    } catch (err: unknown) {
      if (errorMessage(err).includes('GOOGLE_SCOUT_CX')) throw err
    }
  }

    const seen = new Set<string>()
    const uniqueResults = allResults.filter((r) => {
      if (seen.has(r.link)) return false
      seen.add(r.link)
      return true
    })

    const leads = await extractLeads(uniqueResults, mode, service, city, sourceFocus)

    leads.sort((a, b) => b.intent_score - a.intent_score)

    return NextResponse.json({
      success: true,
      leads,
      queries_used: queriesUsed,
      total_results_analyzed: uniqueResults.length,
    })
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: errorMessage(err), leads: [], queries_used: [] }, { status: 500 })
  }
}
