import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 17727 Addison Rd, Dallas TX 75287
const BASE_LAT = 32.9447
const BASE_LNG = -96.8389

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Strip autocomplete noise — take everything up to and including the first zip code
function cleanAddress(raw: string): string {
  const zipMatch = raw.match(/^(.+?\b\d{5}\b)/)
  if (zipMatch) return zipMatch[1].trim()
  return raw.split(',').slice(0, 3).join(',').trim()
}

// US Census Bureau Geocoding API — free, no key, reliable from Vercel
async function geocodeCensus(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(address)}&benchmark=2020&format=json`
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) return null
    const data = await res.json()
    const match = data?.result?.addressMatches?.[0]
    if (!match) return null
    return { lat: parseFloat(match.coordinates.y), lng: parseFloat(match.coordinates.x) }
  } catch {
    return null
  }
}

// Nominatim fallback
async function geocodeNominatim(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ', Texas, USA')}&format=json&limit=1&countrycodes=us`
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': '2EZTEK-ServiceApp/1.0 (support@2eztek.com)', 'Accept-Language': 'en' },
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const results = await res.json()
    if (!results?.length) return null
    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json()
    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      return NextResponse.json({ success: false, message: 'Address required.' }, { status: 400 })
    }

    const cleaned = cleanAddress(address.trim())

    // Try Census first, fall back to Nominatim
    const coords = await geocodeCensus(cleaned) ?? await geocodeNominatim(cleaned)

    if (!coords) {
      console.error('GEOCODING FAILED for:', cleaned)
      return NextResponse.json({ success: false, message: 'Address not found.' })
    }

    const miles = Math.round(haversine(BASE_LAT, BASE_LNG, coords.lat, coords.lng))
    return NextResponse.json({ success: true, miles, inRange: miles <= 60 })
  } catch (error: unknown) {
    console.error('DISTANCE API ERROR:', error)
    return NextResponse.json({ success: false, message: 'Distance calculation failed.' }, { status: 500 })
  }
}
