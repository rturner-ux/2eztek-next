'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

type InquiryTarget = {
  keyword: string
  ourRank: number | null
  competitorDomain: string | null
  competitorRank: number | null
  gap: number | null
}

type Account = {
  id: string
  access_token: string
  business_name: string
  website_url: string
  location: string
  plan: string
  keywords_limit: number
  competitors_limit: number
  last_scanned_at: string | null
  subscription_status: string
}

type Keyword = { id: string; keyword: string; last_scanned_at: string | null }
type Competitor = { id: string; domain: string; label: string }
type Ranking = {
  id: string
  keyword: string
  our_rank: number | null
  competitor_domain: string | null
  competitor_rank: number | null
  checked_at: string
}

type KeywordSummary = {
  keyword: string
  ourRank: number | null
  topCompetitorDomain: string | null
  topCompetitorRank: number | null
  gap: number | null
  trend: 'improving' | 'declining' | 'stable' | 'new'
  checkedAt: string | null
}

function buildSummary(rankings: Ranking[]): KeywordSummary[] {
  const byKeyword: Record<string, Ranking[]> = {}
  for (const r of rankings) {
    if (!byKeyword[r.keyword]) byKeyword[r.keyword] = []
    byKeyword[r.keyword].push(r)
  }

  return Object.entries(byKeyword).map(([keyword, rows]) => {
    const sorted = rows.sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime())
    const latest = sorted[0]
    const prev = sorted.find((r, i) => i > 0 && r.keyword === keyword)

    let trend: KeywordSummary['trend'] = 'stable'
    if (!prev) trend = 'new'
    else if (latest.our_rank && prev.our_rank) {
      if (latest.our_rank < prev.our_rank) trend = 'improving'
      else if (latest.our_rank > prev.our_rank) trend = 'declining'
    }

    const gap = (latest.our_rank && latest.competitor_rank)
      ? latest.our_rank - latest.competitor_rank
      : null

    return {
      keyword,
      ourRank: latest.our_rank,
      topCompetitorDomain: latest.competitor_domain,
      topCompetitorRank: latest.competitor_rank,
      gap,
      trend,
      checkedAt: latest.checked_at,
    }
  })
}

const TREND_BADGE: Record<string, string> = {
  improving: 'bg-green-500/20 text-green-400 border border-green-500/30',
  declining: 'bg-red-500/20 text-red-400 border border-red-500/30',
  stable: 'bg-slate-500/20 text-slate-400 border border-white/10',
  new: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
}

function DashboardInner() {
  const params = useSearchParams()
  const token = params.get('token') || ''

  const [account, setAccount] = useState<Account | null>(null)
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanMsg, setScanMsg] = useState('')
  const [inquiry, setInquiry] = useState<InquiryTarget | null>(null)
  const [inquiryNotes, setInquiryNotes] = useState('')
  const [inquirySubmitting, setInquirySubmitting] = useState(false)
  const [inquiryDone, setInquiryDone] = useState(false)

  const h = useCallback(() => ({ 'x-rankradar-token': token }), [token])

  useEffect(() => {
    if (!token) return
    Promise.all([
      fetch('/api/rankradar/account', { headers: h() }).then((r) => r.json()),
      fetch('/api/rankradar/keywords', { headers: h() }).then((r) => r.json()),
      fetch('/api/rankradar/competitors', { headers: h() }).then((r) => r.json()),
      fetch('/api/rankradar/rankings', { headers: h() }).then((r) => r.json()),
    ]).then(([acc, kws, comps, ranks]) => {
      if (acc.success) setAccount(acc.account)
      if (kws.success) setKeywords(kws.keywords)
      if (comps.success) setCompetitors(comps.competitors)
      if (ranks.success) setRankings(ranks.rankings)
      setLoading(false)
    })
  }, [token, h])

  async function submitInquiry() {
    if (!inquiry) return
    setInquirySubmitting(true)
    await fetch('/api/rankradar/seo-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-rankradar-token': token },
      body: JSON.stringify({ ...inquiry, notes: inquiryNotes }),
    })
    setInquirySubmitting(false)
    setInquiryDone(true)
  }

  function openInquiry(s: KeywordSummary) {
    setInquiry({ keyword: s.keyword, ourRank: s.ourRank, competitorDomain: s.topCompetitorDomain, competitorRank: s.topCompetitorRank, gap: s.gap })
    setInquiryNotes('')
    setInquiryDone(false)
  }

  async function runScan() {
    setScanning(true)
    setScanMsg('')
    const res = await fetch('/api/rankradar/scan', {
      method: 'POST',
      headers: h(),
    })
    const data = await res.json()
    if (data.success) {
      setScanMsg(`Scanned ${data.scanned} keywords. Reloading results...`)
      setTimeout(() => window.location.reload(), 2000)
    } else {
      setScanMsg(data.message || 'Scan failed.')
    }
    setScanning(false)
  }

  if (loading || !account) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050B14]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    )
  }

  const summary = buildSummary(rankings)
  const top5 = summary.filter((s) => s.ourRank && s.ourRank <= 5).length
  const top10 = summary.filter((s) => s.ourRank && s.ourRank <= 10).length
  const notRanking = summary.filter((s) => !s.ourRank).length
  const avgRank = summary.length ? Math.round(summary.filter((s) => s.ourRank).reduce((a, s) => a + (s.ourRank || 0), 0) / (summary.filter((s) => s.ourRank).length || 1)) : null
  const gaps = summary.filter((s) => s.gap && s.gap > 0).sort((a, b) => (b.gap || 0) - (a.gap || 0))

  return (
    <div className="min-h-screen bg-[#050B14] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-black text-white">Rank</span>
            <span className="font-black text-cyan-400">Radar</span>
            <span className="mx-2 text-white/20">|</span>
            <span className="text-sm font-bold text-white">{account.business_name}</span>
            <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${account.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {account.plan} {account.subscription_status === 'trialing' ? '• trial' : ''}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {account.last_scanned_at && (
              <span className="text-xs text-slate-500">
                Last scan: {new Date(account.last_scanned_at).toLocaleDateString()}
              </span>
            )}
            <button
              onClick={runScan}
              disabled={scanning}
              className="rounded-full bg-cyan-400 px-5 py-2 text-xs font-black text-black hover:bg-cyan-300 disabled:opacity-50"
            >
              {scanning ? 'Scanning...' : 'Run Scan Now'}
            </button>
          </div>
        </div>
        {scanMsg && (
          <div className="mx-auto mt-2 max-w-6xl">
            <p className="text-xs text-cyan-400">{scanMsg}</p>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: 'Tracked', val: summary.length || keywords.length, color: 'text-white' },
            { label: 'Top 5', val: top5, color: 'text-green-400' },
            { label: 'Top 10', val: top10, color: 'text-cyan-400' },
            { label: 'Not Ranking', val: notRanking, color: 'text-red-400' },
            { label: 'Avg Rank', val: avgRank ? `#${avgRank}` : '—', color: 'text-slate-300' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Top gaps */}
        {gaps.length > 0 && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-red-400">Top Opportunities — Close These Gaps First</h2>
            <div className="mt-4 space-y-3">
              {gaps.slice(0, 5).map((g) => (
                <div key={g.keyword} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-sm font-bold text-white">{g.keyword}</span>
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-shrink-0">
                    <span>You: <strong className="text-white">{g.ourRank ? `#${g.ourRank}` : 'Not ranking'}</strong></span>
                    <span className="text-white/20">|</span>
                    <span>{g.topCompetitorDomain}: <strong className="text-red-400">#{g.topCompetitorRank}</strong></span>
                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 font-black text-red-400">
                      {(g.gap || 0) > 0 ? `+${g.gap} behind` : 'ahead'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rankings table */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <h2 className="font-black text-white">Keyword Rankings</h2>
            <span className="text-xs text-slate-500">{summary.length} of {account.keywords_limit} keywords</span>
          </div>
          {summary.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-3xl">🎯</p>
              <p className="mt-3 font-bold text-white">No scan data yet</p>
              <p className="mt-1 text-sm text-slate-400">Click "Run Scan Now" above to check your current rankings.</p>
              <button onClick={runScan} disabled={scanning} className="mt-5 rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-black text-black hover:bg-cyan-300 disabled:opacity-50">
                {scanning ? 'Scanning...' : 'Run First Scan'}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {summary.map((s) => (
                <div key={s.keyword} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{s.keyword}</p>
                    {s.topCompetitorDomain && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        Top competitor: {s.topCompetitorDomain} at #{s.topCompetitorRank}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                    <div className="text-center w-16">
                      <p className={`text-lg font-black ${s.ourRank ? (s.ourRank <= 5 ? 'text-green-400' : s.ourRank <= 10 ? 'text-cyan-400' : 'text-slate-300') : 'text-red-400'}`}>
                        {s.ourRank ? `#${s.ourRank}` : 'NR'}
                      </p>
                      <p className="text-[10px] text-slate-500">our rank</p>
                    </div>
                    {s.gap !== null && (
                      <div className="text-center w-16">
                        <p className={`text-sm font-black ${s.gap > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {s.gap > 0 ? `+${s.gap}` : s.gap}
                        </p>
                        <p className="text-[10px] text-slate-500">gap</p>
                      </div>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${TREND_BADGE[s.trend]}`}>
                      {s.trend}
                    </span>
                    {(s.gap && s.gap > 0 || !s.ourRank) && (
                      <button
                        onClick={() => openInquiry(s)}
                        className="rounded-full bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 text-[10px] font-black text-cyan-400 hover:bg-cyan-400 hover:text-black transition"
                      >
                        Fix This For Me
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Keywords + Competitors management */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="font-black text-white text-sm">Tracked Keywords</h3>
            <p className="mt-0.5 text-xs text-slate-500">{keywords.length} / {account.keywords_limit}</p>
            <div className="mt-4 space-y-1.5">
              {keywords.map((kw) => (
                <div key={kw.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                  <span className="text-xs text-slate-300">{kw.keyword}</span>
                </div>
              ))}
            </div>
            {keywords.length < account.keywords_limit && (
              <Link
                href={`/rankradar/setup?token=${token}`}
                className="mt-4 block text-center text-xs text-cyan-400 hover:text-cyan-300"
              >
                + Add more keywords
              </Link>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="font-black text-white text-sm">Tracked Competitors</h3>
            <p className="mt-0.5 text-xs text-slate-500">{competitors.length} / {account.competitors_limit}</p>
            <div className="mt-4 space-y-1.5">
              {competitors.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                  <span className="text-xs text-slate-300">{c.domain}</span>
                </div>
              ))}
            </div>
            {competitors.length < account.competitors_limit && (
              <Link
                href={`/rankradar/setup?token=${token}`}
                className="mt-4 block text-center text-xs text-cyan-400 hover:text-cyan-300"
              >
                + Add more competitors
              </Link>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-600">
          RankRadar by 2EZ TEK &bull; Scans run automatically every Wednesday &bull; <a href="mailto:support@2eztek.com" className="text-cyan-400/60 hover:text-cyan-400">support@2eztek.com</a>
        </p>
      </main>

      {/* Fix This For Me modal */}
      {inquiry && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setInquiry(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a1628] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {inquiryDone ? (
              <div className="p-8 text-center">
                <div className="text-4xl">🎯</div>
                <h3 className="mt-4 text-xl font-black text-white">Request sent!</h3>
                <p className="mt-2 text-sm text-slate-400">
                  The 2EZ TEK team has your details and will reach out within 24 hours to discuss closing this gap.
                </p>
                <button onClick={() => setInquiry(null)} className="mt-6 w-full rounded-full border border-white/20 py-3 text-sm font-bold text-slate-300 hover:bg-white/5">
                  Close
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">We'll Do It For You</p>
                    <h3 className="mt-1 text-lg font-black text-white">Close this ranking gap</h3>
                  </div>
                  <button onClick={() => setInquiry(null)} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
                </div>

                {/* Gap summary */}
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 mb-5">
                  <p className="font-black text-white text-sm">{inquiry.keyword}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                    <span>You: <strong className="text-white">{inquiry.ourRank ? `#${inquiry.ourRank}` : 'Not ranking'}</strong></span>
                    {inquiry.competitorDomain && (
                      <span>{inquiry.competitorDomain}: <strong className="text-red-400">#{inquiry.competitorRank}</strong></span>
                    )}
                    {inquiry.gap && inquiry.gap > 0 && (
                      <span className="rounded-full bg-red-500/20 px-2 py-0.5 font-black text-red-400">+{inquiry.gap} behind</span>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    Anything else we should know? (optional)
                  </label>
                  <textarea
                    value={inquiryNotes}
                    onChange={(e) => setInquiryNotes(e.target.value)}
                    rows={3}
                    placeholder="Budget, timeline, what you've already tried..."
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60 resize-none"
                  />
                </div>

                <button
                  onClick={submitInquiry}
                  disabled={inquirySubmitting}
                  className="w-full rounded-full bg-cyan-400 py-3.5 text-sm font-black text-black hover:bg-cyan-300 disabled:opacity-50"
                >
                  {inquirySubmitting ? 'Sending...' : 'Request SEO Help →'}
                </button>
                <p className="mt-3 text-center text-xs text-slate-500">
                  The 2EZ TEK team will review your gap and reach out within 24 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  )
}
