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

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatRankValue(rank: number | null) {
  return rank ? `#${rank}` : 'Not ranking'
}

export default function CompetitorIntelPage() {
  const [rows, setRows] = useState<RankingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [keywordFilter, setKeywordFilter] = useState('')
  const [domainFilter, setDomainFilter] = useState('All')
  const [trendFilter, setTrendFilter] = useState<'All' | KeywordSummary['trend']>('All')
  const [selectedHistoryKeyword, setSelectedHistoryKeyword] = useState<string | null>(null)
  const [compareKeywords, setCompareKeywords] = useState<string[]>([])

  useEffect(() => {
    const password = localStorage.getItem('blogAdminPassword') || ''
    fetch('/api/admin/competitor-intel', {
      headers: { 'x-admin-password': password },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setRows(data.rankings)
        else setError(data.error || 'Failed to load')
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [])

  const summaries = useMemo(() => {
    const grouped = rows.reduce((acc: Record<string, RankingRow[]>, row) => {
      acc[row.keyword] = acc[row.keyword] || []
      acc[row.keyword].push(row)
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
          rankHistory: sorted.slice(0, 4).map((r) => r.our_rank || null).reverse(),
        }
      })
      .sort((a, b) => {
        if (!a.latestRank && b.latestRank) return 1
        if (a.latestRank && !b.latestRank) return -1
        return (a.latestRank || 99) - (b.latestRank || 99)
      })
  }, [rows])

  const trendIcon = (t: KeywordSummary['trend']) => ({
    improving: <span className="text-emerald-400">↑ Improving</span>,
    declining: <span className="text-red-400">↓ Declining</span>,
    stable: <span className="text-white/40">→ Stable</span>,
    new: <span className="text-cyan-400">★ New</span>,
  }[t])

  const competitorDomains = useMemo(() => {
    const domains = Array.from(new Set(summaries.map((s) => s.competitorDomain).filter(Boolean) as string[]))
    return ['All', ...domains]
  }, [summaries])

  const filteredSummaries = useMemo(() => {
    return summaries.filter((s) => {
      if (keywordFilter && !s.keyword.toLowerCase().includes(keywordFilter.toLowerCase())) return false
      if (domainFilter !== 'All' && s.competitorDomain !== domainFilter) return false
      if (trendFilter !== 'All' && s.trend !== trendFilter) return false
      return true
    })
  }, [summaries, keywordFilter, domainFilter, trendFilter])

  const displaySummaries = filteredSummaries
  const totalKeywords = summaries.length
  const viewingCount = displaySummaries.length
  const selectedSummary = useMemo(() => {
    if (!displaySummaries.length) return null
    if (selectedHistoryKeyword) {
      return displaySummaries.find((s) => s.keyword === selectedHistoryKeyword) ?? displaySummaries[0]
    }
    return displaySummaries[0]
  }, [displaySummaries, selectedHistoryKeyword])

  const historyOptions = displaySummaries.slice(0, 6)
  const historyChartData = useMemo(() => {
    if (!selectedSummary) return []
    return selectedSummary.rankHistory.map((rank, index) => ({
      check: `Check ${index + 1}`,
      rank: rank || 99,
    }))
  }, [selectedSummary])

  const compareOptions = displaySummaries.slice(0, 8)
  const compareChartRows = useMemo(() => {
    if (compareKeywords.length === 0) return []
    const maxLength = Math.max(
      ...compareKeywords.map((keyword) => displaySummaries.find((s) => s.keyword === keyword)?.rankHistory.length ?? 0),
      0
    )
    return Array.from({ length: maxLength }, (_, index) => {
      const row: Record<string, string | number> = { check: `Check ${index + 1}` }
      compareKeywords.forEach((keyword) => {
        const rank = displaySummaries.find((s) => s.keyword === keyword)?.rankHistory[index]
        row[keyword] = rank ?? 99
      })
      return row
    })
  }, [compareKeywords, displaySummaries])

  const compareColors = ['#22c55e', '#38bdf8', '#facc15', '#fb7185']

  const notRanking = summaries.filter(s => !s.latestRank).length
  const top5 = summaries.filter(s => s.latestRank && s.latestRank <= 5).length
  const top10 = summaries.filter(s => s.latestRank && s.latestRank <= 10).length
  const avgRank = summaries.length
    ? Math.round(summaries.reduce((sum, s) => sum + (s.latestRank || 99), 0) / summaries.length)
    : null
  const improving = summaries.filter(s => s.trend === 'improving').length
  const declining = summaries.filter(s => s.trend === 'declining').length
  const stable = summaries.filter(s => s.trend === 'stable').length
  const newKeywords = summaries.filter(s => s.trend === 'new').length
  const opportunities = summaries.filter(s => !s.latestRank || (s.latestRank && s.latestRank > 10)).slice(0, 8)
  const distribution = {
    top5,
    top10: top10 - top5,
    top20: summaries.filter((s) => s.latestRank && s.latestRank > 10 && s.latestRank <= 20).length,
    others: summaries.filter((s) => !s.latestRank || (s.latestRank && s.latestRank > 20)).length,
  }

  const domainCounts = useMemo(() => {
    return displaySummaries.reduce<Record<string, number>>((acc, item) => {
      const domain = item.competitorDomain || 'Unknown'
      acc[domain] = (acc[domain] || 0) + 1
      return acc
    }, {})
  }, [displaySummaries])
  const domainMax = Math.max(...Object.values(domainCounts), 1)

  const trendChartData = [
    { name: 'Improving', value: improving },
    { name: 'Declining', value: declining },
    { name: 'Stable', value: stable },
    { name: 'New', value: newKeywords },
  ]

  return (
    <AdminGate title="Competitor Intelligence">
    <main className="min-h-screen bg-[#050B14] text-white px-6 pt-28 pb-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Admin</div>
          <h1 className="mt-2 text-4xl font-black">Competitor Intelligence</h1>
          <p className="mt-2 text-white/45 text-sm">Keyword ranking gaps vs competitors, updated weekly every Wednesday.</p>
        </div>

        {loading && <div className="text-white/45 text-sm">Loading rankings…</div>}
        {error && <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        {!loading && !error && (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-[1.6fr_0.95fr_0.9fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <label className="text-xs font-black uppercase tracking-[0.15em] text-white/40">Keyword filter</label>
                <input
                  value={keywordFilter}
                  onChange={(e) => setKeywordFilter(e.target.value)}
                  placeholder="Search keywords"
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <label className="text-xs font-black uppercase tracking-[0.15em] text-white/40">Competitor</label>
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  {competitorDomains.map((domain) => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <label className="text-xs font-black uppercase tracking-[0.15em] text-white/40">Trend</label>
                <select
                  value={trendFilter}
                  onChange={(e) => setTrendFilter(e.target.value as 'All' | KeywordSummary['trend'])}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  {['All', 'improving', 'declining', 'stable', 'new'].map((value) => (
                    <option key={value} value={value}>{value === 'All' ? 'All trends' : value.charAt(0).toUpperCase() + value.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4 text-sm text-white/50">Viewing <span className="font-semibold text-white">{viewingCount}</span> of <span className="font-semibold text-white">{totalKeywords}</span> tracked keywords.</div>

            <div className="mb-8 grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr]">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Keywords monitored', value: totalKeywords, color: 'text-white' },
                  { label: 'Not ranking', value: notRanking, color: 'text-red-400' },
                  { label: 'Top 5', value: top5, color: 'text-emerald-400' },
                  { label: 'Avg rank', value: avgRank ?? '—', color: 'text-yellow-300' },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                    <div className="text-xs font-black uppercase tracking-[0.15em] text-white/40">{s.label}</div>
                    <div className={`mt-2 text-3xl font-black ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs font-black uppercase tracking-[0.15em] text-white/40">Rank distribution</div>
                <div className="mt-4 grid gap-3">
                  {[
                    { label: 'Top 5', value: distribution.top5, color: 'bg-emerald-400' },
                    { label: '6-10', value: distribution.top10, color: 'bg-cyan-400' },
                    { label: '11-20', value: distribution.top20, color: 'bg-slate-400' },
                    { label: '21+', value: distribution.others, color: 'bg-white/20' },
                  ].map((bucket) => (
                    <div key={bucket.label} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/40">
                        <span>{bucket.label}</span>
                        <span>{bucket.value}</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-white/10">
                        <div className={`${bucket.color} h-full`} style={{ width: `${Math.min(100, totalKeywords ? (bucket.value / totalKeywords) * 100 : 0)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs font-black uppercase tracking-[0.15em] text-white/40">Competitor coverage</div>
                <div className="mt-4 space-y-3">
                  {Object.keys(domainCounts).length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/50">No competitor data available.</div>
                  ) : Object.entries(domainCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([domain, count]) => (
                      <div key={domain} className="space-y-2">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/40">
                          <span>{domain}</span>
                          <span>{count}</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-white/10">
                          <div className="bg-cyan-400 h-full" style={{ width: `${Math.min(100, (count / domainMax) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mb-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs font-black uppercase tracking-[0.15em] text-white/40">Trend breakdown</div>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendChartData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip wrapperStyle={{ background: '#0F172A', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }} contentStyle={{ background: '#020617', color: '#fff', border: 'none' }} />
                      <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs font-black uppercase tracking-[0.15em] text-white/40">Competitors by keyword count</div>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(domainCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }))}
                      layout="vertical"
                      margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                      <Tooltip wrapperStyle={{ background: '#0F172A', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }} contentStyle={{ background: '#020617', color: '#fff', border: 'none' }} />
                      <Bar dataKey="value" fill="#38bdf8" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Keyword rank history</h2>
                    <p className="mt-2 text-sm text-white/60">Actual historical rank checks for the selected keyword.</p>
                  </div>
                  <select
                    value={selectedHistoryKeyword ?? (displaySummaries[0]?.keyword ?? '')}
                    onChange={(e) => setSelectedHistoryKeyword(e.target.value || null)}
                    className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  >
                    {historyOptions.map((option) => (
                      <option key={option.keyword} value={option.keyword}>{option.keyword}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-5 h-72">
                  {selectedSummary ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyChartData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                        <XAxis dataKey="check" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} reversed />
                        <Tooltip wrapperStyle={{ background: '#0F172A', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }} contentStyle={{ background: '#020617', color: '#fff', border: 'none' }} />
                        <Line type="monotone" dataKey="rank" stroke="#facc15" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/50">Select a keyword to view rank history.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Compare keyword trends</h2>
                  <p className="mt-2 text-sm text-white/60">Pick up to 3 keywords to compare rank movement side by side.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {compareOptions.map((option) => (
                    <label key={option.keyword} className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/80 transition hover:border-cyan-400">
                      <input
                        type="checkbox"
                        checked={compareKeywords.includes(option.keyword)}
                        onChange={() => setCompareKeywords((current) =>
                          current.includes(option.keyword)
                            ? current.filter((k) => k !== option.keyword)
                            : current.length < 3
                              ? [...current, option.keyword]
                              : current
                        )}
                        className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                      />
                      <span>{option.keyword}</span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCompareKeywords([])}
                    disabled={compareKeywords.length === 0}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/80 transition hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="mt-5 h-80">
                {compareKeywords.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={compareChartRows} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="check" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} reversed />
                      <Tooltip
                        wrapperStyle={{ background: '#0F172A', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}
                        contentStyle={{ background: '#020617', color: '#fff', border: 'none' }}
                        formatter={(value, name) => [`#${value}`, name]}
                      />
                      {compareKeywords.map((keyword, index) => (
                        <Line
                          key={keyword}
                          type="monotone"
                          dataKey={keyword}
                          stroke={compareColors[index % compareColors.length]}
                          strokeWidth={3}
                          dot={{ r: 3 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/50">Select up to 3 keywords above to compare historical rank movement.</div>
                )}
              </div>
            </div>

            <div className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Top opportunities</h2>
                <p className="mt-2 text-sm text-white/60">Keywords where we can move the needle fastest.</p>
                <div className="mt-4 space-y-3">
                  {opportunities.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/50">No immediate opportunities found.</div>
                  ) : opportunities.map((item) => (
                    <div key={item.keyword} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-white/90">{item.keyword}</p>
                        <span className="text-xs uppercase tracking-[0.16em] text-white/40">{formatRankValue(item.latestRank)}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/50">
                        <span>{item.competitorDomain || 'Competitor'} #{item.competitorRank || '?'}</span>
                        <span>{item.trend === 'new' ? 'New' : item.trend === 'improving' ? 'Improving' : item.trend === 'declining' ? 'Declining' : 'Stable'}</span>
                        <span>{item.checks} checks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Recent rank patterns</h2>
                <p className="mt-2 text-sm text-white/60">Latest rank movement for tracked keywords.</p>
                <div className="mt-5 space-y-3">
                  {summaries.slice(0, 6).map((item) => (
                    <div key={item.keyword} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between gap-3 text-sm font-medium text-white/80">
                        <span>{item.keyword}</span>
                        <span className="text-xs uppercase tracking-[0.18em] text-white/40">{trendIcon(item.trend)}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                        {item.rankHistory.map((rank, index) => (
                          <span key={index} className="rounded-full bg-white/5 px-3 py-1">{formatRankValue(rank)}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {summaries.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center text-white/40 text-sm">
                No ranking data yet. The competitor-gap cron runs every Wednesday at 10am UTC.
              </div>
            ) : displaySummaries.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center text-white/40 text-sm">
                No keywords match your current filters. Try clearing the keyword, competitor, or trend filters.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04]">
                      <th className="px-5 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-white/40">Keyword</th>
                      <th className="px-5 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-white/40">Our Rank</th>
                      <th className="px-5 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-white/40">Competitor</th>
                      <th className="px-5 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-white/40">Trend</th>
                      <th className="px-5 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-white/40">Checks</th>
                      <th className="px-5 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-white/40">Last Checked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displaySummaries.map((s) => (
                      <tr key={s.keyword} className="border-b border-white/5 transition hover:bg-white/[0.02]">
                        <td className="px-5 py-3 font-medium text-white/80">{s.keyword}</td>
                        <td className="px-5 py-3 font-black">
                          {s.latestRank
                            ? <span className={s.latestRank <= 5 ? 'text-emerald-400' : s.latestRank <= 10 ? 'text-yellow-400' : 'text-white/50'}>#{s.latestRank}</span>
                            : <span className="text-red-400">Not ranking</span>
                          }
                        </td>
                        <td className="px-5 py-3 text-xs text-white/50">
                          {s.competitorDomain ? `${s.competitorDomain} #${s.competitorRank || '?'}` : 'Unknown'}
                        </td>
                        <td className="px-5 py-3 text-xs font-black">{trendIcon(s.trend)}</td>
                        <td className="px-5 py-3 text-white/40">{s.checks}</td>
                        <td className="px-5 py-3 text-white/40">{formatDate(s.lastChecked)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </main>
    </AdminGate>
  )
}
