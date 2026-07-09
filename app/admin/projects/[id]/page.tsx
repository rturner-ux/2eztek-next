'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Project = {
  id: string
  name: string
  project_type: string
  job_source: string
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  site_address: string | null
  dispatch_company: string | null
  dispatch_job_number: string | null
  dispatch_contact: string | null
  dispatch_billing_email: string | null
  dispatch_tech_support: string | null
  equipment_type: string | null
  equipment_brand: string | null
  equipment_model: string | null
  issue_description: string | null
  status: string
  priority: string
  quote_amount: number | null
  invoice_amount: number | null
  payment_status: string
  payment_method: string | null
  parts_status: string
  parts_notes: string | null
  technician: string | null
  scheduled_date: string | null
  completion_date: string | null
  pod_required: boolean
  pod_signed: boolean
  pod_url: string | null
  notes: string | null
  internal_notes: string | null
  created_at: string
  updated_at: string
}

type Task = {
  id: string
  project_id: string
  title: string
  description: string | null
  status: string
  priority: string
  assigned_to: string | null
  due_date: string | null
  sort_order: number
}

const STATUS_LABEL: Record<string, string> = {
  new: 'New', quoted: 'Quoted', parts_ordered: 'Parts Ordered',
  parts_received: 'Parts Received', scheduled: 'Scheduled', in_progress: 'In Progress',
  punch_list: 'Punch List', complete: 'Complete', invoiced: 'Invoiced', paid: 'Paid',
}
const STATUS_COLOR: Record<string, string> = {
  new: 'border-slate-300 bg-slate-100 text-slate-600',
  quoted: 'border-blue-200 bg-blue-50 text-blue-700',
  parts_ordered: 'border-amber-200 bg-amber-50 text-amber-700',
  parts_received: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  scheduled: 'border-purple-200 bg-purple-50 text-purple-700',
  in_progress: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  punch_list: 'border-orange-200 bg-orange-50 text-orange-700',
  complete: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  invoiced: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  paid: 'border-green-200 bg-green-50 text-green-700',
}
const TASK_STATUS_OPTIONS = ['todo', 'in_progress', 'done', 'blocked']
const TASK_STATUS_COLOR: Record<string, string> = {
  todo: 'border-slate-300 text-slate-600',
  in_progress: 'border-cyan-300 text-cyan-700',
  done: 'border-emerald-300 text-emerald-700',
  blocked: 'border-red-300 text-red-700',
}

function fmt$(n: number | null) {
  if (n == null) return '--'
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params?.id || '')

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Project>>({})
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', assigned_to: '', due_date: '' })
  const [addingTask, setAddingTask] = useState(false)
  const [taskSaving, setTaskSaving] = useState(false)
  const [invoiceAmount, setInvoiceAmount] = useState('')
  const [showInvoice, setShowInvoice] = useState(false)

  const load = useCallback(async (pw: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { headers: { 'x-admin-password': pw } })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Unauthorized')
      setProject(data.project)
      setTasks(data.tasks || [])
      setAuthorized(true)
      localStorage.setItem('blogAdminPassword', pw)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
      setAuthorized(false)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const stored = localStorage.getItem('blogAdminPassword')
    if (stored) { setPassword(stored); load(stored) }
    else setLoading(false)
  }, [load])

  async function updateField(fields: Partial<Project>) {
    setSaving(true)
    setSuccess('')
    setError('')
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify(fields),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setProject(data.project)
      setSuccess('Saved')
      setTimeout(() => setSuccess(''), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setProject(data.project)
      setEditing(false)
      setSuccess('Saved')
      setTimeout(() => setSuccess(''), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function addTask() {
    if (!taskForm.title.trim()) return
    setTaskSaving(true)
    try {
      const res = await fetch(`/api/admin/projects/${id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ ...taskForm, sort_order: tasks.length }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setTasks(prev => [...prev, data.task])
      setTaskForm({ title: '', description: '', status: 'todo', priority: 'medium', assigned_to: '', due_date: '' })
      setAddingTask(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add task')
    } finally {
      setTaskSaving(false)
    }
  }

  async function updateTaskStatus(taskId: string, status: string) {
    try {
      const res = await fetch(`/api/admin/projects/${id}/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ task_id: taskId, status }),
      })
      const data = await res.json()
      if (data.success) setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
    } catch { /* silent */ }
  }

  async function deleteTask(taskId: string) {
    try {
      await fetch(`/api/admin/projects/${id}/tasks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ task_id: taskId }),
      })
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch { /* silent */ }
  }

  async function markInvoiced() {
    const amt = parseFloat(invoiceAmount)
    if (!amt) { setError('Enter invoice amount'); return }
    await updateField({ status: 'invoiced', invoice_amount: amt, payment_status: 'invoiced' })
    setShowInvoice(false)
    setInvoiceAmount('')
  }

  async function markPaid() {
    await updateField({ status: 'paid', payment_status: 'paid' })
  }

  if (!authorized && !loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Job Detail</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">Admin Password</h2>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(password)}
            placeholder="Password" autoFocus
            className="mt-5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 placeholder:text-slate-400" />
          <button onClick={() => load(password)} className="mt-4 w-full rounded-lg bg-slate-950 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">Unlock</button>
        </div>
      </div>
    )
  }

  if (loading) return <div className="py-20 text-center text-slate-400">Loading...</div>
  if (!project) return <div className="py-20 text-center text-red-600">Project not found.</div>

  const completedTasks = tasks.filter(t => t.status === 'done').length
  const pct = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100)

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link href="/admin/projects/list" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700">
              All Jobs
            </Link>
            <h1 className="mt-2 text-2xl font-black text-slate-950">{project.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase ${STATUS_COLOR[project.status]}`}>
                {STATUS_LABEL[project.status]}
              </span>
              <span className="text-xs text-slate-500 capitalize">{project.priority} priority</span>
              <span className="text-xs text-slate-400 capitalize">{project.project_type}</span>
              {project.job_source === 'dispatch' && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-black text-amber-700">DISPATCH</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={project.status}
              onChange={e => updateField({ status: e.target.value })}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none disabled:opacity-50"
            >
              {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <button onClick={() => { setEditing(v => !v); setEditForm(project) }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
              {editing ? 'Cancel Edit' : 'Edit'}
            </button>
            {project.status === 'complete' && project.payment_status === 'unpaid' && (
              <button onClick={() => setShowInvoice(true)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-black text-white hover:bg-indigo-500">
                Mark Invoiced
              </button>
            )}
            {project.payment_status === 'invoiced' && (
              <button onClick={markPaid}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-500">
                Mark Paid
              </button>
            )}
            {project.pod_required && !project.pod_signed && (
              <button onClick={() => updateField({ pod_signed: true })}
                className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-black text-orange-700 hover:bg-orange-100">
                Mark POD Signed
              </button>
            )}
          </div>
        </div>

        {success && <p className="mt-3 text-sm text-emerald-600">{success}</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {/* Invoice modal */}
        {showInvoice && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
            <p className="text-sm font-bold text-slate-900">Invoice Amount ($)</p>
            <input type="number" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)}
              placeholder={String(project.quote_amount || '')}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none w-36 focus:border-cyan-400" />
            <button onClick={markInvoiced} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-black text-white">Confirm</button>
            <button onClick={() => setShowInvoice(false)} className="text-sm text-slate-500 hover:text-slate-900">Cancel</button>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Quote" value={fmt$(project.quote_amount)} />
        <Metric label="Invoice" value={fmt$(project.invoice_amount)} />
        <Metric label="Tasks Done" value={`${completedTasks}/${tasks.length}`} />
        <Metric label="Progress" value={`${pct}%`} />
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        {/* Left: details */}
        <div className="space-y-5">
          {/* Edit form */}
          {editing ? (
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-cyan-700">Editing Job Details</p>
              <div className="grid gap-3 md:grid-cols-2">
                <EF label="Job Name"><input value={editForm.name || ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className={inputCls} /></EF>
                <EF label="Customer"><input value={editForm.customer_name || ''} onChange={e => setEditForm(p => ({ ...p, customer_name: e.target.value }))} className={inputCls} /></EF>
                <EF label="Phone"><input value={editForm.customer_phone || ''} onChange={e => setEditForm(p => ({ ...p, customer_phone: e.target.value }))} className={inputCls} /></EF>
                <EF label="Email"><input value={editForm.customer_email || ''} onChange={e => setEditForm(p => ({ ...p, customer_email: e.target.value }))} className={inputCls} /></EF>
                <EF label="Address" className="md:col-span-2"><input value={editForm.site_address || ''} onChange={e => setEditForm(p => ({ ...p, site_address: e.target.value }))} className={inputCls} /></EF>
                <EF label="Equipment Brand"><input value={editForm.equipment_brand || ''} onChange={e => setEditForm(p => ({ ...p, equipment_brand: e.target.value }))} className={inputCls} /></EF>
                <EF label="Equipment Model"><input value={editForm.equipment_model || ''} onChange={e => setEditForm(p => ({ ...p, equipment_model: e.target.value }))} className={inputCls} /></EF>
                <EF label="Technician"><input value={editForm.technician || ''} onChange={e => setEditForm(p => ({ ...p, technician: e.target.value }))} className={inputCls} /></EF>
                <EF label="Scheduled Date"><input type="date" value={editForm.scheduled_date || ''} onChange={e => setEditForm(p => ({ ...p, scheduled_date: e.target.value }))} className={inputCls} /></EF>
                <EF label="Quote ($)"><input type="number" value={editForm.quote_amount ?? ''} onChange={e => setEditForm(p => ({ ...p, quote_amount: parseFloat(e.target.value) || null }))} className={inputCls} /></EF>
                <EF label="Parts Status">
                  <select value={editForm.parts_status || 'none'} onChange={e => setEditForm(p => ({ ...p, parts_status: e.target.value }))} className={inputCls}>
                    <option value="none">None</option>
                    <option value="ordered">Ordered</option>
                    <option value="received">Received</option>
                    <option value="installed">Installed</option>
                  </select>
                </EF>
                {project.job_source === 'dispatch' && (
                  <>
                    <EF label="Dispatch Company"><input value={editForm.dispatch_company || ''} onChange={e => setEditForm(p => ({ ...p, dispatch_company: e.target.value }))} className={inputCls} /></EF>
                    <EF label="Job Number"><input value={editForm.dispatch_job_number || ''} onChange={e => setEditForm(p => ({ ...p, dispatch_job_number: e.target.value }))} className={inputCls} /></EF>
                    <EF label="Billing Email"><input value={editForm.dispatch_billing_email || ''} onChange={e => setEditForm(p => ({ ...p, dispatch_billing_email: e.target.value }))} className={inputCls} /></EF>
                  </>
                )}
                <EF label="Notes" className="md:col-span-2"><textarea value={editForm.notes || ''} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} rows={2} className={`${inputCls} resize-none`} /></EF>
                <EF label="Internal Notes" className="md:col-span-2"><textarea value={editForm.internal_notes || ''} onChange={e => setEditForm(p => ({ ...p, internal_notes: e.target.value }))} rows={2} className={`${inputCls} resize-none`} /></EF>
              </div>
              <div className="flex gap-3">
                <button onClick={saveEdit} disabled={saving} className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white disabled:opacity-50 hover:bg-slate-800">{saving ? 'Saving...' : 'Save Changes'}</button>
                <button onClick={() => setEditing(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900">Cancel</button>
              </div>
            </div>
          ) : (
            /* Info cards */
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Job Details</p>
              <div className="grid gap-3 md:grid-cols-2">
                <Info label="Customer" value={project.customer_name} />
                <Info label="Phone" value={project.customer_phone} link={project.customer_phone ? `tel:${project.customer_phone}` : undefined} />
                <Info label="Email" value={project.customer_email} link={project.customer_email ? `mailto:${project.customer_email}` : undefined} />
                <Info label="Address" value={project.site_address} />
                <Info label="Equipment" value={[project.equipment_brand, project.equipment_model, project.equipment_type].filter(Boolean).join(' ')} />
                <Info label="Technician" value={project.technician} />
                <Info label="Scheduled" value={project.scheduled_date} />
                <Info label="Parts" value={project.parts_status !== 'none' ? project.parts_status : null} />
              </div>
              {project.issue_description && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">Issue Description</p>
                  <p className="text-sm text-slate-700">{project.issue_description}</p>
                </div>
              )}
              {project.notes && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">Notes</p>
                  <p className="text-sm text-slate-700">{project.notes}</p>
                </div>
              )}
              {project.internal_notes && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-amber-600">Internal Notes</p>
                  <p className="text-sm text-slate-700">{project.internal_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Dispatch card */}
          {project.job_source === 'dispatch' && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-amber-700">Dispatch Info</p>
              <div className="grid gap-3 md:grid-cols-2">
                <Info label="Company" value={project.dispatch_company} />
                <Info label="Job Number" value={project.dispatch_job_number} />
                <Info label="Contact" value={project.dispatch_contact} />
                <Info label="Tech Support" value={project.dispatch_tech_support} link={project.dispatch_tech_support ? `tel:${project.dispatch_tech_support}` : undefined} />
                <Info label="Billing Email" value={project.dispatch_billing_email} link={project.dispatch_billing_email ? `mailto:${project.dispatch_billing_email}` : undefined} />
                <Info label="POD" value={project.pod_required ? (project.pod_signed ? 'Signed' : 'Required - Not Signed') : 'Not Required'} />
              </div>
              {project.dispatch_billing_email && project.status === 'complete' && (
                <a
                  href={`mailto:${project.dispatch_billing_email}?subject=Invoice - Job ${project.dispatch_job_number}&body=Hi,%0A%0AJob ${project.dispatch_job_number} has been completed. Please find our invoice attached.%0A%0AJob: ${project.name}%0ACustomer: ${project.customer_name}%0AAmount: ${fmt$(project.invoice_amount || project.quote_amount)}%0A%0AThank you,%0ARobby Turner%0A2EZ TEK%0A(972) 807-7232`}
                  className="inline-block rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-black text-amber-700 hover:bg-amber-50"
                >
                  Email Invoice to {project.dispatch_company}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right: tasks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Checklist</p>
            <button onClick={() => setAddingTask(v => !v)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 hover:border-cyan-200 hover:text-cyan-700">
              {addingTask ? 'Cancel' : '+ Task'}
            </button>
          </div>

          {addingTask && (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 space-y-2">
              <input value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Task title" className={`${inputCls} text-xs`} />
              <textarea value={taskForm.description} onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Notes (optional)" rows={2} className={`${inputCls} resize-none text-xs`} />
              <div className="grid grid-cols-2 gap-2">
                <select value={taskForm.priority} onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value }))} className={`${inputCls} text-xs`}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <input type="date" value={taskForm.due_date} onChange={e => setTaskForm(p => ({ ...p, due_date: e.target.value }))} className={`${inputCls} text-xs`} />
              </div>
              <button onClick={addTask} disabled={taskSaving || !taskForm.title.trim()}
                className="w-full rounded-xl bg-slate-950 py-2 text-xs font-black text-white disabled:opacity-50 hover:bg-slate-800">
                {taskSaving ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="group rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start gap-2">
                  <button onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                    className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded border transition ${task.status === 'done' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'}`}>
                    {task.status === 'done' && <svg viewBox="0 0 12 12" fill="none" className="h-full w-full p-0.5"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold leading-snug ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-950'}`}>{task.title}</p>
                    {task.description && <p className="mt-0.5 text-xs text-slate-500">{task.description}</p>}
                    <div className="mt-1 flex flex-wrap gap-2">
                      <select value={task.status} onChange={e => updateTaskStatus(task.id, e.target.value)}
                        className={`rounded-lg border px-2 py-0.5 text-[10px] font-black bg-white outline-none ${TASK_STATUS_COLOR[task.status]}`}>
                        {TASK_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                      {task.due_date && <span className="text-[10px] text-slate-400">{task.due_date}</span>}
                    </div>
                  </div>
                  <button onClick={() => deleteTask(task.id)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-xs text-slate-300 hover:text-red-500 transition">
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {tasks.length === 0 && !addingTask && (
              <p className="py-6 text-center text-xs text-slate-400">No tasks yet. Add a checklist for this job.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1.5 text-xl font-black text-slate-950">{value}</p>
    </div>
  )
}

function Info({ label, value, link }: { label: string; value: string | null | undefined; link?: string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      {link ? (
        <a href={link} className="mt-0.5 block text-sm font-bold text-cyan-600 hover:text-cyan-500">{value}</a>
      ) : (
        <p className="mt-0.5 text-sm font-bold text-slate-900">{value}</p>
      )}
    </div>
  )
}

function EF({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</label>
      {children}
    </div>
  )
}
