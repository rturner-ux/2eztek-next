import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LEAGUES: { key: string; label: string; path: string }[] = [
  { key: 'worldcup', label: 'World Cup', path: 'soccer/fifa.world' },
  { key: 'mlb', label: 'MLB', path: 'baseball/mlb' },
  { key: 'mls', label: 'MLS', path: 'soccer/usa.1' },
  { key: 'epl', label: 'Premier League', path: 'soccer/eng.1' },
  { key: 'nba', label: 'NBA', path: 'basketball/nba' },
  { key: 'nfl', label: 'NFL', path: 'football/nfl' },
  { key: 'nhl', label: 'NHL', path: 'hockey/nhl' },
]

type ScoreItem = {
  league: string
  home: string
  homeScore: string
  away: string
  awayScore: string
  status: 'live' | 'final' | 'scheduled'
  detail: string
}

const STATUS_ORDER: Record<ScoreItem['status'], number> = { live: 0, scheduled: 1, final: 2 }

async function fetchLeague(league: (typeof LEAGUES)[number]): Promise<ScoreItem[]> {
  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/${league.path}/scoreboard`,
    { cache: 'no-store', signal: AbortSignal.timeout(5000) }
  )
  if (!res.ok) return []
  const data = await res.json()

  const events = Array.isArray(data.events) ? data.events : []
  return events.slice(0, 6).map((event: any): ScoreItem | null => {
    const competition = event.competitions?.[0]
    const competitors = competition?.competitors ?? []
    const home = competitors.find((c: any) => c.homeAway === 'home')
    const away = competitors.find((c: any) => c.homeAway === 'away')
    if (!home || !away) return null

    const state = event.status?.type?.state as string | undefined
    const status: ScoreItem['status'] =
      state === 'in' ? 'live' : state === 'post' ? 'final' : 'scheduled'

    return {
      league: league.label,
      home: home.team?.shortDisplayName ?? home.team?.abbreviation ?? 'Home',
      homeScore: home.score ?? '',
      away: away.team?.shortDisplayName ?? away.team?.abbreviation ?? 'Away',
      awayScore: away.score ?? '',
      status,
      detail: event.status?.type?.shortDetail ?? '',
    }
  }).filter((item: ScoreItem | null): item is ScoreItem => item !== null)
}

export async function GET() {
  try {
    const results = await Promise.allSettled(LEAGUES.map(fetchLeague))
    const items = results
      .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
      .slice(0, 24)

    return NextResponse.json(
      { success: true, updatedAt: new Date().toISOString(), items },
      { headers: { 'Cache-Control': 'public, s-maxage=45, stale-while-revalidate=120' } }
    )
  } catch (error: any) {
    console.error('SPORTS SCORES ERROR:', error)
    return NextResponse.json({ success: false, error: error.message, items: [] }, { status: 500 })
  }
}
