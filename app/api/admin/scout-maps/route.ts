import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type MapPlace = {
  title: string
  address: string
  phoneNumber?: string
  website?: string
  rating?: number
  ratingCount?: number
  category?: string
}

type MapsLead = {
  name: string
  address: string
  phone?: string
  website?: string
  rating?: number
  reviewCount?: number
  category?: string
  intent_score: number
  intent_reason: string
}

function checkPassword(req: Request) {
  const pw = req.headers.get('x-admin-password')
  return Boolean(pw && pw === process.env.ADMIN_BLOG_PASSWORD)
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong'
}

async function mapsSearch(query: string): Promise<MapPlace[]> {
  if (!process.env.SERPER_API_KEY) {
    throw new Error('SERPER_API_KEY is not set in Vercel environment variables.')
  }

  const res = await fetch('https://google.serper.dev/maps', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, gl: 'us', hl: 'en', num: 20 }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(`Serper Maps error: ${data.message ?? res.statusText}`)
  }

  return (data.places ?? []) as MapPlace[]
}

function scorePlace(place: MapPlace, facilityType: string): { score: number; reason: string } {
  let score = 5
  const reasons: string[] = []

  const reviews = place.ratingCount ?? 0
  const rating = place.rating ?? 0
  const cat = (place.category ?? '').toLowerCase()

  if (reviews > 200) { score += 2; reasons.push(`${reviews} reviews suggests high traffic`) }
  else if (reviews > 75) { score += 1; reasons.push(`${reviews} reviews, moderate traffic`) }

  if (facilityType === 'hotel') {
    score += 1
    reasons.push('Hotels cycle cardio equipment heavily')
    if (cat.includes('hotel') || cat.includes('resort')) { score += 1 }
  }

  if (facilityType === 'apartment') {
    score += 1
    reasons.push('Apartment fitness centers often lack dedicated maintenance')
    if (cat.includes('apartment') || cat.includes('condominium')) { score += 1 }
  }

  if (facilityType === 'gym') {
    if (cat.includes('gym') || cat.includes('fitness') || cat.includes('sport')) {
      score += 1
      reasons.push('Active fitness facility with frequent equipment use')
    }
  }

  if (facilityType === 'corporate') {
    score += 1
    reasons.push('Corporate wellness centers rarely have in-house technicians')
  }

  if (rating > 0 && rating < 3.8) {
    score += 1
    reasons.push(`Lower rating (${rating}) may indicate maintenance issues`)
  }

  if (!place.website) {
    score = Math.max(score - 1, 1)
    reasons.push('No website found')
  }

  return {
    score: Math.min(score, 10),
    reason: reasons.length > 0
      ? reasons.join('. ') + '.'
      : `${place.category ?? 'Facility'} in DFW, likely has fitness equipment needing service.`,
  }
}

const FACILITY_QUERIES: Record<string, string[]> = {
  hotel: [
    'hotel with fitness center Dallas TX',
    'hotel gym Fort Worth TX',
    'hotel fitness center Plano TX',
    'hotel with gym Frisco TX',
    'hotel fitness room Arlington TX',
  ],
  apartment: [
    'apartment complex with fitness center Dallas TX',
    'apartment gym Fort Worth TX',
    'luxury apartments fitness center Plano TX',
    'apartment complex fitness room Frisco TX',
    'apartment complex gym Arlington TX',
  ],
  gym: [
    'commercial gym Dallas TX',
    'fitness center Fort Worth TX',
    'health club Plano TX',
    'sports club Frisco TX',
    'fitness studio Dallas TX',
  ],
  corporate: [
    'corporate fitness center Dallas TX',
    'office building gym Dallas TX',
    'corporate wellness center Fort Worth TX',
    'company gym facility Plano TX',
  ],
}

export async function POST(request: NextRequest) {
  if (!checkPassword(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { facilityType = 'all', city = 'All DFW' } = await request.json()

  const types = facilityType === 'all'
    ? ['hotel', 'apartment', 'gym', 'corporate']
    : [facilityType]

  try {
    const allPlaces: Array<{ place: MapPlace; facilityType: string }> = []
    const queriesUsed: string[] = []

    for (const type of types) {
      const queries = city === 'All DFW'
        ? FACILITY_QUERIES[type] ?? []
        : [`${city} ${type === 'apartment' ? 'apartment complex with fitness center' : type + ' fitness center'} TX`]

      for (const query of queries.slice(0, 3)) {
        try {
          const places = await mapsSearch(query)
          allPlaces.push(...places.map((p) => ({ place: p, facilityType: type })))
          queriesUsed.push(query)
        } catch {
          // skip failed queries
        }
      }
    }

    const seen = new Set<string>()
    const uniquePlaces = allPlaces.filter(({ place }) => {
      const key = place.title + place.address
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    const leads: MapsLead[] = uniquePlaces.map(({ place, facilityType: type }) => {
      const { score, reason } = scorePlace(place, type)
      return {
        name: place.title,
        address: place.address,
        phone: place.phoneNumber,
        website: place.website,
        rating: place.rating,
        reviewCount: place.ratingCount,
        category: place.category,
        intent_score: score,
        intent_reason: reason,
      }
    })

    leads.sort((a, b) => b.intent_score - a.intent_score)

    return NextResponse.json({
      success: true,
      leads,
      queries_used: queriesUsed,
      total_analyzed: uniquePlaces.length,
    })
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: errorMessage(err), leads: [], queries_used: [] }, { status: 500 })
  }
}
