import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 2EZ TEK base — zip code 75287, Dallas TX
const BASE_LAT = 32.970
const BASE_LNG = -96.836

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8 // miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json()
    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      return NextResponse.json({ success: false, message: 'Address required.' }, { status: 400 })
    }

    const query = encodeURIComponent(address.trim() + ', Texas, USA')
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=us`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': '2EZTEK-ServiceApp/1.0 (support@2eztek.com)',
        'Accept-Language': 'en',
      },
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json({ success: false, message: 'Geocoding unavailable.' }, { status: 502 })
    }

    const results = await res.json()
    if (!results || results.length === 0) {
      return NextResponse.json({ success: false, message: 'Address not found.' })
    }

    const { lat, lon } = results[0]
    const miles = haversine(BASE_LAT, BASE_LNG, parseFloat(lat), parseFloat(lon))
    const rounded = Math.round(miles)

    return NextResponse.json({ success: true, miles: rounded, inRange: rounded <= 60 })
  } catch (error: unknown) {
    console.error('DISTANCE API ERROR:', error)
    return NextResponse.json({ success: false, message: 'Distance calculation failed.' }, { status: 500 })
  }
}
