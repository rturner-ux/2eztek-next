'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import AdminGate from '@/components/AdminGate'

type QueryRow = {
  query: string
  count: number
  lastSeen: string
  covered: boolean
}

type RankingRow = {
  id: string
  keyword: string
  our_rank: number | null
  competitor_rank: number | null
  competitor_domain: string | null
  checked_at: string
}

type KeywordSummary = {
  keyword: string
  latestRank: number | null
  competitorRank: number | null
  competitorDomain: string | null
  trend: 'improving' | 'declining' | 'stable' | 'new'
  checks: number
  lastChecked: string
  rankHistory: Array<number | null>
}

const CHART_STYLE = {
  tooltip: {
    contentStyle: { background: '#0d1117', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 },
    cursor: { fill: 'rgba(255,255,255,0.04)' },
  },
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function rankLabel(rank: number | null) {
  return rank ? `#${rank}` : '—'
}

function RankBadge({ rank }: { rank: number | null }) {
  if (!rank) return <span className="text-red-400 font-black text-sm">Not ranking</span>
  const cls = rank <= 5 ? 'text-emerald-400' : rank <= 10 ? 'text-yellow-400' : 'text-white/60'
  return <span className={`font-black text-sm ${cls}`}>#{rank}</span>
}

function TrendBadge({ trend }: { trend: KeywordSummary['trend'] }) {
  const map = {
    improving: <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold">↑ Improving</span>,
    declining: <span className="inline-flex items-center gap-1 text-red-400 text-xs font-bold">↓ Declining</span>,
    stable: <span className="inline-flex items-center gap-1 text-white/35 text-xs font-bold">→ Stable</span>,
    new: <span className="inline-flex items-center gap-1 text-cyan-400 text-xs font-bold">★ New</span>,
  }
  return map[trend]
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.08] bg-white/[0.03] ${className}`}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35 mb-4">{children}</div>
}

const COMPARE_COLORS = ['#22d3ee', '#a78bfa', '#fb923c', '#4ade80']

export default function CompetitorIntelPage() {
  const [rows, setRows] = useState<RankingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [keywordFilter, setKeywordFilter] = useState('')
  const [domainFilter, setDomainFilter] = useState('All')
  const [trendFilter, setTrendFilter] = useState<'All' | KeywordSummary['trend']>('All')
  const [historyKeyword, setHistoryKeyword] = useState<string | null>(null)
  const [compareKeywords, setCompareKeywords] = useState<string[]>([])
  const [backlinkStats, setBacklinkStats] = useState<{ total: number; live: number; submitted: number } | null>(null)

  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState('')
  const [debugKeyword, setDebugKeyword] = useState('treadmill repair Dallas')
  const [debugging, setDebugging] = useState(false)
  const [debugResult, setDebugResult] = useState<any>(null)
  const [searchQueries, setSearchQueries] = useState<QueryRow[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  function loadData() {
    const password = localStorage.getItem('blogAdminPassword') || ''
    setLoading(true)
    setError('')
    fetch('/api/admin/competitor-intel', { headers: { 'x-admin-password': password } })
      .then(r => r.json())
      .then(data => { if (data.success) setRows(data.rankings); else setError(data.error || 'Failed to load') })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }

  function loadSearchQueries() {
    const password = localStorage.getItem('blogAdminPassword') || ''
    setSearchLoading(true)
    fetch('/api/admin/search-insights', { headers: { 'x-admin-password': password } })
      .then(r => r.json())
      .then(data => { if (data.success) setSearchQueries(data.queries || []) })
      .catch(() => {})
      .finally(() => setSearchLoading(false))
  }

  function loadBacklinkStats() {
    const password = localStorage.getItem('blogAdminPassword') || ''
    fetch('/api/admin/backlinks', { headers: { 'x-admin-password': password } })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const targets = data.targets || []
          setBacklinkStats({
            total: targets.length,
            live: targets.filter((t: { status: string }) => t.status === 'live').length,
            submitted: targets.filter((t: { status: string }) => t.status === 'submitted').length,
          })
        }
      })
      .catch(() => {})
  }

  useEffect(() => { loadData(); loadSearchQueries(); loadBacklinkStats() }, [])

  async function runScan() {
    const password = localStorage.getItem('blogAdminPassword') || ''
    setScanning(true)
    setScanResult('')
    try {
      const res = await fetch('/api/admin/competitor-intel/trigger', {
        method: 'POST',
        headers: { 'x-admin-password': password },
      })
      const data = await res.json()
      if (data.success) {
        setScanResult(`Scan complete — ${data.gaps ?? 0} gaps found, ${data.posts ?? 0} posts published. Pool: ${data.poolSize ?? 0} keywords (${data.discovered ?? 0} newly discovered).`)
        loadData()
      } else {
        setScanResult(`Scan failed: ${data.error || 'Unknown error'}`)
      }
    } catch {
      setScanResult('Scan failed: network error.')
    } finally {
      setScanning(false)
    }
  }

  async function runDebug() {
    const password = localStorage.getItem('blogAdminPassword') || ''
    setDebugging(true)
    setDebugResult(null)
    try {
      const res = await fetch(`/api/admin/competitor-intel/debug?keyword=${encodeURIComponent(debugKeyword)}`, {
        headers: { 'x-admin-password': password },
      })
      setDebugResult(await res.json())
    } catch {
      setDebugResult({ error: 'Network error' })
    } finally {
      setDebugging(false)
    }
  }

  const summaries = useMemo<KeywordSummary[]>(() => {
    const grouped = rows.reduce((acc: Record<string, RankingRow[]>, row) => {
      ;(acc[row.keyword] ??= []).push(row)
      return acc
    }, {})

    return Object.values(grouped)
      .map((krows) => {
        const sorted = [...krows].sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime())
        const latest = sorted[0]
        const prev = sorted[1]
        let trend: KeywordSummary['trend'] = 'stable'
        if (!prev) trend = 'new'
        else if (latest.our_rank && prev.our_rank) {
          if (latest.our_rank < prev.our_rank) trend = 'improving'
          else if (latest.our_rank > prev.our_rank) trend = 'declining'
        }
        return {
          keyword: latest.keyword,
          latestRank: latest.our_rank,
          competitorRank: latest.competitor_rank,
          competitorDomain: latest.competitor_domain,
          trend,
          checks: krows.length,
          lastChecked: latest.checked_at,
          rankHistory: sorted.slice(0, 6).map(r => r.our_rank ?? null).reverse(),
        }
      })
      .sort((a, b) => {
        if (!a.latestRank && b.latestRank) return 1
        if (a.latestRank && !b.latestRank) return -1
        return (a.latestRank ?? 99) - (b.latestRank ?? 99)
      })
  }, [rows])

  const filtered = useMemo(() => summaries.filter(s => {
    if (keywordFilter && !s.keyword.toLowerCase().includes(keywordFilter.toLowerCase())) return false
    if (domainFilter !== 'All' && s.competitorDomain !== domainFilter) return false
    if (trendFilter !== 'All' && s.trend !== trendFilter) return false
    return true
  }), [summaries, keywordFilter, domainFilter, trendFilter])

  const domains = useMemo(() => ['All', ...Array.from(new Set(summaries.map(s => s.competitorDomain).filter(Boolean) as string[]))], [summaries])

  // KPIs (always from all summaries, not filtered)
  const total = summaries.length
  const notRanking = summaries.filter(s => !s.latestRank).length
  const top5 = summaries.filter(s => s.latestRank && s.latestRank <= 5).length
  const top10 = summaries.filter(s => s.latestRank && s.latestRank <= 10).length
  const avgRank = total ? Math.round(summaries.filter(s => s.latestRank).reduce((sum, s) => sum + s.latestRank!, 0) / (total - notRanking || 1)) : null

  // Rank history
  const historyKeywords = summaries.slice(0, 10)
  const activeHistoryKw = historyKeyword ?? historyKeywords[0]?.keyword ?? null
  const historySummary = summaries.find(s => s.keyword === activeHistoryKw) ?? null
  const historyData = historySummary?.rankHistory.map((rank, i) => ({ check: `Check ${i + 1}`, rank: rank ?? null })) ?? []

  // Compare
  const compareOptions = summaries.slice(0, 10)
  const toggleCompare = (kw: string) => setCompareKeywords(prev =>
    prev.includes(kw) ? prev.filter(k => k !== kw) : prev.length < 4 ? [...prev, kw] : prev
  )
  const compareData = useMemo(() => {
    if (!compareKeywords.length) return []
    const maxLen = Math.max(...compareKeywords.map(kw => summaries.find(s => s.keyword === kw)?.rankHistory.length ?? 0))
    return Array.from({ length: maxLen }, (_, i) => {
      const row: Record<string, string | number> = { check: `Check ${i + 1}` }
      compareKeywords.forEach(kw => {
        const rank = summaries.find(s => s.keyword === kw)?.rankHistory[i]
        if (rank != null) row[kw] = rank
      })
      return row
    })
  }, [compareKeywords, summaries])

  // Charts
  const trendChartData = [
    { name: 'Improving', value: summaries.filter(s => s.trend === 'improving').length, fill: '#4ade80' },
    { name: 'Declining', value: summaries.filter(s => s.trend === 'declining').length, fill: '#f87171' },
    { name: 'Stable', value: summaries.filter(s => s.trend === 'stable').length, fill: '#94a3b8' },
    { name: 'New', value: summaries.filter(s => s.trend === 'new').length, fill: '#22d3ee' },
  ]
  const distData = [
    { name: 'Top 5', value: top5 },
    { name: '6–10', value: top10 - top5 },
    { name: '11–20', value: summaries.filter(s => s.latestRank && s.latestRank > 10 && s.latestRank <= 20).length },
    { name: '21+', value: summaries.filter(s => !s.latestRank || s.latestRank > 20).length },
  ]

  // Opportunities (all summaries, not filtered)
  const opportunities = summaries.filter(s => !s.latestRank || s.latestRank > 10).slice(0, 6)

  // Cross-reference: which customer search queries match a tracked keyword?
  const trackedKeywordSet = summaries.map(s => s.keyword.toLowerCase())
  function matchesTracked(query: string): string | null {
    const qWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    for (const kw of trackedKeywordSet) {
      const kwWords = kw.split(/\s+/).filter(w => w.length > 3)
      if (qWords.filter(w => kwWords.includes(w) || kw.includes(w)).length >= 2) return kw
    }
    return null
  }
  const untrackedQueries = searchQueries.filter(q => !matchesTracked(q.query))
  const trackedQueries = searchQueries.filter(q => matchesTracked(q.query))

  return (
    <AdminGate title="Competitor Intelligence">
      <main className="min-h-screen bg-[#0a0f1a] text-white">
        <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">

          {/* Header */}
          <div className="mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Admin</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Competitor Intelligence</h1>
            <p className="mt-1 text-sm text-white/40">Keyword ranking gaps vs competitors — updated every Wednesday.</p>
          </div>

          {/* Backlink summary */}
          {backlinkStats !== null && (
            <div className="mb-6">
              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <SectionLabel>Backlink authority</SectionLabel>
                    <div className="flex gap-6 -mt-2">
                      <div>
                        <span className="text-2xl font-black text-emerald-400">{backlinkStats.live}</span>
                        <span className="ml-1.5 text-xs text-white/30">live links</span>
                      </div>
                      <div>
                        <span className="text-2xl font-black text-amber-400">{backlinkStats.submitted}</span>
                        <span className="ml-1.5 text-xs text-white/30">pending</span>
                      </div>
                      <div>
                        <span className="text-2xl font-black text-white/40">{backlinkStats.total}</span>
                        <span className="ml-1.5 text-xs text-white/30">targets</span>
                      </div>
                    </div>
                    {backlinkStats.total > 0 && (
                      <div className="mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${Math.round(backlinkStats.live / backlinkStats.total * 100)}%` }} />
                      </div>
                    )}
                  </div>
                  <a href="/admin/backlinks" className="flex items-center gap-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20 px-4 py-2.5 text-sm font-black text-emerald-400 transition hover:bg-emerald-400/20">
                    Manage Backlinks →
                  </a>
                </div>
                {backlinkStats.total === 0 && (
                  <p className="mt-3 text-xs text-white/30">No backlink targets yet. <a href="/admin/backlinks" className="text-emerald-400 hover:underline">Set up backlink tracking →</a></p>
                )}
              </Card>
            </div>
          )}

          <div className="mb-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={runScan}
              disabled={scanning}
              className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {scanning && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" />}
              {scanning ? 'Running scan…' : 'Run Scan Now'}
            </button>
            {scanResult && (
              <p className={`text-sm font-medium ${scanResult.startsWith('Scan failed') ? 'text-red-400' : 'text-emerald-400'}`}>
                {scanResult}
              </p>
            )}
          </div>

          {/* Debug panel */}
          <div className="mb-8">
            <Card className="p-5">
              <SectionLabel>Search debug</SectionLabel>
              <p className="text-xs text-white/30 mb-4 -mt-2">Run a single keyword through Google and see the raw results to diagnose why gaps aren&apos;t being found.</p>
              <div className="flex flex-wrap gap-3 items-end">
                <input
                  value={debugKeyword}
                  onChange={e => setDebugKeyword(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') runDebug() }}
                  placeholder="treadmill repair Dallas"
                  className="flex-1 min-w-[220px] rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-400/60"
                />
                <button
                  type="button"
                  onClick={runDebug}
                  disabled={debugging}
                  className="flex items-center gap-2 rounded-lg border border-cyan-400/40 px-4 py-2 text-sm font-bold text-cyan-400 hover:bg-cyan-400/10 transition disabled:opacity-50"
                >
                  {debugging && <span className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />}
                  {debugging ? 'Searching…' : 'Test Search'}
                </button>
              </div>
              {debugResult && (
                <div className="mt-4 space-y-3">
                  {debugResult.error ? (
                    <p className="text-sm text-red-400">{debugResult.error}: {JSON.stringify(debugResult.details ?? '')}</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-white/40">Keyword: <span className="text-white">{debugResult.keyword}</span></span>
                        <span className="text-white/40">Our rank: <span className={debugResult.ourRank === 'Not in top 10' ? 'text-red-400' : 'text-emerald-400'}>{debugResult.ourRank}</span></span>
                        <span className="text-white/40">Total results: <span className="text-white">{debugResult.totalResults ?? '—'}</span></span>
                      </div>
                      <div>
                        <p className="text-xs text-white/30 mb-2">Competitor ranks:</p>
                        <div className="flex flex-wrap gap-2">
                          {(debugResult.competitors ?? []).map((c: any) => (
                            <span key={c.domain} className={`rounded-lg px-3 py-1 text-xs font-semibold ${c.rank ? 'bg-red-500/15 text-red-300' : 'bg-white/[0.04] text-white/30'}`}>
                              {c.domain} {c.rank ? `#${c.rank}` : 'not found'}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-white/30 mb-2">Top 10 domains returned:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(debugResult.top10Domains ?? []).map((d: string, i: number) => (
                            <span key={i} className="rounded-md bg-white/[0.05] px-2 py-1 text-xs text-white/50">
                              #{i + 1} {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Card>
          </div>

          {loading && (
            <div className="flex items-center gap-3 text-sm text-white/40">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />
              Loading rankings…
            </div>
          )}
          {error && (
            <Card className="px-5 py-4 border-red-500/20 bg-red-500/5 text-sm text-red-300">{error}</Card>
          )}

          {!loading && !error && summaries.length === 0 && (
            <Card className="px-6 py-12 text-center">
              <p className="text-white/40 text-sm">No ranking data yet.</p>
              <p className="mt-1 text-white/25 text-xs">The competitor-gap cron runs every Wednesday at 10 AM UTC.</p>
            </Card>
          )}

          {!loading && !error && summaries.length > 0 && (
            <div className="space-y-6">

              {/* KPI row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  { label: 'Tracked', value: total, color: 'text-white' },
                  { label: 'Top 5', value: top5, color: 'text-emerald-400' },
                  { label: 'Top 10', value: top10, color: 'text-yellow-400' },
                  { label: 'Not ranking', value: notRanking, color: 'text-red-400' },
                  { label: 'Avg rank', value: avgRank ? `#${avgRank}` : '—', color: 'text-cyan-400' },
                ].map(kpi => (
                  <Card key={kpi.label} className="p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{kpi.label}</p>
                    <p className={`mt-1.5 text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
                  </Card>
                ))}
              </div>

              {/* Customer Search Intelligence */}
              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                  <SectionLabel>Customer search intelligence</SectionLabel>
                  <a href="/admin/search-insights" className="text-[10px] font-black uppercase tracking-widest text-amber-400/70 hover:text-amber-400 transition-colors">
                    Full Insights →
                  </a>
                </div>
                <p className="text-xs text-white/30 mb-5 -mt-2">Real searches from customers who booked — cross-referenced against tracked keywords.</p>

                {searchLoading ? (
                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
                    Loading search queries…
                  </div>
                ) : searchQueries.length === 0 ? (
                  <p className="text-xs text-white/25">No customer search queries recorded yet.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-3 mb-5">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <p className="text-2xl font-black text-amber-400">{searchQueries.length}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">Converting queries</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <p className="text-2xl font-black text-red-400">{untrackedQueries.length}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">Untracked gaps</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <p className="text-2xl font-black text-emerald-400">{trackedQueries.length}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">Already tracked</p>
                    </div>
                  </div>
                )}

                {untrackedQueries.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-400/70 mb-3">
                      Untracked converting keywords — add these to your scan pool
                    </p>
                    <div className="space-y-2">
                      {untrackedQueries.slice(0, 8).map((q, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
                          <span className="flex-shrink-0 rounded-full border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-400">
                            Gap
                          </span>
                          <p className="flex-1 text-sm text-white/80 truncate">{q.query}</p>
                          {q.count > 1 && (
                            <span className="flex-shrink-0 text-xs text-white/30">{q.count}x</span>
                          )}
                          <a
                            href={`/admin/search-insights`}
                            className="flex-shrink-0 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400 transition hover:bg-amber-400/20"
                          >
                            Gen FAQ
                          </a>
                        </div>
                      ))}
                      {untrackedQueries.length > 8 && (
                        <p className="text-xs text-white/25 pt-1">
                          +{untrackedQueries.length - 8} more —{' '}
                          <a href="/admin/search-insights" className="text-amber-400/70 hover:text-amber-400">view all in Search Insights</a>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {trackedQueries.length > 0 && (
                  <div className={untrackedQueries.length > 0 ? 'mt-5' : ''}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70 mb-3">
                      Validated tracked keywords — real customers used these to find you
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trackedQueries.slice(0, 12).map((q, i) => {
                        const match = matchesTracked(q.query)
                        const summary = summaries.find(s => s.keyword.toLowerCase() === match)
                        return (
                          <div key={i} className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1">
                            <span className="text-xs text-white/60 truncate max-w-[160px]">{q.query}</span>
                            {summary && (
                              <span className={`text-xs font-black ${summary.latestRank && summary.latestRank <= 5 ? 'text-emerald-400' : summary.latestRank && summary.latestRank <= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {summary.latestRank ? `#${summary.latestRank}` : 'NR'}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </Card>

              {/* Filters */}
              <Card className="p-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-2">Search keywords</label>
                    <input
                      value={keywordFilter}
                      onChange={e => setKeywordFilter(e.target.value)}
                      placeholder="e.g. treadmill"
                      className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-400/60"
                    />
                  </div>
                  <div className="min-w-[160px]">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-2">Competitor</label>
                    <select
                      value={domainFilter}
                      onChange={e => setDomainFilter(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                    >
                      {domains.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="min-w-[140px]">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-2">Trend</label>
                    <select
                      value={trendFilter}
                      onChange={e => setTrendFilter(e.target.value as typeof trendFilter)}
                      className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                    >
                      {(['All', 'improving', 'declining', 'stable', 'new'] as const).map(v => (
                        <option key={v} value={v}>{v === 'All' ? 'All trends' : v[0].toUpperCase() + v.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  {(keywordFilter || domainFilter !== 'All' || trendFilter !== 'All') && (
                    <button
                      type="button"
                      onClick={() => { setKeywordFilter(''); setDomainFilter('All'); setTrendFilter('All') }}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/60 hover:text-white transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                  <span className="ml-auto text-xs text-white/30 self-center">
                    {filtered.length} / {total} keywords
                  </span>
                </div>
              </Card>

              {/* Charts row */}
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="p-5">
                  <SectionLabel>Trend breakdown</SectionLabel>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip {...CHART_STYLE.tooltip} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} shape={(props: any) => {
                          const { x, y, width, height, fill } = props
                          if (!height || height <= 0) return <g />
                          return <rect x={x} y={y} width={width} height={height} fill={fill} rx={6} ry={6} />
                        }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-5">
                  <SectionLabel>Rank distribution</SectionLabel>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={distData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip {...CHART_STYLE.tooltip} />
                        <Bar dataKey="value" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Rank history */}
              <Card className="p-5">
                <SectionLabel>Keyword rank history</SectionLabel>
                <div className="mb-4 flex flex-wrap gap-2">
                  {historyKeywords.map(s => (
                    <button
                      key={s.keyword}
                      type="button"
                      onClick={() => setHistoryKeyword(s.keyword)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        activeHistoryKw === s.keyword
                          ? 'bg-cyan-400 text-black'
                          : 'border border-white/10 bg-white/[0.04] text-white/60 hover:text-white'
                      }`}
                    >
                      {s.keyword}
                    </button>
                  ))}
                </div>
                <div className="h-60">
                  {historySummary && historyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="check" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} reversed domain={[1, 'auto']} />
                        <Tooltip {...CHART_STYLE.tooltip} formatter={(v) => [`#${v}`, 'Rank']} />
                        <Line type="monotone" dataKey="rank" stroke="#22d3ee" strokeWidth={2.5} dot={{ r: 4, fill: '#22d3ee' }} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-white/25">Not enough history data yet.</div>
                  )}
                </div>
              </Card>

              {/* Compare */}
              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <SectionLabel>Compare keyword trends</SectionLabel>
                  {compareKeywords.length > 0 && (
                    <button type="button" onClick={() => setCompareKeywords([])} className="text-xs text-white/40 hover:text-white transition-colors">
                      Clear selection
                    </button>
                  )}
                </div>
                <p className="text-xs text-white/30 mb-3 -mt-2">Select up to 4 keywords to compare rank movement side by side.</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {compareOptions.map((s, i) => {
                    const checked = compareKeywords.includes(s.keyword)
                    const colorIdx = compareKeywords.indexOf(s.keyword)
                    return (
                      <button
                        key={s.keyword}
                        type="button"
                        onClick={() => toggleCompare(s.keyword)}
                        disabled={!checked && compareKeywords.length >= 4}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                          checked
                            ? 'text-black font-bold'
                            : 'border border-white/10 bg-white/[0.04] text-white/60 hover:text-white'
                        }`}
                        style={checked ? { backgroundColor: COMPARE_COLORS[colorIdx] } : {}}
                      >
                        {s.keyword}
                      </button>
                    )
                  })}
                </div>
                <div className="h-64">
                  {compareKeywords.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={compareData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="check" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} reversed domain={[1, 'auto']} />
                        <Tooltip {...CHART_STYLE.tooltip} formatter={(v, name) => [`#${v}`, name]} />
                        {compareKeywords.map((kw, i) => (
                          <Line key={kw} type="monotone" dataKey={kw} stroke={COMPARE_COLORS[i]} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-white/25">Select keywords above to compare.</div>
                  )}
                </div>
              </Card>

              {/* Opportunities + Patterns */}
              <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                <Card className="p-5">
                  <SectionLabel>Top opportunities</SectionLabel>
                  <p className="text-xs text-white/30 mb-4 -mt-2">Keywords where competitors outrank us — fastest to move.</p>
                  {opportunities.length === 0 ? (
                    <p className="text-sm text-white/25">No immediate opportunities found.</p>
                  ) : (
                    <div className="space-y-2">
                      {opportunities.map(item => (
                        <div key={item.keyword} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white/85">{item.keyword}</p>
                            <p className="mt-0.5 text-xs text-white/30">
                              {item.competitorDomain ?? 'Unknown'} {item.competitorRank ? `#${item.competitorRank}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <TrendBadge trend={item.trend} />
                            <RankBadge rank={item.latestRank} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="p-5">
                  <SectionLabel>Recent rank patterns</SectionLabel>
                  <p className="text-xs text-white/30 mb-4 -mt-2">Latest historical check snapshots.</p>
                  <div className="space-y-2">
                    {summaries.slice(0, 6).map(item => (
                      <div key={item.keyword} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="truncate text-sm font-medium text-white/80">{item.keyword}</span>
                          <TrendBadge trend={item.trend} />
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {item.rankHistory.map((rank, i) => (
                            <span key={i} className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[11px] text-white/40">
                              {rankLabel(rank)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Main table */}
              {filtered.length === 0 ? (
                <Card className="px-6 py-10 text-center text-sm text-white/30">
                  No keywords match your filters. Try clearing the search or filter.
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.08]">
                          {['Keyword', 'Our Rank', 'Competitor', 'Rank Gap', 'Trend', 'Checks', 'Last Checked'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.18em] text-white/25 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {filtered.map(s => {
                          const gap = s.latestRank && s.competitorRank ? s.latestRank - s.competitorRank : null
                          return (
                            <tr key={s.keyword} className="transition-colors hover:bg-white/[0.02]">
                              <td className="px-4 py-3 font-medium text-white/80 max-w-[220px] truncate">{s.keyword}</td>
                              <td className="px-4 py-3"><RankBadge rank={s.latestRank} /></td>
                              <td className="px-4 py-3 text-xs text-white/40">
                                {s.competitorDomain ? <><span className="text-white/60">{s.competitorDomain}</span> #{s.competitorRank ?? '?'}</> : '—'}
                              </td>
                              <td className="px-4 py-3 text-xs font-bold">
                                {gap === null ? <span className="text-white/20">—</span>
                                  : gap > 0 ? <span className="text-red-400">+{gap} behind</span>
                                  : <span className="text-emerald-400">{Math.abs(gap)} ahead</span>}
                              </td>
                              <td className="px-4 py-3"><TrendBadge trend={s.trend} /></td>
                              <td className="px-4 py-3 text-white/30">{s.checks}</td>
                              <td className="px-4 py-3 text-white/30 whitespace-nowrap">{fmt(s.lastChecked)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

            </div>
          )}
        </div>
      </main>
    </AdminGate>
  )
}
