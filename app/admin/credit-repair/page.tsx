'use client'

import { useEffect, useRef, useState } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────
type DisputeItem = {
  id: string
  creditor: string
  accountLast4: string
  type: string
  bureaus: string[]
  reason: string
}
type BureauStatusMap = Record<string, Record<string, string>>
type SentDates = Record<string, Record<string, string>> // itemId -> bureau -> ISO date string
type PersonalInfo = {
  name: string
  address: string
  city: string
  state: string
  zip: string
  dob: string
  ssn: string
  phone?: string
  employer?: string
}
type ScanReviewInfo = Partial<PersonalInfo> & {
  creditScores?: Record<string, number>
  summary?: { totalAccounts: number; negativeAccounts: number; hardInquiries: number; oldestAccount: string; totalDebt: string }
}
type ReviewItem = Omit<DisputeItem, 'id'> & {
  id: string
  selected: boolean
  balance?: string
  openDate?: string
  paymentStatus?: string
  isNegative?: boolean
}
type GeneratedLetter = { letterKey: string; letterLabel: string; letterIcon: string; reason: string; text: string; generatedAt: string }
type LettersStore = Record<string, Record<string, GeneratedLetter>>
type AutoProgress = { current: number; total: number; log: Array<{ msg: string; ok: boolean }>; done: boolean }

// ── Constants ────────────────────────────────────────────────────────────────
const BUREAUS = ['Experian', 'Equifax', 'TransUnion']
const BUREAU_SHORT: Record<string, string> = { Experian: 'EXP', Equifax: 'EQX', TransUnion: 'TRU' }
const BUREAU_COLORS: Record<string, string> = { Experian: '#3b82f6', Equifax: '#ef4444', TransUnion: '#10b981' }

const DISPUTE_TYPES = [
  'Late Payment', 'Collection Account', 'Charge-Off', 'Repossession',
  'Foreclosure', 'Hard Inquiry', 'Invalid Debt', 'Bankruptcy',
  'Identity Theft / Not Mine', 'Duplicate Account', 'Incorrect Balance', 'Incorrect Status',
]

const RESPONSE_STATUSES = ['Not Sent', 'Ready to Send', 'Sent', 'Verified', 'Deleted', 'In Dispute', 'Escalated']
const RESPONSE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  'Not Sent':      { bg: '#111827', color: '#4b5563', border: '#1f2937' },
  'Ready to Send': { bg: '#0a1a2a', color: '#38bdf8', border: '#0e4470' },
  'Sent':          { bg: '#0d1829', color: '#60a5fa', border: '#1e3a5f' },
  'Verified':      { bg: '#2d1a00', color: '#fb923c', border: '#7c2d12' },
  'Deleted':       { bg: '#052e16', color: '#4ade80', border: '#14532d' },
  'In Dispute':    { bg: '#1e1a40', color: '#a78bfa', border: '#4c1d95' },
  'Escalated':     { bg: '#2d0a0a', color: '#f87171', border: '#7f1d1d' },
}

const LETTER_TYPES = [
  {
    key: 'initial', label: 'Round 1 — Initial Dispute', icon: '⚡',
    desc: 'Full FCRA §611 dispute with Metro 2 compliance challenge',
    statutes: [
      { code: 'FCRA §611(a)(1)', cite: '15 U.S.C. §1681i(a)(1)', note: 'Bureau must conduct reasonable reinvestigation within 30 days' },
      { code: 'FCRA §623(a)(1)(A)', cite: '15 U.S.C. §1681s-2(a)(1)(A)', note: 'Furnisher prohibited from reporting info known to be inaccurate' },
      { code: 'FCRA §611(a)(7)', cite: '15 U.S.C. §1681i(a)(7)', note: 'Consumer may request method of verification after reinvestigation' },
      { code: 'Metro 2® Format', cite: 'CDIA Credit Reporting Resource Guide', note: 'Industry standard for data furnishing accuracy & field compliance' },
      { code: 'FCRA §605(a)', cite: '15 U.S.C. §1681c(a)', note: '7-year reporting limit on most derogatory information' },
    ],
  },
  {
    key: 'mov', label: 'Method of Verification Demand', icon: '🔍',
    desc: "Force them to prove HOW they verified — most bureaus can't",
    statutes: [
      { code: 'FCRA §611(a)(7)', cite: '15 U.S.C. §1681i(a)(7)', note: 'Bureau must provide method of verification upon consumer request' },
      { code: 'FCRA §611(a)(2)(B)', cite: '15 U.S.C. §1681i(a)(2)(B)', note: 'Bureau must forward consumer dispute to furnisher with all relevant info' },
      { code: 'Cushman v. Trans Union Corp.', cite: '115 F.3d 220 (3d Cir. 1997)', note: "Mere data matching is not a 'reasonable reinvestigation'" },
      { code: 'Stevenson v. TRW Inc.', cite: '987 F.2d 288 (5th Cir. 1993)', note: 'Rubber-stamp verification without investigation is a violation' },
      { code: 'FCRA §611(c)', cite: '15 U.S.C. §1681i(c)', note: 'Bureau must provide statement of dispute if item remains after investigation' },
    ],
  },
  {
    key: 'goodwill', label: 'Goodwill Deletion', icon: '🤝',
    desc: 'Emotional appeal to creditor to remove as a courtesy',
    statutes: [
      { code: 'FCRA §623(a)(2)', cite: '15 U.S.C. §1681s-2(a)(2)', note: 'Furnisher has duty to correct inaccurate or incomplete information' },
      { code: 'FCRA §623(b)(1)(E)', cite: '15 U.S.C. §1681s-2(b)(1)(E)', note: 'Furnisher may modify, delete, or permanently block disputed information' },
      { code: 'FCRA §611(a)(5)(A)', cite: '15 U.S.C. §1681i(a)(5)(A)', note: 'Bureau must promptly delete info that furnisher cannot verify' },
      { code: 'UCC §1-103', cite: 'Uniform Commercial Code §1-103', note: 'Good faith dealing standard applicable to creditor negotiations' },
    ],
  },
  {
    key: 'p4d', label: 'Pay-for-Delete Negotiation', icon: '💰',
    desc: 'Offer payment in exchange for complete deletion',
    statutes: [
      { code: 'FDCPA §807', cite: '15 U.S.C. §1692e', note: 'Debt collector may not use false or misleading representations' },
      { code: 'FDCPA §809(a)', cite: '15 U.S.C. §1692g(a)', note: 'Collector must provide validation notice within 5 days' },
      { code: 'FCRA §623(b)(1)(E)', cite: '15 U.S.C. §1681s-2(b)(1)(E)', note: 'Furnisher may delete information upon settlement' },
      { code: 'FCRA §611(a)(5)(A)', cite: '15 U.S.C. §1681i(a)(5)(A)', note: 'Bureau must delete promptly when furnisher withdraws reporting' },
      { code: 'Contract Law — Accord & Satisfaction', cite: 'Restatement (Second) Contracts §281', note: 'Settlement agreement extinguishes original obligation; deletion is valid consideration' },
    ],
  },
  {
    key: 'fdcpa', label: 'FDCPA Debt Validation', icon: '🛡️',
    desc: 'Force debt collectors to prove the debt is valid & they own it',
    statutes: [
      { code: 'FDCPA §809(b)', cite: '15 U.S.C. §1692g(b)', note: 'All collection activity must cease until debt is validated' },
      { code: 'FDCPA §807(2)', cite: '15 U.S.C. §1692e(2)', note: 'Collector may not misrepresent character, amount, or legal status of debt' },
      { code: 'FDCPA §808', cite: '15 U.S.C. §1692f', note: 'Unfair or unconscionable collection practices prohibited' },
      { code: 'FDCPA §813', cite: '15 U.S.C. §1692k', note: 'Statutory damages $1,000 per violation + actual damages + attorney fees' },
      { code: 'FCRA §623(a)(7)', cite: '15 U.S.C. §1681s-2(a)(7)', note: 'Collector must notify consumer before furnishing info to bureaus' },
      { code: 'Haddad v. Alexander, Zelmanski', cite: '698 F.3d 290 (6th Cir. 2012)', note: 'Validation must be sufficient to enable consumer to verify the debt' },
    ],
  },
  {
    key: 'escalation', label: 'Legal Escalation / Lawsuit Threat', icon: '⚖️',
    desc: 'FCRA §616/617 willful noncompliance — puts them on notice',
    statutes: [
      { code: 'FCRA §616', cite: '15 U.S.C. §1681n', note: 'Willful noncompliance: $100-$1,000 statutory damages + punitive + attorney fees' },
      { code: 'FCRA §617', cite: '15 U.S.C. §1681o', note: 'Negligent noncompliance: actual damages + attorney fees + costs' },
      { code: 'FCRA §616(a)(3)', cite: '15 U.S.C. §1681n(a)(3)', note: 'Punitive damages available for willful violations' },
      { code: 'FCRA §621(a)(1)', cite: '15 U.S.C. §1681s(a)(1)', note: 'FTC and CFPB enforcement authority' },
      { code: 'Safeco Insurance v. Burr', cite: '551 U.S. 47 (2007)', note: 'Supreme Court: reckless disregard of FCRA obligations = willful violation' },
      { code: 'Saunders v. Branch Banking', cite: '526 F.3d 142 (4th Cir. 2008)', note: 'Continued reporting of disputed debt without proper investigation is willful' },
      { code: 'CFPB Enforcement Authority', cite: '12 U.S.C. §5481 et seq.', note: 'CFPB may impose civil penalties up to $1M/day for knowing violations' },
    ],
  },
  {
    key: 'redispute', label: 'Re-Dispute After Verification', icon: '🔁',
    desc: 'New angle attack using different legal grounds',
    statutes: [
      { code: 'FCRA §623(b)', cite: '15 U.S.C. §1681s-2(b)', note: 'Furnisher has independent duty to investigate upon receiving notice from bureau' },
      { code: 'FCRA §623(b)(1)(A)', cite: '15 U.S.C. §1681s-2(b)(1)(A)', note: 'Furnisher must investigate the specific dispute raised' },
      { code: 'FCRA §611(a)(1)', cite: '15 U.S.C. §1681i(a)(1)', note: 'New and material information restarts the reinvestigation obligation' },
      { code: 'Metro 2® DOFD Field', cite: 'CDIA Metro 2 §5.1', note: 'Inaccurate DOFD is a standalone Metro 2 violation requiring deletion' },
      { code: 'Metro 2® Account Status Code', cite: 'CDIA Metro 2 Appendix A', note: 'Incorrect status code is independently disputable' },
      { code: 'Johnson v. MBNA America Bank', cite: '357 F.3d 426 (4th Cir. 2004)', note: "Bureau may not simply accept furnisher's word — must independently evaluate evidence" },
    ],
  },
]

const LAW_REFS: Record<string, string> = {
  'Late Payment':              'FCRA §623(a)(1)(B); Metro 2 §3.4',
  'Collection Account':        'FCRA §609(a)(1); FDCPA §809(b); CDIA Metro 2 §7.2',
  'Charge-Off':                'FCRA §623(b)(1)(E); Metro 2 §4.1',
  'Repossession':              'FCRA §605(a)(4); UCC Article 9',
  'Foreclosure':               'FCRA §605(a)(1); RESPA §10',
  'Hard Inquiry':              'FCRA §604(a)(3)(F)',
  'Invalid Debt':              'FDCPA §809(b); FCRA §611(a)(1)',
  'Bankruptcy':                'FCRA §605(a)(1) — 10-yr limit',
  'Identity Theft / Not Mine': 'FCRA §605B; §615(f)',
  'Duplicate Account':         'FCRA §611(a)(1)',
  'Incorrect Balance':         'FCRA §623(a)(2)',
  'Incorrect Status':          'FCRA §623(a)(1)(A); Metro 2',
}

const BUREAU_ADDRESSES: Record<string, string> = {
  Experian:   'Experian\nP.O. Box 4500\nAllen, TX 75013',
  Equifax:    'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374',
  TransUnion: 'TransUnion LLC Consumer Dispute Center\nP.O. Box 2000\nChester, PA 19016',
}

const SCORE_IMPACT: Record<string, { low: number; high: number }> = {
  'Late Payment':              { low: 15, high: 40 },
  'Collection Account':        { low: 30, high: 80 },
  'Charge-Off':                { low: 40, high: 100 },
  'Repossession':              { low: 50, high: 120 },
  'Foreclosure':               { low: 60, high: 150 },
  'Hard Inquiry':              { low: 3,  high: 10 },
  'Invalid Debt':              { low: 25, high: 70 },
  'Bankruptcy':                { low: 80, high: 200 },
  'Identity Theft / Not Mine': { low: 50, high: 150 },
  'Duplicate Account':         { low: 10, high: 40 },
  'Incorrect Balance':         { low: 5,  high: 25 },
  'Incorrect Status':          { low: 10, high: 35 },
}

const IS: React.CSSProperties = {
  width: '100%', background: '#0d1017', border: '1px solid #1e2a3a',
  borderRadius: 7, padding: '9px 12px', color: '#e2e8f0',
  fontSize: 13, fontFamily: 'inherit',
}

async function renderPdfPagesAsImages(file: File, onProgress: (msg: string) => void): Promise<string[]> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
  const MAX_PAGES = 25
  const total = Math.min(pdf.numPages, MAX_PAGES)
  const images: string[] = []
  for (let i = 1; i <= total; i++) {
    onProgress(`Rendering page ${i}/${total}...`)
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 0.6 })
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(viewport.width)
    canvas.height = Math.round(viewport.height)
    await page.render({ canvasContext: canvas.getContext('2d')!, viewport, canvas }).promise
    images.push(canvas.toDataURL('image/jpeg', 0.75).split(',')[1])
  }
  if (pdf.numPages > MAX_PAGES) onProgress(`Capped at ${MAX_PAGES} pages (${pdf.numPages} total)`)
  onProgress(`Rendered ${images.length} pages as images`)
  return images
}

// ── callAI — routes through server proxy ─────────────────────────────────────
async function callAI(adminPassword: string, prompt: string, fileBase64?: string | null, fileType?: string | null, system?: string | null, signal?: AbortSignal, maxTokens?: number, imagesBase64?: string[]): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(new Error('Request timed out after 270 seconds — try a screenshot instead of a PDF.')), 270_000)
  const combinedSignal = signal
    ? (AbortSignal as any).any?.([signal, controller.signal]) ?? controller.signal
    : controller.signal

  try {
    const res = await fetch('/api/admin/credit-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
      body: JSON.stringify({ prompt, imageBase64: fileBase64 ?? null, imageType: fileType ?? null, system: system ?? null, maxTokens: maxTokens ?? null, imagesBase64: imagesBase64 ?? null }),
      signal: combinedSignal,
    })
    if (res.status === 413) throw new Error('File too large — PDF exceeds the 4.5 MB upload limit. Take a screenshot of the accounts section instead (JPG/PNG), or compress the PDF.')
    if (res.status === 504) throw new Error('Gateway timeout (504) — the AI took too long to respond. Retrying usually works.')
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) throw new Error(`Server error (HTTP ${res.status}) — please try again.`)
    const data = await res.json()
    if (!data.success) throw new Error(data.message || 'AI request failed')
    return data.text
  } catch (err) {
    if ((err as any)?.name === 'AbortError') {
      const reason = controller.signal.reason
      throw new Error(reason instanceof Error ? reason.message : 'Scan cancelled.')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Spinner({ size = 14, color = '#818cf8' }: { size?: number; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      border: '2px solid #1e2040', borderTop: `2px solid ${color}`,
      borderRadius: '50%', animation: 'cr-spin 0.7s linear infinite',
      verticalAlign: 'middle', flexShrink: 0,
    }} />
  )
}

function Chip({ label, scheme }: { label: string; scheme: string }) {
  const s = RESPONSE_COLORS[scheme] || RESPONSE_COLORS['Not Sent']
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 4, padding: '2px 7px', fontSize: 10, fontWeight: 700,
      letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

// ── Score Simulator ──────────────────────────────────────────────────────────
function ScoreSimulator({ items, importedScores = {} }: { items: DisputeItem[]; importedScores?: Record<string, number> }) {
  const [scores, setScores] = useState<Record<string, string>>({ Experian: '', Equifax: '', TransUnion: '' })
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (importedScores && Object.values(importedScores).some((v) => v > 0)) {
      setScores({
        Experian: importedScores.Experian ? String(importedScores.Experian) : '',
        Equifax: importedScores.Equifax ? String(importedScores.Equifax) : '',
        TransUnion: importedScores.TransUnion ? String(importedScores.TransUnion) : '',
      })
    }
  }, [importedScores])

  const toggle = (id: string) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])

  const projections = BUREAUS.map((b) => {
    const base = parseInt(scores[b]) || 0
    const gain = selected.reduce((acc, id) => {
      const item = items.find((i) => i.id === id)
      if (!item || !item.bureaus.includes(b)) return acc
      const impact = SCORE_IMPACT[item.type] || { low: 10, high: 30 }
      return acc + Math.round((impact.low + impact.high) / 2)
    }, 0)
    return { bureau: b, base, projected: Math.min(850, base + gain), gain }
  })

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Score Simulator</h2>
      <p style={{ color: '#475569', fontSize: 13, margin: '0 0 20px' }}>Enter your current scores, select items to remove, and see your projected improvement.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {BUREAUS.map((b) => (
          <div key={b} style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: BUREAU_COLORS[b], fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>{b}</div>
            <input type="number" min={300} max={850} value={scores[b]}
              onChange={(e) => setScores((p) => ({ ...p, [b]: e.target.value }))}
              placeholder="e.g. 580"
              style={{ ...IS, fontSize: 20, fontWeight: 800, padding: '6px 8px', color: BUREAU_COLORS[b] }} />
          </div>
        ))}
      </div>

      <div style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Select items to remove from report</div>
        {items.length === 0
          ? <div style={{ color: '#475569', fontSize: 13 }}>No items yet. Add dispute items or scan a credit report first.</div>
          : items.map((item) => (
            <div key={item.id} onClick={() => toggle(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
              borderRadius: 7, marginBottom: 4, cursor: 'pointer',
              background: selected.includes(item.id) ? '#1a1a3e' : 'transparent',
              border: `1px solid ${selected.includes(item.id) ? '#4f46e5' : 'transparent'}`,
            }}>
              <input type="checkbox" readOnly checked={selected.includes(item.id)} style={{ accentColor: '#7c3aed', width: 14, height: 14, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{item.creditor}</span>
                <span style={{ color: '#475569', fontSize: 12, marginLeft: 8 }}>{item.type}</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {item.bureaus.map((b) => (
                  <span key={b} style={{ fontSize: 10, fontWeight: 700, color: BUREAU_COLORS[b], background: '#0d1017', border: `1px solid ${BUREAU_COLORS[b]}33`, borderRadius: 3, padding: '1px 5px' }}>{BUREAU_SHORT[b]}</span>
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600, whiteSpace: 'nowrap' }}>
                +{Math.round(((SCORE_IMPACT[item.type]?.low || 10) + (SCORE_IMPACT[item.type]?.high || 30)) / 2)} pts avg
              </div>
            </div>
          ))
        }
      </div>

      {selected.length > 0 && projections.some((p) => p.base > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {projections.map((p) => (
            <div key={p.bureau} style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, color: BUREAU_COLORS[p.bureau], fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>{p.bureau}</div>
              {p.base > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                    <div><div style={{ fontSize: 10, color: '#475569', marginBottom: 2 }}>Current</div><div style={{ fontSize: 22, fontWeight: 800, color: '#94a3b8' }}>{p.base}</div></div>
                    <div style={{ fontSize: 18, color: '#475569' }}>→</div>
                    <div style={{ textAlign: 'right' }}><div style={{ fontSize: 10, color: '#475569', marginBottom: 2 }}>Projected</div><div style={{ fontSize: 22, fontWeight: 800, color: '#4ade80' }}>{p.projected}</div></div>
                  </div>
                  <div style={{ position: 'relative', height: 6, background: '#1a2040', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 3, width: `${(p.projected / 850) * 100}%`, background: p.projected >= 750 ? '#4ade80' : p.projected >= 670 ? '#facc15' : '#f87171', transition: 'width 0.6s ease' }} />
                  </div>
                  {p.gain > 0 && <div style={{ fontSize: 11, color: '#4ade80', marginTop: 6, fontWeight: 600 }}>+{p.gain} points estimated</div>}
                </>
              ) : <div style={{ color: '#475569', fontSize: 12 }}>Enter current score above</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Markdown renderer for generated letters ──────────────────────────────────
function renderLetterMarkdown(raw: string): string {
  const lines = raw.split('\n')
  const out: string[] = []
  let i = 0

  const fmt = (s: string) =>
    s
      .replace(/\\_/g, '_')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')

  while (i < lines.length) {
    const line = lines[i]
    const t = line.trim()

    // Blank
    if (!t) { out.push('<div style="height:8px"></div>'); i++; continue }

    // HR
    if (/^-{3,}$/.test(t)) { out.push('<hr style="border:none;border-top:1px solid #1e2a3a;margin:12px 0">'); i++; continue }

    // Headings
    const h1 = t.match(/^# (.+)/)
    const h2 = t.match(/^## (.+)/)
    const h3 = t.match(/^### (.+)/)
    if (h1) { out.push(`<h2 style="font-size:15px;font-weight:800;color:#e2e8f0;margin:16px 0 8px;letter-spacing:-0.01em">${fmt(h1[1])}</h2>`); i++; continue }
    if (h2) { out.push(`<h3 style="font-size:13px;font-weight:700;color:#a78bfa;margin:14px 0 6px;text-transform:uppercase;letter-spacing:0.04em">${fmt(h2[1])}</h3>`); i++; continue }
    if (h3) { out.push(`<h4 style="font-size:12px;font-weight:700;color:#7dd3fc;margin:10px 0 4px">${fmt(h3[1])}</h4>`); i++; continue }

    // Table — consume all rows until blank or non-table line
    if (t.startsWith('|')) {
      const tableRows: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableRows.push(lines[i].trim()); i++
      }
      // Remove separator rows
      const dataRows = tableRows.filter(r => !/^\|[\s\-:|]+\|$/.test(r))
      let tableHtml = '<table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:12px">'
      dataRows.forEach((row, ri) => {
        const cells = row.slice(1, -1).split('|').map(c => c.trim())
        const tag = ri === 0 ? 'th' : 'td'
        const bg = ri === 0 ? '#0d1829' : ri % 2 === 0 ? '#07090f' : '#0a0d14'
        tableHtml += `<tr>${cells.map(c => `<${tag} style="padding:6px 10px;border:1px solid #1e2a3a;background:${bg};color:${ri===0?'#7dd3fc':'#94a3b8'};font-weight:${ri===0?700:400}">${fmt(c)}</${tag}>`).join('')}</tr>`
      })
      tableHtml += '</table>'
      out.push(tableHtml)
      continue
    }

    // Checkbox list
    const cb = t.match(/^- \[([ xX])\] (.+)/)
    if (cb) {
      out.push(`<div style="display:flex;gap:8px;align-items:flex-start;margin:4px 0;font-size:12px;color:#94a3b8"><span style="flex-shrink:0;margin-top:1px">${cb[1].toLowerCase() === 'x' ? '☑' : '☐'}</span><span>${fmt(cb[2])}</span></div>`)
      i++; continue
    }

    // Bullet list — collect consecutive
    if (/^[-*] /.test(t)) {
      out.push('<ul style="margin:6px 0 6px 16px;padding:0;list-style:none">')
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) {
        const item = lines[i].trim().replace(/^[-*] /, '')
        out.push(`<li style="font-size:12px;color:#94a3b8;margin:3px 0;padding-left:12px;position:relative"><span style="position:absolute;left:0;color:#4f46e5">•</span>${fmt(item)}</li>`)
        i++
      }
      out.push('</ul>')
      continue
    }

    // Numbered list — collect consecutive
    if (/^\d+\. /.test(t)) {
      out.push('<ol style="margin:6px 0 6px 16px;padding:0">')
      let n = 1
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        const item = lines[i].trim().replace(/^\d+\. /, '')
        out.push(`<li style="font-size:12px;color:#94a3b8;margin:4px 0;padding-left:4px" value="${n++}">${fmt(item)}</li>`)
        i++
      }
      out.push('</ol>')
      continue
    }

    // Regular paragraph
    out.push(`<p style="font-size:12px;color:#94a3b8;margin:4px 0;line-height:1.75">${fmt(t)}</p>`)
    i++
  }

  return out.join('\n')
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\\_/g, '_')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^\|[-: |]+\|$/gm, '')
    .replace(/\|/g, '  ')
    .replace(/^---+$/gm, '─'.repeat(50))
    .replace(/^- \[[ x]\] /gm, '☐ ')
    .replace(/^[-*] /gm, '• ')
    .trim()
}

// ── Letter Panel ─────────────────────────────────────────────────────────────
function LetterPanel({ item, yourInfo, bureauStatuses, onStatusChange, adminPassword }: {
  item: DisputeItem
  yourInfo: PersonalInfo
  bureauStatuses: Record<string, string>
  onStatusChange: (itemId: string, bureau: string, status: string) => void
  adminPassword: string
}) {
  const [selectedBureau, setSelectedBureau] = useState(item.bureaus[0] || 'Experian')
  const [generating, setGenerating] = useState(false)
  const [letter, setLetter] = useState<string | null>(null)
  const [recommendation, setRecommendation] = useState<{ key: string; label: string; icon: string; reason: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [customNote, setCustomNote] = useState('')
  const [showOverride, setShowOverride] = useState(false)

  const legalBlock = (lt: typeof LETTER_TYPES[0]) =>
    lt.statutes.map((s) => `• ${s.code} [${s.cite}]: ${s.note}`).join('\n')

  async function generate(overrideKey?: string) {
    if (!yourInfo.name) { alert('Add your personal info in Settings first.'); return }
    setGenerating(true); setLetter(null); setRecommendation(null)

    const burStatus = bureauStatuses[selectedBureau] || 'Not Sent'
    const consumerBlock = `CONSUMER: ${yourInfo.name}, ${yourInfo.address}, ${yourInfo.city}, ${yourInfo.state} ${yourInfo.zip}. DOB: ${yourInfo.dob || '[DOB]'}. SSN last 4: ${yourInfo.ssn || 'XXXX'}.`
    const itemBlock = `DISPUTED ITEM: ${item.creditor}${item.accountLast4 ? ` ...${item.accountLast4}` : ''}, Type: ${item.type}, Legal basis: ${LAW_REFS[item.type] || 'FCRA §611(a)(1)'}. Notes: ${item.reason || customNote || 'none'}.`
    const bureauBlock = `SEND TO: ${BUREAU_ADDRESSES[selectedBureau]}`

    const typeDescriptions = LETTER_TYPES.map((l) =>
      `${l.key}: ${l.label} — use when: ${
        l.key === 'initial'    ? 'first dispute, no prior contact with bureau on this item' :
        l.key === 'mov'       ? 'bureau already returned a "verified" result' :
        l.key === 'goodwill'  ? 'item is paid off and you want a courtesy removal' :
        l.key === 'p4d'       ? 'collection account still owed, willing to pay for deletion' :
        l.key === 'fdcpa'     ? 'a third-party debt collector is reporting the item' :
        l.key === 'escalation'? 'multiple rounds failed, need to threaten litigation' :
        l.key === 'redispute' ? 'already "verified" before — attacking from a new angle'
        : ''
      }`
    ).join('\n')

    if (overrideKey) {
      // Manual override — skip AI selection, use the chosen type directly
      const lt = LETTER_TYPES.find((l) => l.key === overrideKey)!
      const lb = legalBlock(lt)
      const prompt = buildLetterPrompt(overrideKey, consumerBlock, itemBlock, bureauBlock, lb, burStatus, customNote, item, yourInfo, selectedBureau)
      try {
        const result = await callAI(adminPassword, prompt)
        setRecommendation({ key: lt.key, label: lt.label, icon: lt.icon, reason: 'Manual override selected.' })
        setLetter(result)
      } catch (e) {
        setLetter('Error: ' + (e instanceof Error ? e.message : 'Failed'))
      }
      setGenerating(false)
      return
    }

    // AI-driven: pick the best letter type AND write it in one call
    const masterPrompt = `You are a senior credit repair attorney who has litigated FCRA cases and worked inside all three major credit bureaus. Analyze this dispute situation and do two things: (1) choose the single highest-leverage letter type, (2) write the complete letter.

SITUATION:
${consumerBlock}
${itemBlock}
Bureau: ${selectedBureau}
Current dispute status: ${burStatus}

AVAILABLE LETTER TYPES (choose exactly one):
${typeDescriptions}

DECISION RULES:
- Status "Not Sent" or "Sent" with no response → almost always "initial"
- Status "Verified" once → "mov" (force them to prove how they verified)
- Status "Verified" twice or more → "redispute" (new angle) or "escalation" (lawsuit threat)
- Collection account still owed → consider "p4d" or "fdcpa" first
- Third-party collector name in creditor field → "fdcpa"
- Paid account, single late → "goodwill"
- Item type is "Hard Inquiry" → "initial" with FCRA §604 focus

LEGAL CITATIONS FOR THE CHOSEN LETTER TYPE will follow. After choosing, write the FULL letter using every citation below.
${LETTER_TYPES.map((l) => `\n[${l.key.toUpperCase()} STATUTES]\n${legalBlock(l)}`).join('')}

${bureauBlock}

Respond in EXACTLY this format — no deviations:
RECOMMENDATION: [key]
REASON: [2-3 sentences explaining why this specific letter type is the highest-leverage move right now, given the status and item type]
LETTER:
[complete letter — no placeholders, no instructions, full text only]`

    try {
      const raw = await callAI(adminPassword, masterPrompt)

      const recMatch = raw.match(/^RECOMMENDATION:\s*(\S+)/im)
      const reasonMatch = raw.match(/^REASON:\s*([\s\S]+?)(?=\n+LETTER:)/im)
      const letterMatch = raw.match(/^LETTER:\s*([\s\S]+)/im)

      const rawKey = recMatch?.[1]?.toLowerCase().trim() || 'initial'
      const validKey = LETTER_TYPES.find((l) => l.key === rawKey)?.key || 'initial'
      const lt = LETTER_TYPES.find((l) => l.key === validKey)!

      setRecommendation({ key: validKey, label: lt.label, icon: lt.icon, reason: reasonMatch?.[1]?.trim() || '' })
      setLetter(letterMatch?.[1]?.trim() || raw)
    } catch (e) {
      setLetter('Error: ' + (e instanceof Error ? e.message : 'Failed'))
    }
    setGenerating(false)
  }

  function copy() {
    if (letter) { navigator.clipboard.writeText(stripMarkdown(letter)); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Bureau selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>Target bureau:</span>
        {item.bureaus.map((b) => {
          const s = bureauStatuses[b] || 'Not Sent'
          return (
            <button key={b} onClick={() => { setSelectedBureau(b); setLetter(null); setRecommendation(null) }} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 7, cursor: 'pointer',
              border: `1px solid ${selectedBureau === b ? BUREAU_COLORS[b] + '88' : '#1e2a3a'}`,
              background: selectedBureau === b ? BUREAU_COLORS[b] + '15' : 'transparent',
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: selectedBureau === b ? BUREAU_COLORS[b] : '#64748b' }}>{b}</span>
              <Chip label={s} scheme={s} />
            </button>
          )
        })}
      </div>

      {/* Context note */}
      <textarea value={customNote} onChange={(e) => setCustomNote(e.target.value)}
        placeholder="Add context to help AI choose the right letter (e.g. 'I paid this off in 2022', 'this is a medical bill', 'bureau already verified once in March')..."
        rows={2} style={{ ...IS, resize: 'none', fontSize: 12 }} />

      {/* Primary CTA */}
      <button onClick={() => generate()} disabled={generating} style={{
        background: generating ? '#1a2040' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        color: '#fff', border: 'none', borderRadius: 10, padding: '13px 20px',
        fontSize: 14, fontWeight: 800, cursor: generating ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        letterSpacing: '-0.01em',
      }}>
        {generating
          ? <><Spinner size={16} /> Analyzing situation &amp; writing letter...</>
          : '⚡ AI Strategy + Letter'}
      </button>

      {/* Override section */}
      <div>
        <button onClick={() => setShowOverride((p) => !p)} style={{ background: 'none', border: 'none', color: '#374151', fontSize: 11, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 9 }}>{showOverride ? '▼' : '▶'}</span> Override letter type manually
        </button>
        {showOverride && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6, marginTop: 8 }}>
            {LETTER_TYPES.map((l) => (
              <button key={l.key} onClick={() => { setShowOverride(false); generate(l.key) }} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '8px 10px', borderRadius: 8,
                border: '1px solid #1e2a3a', background: '#0d1017', cursor: 'pointer', textAlign: 'left',
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{l.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>{l.label.split('—')[0].trim()}</div>
                  <div style={{ fontSize: 10, color: '#374151', marginTop: 1 }}>{l.statutes.length} statutes</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status tracking */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#475569' }}>Mark {selectedBureau}:</span>
        {RESPONSE_STATUSES.map((s) => (
          <button key={s} onClick={() => onStatusChange(item.id, selectedBureau, s)} style={{
            padding: '3px 9px', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer',
            border: `1px solid ${bureauStatuses[selectedBureau] === s ? (RESPONSE_COLORS[s]?.border || '#4f46e5') : '#1e2a3a'}`,
            background: bureauStatuses[selectedBureau] === s ? (RESPONSE_COLORS[s]?.bg || '#1a1a3e') : 'transparent',
            color: bureauStatuses[selectedBureau] === s ? (RESPONSE_COLORS[s]?.color || '#a78bfa') : '#475569',
          }}>{s}</button>
        ))}
      </div>

      {/* Recommendation card */}
      {recommendation && (
        <div style={{ background: '#070d1a', border: '1px solid #1e3a5f', borderRadius: 10, padding: '12px 16px', animation: 'cr-fade 0.2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>{recommendation.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa' }}>AI chose: {recommendation.label}</div>
              <div style={{ fontSize: 10, color: '#1e3a5f', marginTop: 1 }}>Based on {item.type} · {selectedBureau} · status: {bureauStatuses[selectedBureau] || 'Not Sent'}</div>
            </div>
          </div>
          {recommendation.reason && recommendation.reason !== 'Manual override selected.' && (
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.65, borderTop: '1px solid #0f1628', paddingTop: 8 }}>{recommendation.reason}</div>
          )}
        </div>
      )}

      {/* Letter */}
      {letter && !letter.startsWith('Error:') && (
        <div style={{ animation: 'cr-fade 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>Letter — {selectedBureau}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={copy} style={{ background: copied ? '#052e16' : '#1a2040', color: copied ? '#4ade80' : '#94a3b8', border: `1px solid ${copied ? '#14532d' : '#2d3a5e'}`, borderRadius: 5, padding: '3px 12px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>{copied ? '✓ Copied!' : '📋 Copy Plain Text'}</button>
              <button onClick={() => window.print()} style={{ background: 'transparent', color: '#475569', border: '1px solid #1e2a3a', borderRadius: 5, padding: '3px 10px', fontSize: 11, cursor: 'pointer' }}>🖨 Print</button>
            </div>
          </div>
          <div
            style={{ background: '#050810', border: '1px solid #1a2040', borderRadius: 8, padding: '18px 20px', maxHeight: 560, overflowY: 'auto' }}
            dangerouslySetInnerHTML={{ __html: renderLetterMarkdown(letter) }}
          />
        </div>
      )}

      {letter?.startsWith('Error:') && (
        <div style={{ background: '#2d0a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fca5a5' }}>{letter}</div>
      )}
    </div>
  )
}

function buildLetterPrompt(key: string, consumerBlock: string, itemBlock: string, bureauBlock: string, lb: string, burStatus: string, customNote: string, item: DisputeItem, yourInfo: PersonalInfo, selectedBureau: string): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const sigRule = `SIGNATURE RULES: (A) Put today's date "${today}" at the top of the letter. (B) Leave ALL signature lines completely blank — write only the label and an underline like "Signature: ___________________________" — never write a name in the signature area.`
  const base = `${consumerBlock}\n${itemBlock}\n${bureauBlock}\n\nMANDATORY CITATIONS:\n${lb}\n\n${sigRule}`
  const prompts: Record<string, string> = {
    initial: `Expert credit repair attorney. Write complete FCRA-compliant initial dispute letter. Every citation must appear verbatim.\n\n${base}\n\nRequirements: (1) Date: ${today} at the top (2) Formal RE: line (3) State inaccuracy and FCRA/Metro 2 violation (4) Cite every statute by full code and USC (5) Demand deletion/correction within 30 days per FCRA §611(a)(1) (6) Invoke §623(a)(1)(A) furnisher liability (7) Request MOV per §611(a)(7) if they verify (8) State intent to file CFPB complaint (9) Signature line must be blank. Complete letter only.`,
    mov: `Expert credit repair attorney. Bureau claimed to verify this item. Write Method of Verification demand letter.\n\n${base}\nBureau status: ${burStatus}\n\nRequirements: (1) Date: ${today} at the top (2) Reference prior "verified" result (3) Cite §611(a)(7) — right to know method (4) Cite Cushman v. Trans Union — matching is not investigation (5) Cite Stevenson v. TRW — rubber-stamp verification is a violation (6) Demand: method used, furnisher contact info, documents reviewed, dates (7) 15-day response deadline or delete (8) Failure to respond is itself an FCRA violation (9) Signature line must be blank. Complete letter only.`,
    goodwill: `Credit repair specialist. Write sincere goodwill deletion letter to original creditor. NOT a legal threat — human appeal invoking creditor's discretion.\n\nDate: ${today}\nConsumer: ${yourInfo.name}, ${item.creditor} account ...${item.accountLast4 || '????'}\n${customNote ? `Situation: ${customNote}` : 'Consumer had a hardship causing this isolated negative event with otherwise positive history.'}\n\nLegal hooks (frame as their right, not a threat):\n${lb}\n\n${sigRule}\n\nRequirements: (1) Date ${today} at the top (2) Address goodwill/customer service department (3) Appreciate the creditor relationship (4) Describe specific hardship (5) Highlight positive history before and after (6) Reference §623(b)(1)(E) as their discretion to delete (7) Clear ask: deletion from all 3 bureaus (8) Humble, genuine, professional tone (9) Signature line must be blank. Complete letter only.`,
    p4d: `Credit negotiation specialist. Write pay-for-delete letter to collection agency. Payment is CONDITIONAL on prior written deletion confirmation.\n\nDate: ${today}\nConsumer: ${yourInfo.name}, Collector: ${item.creditor} ...${item.accountLast4 || '????'}\n${customNote ? `Context: ${customNote}` : ''}\n\nCitations:\n${lb}\n\n${sigRule}\n\nRequirements: (1) Date ${today} at the top (2) Acknowledge balance — do NOT admit liability (3) Cite FDCPA §807 re: misrepresentation (4) Cite §623(b)(1)(E) furnisher's right to delete on settlement (5) Specific offer — leave as [AMOUNT] (6) Conditional: written deletion agreement BEFORE payment (7) Accord and satisfaction — not admission of liability (8) Written company letterhead agreement required (9) 14-day deadline (10) Signature line must be blank. Complete letter only.`,
    fdcpa: `Consumer rights attorney. Write FDCPA debt validation demand letter. All collection activity must cease until validated.\n\n${base}\n\nDemands to include: written verification of amount, original creditor name/address, chain of title, copy of original signed agreement, itemized payment history, statute of limitations proof, collector's license number, assignment agreements.\n\nRequirements: (1) Date ${today} at the top (2) Invoke FDCPA §809(b) (3) All collection activity including credit reporting must cease immediately (4) Cite FDCPA §807(2), §808, Haddad v. Alexander (5) $1,000 statutory damages per §813 plus attorney fees (6) 30-day deadline (7) Signature line must be blank. Complete letter only.`,
    escalation: `Senior consumer protection attorney. Write final legal escalation letter with explicit lawsuit notice. Must read like it came from a law firm.\n\nDate: ${today}\nConsumer/Plaintiff: ${yourInfo.name}, ${yourInfo.address}, ${yourInfo.city}, ${yourInfo.state} ${yourInfo.zip}\nRespondent: ${selectedBureau}\nDisputed item: ${item.creditor} ...${item.accountLast4 || '????'}\nHistory: Previously disputed; ${burStatus === 'Verified' ? 'verified without reasonable investigation' : 'failed to delete or correct despite multiple disputes'}\n${customNote ? `Additional facts: ${customNote}` : ''}\n\nEvery citation must appear:\n${lb}\n\n${sigRule}\n\nRequirements: (1) Date ${today} at the top (2) RE: NOTICE OF INTENT TO SUE (3) Detail violation history (4) §616 willful noncompliance: $100-$1,000 per violation + punitive (5) §617 negligent noncompliance: actual damages + fees (6) Safeco v. Burr — reckless disregard = willful (7) Saunders v. Branch Banking (8) Federal district court under 28 U.S.C. §1331 (9) Simultaneous CFPB and AG complaints (10) Final 10-day cure period (11) Signature line must be blank. Complete letter only.`,
    redispute: `Expert credit repair attorney. Write re-dispute letter attacking from a NEW angle — Metro 2 field-level compliance. Bureau already "verified" — now attack the furnisher's data.\n\n${base}\nPrior status: verified — new material grounds: ${item.reason || customNote || 'Metro 2 DOFD, account status code, payment rating accuracy'}\n\nRequirements: (1) Date ${today} at the top (2) NEW dispute based on new material information per §611(a)(1) (3) §623(b) furnisher independent duty (4) §623(b)(1)(A) must investigate specific dispute (5) Johnson v. MBNA — cannot just parrot furnisher (6) Metro 2 §5.1 DOFD accuracy (7) Metro 2 Appendix A account status code accuracy (8) Demand bureau forward all specific grounds (9) If furnisher cannot verify Metro 2 fields — delete under §611(a)(5)(A) (10) Signature line must be blank. Complete letter only.`,
  }
  return prompts[key] || prompts.initial
}

// ── Standalone AI letter generator (used by automation loop) ─────────────────
async function aiGenerateLetter(
  item: DisputeItem,
  bureau: string,
  yourInfo: PersonalInfo,
  adminPassword: string,
  burStatus: string,
): Promise<GeneratedLetter> {
  const legalBlock = (lt: typeof LETTER_TYPES[0]) =>
    lt.statutes.map((s) => `• ${s.code} [${s.cite}]: ${s.note}`).join('\n')

  const consumerBlock = `CONSUMER: ${yourInfo.name}, ${yourInfo.address}, ${yourInfo.city}, ${yourInfo.state} ${yourInfo.zip}. DOB: ${yourInfo.dob || '[DOB]'}. SSN last 4: ${yourInfo.ssn || 'XXXX'}.`
  const itemBlock = `ITEM: ${item.creditor}${item.accountLast4 ? ` ...${item.accountLast4}` : ''}, Type: ${item.type}, Legal basis: ${LAW_REFS[item.type] || 'FCRA §611(a)(1)'}. Notes: ${item.reason || 'none'}.`
  const bureauBlock = `SEND TO:\n${BUREAU_ADDRESSES[bureau]}`

  // Step 1: pick type (small call, ~400 tokens)
  const pickPrompt = `Credit repair attorney. Pick the best letter type for this dispute.
Item: ${item.creditor}, ${item.type}, bureau: ${bureau}, current status: "${burStatus}"
Types: initial (first dispute, not yet sent) | mov (bureau already returned "verified") | goodwill (paid-off item, courtesy request) | p4d (collection still owed, offer payment) | fdcpa (third-party debt collector) | escalation (multiple rounds failed, litigation threat) | redispute (verified before, attack new angle)
Rules: Not Sent -> initial | Verified once -> mov | Verified 2+ times -> redispute or escalation | Collector name -> fdcpa | Paid account + single late -> goodwill | Balance owed -> p4d
Respond ONLY:
TYPE: [key]
REASON: [1-2 sentences why this is the highest-leverage move right now]`

  const pickRaw = await callAI(adminPassword, pickPrompt)
  const typeMatch = pickRaw.match(/^TYPE:\s*(\S+)/im)
  const reasonMatch = pickRaw.match(/^REASON:\s*(.+)/im)
  const rawKey = typeMatch?.[1]?.toLowerCase().trim() || 'initial'
  const validKey = LETTER_TYPES.find((l) => l.key === rawKey)?.key || 'initial'
  const lt = LETTER_TYPES.find((l) => l.key === validKey)!
  const reason = reasonMatch?.[1]?.trim() || ''

  // Step 2: write the letter (focused call for chosen type)
  const lb = legalBlock(lt)
  const letterPrompt = buildLetterPrompt(validKey, consumerBlock, itemBlock, bureauBlock, lb, burStatus, item.reason || '', item, yourInfo, bureau)
  const letterRaw = await callAI(adminPassword, letterPrompt)

  return { letterKey: validKey, letterLabel: lt.label, letterIcon: lt.icon, reason, text: letterRaw.trim(), generatedAt: new Date().toISOString() }
}

// ── JSON repair — handles trailing commas and truncated responses ─────────────
function parseAiJson(raw: string): ReturnType<typeof JSON.parse> {
  // Strip markdown fences and leading/trailing whitespace
  let s = raw.replace(/```json\s*|```\s*/g, '').trim()

  // Find the outermost JSON object (prefer { over [)
  const objStart = s.indexOf('{')
  const arrStart = s.indexOf('[')
  const start = objStart === -1 ? arrStart : arrStart === -1 ? objStart : Math.min(objStart, arrStart)
  if (start === -1) throw new Error('No JSON found in response')
  s = s.slice(start)

  // Strip trailing commas before ] or } (common AI mistake)
  s = s.replace(/,(\s*[}\]])/g, '$1')

  // Try to parse as-is first
  try { return JSON.parse(s) } catch { /* fall through to repair */ }

  // Close any unclosed brackets/braces caused by token-limit truncation
  let braces = 0, brackets = 0, inStr = false, esc = false
  for (const ch of s) {
    if (esc) { esc = false; continue }
    if (ch === '\\' && inStr) { esc = true; continue }
    if (ch === '"') { inStr = !inStr; continue }
    if (inStr) continue
    if (ch === '{') braces++
    else if (ch === '}') braces = Math.max(0, braces - 1)
    else if (ch === '[') brackets++
    else if (ch === ']') brackets = Math.max(0, brackets - 1)
  }
  // If we were cut off mid-string, trim back to last complete value
  if (inStr) {
    const lastQuote = s.lastIndexOf('"')
    // Walk back past the incomplete string to the last valid separator
    const cutAt = s.lastIndexOf(',', lastQuote)
    if (cutAt > 0) s = s.slice(0, cutAt)
  }
  // Close any unclosed brackets and braces
  s += ']'.repeat(brackets) + '}'.repeat(braces)
  // Strip trailing commas again after surgery
  s = s.replace(/,(\s*[}\]])/g, '$1')

  return JSON.parse(s)
}

// ── PDF text extraction (avoids base64 size limits for large credit reports) ──
const MAX_EXTRACTED_CHARS = 40_000

async function extractDocxText(file: File, onProgress: (msg: string) => void): Promise<string> {
  onProgress('Reading Word document...')
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  if (result.messages?.length) onProgress(`Warnings: ${result.messages.map((m: any) => m.message).join(', ')}`)
  const text = result.value?.replace(/\s+/g, ' ').trim() || ''
  return text.slice(0, MAX_EXTRACTED_CHARS)
}

async function extractPdfText(file: File, onProgress: (msg: string) => void): Promise<string> {
  onProgress('Loading PDF.js library...')
  const pdfjsLib = await import('pdfjs-dist')
  onProgress(`PDF.js v${(pdfjsLib as any).version ?? '?'} ready — setting up worker...`)

  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  onProgress('Worker configured')

  onProgress('Parsing PDF structure...')
  const arrayBuffer = await file.arrayBuffer()
  const loadTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
  const pdf = await loadTask.promise
  onProgress(`PDF opened: ${pdf.numPages} page${pdf.numPages !== 1 ? 's' : ''}`)

  const pages: string[] = []
  let totalChars = 0
  for (let i = 1; i <= pdf.numPages; i++) {
    if (totalChars >= MAX_EXTRACTED_CHARS) {
      onProgress(`Character cap reached at page ${i}/${pdf.numPages} — truncating`)
      break
    }
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = (content.items as Array<{ str?: string }>)
      .map(item => item.str || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (text) { pages.push(`[Page ${i}]\n${text}`); totalChars += text.length }
  }
  onProgress(`Extracted ${totalChars.toLocaleString()} characters from ${pages.length} pages`)
  return pages.join('\n\n')
}

// ── Scan Tab ──────────────────────────────────────────────────────────────────
function ScanTab({ onImport, adminPassword }: {
  onImport: (data: { personalInfo: Partial<PersonalInfo>; negativeItems: Array<Omit<DisputeItem, 'id'>>; creditScores?: Record<string, number> }) => void
  adminPassword: string
}) {
  const [scanning, setScanning] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; type: string } | null>(null)
  const [log, setLog] = useState<Array<{ msg: string; type: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  function cancelScan() {
    abortRef.current?.abort(new Error('Scan cancelled.'))
  }

  const addLog = (msg: string, type = 'info') => setLog((p) => [...p, { msg, type }])

  async function processFile(file: File) {
    if (!file) return
    const isPDF  = file.type === 'application/pdf'
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx')
    const isImage = file.type.startsWith('image/')
    if (!isPDF && !isDocx && !isImage) {
      setError('Supported formats: PDF, Word (.docx), or image (JPG, PNG, HEIC, WEBP).')
      return
    }
    setError(null); setLog([]); setScanning(true)
    const controller = new AbortController()
    abortRef.current = controller
    setFileInfo({ name: file.name, size: (file.size / 1024).toFixed(0) + ' KB', type: isDocx ? 'Word' : isPDF ? 'PDF' : 'Image' })
    if (isImage) setPreview(URL.createObjectURL(file))
    else setPreview(null)

    addLog(`Reading ${isDocx ? 'Word document' : isPDF ? 'PDF' : 'image'} (${(file.size / 1024).toFixed(0)} KB)...`)

    let base64: string | null = null
    let sendType: string | null = null
    let extractedPdfText: string | null = null
    let pdfPageImages: string[] | null = null

    if (isDocx) {
      extractedPdfText = await extractDocxText(file, (msg) => addLog(msg))
      if (!extractedPdfText || extractedPdfText.length < 100) throw new Error('No readable text found in this Word document.')
      addLog(`Extracted ${extractedPdfText.length.toLocaleString()} characters from Word doc`, 'success')
    } else if (isImage) {
      // Resize to max 1200px wide at 85% JPEG quality to stay within token limits
      addLog('Resizing image to reduce token usage...')
      base64 = await new Promise<string>((res, rej) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
          URL.revokeObjectURL(url)
          const MAX = 1200
          const scale = Math.min(1, MAX / img.width)
          const canvas = document.createElement('canvas')
          canvas.width = Math.round(img.width * scale)
          canvas.height = Math.round(img.height * scale)
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
          res(canvas.toDataURL('image/jpeg', 0.85).split(',')[1])
        }
        img.onerror = rej
        img.src = url
      })
      sendType = 'image/jpeg'
    } else if (file.size > 2.5 * 1024 * 1024) {
      // Large PDF — extract text client-side to avoid Vercel's 4.5 MB body limit.
      addLog(`PDF is ${(file.size / 1024 / 1024).toFixed(1)} MB — extracting text to stay within upload limits...`)
      extractedPdfText = await extractPdfText(file, (msg) => addLog(msg))
      if (!extractedPdfText || extractedPdfText.length < 200) {
        addLog('No embedded text found — PDF is scanned. Rendering pages as images for AI vision analysis...')
        pdfPageImages = await renderPdfPagesAsImages(file, (msg) => addLog(msg))
        if (!pdfPageImages.length) throw new Error('Could not render any pages from this PDF.')
        addLog(`Ready — sending ${pdfPageImages.length} page images to AI...`, 'success')
      } else {
        addLog(`Extracted ${extractedPdfText.length.toLocaleString()} characters from PDF`, 'success')
        addLog(`Preview: "${extractedPdfText.slice(0, 300).replace(/\n/g, ' ')}"`)
      }

    } else {
      base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader()
        r.onload = () => res((r.result as string).split(',')[1])
        r.onerror = rej
        r.readAsDataURL(file)
      })
      sendType = file.type
    }

    addLog('Sending to AI for extraction...')

    const SCAN_SYSTEM = `You are a credit report data extraction engine. Your only job is to output a single valid JSON object — no prose, no markdown fences, no explanation before or after. If a field is unclear or missing, use an empty string or 0. Never refuse; always return the JSON structure.`

    const SCHEMA = `{
  "personalInfo": { "name": "", "address": "", "city": "", "state": "", "zip": "", "dob": "", "phone": "" },
  "creditScores": { "Experian": 0, "Equifax": 0, "TransUnion": 0 },
  "allAccounts": [
    {
      "creditor": "creditor name",
      "accountLast4": "last 4 digits or empty string",
      "balance": "balance amount or empty string",
      "paymentStatus": "current / late / closed / charged off / etc",
      "bureaus": ["Experian"],
      "isNegative": false,
      "type": "one of: Late Payment, Collection Account, Charge-Off, Repossession, Foreclosure, Hard Inquiry, Invalid Debt, Bankruptcy, Identity Theft / Not Mine, Duplicate Account, Incorrect Balance, Incorrect Status",
      "reason": ""
    }
  ],
  "hardInquiries": [{ "creditor": "", "date": "", "bureau": "" }],
  "publicRecords": [{ "type": "", "date": "", "amount": "", "bureau": "" }],
  "summary": { "totalAccounts": 0, "negativeAccounts": 0, "hardInquiries": 0, "totalDebt": "" }
}`

    const basePrompt = `Extract all data from this credit report and return ONLY a valid JSON object with exactly this structure. Do not add any text before or after the JSON object.\n\n${SCHEMA}\n\nExtraction rules:\n- Set isNegative to true for: late payments, collections, charge-offs, repossessions, foreclosures, bankruptcies, derogatory marks\n- bureaus array should contain only the bureaus that report that specific negative item\n- If hardInquiries or publicRecords are empty, still include them as empty arrays\n- Extract ALL accounts visible in the report, both positive and negative`

    const prompt = extractedPdfText
      ? `${basePrompt}\n\nCREDIT REPORT TEXT (extracted from PDF):\n${extractedPdfText}`
      : basePrompt

    try {
      addLog('Analyzing accounts and payment history...')
      const raw = await callAI(adminPassword, prompt, base64, sendType, SCAN_SYSTEM, controller.signal, 6000, pdfPageImages ?? undefined)
      if (!raw || raw.trim().length === 0) throw new Error('AI returned an empty response — the file may be unreadable or the API key may have insufficient credits.')
      addLog(`AI response received (${raw.length} chars)`, 'info')
      let parsed: {
        personalInfo?: Record<string, string>
        creditScores?: Record<string, number>
        allAccounts?: ReviewItem[]
        hardInquiries?: Array<{ creditor: string; date: string; bureau: string }>
        publicRecords?: Array<{ type: string; date: string; amount: string; bureau: string }>
        summary?: ScanReviewInfo['summary']
      }
      parsed = parseAiJson(raw)

      const negItems = (parsed.allAccounts || []).filter((a) => a.isNegative)
      const allItems = parsed.allAccounts || []
      const inquiries = parsed.hardInquiries || []
      const pubRecs = parsed.publicRecords || []

      addLog(`Found ${allItems.length} total accounts`, 'success')
      addLog(`${negItems.length} negative/derogatory item(s) — importing now...`, negItems.length > 0 ? 'warn' : 'success')
      addLog(`${inquiries.length} hard inquiries`, inquiries.length > 5 ? 'warn' : 'success')
      if (pubRecs.length > 0) addLog(`${pubRecs.length} public record(s)`, 'warn')
      if (parsed.personalInfo?.name) addLog(`Name: ${parsed.personalInfo.name}`, 'success')
      if (parsed.creditScores) {
        const str = BUREAUS.map((b) => parsed.creditScores![b] > 0 ? `${b.slice(0, 3)}: ${parsed.creditScores![b]}` : null).filter(Boolean).join(' · ')
        if (str) addLog(`Scores: ${str}`, 'success')
      }

      const pubRecItems: Array<Omit<DisputeItem, 'id'>> = pubRecs.map((pr) => ({
        creditor: pr.type || 'Public Record', accountLast4: '',
        type: pr.type?.toLowerCase().includes('bankrupt') ? 'Bankruptcy' : 'Invalid Debt',
        bureaus: pr.bureau ? [pr.bureau] : BUREAUS,
        reason: `${pr.type || ''} ${pr.date || ''} ${pr.amount || ''}`.trim(),
      }))

      const negativeItems: Array<Omit<DisputeItem, 'id'>> = [
        ...negItems.map((item) => ({ ...item, bureaus: item.bureaus?.length ? item.bureaus : BUREAUS })),
        ...pubRecItems,
      ]

      addLog('Launching campaign — AI is writing your letters now...', 'success')
      onImport({ personalInfo: parsed.personalInfo || {}, negativeItems, creditScores: parsed.creditScores })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      addLog(`Error: ${msg}`, 'error')
      if (msg.includes('rate limit') || msg.includes('tokens per minute')) {
        setError('Rate limit hit — wait 60 seconds and try again, or upload a smaller/cropped screenshot.')
      } else if (msg.includes('credit balance') || msg.includes('insufficient') || msg.includes('billing')) {
        setError('API credits exhausted — add billing credits at console.anthropic.com/settings/billing.')
      } else if (msg.includes('No JSON') || msg.includes('Unexpected') || msg.includes('JSON')) {
        setError(`AI could not extract structured data. Check the log above for what it returned. Try: (1) PDF from AnnualCreditReport.com, (2) screenshot of just the accounts section, (3) ensure the file isn't password-protected.`)
      } else {
        setError(`Scan failed: ${msg}`)
      }
    }
    setScanning(false)
  }

  // ── Upload screen ────────────────────────────────────────────────────────
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Upload Credit Report</h2>
      <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 22px', lineHeight: 1.6 }}>
        Upload your full report — AI extracts every account, score, inquiry, and public record automatically.
      </p>

      {/* Format choice cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#080f1e', border: '1px solid #1e3a5f', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>📄</div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', marginBottom: 4 }}>
            PDF <span style={{ background: '#0d2a0d', color: '#4ade80', border: '1px solid #14532d', borderRadius: 4, fontSize: 10, fontWeight: 800, padding: '1px 7px', marginLeft: 5 }}>Recommended</span>
          </div>
          <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
            Download from AnnualCreditReport.com, Experian, Equifax, or TransUnion.
          </div>
        </div>
        <div style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>📝</div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', marginBottom: 4 }}>Word (.docx)</div>
          <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
            Open your PDF in Google Docs, save as .docx, upload here. Fastest text extraction, smallest upload.
          </div>
        </div>
        <div style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>🖼</div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', marginBottom: 4 }}>Screenshot / Photo</div>
          <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
            JPG, PNG, HEIC, WEBP. Full-screen showing all columns.
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f) }}
        onClick={() => !scanning && fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#7c3aed' : '#1e2a3a'}`,
          borderRadius: 14, padding: '40px 24px', textAlign: 'center',
          cursor: scanning ? 'default' : 'pointer',
          background: dragOver ? '#0f0d2a' : '#0d1017',
          marginBottom: 16, position: 'relative', overflow: 'hidden',
          transition: 'border-color 0.15s, background 0.15s',
        }}>
        <input ref={fileRef} type="file" accept="image/*,.pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }} />

        {scanning ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <Spinner size={32} color="#7c3aed" />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#a78bfa' }}>Analyzing with AI vision...</div>
            <div style={{ fontSize: 12, color: '#475569' }}>{fileInfo?.name}</div>
            <button onClick={cancelScan} style={{ marginTop: 4, background: 'transparent', border: '1px solid #374151', borderRadius: 6, padding: '4px 14px', fontSize: 11, color: '#6b7280', cursor: 'pointer' }}>Cancel</button>
          </div>
        ) : fileInfo ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {preview
              ? <img src={preview} alt="Preview" style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 8, marginBottom: 8 }} />
              : <div style={{ fontSize: 40, marginBottom: 4 }}>📄</div>
            }
            <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: 13 }}>{fileInfo.name}</div>
            <div style={{ color: '#475569', fontSize: 12 }}>{fileInfo.size} · {fileInfo.type}</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#94a3b8', marginBottom: 4 }}>Drop your credit report here</div>
            <div style={{ color: '#374151', fontSize: 13 }}>PDF, Word (.docx), or image · click to browse</div>
          </>
        )}
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div style={{ background: '#050810', border: '1px solid #1e2a3a', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
          {log.map((l, i) => (
            <div key={i} style={{ fontSize: 12, lineHeight: 1.9, color: l.type === 'error' ? '#f87171' : l.type === 'warn' ? '#fb923c' : l.type === 'success' ? '#4ade80' : '#64748b' }}>
              {l.msg}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ background: '#2d0a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fca5a5', marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* Tip */}
      <div style={{ background: '#07100a', border: '1px solid #14532d', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#4ade80', lineHeight: 1.7, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>🏆</span>
        <div>
          <strong>Best results:</strong> Download your PDF from <strong>annualcreditreport.com</strong> — it has a full text layer so the AI reads every field precisely. Request all 3 bureaus at once, download each as PDF.
        </div>
      </div>
    </div>
  )
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab({ yourInfo, setYourInfo }: { yourInfo: PersonalInfo; setYourInfo: React.Dispatch<React.SetStateAction<PersonalInfo>> }) {
  const [draft, setDraft] = useState<PersonalInfo>({ ...yourInfo })
  const [saved, setSaved] = useState(false)

  useEffect(() => { setDraft({ ...yourInfo }) }, [yourInfo])

  function save() {
    setYourInfo(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 560, animation: 'cr-fade 0.2s ease' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>Your Information</h2>
      <p style={{ color: '#475569', fontSize: 13, margin: '0 0 20px' }}>Used in all generated letters. Stored locally in your browser only.</p>
      <div style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 10, padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {([
            ['name',    'Full Name',      'John Smith',  'text'],
            ['address', 'Street Address', '123 Main St', 'text'],
            ['city',    'City',           'Dallas',      'text'],
            ['state',   'State',          'TX',          'text'],
            ['zip',     'ZIP Code',       '75201',       'text'],
            ['dob',     'Date of Birth',  'MM/DD/YYYY',  'text'],
            ['ssn',     'SSN Last 4',     '1234',        'password'],
          ] as [keyof PersonalInfo, string, string, string][]).map(([k, label, ph, type]) => (
            <label key={k} style={{ fontSize: 12 }}>
              <div style={{ color: '#64748b', marginBottom: 4 }}>{label}</div>
              <input type={type} value={draft[k] || ''} onChange={(e) => setDraft((p) => ({ ...p, [k]: e.target.value }))} placeholder={ph} style={IS} />
            </label>
          ))}
        </div>
        <button onClick={save} style={{
          marginTop: 16, width: '100%', padding: '11px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
          background: saved ? '#052e16' : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
          color: saved ? '#4ade80' : '#fff',
          transition: 'background 0.2s',
        }}>
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
      <div style={{ background: '#070d1a', border: '1px solid #1e3a5f', borderRadius: 8, padding: '11px 14px', fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
        All data is stored in your browser only. Nothing is sent to any server except when generating letters via the AI model.
      </div>
    </div>
  )
}

// ── Process Guide ─────────────────────────────────────────────────────────────
function ProcessGuide({ bureauStatuses, letters, items }: { bureauStatuses: BureauStatusMap; letters: LettersStore; items: DisputeItem[] }) {
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState<'online' | 'mail'>('online')
  const sentCount = items.reduce((a, item) =>
    a + item.bureaus.filter((b) => ['Sent', 'Verified', 'Deleted', 'Escalated'].includes(bureauStatuses[item.id]?.[b] || '')).length, 0)
  const totalLetters = Object.values(letters).reduce((a, b) => a + Object.keys(b).length, 0)
  const readyCount = totalLetters - sentCount

  const bureauPortals = [
    { bureau: 'Experian', color: '#3b82f6', url: 'https://www.experian.com/disputes/main.html', mail: 'P.O. Box 4500\nAllen, TX 75013' },
    { bureau: 'Equifax', color: '#ef4444', url: 'https://www.equifax.com/personal/credit-report-services/credit-dispute/', mail: 'P.O. Box 740256\nAtlanta, GA 30374' },
    { bureau: 'TransUnion', color: '#10b981', url: 'https://dispute.transunion.com', mail: 'Consumer Dispute Center\nP.O. Box 2000\nChester, PA 19016' },
  ]

  return (
    <div style={{ background: '#080e1c', border: '1px solid #1e3a5f', borderRadius: 12, marginBottom: 20, overflow: 'hidden' }}>
      <button onClick={() => setOpen((p) => !p)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 16 }}>📋</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#7dd3fc' }}>How to Submit Your Disputes</div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 1 }}>
            {totalLetters > 0
              ? `${readyCount} letter${readyCount !== 1 ? 's' : ''} ready · ${sentCount} sent — online portal or certified mail`
              : 'Online portal or certified mail — choose your method'}
          </div>
        </div>
        <span style={{ color: '#374151', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 16px 18px', borderTop: '1px solid #0f1628' }}>

          {/* Method toggle */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14, marginBottom: 16 }}>
            {(['online', 'mail'] as const).map((m) => (
              <button key={m} onClick={() => setMethod(m)} style={{
                flex: 1, padding: '9px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: `1px solid ${method === m ? '#1e3a5f' : '#0d1525'}`,
                background: method === m ? '#061830' : 'transparent',
                color: method === m ? '#7dd3fc' : '#374151',
              }}>
                {m === 'online' ? '🖥️ Online Portal' : '📬 Certified Mail'}
                {m === 'online' && <span style={{ marginLeft: 6, fontSize: 9, background: '#0d2a0d', color: '#4ade80', border: '1px solid #14532d', borderRadius: 3, padding: '1px 5px' }}>FASTER</span>}
                {m === 'mail' && <span style={{ marginLeft: 6, fontSize: 9, background: '#1a1040', color: '#a78bfa', border: '1px solid #4c1d95', borderRadius: 3, padding: '1px 5px' }}>STRONGER</span>}
              </button>
            ))}
          </div>

          {/* Comparison note */}
          <div style={{ background: '#050810', border: '1px solid #0d1525', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#475569', lineHeight: 1.7 }}>
            {method === 'online'
              ? <><strong style={{ color: '#7dd3fc' }}>Online disputes</strong> are processed faster and easier — no post office trip. Best for Round 1 initial disputes. The bureau will email you results. Copy-paste your letter text into the dispute description field, then attach your ID as a supporting document.</>
              : <><strong style={{ color: '#a78bfa' }}>Certified mail</strong> creates a legal paper trail the bureau cannot deny receiving. Strongly recommended for Method of Verification demands, escalations, and any letter you may need as lawsuit evidence. The green return card = your proof the 30-day clock started.</>
            }
          </div>

          {method === 'online' ? (
            <>
              {/* Online portal steps */}
              <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
                {[
                  { step: '1', icon: '⬇', title: 'Download your letter', body: 'Click the download button on each letter to save it as a .txt file. You\'ll copy this content into the dispute portal.' },
                  { step: '2', icon: '🖥️', title: 'Open the bureau\'s dispute portal', body: 'Click the link below for each bureau. You\'ll need to log in or create a free account to file a dispute.' },
                  { step: '3', icon: '🔍', title: 'Find the account to dispute', body: 'Locate the specific account in your credit report on the portal and click "Dispute This Item" or similar.' },
                  { step: '4', icon: '📝', title: 'Paste your letter into the description', body: 'In the dispute reason/description box, paste the body of your letter. If there\'s a character limit, paste the key legal citations and your demand.' },
                  { step: '5', icon: '📎', title: 'Upload proof of identity', body: 'Upload a copy of your photo ID and one proof of address. Bureaus require this to process the dispute.' },
                  { step: '6', icon: '📩', title: 'Submit and watch your email', body: 'Bureaus email results within 30 days. When you receive a response, update the status in this dashboard and regenerate the next letter if needed.' },
                ].map(({ step, icon, title, body }) => (
                  <div key={step} style={{ display: 'flex', gap: 10, padding: '9px 12px', borderRadius: 8, background: '#050810', border: '1px solid #0d1525' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#0d1525', color: '#7dd3fc', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{step}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 2 }}>{icon} {title}</div>
                      <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.6 }}>{body}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Portal links */}
              <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Dispute Portal Links</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {bureauPortals.map(({ bureau, color, url }) => (
                  <a key={bureau} href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#050810', border: `1px solid ${color}22`, borderRadius: 8, padding: '10px 12px', textDecoration: 'none' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 4 }}>{bureau}</div>
                    <div style={{ fontSize: 10, color: '#374151', marginBottom: 6, wordBreak: 'break-all' }}>{url.replace('https://', '')}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#7dd3fc', background: '#061830', border: '1px solid #1e3a5f', borderRadius: 4, padding: '2px 7px', display: 'inline-block' }}>Open Portal →</div>
                  </a>
                ))}
              </div>

              <div style={{ marginTop: 12, background: '#1a1000', border: '1px solid #7c2d12', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: '#fb923c', lineHeight: 1.6 }}>
                <strong>Round 2+ disputes (MOV, escalation, legal threat):</strong> Switch to Certified Mail. Online submissions don't create the paper trail needed for a lawsuit or CFPB complaint.
              </div>
            </>
          ) : (
            <>
              {/* Mail steps */}
              <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
                {[
                  { step: '1', icon: '⬇', title: 'Download and print each letter', body: 'Download via the button on each letter row. Print on plain white paper — each letter is pre-addressed to the correct bureau.' },
                  { step: '2', icon: '✍️', title: 'Sign in blue or black ink', body: 'Sign the blank signature line by hand. Blue ink is preferred — it proves the document is an original, not a copy.' },
                  { step: '3', icon: '📎', title: 'Attach proof of identity', body: 'Include copies (NOT originals) of: a government photo ID and one proof of address (utility bill, bank statement, or lease).' },
                  { step: '4', icon: '📬', title: 'Send via USPS Certified Mail — Return Receipt', body: 'At the post office select "Certified Mail — Return Receipt Requested." You receive a green card when the bureau signs for it. This starts the 30-day legal clock and is your evidence in any lawsuit.', highlight: true },
                  { step: '5', icon: '📅', title: 'Bureau has 30 days to respond', body: 'FCRA §611(a)(1) requires a completed reinvestigation within 30 days of receipt (45 days with new information submitted).' },
                  { step: '6', icon: '📩', title: 'Bureaus respond by mail', body: 'Update status in this dashboard — "Deleted" if removed, "Verified" if they uphold it. A Verified result automatically queues the next-level letter.' },
                  { step: '7', icon: '🏛️', title: 'No response? File a CFPB complaint', body: 'At consumerfinance.gov/complaint — bureaus must respond within 15 days. Attach your certified mail receipt as proof.' },
                ].map(({ step, icon, title, body, highlight }) => (
                  <div key={step} style={{ display: 'flex', gap: 10, padding: '9px 12px', borderRadius: 8, background: highlight ? '#061830' : '#050810', border: `1px solid ${highlight ? '#1e3a5f' : '#0d1525'}` }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: highlight ? '#1e3a5f' : '#0d1525', color: highlight ? '#7dd3fc' : '#374151', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{step}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: highlight ? '#e2e8f0' : '#94a3b8', marginBottom: 2 }}>{icon} {title}</div>
                      <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.6 }}>{body}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mailing addresses */}
              <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Bureau Mailing Addresses</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {bureauPortals.map(({ bureau, color, mail }) => (
                  <div key={bureau} style={{ background: '#050810', border: '1px solid #0d1525', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 4 }}>{bureau}</div>
                    <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{bureau === 'Experian' ? `Experian\n${mail}` : bureau === 'Equifax' ? `Equifax Information Services LLC\n${mail}` : `TransUnion LLC\n${mail}`}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, background: '#0a1810', border: '1px solid #14532d', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: '#4ade80', lineHeight: 1.6 }}>
                <strong>Keep everything.</strong> Retain all certified mail receipts and green return cards — these are your legal evidence for any FCPB complaint or federal lawsuit under 28 U.S.C. §1331.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Campaign Tab ─────────────────────────────────────────────────────────────
const LETTER_PRINT_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; background: #f0f0f0; }
  #nav { position: fixed; top: 0; left: 0; right: 0; background: #1a1a2e; color: #fff; padding: 10px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-family: Arial, sans-serif; font-size: 13px; z-index: 9999; box-shadow: 0 2px 8px rgba(0,0,0,0.4); }
  #nav-title { font-weight: 700; color: #a78bfa; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  #nav-counter { color: #64748b; font-size: 11px; white-space: nowrap; }
  .nav-btn { border: none; border-radius: 6px; padding: 7px 16px; cursor: pointer; font-weight: 700; font-size: 12px; }
  .btn-print { background: #7c3aed; color: #fff; }
  .btn-next  { background: #065f46; color: #6ee7b7; }
  .btn-done  { background: #1e3a5f; color: #7dd3fc; cursor: default; }
  .page { width: 8.5in; min-height: 11in; margin: 72px auto 32px; padding: 1in 1.25in; background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,0.18); }
  .letter-body { line-height: 1.6; }
  .letter-body h1 { font-size: 14pt; font-weight: bold; margin: 0 0 16pt; text-transform: uppercase; letter-spacing: 0.05em; }
  .letter-body h2 { font-size: 13pt; font-weight: bold; margin: 14pt 0 8pt; }
  .letter-body h3 { font-size: 12pt; font-weight: bold; margin: 12pt 0 6pt; }
  .letter-body p { margin: 0 0 10pt; }
  .letter-body strong { font-weight: bold; }
  .letter-body em { font-style: italic; }
  .letter-body hr { border: none; border-top: 1px solid #000; margin: 14pt 0; }
  .letter-body ul, .letter-body ol { margin: 8pt 0 8pt 24pt; }
  .letter-body li { margin-bottom: 4pt; }
  .letter-body table { width: 100%; border-collapse: collapse; margin: 10pt 0; font-size: 10pt; }
  .letter-body th, .letter-body td { border: 1px solid #555; padding: 4pt 8pt; text-align: left; }
  .letter-body th { font-weight: bold; background: #eee; }
  @media print {
    #nav { display: none !important; }
    body { background: #fff; }
    .page { margin: 0; padding: 1in 1.25in; width: 100%; box-shadow: none; }
  }
`

// Single-letter print (used by individual download buttons)
function printLetterAsPDF(sections: Array<{ html: string; title: string }>) {
  if (sections.length === 1) {
    printLettersSeparate(sections)
    return
  }
  // Legacy combined path (kept for single-letter calls that pass 1 section)
  printLettersSeparate(sections)
}

// Separate-PDF navigator — one letter per print, single popup window
function printLettersSeparate(sections: Array<{ html: string; title: string }>) {
  if (sections.length === 0) return
  const win = window.open('', '_blank', 'width=960,height=1100')
  if (!win) { alert('Allow popups for this page to open the letter viewer.'); return }

  const total = sections.length
  let idx = 0

  function render() {
    const { html, title } = sections[idx]
    const isLast = idx === total - 1
    const nextBtn = isLast
      ? `<span class="nav-btn btn-done">✓ All ${total} letters done</span>`
      : `<button class="nav-btn btn-next" onclick="window.__next()">Next letter (${idx + 2}/${total}) →</button>`

    win!.document.body.innerHTML = `
      <div id="nav">
        <span id="nav-title">${title}</span>
        <span id="nav-counter">${idx + 1} of ${total}</span>
        <button class="nav-btn btn-print" onclick="window.print()">🖨️ Save as PDF</button>
        ${nextBtn}
      </div>
      <div class="page"><div class="letter-body">${html}</div></div>
    `
    win!.document.title = title
  }

  ;(win as any).__next = () => { if (idx < total - 1) { idx++; render() } }

  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${LETTER_PRINT_STYLES}</style></head><body></body></html>`)
  win.document.close()
  win.onload = render
  // document.close() fires onload synchronously in most browsers; call directly too
  setTimeout(render, 80)
}

function deadlineInfo(sentIso: string | undefined): { daysLeft: number; label: string; color: string; overdue: boolean } | null {
  if (!sentIso) return null
  const sent = new Date(sentIso)
  const deadline = new Date(sent.getTime() + 30 * 24 * 60 * 60 * 1000)
  const now = new Date()
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysLeft > 30) return null
  const overdue = daysLeft < 0
  const color = overdue ? '#f87171' : daysLeft <= 5 ? '#fb923c' : daysLeft <= 10 ? '#facc15' : '#4ade80'
  const label = overdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`
  return { daysLeft, label, color, overdue }
}

function CampaignTab({ items, letters, bureauStatuses, yourInfo, adminPassword, automating, autoProgress, downloadedKeys, sentDates, onStatusChange, onRunAutomation, onRegenerate, onMarkDownloaded }: {
  items: DisputeItem[]
  letters: LettersStore
  bureauStatuses: BureauStatusMap
  yourInfo: PersonalInfo
  adminPassword: string
  automating: boolean
  autoProgress: AutoProgress | null
  downloadedKeys: string[]
  sentDates: SentDates
  onStatusChange: (itemId: string, bureau: string, status: string) => void
  onRunAutomation: () => void
  onRegenerate: (item: DisputeItem, bureau: string) => void
  onMarkDownloaded: (keys: string[]) => void
}) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const downloaded = new Set(downloadedKeys)

  const totalLetters = Object.values(letters).reduce((a, b) => a + Object.keys(b).length, 0)
  const readyCount = items.filter((item) =>
    item.bureaus.every((b) => letters[item.id]?.[b])
  ).length

  function letterHtml(gl: GeneratedLetter, item: DisputeItem, bureau: string) {
    return renderLetterMarkdown(gl.text)
  }

  function letterTitle(item: DisputeItem, bureau: string, gl: GeneratedLetter) {
    return `${bureau} — ${item.creditor}${item.accountLast4 ? ` ...${item.accountLast4}` : ''} — ${gl.letterLabel}`
  }

  function downloadOne(item: DisputeItem, bureau: string) {
    const gl = letters[item.id]?.[bureau]
    if (!gl) return
    printLettersSeparate([{ html: letterHtml(gl, item, bureau), title: letterTitle(item, bureau, gl) }])
    onMarkDownloaded([`${item.id}-${bureau}`])
  }

  function saveLetterAsWord(item: DisputeItem, bureau: string) {
    const gl = letters[item.id]?.[bureau]
    if (!gl) return
    const title = letterTitle(item, bureau, gl)
    const filename = title.replace(/[^\w\s\-]/g, '').replace(/\s+/g, '_') + '.doc'
    // Strip dark-mode inline styles from the rendered HTML so Word gets clean black text
    const cleanHtml = renderLetterMarkdown(gl.text).replace(/\sstyle="[^"]*"/g, '')
    const doc = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'><title>${title}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; color: #000; margin: 1in 1.25in; line-height: 1.6; }
  h2 { font-size: 13pt; font-weight: bold; margin: 14pt 0 8pt; }
  h3, h4 { font-size: 12pt; font-weight: bold; margin: 12pt 0 6pt; }
  p { margin: 0 0 10pt; }
  ul, ol { margin: 8pt 0 8pt 24pt; }
  li { margin-bottom: 4pt; }
  strong { font-weight: bold; }
  em { font-style: italic; }
  code { font-family: monospace; }
  hr { border: none; border-top: 1px solid #000; margin: 14pt 0; }
  table { width: 100%; border-collapse: collapse; font-size: 10pt; }
  th, td { border: 1px solid #555; padding: 4pt 8pt; text-align: left; }
  th { font-weight: bold; background: #eee; }
</style>
</head>
<body>${cleanHtml}</body>
</html>`
    const blob = new Blob([doc], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onMarkDownloaded([`${item.id}-${bureau}`])
  }

  function downloadAll() {
    const sections: Array<{ html: string; title: string }> = []
    items.forEach((item) => {
      item.bureaus.forEach((bureau) => {
        const gl = letters[item.id]?.[bureau]
        if (gl) sections.push({ html: letterHtml(gl, item, bureau), title: letterTitle(item, bureau, gl) })
      })
    })
    if (sections.length === 0) return
    printLettersSeparate(sections)
    const allKeys = items.flatMap((item) =>
      item.bureaus.filter((b) => letters[item.id]?.[b]).map((b) => `${item.id}-${b}`)
    )
    onMarkDownloaded(allKeys)
  }

  function copyLetter(itemId: string, bureau: string) {
    const t = letters[itemId]?.[bureau]?.text
    if (t) {
      navigator.clipboard.writeText(stripMarkdown(t))
      const k = `${itemId}-${bureau}`
      setCopiedKey(k)
      setTimeout(() => setCopiedKey(null), 2000)
    }
  }

  // ── Automation in progress ──────────────────────────────────────────────
  if (automating || (autoProgress && !autoProgress.done)) {
    const pct = autoProgress ? Math.round((autoProgress.current / autoProgress.total) * 100) : 0
    return (
      <div style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Spinner size={20} color="#a78bfa" />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Generating Letters...</div>
            <div style={{ color: '#475569', fontSize: 13, marginTop: 2 }}>Running your dispute campaign. This takes a few minutes — sit back.</div>
          </div>
        </div>
        <div style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569', marginBottom: 8 }}>
            <span>{autoProgress?.current || 0} of {autoProgress?.total || 0} letters</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: 8, background: '#0a0d14', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 4, width: `${pct}%`, background: 'linear-gradient(90deg,#4f46e5,#7c3aed)', transition: 'width 0.4s ease' }} />
          </div>
        </div>
        <div style={{ background: '#050810', border: '1px solid #1e2a3a', borderRadius: 8, padding: '10px 14px', maxHeight: 280, overflowY: 'auto' }}>
          {(autoProgress?.log || []).map((entry, i) => (
            <div key={i} style={{ fontSize: 12, lineHeight: 1.9, color: entry.ok ? '#4ade80' : '#f87171', fontFamily: 'monospace' }}>
              {entry.ok ? '✓' : '✗'} {entry.msg}
            </div>
          ))}
          {automating && <div style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}><Spinner size={10} color="#475569" /> Processing...</div>}
        </div>
      </div>
    )
  }

  // ── No letters yet ──────────────────────────────────────────────────────
  if (totalLetters === 0) {
    return (
      <div style={{ maxWidth: 560 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>Campaign</h2>
        <p style={{ color: '#475569', fontSize: 13, margin: '0 0 16px' }}>AI will analyze every dispute item, choose the best letter type for each bureau, and write all letters automatically.</p>
        <ProcessGuide bureauStatuses={bureauStatuses} letters={letters} items={items} />
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#374151', border: '1px dashed #1e2a3a', borderRadius: 12 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📸</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>No dispute items yet</div>
            <div style={{ fontSize: 13 }}>Scan a credit report first — AI will auto-generate everything after import.</div>
          </div>
        ) : (
          <div>
            <div style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>{items.length} dispute items · {items.reduce((a, i) => a + i.bureaus.length, 0)} bureau letters to generate</div>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #0a0d14', fontSize: 12 }}>
                  <span style={{ flex: 1, color: '#94a3b8' }}>{item.creditor}{item.accountLast4 ? ` ...${item.accountLast4}` : ''}</span>
                  <span style={{ color: '#475569' }}>{item.type}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {item.bureaus.map((b) => <span key={b} style={{ fontSize: 10, fontWeight: 700, color: BUREAU_COLORS[b] }}>{BUREAU_SHORT[b]}</span>)}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={onRunAutomation} style={{ width: '100%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 20px', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              ⚡ Generate All Letters
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Letters ready ───────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>Campaign Complete</h2>
          <div style={{ color: '#475569', fontSize: 13 }}>
            {totalLetters} letters ready · {readyCount} of {items.length} items fully covered
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={downloadAll} style={{ background: 'linear-gradient(135deg,#065f46,#047857)', color: '#6ee7b7', border: '1px solid #065f46', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            🖨️ Print / Save All as PDF
          </button>
          <button onClick={onRunAutomation} style={{ background: '#0d1017', border: '1px solid #1e2a3a', color: '#64748b', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            ↺ Regenerate All
          </button>
        </div>
      </div>
      <ProcessGuide bureauStatuses={bureauStatuses} letters={letters} items={items} />

      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((item) => {
          const itemLetters = letters[item.id] || {}
          const coverCount = Object.keys(itemLetters).length
          const allDone = item.bureaus.every((b) => itemLetters[b])
          const dlCount = item.bureaus.filter((b) => downloaded.has(`${item.id}-${b}`)).length

          return (
            <div key={item.id} style={{ background: '#0d1017', border: `1px solid ${allDone ? '#14532d' : '#1e2a3a'}`, borderRadius: 12, overflow: 'hidden' }}>
              {/* Item header */}
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #0a0d14' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{item.creditor}</span>
                  {item.accountLast4 && <span style={{ color: '#475569', fontSize: 13, marginLeft: 6 }}>...{item.accountLast4}</span>}
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#64748b', background: '#111827', border: '1px solid #1f2937', borderRadius: 4, padding: '1px 6px' }}>{item.type}</span>
                </div>
                {dlCount > 0 && dlCount === coverCount && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', background: '#052e16', border: '1px solid #14532d', borderRadius: 4, padding: '1px 7px', marginRight: 4 }}>⬇ All Downloaded</span>
                )}
                {allDone
                  ? <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', background: '#052e16', border: '1px solid #14532d', borderRadius: 4, padding: '2px 8px' }}>✓ {coverCount} letters ready</span>
                  : <span style={{ fontSize: 11, color: '#fb923c' }}>{coverCount}/{item.bureaus.length} generated</span>
                }
              </div>

              {/* Bureau letter rows */}
              {item.bureaus.map((bureau) => {
                const gl = itemLetters[bureau]
                const expandKey = `${item.id}-${bureau}`
                const isExpanded = expandedKey === expandKey
                const isCopied = copiedKey === expandKey
                const isDownloaded = downloaded.has(expandKey)
                const bStatus = bureauStatuses[item.id]?.[bureau] || 'Not Sent'
                const dl = deadlineInfo(sentDates[item.id]?.[bureau])

                return (
                  <div key={bureau} style={{ borderBottom: '1px solid #070a10' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: BUREAU_COLORS[bureau], width: 70, flexShrink: 0 }}>{bureau}</span>

                      {gl ? (
                        <>
                          <span style={{ fontSize: 12, color: '#7dd3fc', flex: 1 }}>{gl.letterIcon} {gl.letterLabel.split('—')[0].trim()}</span>
                          {isDownloaded && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: '#4ade80', background: '#052e16', border: '1px solid #14532d', borderRadius: 4, padding: '1px 6px', whiteSpace: 'nowrap' }}>✓ Downloaded</span>
                          )}
                          {dl && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: dl.color, background: dl.overdue ? '#1a0505' : '#07100a', border: `1px solid ${dl.color}44`, borderRadius: 4, padding: '1px 6px', whiteSpace: 'nowrap' }}>
                              ⏱ {dl.label}
                            </span>
                          )}
                          <Chip label={bStatus} scheme={bStatus} />
                          <button onClick={() => setExpandedKey(isExpanded ? null : expandKey)} style={{ background: 'transparent', border: '1px solid #1e2a3a', color: '#64748b', borderRadius: 5, padding: '3px 8px', fontSize: 10, cursor: 'pointer' }}>
                            {isExpanded ? 'Hide' : 'View'}
                          </button>
                          <button onClick={() => downloadOne(item, bureau)} style={{ background: isDownloaded ? '#052e16' : '#021a10', color: isDownloaded ? '#4ade80' : '#6ee7b7', border: `1px solid ${isDownloaded ? '#14532d' : '#064e30'}`, borderRadius: 5, padding: '3px 10px', fontSize: 10, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }} title={`Save as PDF: ${letterTitle(item, bureau, gl)}`}>
                            🖨️ PDF
                          </button>
                          <button onClick={() => saveLetterAsWord(item, bureau)} style={{ background: '#0a1a30', color: '#93c5fd', border: '1px solid #1e3a5f', borderRadius: 5, padding: '3px 10px', fontSize: 10, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }} title={`Save as Word: ${letterTitle(item, bureau, gl)}`}>
                            📄 Word
                          </button>
                          <button onClick={() => copyLetter(item.id, bureau)} style={{ background: isCopied ? '#052e16' : '#0f1a2e', color: isCopied ? '#4ade80' : '#60a5fa', border: `1px solid ${isCopied ? '#14532d' : '#1e3a5f'}`, borderRadius: 5, padding: '3px 8px', fontSize: 10, cursor: 'pointer', fontWeight: 600 }}>
                            {isCopied ? '✓' : '📋'}
                          </button>
                          {bStatus !== 'Sent' && bStatus !== 'Deleted' && (
                            <button onClick={() => onStatusChange(item.id, bureau, 'Sent')} style={{ background: '#0d1829', color: '#60a5fa', border: '1px solid #1e3a5f', borderRadius: 5, padding: '3px 8px', fontSize: 10, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                              Mark Sent
                            </button>
                          )}
                          <button onClick={() => onRegenerate(item, bureau)} style={{ background: 'transparent', color: '#374151', border: '1px solid #1e2a3a', borderRadius: 5, padding: '3px 6px', fontSize: 10, cursor: 'pointer' }} title="Regenerate">↺</button>
                        </>
                      ) : (
                        <>
                          <span style={{ flex: 1, fontSize: 12, color: '#374151' }}>Not yet generated</span>
                          <button onClick={() => onRegenerate(item, bureau)} style={{ background: '#1a1040', color: '#a78bfa', border: '1px solid #4c1d95', borderRadius: 5, padding: '3px 10px', fontSize: 10, cursor: 'pointer', fontWeight: 600 }}>Generate</button>
                        </>
                      )}
                    </div>

                    {/* Letter reasoning (collapsed) */}
                    {gl && !isExpanded && gl.reason && (
                      <div style={{ paddingLeft: 86, paddingBottom: 8, paddingRight: 16, fontSize: 11, color: '#374151', lineHeight: 1.5 }}>{gl.reason}</div>
                    )}

                    {/* Expanded letter */}
                    {isExpanded && gl && (
                      <div style={{ padding: '0 16px 14px', animation: 'cr-fade 0.15s ease' }}>
                        {/* Status bar */}
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10, paddingLeft: 70 }}>
                          {RESPONSE_STATUSES.map((s) => (
                            <button key={s} onClick={() => onStatusChange(item.id, bureau, s)} style={{
                              padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 600, cursor: 'pointer',
                              border: `1px solid ${bStatus === s ? (RESPONSE_COLORS[s]?.border || '#4f46e5') : '#1e2a3a'}`,
                              background: bStatus === s ? (RESPONSE_COLORS[s]?.bg || '#1a1a3e') : 'transparent',
                              color: bStatus === s ? (RESPONSE_COLORS[s]?.color || '#a78bfa') : '#374151',
                            }}>{s}</button>
                          ))}
                        </div>
                        <div
                          style={{ background: '#050810', border: '1px solid #1a2040', borderRadius: 8, padding: '14px 16px', maxHeight: 460, overflowY: 'auto' }}
                          dangerouslySetInnerHTML={{ __html: renderLetterMarkdown(gl.text) }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Response Analyzer Tab ─────────────────────────────────────────────────────
function ResponseAnalyzerTab({ items, bureauStatuses, letters, adminPassword, onStatusChange, onRegenerate }: {
  items: DisputeItem[]
  bureauStatuses: BureauStatusMap
  letters: LettersStore
  adminPassword: string
  onStatusChange: (itemId: string, bureau: string, status: string) => void
  onRegenerate: (item: DisputeItem, bureau: string) => void
}) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [selectedBureau, setSelectedBureau] = useState<string>('')
  const [responseText, setResponseText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<{ verdict: string; action: string; reasoning: string; nextLetterType: string; urgent: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedItem = items.find((i) => i.id === selectedItemId)

  async function analyze() {
    if (!selectedItem || !selectedBureau || !responseText.trim()) return
    setAnalyzing(true); setAnalysis(null); setError(null)
    const gl = letters[selectedItem.id]?.[selectedBureau]
    const prompt = `You are a senior consumer protection attorney specializing in FCRA litigation. Analyze this bureau response letter and tell the consumer exactly what happened and what to do next.

DISPUTE CONTEXT:
Creditor: ${selectedItem.creditor}${selectedItem.accountLast4 ? ` ...${selectedItem.accountLast4}` : ''}
Dispute type: ${selectedItem.type}
Bureau: ${selectedBureau}
Letter sent: ${gl ? gl.letterLabel : 'Unknown'}
Current status: ${bureauStatuses[selectedItem.id]?.[selectedBureau] || 'Sent'}

BUREAU RESPONSE LETTER:
${responseText.trim()}

Respond with ONLY this JSON (no markdown, no explanation outside JSON):
{
  "verdict": "deleted|verified|partial|soft-delete|no-response|invalid",
  "urgent": true/false,
  "reasoning": "1-2 sentence plain-English explanation of what the bureau actually did",
  "action": "clear 1-sentence instruction for what the consumer must do right now",
  "nextLetterType": "none|mov|redispute|escalation|fdcpa|cfpb-complaint"
}

Verdicts:
- deleted: item removed from credit report
- verified: bureau claims investigation confirmed accuracy
- partial: some items removed, some remain
- soft-delete: letter says deleted but item still shows on report (common tactic)
- no-response: generic acknowledgment with no actual investigation result
- invalid: response is procedurally defective (missing required info, wrong format)

nextLetterType guidance: none if deleted | mov if verified once | redispute if verified before | escalation if verified 2+ times or SOL argument available | fdcpa if debt collector involved | cfpb-complaint if bureau violated 30-day deadline`

    try {
      const raw = await callAI(adminPassword, prompt)
      const parsed = JSON.parse(raw.replace(/```json\s*|```\s*/g, '').trim())
      setAnalysis(parsed)
      // Auto-update status based on verdict
      if (parsed.verdict === 'deleted') onStatusChange(selectedItem.id, selectedBureau, 'Deleted')
      else if (parsed.verdict === 'verified' || parsed.verdict === 'soft-delete') onStatusChange(selectedItem.id, selectedBureau, 'Verified')
    } catch (err) {
      setError('Could not parse AI response. Try again.')
    }
    setAnalyzing(false)
  }

  const VERDICT_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
    deleted:      { bg: '#052e16', color: '#4ade80', border: '#14532d', label: '✓ Deleted' },
    verified:     { bg: '#2d1a00', color: '#fb923c', border: '#7c2d12', label: '⚠ Verified' },
    partial:      { bg: '#0d1829', color: '#60a5fa', border: '#1e3a5f', label: '◑ Partial' },
    'soft-delete':{ bg: '#2d0a0a', color: '#f87171', border: '#7f1d1d', label: '⚡ Soft Delete' },
    'no-response':{ bg: '#1e1a40', color: '#a78bfa', border: '#4c1d95', label: '— No Result' },
    invalid:      { bg: '#1a1000', color: '#fb923c', border: '#7c2d12', label: '✗ Invalid' },
  }

  const NEXT_LABELS: Record<string, string> = {
    none: 'No further action needed',
    mov: 'Send Method of Verification demand',
    redispute: 'Send re-dispute attacking new angle',
    escalation: 'Send legal escalation / notice to sue',
    fdcpa: 'Send FDCPA debt validation demand',
    'cfpb-complaint': 'File CFPB complaint immediately',
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>Response Analyzer</h2>
      <p style={{ color: '#475569', fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>
        Paste the bureau's response letter. AI reads it, tells you exactly what happened, and queues your next move automatically.
      </p>

      {/* Item + bureau selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 10, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>DISPUTE ITEM</div>
          <select value={selectedItemId || ''} onChange={(e) => { setSelectedItemId(e.target.value); setSelectedBureau(''); setAnalysis(null) }} style={IS}>
            <option value=''>Select item...</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.creditor}{item.accountLast4 ? ` ...${item.accountLast4}` : ''} — {item.type}</option>
            ))}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>BUREAU</div>
          <select value={selectedBureau} onChange={(e) => { setSelectedBureau(e.target.value); setAnalysis(null) }} style={IS} disabled={!selectedItem}>
            <option value=''>Select...</option>
            {(selectedItem?.bureaus || []).map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Response paste area */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>PASTE BUREAU RESPONSE LETTER</div>
        <textarea
          value={responseText}
          onChange={(e) => { setResponseText(e.target.value); setAnalysis(null) }}
          placeholder="Paste the full text of the bureau's response here — the letter or email they sent you after your dispute..."
          rows={8}
          style={{ ...IS, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
        />
      </div>

      <button
        onClick={analyze}
        disabled={analyzing || !selectedItem || !selectedBureau || !responseText.trim()}
        style={{ width: '100%', background: analyzing || !selectedItem || !selectedBureau || !responseText.trim() ? '#1a1040' : 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 9, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: analyzing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}
      >
        {analyzing ? <><Spinner /> Analyzing response...</> : '⚡ Analyze Response'}
      </button>

      {error && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</div>}

      {analysis && (
        <div style={{ animation: 'cr-fade 0.2s ease' }}>
          {/* Verdict banner */}
          {(() => {
            const vs = VERDICT_STYLES[analysis.verdict] || VERDICT_STYLES.invalid
            return (
              <div style={{ background: vs.bg, border: `1px solid ${vs.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: vs.color }}>{vs.label}</span>
                  {analysis.urgent && <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171', background: '#2d0a0a', border: '1px solid #7f1d1d', borderRadius: 4, padding: '1px 7px' }}>URGENT</span>}
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65 }}>{analysis.reasoning}</div>
              </div>
            )
          })()}

          {/* Action card */}
          <div style={{ background: '#061830', border: '1px solid #1e3a5f', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Your Next Move</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#7dd3fc', marginBottom: 8 }}>{analysis.action}</div>
            {analysis.nextLetterType !== 'none' && analysis.nextLetterType !== 'cfpb-complaint' && selectedItem && (
              <button
                onClick={() => { onStatusChange(selectedItem.id, selectedBureau, analysis.verdict === 'verified' ? 'Verified' : 'In Dispute'); onRegenerate(selectedItem, selectedBureau) }}
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                ⚡ Generate {NEXT_LABELS[analysis.nextLetterType]} →
              </button>
            )}
            {analysis.nextLetterType === 'cfpb-complaint' && (
              <div style={{ fontSize: 12, color: '#fb923c', marginTop: 4 }}>
                File at <strong>consumerfinance.gov/complaint</strong> — attach your certified mail receipt as proof of the 30-day violation.
              </div>
            )}
            {analysis.nextLetterType === 'none' && (
              <div style={{ fontSize: 12, color: '#4ade80' }}>This dispute is resolved. Mark it Deleted in the Campaign tab.</div>
            )}
          </div>

          {/* What this verdict means */}
          {analysis.verdict === 'soft-delete' && (
            <div style={{ background: '#1a0505', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#f87171', lineHeight: 1.65 }}>
              <strong>Soft delete warning:</strong> The bureau said "deleted" but the item may still appear on your actual report. Pull your updated credit report in 5-7 days and verify. If it still shows, this is a FCRA §611(a)(5)(B) violation — you have grounds to escalate immediately.
            </div>
          )}
        </div>
      )}

      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#374151', border: '1px dashed #1e2a3a', borderRadius: 12 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📩</div>
          <div style={{ fontWeight: 600 }}>No dispute items yet</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Scan a credit report first to create dispute items.</div>
        </div>
      )}
    </div>
  )
}

// ── Tools Tab (SOL Calculator + CFPB Generator) ───────────────────────────────
const SOL_BY_STATE: Record<string, number> = {
  AL:3,AK:3,AZ:6,AR:5,CA:4,CO:6,CT:6,DE:3,FL:5,GA:6,
  HI:6,ID:5,IL:5,IN:6,IA:5,KS:5,KY:5,LA:3,ME:6,MD:3,
  MA:6,MI:6,MN:6,MS:3,MO:5,MT:5,NE:5,NV:6,NH:3,NJ:6,
  NM:6,NY:6,NC:3,ND:6,OH:6,OK:5,OR:6,PA:4,RI:10,SC:3,
  SD:6,TN:6,TX:4,UT:6,VT:6,VA:5,WA:6,WV:10,WI:6,WY:8,DC:3
}

function ToolsTab({ items, yourInfo, adminPassword, bureauStatuses }: {
  items: DisputeItem[]
  yourInfo: PersonalInfo
  adminPassword: string
  bureauStatuses: BureauStatusMap
}) {
  const [activeTool, setActiveTool] = useState<'sol' | 'cfpb'>('sol')

  // SOL state
  const [solState, setSolState] = useState(yourInfo.state || 'TX')
  const [solDebtDate, setSolDebtDate] = useState('')
  const [solDebtType, setSolDebtType] = useState('Credit Card')

  // CFPB state
  const [cfpbItemId, setCfpbItemId] = useState('')
  const [cfpbBureau, setCfpbBureau] = useState('')
  const [cfpbViolation, setCfpbViolation] = useState('no-response')
  const [cfpbGenerating, setCfpbGenerating] = useState(false)
  const [cfpbText, setCfpbText] = useState<string | null>(null)
  const [cfpbCopied, setCfpbCopied] = useState(false)

  const cfpbItem = items.find((i) => i.id === cfpbItemId)

  const solYears = SOL_BY_STATE[solState] || 6
  const solExpiry = solDebtDate ? new Date(new Date(solDebtDate).setFullYear(new Date(solDebtDate).getFullYear() + solYears)) : null
  const solExpired = solExpiry ? solExpiry < new Date() : false
  const solDaysLeft = solExpiry ? Math.ceil((solExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

  async function generateCFPB() {
    if (!cfpbItem || !cfpbBureau) return
    setCfpbGenerating(true); setCfpbText(null)
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const sentStatus = bureauStatuses[cfpbItem.id]?.[cfpbBureau] || 'Sent'
    const violationText = {
      'no-response': `failed to respond within the 30-day period mandated by FCRA §611(a)(1) after receiving my dispute letter`,
      'verified-no-method': `claimed to "verify" the disputed item without providing the method of verification as required by FCRA §611(a)(7)`,
      'soft-delete': `sent a deletion confirmation but the item continues to appear on my credit report in violation of FCRA §611(a)(5)(B)`,
      'refused-to-investigate': `refused to conduct a reasonable reinvestigation in violation of FCRA §611(a)(1)`,
    }[cfpbViolation] || 'violated my FCRA rights'
    const prompt = `Consumer protection attorney. Draft a CFPB complaint for submission at consumerfinance.gov/complaint. Write only the complaint body text — no headers, no JSON.

Consumer: ${yourInfo.name || '[Your Name]'}, ${yourInfo.address || '[Address]'}, ${yourInfo.city || '[City]'}, ${yourInfo.state || '[State]'} ${yourInfo.zip || '[ZIP]'}
Date: ${today}
Bureau: ${cfpbBureau}
Creditor/Account: ${cfpbItem.creditor}${cfpbItem.accountLast4 ? ` account ending in ${cfpbItem.accountLast4}` : ''}
Dispute type: ${cfpbItem.type}
Violation: The bureau ${violationText}.
Current status: ${sentStatus}

Requirements: (1) First-person voice (2) Cite FCRA §611 and specific subsection violated (3) State specific dates if known (4) Request investigation and enforcement action (5) Reference CFPB's authority under Dodd-Frank §1031 (6) 200-300 words, factual and professional. Complete text only.`

    try {
      const result = await callAI(adminPassword, prompt)
      setCfpbText(result.trim())
    } catch (err) {
      setCfpbText('Error generating complaint. Try again.')
    }
    setCfpbGenerating(false)
  }

  function copyCFPB() {
    if (cfpbText) {
      navigator.clipboard.writeText(cfpbText)
      setCfpbCopied(true)
      setTimeout(() => setCfpbCopied(false), 2000)
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>Legal Tools</h2>
      <p style={{ color: '#475569', fontSize: 13, margin: '0 0 16px' }}>Statute of limitations calculator and CFPB complaint generator.</p>

      {/* Tool tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([['sol', '⚖️ SOL Calculator'], ['cfpb', '🏛️ CFPB Complaint']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTool(key)} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: `1px solid ${activeTool === key ? '#4c1d95' : '#1e2a3a'}`, background: activeTool === key ? '#1a1040' : 'transparent', color: activeTool === key ? '#a78bfa' : '#475569' }}>
            {label}
          </button>
        ))}
      </div>

      {activeTool === 'sol' && (
        <div>
          <p style={{ color: '#475569', fontSize: 13, margin: '0 0 16px', lineHeight: 1.6 }}>
            Once the statute of limitations expires on a debt, collectors cannot legally sue you to collect it. Use this to determine if a collection account is time-barred — a powerful defense in your dispute letters.
          </p>
          <div style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 12, padding: 16, marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
              <label style={{ fontSize: 12 }}>
                <div style={{ color: '#64748b', marginBottom: 4, fontWeight: 600 }}>YOUR STATE</div>
                <select value={solState} onChange={(e) => setSolState(e.target.value)} style={IS}>
                  {Object.keys(SOL_BY_STATE).sort().map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label style={{ fontSize: 12 }}>
                <div style={{ color: '#64748b', marginBottom: 4, fontWeight: 600 }}>DEBT TYPE</div>
                <select value={solDebtType} onChange={(e) => setSolDebtType(e.target.value)} style={IS}>
                  {['Credit Card', 'Medical Debt', 'Personal Loan', 'Auto Loan', 'Student Loan', 'Utility Bill', 'Other'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label style={{ fontSize: 12 }}>
                <div style={{ color: '#64748b', marginBottom: 4, fontWeight: 600 }}>DATE OF LAST PAYMENT</div>
                <input type='date' value={solDebtDate} onChange={(e) => setSolDebtDate(e.target.value)} style={IS} />
              </label>
            </div>

            {solDebtDate ? (
              <div style={{ background: solExpired ? '#052e16' : '#0d1829', border: `1px solid ${solExpired ? '#14532d' : '#1e3a5f'}`, borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: solExpired ? '#4ade80' : '#60a5fa', marginBottom: 4 }}>
                  {solExpired ? '✓ Statute of Limitations EXPIRED' : `${solDaysLeft} days until SOL expires`}
                </div>
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.65 }}>
                  {`${solState} SOL for this debt type: ${solYears} years. `}
                  {solExpiry && `Expiry date: ${solExpiry.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`}
                </div>
                {solExpired && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#4ade80', lineHeight: 1.65 }}>
                    <strong>This debt is time-barred.</strong> Add this to your dispute: "This debt is beyond the {solYears}-year statute of limitations in {solState} and cannot be legally enforced. Continued reporting of a time-barred, unenforceable debt is a violation of FDCPA §807(2)(A) and FCRA §623(a)(1)(A)."
                  </div>
                )}
                {!solExpired && solDaysLeft !== null && solDaysLeft <= 90 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#fb923c' }}>
                    SOL expires soon — act before it resets if you make a payment or acknowledge the debt in writing.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#374151', textAlign: 'center', padding: '12px 0' }}>Enter the date of your last payment to calculate.</div>
            )}
          </div>
          <div style={{ background: '#070d1a', border: '1px solid #1e3a5f', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
            <strong style={{ color: '#7dd3fc' }}>Important:</strong> The SOL clock restarts if you make a payment or acknowledge the debt in writing. Never pay or confirm a time-barred debt without getting a signed deletion agreement first.
          </div>
        </div>
      )}

      {activeTool === 'cfpb' && (
        <div>
          <p style={{ color: '#475569', fontSize: 13, margin: '0 0 16px', lineHeight: 1.6 }}>
            Bureaus must respond to CFPB complaints within 15 days. Filing a complaint often triggers action when letters alone have not worked.
          </p>
          <div style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 12, padding: 16, marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 10, marginBottom: 10 }}>
              <label style={{ fontSize: 12 }}>
                <div style={{ color: '#64748b', marginBottom: 4, fontWeight: 600 }}>DISPUTE ITEM</div>
                <select value={cfpbItemId} onChange={(e) => { setCfpbItemId(e.target.value); setCfpbBureau(''); setCfpbText(null) }} style={IS}>
                  <option value=''>Select item...</option>
                  {items.map((item) => <option key={item.id} value={item.id}>{item.creditor}{item.accountLast4 ? ` ...${item.accountLast4}` : ''}</option>)}
                </select>
              </label>
              <label style={{ fontSize: 12 }}>
                <div style={{ color: '#64748b', marginBottom: 4, fontWeight: 600 }}>BUREAU</div>
                <select value={cfpbBureau} onChange={(e) => { setCfpbBureau(e.target.value); setCfpbText(null) }} style={IS} disabled={!cfpbItem}>
                  <option value=''>Select...</option>
                  {(cfpbItem?.bureaus || []).map((b) => <option key={b}>{b}</option>)}
                </select>
              </label>
            </div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
              <div style={{ color: '#64748b', marginBottom: 4, fontWeight: 600 }}>VIOLATION TYPE</div>
              <select value={cfpbViolation} onChange={(e) => { setCfpbViolation(e.target.value); setCfpbText(null) }} style={IS}>
                <option value='no-response'>Bureau did not respond within 30 days</option>
                <option value='verified-no-method'>Bureau "verified" but won't provide method of verification</option>
                <option value='soft-delete'>Bureau said deleted but item still appears on report</option>
                <option value='refused-to-investigate'>Bureau refused to investigate my dispute</option>
              </select>
            </label>
            <button onClick={generateCFPB} disabled={cfpbGenerating || !cfpbItem || !cfpbBureau} style={{ width: '100%', background: cfpbGenerating || !cfpbItem || !cfpbBureau ? '#1a1040' : 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: cfpbGenerating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {cfpbGenerating ? <><Spinner /> Generating...</> : '🏛️ Generate CFPB Complaint'}
            </button>
          </div>

          {cfpbText && (
            <div style={{ animation: 'cr-fade 0.2s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Complaint Text — paste into consumerfinance.gov/complaint</div>
                <button onClick={copyCFPB} style={{ background: cfpbCopied ? '#052e16' : '#0f1a2e', color: cfpbCopied ? '#4ade80' : '#60a5fa', border: `1px solid ${cfpbCopied ? '#14532d' : '#1e3a5f'}`, borderRadius: 6, padding: '4px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  {cfpbCopied ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
              <div style={{ background: '#050810', border: '1px solid #1a2040', borderRadius: 8, padding: '14px 16px', fontSize: 12, color: '#94a3b8', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {cfpbText}
              </div>
              <a href='https://www.consumerfinance.gov/complaint/' target='_blank' rel='noopener noreferrer' style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, background: '#061830', border: '1px solid #1e3a5f', color: '#7dd3fc', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                🏛️ Open CFPB Complaint Portal →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CreditRepairPage() {
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [items, setItems] = useState<DisputeItem[]>([])
  const [bureauStatuses, setBureauStatuses] = useState<BureauStatusMap>({})
  const [yourInfo, setYourInfo] = useState<PersonalInfo>({ name: '', address: '', city: '', state: '', zip: '', dob: '', ssn: '' })
  const [importedScores, setImportedScores] = useState<Record<string, number>>({})
  const [letters, setLetters] = useState<LettersStore>({})
  const [downloadedKeys, setDownloadedKeys] = useState<string[]>([])
  const [sentDates, setSentDates] = useState<SentDates>({})
  const [automating, setAutomating] = useState(false)
  const [autoProgress, setAutoProgress] = useState<AutoProgress | null>(null)
  const [activeTab, setActiveTab] = useState<'scan' | 'items' | 'simulator' | 'settings' | 'campaign' | 'analyze' | 'tools'>('scan')
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newCreditor, setNewCreditor] = useState('')
  const [newAccount, setNewAccount] = useState('')
  const [newType, setNewType] = useState(DISPUTE_TYPES[0])
  const [newBureaus, setNewBureaus] = useState<string[]>([])
  const [newReason, setNewReason] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('creditiq_data_v1')
      if (saved) {
        const d = JSON.parse(saved)
        if (d.items) setItems(d.items)
        if (d.bureauStatuses) setBureauStatuses(d.bureauStatuses)
        if (d.yourInfo) setYourInfo(d.yourInfo)
        if (d.importedScores) setImportedScores(d.importedScores)
        if (d.letters) setLetters(d.letters)
        if (d.downloadedKeys) setDownloadedKeys(d.downloadedKeys)
        if (d.sentDates) setSentDates(d.sentDates)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!authorized) return
    try { localStorage.setItem('creditiq_data_v1', JSON.stringify({ items, bureauStatuses, yourInfo, importedScores, letters, downloadedKeys, sentDates })) } catch { /* ignore */ }
  }, [items, bureauStatuses, yourInfo, importedScores, letters, downloadedKeys, sentDates, authorized])

  async function authenticate() {
    setAuthLoading(true); setAuthError('')
    try {
      const res = await fetch('/api/admin/credit-ai', { headers: { 'x-admin-password': password } })
      if (res.status === 401) { setAuthError('Incorrect password.'); return }
      if (res.ok) setAuthorized(true)
    } catch { setAuthError('Could not connect. Try again.') }
    setAuthLoading(false)
  }

  function addItem() {
    if (!newCreditor.trim() || newBureaus.length === 0) return
    const id = `item-${Date.now()}`
    setItems((p) => [...p, { id, creditor: newCreditor.trim(), accountLast4: newAccount.trim(), type: newType, bureaus: newBureaus, reason: newReason.trim() }])
    setBureauStatuses((p) => ({ ...p, [id]: {} }))
    setNewCreditor(''); setNewAccount(''); setNewType(DISPUTE_TYPES[0]); setNewBureaus([]); setNewReason('')
    setShowAdd(false)
  }

  function deleteItem(id: string) {
    setItems((p) => p.filter((i) => i.id !== id))
    setBureauStatuses((p) => { const n = { ...p }; delete n[id]; return n })
    if (selectedItemId === id) setSelectedItemId(null)
  }

  function updateBureauStatus(itemId: string, bureau: string, status: string) {
    setBureauStatuses((p) => ({ ...p, [itemId]: { ...(p[itemId] || {}), [bureau]: status } }))
    if (status === 'Sent') {
      setSentDates((p) => ({ ...p, [itemId]: { ...(p[itemId] || {}), [bureau]: new Date().toISOString() } }))
    }
  }

  function importFromScan({ personalInfo, negativeItems, creditScores }: { personalInfo: Partial<PersonalInfo>; negativeItems: Array<Omit<DisputeItem, 'id'>>; creditScores?: Record<string, number> }) {
    let resolvedInfo = yourInfo
    if (personalInfo?.name) {
      resolvedInfo = { ...yourInfo, ...personalInfo }
      setYourInfo(resolvedInfo)
    }
    if (creditScores && Object.values(creditScores).some((v) => v > 0)) setImportedScores(creditScores)
    const newItems: DisputeItem[] = negativeItems.map((item, i) => ({ ...item, id: `scan-${Date.now()}-${i}` }))
    setItems((p) => [...p, ...newItems])
    setBureauStatuses((p) => { const n = { ...p }; newItems.forEach((item) => { n[item.id] = {} }); return n })
    setActiveTab('campaign')
    // Auto-launch campaign
    runAutomation(newItems, resolvedInfo)
  }

  async function runAutomation(targetItems?: DisputeItem[], targetInfo?: PersonalInfo) {
    const workItems = targetItems ?? items
    const workInfo = targetInfo ?? yourInfo
    if (workItems.length === 0) return
    const pairs: Array<{ item: DisputeItem; bureau: string }> = []
    workItems.forEach((item) => item.bureaus.forEach((b) => pairs.push({ item, bureau: b })))
    setAutomating(true)
    setAutoProgress({ current: 0, total: pairs.length, log: [], done: false })

    const newLetters: LettersStore = {}
    let current = 0

    for (const { item, bureau } of pairs) {
      const label = `${item.creditor}${item.accountLast4 ? ` ...${item.accountLast4}` : ''} → ${bureau}`
      // Wait between calls to stay within rate limits
      if (current > 0) {
        await new Promise((r) => setTimeout(r, 13000))
      }
      let attempt = 0
      let success = false
      while (attempt < 3 && !success) {
        try {
          const gl = await aiGenerateLetter(item, bureau, workInfo, password, 'Not Sent')
          if (!newLetters[item.id]) newLetters[item.id] = {}
          newLetters[item.id][bureau] = gl
          current++
          success = true
          setAutoProgress((p) => p ? { ...p, current, log: [...p.log, { msg: `${label}: ${gl.letterLabel}`, ok: true }] } : p)
        } catch (err) {
          attempt++
          const msg = err instanceof Error ? err.message : 'error'
          const isRateLimit = msg.toLowerCase().includes('rate limit') || msg.includes('10,000')
          if (isRateLimit && attempt < 3) {
            setAutoProgress((p) => p ? { ...p, log: [...p.log, { msg: `Rate limit — waiting 60s before retry ${attempt}/2...`, ok: false }] } : p)
            await new Promise((r) => setTimeout(r, 62000))
          } else {
            current++
            setAutoProgress((p) => p ? { ...p, current, log: [...p.log, { msg: `${label}: failed — ${msg}`, ok: false }] } : p)
            break
          }
        }
      }
    }

    // Persist letters and mark statuses Ready to Send
    setLetters((prev) => {
      const merged = { ...prev }
      Object.entries(newLetters).forEach(([id, bureauMap]) => {
        merged[id] = { ...(merged[id] || {}), ...bureauMap }
      })
      return merged
    })
    setBureauStatuses((prev) => {
      const updated = { ...prev }
      Object.entries(newLetters).forEach(([id, bureauMap]) => {
        Object.keys(bureauMap).forEach((b) => {
          updated[id] = { ...(updated[id] || {}), [b]: 'Ready to Send' }
        })
      })
      return updated
    })
    setAutoProgress((p) => p ? { ...p, done: true } : p)
    setAutomating(false)
  }

  function markDownloaded(keys: string[]) {
    setDownloadedKeys((p) => Array.from(new Set([...p, ...keys])))
  }

  function regenerateLetter(item: DisputeItem, bureau: string) {
    const burStatus = bureauStatuses[item.id]?.[bureau] || 'Not Sent'
    aiGenerateLetter(item, bureau, yourInfo, password, burStatus).then((gl) => {
      setLetters((p) => ({ ...p, [item.id]: { ...(p[item.id] || {}), [bureau]: gl } }))
      setBureauStatuses((p) => ({ ...p, [item.id]: { ...(p[item.id] || {}), [bureau]: 'Ready to Send' } }))
    }).catch((err) => alert('Error: ' + (err instanceof Error ? err.message : 'unknown')))
  }

  const selectedItem = items.find((i) => i.id === selectedItemId)

  // ── Auth gate ───────────────────────────────────────────────────────────
  if (!authorized) {
    return (
      <main style={{ minHeight: '100vh', background: '#07090f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
        <style>{`@keyframes cr-spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: '100%', maxWidth: 400, background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 16, padding: 32 }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>⚡</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 2px', color: '#e2e8f0' }}>DisputeDesk</h1>
          <div style={{ display: 'inline-block', background: '#1a1040', color: '#a78bfa', border: '1px solid #4c1d95', borderRadius: 4, fontSize: 10, fontWeight: 800, padding: '2px 8px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>ELITE</div>
          <p style={{ color: '#475569', fontSize: 13, margin: '0 0 24px', lineHeight: 1.6 }}>AI-powered credit dispute letter generator and score simulator.</p>
          <input type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && authenticate()}
            placeholder="Admin password" style={{ ...IS, marginBottom: 12 }} />
          {authError && <div style={{ color: '#f87171', fontSize: 12, marginBottom: 10 }}>{authError}</div>}
          <button onClick={authenticate} disabled={authLoading || !password} style={{
            width: '100%', background: authLoading ? '#1a2040' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: '#fff', border: 'none', borderRadius: 9, padding: 12, fontSize: 14, fontWeight: 700,
            cursor: authLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: !password ? 0.5 : 1,
          }}>
            {authLoading ? <><Spinner /> Verifying...</> : 'Sign In'}
          </button>
        </div>
      </main>
    )
  }

  // ── Nav items ────────────────────────────────────────────────────────────
  const totalLetterCount = Object.values(letters).reduce((a, b) => a + Object.keys(b).length, 0)
  type NavItem = { key: typeof activeTab; icon: string; label: string; badge?: number | null }
  const navItems: NavItem[] = [
    { key: 'scan', icon: '📸', label: 'Scan Report' },
    { key: 'items', icon: '⚔️', label: 'Dispute Items', badge: items.length || null },
    { key: 'campaign', icon: '🚀', label: 'Campaign', badge: totalLetterCount || null },
    { key: 'analyze', icon: '📩', label: 'Response Analyzer' },
    { key: 'tools', icon: '⚖️', label: 'Legal Tools' },
    { key: 'simulator', icon: '📊', label: 'Score Simulator' },
    { key: 'settings', icon: '⚙️', label: 'Settings' },
  ]

  return (
    <div style={{ minHeight: '100vh', paddingTop: 72, background: '#07090f', color: '#e2e8f0', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", display: 'flex' }}>
      <style>{`@keyframes cr-spin { to { transform: rotate(360deg); } } @keyframes cr-fade { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Sidebar */}
      <div style={{ width: 220, flexShrink: 0, background: '#080c16', borderRight: '1px solid #0f1628', display: 'flex', flexDirection: 'column', position: 'sticky', top: 72, height: 'calc(100vh - 72px)', overflowY: 'auto' }}>
        {/* Logo */}
        <div style={{ padding: '22px 18px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em' }}>DisputeDesk</span>
          </div>
          <div style={{ display: 'inline-block', background: '#1a1040', color: '#a78bfa', border: '1px solid #4c1d95', borderRadius: 4, fontSize: 9, fontWeight: 800, padding: '2px 7px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>ELITE</div>
          <div style={{ fontSize: 11, color: '#374151', fontWeight: 500 }}>{items.length} item{items.length !== 1 ? 's' : ''} tracked</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '4px 10px' }}>
          {navItems.map((nav) => (
            <button key={nav.key} onClick={() => setActiveTab(nav.key)} style={{
              display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 10px', marginBottom: 2,
              borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
              background: activeTab === nav.key ? '#0f1a2e' : 'transparent',
              color: activeTab === nav.key ? '#a78bfa' : '#4b5563',
              fontWeight: activeTab === nav.key ? 700 : 500,
              fontSize: 13,
            }}>
              <span>{nav.icon}</span>
              <span style={{ flex: 1 }}>{nav.label}</span>
              {nav.badge ? <span style={{ background: '#7c3aed', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 800 }}>{nav.badge}</span> : null}
            </button>
          ))}

          {/* Add Manually quick-action under Dispute Items */}
          <button onClick={() => { setActiveTab('items'); setShowAdd(true) }} style={{
            display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 10px 7px 28px', marginBottom: 2,
            borderRadius: 8, border: '1px dashed #1e2a3a', cursor: 'pointer', textAlign: 'left',
            background: 'transparent', color: '#374151', fontSize: 12, fontWeight: 500,
          }}>
            + Add Manually
          </button>
        </nav>

        {/* Bureau Portals */}
        <div style={{ padding: '12px 10px 10px', borderTop: '1px solid #0f1628' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 4 }}>Bureau Portals</div>
          {[
            { label: 'Experian', color: '#3b82f6', url: 'https://www.experian.com/disputes/main.html' },
            { label: 'Equifax', color: '#ef4444', url: 'https://www.equifax.com/personal/credit-report-services/credit-dispute/' },
            { label: 'TransUnion', color: '#10b981', url: 'https://dispute.transunion.com' },
          ].map(({ label, color, url }) => (
            <a key={label} href={url} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 10px', marginBottom: 4, borderRadius: 7,
              border: `1px solid ${color}22`, background: `${color}08`,
              textDecoration: 'none', color,
              fontSize: 12, fontWeight: 700,
            }}>
              <span>{label}</span>
              <span style={{ fontSize: 10, opacity: 0.6 }}>↗</span>
            </a>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '32px 32px 60px', overflowY: 'auto', minWidth: 0 }}>

        {activeTab === 'scan' && (
          <div style={{ maxWidth: 620, animation: 'cr-fade 0.2s ease' }}>
            <ScanTab onImport={importFromScan} adminPassword={password} />
          </div>
        )}

        {activeTab === 'items' && (
          <div style={{ animation: 'cr-fade 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Dispute Items <span style={{ color: '#374151', fontWeight: 400, fontSize: 14 }}>({items.length})</span></h2>
              <button onClick={() => setShowAdd((p) => !p)} style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Add Item</button>
            </div>

            {showAdd && (
              <div style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 12, padding: 16, marginBottom: 16, animation: 'cr-fade 0.15s ease' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr', gap: 10, marginBottom: 10 }}>
                  <label style={{ fontSize: 12 }}>
                    <div style={{ color: '#64748b', marginBottom: 4 }}>Creditor / Collection Agency *</div>
                    <input value={newCreditor} onChange={(e) => setNewCreditor(e.target.value)} placeholder="e.g. Capital One, LVNV Funding" style={IS} />
                  </label>
                  <label style={{ fontSize: 12 }}>
                    <div style={{ color: '#64748b', marginBottom: 4 }}>Last 4</div>
                    <input value={newAccount} onChange={(e) => setNewAccount(e.target.value.slice(0, 4))} placeholder="1234" maxLength={4} style={IS} />
                  </label>
                  <label style={{ fontSize: 12 }}>
                    <div style={{ color: '#64748b', marginBottom: 4 }}>Dispute Type *</div>
                    <select value={newType} onChange={(e) => setNewType(e.target.value)} style={IS}>
                      {DISPUTE_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Bureaus Reporting This *</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {BUREAUS.map((b) => (
                      <button key={b} onClick={() => setNewBureaus((p) => p.includes(b) ? p.filter((x) => x !== b) : [...p, b])} style={{ padding: '6px 18px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1px solid ${newBureaus.includes(b) ? BUREAU_COLORS[b] + '88' : '#1e2a3a'}`, background: newBureaus.includes(b) ? BUREAU_COLORS[b] + '15' : 'transparent', color: newBureaus.includes(b) ? BUREAU_COLORS[b] : '#475569' }}>{b}</button>
                    ))}
                  </div>
                </div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                  <div style={{ color: '#64748b', marginBottom: 4 }}>Notes</div>
                  <input value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="e.g. paid in 2022, not mine, medical bill" style={IS} />
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addItem} disabled={!newCreditor.trim() || newBureaus.length === 0} style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: (!newCreditor.trim() || newBureaus.length === 0) ? 0.5 : 1 }}>Add Item</button>
                  <button onClick={() => { setShowAdd(false); setNewCreditor(''); setNewAccount(''); setNewBureaus([]); setNewReason('') }} style={{ background: 'transparent', color: '#64748b', border: '1px solid #1e2a3a', borderRadius: 8, padding: '9px 16px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}

            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#374151' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚔️</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>No dispute items yet</div>
                <div style={{ fontSize: 13 }}>Scan a credit report or add items manually</div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gap: 8, marginBottom: selectedItem ? 20 : 0 }}>
                  {items.map((item) => {
                    const statuses = bureauStatuses[item.id] || {}
                    const isSelected = selectedItemId === item.id
                    return (
                      <div key={item.id} onClick={() => setSelectedItemId(isSelected ? null : item.id)} style={{ background: isSelected ? '#0f1a2e' : '#0d1017', border: `1px solid ${isSelected ? '#4f46e5' : '#1e2a3a'}`, borderRadius: 10, padding: '13px 16px', cursor: 'pointer', animation: 'cr-fade 0.2s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{item.creditor}</span>
                            {item.accountLast4 && <span style={{ color: '#475569', fontSize: 13, marginLeft: 6 }}>...{item.accountLast4}</span>}
                            <span style={{ marginLeft: 10, fontSize: 11, color: '#64748b', background: '#111827', border: '1px solid #1f2937', borderRadius: 4, padding: '1px 7px' }}>{item.type}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            {item.bureaus.map((b) => (
                              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: BUREAU_COLORS[b] }}>{BUREAU_SHORT[b]}</span>
                                <Chip label={statuses[b] || 'Not Sent'} scheme={statuses[b] || 'Not Sent'} />
                              </div>
                            ))}
                            <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id) }} style={{ background: 'transparent', color: '#374151', border: '1px solid #1f2937', borderRadius: 5, padding: '2px 8px', fontSize: 10, cursor: 'pointer', marginLeft: 4 }}>✕</button>
                          </div>
                        </div>
                        {item.reason && <div style={{ marginTop: 5, fontSize: 11, color: '#374151' }}>{item.reason}</div>}
                        {isSelected && <div style={{ marginTop: 6, fontSize: 11, color: '#4f46e5', fontWeight: 600 }}>Letter generator open below</div>}
                      </div>
                    )
                  })}
                </div>

                {selectedItem && (
                  <div style={{ background: '#080e1a', border: '1px solid #1e2a3a', borderRadius: 14, padding: 20, animation: 'cr-fade 0.2s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>Letter Generator</div>
                        <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{selectedItem.creditor}{selectedItem.accountLast4 ? ` ...${selectedItem.accountLast4}` : ''}</div>
                      </div>
                      <button onClick={() => setSelectedItemId(null)} style={{ background: 'transparent', color: '#475569', border: '1px solid #1e2a3a', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12 }}>Close</button>
                    </div>
                    <LetterPanel item={selectedItem} yourInfo={yourInfo} bureauStatuses={bureauStatuses[selectedItem.id] || {}} onStatusChange={updateBureauStatus} adminPassword={password} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'campaign' && (
          <div style={{ animation: 'cr-fade 0.2s ease' }}>
            <CampaignTab
              items={items}
              letters={letters}
              bureauStatuses={bureauStatuses}
              yourInfo={yourInfo}
              adminPassword={password}
              automating={automating}
              autoProgress={autoProgress}
              downloadedKeys={downloadedKeys}
              sentDates={sentDates}
              onStatusChange={updateBureauStatus}
              onRunAutomation={() => runAutomation()}
              onRegenerate={regenerateLetter}
              onMarkDownloaded={markDownloaded}
            />
          </div>
        )}

        {activeTab === 'analyze' && (
          <div style={{ animation: 'cr-fade 0.2s ease' }}>
            <ResponseAnalyzerTab
              items={items}
              bureauStatuses={bureauStatuses}
              letters={letters}
              adminPassword={password}
              onStatusChange={updateBureauStatus}
              onRegenerate={regenerateLetter}
            />
          </div>
        )}

        {activeTab === 'tools' && (
          <div style={{ animation: 'cr-fade 0.2s ease' }}>
            <ToolsTab items={items} yourInfo={yourInfo} adminPassword={password} bureauStatuses={bureauStatuses} />
          </div>
        )}

        {activeTab === 'simulator' && (
          <div style={{ animation: 'cr-fade 0.2s ease' }}>
            <ScoreSimulator items={items} importedScores={importedScores} />
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsTab yourInfo={yourInfo} setYourInfo={setYourInfo} />
        )}
      </div>
    </div>
  )
}
