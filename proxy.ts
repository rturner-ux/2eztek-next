// proxy.ts (Next.js 16 — renamed from middleware.ts)
// 1. Detects visitor intent and sets a persona cookie for personalized content
// 2. Blocks known scraper bots and rate-limits aggressive crawlers
// 3. Strips response headers that expose the tech stack
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─── Intent detection ────────────────────────────────────────────────────────
const COMMERCIAL_SIGNALS = [
  'commercial', 'gym maintenance', 'facility', 'hotel gym', 'apartment gym',
  'corporate gym', 'smartgymops', 'preventative maintenance',
]
const TREADMILL_SIGNALS  = ['treadmill', 'belt slipping', 'nordictrack', 'proform', 'incline']
const ELLIPTICAL_SIGNALS = ['elliptical', 'precor', 'life fitness', 'resistance']
const ASSEMBLY_SIGNALS   = ['assembly', 'install', 'setup', 'assemble']

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

// ─── Scraper / bot user agent blocklist ─────────────────────────────────────
const BLOCKED_UA = [
  /python-requests/i, /pycurl/i, /scrapy/i, /httpx/i, /aiohttp/i,
  /go-http-client/i, /java\//i, /curl\//i, /wget\//i, /libwww-perl/i,
  /lwp-trivial/i, /php\//i, /ruby\//i, /axios/i, /node-fetch/i, /got\//i,
  /superagent/i, /okhttp/i, /apache-httpclient/i, /htmlunit/i, /mechanize/i,
  /dataforseo/i, /semrushbot/i, /ahrefsbot/i, /moz\.com/i, /serpstat/i,
  /majestic/i, /sistrix/i, /seobility/i, /dotbot/i, /rogerbot/i,
  /blexbot/i, /linkdexbot/i, /archive\.org_bot/i, /httrack/i,
  /screaming.frog/i, /sitebulb/i, /netcraft/i, /emailcollector/i,
  /emailsiphon/i, /extractorpro/i, /webcopier/i, /webzip/i,
  /teleport/i, /larbin/i, /mj12bot/i,
]

// ─── In-process rate limiter ─────────────────────────────────────────────────
const hits = new Map<string, { count: number; reset: number }>()
const WINDOW_MS = 60_000
const MAX_HITS  = 90    // throttle above this
const HARD_BAN  = 220   // 429 above this

function rateLimit(ip: string): 'ok' | 'throttle' | 'ban' {
  const now   = Date.now()
  const entry = hits.get(ip)

  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS })
    return 'ok'
  }

  entry.count++
  if (entry.count > HARD_BAN) return 'ban'
  if (entry.count > MAX_HITS)  return 'throttle'
  return 'ok'
}

// ─── Security headers ────────────────────────────────────────────────────────
function harden(res: NextResponse): NextResponse {
  res.headers.delete('x-powered-by')
  res.headers.set('x-content-type-options', 'nosniff')
  res.headers.set('x-frame-options', 'SAMEORIGIN')
  res.headers.set('referrer-policy', 'strict-origin-when-cross-origin')
  res.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()')
  return res
}

// ─── Static assets always pass through ──────────────────────────────────────
const ALWAYS_ALLOW = ['/favicon.ico', '/robots.txt', '/sitemap.xml']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ua = request.headers.get('user-agent') || ''
  const ip = (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )

  if (ALWAYS_ALLOW.some((p) => pathname === p)) {
    return harden(NextResponse.next())
  }

  // Block empty user agents (almost always automated)
  if (!ua.trim()) {
    return new NextResponse('Access denied.', { status: 403 })
  }

  // Block known scraper bots
  if (BLOCKED_UA.some((p) => p.test(ua))) {
    return new NextResponse('Access denied.', { status: 403 })
  }

  // Rate limit
  const rl = rateLimit(ip)
  if (rl === 'ban') {
    return new NextResponse('Too many requests.', {
      status: 429,
      headers: { 'retry-after': '60' },
    })
  }

  // Build response
  const response = NextResponse.next()

  if (rl === 'throttle') {
    response.headers.set('x-ratelimit-remaining', '0')
    response.headers.set('retry-after', '10')
  }

  // ── Persona detection (homepage only) ────────────────────────────────────
  if (pathname === '/' && !request.cookies.get('2ez_persona')) {
    const persona = detectPersona(
      request.nextUrl,
      request.headers.get('referer') || ''
    )
    if (persona) {
      response.cookies.set('2ez_persona', persona, {
        maxAge: 1800,
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
      })
    }
  }

  return harden(response)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)', ],
}
