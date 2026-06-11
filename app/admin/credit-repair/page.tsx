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

// ── callAI — routes through server proxy ─────────────────────────────────────
async function callAI(adminPassword: string, prompt: string, fileBase64?: string | null, fileType?: string | null): Promise<string> {
  const res = await fetch('/api/admin/credit-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
    body: JSON.stringify({ prompt, imageBase64: fileBase64 ?? null, imageType: fileType ?? null }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'AI request failed')
  return data.text
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

  // Find the outermost JSON object
  const start = s.indexOf('{')
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

  const addLog = (msg: string, type = 'info') => setLog((p) => [...p, { msg, type }])

  async function processFile(file: File) {
    if (!file) return
    const isPDF = file.type === 'application/pdf'
    const isImage = file.type.startsWith('image/')
    if (!isPDF && !isImage) {
      setError('Supported formats: PDF (.pdf) or image (JPG, PNG, HEIC, WEBP). Export your credit report as PDF for best results.')
      return
    }
    setError(null); setLog([]); setScanning(true)
    setFileInfo({ name: file.name, size: (file.size / 1024).toFixed(0) + ' KB', type: isPDF ? 'PDF' : 'Image' })
    if (isImage) setPreview(URL.createObjectURL(file))
    else setPreview(null)

    addLog(`Reading ${isPDF ? 'PDF' : 'image'} (${(file.size / 1024).toFixed(0)} KB)...`)

    let base64: string
    let sendType: string

    if (isImage) {
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
    if (isPDF) addLog('PDF — reading full text layer...')

    const prompt = `Extract credit report data. Return ONLY this JSON, no markdown:
{"personalInfo":{"name":"","address":"","city":"","state":"","zip":"","dob":"","phone":""},"creditScores":{"Experian":0,"Equifax":0,"TransUnion":0},"allAccounts":[{"creditor":"","accountLast4":"","balance":"","paymentStatus":"","bureaus":[],"isNegative":false,"type":"Late Payment|Collection Account|Charge-Off|Repossession|Foreclosure|Hard Inquiry|Invalid Debt|Bankruptcy|Identity Theft / Not Mine|Duplicate Account|Incorrect Balance|Incorrect Status","reason":""}],"hardInquiries":[{"creditor":"","date":"","bureau":""}],"publicRecords":[{"type":"","date":"","amount":"","bureau":""}],"summary":{"totalAccounts":0,"negativeAccounts":0,"hardInquiries":0,"totalDebt":""}}
Rules: isNegative=true only for derogatory/collection/late/chargeoff items. bureaus=only bureaus showing that negative item. Omit empty arrays.`

    try {
      addLog('Analyzing accounts and payment history...')
      const raw = await callAI(adminPassword, prompt, base64, sendType)
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
      if (msg.includes('rate limit') || msg.includes('tokens per minute')) {
        setError('Rate limit hit — the file is too large to process right now. Wait 60 seconds and try again, or upload a smaller/cropped screenshot instead of the full report.')
      } else if (msg.includes('No JSON') || msg.includes('JSON')) {
        setError('Could not read the report. Try: (1) PDF from AnnualCreditReport.com, (2) crop the screenshot to just the accounts section, (3) try a higher-contrast screenshot.')
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#080f1e', border: '1px solid #1e3a5f', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>📄</div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', marginBottom: 4 }}>
            PDF <span style={{ background: '#0d2a0d', color: '#4ade80', border: '1px solid #14532d', borderRadius: 4, fontSize: 10, fontWeight: 800, padding: '1px 7px', marginLeft: 5 }}>Recommended</span>
          </div>
          <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
            Download from AnnualCreditReport.com, Experian, Equifax, or TransUnion. Full text layer — highest accuracy.
          </div>
        </div>
        <div style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>🖼</div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', marginBottom: 4 }}>Screenshot / Photo</div>
          <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
            JPG, PNG, HEIC, WEBP. Full-screen showing all columns. Upload one page at a time.
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
        <input ref={fileRef} type="file" accept="image/*,.pdf,application/pdf" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }} />

        {scanning ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <Spinner size={32} color="#7c3aed" />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#a78bfa' }}>Analyzing with AI vision...</div>
            <div style={{ fontSize: 12, color: '#475569' }}>{fileInfo?.name}</div>
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
            <div style={{ color: '#374151', fontSize: 13 }}>PDF or image · click to browse</div>
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

// ── Process Guide ─────────────────────────────────────────────────────────────
function ProcessGuide({ bureauStatuses, letters, items }: { bureauStatuses: BureauStatusMap; letters: LettersStore; items: DisputeItem[] }) {
  const [open, setOpen] = useState(false)
  const sentCount = items.reduce((a, item) =>
    a + item.bureaus.filter((b) => ['Sent', 'Verified', 'Deleted', 'Escalated'].includes(bureauStatuses[item.id]?.[b] || '')).length, 0)
  const totalLetters = Object.values(letters).reduce((a, b) => a + Object.keys(b).length, 0)
  const readyCount = Object.values(letters).reduce((a, b) =>
    a + Object.keys(b).length, 0) - sentCount

  return (
    <div style={{ background: '#080e1c', border: '1px solid #1e3a5f', borderRadius: 12, marginBottom: 20, overflow: 'hidden' }}>
      <button onClick={() => setOpen((p) => !p)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 16 }}>📋</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#7dd3fc' }}>How the Dispute Process Works</div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 1 }}>
            {totalLetters > 0
              ? `${readyCount} letter${readyCount !== 1 ? 's' : ''} ready to mail · ${sentCount} sent`
              : 'Step-by-step mailing guide'}
          </div>
        </div>
        <span style={{ color: '#374151', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 16px 18px', borderTop: '1px solid #0f1628' }}>
          {/* Steps */}
          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
            {[
              {
                step: '1', icon: '🖨️', title: 'Print each letter',
                body: 'Print on plain white paper. Each letter is addressed to a specific bureau — do not mix them up. Print one copy per letter.',
              },
              {
                step: '2', icon: '✍️', title: 'Sign in blue or black ink',
                body: 'Find the "Signature:" line at the bottom of each letter and sign by hand. Blue ink is preferred — it proves the original was not photocopied.',
              },
              {
                step: '3', icon: '📎', title: 'Attach proof of identity',
                body: 'Include copies (NOT originals) of: (1) a government-issued photo ID (driver\'s license or passport) and (2) one proof of address (utility bill, bank statement, or lease). Bureaus will reject disputes without ID.',
              },
              {
                step: '4', icon: '📬', title: 'Mail via USPS Certified Mail with Return Receipt',
                body: 'At the post office, send each envelope via "Certified Mail — Return Receipt Requested." You\'ll get a green card back when the bureau signs for it. This is your legal proof of delivery and starts the 30-day clock.',
                highlight: true,
              },
              {
                step: '5', icon: '📅', title: 'Bureaus have 30 days to respond',
                body: 'Under FCRA §611(a)(1), each bureau must complete its reinvestigation within 30 days of receiving your letter (45 days if you submit additional info). They must send you written results.',
              },
              {
                step: '6', icon: '📩', title: 'Watch your mail for responses',
                body: 'Bureaus respond by mail. When you receive a result, update the status in this dashboard: "Deleted" if the item was removed, "Verified" if they claim it\'s accurate (triggers the next letter type automatically).',
              },
              {
                step: '7', icon: '⚡', title: 'Items verified? Escalate here',
                body: 'If a bureau "verifies" an item, mark it Verified in the dashboard and click Regenerate — DisputeDesk will automatically write the next-level letter (Method of Verification demand, re-dispute, or legal threat).',
              },
              {
                step: '8', icon: '🏛️', title: 'Still no action? File a CFPB complaint',
                body: 'If a bureau ignores your letter or violates the 30-day deadline, file a complaint at consumerfinance.gov/complaint — bureaus are legally required to respond to CFPB complaints within 15 days. This often triggers immediate action.',
              },
            ].map(({ step, icon, title, body, highlight }) => (
              <div key={step} style={{ display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 8, background: highlight ? '#061830' : '#050810', border: `1px solid ${highlight ? '#1e3a5f' : '#0d1525'}` }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: highlight ? '#1e3a5f' : '#0d1525', color: highlight ? '#7dd3fc' : '#374151', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{step}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: highlight ? '#e2e8f0' : '#94a3b8', marginBottom: 3 }}>{icon} {title}</div>
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.65 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Mailing addresses */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Bureau Mailing Addresses</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { bureau: 'Experian', address: 'Experian\nP.O. Box 4500\nAllen, TX 75013', color: '#3b82f6' },
                { bureau: 'Equifax', address: 'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374', color: '#ef4444' },
                { bureau: 'TransUnion', address: 'TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016', color: '#10b981' },
              ].map(({ bureau, address, color }) => (
                <div key={bureau} style={{ background: '#050810', border: '1px solid #0d1525', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 5 }}>{bureau}</div>
                  <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{address}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 12, background: '#0a1810', border: '1px solid #14532d', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#4ade80', lineHeight: 1.6 }}>
            <strong>Important:</strong> Keep your certified mail receipts and the green return cards. These are your legal evidence if you ever need to escalate to a lawsuit or CFPB complaint.
          </div>
        </div>
      )}
    </div>
  )
}

// ── Campaign Tab ─────────────────────────────────────────────────────────────
function triggerDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function CampaignTab({ items, letters, bureauStatuses, yourInfo, adminPassword, automating, autoProgress, downloadedKeys, onStatusChange, onRunAutomation, onRegenerate, onMarkDownloaded }: {
  items: DisputeItem[]
  letters: LettersStore
  bureauStatuses: BureauStatusMap
  yourInfo: PersonalInfo
  adminPassword: string
  automating: boolean
  autoProgress: AutoProgress | null
  downloadedKeys: string[]
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

  function letterPlainText(gl: GeneratedLetter, item: DisputeItem, bureau: string) {
    const divider = '='.repeat(64)
    return `${divider}\nBUREAU: ${bureau}\nCREDITOR: ${item.creditor}${item.accountLast4 ? ` ...${item.accountLast4}` : ''}\nLETTER TYPE: ${gl.letterLabel}\nGENERATED: ${new Date(gl.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n${divider}\n\n${stripMarkdown(gl.text)}`
  }

  function downloadOne(item: DisputeItem, bureau: string) {
    const gl = letters[item.id]?.[bureau]
    if (!gl) return
    const safe = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-')
    const filename = `${safe(bureau)}_${safe(item.creditor)}${item.accountLast4 ? `_${item.accountLast4}` : ''}_${gl.letterKey}.txt`
    triggerDownload(filename, letterPlainText(gl, item, bureau))
    onMarkDownloaded([`${item.id}-${bureau}`])
  }

  function downloadAll() {
    const sections: string[] = []
    items.forEach((item) => {
      item.bureaus.forEach((bureau) => {
        const gl = letters[item.id]?.[bureau]
        if (gl) sections.push(letterPlainText(gl, item, bureau))
      })
    })
    if (sections.length === 0) return
    triggerDownload('DisputeDesk_All_Letters.txt', sections.join('\n\n\n'))
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
            ⬇ Download All
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
                          <Chip label={bStatus} scheme={bStatus} />
                          <button onClick={() => setExpandedKey(isExpanded ? null : expandKey)} style={{ background: 'transparent', border: '1px solid #1e2a3a', color: '#64748b', borderRadius: 5, padding: '3px 8px', fontSize: 10, cursor: 'pointer' }}>
                            {isExpanded ? 'Hide' : 'View'}
                          </button>
                          <button onClick={() => downloadOne(item, bureau)} style={{ background: isDownloaded ? '#052e16' : '#021a10', color: isDownloaded ? '#4ade80' : '#6ee7b7', border: `1px solid ${isDownloaded ? '#14532d' : '#064e30'}`, borderRadius: 5, padding: '3px 8px', fontSize: 10, cursor: 'pointer', fontWeight: 600 }} title="Download as .txt">
                            ⬇
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
  const [automating, setAutomating] = useState(false)
  const [autoProgress, setAutoProgress] = useState<AutoProgress | null>(null)
  const [activeTab, setActiveTab] = useState<'scan' | 'items' | 'simulator' | 'settings' | 'campaign'>('scan')
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
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!authorized) return
    try { localStorage.setItem('creditiq_data_v1', JSON.stringify({ items, bureauStatuses, yourInfo, importedScores, letters, downloadedKeys })) } catch { /* ignore */ }
  }, [items, bureauStatuses, yourInfo, importedScores, letters, downloadedKeys, authorized])

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
              onStatusChange={updateBureauStatus}
              onRunAutomation={() => runAutomation()}
              onRegenerate={regenerateLetter}
              onMarkDownloaded={markDownloaded}
            />
          </div>
        )}

        {activeTab === 'simulator' && (
          <div style={{ animation: 'cr-fade 0.2s ease' }}>
            <ScoreSimulator items={items} importedScores={importedScores} />
          </div>
        )}

        {activeTab === 'settings' && (
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
                    <input type={type} value={yourInfo[k] || ''} onChange={(e) => setYourInfo((p) => ({ ...p, [k]: e.target.value }))} placeholder={ph} style={IS} />
                  </label>
                ))}
              </div>
            </div>
            <div style={{ background: '#070d1a', border: '1px solid #1e3a5f', borderRadius: 8, padding: '11px 14px', fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
              All data is stored in your browser only. Nothing is sent to any server except when generating letters via the AI model.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
