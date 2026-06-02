// proxy.ts (Next.js 16 — renamed from middleware.ts)
// Detects visitor intent from UTM params and referrer, sets a persona cookie
// so page components can serve intent-matched content without a round-trip.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COMMERCIAL_SIGNALS = [
  'commercial', 'gym maintenance', 'facility', 'hotel gym', 'apartment gym',
  'corporate gym', 'smartgymops', 'preventative maintenance',
]
const TREADMILL_SIGNALS = ['treadmill', 'belt slipping', 'nordictrack', 'proform', 'incline']
const ELLIPTICAL_SIGNALS = ['elliptical', 'precor', 'life fitness', 'resistance']
const ASSEMBLY_SIGNALS = ['assembly', 'install', 'setup', 'assemble']

function detectPersona(url: URL, referer: string): string | null {
  const combined = [
    url.searchParams.get('utm_term') || '',
    url.searchParams.get('utm_campaign') || '',
    url.searchParams.get('q') || '',
    referer,
  ].join(' ').toLowerCase()

  if (COMMERCIAL_SIGNALS.some(s => combined.includes(s))) return 'commercial'
  if (ASSEMBLY_SIGNALS.some(s => combined.includes(s))) return 'assembly'
  if (TREADMILL_SIGNALS.some(s => combined.includes(s))) return 'treadmill'
  if (ELLIPTICAL_SIGNALS.some(s => combined.includes(s))) return 'elliptical'
  return null
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next()

  // Only run on homepage
  if (request.nextUrl.pathname !== '/') return response

  // Don't overwrite if already set this session
  if (request.cookies.get('2ez_persona')) return response

  const persona = detectPersona(
    request.nextUrl,
    request.headers.get('referer') || ''
  )

  if (persona) {
    response.cookies.set('2ez_persona', persona, {
      maxAge: 1800, // 30 min session
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // readable by client components
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
}
