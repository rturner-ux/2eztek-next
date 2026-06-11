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
}

// ── Constants ────────────────────────────────────────────────────────────────
const BUREAUS = ['Experian', 'Equifax', 'TransUnion']
const BUREAU_SHORT: Record<string, string> = { Experian: 'EXP', Equifax: 'EQX', TransUnion: 'TRU' }
const BUREAU_COLORS: Record<string, string> = { Experian: '#3b82f6', Equifax: '#ef4444', TransUnion: '#10b981' }

const DISPUTE_TYPES = [
  'Late Payment', 'Collection Account', 'Charge-Off', 'Repossession',
  'Foreclosure', 'Hard Inquiry', 'Invalid Debt', 'Bankruptcy',
  'Identity Theft / Not Mine', 'Duplicate Account', 'Incorrect Balance', 'Incorrect Status',
]

const RESPONSE_STATUSES = ['Not Sent', 'Sent', 'Verified', 'Deleted', 'In Dispute', 'Escalated']
const RESPONSE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  'Not Sent':   { bg: '#111827', color: '#4b5563', border: '#1f2937' },
  'Sent':       { bg: '#0d1829', color: '#60a5fa', border: '#1e3a5f' },
  'Verified':   { bg: '#2d1a00', color: '#fb923c', border: '#7c2d12' },
  'Deleted':    { bg: '#052e16', color: '#4ade80', border: '#14532d' },
  'In Dispute': { bg: '#1e1a40', color: '#a78bfa', border: '#4c1d95' },
  'Escalated':  { bg: '#2d0a0a', color: '#f87171', border: '#7f1d1d' },
}

const LETTER_TYPES = [
  {
    key: 'initial',
    label: 'Round 1 — Initial Dispute',
    icon: '⚡',
    desc: 'Full FCRA §611 dispute with Metro 2 compliance challenge',
    statutes: [
      { code: 'FCRA §611(a)(1)', cite: '15 U.S.C. §1681i(a)(1)', note: 'Bureau must conduct reasonable reinvestigation within 30 days' },
      { code: 'FCRA §623(a)(1)(A)', cite: '15 U.S.C. §1681s-2(a)(1)(A)', note: 'Furnisher prohibited from reporting info known to be inaccurate' },
      { code: 'FCRA §611(a)(7)', cite: '15 U.S.C. §1681i(a)(7)', note: 'Consumer may request method of verification after reinvestigation' },
      { code: 'Metro 2 Format', cite: 'CDIA Credit Reporting Resource Guide', note: 'Industry standard for data furnishing accuracy & field compliance' },
      { code: 'FCRA §605(a)', cite: '15 U.S.C. §1681c(a)', note: '7-year reporting limit on most derogatory information' },
    ],
  },
  {
    key: 'mov',
    label: 'Method of Verification',
    icon: '🔍',
    desc: 'Force them to prove HOW they verified — most bureaus cannot',
    statutes: [
      { code: 'FCRA §611(a)(7)', cite: '15 U.S.C. §1681i(a)(7)', note: 'Bureau must provide method of verification upon consumer request' },
      { code: 'FCRA §611(a)(2)(B)', cite: '15 U.S.C. §1681i(a)(2)(B)', note: 'Bureau must forward consumer dispute to furnisher with all relevant info' },
      { code: 'Cushman v. Trans Union', cite: '115 F.3d 220 (3d Cir. 1997)', note: 'Mere data matching is not a reasonable reinvestigation' },
      { code: 'Stevenson v. TRW Inc.', cite: '987 F.2d 288 (5th Cir. 1993)', note: 'Rubber-stamp verification without investigation is a violation' },
      { code: 'FCRA §611(c)', cite: '15 U.S.C. §1681i(c)', note: 'Bureau must provide statement of dispute if item remains' },
    ],
  },
  {
    key: 'goodwill',
    label: 'Goodwill Deletion',
    icon: '🤝',
    desc: 'Emotional appeal to creditor to remove as a courtesy',
    statutes: [
      { code: 'FCRA §623(a)(2)', cite: '15 U.S.C. §1681s-2(a)(2)', note: 'Furnisher has duty to correct inaccurate or incomplete information' },
      { code: 'FCRA §623(b)(1)(E)', cite: '15 U.S.C. §1681s-2(b)(1)(E)', note: 'Furnisher may modify, delete, or permanently block disputed information' },
      { code: 'FCRA §611(a)(5)(A)', cite: '15 U.S.C. §1681i(a)(5)(A)', note: 'Bureau must promptly delete info that furnisher cannot verify' },
      { code: 'UCC §1-103', cite: 'Uniform Commercial Code §1-103', note: 'Good faith dealing standard applicable to creditor negotiations' },
    ],
  },
  {
    key: 'p4d',
    label: 'Pay-for-Delete',
    icon: '💰',
    desc: 'Offer payment in exchange for complete deletion',
    statutes: [
      { code: 'FDCPA §807', cite: '15 U.S.C. §1692e', note: 'Debt collector may not use false or misleading representations' },
      { code: 'FDCPA §809(a)', cite: '15 U.S.C. §1692g(a)', note: 'Collector must provide validation notice within 5 days' },
      { code: 'FCRA §623(b)(1)(E)', cite: '15 U.S.C. §1681s-2(b)(1)(E)', note: 'Furnisher may delete information upon settlement' },
      { code: 'FCRA §611(a)(5)(A)', cite: '15 U.S.C. §1681i(a)(5)(A)', note: 'Bureau must delete promptly when furnisher withdraws reporting' },
      { code: 'Accord & Satisfaction', cite: 'Restatement (Second) Contracts §281', note: 'Settlement extinguishes original obligation; deletion is valid consideration' },
    ],
  },
  {
    key: 'fdcpa',
    label: 'FDCPA Debt Validation',
    icon: '🛡️',
    desc: 'Force debt collectors to prove the debt is valid and they own it',
    statutes: [
      { code: 'FDCPA §809(b)', cite: '15 U.S.C. §1692g(b)', note: 'All collection activity must cease until debt is validated' },
      { code: 'FDCPA §807(2)', cite: '15 U.S.C. §1692e(2)', note: 'Collector may not misrepresent character, amount, or legal status of debt' },
      { code: 'FDCPA §808', cite: '15 U.S.C. §1692f', note: 'Unfair or unconscionable collection practices prohibited' },
      { code: 'FDCPA §813', cite: '15 U.S.C. §1692k', note: 'Statutory damages $1,000 per violation + actual damages + attorney fees' },
      { code: 'FCRA §623(a)(7)', cite: '15 U.S.C. §1681s-2(a)(7)', note: 'Collector must notify consumer before furnishing info to bureaus' },
      { code: 'Haddad v. Alexander', cite: '698 F.3d 290 (6th Cir. 2012)', note: 'Validation must enable consumer to verify the debt' },
    ],
  },
  {
    key: 'escalation',
    label: 'Legal Escalation',
    icon: '⚖️',
    desc: 'FCRA §616/617 willful noncompliance — puts them on notice of lawsuit',
    statutes: [
      { code: 'FCRA §616', cite: '15 U.S.C. §1681n', note: 'Willful noncompliance: $100-$1,000 statutory + punitive + attorney fees' },
      { code: 'FCRA §617', cite: '15 U.S.C. §1681o', note: 'Negligent noncompliance: actual damages + attorney fees + costs' },
      { code: 'FCRA §616(a)(3)', cite: '15 U.S.C. §1681n(a)(3)', note: 'Punitive damages available for willful violations' },
      { code: 'Safeco Insurance v. Burr', cite: '551 U.S. 47 (2007)', note: 'Reckless disregard of FCRA obligations = willful violation' },
      { code: 'Saunders v. Branch Banking', cite: '526 F.3d 142 (4th Cir. 2008)', note: 'Continued reporting without investigation is willful' },
      { code: 'CFPB Enforcement', cite: '12 U.S.C. §5481 et seq.', note: 'CFPB may impose civil penalties up to $1M/day for knowing violations' },
    ],
  },
  {
    key: 'redispute',
    label: 'Re-Dispute (New Angle)',
    icon: '🔁',
    desc: 'Attack using Metro 2 field-level accuracy after prior verification',
    statutes: [
      { code: 'FCRA §623(b)', cite: '15 U.S.C. §1681s-2(b)', note: 'Furnisher has independent duty to investigate upon notice from bureau' },
      { code: 'FCRA §623(b)(1)(A)', cite: '15 U.S.C. §1681s-2(b)(1)(A)', note: 'Furnisher must investigate the specific dispute raised' },
      { code: 'FCRA §611(a)(1)', cite: '15 U.S.C. §1681i(a)(1)', note: 'New and material information restarts the reinvestigation obligation' },
      { code: 'Metro 2 DOFD Field', cite: 'CDIA Metro 2 §5.1', note: 'Inaccurate DOFD is a standalone Metro 2 violation requiring deletion' },
      { code: 'Metro 2 Status Code', cite: 'CDIA Metro 2 Appendix A', note: 'Incorrect status code is independently disputable' },
      { code: 'Johnson v. MBNA America Bank', cite: '357 F.3d 426 (4th Cir. 2004)', note: 'Bureau may not simply accept furnisher word — must independently evaluate' },
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
  width: '100%',
  background: '#0d1017',
  border: '1px solid #1e2a3a',
  borderRadius: 7,
  padding: '9px 12px',
  color: '#e2e8f0',
  fontSize: 13,
  fontFamily: 'inherit',
}

// ── callAI ───────────────────────────────────────────────────────────────────
async function callAI(adminPassword: string, prompt: string, imageBase64?: string | null, imageType?: string | null): Promise<string> {
  const res = await fetch('/api/admin/credit-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
    body: JSON.stringify({ prompt, imageBase64: imageBase64 ?? null, imageType: imageType ?? null }),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'AI request failed')
  return data.text
}

// ── Small helpers ─────────────────────────────────────────────────────────────
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

function NavTab({ label, active, onClick, badge }: { label: string; active: boolean; onClick: () => void; badge?: number | null }) {
  return (
    <button onClick={onClick} style={{
      background: active ? '#13172a' : 'transparent',
      color: active ? '#a78bfa' : '#4b5563',
      borderTop: active ? '2px solid #7c3aed' : '2px solid transparent',
      border: 'none', borderBottom: 'none',
      padding: '10px 16px', fontSize: 12, fontWeight: 600,
      cursor: 'pointer', whiteSpace: 'nowrap',
      display: 'flex', alignItems: 'center', gap: 5,
    }}>
      {label}
      {badge ? <span style={{ background: '#7c3aed', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 9, fontWeight: 800 }}>{badge}</span> : null}
    </button>
  )
}

// ── Score Simulator ──────────────────────────────────────────────────────────
function ScoreSimulator({ items }: { items: DisputeItem[] }) {
  const [scores, setScores] = useState<Record<string, string>>({ Experian: '', Equifax: '', TransUnion: '' })
  const [selected, setSelected] = useState<string[]>([])

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
    <div style={{ animation: 'cr-fade 0.2s ease' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>Score Simulator</h2>
      <p style={{ color: '#475569', fontSize: 13, margin: '0 0 20px' }}>Enter current scores, select items to remove, see projected improvement.</p>
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
        <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Select items to remove</div>
        {items.length === 0
          ? <div style={{ color: '#475569', fontSize: 13 }}>No items yet. Add dispute items from the Report tab.</div>
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
                +{Math.round(((SCORE_IMPACT[item.type]?.low || 10) + (SCORE_IMPACT[item.type]?.high || 30)) / 2)} avg
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
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 3, width: `${(p.projected / 850) * 100}%`, background: p.projected >= 750 ? '#4ade80' : p.projected >= 670 ? '#facc15' : '#f87171' }} />
                  </div>
                  {p.gain > 0 && <div style={{ fontSize: 11, color: '#4ade80', marginTop: 6, fontWeight: 600 }}>+{p.gain} pts estimated</div>}
                </>
              ) : <div style={{ color: '#475569', fontSize: 12 }}>Enter score above</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Letter Panel ─────────────────────────────────────────────────────────────
function LetterPanel({ item, yourInfo, bureauStatuses, onStatusChange, adminPassword }: {
  item: DisputeItem
  yourInfo: PersonalInfo
  bureauStatuses: Record<string, string>
  onStatusChange: (itemId: string, bureau: string, status: string) => void
  adminPassword: string
}) {
  const [selectedType, setSelectedType] = useState('initial')
  const [selectedBureau, setSelectedBureau] = useState(item.bureaus[0] || 'Experian')
  const [generating, setGenerating] = useState(false)
  const [letter, setLetter] = useState<string | null>(null)
  const [strategy, setStrategy] = useState<string | null>(null)
  const [loadingStrategy, setLoadingStrategy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [customNote, setCustomNote] = useState('')

  async function getStrategy() {
    setLoadingStrategy(true)
    const burStatus = bureauStatuses[selectedBureau] || 'Not Sent'
    try {
      const result = await callAI(adminPassword, `You are a senior credit repair attorney who worked inside all 3 credit bureaus.

Consumer has:
- Creditor: ${item.creditor}, Type: ${item.type}, Bureau: ${selectedBureau}, Status: ${burStatus}

Give a brutally honest insider strategy in 4 short paragraphs:
1. What ${selectedBureau} does internally with this item type
2. Their most common compliance failures for this type
3. The single highest-leverage move given status "${burStatus}"
4. What to do if they verify again

Be specific, tactical, direct. No fluff.`)
      setStrategy(result)
    } catch (e) {
      setStrategy('Error: ' + (e instanceof Error ? e.message : 'Failed'))
    }
    setLoadingStrategy(false)
  }

  async function generate() {
    if (!yourInfo.name) { alert('Add your personal info in Settings first.'); return }
    setGenerating(true)
    setLetter(null)

    const lt = LETTER_TYPES.find((l) => l.key === selectedType)!
    const burStatus = bureauStatuses[selectedBureau] || 'Not Sent'
    const legalBlock = lt.statutes.map((s) => `- ${s.code} [${s.cite}]: ${s.note}`).join('\n')
    const addr = BUREAU_ADDRESSES[selectedBureau]

    const baseInfo = `CONSUMER: ${yourInfo.name}
Address: ${yourInfo.address}, ${yourInfo.city}, ${yourInfo.state} ${yourInfo.zip}
DOB: ${yourInfo.dob || '[DATE OF BIRTH]'} | SSN Last 4: ${yourInfo.ssn || 'XXXX'}
ITEM: ${item.creditor}, Account ...${item.accountLast4 || '????'}, Type: ${item.type}
Legal basis: ${LAW_REFS[item.type] || 'FCRA §611(a)(1)'}
Notes: ${item.reason || customNote || 'None'}
SEND TO: ${addr}
CITATIONS (must appear verbatim in letter body):
${legalBlock}`

    const prompts: Record<string, string> = {
      initial: `Expert credit repair attorney. Write a complete aggressive FCRA-compliant initial dispute letter. All citations MUST appear in the letter body.

${baseInfo}

Open with RE: line. State specific inaccuracy and FCRA/Metro 2 violations. Cite each statute by full code and USC citation. Demand deletion OR correction within 30 days. Invoke FCRA §623(a)(1)(A) furnisher liability. Request method of verification per FCRA §611(a)(7). State intent to file CFPB complaint if unresolved. Write COMPLETE letter only.`,

      mov: `Expert credit repair attorney. Write a Method of Verification demand. Bureau claimed to verify. All citations MUST appear.

${baseInfo}
Bureau status: ${burStatus}

Reference that bureau previously "verified." Cite FCRA §611(a)(7). Cite Cushman v. Trans Union and Stevenson v. TRW. Demand: (a) exact method used, (b) name/address/phone of furnisher contacted, (c) documents reviewed, (d) dates. State bureau has 15 days or item must be deleted. Complete letter only.`,

      goodwill: `Credit repair specialist. Write a sincere goodwill deletion letter to the original creditor. NOT a legal demand — a human appeal.

CONSUMER: ${yourInfo.name} | CREDITOR: ${item.creditor} ...${item.accountLast4 || '????'} | TYPE: ${item.type}
${customNote ? `SITUATION: ${customNote}` : 'SITUATION: Consumer experienced a financial hardship causing this isolated negative event.'}
CITATIONS: ${legalBlock}

Address goodwill department. Open with genuine appreciation. Describe hardship. Highlight positive history. Reference FCRA §623(b)(1)(E) as their right to delete. Ask for deletion from all bureaus. Humble, professional tone. Complete letter only.`,

      p4d: `Credit negotiation specialist. Write a Pay-for-Delete letter to a collection agency. Payment is CONDITIONAL on written deletion.

CONSUMER: ${yourInfo.name} | COLLECTOR: ${item.creditor} ...${item.accountLast4 || '????'}
${customNote ? `CONTEXT: ${customNote}` : ''}
CITATIONS: ${legalBlock}

Acknowledge balance (do NOT admit liability). Cite FDCPA §807 and FCRA §623(b)(1)(E). Offer settlement (leave amount as [AMOUNT]). Require written deletion agreement signed by authorized representative BEFORE payment. 14-day deadline or offer withdraws. Complete letter only.`,

      fdcpa: `Expert consumer rights attorney. Write a FDCPA debt validation demand. All collection activity must cease until validated.

${baseInfo}

Invoke FDCPA §809(b). Demand: (1) verification of amount, (2) name of original creditor, (3) chain of title, (4) original signed agreement, (5) itemized payment history, (6) proof statute of limitations not expired, (7) collector license number. State all collection including credit reporting must cease. Cite Haddad v. Alexander. Warn $1,000 statutory damages per violation. 30-day deadline. Complete letter only.`,

      escalation: `Senior consumer protection attorney. Write a final legal escalation with explicit lawsuit notice. Write as if from a law firm.

PLAINTIFF: ${yourInfo.name}, ${yourInfo.address}, ${yourInfo.city}, ${yourInfo.state} ${yourInfo.zip}
RESPONDENT: ${selectedBureau}
ITEM: ${item.creditor} ...${item.accountLast4 || '????'}
HISTORY: ${burStatus === 'Verified' ? 'Bureau verified without reasonable investigation' : 'Bureau failed to delete despite multiple disputes'}
${customNote ? `FACTS: ${customNote}` : ''}
CITATIONS (ALL MUST APPEAR): ${legalBlock}

Open: RE: NOTICE OF INTENT TO SUE — FCRA VIOLATIONS. Detail violation history. Cite FCRA §616 and §617. Cite Safeco v. Burr and Saunders v. Branch Banking. State intent to file in federal district court under 28 U.S.C. §1331. State simultaneous CFPB and state AG complaints. Give FINAL 10-day cure period. Intimidating formal tone. Complete letter only.`,

      redispute: `Expert credit repair attorney. Write a re-dispute attacking from a COMPLETELY DIFFERENT angle — Metro 2 field-level accuracy.

${baseInfo}
PRIOR: Previously "verified" | NEW ANGLE: ${item.reason || customNote || 'Metro 2 field-level accuracy: DOFD, account status code, payment rating, balance accuracy'}

State this is NEW dispute based on NEW material information per FCRA §611(a)(1). Cite FCRA §623(b) furnisher independent duty. Cite Johnson v. MBNA America Bank. Attack Metro 2 DOFD field accuracy. Attack Metro 2 Account Status Code accuracy. Demand bureau forward ALL new grounds to furnisher. If furnisher cannot verify specific Metro 2 fields, deletion required under FCRA §611(a)(5)(A). Complete letter only.`,
    }

    try {
      const result = await callAI(adminPassword, prompts[selectedType] || prompts.initial)
      setLetter(result)
    } catch (e) {
      setLetter('Error: ' + (e instanceof Error ? e.message : 'Failed'))
    }
    setGenerating(false)
  }

  function copy() {
    if (letter) {
      navigator.clipboard.writeText(letter)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const lt = LETTER_TYPES.find((l) => l.key === selectedType)!

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Target Bureau</div>
          {item.bureaus.map((b) => {
            const s = bureauStatuses[b] || 'Not Sent'
            return (
              <button key={b} onClick={() => setSelectedBureau(b)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '7px 9px', marginBottom: 4, borderRadius: 7, cursor: 'pointer', gap: 6,
                border: `1px solid ${selectedBureau === b ? BUREAU_COLORS[b] + '66' : '#1e2a3a'}`,
                background: selectedBureau === b ? BUREAU_COLORS[b] + '11' : 'transparent',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: selectedBureau === b ? BUREAU_COLORS[b] : '#94a3b8' }}>{b}</span>
                <Chip label={s} scheme={s} />
              </button>
            )
          })}
        </div>
        <div style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 10, padding: 12, flex: 1 }}>
          <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Letter Type</div>
          {LETTER_TYPES.map((l) => (
            <button key={l.key} onClick={() => { setSelectedType(l.key); setLetter(null) }} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '7px 9px', marginBottom: 3, borderRadius: 7, textAlign: 'left', cursor: 'pointer', gap: 6,
              border: `1px solid ${selectedType === l.key ? '#7c3aed66' : 'transparent'}`,
              background: selectedType === l.key ? '#1a1a3e' : 'transparent',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: selectedType === l.key ? '#a78bfa' : '#64748b' }}>{l.icon} {l.label.split('—')[0].trim()}</div>
              <span style={{ fontSize: 9, fontWeight: 800, color: selectedType === l.key ? '#7c3aed' : '#1e2a3a', background: selectedType === l.key ? '#1a1040' : '#0a0d16', border: `1px solid ${selectedType === l.key ? '#4f46e5' : '#1a2040'}`, borderRadius: 3, padding: '1px 5px', whiteSpace: 'nowrap', flexShrink: 0 }}>{l.statutes.length} laws</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ background: '#080e1a', border: '1px solid #1e2a3a', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #0f1628', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#a78bfa' }}>{lt.icon} {lt.label}</span>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{lt.desc}</div>
            </div>
            <span style={{ fontSize: 10, color: '#2d3a5e', fontWeight: 700 }}>{lt.statutes.length} statutes</span>
          </div>
          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            {lt.statutes.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '7px 14px', borderBottom: '1px solid #0a0f1a', gap: 10, alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', lineHeight: 1.3 }}>{s.code}</div>
                  <div style={{ fontSize: 10, color: '#1e3a5f', fontFamily: 'monospace', marginTop: 1 }}>{s.cite}</div>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{s.note}</div>
              </div>
            ))}
          </div>
        </div>

        <textarea value={customNote} onChange={(e) => setCustomNote(e.target.value)}
          placeholder="Optional context (paid off 2022, medical emergency, not my account)..."
          rows={2} style={{ ...IS, resize: 'none', fontSize: 12 }} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={generate} disabled={generating} style={{
            flex: 1, background: generating ? '#1a2040' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: '#fff', border: 'none', borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 700,
            cursor: generating ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {generating ? <><Spinner /> Generating...</> : '⚡ Generate Letter'}
          </button>
          <button onClick={getStrategy} disabled={loadingStrategy} style={{
            padding: '10px 14px', background: '#0d1017', border: '1px solid #2d3a5e', color: '#7dd3fc',
            borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: loadingStrategy ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
          }}>
            {loadingStrategy ? <><Spinner color="#7dd3fc" /> Analyzing...</> : '🧠 Insider Strategy'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#475569', alignSelf: 'center' }}>Mark {selectedBureau}:</span>
          {RESPONSE_STATUSES.map((s) => (
            <button key={s} onClick={() => onStatusChange(item.id, selectedBureau, s)} style={{
              padding: '3px 9px', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${bureauStatuses[selectedBureau] === s ? (RESPONSE_COLORS[s]?.border || '#4f46e5') : '#1e2a3a'}`,
              background: bureauStatuses[selectedBureau] === s ? (RESPONSE_COLORS[s]?.bg || '#1a1a3e') : 'transparent',
              color: bureauStatuses[selectedBureau] === s ? (RESPONSE_COLORS[s]?.color || '#a78bfa') : '#475569',
            }}>{s}</button>
          ))}
        </div>

        {strategy && (
          <div style={{ background: '#070d1a', border: '1px solid #1e3a5f', borderRadius: 10, padding: 14, fontSize: 12, lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: '#60a5fa', fontSize: 11, textTransform: 'uppercase' }}>🧠 Insider Intel — {selectedBureau}</div>
            <div style={{ whiteSpace: 'pre-wrap', color: '#94a3b8' }}>{strategy}</div>
          </div>
        )}

        {letter && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>Generated — {selectedBureau}</span>
              <button onClick={copy} style={{
                background: copied ? '#052e16' : '#1a2040', color: copied ? '#4ade80' : '#94a3b8',
                border: `1px solid ${copied ? '#14532d' : '#2d3a5e'}`,
                borderRadius: 5, padding: '3px 12px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
              }}>{copied ? '✓ Copied!' : 'Copy Letter'}</button>
            </div>
            <pre style={{
              background: '#050810', border: '1px solid #1a2040', borderRadius: 8,
              padding: '14px 16px', fontSize: 11.5, lineHeight: 1.75, whiteSpace: 'pre-wrap',
              color: '#cbd5e1', maxHeight: 400, overflowY: 'auto', fontFamily: "'Courier New', monospace",
            }}>{letter}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Scan Tab ─────────────────────────────────────────────────────────────────
function ScanTab({ onImport, adminPassword }: {
  onImport: (data: { personalInfo: Partial<PersonalInfo>; negativeItems: Array<Omit<DisputeItem, 'id'>> }) => void
  adminPassword: string
}) {
  const [scanning, setScanning] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [log, setLog] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [extracted, setExtracted] = useState(false)
  const [reviewInfo, setReviewInfo] = useState<Partial<PersonalInfo>>({})
  const [reviewItems, setReviewItems] = useState<Array<Omit<DisputeItem, 'id'> & { id: string; selected: boolean }>>([])
  const fileRef = useRef<HTMLInputElement>(null)

  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return }
    setError(null); setLog([]); setExtracted(false); setScanning(true)
    setPreview(URL.createObjectURL(file))
    const base64 = await new Promise<string>((res, rej) => {
      const r = new FileReader()
      r.onload = () => res((r.result as string).split(',')[1])
      r.onerror = rej
      r.readAsDataURL(file)
    })
    setLog((p) => [...p, 'Sending to AI vision model...'])
    const prompt = `Analyze this credit report image. Return ONLY valid JSON, no markdown:
{"personalInfo":{"name":"","address":"","city":"","state":"","zip":"","dob":"","ssn_last4":""},"negativeItems":[{"creditor":"","accountLast4":"","type":"Late Payment|Collection Account|Charge-Off|Repossession|Foreclosure|Hard Inquiry|Invalid Debt|Bankruptcy|Identity Theft / Not Mine|Duplicate Account|Incorrect Balance|Incorrect Status","bureaus":["list bureaus where negative"],"reason":"brief description"}]}`
    try {
      const raw = await callAI(adminPassword, prompt, base64, file.type)
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      setLog((p) => [...p, `Found ${parsed.negativeItems?.length || 0} negative items`, parsed.personalInfo?.name ? `Name: ${parsed.personalInfo.name}` : 'Name not detected'])
      setReviewInfo(parsed.personalInfo || {})
      setReviewItems((parsed.negativeItems || []).map((item: Omit<DisputeItem, 'id'>, i: number) => ({ ...item, id: `scan-${i}`, selected: true })))
      setExtracted(true)
    } catch {
      setError('Could not parse. Try a clearer, cropped screenshot.')
    }
    setScanning(false)
  }

  function confirm() {
    onImport({ personalInfo: reviewInfo, negativeItems: reviewItems.filter((i) => i.selected) })
    setExtracted(false); setPreview(null); setLog([])
  }

  if (extracted) {
    return (
      <div style={{ maxWidth: 620, animation: 'cr-fade 0.2s ease' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>Review Extracted Data</h2>
        <p style={{ color: '#475569', fontSize: 13, margin: '0 0 16px' }}>Edit anything before importing.</p>
        <div style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Personal Info</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(['name', 'address', 'city', 'state', 'zip', 'dob'] as (keyof PersonalInfo)[]).map((k) => (
              <label key={k} style={{ fontSize: 12 }}>
                <div style={{ color: '#64748b', marginBottom: 3, textTransform: 'capitalize' }}>{k}</div>
                <input value={(reviewInfo as Record<string, string>)[k] || ''}
                  onChange={(e) => setReviewInfo((p) => ({ ...p, [k]: e.target.value }))}
                  style={{ ...IS, fontSize: 12, padding: '7px 10px' }} />
              </label>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>
            Negative Items ({reviewItems.filter((i) => i.selected).length} selected)
          </div>
          {reviewItems.map((item) => (
            <div key={item.id} style={{ background: item.selected ? '#0d1017' : '#070a10', border: `1px solid ${item.selected ? '#1e2a3a' : '#111'}`, borderRadius: 9, padding: '11px 13px', marginBottom: 7, opacity: item.selected ? 1 : 0.45 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <input type="checkbox" checked={item.selected}
                  onChange={() => setReviewItems((p) => p.map((i) => i.id === item.id ? { ...i, selected: !i.selected } : i))}
                  style={{ accentColor: '#7c3aed', width: 14, height: 14 }} />
                <span style={{ fontWeight: 700, fontSize: 13 }}>{item.creditor}</span>
                {item.accountLast4 && <span style={{ color: '#475569', fontSize: 12 }}>...{item.accountLast4}</span>}
              </div>
              <div style={{ marginLeft: 22, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <select value={item.type}
                  onChange={(e) => setReviewItems((p) => p.map((i) => i.id === item.id ? { ...i, type: e.target.value } : i))}
                  style={{ ...IS, width: 'auto', fontSize: 11, padding: '3px 8px' }}>
                  {DISPUTE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <div style={{ display: 'flex', gap: 4 }}>
                  {BUREAUS.map((b) => (
                    <button key={b} onClick={() => setReviewItems((p) => p.map((i) => i.id === item.id ? { ...i, bureaus: i.bureaus.includes(b) ? i.bureaus.filter((x) => x !== b) : [...i.bureaus, b] } : i))} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: `1px solid ${item.bureaus.includes(b) ? BUREAU_COLORS[b] + '88' : '#1e2a3a'}`, background: item.bureaus.includes(b) ? BUREAU_COLORS[b] + '15' : 'transparent', color: item.bureaus.includes(b) ? BUREAU_COLORS[b] : '#475569' }}>{BUREAU_SHORT[b]}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={confirm} style={{ flex: 1, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', borderRadius: 9, padding: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Import {reviewItems.filter((i) => i.selected).length} Items
          </button>
          <button onClick={() => { setExtracted(false); setPreview(null); setLog([]) }} style={{ padding: '11px 16px', background: 'transparent', border: '1px solid #1e2a3a', color: '#64748b', borderRadius: 9, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 560, animation: 'cr-fade 0.2s ease' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>Scan Credit Report</h2>
      <p style={{ color: '#475569', fontSize: 13, margin: '0 0 18px' }}>Upload a screenshot and AI will extract all negative items automatically.</p>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processFile(f) }}
        onClick={() => !scanning && fileRef.current?.click()}
        style={{ border: '2px dashed #1e2a3a', borderRadius: 12, padding: '36px 24px', textAlign: 'center', cursor: scanning ? 'default' : 'pointer', background: '#0d1017', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
        {preview
          ? <img src={preview} alt="Preview" style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 8, opacity: scanning ? 0.3 : 1 }} />
          : (<><div style={{ fontSize: 32, marginBottom: 8 }}>📸</div><div style={{ fontWeight: 600, marginBottom: 4 }}>Drop screenshot here</div><div style={{ color: '#475569', fontSize: 13 }}>or click to browse</div></>)}
        {scanning && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,10,20,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Spinner size={28} />
            <div style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa' }}>Analyzing with AI vision...</div>
          </div>
        )}
      </div>
      {log.length > 0 && (
        <div style={{ background: '#050810', border: '1px solid #1e2a3a', borderRadius: 8, padding: '10px 13px', marginBottom: 10 }}>
          {log.map((l, i) => <div key={i} style={{ fontSize: 12, color: '#4ade80', lineHeight: 1.8 }}>{l}</div>)}
        </div>
      )}
      {error && <div style={{ background: '#2d0a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 13px', fontSize: 13, color: '#fca5a5' }}>{error}</div>}
      <div style={{ marginTop: 14, background: '#0d1829', border: '1px solid #1e3a5f', borderRadius: 9, padding: '11px 13px', fontSize: 12, color: '#7dd3fc', lineHeight: 1.7 }}>
        <strong>Tips:</strong> Use a full-screen screenshot. Crop to the accounts section for best results.
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
  const [activeTab, setActiveTab] = useState<'report' | 'simulator' | 'scan' | 'settings'>('report')
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
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!authorized) return
    try { localStorage.setItem('creditiq_data_v1', JSON.stringify({ items, bureauStatuses, yourInfo })) } catch { /* ignore */ }
  }, [items, bureauStatuses, yourInfo, authorized])

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

  function importFromScan({ personalInfo, negativeItems }: { personalInfo: Partial<PersonalInfo>; negativeItems: Array<Omit<DisputeItem, 'id'>> }) {
    if (personalInfo?.name) setYourInfo((p) => ({ ...p, ...personalInfo }))
    const newItems: DisputeItem[] = negativeItems.map((item, i) => ({ ...item, id: `scan-${Date.now()}-${i}` }))
    setItems((p) => [...p, ...newItems])
    setBureauStatuses((p) => { const n = { ...p }; newItems.forEach((item) => { n[item.id] = {} }); return n })
    setActiveTab('report')
  }

  const selectedItem = items.find((i) => i.id === selectedItemId)

  if (!authorized) {
    return (
      <main style={{ minHeight: '100vh', background: '#07090f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
        <style>{`@keyframes cr-spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: '100%', maxWidth: 400, background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 16, padding: 32 }}>
          <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Admin Access</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px', color: '#e2e8f0' }}>CreditIQ</h1>
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

  return (
    <div style={{ minHeight: '100vh', background: '#07090f', color: '#e2e8f0', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{`@keyframes cr-spin { to { transform: rotate(360deg); } } @keyframes cr-fade { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div style={{ borderBottom: '1px solid #111827', padding: '0 20px', position: 'sticky', top: 0, background: '#07090f', zIndex: 10 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CreditIQ</span>
            <span style={{ fontSize: 10, color: '#374151', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin</span>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            <NavTab label="📋 Report" active={activeTab === 'report'} onClick={() => setActiveTab('report')} badge={items.length || null} />
            <NavTab label="📊 Simulator" active={activeTab === 'simulator'} onClick={() => setActiveTab('simulator')} />
            <NavTab label="📸 Scan" active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} />
            <NavTab label="⚙️ Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 20px' }}>

        {activeTab === 'report' && (
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
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>No dispute items yet</div>
                <div style={{ fontSize: 13 }}>Add items manually or scan a credit report</div>
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

        {activeTab === 'simulator' && <ScoreSimulator items={items} />}
        {activeTab === 'scan' && <ScanTab onImport={importFromScan} adminPassword={password} />}

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
                    <input type={type} value={yourInfo[k]} onChange={(e) => setYourInfo((p) => ({ ...p, [k]: e.target.value }))} placeholder={ph} style={IS} />
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
