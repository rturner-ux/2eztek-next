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

  const legalBlock = (lt: typeof LETTER_TYPES[0]) =>
    lt.statutes.map((s) => `• ${s.code} [${s.cite}]: ${s.note}`).join('\n')

  async function getStrategy() {
    setLoadingStrategy(true)
    const burStatus = bureauStatuses[selectedBureau] || 'Not Sent'
    try {
      const result = await callAI(adminPassword, `You are a senior credit repair attorney and insider who has worked at all 3 credit bureaus.

Consumer has this negative item:
- Creditor: ${item.creditor}
- Type: ${item.type}
- Account last 4: ${item.accountLast4 || 'unknown'}
- Bureau: ${selectedBureau}
- Current status: ${burStatus}

Give a brutally honest insider strategy briefing in 3-4 short paragraphs:
1. What ${selectedBureau} is likely doing internally with this type of item
2. Their weak points / most common compliance failures for this item type
3. The single highest-leverage move right now given the status "${burStatus}"
4. What to do if they verify again

Be specific, tactical, and direct. No fluff. Write like you are advising a close friend.`)
      setStrategy(result)
    } catch (e) {
      setStrategy('Error: ' + (e instanceof Error ? e.message : 'Failed'))
    }
    setLoadingStrategy(false)
  }

  async function generate() {
    if (!yourInfo.name) { alert('Add your personal info in Settings first.'); return }
    setGenerating(true); setLetter(null)

    const lt = LETTER_TYPES.find((l) => l.key === selectedType)!
    const burStatus = bureauStatuses[selectedBureau] || 'Not Sent'
    const lb = legalBlock(lt)

    const baseBlock = `CONSUMER INFORMATION:
Name: ${yourInfo.name}
Address: ${yourInfo.address}, ${yourInfo.city}, ${yourInfo.state} ${yourInfo.zip}
Date of Birth: ${yourInfo.dob || '[DATE OF BIRTH]'}
SSN Last 4: ${yourInfo.ssn || 'XXXX'}

DISPUTED ITEM:
Creditor/Furnisher: ${item.creditor}
Account (Last 4): ...${item.accountLast4 || '????'}
Dispute Type: ${item.type}
Item-Specific Legal Basis: ${LAW_REFS[item.type] || 'FCRA §611(a)(1)'}
Consumer Notes: ${item.reason || customNote || 'None'}

SEND TO:
${BUREAU_ADDRESSES[selectedBureau]}

MANDATORY LEGAL CITATIONS TO CITE IN LETTER:
${lb}`

    const prompts: Record<string, string> = {
      initial: `You are an expert credit repair attorney. Write a complete, aggressive, FCRA-compliant initial dispute letter. Every legal citation below MUST appear verbatim in the letter body.

${baseBlock}

LETTER REQUIREMENTS:
1. Open with a formal RE: line citing the account and dispute type
2. State the specific inaccuracy and why it violates FCRA and Metro 2
3. Cite each statute above by full code and USC citation in the body
4. Demand deletion OR correction within 30 days per FCRA §611(a)(1) [15 U.S.C. §1681i(a)(1)]
5. Invoke furnisher liability under FCRA §623(a)(1)(A) [15 U.S.C. §1681s-2(a)(1)(A)]
6. Request method of verification per FCRA §611(a)(7) [15 U.S.C. §1681i(a)(7)] if they verify
7. State intent to file CFPB complaint and contact state Attorney General if unresolved
8. Close with a professional signature block
9. Write the COMPLETE letter only — no instructions, no placeholders`,

      mov: `You are an expert credit repair attorney. Write a Method of Verification demand letter. The bureau claimed to have "verified" the disputed item. The consumer is legally entitled to know EXACTLY how that verification was conducted. Every citation below MUST appear in the letter.

${baseBlock}
Bureau status: ${burStatus}

LETTER REQUIREMENTS:
1. Reference that bureau previously "verified" the item and the consumer disputes that verification
2. Cite FCRA §611(a)(7) [15 U.S.C. §1681i(a)(7)] — the consumer's statutory right to know the method
3. Cite Cushman v. Trans Union Corp., 115 F.3d 220 (3d Cir. 1997) — mere matching is not investigation
4. Cite Stevenson v. TRW Inc., 987 F.2d 288 (5th Cir. 1993) — rubber-stamp verification is a violation
5. Demand in writing: (a) specific method used, (b) name/address/phone of furnisher contacted, (c) documents reviewed, (d) dates
6. State bureau has 15 days to respond or the item must be deleted
7. Warn that failure to provide this information is itself an FCRA violation
8. Complete letter only`,

      goodwill: `You are a credit repair specialist. Write a sincere, persuasive goodwill deletion letter addressed to the original creditor. This is NOT a legal demand — it is a human appeal that invokes the creditor's discretion.

CONSUMER: ${yourInfo.name}
CREDITOR: ${item.creditor} | Account: ...${item.accountLast4 || '????'}
ITEM TYPE: ${item.type}
${customNote ? `CONSUMER'S SITUATION: ${customNote}` : 'SITUATION: Consumer experienced a financial/personal hardship that caused this isolated negative event. Otherwise has a positive history.'}

LEGAL HOOKS (frame as the creditor's right, not a threat):
${lb}

LETTER REQUIREMENTS:
1. Address the specific customer service or goodwill department
2. Open with genuine appreciation for the creditor relationship
3. Describe the hardship that led to the negative mark — be specific and human
4. Highlight the positive payment history before and after the incident
5. Reference that FCRA §623(b)(1)(E) [15 U.S.C. §1681s-2(b)(1)(E)] gives them the discretion to update or delete the reporting
6. Make a specific clear ask: request deletion from all three credit bureaus
7. Express commitment to continued responsible account management
8. Keep tone humble, genuine, and professional — no legal threats
9. Complete letter only`,

      p4d: `You are a credit negotiation specialist. Write a Pay-for-Delete negotiation letter to a collection agency or creditor. Payment is CONDITIONAL on prior written confirmation of deletion. Every citation must appear.

CONSUMER: ${yourInfo.name}
COLLECTOR/CREDITOR: ${item.creditor} | Account: ...${item.accountLast4 || '????'}
${customNote ? `CONTEXT: ${customNote}` : ''}

MANDATORY LEGAL CITATIONS:
${lb}

LETTER REQUIREMENTS:
1. Open by acknowledging awareness of the outstanding balance — do NOT admit liability
2. Cite FDCPA §807 [15 U.S.C. §1692e] — collector may not misrepresent the status of any debt or settlement
3. Cite FCRA §623(b)(1)(E) [15 U.S.C. §1681s-2(b)(1)(E)] — furnisher's right to delete upon agreement
4. Make a specific settlement offer (leave as [AMOUNT])
5. State explicitly: "This offer is conditional upon receipt of written agreement to delete this account from all three major credit bureaus prior to any payment"
6. State this is NOT an admission of liability; it is a negotiated settlement under accord and satisfaction (Restatement (Second) Contracts §281)
7. Require deletion agreement in writing on company letterhead, signed by an authorized representative
8. Set a 14-day response deadline or offer is withdrawn
9. Complete letter only`,

      fdcpa: `You are an expert consumer rights attorney specializing in FDCPA enforcement. Write a formal debt validation demand letter. ALL collection activity must cease until proper validation is provided.

${baseBlock}

VALIDATION DEMANDS (all must appear in the letter):
• Written verification of the debt amount
• Name and address of the original creditor
• Complete chain of title — proof collector owns or has authority to collect
• Copy of the original signed credit agreement
• Complete itemized payment history from origination
• Proof the statute of limitations has not expired
• Collector's license number to collect in consumer's state
• Any assignment or purchase agreements

LETTER REQUIREMENTS:
1. Open by invoking FDCPA §809(b) [15 U.S.C. §1692g(b)] as the legal basis
2. State all collection activity — including credit reporting — must cease immediately until validation is complete
3. Cite FDCPA §807(2), §808, and Haddad v. Alexander, Zelmanski, 698 F.3d 290 (6th Cir. 2012)
4. State that violations entitle consumer to $1,000 statutory damages per FDCPA §813 [15 U.S.C. §1692k] plus attorney fees
5. Give 30-day response deadline
6. Complete letter only`,

      escalation: `You are a senior consumer protection attorney. Write a final legal escalation letter with explicit lawsuit notice. This must read like it came from a law firm. Every citation must appear by full name and USC reference.

CONSUMER/PLAINTIFF: ${yourInfo.name}
Address: ${yourInfo.address}, ${yourInfo.city}, ${yourInfo.state} ${yourInfo.zip}
RESPONDENT: ${selectedBureau}
DISPUTED ITEM: ${item.creditor}, Account ...${item.accountLast4 || '????'}
DISPUTE HISTORY: Previously disputed; ${burStatus === 'Verified' ? 'bureau verified without conducting a reasonable investigation' : 'bureau has failed to delete or correct despite multiple disputes'}
${customNote ? `ADDITIONAL FACTS: ${customNote}` : ''}

MANDATORY LEGAL CITATIONS — EVERY ONE MUST APPEAR IN THE LETTER:
${lb}

LETTER REQUIREMENTS:
1. Open with formal RE: NOTICE OF INTENT TO SUE — FCRA VIOLATIONS
2. Detail the specific violation history
3. Cite FCRA §616 [15 U.S.C. §1681n] — willful noncompliance: $100-$1,000 statutory damages PER VIOLATION + punitive damages
4. Cite FCRA §617 [15 U.S.C. §1681o] — negligent noncompliance: actual damages + attorney fees + costs
5. Cite Safeco Insurance Co. v. Burr, 551 U.S. 47 (2007) — reckless disregard = willful violation
6. Cite Saunders v. Branch Banking, 526 F.3d 142 (4th Cir. 2008)
7. State consumer intends to file suit in federal district court under 28 U.S.C. §1331
8. State simultaneous CFPB (cite 12 U.S.C. §5481 et seq.) and state AG complaints will be filed
9. Give a FINAL 10-day cure period to delete the item before suit is filed
10. Complete letter only — formal and intimidating tone throughout`,

      redispute: `You are an expert credit repair attorney. Write a re-dispute letter that attacks the item from a COMPLETELY DIFFERENT legal angle — Metro 2 field-level accuracy. The bureau has already "verified" — now attack the DATA FURNISHER's compliance. Every citation must appear.

${baseBlock}
PRIOR STATUS: Previously "verified" — new material dispute grounds presented
NEW ANGLE: ${item.reason || customNote || 'Challenging Metro 2 field-level accuracy: DOFD, account status code, payment rating, and balance accuracy'}

LETTER REQUIREMENTS:
1. Open by stating this is a NEW dispute based on NEW material information per FCRA §611(a)(1)
2. Cite FCRA §623(b) [15 U.S.C. §1681s-2(b)] — furnisher's independent duty to investigate when notified by bureau
3. Cite FCRA §623(b)(1)(A) — furnisher must investigate the SPECIFIC dispute raised, not just match records
4. Cite Johnson v. MBNA America Bank, 357 F.3d 426 (4th Cir. 2004) — bureau may not simply parrot the furnisher's response
5. Attack Metro 2 compliance: cite CDIA Metro 2 §5.1 for Date of First Delinquency (DOFD) accuracy
6. Attack Metro 2 Account Status Code accuracy (Appendix A) — demand correct code reflecting actual account state
7. Demand bureau contact furnisher with ALL specific new dispute grounds, not a generic re-investigation
8. State that if furnisher cannot verify the specific Metro 2 fields, deletion is required under FCRA §611(a)(5)(A)
9. Complete letter only`,
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
    if (letter) { navigator.clipboard.writeText(letter); setCopied(true); setTimeout(() => setCopied(false), 2000) }
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
                  <div style={{ fontSize: 10, color: '#1e3a5f', fontFamily: 'monospace', marginTop: 1, lineHeight: 1.3 }}>{s.cite}</div>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{s.note}</div>
              </div>
            ))}
          </div>
        </div>

        <textarea value={customNote} onChange={(e) => setCustomNote(e.target.value)}
          placeholder="Optional context (e.g. 'I paid this off in 2022', 'account belongs to my ex', 'medical emergency')..."
          rows={2} style={{ ...IS, resize: 'none', fontSize: 12 }} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={generate} disabled={generating} style={{
            flex: 1, background: generating ? '#1a2040' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: '#fff', border: 'none', borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 700,
            cursor: generating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
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
              <button onClick={copy} style={{ background: copied ? '#052e16' : '#1a2040', color: copied ? '#4ade80' : '#94a3b8', border: `1px solid ${copied ? '#14532d' : '#2d3a5e'}`, borderRadius: 5, padding: '3px 12px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>{copied ? '✓ Copied!' : 'Copy Letter'}</button>
            </div>
            <pre style={{ background: '#050810', border: '1px solid #1a2040', borderRadius: 8, padding: '14px 16px', fontSize: 11.5, lineHeight: 1.75, whiteSpace: 'pre-wrap', color: '#cbd5e1', maxHeight: 400, overflowY: 'auto', fontFamily: "'Courier New', monospace" }}>{letter}</pre>
          </div>
        )}
      </div>
    </div>
  )
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
  const [extracted, setExtracted] = useState(false)
  const [reviewInfo, setReviewInfo] = useState<ScanReviewInfo>({})
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([])
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
    setError(null); setLog([]); setExtracted(false); setScanning(true)
    setFileInfo({ name: file.name, size: (file.size / 1024).toFixed(0) + ' KB', type: isPDF ? 'PDF' : 'Image' })
    if (isImage) setPreview(URL.createObjectURL(file))
    else setPreview(null)

    addLog(`Reading ${isPDF ? 'PDF' : 'image'} (${(file.size / 1024).toFixed(0)} KB)...`)
    const base64 = await new Promise<string>((res, rej) => {
      const r = new FileReader()
      r.onload = () => res((r.result as string).split(',')[1])
      r.onerror = rej
      r.readAsDataURL(file)
    })

    addLog('Sending to AI for deep extraction...')
    if (isPDF) addLog('PDF detected — reading full text layer across all pages...')

    const prompt = `You are an expert credit report analyst. Read this ${isPDF ? 'PDF credit report' : 'credit report image'} thoroughly and extract EVERY piece of data visible.

Return ONLY valid JSON — no markdown, no explanation:
{
  "personalInfo": { "name":"", "address":"", "city":"", "state":"", "zip":"", "dob":"", "ssn_last4":"", "phone":"", "employer":"" },
  "creditScores": { "Experian":0, "Equifax":0, "TransUnion":0 },
  "allAccounts": [
    {
      "creditor":"", "accountLast4":"", "accountType":"", "openDate":"", "balance":"",
      "creditLimit":"", "paymentStatus":"", "bureaus":[], "isNegative":true,
      "type":"Late Payment|Collection Account|Charge-Off|Repossession|Foreclosure|Hard Inquiry|Invalid Debt|Bankruptcy|Identity Theft / Not Mine|Duplicate Account|Incorrect Balance|Incorrect Status",
      "reason":"specific reason this is negative"
    }
  ],
  "hardInquiries": [ { "creditor":"", "date":"", "bureau":"" } ],
  "publicRecords": [ { "type":"", "date":"", "amount":"", "bureau":"" } ],
  "summary": { "totalAccounts":0, "negativeAccounts":0, "hardInquiries":0, "oldestAccount":"", "totalDebt":"" }
}

RULES: isNegative=true only for derogatory items. bureaus array = only bureaus where that account shows negative. Return ONLY the JSON.`

    try {
      addLog('Analyzing accounts, balances, payment history...')
      const raw = await callAI(adminPassword, prompt, base64, file.type)
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
      addLog(`${negItems.length} negative/derogatory accounts`, negItems.length > 0 ? 'warn' : 'success')
      addLog(`${inquiries.length} hard inquiries`, inquiries.length > 5 ? 'warn' : 'success')
      if (pubRecs.length > 0) addLog(`${pubRecs.length} public record(s)`, 'warn')
      if (parsed.personalInfo?.name) addLog(`Name: ${parsed.personalInfo.name}`, 'success')
      if (parsed.creditScores) {
        const str = BUREAUS.map((b) => parsed.creditScores![b] > 0 ? `${b.slice(0, 3)}: ${parsed.creditScores![b]}` : null).filter(Boolean).join(' · ')
        if (str) addLog(`Scores: ${str}`, 'success')
      }

      const inquiryItems: ReviewItem[] = inquiries.map((inq, i) => ({
        id: `inq-${i}`, creditor: inq.creditor || 'Unknown Inquiry', accountLast4: '',
        type: 'Hard Inquiry', bureaus: inq.bureau ? [inq.bureau] : [],
        reason: `Hard inquiry ${inq.date || ''}`.trim(), selected: false,
      }))
      const pubRecItems: ReviewItem[] = pubRecs.map((pr, i) => ({
        id: `pub-${i}`, creditor: pr.type || 'Public Record', accountLast4: '',
        type: pr.type?.toLowerCase().includes('bankrupt') ? 'Bankruptcy' : 'Invalid Debt',
        bureaus: pr.bureau ? [pr.bureau] : BUREAUS,
        reason: `${pr.type || ''} ${pr.date || ''} ${pr.amount || ''}`.trim(), selected: true,
      }))

      const allReview: ReviewItem[] = [
        ...negItems.map((item, i) => ({ ...item, id: `acct-${i}`, selected: true, bureaus: item.bureaus?.length ? item.bureaus : BUREAUS })),
        ...pubRecItems,
        ...inquiryItems,
      ]

      setReviewInfo({ ...(parsed.personalInfo || {}), creditScores: parsed.creditScores, summary: parsed.summary })
      setReviewItems(allReview)
      setExtracted(true)
    } catch (err) {
      setError(`Could not parse. Try: (1) PDF from AnnualCreditReport.com, (2) higher-res screenshot, (3) crop to accounts section. ${err instanceof Error ? err.message : ''}`)
    }
    setScanning(false)
  }

  function confirm() {
    const { creditScores, summary, ...personalInfo } = reviewInfo || {}
    void summary
    onImport({ personalInfo, negativeItems: reviewItems.filter((i) => i.selected), creditScores })
    setExtracted(false); setPreview(null); setLog([]); setFileInfo(null)
  }

  // ── Review screen ────────────────────────────────────────────────────────
  if (extracted) {
    const negSel = reviewItems.filter((i) => i.selected)
    const info = reviewInfo || {}
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 2px' }}>Review Extracted Report</h2>
            <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>Verify before importing to your dispute dashboard.</p>
          </div>
          <div style={{ background: '#052e16', border: '1px solid #14532d', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#4ade80', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {negSel.length} items selected
          </div>
        </div>

        {info.summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'Total Accounts', value: info.summary.totalAccounts || reviewItems.length },
              { label: 'Negative', value: info.summary.negativeAccounts || reviewItems.filter((i) => i.selected).length, color: '#f87171' },
              { label: 'Hard Inquiries', value: info.summary.hardInquiries || 0, color: '#fb923c' },
              { label: 'Total Debt', value: info.summary.totalDebt || '—' },
            ].map((s) => (
              <div key={s.label} style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: (s as { color?: string }).color || '#e2e8f0' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {info.creditScores && BUREAUS.some((b) => (info.creditScores![b] || 0) > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
            {BUREAUS.map((b) => (info.creditScores![b] || 0) > 0 ? (
              <div key={b} style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: BUREAU_COLORS[b], fontWeight: 700, marginBottom: 4 }}>{b}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: info.creditScores![b] >= 740 ? '#4ade80' : info.creditScores![b] >= 670 ? '#facc15' : '#f87171' }}>
                  {info.creditScores![b]}
                </div>
              </div>
            ) : null)}
          </div>
        )}

        <div style={{ background: '#0d1017', border: '1px solid #1e2a3a', borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Personal Info — Edit if Needed</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {([['name', 'Full Name'], ['address', 'Address'], ['city', 'City'], ['state', 'State'], ['zip', 'ZIP'], ['dob', 'Date of Birth'], ['phone', 'Phone'], ['employer', 'Employer']] as [string, string][]).map(([k, label]) => (
              <label key={k} style={{ fontSize: 12 }}>
                <div style={{ color: '#64748b', marginBottom: 3 }}>{label}</div>
                <input value={(info as Record<string, string>)[k] || ''}
                  onChange={(e) => setReviewInfo((p) => ({ ...p, [k]: e.target.value }))}
                  style={{ ...IS, fontSize: 12, padding: '7px 10px' }} />
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>
            Negative Items ({negSel.length} selected)
          </div>
          {reviewItems.map((item) => (
            <div key={item.id} style={{ background: item.selected ? '#0d1017' : '#070a10', border: `1px solid ${item.selected ? '#1e2a3a' : '#111'}`, borderRadius: 9, padding: '11px 13px', marginBottom: 7, opacity: item.selected ? 1 : 0.45 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <input type="checkbox" checked={item.selected}
                  onChange={() => setReviewItems((p) => p.map((i) => i.id === item.id ? { ...i, selected: !i.selected } : i))}
                  style={{ accentColor: '#7c3aed', width: 14, height: 14, flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: 13 }}>{item.creditor}</span>
                {item.accountLast4 && <span style={{ color: '#475569', fontSize: 12 }}>...{item.accountLast4}</span>}
                {item.balance && <span style={{ fontSize: 11, color: '#f87171', marginLeft: 'auto' }}>{item.balance}</span>}
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
              {item.reason && <div style={{ marginLeft: 22, marginTop: 4, fontSize: 11, color: '#374151' }}>{item.reason}</div>}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={confirm} style={{ flex: 1, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', borderRadius: 9, padding: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Import {negSel.length} Items to Dispute Tracker
          </button>
          <button onClick={() => { setExtracted(false); setPreview(null); setLog([]); setFileInfo(null) }} style={{ padding: '11px 16px', background: 'transparent', border: '1px solid #1e2a3a', color: '#64748b', borderRadius: 9, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    )
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
  const [activeTab, setActiveTab] = useState<'scan' | 'items' | 'simulator' | 'settings'>('scan')
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
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!authorized) return
    try { localStorage.setItem('creditiq_data_v1', JSON.stringify({ items, bureauStatuses, yourInfo, importedScores })) } catch { /* ignore */ }
  }, [items, bureauStatuses, yourInfo, importedScores, authorized])

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
    if (personalInfo?.name) setYourInfo((p) => ({ ...p, ...personalInfo }))
    if (creditScores && Object.values(creditScores).some((v) => v > 0)) setImportedScores(creditScores)
    const newItems: DisputeItem[] = negativeItems.map((item, i) => ({ ...item, id: `scan-${Date.now()}-${i}` }))
    setItems((p) => [...p, ...newItems])
    setBureauStatuses((p) => { const n = { ...p }; newItems.forEach((item) => { n[item.id] = {} }); return n })
    setActiveTab('items')
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
  type NavItem = { key: typeof activeTab; icon: string; label: string; badge?: number | null }
  const navItems: NavItem[] = [
    { key: 'scan', icon: '📸', label: 'Scan Report' },
    { key: 'items', icon: '⚔️', label: 'Dispute Items', badge: items.length || null },
    { key: 'simulator', icon: '📊', label: 'Score Simulator' },
    { key: 'settings', icon: '⚙️', label: 'Settings' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#07090f', color: '#e2e8f0', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", display: 'flex' }}>
      <style>{`@keyframes cr-spin { to { transform: rotate(360deg); } } @keyframes cr-fade { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Sidebar */}
      <div style={{ width: 220, flexShrink: 0, background: '#080c16', borderRight: '1px solid #0f1628', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
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
