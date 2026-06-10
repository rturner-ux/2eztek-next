'use client'

import { useRef, useState } from 'react'

type Customer = {
  id: string
  name: string
  email: string
  status: string
}

type ImportResult = {
  total: number
  matched: number
  imported: number
  skipped: number
  matchedNames: string[]
}

export default function ThumbthackCampaignPage() {
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [authError, setAuthError] = useState('')

  const [step, setStep] = useState<'import' | 'review' | 'done'>('import')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number; sentNames: string[] } | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function authenticate() {
    setAuthError('')
    const res = await fetch('/api/admin/square-import', {
      headers: { 'x-admin-password': password },
    })
    if (res.status === 401) {
      setAuthError('Incorrect password.')
      return
    }
    const data = await res.json()
    if (data.success) {
      setAuthorized(true)
      if (data.customers.length > 0) {
        setCustomers(data.customers)
        const ids = new Set<string>(data.customers.map((c: Customer) => c.id))
        setSelected(ids)
        setStep('review')
      }
    }
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    setImportResult(null)

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/admin/square-import', {
        method: 'POST',
        headers: { 'x-admin-password': password },
        body: form,
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)

      setImportResult(data)

      // Load the matched customers for review
      const custRes = await fetch('/api/admin/thumbtack-campaign', {
        headers: { 'x-admin-password': password },
      })
      const custData = await custRes.json()
      if (custData.success) {
        setCustomers(custData.customers)
        setSelected(new Set<string>(custData.customers.map((c: Customer) => c.id)))
      }

      setStep('review')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function toggleAll() {
    if (selected.size === customers.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(customers.map((c) => c.id)))
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function sendCampaign() {
    if (selected.size === 0) return
    if (!confirm(`Send thank-you campaign to ${selected.size} customer${selected.size !== 1 ? 's' : ''}?`)) return

    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/admin/thumbtack-campaign', {
        method: 'POST',
        headers: {
          'x-admin-password': password,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: [...selected] }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)

      setSendResult(data)
      setStep('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Send failed.')
    } finally {
      setSending(false)
    }
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050B14] text-white">
        <div className="w-full max-w-md space-y-5 rounded-[2rem] border border-white/10 bg-black/30 p-10 backdrop-blur-xl">
          <h1 className="text-3xl font-black">Thumbtack Campaign</h1>
          <p className="text-sm text-white/50">Sign in to import your Square customers and send the campaign.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && authenticate()}
            placeholder="Admin password"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60"
          />
          {authError && <p className="text-sm text-red-400">{authError}</p>}
          <button
            onClick={authenticate}
            className="w-full rounded-2xl bg-cyan-400 py-4 text-sm font-black uppercase tracking-[0.14em] text-black"
          >
            Sign In
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-black">Thumbtack Thank-You Campaign</h1>
        <p className="mt-2 text-white/50">
          Import your Square customer export. The system matches names against your 208 Thumbtack reviewers
          and queues a personal thank-you email to each match.
        </p>

        {/* Step indicators */}
        <div className="mt-8 flex gap-3">
          {(['import', 'review', 'done'] as const).map((s, i) => (
            <div
              key={s}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold ${
                step === s
                  ? 'bg-cyan-400 text-black'
                  : 'border border-white/15 bg-white/5 text-white/40'
              }`}
            >
              <span className="text-xs">{i + 1}</span>
              <span className="capitalize">{s === 'import' ? 'Import CSV' : s === 'review' ? 'Review Matches' : 'Done'}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Step 1: Import */}
        {step === 'import' && (
          <div className="mt-8 space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-black/25 p-8 backdrop-blur-xl">
              <h2 className="text-xl font-black">Step 1: Export from Square</h2>
              <ol className="mt-4 space-y-2 text-sm leading-7 text-white/65">
                <li>1. Go to <strong className="text-white">Square Dashboard</strong> squareup.com/dashboard</li>
                <li>2. Click <strong className="text-white">Customers</strong> in the left sidebar</li>
                <li>3. Click <strong className="text-white">Import / Export</strong> then <strong className="text-white">Export Customers</strong></li>
                <li>4. Download the CSV and upload it below</li>
              </ol>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/25 p-8 backdrop-blur-xl">
              <h2 className="text-xl font-black">Step 2: Upload CSV</h2>
              <p className="mt-2 text-sm text-white/50">
                The system will match names against your Thumbtack reviewers and only import those customers.
              </p>

              <label className="mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 px-6 py-10 text-center hover:border-cyan-400/40">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
                {uploading ? (
                  <span className="text-white/50">Parsing and matching...</span>
                ) : (
                  <>
                    <span className="text-4xl text-white/20">+</span>
                    <span className="text-sm text-white/50">Click to upload Square CSV export</span>
                  </>
                )}
              </label>

              {importResult && (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: 'Rows in CSV', value: importResult.total },
                    { label: 'Matched reviewers', value: importResult.matched, color: 'text-cyan-300' },
                    { label: 'Imported', value: importResult.imported, color: 'text-green-300' },
                    { label: 'Skipped', value: importResult.skipped },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                      <div className={`text-3xl font-black ${s.color || 'text-white'}`}>{s.value}</div>
                      <div className="mt-1 text-xs text-white/45">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {importResult && importResult.matchedNames.length > 0 && (
                <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                  <div className="mb-2 text-xs font-bold text-cyan-300">Matched names:</div>
                  <div className="flex flex-wrap gap-2">
                    {importResult.matchedNames.map((n) => (
                      <span key={n} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 'review' && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Review Matched Customers</h2>
                <p className="mt-1 text-sm text-white/50">
                  {customers.length} customers matched. {selected.size} selected for campaign.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={toggleAll}
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold hover:border-cyan-400/30"
                >
                  {selected.size === customers.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={sendCampaign}
                  disabled={selected.size === 0 || sending}
                  className="rounded-2xl bg-cyan-400 px-6 py-2.5 text-sm font-black uppercase tracking-[0.12em] text-black disabled:opacity-50"
                >
                  {sending ? 'Sending...' : `Send to ${selected.size}`}
                </button>
              </div>
            </div>

            {customers.length === 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-black/20 p-12 text-center text-white/40">
                No matched customers yet. Upload your Square CSV above.
                <button
                  onClick={() => setStep('import')}
                  className="mt-4 block mx-auto text-cyan-400 text-sm underline"
                >
                  Go back to import
                </button>
              </div>
            )}

            <div className="grid gap-3">
              {customers.map((c) => (
                <label
                  key={c.id}
                  className={`flex cursor-pointer items-center gap-5 rounded-2xl border p-5 transition ${
                    selected.has(c.id)
                      ? 'border-cyan-400/30 bg-cyan-400/5'
                      : 'border-white/10 bg-black/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggleOne(c.id)}
                    className="h-5 w-5 accent-cyan-400"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-black">{c.name}</div>
                    <div className="text-sm text-white/50">{c.email}</div>
                  </div>
                  {c.status === 'thumbtack-outreach' && (
                    <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-300">
                      Already sent
                    </span>
                  )}
                </label>
              ))}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/25 p-6 backdrop-blur-xl">
              <div className="text-sm font-bold text-white/70">Email preview</div>
              <div className="mt-3 space-y-1 text-sm leading-7 text-white/55">
                <div><strong className="text-white/80">Subject:</strong> [FirstName], thank you for being a 2EZ TEK customer</div>
                <div><strong className="text-white/80">Body:</strong> Personal thank-you, priority scheduling offer, referral ask, contact details. Signed by Robby Turner.</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 'done' && sendResult && (
          <div className="mt-8 space-y-6">
            <div className="rounded-[2rem] border border-green-500/20 bg-green-500/5 p-10 text-center">
              <div className="text-5xl font-black text-green-300">{sendResult.sent}</div>
              <div className="mt-2 text-white/70">emails sent successfully</div>
              {sendResult.failed > 0 && (
                <div className="mt-2 text-sm text-red-400">{sendResult.failed} failed</div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/25 p-6">
              <div className="mb-3 text-sm font-bold text-white/70">Sent to:</div>
              <div className="flex flex-wrap gap-2">
                {sendResult.sentNames.map((n) => (
                  <span key={n} className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs text-green-200">
                    {n}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-sm text-white/40">
              A summary has been sent to support@2eztek.com. Sent customers are marked as &quot;thumbtack-outreach&quot; and will not receive this campaign again.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
