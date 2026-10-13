import { NextRequest, NextResponse } from 'next/server'
import { checkDayCompatibility, estimateDurationMinutes, geocodeCoords } from '@/lib/dayCompatibility'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const MAX_DATES = 16

// Called once address is filled in, before the customer has picked any date
// yet -- lets the date grid itself show which days actually have real
// availability for this address and job, rather than only telling the
// customer after they've already picked a bad one (that's what
// /api/utils/recommend-date, singular, still does as a second-layer nudge).
// Geocodes the address once here and reuses it across every date's check
// instead of letting checkDayCompatibility re-geocode the same address once
// per date.
export async function POST(req: NextRequest) {
  try {
    const { address, dates, serviceType, details } = await req.json()
    if (!address || typeof address !== 'string' || !Array.isArray(dates)) {
      return NextResponse.json({ success: false, message: 'address and dates[] are required' }, { status: 400 })
    }
    if (address.length > 300 || dates.length === 0 || dates.length > MAX_DATES) {
      return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 400 })
    }
    const cleanDates = dates.filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
    if (cleanDates.length === 0) {
      return NextResponse.json({ success: false, message: 'No valid dates' }, { status: 400 })
    }

    const jobDurationMinutes = estimateDurationMinutes(
      typeof serviceType === 'string' ? serviceType : '',
      typeof details === 'string' ? details : ''
    )

    const newCoords = await geocodeCoords(address)

    const results = await Promise.all(
      cleanDates.map(async (dateIso) => {
        const check = await checkDayCompatibility(dateIso, address, undefined, jobDurationMinutes, newCoords)
        return { dateIso, compatible: check.compatible, reason: check.reason }
      })
    )

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('RECOMMEND DATES ERROR:', error)
    return NextResponse.json({ success: false, message: 'Could not check schedule availability' }, { status: 500 })
  }
}
