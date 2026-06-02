'use client'

import { useEffect, useState } from 'react'

type RankingRow = {
  id: string
  keyword: string
  our_rank: number | null
  competitor_rank: number | null
  checked_at: string
}

type KeywordSummary = {
  keyword: string
  latestRank: number | null
  trend: 'improving' | 'declining' | 'stable' | 'new'
  checks: number
  lastChecked: string
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CompetitorIntelPage() {
  const [rows, setRows] = useState<RankingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/competitor-intel')
      .then(r => r.json())
      .then(data => {
        if (data.success) setRows(data.rankings)
        else setError(data.error || 'Failed to load')
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [])

  // Summarize by keyword
  const summaries: KeywordSummary[] = Object.values(
    rows.reduce((acc: Record<string, RankingRow[]>, row) => {
      acc[row.keyword] = acc[row.keyword] || []
      acc[row.keyword].push(row)
      return acc
    }, {})
  ).map((krows) => {
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
      trend,
      checks: krows.length,
      lastChecked: latest.checked_at,
    }
  }).sort((a, b) => {
    // Sort: not ranking first, then by rank ascending
    if (!a.latestRank && b.latestRank) return -1
    if (a.latestRank && !b.latestRank) return 1
    return (a.latestRank || 99) - (b.latestRank || 99)
  })

  const trendIcon = (t: KeywordSummary['trend']) => ({
    improving: <span className="text-emerald-400">↑ Improving</span>,
    declining: <span className="text-red-400">↓ Declining</span>,
    stable: <span className="text-white/40">→ Stable</span>,
    new: <span className="text-cyan-400">★ New</span>,
  }[t])

  const notRanking = summaries.filter(s => !s.latestRank).length
  const top5 = summaries.filter(s => s.latestRank && s.latestRank <= 5).length
  const improving = summaries.filter(s => s.trend === 'improving').length

  return (
    <main className="min-h-screen bg-[#050B14] text-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Admin</div>
          <h1 className="mt-2 text-4xl font-black">Competitor Intelligence</h1>
          <p className="mt-2 text-white/45 text-sm">Keyword ranking gaps vs competitors — updated weekly every Wednesday.</p>
        </div>

        {loading && <div className="text-white/45 text-sm">Loading rankings…</div>}
        {error && <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        {!loading && !error && (
          <>
            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Not Ranking', value: notRanking, color: 'text-red-400' },
                { label: 'Top 5', value: top5, color: 'text-emerald-400' },
                { label: 'Improving', value: improving, color: 'text-cyan-400' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                  <div className="text-xs font-black uppercase tracking-[0.15em] text-white/40">{s.label}</div>
                  <div className={`mt-2 text-3xl font-black ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Keyword table */}
            {summaries.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center text-white/40 text-sm">
                No ranking data yet. The competitor-gap cron runs every Wednesday at 10am UTC.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04]">
                      <th className="px-5 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-white/40">Keyword</th>
                      <th className="px-5 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-white/40">Our Rank</th>
                      <th className="px-5 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-white/40">Trend</th>
                      <th className="px-5 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-white/40">Checks</th>
                      <th className="px-5 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-white/40">Last Checked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaries.map((s) => (
                      <tr key={s.keyword} className="border-b border-white/5 transition hover:bg-white/[0.02]">
                        <td className="px-5 py-3 font-medium text-white/80">{s.keyword}</td>
                        <td className="px-5 py-3 font-black">
                          {s.latestRank
                            ? <span className={s.latestRank <= 5 ? 'text-emerald-400' : s.latestRank <= 10 ? 'text-yellow-400' : 'text-white/50'}>#{s.latestRank}</span>
                            : <span className="text-red-400">Not ranking</span>
                          }
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
  )
}
