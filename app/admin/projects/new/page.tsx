'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const emptyForm = {
  name: '',
  project_type: 'repair',
  job_source: 'direct',
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  site_address: '',
  dispatch_company: '',
  dispatch_job_number: '',
  dispatch_contact: '',
  dispatch_billing_email: '',
  dispatch_tech_support: '',
  equipment_type: '',
  equipment_brand: '',
  equipment_model: '',
  issue_description: '',
  status: 'new',
  priority: 'medium',
  quote_amount: '',
  technician: '',
  scheduled_date: '',
  pod_required: false,
  notes: '',
  internal_notes: '',
}

const input = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'

export default function NewProjectPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [aiPasting, setAiPasting] = useState(false)
  const [rawWorkOrder, setRawWorkOrder] = useState('')
  const [parsing, setParsing] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('blogAdminPassword')
    if (stored) { setPassword(stored); setAuthorized(true) }
  }, [])

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function parseWorkOrder() {
    if (!rawWorkOrder.trim()) return
    setParsing(true)
    setError('')
    try {
      const res = await fetch('/api/admin/projects/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ text: rawWorkOrder }),
      })
      const data = await res.json()
      if (data.success && data.parsed) {
        setForm(prev => ({ ...prev, ...data.parsed }))
        setAiPasting(false)
        setRawWorkOrder('')
      } else {
        throw new Error(data.error || 'Could not parse work order')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Parse failed')
    } finally {
      setParsing(false)
    }
  }

  async function save() {
    if (!form.name.trim()) { setError('Job name is required'); return }
    setSaving(true)
    setError('')
    try {
      const body: Record<string, unknown> = { ...form }
      if (form.quote_amount) body.quote_amount = parseFloat(form.quote_amount)
      else delete body.quote_amount

      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to create')
      router.push(`/admin/projects/${data.project.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!authorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Job</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">Admin Password</h2>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { localStorage.setItem('blogAdminPassword', password); setAuthorized(true) } }}
            placeholder="Password" autoFocus
            className="mt-5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 placeholder:text-slate-400" />
          <button onClick={() => { localStorage.setItem('blogAdminPassword', password); setAuthorized(true) }}
            className="mt-4 w-full rounded-lg bg-slate-950 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">Unlock</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Job</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Create Project</h2>
        </div>
        <button
          onClick={() => setAiPasting(v => !v)}
          className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-700 hover:bg-cyan-100"
        >
          {aiPasting ? 'Cancel AI Parse' : 'Paste Work Order'}
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* AI Work Order Parser */}
      {aiPasting && (
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-cyan-700">AI Work Order Parser</p>
          <p className="text-sm text-slate-600">Paste the full work order email. AI will fill in the form fields automatically.</p>
          <textarea
            value={rawWorkOrder}
            onChange={e => setRawWorkOrder(e.target.value)}
            placeholder="Paste the work order email here..."
            rows={8}
            className={`${input} resize-none`}
          />
          <button
            onClick={parseWorkOrder}
            disabled={parsing || !rawWorkOrder.trim()}
            className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white disabled:opacity-50 hover:bg-slate-800"
          >
            {parsing ? 'Parsing...' : 'Parse and Fill Form'}
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        {/* Job type */}
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Job Name *">
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. April Johnson - FSR90 Install" className={input} />
          </Field>
          <Field label="Job Type">
            <select value={form.project_type} onChange={e => set('project_type', e.target.value)} className={input}>
              <option value="repair">Repair</option>
              <option value="install">Install / Assembly</option>
              <option value="dispatch">Dispatch Job</option>
              <option value="maintenance">Preventive Maintenance</option>
            </select>
          </Field>
          <Field label="Source">
            <select value={form.job_source} onChange={e => set('job_source', e.target.value)} className={input}>
              <option value="direct">Direct (customer called/booked)</option>
              <option value="dispatch">Dispatch (third-party company)</option>
            </select>
          </Field>
        </div>

        {/* Customer */}
        <Divider label="Customer" />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Customer Name">
            <input value={form.customer_name} onChange={e => set('customer_name', e.target.value)} placeholder="Full name" className={input} />
          </Field>
          <Field label="Phone">
            <input value={form.customer_phone} onChange={e => set('customer_phone', e.target.value)} placeholder="(555) 555-5555" className={input} />
          </Field>
          <Field label="Email">
            <input value={form.customer_email} onChange={e => set('customer_email', e.target.value)} placeholder="customer@email.com" className={input} />
          </Field>
          <Field label="Service Address">
            <input value={form.site_address} onChange={e => set('site_address', e.target.value)} placeholder="123 Main St, Dallas TX 75201" className={input} />
          </Field>
        </div>

        {/* Dispatch (conditional) */}
        {form.job_source === 'dispatch' && (
          <>
            <Divider label="Dispatch Details" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Dispatch Company">
                <input value={form.dispatch_company} onChange={e => set('dispatch_company', e.target.value)} placeholder="Fitness Superstore" className={input} />
              </Field>
              <Field label="Job Number">
                <input value={form.dispatch_job_number} onChange={e => set('dispatch_job_number', e.target.value)} placeholder="48682" className={input} />
              </Field>
              <Field label="Contact Name">
                <input value={form.dispatch_contact} onChange={e => set('dispatch_contact', e.target.value)} placeholder="Rio Digal" className={input} />
              </Field>
              <Field label="Billing Email">
                <input value={form.dispatch_billing_email} onChange={e => set('dispatch_billing_email', e.target.value)} placeholder="service.billing@company.com" className={input} />
              </Field>
              <Field label="Tech Support Line">
                <input value={form.dispatch_tech_support} onChange={e => set('dispatch_tech_support', e.target.value)} placeholder="(925) 215-2927" className={input} />
              </Field>
              <Field label="POD Required">
                <div className="flex items-center gap-3 pt-1">
                  <button type="button"
                    onClick={() => set('pod_required', !form.pod_required)}
                    className={`rounded-xl px-4 py-2 text-sm font-black transition ${form.pod_required ? 'bg-cyan-500 text-slate-950' : 'border border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    {form.pod_required ? 'Yes - POD Required' : 'No POD Required'}
                  </button>
                </div>
              </Field>
            </div>
          </>
        )}

        {/* Equipment */}
        <Divider label="Equipment" />
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Equipment Type">
            <input value={form.equipment_type} onChange={e => set('equipment_type', e.target.value)} placeholder="Treadmill" className={input} />
          </Field>
          <Field label="Brand">
            <input value={form.equipment_brand} onChange={e => set('equipment_brand', e.target.value)} placeholder="NordicTrack" className={input} />
          </Field>
          <Field label="Model">
            <input value={form.equipment_model} onChange={e => set('equipment_model', e.target.value)} placeholder="X22i" className={input} />
          </Field>
        </div>
        <Field label="Issue / Job Description">
          <textarea value={form.issue_description} onChange={e => set('issue_description', e.target.value)}
            rows={3} placeholder="Describe the issue or what needs to be done"
            className={`${input} resize-none`} />
        </Field>

        {/* Scheduling + Money */}
        <Divider label="Scheduling and Money" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Field label="Status">
            <select value={form.status} onChange={e => set('status', e.target.value)} className={input}>
              <option value="new">New</option>
              <option value="quoted">Quoted</option>
              <option value="parts_ordered">Parts Ordered</option>
              <option value="parts_received">Parts Received</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="punch_list">Punch List</option>
              <option value="complete">Complete</option>
              <option value="invoiced">Invoiced</option>
              <option value="paid">Paid</option>
            </select>
          </Field>
          <Field label="Priority">
            <select value={form.priority} onChange={e => set('priority', e.target.value)} className={input}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </Field>
          <Field label="Quote Amount ($)">
            <input type="number" value={form.quote_amount} onChange={e => set('quote_amount', e.target.value)}
              placeholder="150.00" className={input} />
          </Field>
          <Field label="Scheduled Date">
            <input type="date" value={form.scheduled_date} onChange={e => set('scheduled_date', e.target.value)} className={input} />
          </Field>
        </div>
        <Field label="Technician">
          <input value={form.technician} onChange={e => set('technician', e.target.value)} placeholder="Robby Turner" className={`${input} max-w-xs`} />
        </Field>

        {/* Notes */}
        <Divider label="Notes" />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Customer-Facing Notes">
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              rows={3} placeholder="Notes visible on invoice or report"
              className={`${input} resize-none`} />
          </Field>
          <Field label="Internal Notes">
            <textarea value={form.internal_notes} onChange={e => set('internal_notes', e.target.value)}
              rows={3} placeholder="Internal only: access notes, warnings, etc."
              className={`${input} resize-none`} />
          </Field>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => router.push('/admin/projects/list')}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:border-slate-300 hover:text-slate-900">
          Cancel
        </button>
        <button onClick={save} disabled={saving}
          className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-50">
          {saving ? 'Creating...' : 'Create Job'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-400">{label}</label>
      {children}
    </div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <div className="flex-1 border-t border-slate-200" />
    </div>
  )
}
