import { NextRequest, NextResponse } from 'next/server'
import { recommendDate, estimateDurationMinutes } from '@/lib/dayCompatibility'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Called live as the customer fills out the booking form (address +
// preferred date both set), before they submit. Lets the form nudge them
// toward the most efficient day up front instead of only catching a bad
// pick at submission time.
export async function POST(req: NextRequest) {
  try {
    const { address, dateIso, serviceType, details, lang } = await req.json()
    if (!address || !dateIso || typeof address !== 'string' || typeof dateIso !== 'string') {
      return NextResponse.json({ success: false, message: 'address and dateIso are required' }, { status: 400 })
    }
    if (address.length > 300 || !/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) {
      return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 400 })
    }

    const jobDurationMinutes = estimateDurationMinutes(
      typeof serviceType === 'string' ? serviceType : '',
      typeof details === 'string' ? details : ''
    )

    const recommendation = await recommendDate(address, dateIso, jobDurationMinutes, lang === 'es' ? 'es' : 'en')
    return NextResponse.json({ success: true, ...recommendation })
  } catch (error) {
    console.error('RECOMMEND DATE ERROR:', error)
    return NextResponse.json({ success: false, message: 'Could not check schedule efficiency' }, { status: 500 })
  }
}
