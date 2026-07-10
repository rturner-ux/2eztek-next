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

  // Auto-refresh every 30s
  useEffect(() => {
    if (!authorized) return
    const t = setInterval(() => fetchStats(password), 30000)
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
          <div className="rounded-2xl border border-white/[0.07] bg-black/30 p-6 overflow-x-auto">
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
              <rect width="1060" height="550" fill="url(#grid)" rx="8" />

              {/* Layer labels */}
              <text x="8" y="18" fill="rgba(255,255,255,0.2)" fontSize="8" fontWeight="700" letterSpacing="3" fontFamily="monospace">ACQUISITION</text>
              <text x="8" y="158" fill="rgba(255,255,255,0.2)" fontSize="8" fontWeight="700" letterSpacing="3" fontFamily="monospace">INTAKE</text>
              <text x="8" y="298" fill="rgba(255,255,255,0.2)" fontSize="8" fontWeight="700" letterSpacing="3" fontFamily="monospace">PIPELINE</text>
              <text x="8" y="438" fill="rgba(255,255,255,0.2)" fontSize="8" fontWeight="700" letterSpacing="3" fontFamily="monospace">BRANCH</text>

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

              {/* ── NODES ─────────────────────────────────────────────── */}
              {NODES.map(n => {
                const count = n.stageKey ? (s[n.stageKey] ?? 0) : null
                const active = count !== null && count > 0
                return (
                  <g key={n.id}>
                    {/* Node background */}
                    <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="6"
                      fill="rgba(0,0,0,0.7)"
                      stroke={active ? n.color : 'rgba(255,255,255,0.08)'}
                      strokeWidth={active ? 1.5 : 1} />

                    {/* Glow effect when active */}
                    {active && (
                      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="6"
                        fill="none" stroke={n.color} strokeWidth="6" opacity="0.08" />
                    )}

                    {/* Status LED */}
                    <circle cx={n.x + n.w - 14} cy={n.y + 14} r="4"
                      fill={active ? n.color : 'rgba(255,255,255,0.08)'} />

                    {/* Count / metric */}
                    {count !== null && (
                      <text x={n.x + 10} y={n.y + 28}
                        fill={active ? n.color : 'rgba(255,255,255,0.2)'}
                        fontSize="20" fontWeight="900" fontFamily="monospace">
                        {count}
                      </text>
                    )}

                    {/* Label */}
                    <text x={n.x + 10} y={count !== null ? n.y + 45 : n.y + 30}
                      fill={active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)'}
                      fontSize="8.5" fontWeight="700" letterSpacing="1.5">
                      {n.label}
                    </text>

                    {/* Sub-label */}
                    {n.sub && (
                      <text x={n.x + 10} y={count !== null ? n.y + 57 : n.y + 43}
                        fill="rgba(255,255,255,0.2)" fontSize="7" letterSpacing="0.5">
                        {n.sub}
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Section dividers */}
              {[145, 285, 428].map(y => (
                <line key={y} x1="0" y1={y} x2="1060" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
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
          <div className="rounded-2xl border border-white/[0.07] bg-black/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black tracking-[0.3em] text-white/40">TERRITORY // DFW JOB DENSITY</p>
                <p className="text-[9px] text-white/20 mt-0.5">Job volume by service area — all time</p>
              </div>
              {stats?.geoData.length === 0 && (
                <p className="text-xs text-white/30">No location data yet. Addresses needed in customer records.</p>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr,280px]">
              {/* DFW SVG Map */}
              <div className="relative rounded-xl border border-white/[0.06] bg-black/40 overflow-hidden">
                <svg viewBox={`0 0 ${MAP.w} ${MAP.h}`} className="w-full">
                  <defs>
                    <pattern id="mapgrid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                    </pattern>
                    <radialGradient id="glow-pulse" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <rect width={MAP.w} height={MAP.h} fill="url(#mapgrid)" />

                  {/* DFW boundary reference lines */}
                  <rect x="4" y="4" width={MAP.w - 8} height={MAP.h - 8} rx="6"
                    fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

                  {/* Reference city labels (always visible for orientation) */}
                  {[
                    { label: 'DENTON', lat: 33.2148, lng: -97.1331 },
                    { label: 'FT WORTH', lat: 32.7555, lng: -97.3308 },
                    { label: 'DALLAS', lat: 32.7767, lng: -96.7970 },
                    { label: 'McKINNEY', lat: 33.1972, lng: -96.6397 },
                    { label: 'FRISCO', lat: 33.1584, lng: -96.8236 },
                    { label: 'PLANO', lat: 33.0198, lng: -96.6989 },
                    { label: 'IRVING', lat: 32.8140, lng: -96.9489 },
                    { label: 'ARLINGTON', lat: 32.7357, lng: -97.1081 },
                  ].map(({ label, lat, lng }) => {
                    const x = lngToX(lng)
                    const y = latToY(lat)
                    // Only show if no job dot overlaps this label
                    return (
                      <g key={label}>
                        <circle cx={x} cy={y} r="2" fill="rgba(255,255,255,0.08)" />
                        <text x={x + 5} y={y + 4} fill="rgba(255,255,255,0.15)"
                          fontSize="7" fontFamily="monospace" letterSpacing="0.5">{label}</text>
                      </g>
                    )
                  })}

                  {/* Job density dots */}
                  {(stats?.geoData || []).map(d => {
                    const x = lngToX(d.lng)
                    const y = latToY(d.lat)
                    const r = 6 + (d.count / maxGeo) * 28
                    const isHovered = hoveredCity === d.key
                    const opacity = 0.3 + (d.count / maxGeo) * 0.7
                    return (
                      <g key={d.key}
                        onMouseEnter={() => setHoveredCity(d.key)}
                        onMouseLeave={() => setHoveredCity(null)}
                        style={{ cursor: 'pointer' }}>
                        {/* Outer glow ring */}
                        <circle cx={x} cy={y} r={r + 8} fill="#22d3ee" opacity={isHovered ? 0.15 : 0.06} />
                        {/* Main dot */}
                        <circle cx={x} cy={y} r={r} fill="#22d3ee" opacity={isHovered ? 0.9 : opacity} />
                        {/* Inner bright core */}
                        <circle cx={x} cy={y} r={Math.min(r * 0.4, 6)} fill="white" opacity={isHovered ? 0.9 : 0.6} />
                        {/* Count label */}
                        {(isHovered || d.count >= 3) && (
                          <text x={x} y={y + 4} textAnchor="middle"
                            fill="white" fontSize="8" fontWeight="900" fontFamily="monospace">
                            {d.count}
                          </text>
                        )}
                        {/* City label on hover */}
                        {isHovered && (
                          <g>
                            <rect x={x - 40} y={y - r - 22} width="80" height="16" rx="4" fill="rgba(0,0,0,0.8)" />
                            <text x={x} y={y - r - 10} textAnchor="middle"
                              fill="#22d3ee" fontSize="8" fontWeight="700" fontFamily="monospace" letterSpacing="1">
                              {d.label.toUpperCase()}
                            </text>
                          </g>
                        )}
                      </g>
                    )
                  })}

                  {/* Compass rose */}
                  <text x={MAP.w - 20} y="16" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace" textAnchor="middle">N</text>
                  <line x1={MAP.w - 20} y1="18" x2={MAP.w - 20} y2="28" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                </svg>
              </div>

              {/* Ranked City List */}
              <div className="space-y-2">
                <p className="text-[9px] font-black tracking-[0.3em] text-white/30 mb-3">HIGH VOLUME AREAS</p>
                {(stats?.geoData.length ?? 0) === 0 ? (
                  <p className="text-xs text-white/20">No city data available yet.</p>
                ) : (
                  (stats?.geoData || []).slice(0, 15).map((d, i) => {
                    const pct = Math.round((d.count / maxGeo) * 100)
                    return (
                      <div key={d.key}
                        onMouseEnter={() => setHoveredCity(d.key)}
                        onMouseLeave={() => setHoveredCity(null)}
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors cursor-default ${hoveredCity === d.key ? 'bg-cyan-400/10' : 'hover:bg-white/[0.03]'}`}>
                        <span className="w-5 text-right font-mono text-xs text-white/20">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-bold text-white/80">{d.label}</span>
                            <span className="font-mono text-xs text-cyan-400 font-black">{d.count}</span>
                          </div>
                          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full bg-cyan-400 transition-all"
                              style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}

                {/* Channel breakdown */}
                {Object.keys(stats?.commsByChannel || {}).length > 0 && (
                  <div className="mt-6 border-t border-white/[0.06] pt-4">
                    <p className="text-[9px] font-black tracking-[0.3em] text-white/30 mb-3">COMM CHANNELS (RECENT)</p>
                    {Object.entries(stats?.commsByChannel || {}).map(([ch, cnt]) => (
                      <div key={ch} className="flex items-center justify-between py-1">
                        <span className="text-xs text-white/50 uppercase tracking-wide">{ch}</span>
                        <span className="font-mono text-xs text-white/70 font-black">{cnt}</span>
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
