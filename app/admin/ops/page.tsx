'use client'

import { useEffect, useState, useCallback } from 'react'

type GeoPoint = { key: string; label: string; lat: number; lng: number; count: number }

type OpsStats = {
  stages: Record<string, number>
  totalActive: number
  monthLeads: number
  todayAppointments: number
  todayDetails: Array<{ name: string; appointment_time: string; equipment_type: string; job_status: string }>
  partsInFlight: number
  weekBlogPosts: number
  totalBlogPosts: number
  geoData: GeoPoint[]
  commsByChannel: Record<string, number>
}

// DFW map bounds
const MAP = { minLat: 32.52, maxLat: 33.38, minLng: -97.40, maxLng: -96.42, w: 680, h: 520 }

function lngToX(lng: number) { return ((lng - MAP.minLng) / (MAP.maxLng - MAP.minLng)) * MAP.w }
function latToY(lat: number) { return ((MAP.maxLat - lat) / (MAP.maxLat - MAP.minLat)) * MAP.h }

// SVG lifecycle diagram node
type NodeDef = {
  id: string; x: number; y: number; w: number; h: number
  label: string; sub?: string; color: string; stageKey?: string
}

const NODES: NodeDef[] = [
  // Acquisition
  { id: 'blog',     x: 50,  y: 28,  w: 138, h: 68, label: 'BLOG / SEO',    sub: 'Content Engine',  color: '#a855f7' },
  { id: 'qr',       x: 208, y: 28,  w: 138, h: 68, label: 'QR CODE SCAN',  sub: 'Equipment Tag',   color: '#0ea5e9' },
  { id: 'web',      x: 366, y: 28,  w: 138, h: 68, label: 'WEB FORM',      sub: 'Service Request', color: '#0ea5e9' },
  { id: 'phone',    x: 524, y: 28,  w: 138, h: 68, label: 'DIRECT',        sub: 'Phone / Referral', color: '#6366f1' },
  // Intake
  { id: 'intake',   x: 241, y: 168, w: 194, h: 68, label: 'NEW REQUEST',   sub: 'Lead Captured',   color: '#f59e0b', stageKey: 'new' },
  // Pipeline
  { id: 'sched',    x: 28,  y: 308, w: 138, h: 72, label: 'SCHEDULED',     sub: 'Appt Set',        color: '#22d3ee', stageKey: 'scheduled' },
  { id: 'inprog',   x: 198, y: 308, w: 138, h: 72, label: 'IN PROGRESS',   sub: 'Tech On Site',    color: '#22d3ee', stageKey: 'in_progress' },
  { id: 'complete', x: 418, y: 308, w: 148, h: 72, label: 'COMPLETED',     sub: 'Job Done',        color: '#10b981', stageKey: 'completed' },
  { id: 'closed',   x: 638, y: 308, w: 138, h: 72, label: 'CLOSED',        sub: 'Ticket Closed',   color: '#4ade80', stageKey: 'closed' },
  // Parts branch
  { id: 'partsord', x: 198, y: 448, w: 138, h: 62, label: 'PARTS ORDERED', sub: 'Waiting on Parts', color: '#f97316', stageKey: 'parts_ordered' },
  { id: 'partsrec', x: 370, y: 448, w: 138, h: 62, label: 'PARTS IN',      sub: 'Ready to Install', color: '#f97316', stageKey: 'parts_received' },
  // Content loop
  { id: 'aiblog',   x: 638, y: 448, w: 148, h: 62, label: 'AI BLOG',       sub: 'Auto-Generated',  color: '#a855f7' },
  { id: 'googleseo',x: 848, y: 448, w: 138, h: 62, label: 'GOOGLE / SEO',  sub: 'Drives Traffic',  color: '#a855f7' },
]

type ArrowDef = { x1: number; y1: number; x2: number; y2: number; color?: string; dashed?: boolean; label?: string }

function node(id: string) { return NODES.find(n => n.id === id)! }
function right(n: NodeDef) { return n.x + n.w }
function left(n: NodeDef) { return n.x }
function top(n: NodeDef) { return n.y }
function bottom(n: NodeDef) { return n.y + n.h }
function cx(n: NodeDef) { return n.x + n.w / 2 }
function cy(n: NodeDef) { return n.y + n.h / 2 }

export default function AdminOpsPage() {
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [stats, setStats] = useState<OpsStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [now, setNow] = useState(new Date())
  const [tab, setTab] = useState<'lifecycle' | 'territory'>('lifecycle')
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const fetchStats = useCallback(async (pw: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/ops/stats', {
        headers: { 'x-admin-password': pw },
        cache: 'no-store',
      })
      if (!res.ok) return
      const data = await res.json()
      setStats(data)
    } finally {
      setLoading(false)
    }
  }, [])

  async function login() {
    const res = await fetch('/api/admin/customers', {
      headers: { 'x-admin-password': password },
    })
    if (res.ok) {
      setAuthorized(true)
      fetchStats(password)
    }
  }

  // Auto-refresh every 10s
  useEffect(() => {
    if (!authorized) return
    const t = setInterval(() => fetchStats(password), 10000)
    return () => clearInterval(t)
  }, [authorized, password, fetchStats])

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#050B14] flex items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur">
          <p className="text-xs font-black tracking-[0.3em] text-cyan-400 mb-4">OPS CENTER // ACCESS</p>
          <input
            type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Admin password"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400 mb-4"
          />
          <button onClick={login} className="w-full rounded-xl bg-cyan-400 py-3 text-sm font-black text-black hover:bg-cyan-300">
            ENTER
          </button>
        </div>
      </main>
    )
  }

  const s = stats?.stages || {}
  const maxGeo = Math.max(...(stats?.geoData || []).map(d => d.count), 1)

  return (
    <main className="min-h-screen bg-[#050B14] text-white pb-16">

      {/* Header */}
      <div className="border-b border-white/[0.06] bg-black/30 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-black tracking-[0.35em] text-emerald-400">LIVE</span>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-[0.25em] text-white">2EZ TEK OPERATIONS CENTER</h1>
            <p className="text-[10px] text-white/30 tracking-widest">SERVICE LIFECYCLE COMMAND VIEW</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm text-white/60">{now.toLocaleTimeString('en-US', { hour12: false })}</p>
          <p className="text-[10px] text-white/30">{now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="px-8 pt-6 space-y-6 max-w-[1400px] mx-auto">

        {/* KPI Row */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            { label: 'ACTIVE JOBS',    value: stats?.totalActive ?? '--',        color: 'text-cyan-300',   border: 'border-cyan-400/20',   bg: 'bg-cyan-400/5' },
            { label: 'TODAY\'S APPTS', value: stats?.todayAppointments ?? '--',  color: 'text-yellow-300', border: 'border-yellow-400/20', bg: 'bg-yellow-400/5' },
            { label: 'PARTS IN FLIGHT',value: stats?.partsInFlight ?? '--',      color: 'text-orange-300', border: 'border-orange-400/20', bg: 'bg-orange-400/5' },
            { label: 'MONTH LEADS',    value: stats?.monthLeads ?? '--',         color: 'text-white',      border: 'border-white/10',      bg: 'bg-white/[0.03]' },
            { label: 'BLOG PUBLISHED', value: stats?.totalBlogPosts ?? '--',     color: 'text-purple-300', border: 'border-purple-400/20', bg: 'bg-purple-400/5' },
          ].map(kpi => (
            <div key={kpi.label} className={`rounded-xl border ${kpi.border} ${kpi.bg} p-4`}>
              <p className="text-[9px] font-black tracking-[0.2em] text-white/40 mb-1">{kpi.label}</p>
              <p className={`font-mono text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 w-fit">
          {(['lifecycle', 'territory'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-xs font-black tracking-[0.2em] transition-colors ${
                tab === t ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              {t === 'lifecycle' ? 'LIFECYCLE FLOW' : 'TERRITORY MAP'}
            </button>
          ))}
        </div>

        {/* LIFECYCLE VIEW */}
        {tab === 'lifecycle' && (
          <div className="rounded-2xl border border-white/[0.07] bg-[#0a1628] p-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black tracking-[0.3em] text-white/40">PROCESS FLOW // END-TO-END SERVICE LIFECYCLE</p>
                <p className="text-[9px] text-white/20 mt-0.5">From first touchpoint to closed ticket and content loop</p>
              </div>
              <div className="flex gap-4 text-[9px] font-bold tracking-widest">
                {[['#0ea5e9','ACQUISITION'],['#f59e0b','INTAKE'],['#22d3ee','SERVICE'],['#f97316','PARTS'],['#a855f7','CONTENT']].map(([c,l]) => (
                  <span key={l} className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: c }} />
                    <span className="text-white/40">{l}</span>
                  </span>
                ))}
              </div>
            </div>

            <svg viewBox="0 0 1060 550" className="w-full" style={{ minWidth: 820 }}>
              <defs>
                {/* Arrowhead markers */}
                {[
                  ['arrow-white', 'rgba(255,255,255,0.4)'],
                  ['arrow-cyan',  '#22d3ee'],
                  ['arrow-orange','#f97316'],
                  ['arrow-purple','#a855f7'],
                  ['arrow-green', '#10b981'],
                ].map(([id, color]) => (
                  <marker key={id} id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill={color} />
                  </marker>
                ))}
                {/* Subtle grid pattern */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
                </pattern>
              </defs>

              {/* Grid background */}
              <rect width="1060" height="550" fill="rgba(255,255,255,0.015)" rx="8" />
              <rect width="1060" height="550" fill="url(#grid)" rx="8" />

              {/* ── CONNECTIONS ─────────────────────────────────────── */}

              {/* Acquisition → New Request (funnel lines) */}
              {['blog','qr','web','phone'].map(id => {
                const n = node(id)
                const intake = node('intake')
                return (
                  <path key={id}
                    d={`M ${cx(n)},${bottom(n)} L ${cx(n)},${top(intake) - 10} L ${cx(intake)},${top(intake) - 10} L ${cx(intake)},${top(intake)}`}
                    stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none"
                    strokeDasharray="4,3" markerEnd="url(#arrow-white)" />
                )
              })}

              {/* New Request → Scheduled */}
              <path d={`M ${cx(node('intake'))},${bottom(node('intake'))} L ${cx(node('intake'))},${top(node('sched')) - 14} L ${cx(node('sched'))},${top(node('sched')) - 14} L ${cx(node('sched'))},${top(node('sched'))}`}
                stroke="#22d3ee" strokeWidth="2" fill="none" markerEnd="url(#arrow-cyan)" />

              {/* Scheduled → In Progress → Completed → Closed */}
              <line x1={right(node('sched'))} y1={cy(node('sched'))} x2={left(node('inprog'))} y2={cy(node('inprog'))} stroke="#22d3ee" strokeWidth="2" markerEnd="url(#arrow-cyan)" />
              <line x1={right(node('inprog'))} y1={cy(node('inprog'))} x2={left(node('complete'))} y2={cy(node('complete'))} stroke="#22d3ee" strokeWidth="2" markerEnd="url(#arrow-cyan)" />
              <line x1={right(node('complete'))} y1={cy(node('complete'))} x2={left(node('closed'))} y2={cy(node('closed'))} stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-green)" />

              {/* In Progress → Parts Ordered (down) */}
              <path d={`M ${cx(node('inprog'))},${bottom(node('inprog'))} L ${cx(node('inprog'))},${top(node('partsord'))}`}
                stroke="#f97316" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-orange)" />

              {/* Parts Ordered → Parts Received */}
              <line x1={right(node('partsord'))} y1={cy(node('partsord'))} x2={left(node('partsrec'))} y2={cy(node('partsrec'))} stroke="#f97316" strokeWidth="1.5" markerEnd="url(#arrow-orange)" />

              {/* Parts Received → In Progress (return arc) */}
              <path d={`M ${cx(node('partsrec'))},${top(node('partsrec'))} C ${cx(node('partsrec'))},${cy(node('inprog'))} ${cx(node('inprog'))},${bottom(node('inprog'))+30} ${right(node('inprog'))-20},${bottom(node('inprog'))}`}
                stroke="#f97316" strokeWidth="1.5" fill="none" strokeDasharray="5,3" markerEnd="url(#arrow-orange)" />

              {/* Completed → AI Blog (down then right) */}
              <path d={`M ${cx(node('complete'))},${bottom(node('complete'))} L ${cx(node('complete'))},${top(node('aiblog')) - 10} L ${cx(node('aiblog'))},${top(node('aiblog')) - 10} L ${cx(node('aiblog'))},${top(node('aiblog'))}`}
                stroke="#a855f7" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-purple)" />

              {/* AI Blog → Google/SEO */}
              <line x1={right(node('aiblog'))} y1={cy(node('aiblog'))} x2={left(node('googleseo'))} y2={cy(node('googleseo'))} stroke="#a855f7" strokeWidth="1.5" markerEnd="url(#arrow-purple)" />

              {/* Google/SEO feedback loop back to Blog/SEO (routes around left side) */}
              <path
                d={`M ${cx(node('googleseo'))},${bottom(node('googleseo'))} L ${cx(node('googleseo'))},530 L 14,530 L 14,14 L ${cx(node('blog'))},14 L ${cx(node('blog'))},${top(node('blog'))}`}
                stroke="#a855f7" strokeWidth="1.5" fill="none"
                strokeDasharray="6,4" markerEnd="url(#arrow-purple)" opacity="0.7" />

              {/* Section dividers */}
              {[145, 285, 428].map(y => (
                <line key={y} x1="0" y1={y} x2="1060" y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="4,6" />
              ))}

              {/* ── NODES ─────────────────────────────────────────────── */}
              {NODES.map(n => {
                const count = n.stageKey ? (s[n.stageKey] ?? 0) : null
                const active = count !== null && count > 0
                return (
                  <g key={n.id}>
                    {/* Node background — visible dark-blue card */}
                    <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="7"
                      fill="#0f1f38"
                      stroke={active ? n.color : 'rgba(255,255,255,0.18)'}
                      strokeWidth={active ? 2 : 1} />

                    {/* Top accent bar when active */}
                    {active && (
                      <rect x={n.x + 1} y={n.y + 1} width={n.w - 2} height="3" rx="2"
                        fill={n.color} opacity="0.8" />
                    )}

                    {/* Status LED */}
                    <circle cx={n.x + n.w - 14} cy={n.y + 14} r="4.5"
                      fill={active ? n.color : 'rgba(255,255,255,0.15)'} />
                    {active && (
                      <circle cx={n.x + n.w - 14} cy={n.y + 14} r="8"
                        fill={n.color} opacity="0.2" />
                    )}

                    {/* Count / metric */}
                    {count !== null && (
                      <text x={n.x + 12} y={n.y + 30}
                        fill={active ? n.color : 'rgba(255,255,255,0.35)'}
                        fontSize="20" fontWeight="900" fontFamily="monospace">
                        {count}
                      </text>
                    )}

                    {/* Label */}
                    <text x={n.x + 12} y={count !== null ? n.y + 47 : n.y + 33}
                      fill={active ? '#ffffff' : 'rgba(255,255,255,0.65)'}
                      fontSize="9" fontWeight="700" letterSpacing="1.5">
                      {n.label}
                    </text>

                    {/* Sub-label */}
                    {n.sub && (
                      <text x={n.x + 12} y={count !== null ? n.y + 59 : n.y + 46}
                        fill="rgba(255,255,255,0.35)" fontSize="7.5" letterSpacing="0.3">
                        {n.sub}
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Section labels — rendered last so they sit on top */}
              {[
                { y: 18,  label: 'ACQUISITION' },
                { y: 158, label: 'INTAKE' },
                { y: 298, label: 'PIPELINE' },
                { y: 438, label: 'BRANCH' },
              ].map(({ y, label }) => (
                <g key={label}>
                  <rect x="0" y={y - 10} width={label.length * 6.5 + 10} height="13" fill="#0a1628" />
                  <text x="6" y={y} fill="rgba(255,255,255,0.35)" fontSize="8" fontWeight="700" letterSpacing="3" fontFamily="monospace">{label}</text>
                </g>
              ))}
            </svg>

            {/* Today's Schedule */}
            {(stats?.todayDetails || []).length > 0 && (
              <div className="mt-6 border-t border-white/[0.06] pt-4">
                <p className="text-[9px] font-black tracking-[0.3em] text-white/30 mb-3">TODAY&apos;S SCHEDULE</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {stats!.todayDetails.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                      <span className="font-mono text-xs text-cyan-400">{a.appointment_time || '—'}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-white truncate">{a.name}</span>
                        <span className="block text-[10px] text-white/30 truncate">{a.equipment_type}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TERRITORY MAP VIEW */}
        {tab === 'territory' && (
          <div className="rounded-2xl border border-white/[0.07] bg-[#0a1628] p-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <p className="text-[10px] font-black tracking-[0.3em] text-white/40">TERRITORY // DFW SERVICE DENSITY</p>
                <p className="text-[9px] text-white/20 mt-0.5">
                  Job volume by service zone — all time{(stats?.geoData.length ?? 0) > 0 ? ` · ${stats!.geoData.length} zones tracked` : ''}
                </p>
              </div>
              <div className="flex items-center gap-4 text-[9px] text-white/25">
                <span className="font-black tracking-widest">JOB DENSITY</span>
                {[{r:5,l:'1'},{r:9,l:'3'},{r:14,l:'7'},{r:20,l:'14+'}].map(({r,l}) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <svg width={r*2+2} height={r*2+2} style={{flexShrink:0}}>
                      <circle cx={r+1} cy={r+1} r={r} fill="#22d3ee" opacity={0.78} />
                      <circle cx={r+1} cy={r+1} r={r*0.33} fill="white" opacity={0.88} />
                    </svg>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr,260px]">
              {/* DFW SVG Map */}
              <div className="rounded-xl border border-cyan-400/10 overflow-hidden" style={{background:'#040d1a'}}>
                <svg viewBox={`0 0 ${MAP.w} ${MAP.h}`} className="w-full" style={{display:'block'}}>

                  {/* County fills — Denton NW */}
                  <polygon points="0,0 340,0 340,218 0,218"
                    fill="rgba(255,255,255,0.012)" stroke="rgba(255,255,255,0.065)" strokeWidth="1" />
                  {/* Collin NE */}
                  <polygon points="340,0 680,0 680,218 340,218"
                    fill="rgba(255,255,255,0.018)" stroke="rgba(255,255,255,0.065)" strokeWidth="1" />
                  {/* Tarrant SW */}
                  <polygon points="0,218 250,218 250,520 0,520"
                    fill="rgba(255,255,255,0.012)" stroke="rgba(255,255,255,0.065)" strokeWidth="1" />
                  {/* Dallas center */}
                  <polygon points="250,218 590,218 590,508 250,508"
                    fill="rgba(22,211,238,0.022)" stroke="rgba(22,211,238,0.09)" strokeWidth="1" />
                  {/* Rockwall E */}
                  <polygon points="590,218 680,218 680,363 590,363"
                    fill="rgba(255,255,255,0.012)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  {/* SE corner (Kaufman) */}
                  <polygon points="590,363 680,363 680,520 590,520"
                    fill="rgba(255,255,255,0.008)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

                  {/* County watermarks */}
                  <text x="140" y="116" fill="rgba(255,255,255,0.055)" fontSize="12" fontWeight="800" fontFamily="monospace" textAnchor="middle" letterSpacing="2">DENTON CO.</text>
                  <text x="510" y="116" fill="rgba(255,255,255,0.055)" fontSize="12" fontWeight="800" fontFamily="monospace" textAnchor="middle" letterSpacing="2">COLLIN CO.</text>
                  <text x="112" y="370" fill="rgba(255,255,255,0.055)" fontSize="11" fontWeight="800" fontFamily="monospace" textAnchor="middle" letterSpacing="2">TARRANT CO.</text>
                  <text x="415" y="365" fill="rgba(22,211,238,0.09)" fontSize="12" fontWeight="800" fontFamily="monospace" textAnchor="middle" letterSpacing="2">DALLAS CO.</text>

                  {/* Major highways */}
                  {/* I-35 north stem */}
                  <path d="M 194,0 L 222,170" stroke="rgba(251,191,36,0.28)" strokeWidth="2" fill="none" />
                  {/* I-35E branch to Dallas */}
                  <path d="M 222,170 C 295,200 350,255 366,308 L 370,520" stroke="rgba(251,191,36,0.24)" strokeWidth="2" fill="none" />
                  {/* I-35W branch to Fort Worth */}
                  <path d="M 222,170 C 148,205 78,290 62,520" stroke="rgba(251,191,36,0.16)" strokeWidth="1.5" fill="none" />
                  {/* I-30 E-W */}
                  <path d="M 0,382 L 250,381 L 590,380 L 680,380" stroke="rgba(251,191,36,0.30)" strokeWidth="2.5" fill="none" />
                  {/* SH-121 diagonal */}
                  <path d="M 168,363 C 230,290 325,205 392,128" stroke="rgba(251,191,36,0.14)" strokeWidth="1.5" fill="none" strokeDasharray="8,4" />

                  {/* Highway badges */}
                  <rect x="180" y="5" width="32" height="12" rx="2" fill="rgba(251,191,36,0.32)" />
                  <text x="196" y="15" textAnchor="middle" fill="rgba(0,0,0,0.88)" fontSize="7.5" fontWeight="900" fontFamily="monospace">I-35</text>
                  <rect x="4" y="368" width="30" height="12" rx="2" fill="rgba(251,191,36,0.32)" />
                  <text x="19" y="378" textAnchor="middle" fill="rgba(0,0,0,0.88)" fontSize="7.5" fontWeight="900" fontFamily="monospace">I-30</text>
                  <text x="308" y="178" fill="rgba(251,191,36,0.28)" fontSize="7" fontFamily="monospace">I-35E</text>
                  <text x="118" y="222" fill="rgba(251,191,36,0.20)" fontSize="7" fontFamily="monospace">I-35W</text>
                  <text x="270" y="316" fill="rgba(251,191,36,0.18)" fontSize="7" fontFamily="monospace">SH-121</text>

                  {/* Heat glow under high-density cities */}
                  {(stats?.geoData || []).filter(d => d.count >= 3).map(d => (
                    <circle key={`heat-${d.key}`}
                      cx={lngToX(d.lng)} cy={latToY(d.lat)}
                      r={28 + Math.sqrt(d.count / maxGeo) * 55}
                      fill="#22d3ee" opacity="0.028" />
                  ))}

                  {/* Hot zone pulsing rings — rendered before dots so they sit behind */}
                  {(stats?.geoData?.length ?? 0) > 0 && (() => {
                    const top = stats!.geoData[0]
                    const x = lngToX(top.lng); const y = latToY(top.lat)
                    const r = Math.round(5 + Math.sqrt(top.count / maxGeo) * 25)
                    return (
                      <g key="hotzone-rings">
                        <circle cx={x} cy={y} r={r + 18} fill="none" stroke="#f97316" strokeWidth="1.5">
                          <animate attributeName="r" values={`${r+18};${r+46}`} dur="2.2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.65;0" dur="2.2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={x} cy={y} r={r + 24} fill="none" stroke="#f97316" strokeWidth="1">
                          <animate attributeName="r" values={`${r+24};${r+58}`} dur="2.2s" begin="0.75s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.40;0" dur="2.2s" begin="0.75s" repeatCount="indefinite" />
                        </circle>
                      </g>
                    )
                  })()}

                  {/* Job dots — largest first so small dots render on top */}
                  {(stats?.geoData || []).slice().sort((a, b) => b.count - a.count).map(d => {
                    const x = lngToX(d.lng)
                    const y = latToY(d.lat)
                    const r = Math.round(5 + Math.sqrt(d.count / maxGeo) * 25)
                    const isHovered = hoveredCity === d.key
                    const pct = d.count / maxGeo
                    const color = pct >= 0.7 ? '#67e8f9' : pct >= 0.35 ? '#22d3ee' : pct >= 0.15 ? '#06b6d4' : '#0891b2'
                    const labelText = d.label.toUpperCase()
                    const labelW = Math.max(50, labelText.length * 5.6 + 10)
                    const labelX = Math.max(labelW / 2 + 4, Math.min(MAP.w - labelW / 2 - 4, x))
                    const belowY = y + r + 12
                    const labelY = belowY + 8 > MAP.h - 4 ? y - r - 5 : belowY
                    return (
                      <g key={d.key}
                        onMouseEnter={() => setHoveredCity(d.key)}
                        onMouseLeave={() => setHoveredCity(null)}
                        style={{ cursor: 'pointer' }}>
                        <circle cx={x} cy={y} r={r + 5} fill={color} opacity={isHovered ? 0.18 : 0.06} />
                        <circle cx={x} cy={y} r={r} fill={color} opacity={isHovered ? 1 : 0.85}
                          stroke={isHovered ? 'white' : 'none'} strokeWidth={isHovered ? 1.5 : 0} />
                        <circle cx={x} cy={y} r={Math.max(r * 0.3, 2.5)} fill="white" opacity="0.9" />
                        {r >= 13 && (
                          <text x={x} y={y + 4} textAnchor="middle"
                            fill="#040d1a" fontSize={r >= 22 ? '11' : r >= 16 ? '9' : '8'}
                            fontWeight="900" fontFamily="monospace">
                            {d.count}
                          </text>
                        )}
                        <rect x={labelX - labelW / 2} y={labelY - 9} width={labelW} height="11" rx="2"
                          fill="rgba(4,13,26,0.88)" stroke={color} strokeWidth="0.5" opacity="0.9" />
                        <text x={labelX} y={labelY - 1} textAnchor="middle"
                          fill={color} fontSize="6.5" fontWeight="700" fontFamily="monospace" letterSpacing="0.5">
                          {labelText}{r < 13 ? ` (${d.count})` : ''}
                        </text>
                      </g>
                    )
                  })}

                  {/* Hot zone brackets + badge — rendered after dots so they sit on top */}
                  {(stats?.geoData?.length ?? 0) > 0 && (() => {
                    const top = stats!.geoData[0]
                    const x = lngToX(top.lng); const y = latToY(top.lat)
                    const r = Math.round(5 + Math.sqrt(top.count / maxGeo) * 25)
                    const pad = r + 16; const bl = 13
                    const badgeW = 84; const badgeH = 18
                    const bx = Math.max(badgeW / 2 + 4, Math.min(MAP.w - badgeW / 2 - 4, x))
                    const by = y - pad - 32
                    return (
                      <g key="hotzone-ui">
                        {/* Targeting corner brackets */}
                        <path d={`M ${x-pad} ${y-pad+bl} L ${x-pad} ${y-pad} L ${x-pad+bl} ${y-pad}`}
                          fill="none" stroke="#f97316" strokeWidth="1.8" opacity="0.88" />
                        <path d={`M ${x+pad-bl} ${y-pad} L ${x+pad} ${y-pad} L ${x+pad} ${y-pad+bl}`}
                          fill="none" stroke="#f97316" strokeWidth="1.8" opacity="0.88" />
                        <path d={`M ${x-pad} ${y+pad-bl} L ${x-pad} ${y+pad} L ${x-pad+bl} ${y+pad}`}
                          fill="none" stroke="#f97316" strokeWidth="1.8" opacity="0.88" />
                        <path d={`M ${x+pad-bl} ${y+pad} L ${x+pad} ${y+pad} L ${x+pad} ${y+pad-bl}`}
                          fill="none" stroke="#f97316" strokeWidth="1.8" opacity="0.88" />
                        {/* Badge background */}
                        <rect x={bx - badgeW/2} y={by} width={badgeW} height={badgeH} rx="3" fill="#c2410c" />
                        <rect x={bx - badgeW/2} y={by} width={badgeW} height={badgeH} rx="3"
                          fill="none" stroke="#f97316" strokeWidth="1" opacity="0.6" />
                        <text x={bx} y={by + 12} textAnchor="middle"
                          fill="white" fontSize="8.5" fontWeight="900" fontFamily="monospace" letterSpacing="1.5">
                          HOT ZONE
                        </text>
                        {/* Connector */}
                        <line x1={bx} y1={by + badgeH} x2={x} y2={y - pad}
                          stroke="#f97316" strokeWidth="1" opacity="0.5" strokeDasharray="3,2" />
                        {/* Job count callout */}
                        <text x={bx} y={by - 4} textAnchor="middle"
                          fill="#f97316" fontSize="7" fontFamily="monospace" opacity="0.7">
                          {top.count} JOBS · {top.label.toUpperCase()}
                        </text>
                      </g>
                    )
                  })()}

                  {/* Compass rose */}
                  <g transform={`translate(${MAP.w - 28}, 26)`}>
                    <circle cx="0" cy="0" r="18" fill="rgba(4,13,26,0.78)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <line x1="0" y1="-12" x2="0" y2="12" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                    <line x1="-12" y1="0" x2="12" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <text x="0" y="-4" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9" fontWeight="800" fontFamily="monospace">N</text>
                  </g>

                  {/* Scale bar */}
                  <g transform="translate(14, 505)">
                    <line x1="0" y1="0" x2="70" y2="0" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    <line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    <line x1="70" y1="-3" x2="70" y2="3" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    <text x="35" y="-5" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="6.5" fontFamily="monospace">~ 10 mi</text>
                  </g>
                </svg>
              </div>

              {/* Ranked list */}
              <div className="flex flex-col gap-1">
                <p className="text-[9px] font-black tracking-[0.3em] text-white/30 mb-2">HIGH VOLUME ZONES</p>
                {(stats?.geoData.length ?? 0) === 0 ? (
                  <p className="text-xs text-white/20">No location data. Customer addresses required.</p>
                ) : (
                  (stats?.geoData || []).slice(0, 12).map((d, i) => {
                    const pct = Math.round((d.count / maxGeo) * 100)
                    const pctRaw = d.count / maxGeo
                    const barColor = pctRaw >= 0.7 ? '#67e8f9' : pctRaw >= 0.35 ? '#22d3ee' : '#06b6d4'
                    return (
                      <div key={d.key}
                        onMouseEnter={() => setHoveredCity(d.key)}
                        onMouseLeave={() => setHoveredCity(null)}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 cursor-default transition-all border ${
                          hoveredCity === d.key
                            ? 'bg-cyan-400/10 border-cyan-400/20'
                            : 'hover:bg-white/[0.02] border-transparent'
                        }`}>
                        <span className="w-5 shrink-0 text-right font-mono text-[9px] text-white/20">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[11px] font-bold text-white/80 truncate">{d.label}</span>
                            <span className="font-mono text-[11px] font-black ml-2 shrink-0" style={{ color: barColor }}>{d.count}</span>
                          </div>
                          <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}

                {Object.keys(stats?.commsByChannel || {}).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <p className="text-[9px] font-black tracking-[0.3em] text-white/30 mb-2">COMM CHANNELS</p>
                    {Object.entries(stats?.commsByChannel || {}).map(([ch, cnt]) => (
                      <div key={ch} className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">{ch}</span>
                        <span className="font-mono text-xs text-cyan-300 font-black">{cnt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-white/30 text-xs">
            <span className="animate-spin">⟳</span> Refreshing...
          </div>
        )}
      </div>
    </main>
  )
}
