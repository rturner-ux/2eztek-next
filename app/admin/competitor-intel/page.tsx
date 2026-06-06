'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import AdminGate from '@/components/AdminGate'

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

  useEffect(() => {
    const password = localStorage.getItem('blogAdminPassword') || ''
    fetch('/api/admin/competitor-intel', { headers: { 'x-admin-password': password } })
      .then(r => r.json())
      .then(data => { if (data.success) setRows(data.rankings); else setError(data.error || 'Failed to load') })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [])

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
    { name: 'Improving', value: summaries.filter(s => s.trend === 'improving').length },
    { name: 'Declining', value: summaries.filter(s => s.trend === 'declining').length },
    { name: 'Stable', value: summaries.filter(s => s.trend === 'stable').length },
    { name: 'New', value: summaries.filter(s => s.trend === 'new').length },
  ]
  const distData = [
    { name: 'Top 5', value: top5 },
    { name: '6–10', value: top10 - top5 },
    { name: '11–20', value: summaries.filter(s => s.latestRank && s.latestRank > 10 && s.latestRank <= 20).length },
    { name: '21+', value: summaries.filter(s => !s.latestRank || s.latestRank > 20).length },
  ]

  // Opportunities (all summaries, not filtered)
  const opportunities = summaries.filter(s => !s.latestRank || s.latestRank > 10).slice(0, 6)

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
                        <Bar dataKey="value" fill="#22d3ee" radius={[6, 6, 0, 0]} />
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
