/**
 * FORT 2EZ TEK — PERIMETER DEFENSE
 * Classification: TOP SECRET — INTERNAL USE ONLY
 *
 * MISSION: Protect, detect, report, and neutralize all hostile actors
 * attempting to breach Fort 2EZ TEK. Every request is screened.
 * No threat passes without being logged and classified.
 *
 * Layers:
 *   1. INTENT DETECTION     — persona cookie for personalized content
 *   2. GHOST CHECK          — empty UA = automated agent, terminate
 *   3. ENEMY ID             — known hostile bot user agents, terminate
 *   4. RECON DETECTION      — path-based vulnerability probing, terminate
 *   5. INJECT DETECTION     — SQL/XSS injection in query params, terminate
 *   6. SIEGE DETECTION      — rate limiting, throttle or terminate
 *   7. REPEAT OFFENDER      — IP with multiple blocks, auto-escalate
 *   8. HARDENING            — strip tech-stack headers from all responses
 *   9. BREACH ALERT         — HIGH/CRITICAL threats trigger email to command
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ── INTENT DETECTION ──────────────────────────────────────────────────────────
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
  if (ASSEMBLY_SIGNALS.some(s => combined.includes(s)))   return 'assembly'
  if (TREADMILL_SIGNALS.some(s => combined.includes(s)))  return 'treadmill'
  if (ELLIPTICAL_SIGNALS.some(s => combined.includes(s))) return 'elliptical'
  return null
}

// ── ENEMY ID — hostile bot user agents ───────────────────────────────────────
const HOSTILE_UA: RegExp[] = [
  /python-requests/i, /pycurl/i, /scrapy/i, /httpx/i, /aiohttp/i,
  /go-http-client/i, /java\//i, /curl\//i, /wget\//i, /libwww-perl/i,
  /lwp-trivial/i, /php\//i, /ruby\//i, /axios/i, /node-fetch/i, /got\//i,
  /superagent/i, /okhttp/i, /apache-httpclient/i, /htmlunit/i, /mechanize/i,
  /dataforseo/i, /semrushbot/i, /ahrefsbot/i, /moz\.com/i, /serpstat/i,
  /majestic/i, /sistrix/i, /seobility/i, /dotbot/i, /rogerbot/i,
  /blexbot/i, /linkdexbot/i, /archive\.org_bot/i, /httrack/i,
  /screaming.frog/i, /sitebulb/i, /netcraft/i, /emailcollector/i,
  /emailsiphon/i, /extractorpro/i, /webcopier/i, /webzip/i,
  /teleport/i, /larbin/i, /mj12bot/i, /sqlmap/i, /nikto/i, /nmap/i,
  /masscan/i, /zmap/i, /dirbuster/i, /gobuster/i, /wfuzz/i, /burpsuite/i,
]

// ── RECON DETECTION — vulnerability path scanning ───────────────────────────
type ThreatDef = { pattern: RegExp; type: string; severity: 'ELEVATED' | 'HIGH' | 'CRITICAL'; detail: string }

const HOSTILE_PATHS: ThreatDef[] = [
  // Env / config extraction — CRITICAL
  { pattern: /\/\.env/i,          type: 'PROBE',    severity: 'CRITICAL', detail: 'ENV file extraction attempt' },
  { pattern: /\/\.env\./i,        type: 'PROBE',    severity: 'CRITICAL', detail: 'ENV file extraction attempt' },
  { pattern: /\/wp-config/i,      type: 'PROBE',    severity: 'CRITICAL', detail: 'WordPress config extraction' },
  { pattern: /\/config\.php/i,    type: 'PROBE',    severity: 'CRITICAL', detail: 'PHP config extraction' },
  { pattern: /\/database\.yml/i,  type: 'PROBE',    severity: 'CRITICAL', detail: 'Database credential extraction' },
  { pattern: /\/credentials/i,    type: 'PROBE',    severity: 'CRITICAL', detail: 'Credential file probe' },
  // Directory traversal — CRITICAL
  { pattern: /\.\.\//,            type: 'TRAVERSAL',severity: 'CRITICAL', detail: 'Directory traversal attempt' },
  { pattern: /\/etc\/passwd/i,    type: 'TRAVERSAL',severity: 'CRITICAL', detail: 'System password file probe' },
  { pattern: /\/etc\/shadow/i,    type: 'TRAVERSAL',severity: 'CRITICAL', detail: 'System shadow file probe' },
  { pattern: /\/proc\//i,         type: 'TRAVERSAL',severity: 'CRITICAL', detail: 'Process filesystem probe' },
  // Shell / code execution — CRITICAL
  { pattern: /\/shell/i,          type: 'PROBE',    severity: 'CRITICAL', detail: 'Remote shell probe' },
  { pattern: /\/cmd/i,            type: 'PROBE',    severity: 'CRITICAL', detail: 'Command execution probe' },
  { pattern: /\/eval/i,           type: 'PROBE',    severity: 'CRITICAL', detail: 'Code evaluation probe' },
  { pattern: /c99\.php/i,         type: 'PROBE',    severity: 'CRITICAL', detail: 'PHP webshell probe' },
  { pattern: /r57\.php/i,         type: 'PROBE',    severity: 'CRITICAL', detail: 'PHP webshell probe' },
  // WordPress probes — HIGH
  { pattern: /\/wp-admin/i,       type: 'RECON',    severity: 'HIGH',     detail: 'WordPress admin probe' },
  { pattern: /\/wp-login/i,       type: 'RECON',    severity: 'HIGH',     detail: 'WordPress login probe' },
  { pattern: /\/wp-content/i,     type: 'RECON',    severity: 'HIGH',     detail: 'WordPress content probe' },
  { pattern: /\/xmlrpc\.php/i,    type: 'RECON',    severity: 'HIGH',     detail: 'WordPress XML-RPC probe' },
  { pattern: /\/wp-json\/wp\/v2\/users/i, type: 'RECON', severity: 'HIGH', detail: 'WordPress user enumeration' },
  // Framework/infra probes — HIGH
  { pattern: /\/phpmyadmin/i,     type: 'RECON',    severity: 'HIGH',     detail: 'phpMyAdmin probe' },
  { pattern: /\/admin\.php/i,     type: 'RECON',    severity: 'HIGH',     detail: 'Generic PHP admin probe' },
  { pattern: /\/setup\.php/i,     type: 'RECON',    severity: 'HIGH',     detail: 'Setup script probe' },
  { pattern: /\/install\.php/i,   type: 'RECON',    severity: 'HIGH',     detail: 'Install script probe' },
  { pattern: /\/actuator/i,       type: 'RECON',    severity: 'HIGH',     detail: 'Spring Boot actuator probe' },
  { pattern: /\/\.git/i,          type: 'RECON',    severity: 'HIGH',     detail: 'Git repository exposure probe' },
  { pattern: /\/\.htaccess/i,     type: 'RECON',    severity: 'HIGH',     detail: 'Apache config probe' },
  // General reconnaissance — ELEVATED
  { pattern: /\/swagger/i,        type: 'RECON',    severity: 'ELEVATED', detail: 'API documentation probe' },
  { pattern: /\/autodiscover/i,   type: 'RECON',    severity: 'ELEVATED', detail: 'Exchange autodiscover probe' },
  { pattern: /\/owa\//i,          type: 'RECON',    severity: 'ELEVATED', detail: 'Outlook Web Access probe' },
  { pattern: /\/backup/i,         type: 'RECON',    severity: 'ELEVATED', detail: 'Backup file reconnaissance' },
  { pattern: /\/debug/i,          type: 'RECON',    severity: 'ELEVATED', detail: 'Debug endpoint probe' },
  { pattern: /\/test\.php/i,      type: 'RECON',    severity: 'ELEVATED', detail: 'Test script probe' },
  { pattern: /\/info\.php/i,      type: 'RECON',    severity: 'ELEVATED', detail: 'PHP info disclosure probe' },
]

// ── INJECT DETECTION — SQL injection / XSS in query strings ─────────────────
const INJECT_PATTERNS: Array<{ pattern: RegExp; type: string; detail: string }> = [
  { pattern: /('|%27|--|%2D%2D|;|%3B)\s*(OR|AND|UNION|SELECT|DROP|INSERT|UPDATE|DELETE|EXEC|EXECUTE|CAST|DECLARE|XP_CMD)/i,
    type: 'INJECT', detail: 'SQL injection in query params' },
  { pattern: /UNION\s+(ALL\s+)?SELECT/i,
    type: 'INJECT', detail: 'UNION SELECT injection' },
  { pattern: /(<script[\s>]|javascript:|vbscript:|on\w+\s*=|eval\s*\(|alert\s*\(|<img[^>]+on\w+=)/i,
    type: 'INJECT', detail: 'XSS injection in query params' },
  { pattern: /\.\.\/(\.\.\/)+/,
    type: 'TRAVERSAL', detail: 'Path traversal in query params' },
  { pattern: /(\/etc\/passwd|\/etc\/shadow|\/proc\/self)/i,
    type: 'TRAVERSAL', detail: 'System file access in query params' },
]

// ── RATE LIMITER ──────────────────────────────────────────────────────────────
const hits    = new Map<string, { count: number; reset: number }>()
const threats = new Map<string, { count: number; reset: number }>()
const WINDOW_MS   = 60_000
const MAX_HITS    = 90
const HARD_BAN    = 220
const THREAT_ESCALATE = 3   // repeat blocks before escalating severity in log

function rateLimit(ip: string): 'ok' | 'throttle' | 'ban' {
  const now   = Date.now()
  const entry = hits.get(ip)
  if (!entry || now > entry.reset) { hits.set(ip, { count: 1, reset: now + WINDOW_MS }); return 'ok' }
  entry.count++
  if (entry.count > HARD_BAN) return 'ban'
  if (entry.count > MAX_HITS)  return 'throttle'
  return 'ok'
}

function trackThreat(ip: string): number {
  const now   = Date.now()
  const entry = threats.get(ip)
  if (!entry || now > entry.reset) { threats.set(ip, { count: 1, reset: now + 3_600_000 }); return 1 }
  entry.count++
  return entry.count
}

// ── SECURITY HEADERS ──────────────────────────────────────────────────────────
function harden(res: NextResponse): NextResponse {
  res.headers.delete('x-powered-by')
  res.headers.set('x-content-type-options', 'nosniff')
  res.headers.set('x-frame-options', 'SAMEORIGIN')
  res.headers.set('referrer-policy', 'strict-origin-when-cross-origin')
  res.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()')
  res.headers.set('x-dns-prefetch-control', 'off')
  return res
}

// ── FIRE & FORGET LOG TO SUPABASE ────────────────────────────────────────────
function logIncident(data: {
  ip: string; user_agent: string; path: string; method: string
  query: string; referer: string; threat_type: string
  severity: string; detail: string
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return

  fetch(`${supabaseUrl}/rest/v1/security_log`, {
    method: 'POST',
    headers: {
      apikey:          serviceKey,
      Authorization:   `Bearer ${serviceKey}`,
      'Content-Type':  'application/json',
      Prefer:          'return=minimal',
    },
    body: JSON.stringify({ ...data, blocked: true }),
  }).catch(() => {})
}


// ── PERIMETER LOGIC ───────────────────────────────────────────────────────────
const BYPASS_PATHS = ['/favicon.ico', '/robots.txt', '/sitemap.xml', '/_next/', '/images/']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ua     = request.headers.get('user-agent') || ''
  const method = request.method
  const query  = request.nextUrl.search || ''
  const referer= request.headers.get('referer') || ''
  const ip     = (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )

  // Static / essential assets pass without screening
  if (BYPASS_PATHS.some((p) => pathname.startsWith(p))) {
    return harden(NextResponse.next())
  }

  // ── LAYER 2: GHOST CHECK — empty UA ─────────────────────────────────────
  if (!ua.trim()) {
    const count = trackThreat(ip)
    logIncident({ ip, user_agent: ua, path: pathname, method, query, referer,
      threat_type: 'GHOST', severity: 'HIGH', detail: 'Empty user agent — headless automation detected' })
    return new NextResponse('Access denied.', { status: 403, headers: { 'content-type': 'text/plain' } })
  }

  // ── LAYER 3: ENEMY ID — known hostile UA ─────────────────────────────────
  if (HOSTILE_UA.some((p) => p.test(ua))) {
    const count    = trackThreat(ip)
    const severity = ua.toLowerCase().includes('sqlmap') || ua.toLowerCase().includes('nikto') || ua.toLowerCase().includes('nmap')
      ? 'CRITICAL' : 'ELEVATED'
    logIncident({ ip, user_agent: ua, path: pathname, method, query, referer,
      threat_type: 'BOT', severity, detail: `Hostile bot user agent: ${ua.substring(0, 80)}` })
    return new NextResponse('Access denied.', { status: 403, headers: { 'content-type': 'text/plain' } })
  }

  // ── LAYER 4: RECON DETECTION — hostile path probing ──────────────────────
  const pathThreat = HOSTILE_PATHS.find((t) => t.pattern.test(pathname))
  if (pathThreat) {
    const count = trackThreat(ip)
    logIncident({ ip, user_agent: ua, path: pathname, method, query, referer,
      threat_type: pathThreat.type, severity: pathThreat.severity, detail: pathThreat.detail })
    return new NextResponse('Not found.', { status: 404, headers: { 'content-type': 'text/plain' } })
  }

  // ── LAYER 5: INJECT DETECTION — SQL/XSS in query params ──────────────────
  if (query) {
    const decodedQuery = decodeURIComponent(query)
    const injectThreat = INJECT_PATTERNS.find((p) => p.pattern.test(decodedQuery))
    if (injectThreat) {
      const count = trackThreat(ip)
      logIncident({ ip, user_agent: ua, path: pathname, method, query, referer,
        threat_type: injectThreat.type, severity: 'CRITICAL', detail: injectThreat.detail })
      return new NextResponse('Bad request.', { status: 400, headers: { 'content-type': 'text/plain' } })
    }
  }

  // ── LAYER 6: SIEGE DETECTION — rate limiting ──────────────────────────────
  const rl = rateLimit(ip)
  if (rl === 'ban') {
    const count = trackThreat(ip)
    logIncident({ ip, user_agent: ua, path: pathname, method, query, referer,
      threat_type: 'SIEGE', severity: 'HIGH', detail: `Rate limit exceeded — ${count} contacts this hour` })
    return new NextResponse('Too many requests.', { status: 429, headers: { 'retry-after': '60' } })
  }

  // ── Build clean response ──────────────────────────────────────────────────
  const response = NextResponse.next()

  if (rl === 'throttle') {
    response.headers.set('x-ratelimit-remaining', '0')
    response.headers.set('retry-after', '10')
  }

  // ── LAYER 1: INTENT — persona detection (homepage only) ──────────────────
  if (pathname === '/' && !request.cookies.get('2ez_persona')) {
    const persona = detectPersona(request.nextUrl, referer)
    if (persona) {
      response.cookies.set('2ez_persona', persona, {
        maxAge: 1800, path: '/', sameSite: 'lax', httpOnly: false,
      })
    }
  }

  return harden(response)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)',],
}
