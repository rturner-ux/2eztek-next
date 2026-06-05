// app/admin/leads/page.tsx
'use client'

import { useState, useRef } from 'react'

type Lead = {
  name: string
  title: string
  company: string
  industry: string
  email: string
}

type Result = {
  name: string
  company: string
  email: string
  relevant: boolean
  sent: boolean
  subject?: string
  preview?: string
  error?: string
}

function parseCSV(text: string): Lead[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''))

  const nameIdx = headers.findIndex((h) => h.includes('prospect_full_name') || h.includes('name'))
  const titleIdx = headers.findIndex((h) => h.includes('job_title') || h.includes('title'))
  const companyIdx = headers.findIndex((h) => h.includes('business_name') || h.includes('company'))
  const industryIdx = headers.findIndex((h) => h.includes('naics_description') || h.includes('industry'))
  const emailIdx = headers.findIndex((h) => h === 'contact_professions_email' || h.includes('email'))

  const leads: Lead[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const cols: string[] = []
    let current = ''
    let inQuote = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === '"') {
        inQuote = !inQuote
      } else if (char === ',' && !inQuote) {
        cols.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    cols.push(current.trim())

    const email = cols[emailIdx]?.replace(/"/g, '').trim()
    if (!email || !email.includes('@')) continue

    leads.push({
      name: cols[nameIdx]?.replace(/"/g, '').trim() || 'Unknown',
      title: cols[titleIdx]?.replace(/"/g, '').trim() || '',
      company: cols[companyIdx]?.replace(/"/g, '').trim() || '',
      industry: cols[industryIdx]?.replace(/"/g, '').trim() || '',
      email,
    })
  }

  return leads
}

export default function LeadEmailPage() {
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [dryRun, setDryRun] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const parsed = parseCSV(text)
      setLeads(parsed)
      setResults([])
      setSummary(null)
    }
    reader.readAsText(file)
  }

  async function run() {
    if (!leads.length) return
    try {
      setLoading(true)
      setResults([])
      setSummary(null)

      const response = await fetch('/api/admin/send-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ leads, dryRun }),
      })

      const data = await response.json()
      if (!data.success) {
        alert(data.error || 'Failed')
        return
      }

      setResults(data.results || [])
      setSummary(data)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#050B14] px-6 py-28 text-white">
        <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-black/40 p-8">
          <h1 className="text-3xl font-black">Lead Email Tool</h1>
          <p className="mt-3 text-white/55">Enter admin password to access.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') setAuthorized(true) }}
            placeholder="Admin password"
            className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => setAuthorized(true)}
            className="mt-4 w-full rounded-2xl bg-cyan-400 py-4 text-sm font-black uppercase text-black"
          >
            Enter
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
            2EZ TEK Lead Outreach
          </div>
          <h1 className="mt-6 text-4xl font-black md:text-6xl">Lead Email Tool</h1>
          <p className="mt-4 max-w-2xl text-white/55">
            Upload your lead CSV, AI filters relevant prospects, generates personalized emails, and sends via Resend.
          </p>
        </div>

        {/* Upload */}
        <div className="mb-6 rounded-[2rem] border border-white/10 bg-black/30 p-6">
          <label className="mb-4 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
            Step 1 — Upload Lead CSV
          </label>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/5 p-8 text-center transition hover:bg-cyan-400/10">
            <svg className="mb-3 h-8 w-8 text-cyan-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-black text-cyan-200">
              {fileName || 'Click to upload CSV'}
            </span>
            <span className="mt-2 text-sm text-white/40">
              {leads.length > 0 ? `${leads.length} leads loaded` : 'CSV from Apollo, LinkedIn, etc.'}
            </span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" ref={fileRef} />
          </label>
        </div>

        {/* Leads preview */}
        {leads.length > 0 && (
          <div className="mb-6 rounded-[2rem] border border-white/10 bg-black/30 p-6">
            <label className="mb-4 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
              Step 2 — Review Leads ({leads.length} total)
            </label>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {leads.map((lead, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                  <div>
                    <span className="font-black text-white">{lead.name}</span>
                    <span className="ml-2 text-white/40">— {lead.company}</span>
                    {lead.title && <span className="ml-2 text-white/25 text-xs">{lead.title}</span>}
                  </div>
                  <div className="text-xs text-white/30">{lead.email}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Options and send */}
        {leads.length > 0 && (
          <div className="mb-6 rounded-[2rem] border border-white/10 bg-black/30 p-6">
            <label className="mb-4 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
              Step 3 — Send Options
            </label>

            <div className="mb-6 flex items-center gap-4">
              <div
                onClick={() => setDryRun(!dryRun)}
                className={`relative h-6 w-11 cursor-pointer rounded-full transition ${dryRun ? 'bg-cyan-400' : 'bg-white/20'}`}
              >
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${dryRun ? 'left-0.5' : 'left-5'}`} />
              </div>
              <span className="font-black text-white">
                {dryRun ? 'Preview Mode (no emails sent)' : 'Live Mode (emails will be sent)'}
              </span>
            </div>

            {!dryRun && (
              <div className="mb-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-5 py-4 text-sm text-yellow-200">
                Live mode will send real emails to all relevant leads. Make sure you are ready.
              </div>
            )}

            <button
              onClick={run}
              disabled={loading}
              className="rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {loading
                ? 'Processing...'
                : dryRun
                  ? `Preview ${leads.length} Leads`
                  : `Send to Relevant Leads`}
            </button>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            {[
              { label: 'Total Leads', value: summary.total, color: '' },
              { label: 'Relevant', value: summary.relevant, color: 'text-cyan-200' },
              { label: summary.dryRun ? 'Would Send' : 'Sent', value: summary.dryRun ? summary.relevant : summary.sent, color: 'text-emerald-200' },
              { label: 'Skipped', value: summary.skipped, color: '' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                <div className="text-sm text-white/50">{label}</div>
                <div className={`mt-2 text-4xl font-black ${color}`}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6">
            <h2 className="mb-6 text-2xl font-black">Results</h2>
            <div className="space-y-4">
              {results.map((result, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border p-5 ${
                    result.relevant
                      ? 'border-cyan-400/20 bg-cyan-400/[0.04]'
                      : 'border-white/10 bg-white/[0.02] opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-black text-white">{result.name}</div>
                      <div className="text-sm text-white/45">{result.company} · {result.email}</div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                      !result.relevant
                        ? 'border border-white/10 bg-white/5 text-white/40'
                        : result.sent
                          ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                          : 'border border-cyan-400/20 bg-cyan-400/10 text-cyan-300'
                    }`}>
                      {!result.relevant ? 'Skipped' : result.sent ? 'Sent' : 'Preview'}
                    </span>
                  </div>
                  {result.subject && (
                    <div className="mt-3">
                      <div className="mb-1 text-xs font-black uppercase tracking-[0.15em] text-white/30">Subject</div>
                      <div className="text-sm font-black text-white/70">{result.subject}</div>
                    </div>
                  )}
                  {result.preview && (
                    <div className="mt-3">
                      <div className="mb-1 text-xs font-black uppercase tracking-[0.15em] text-white/30">Preview</div>
                      <p className="text-sm leading-6 text-white/55">{result.preview}...</p>
                    </div>
                  )}
                  {result.error && (
                    <div className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-300">
                      {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
