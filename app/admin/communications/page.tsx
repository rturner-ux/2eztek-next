'use client'

import { useCallback, useEffect, useState } from 'react'

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  equipment_type: string | null
  brand_model: string | null
  appointment_date: string | null
  appointment_time: string | null
  job_status: string | null
  technician_name: string | null
  parts_status: string | null
  comm_sequence_step: number | null
  last_comm_at: string | null
  created_at: string
}

type CommLog = {
  id: string
  channel: 'email' | 'sms'
  trigger_type: string
  subject: string | null
  body: string
  sent_at: string
  status: 'sent' | 'failed'
  sent_by: string
}

type TriggerDef = {
  id: string
  label: string
  icon: string
  color: string
  fields?: { key: string; label: string; placeholder?: string }[]
}

const TRIGGERS: TriggerDef[] = [
  { id: 'day_before_reminder', label: 'Day Before Reminder', icon: '📅', color: 'bg-blue-50 border-blue-200 text-blue-800', fields: [{ key: 'appointment_time', label: 'Appt Time', placeholder: '9:00 AM' }, { key: 'technician_name', label: 'Technician', placeholder: 'Mike' }] },
  { id: 'morning_of', label: 'Morning of Appt', icon: '☀️', color: 'bg-cyan-50 border-cyan-200 text-cyan-800', fields: [{ key: 'technician_name', label: 'Technician', placeholder: 'Mike' }] },
  { id: 'tech_30_min_out', label: 'Tech 30 Min Out', icon: '🚗', color: 'bg-green-50 border-green-200 text-green-800', fields: [{ key: 'technician_name', label: 'Technician', placeholder: 'Mike' }] },
  { id: 'post_visit_followup', label: 'Post-Visit Follow-Up', icon: '✅', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  { id: 'parts_ordered', label: 'Parts Ordered', icon: '📦', color: 'bg-indigo-50 border-indigo-200 text-indigo-800', fields: [{ key: 'parts_info', label: 'Parts Info', placeholder: 'Drive belt + motor capacitor' }, { key: 'eta', label: 'ETA', placeholder: '5-7 business days' }] },
  { id: 'parts_delayed', label: 'Parts Delayed', icon: '⏳', color: 'bg-amber-50 border-amber-200 text-amber-800', fields: [{ key: 'parts_info', label: 'Parts Info', placeholder: 'NordicTrack drive belt backordered' }, { key: 'eta', label: 'New ETA', placeholder: '2 additional weeks' }] },
  { id: 'running_late', label: 'Running Late', icon: '⚠️', color: 'bg-orange-50 border-orange-200 text-orange-800', fields: [{ key: 'new_eta', label: 'New Arrival Time', placeholder: '2:30 PM' }, { key: 'technician_name', label: 'Technician', placeholder: 'Mike' }] },
  { id: 'reschedule_request', label: 'Reschedule', icon: '🔄', color: 'bg-rose-50 border-rose-200 text-rose-800', fields: [{ key: 'reason', label: 'Reason', placeholder: 'Technician scheduling conflict' }] },
  { id: 'general_update', label: 'General Update', icon: '💬', color: 'bg-slate-50 border-slate-200 text-slate-800', fields: [{ key: 'message', label: 'Message context', placeholder: 'Part arrived, scheduling repair for next week' }] },
]

const JOB_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600',
  confirmed: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-cyan-100 text-cyan-700',
  parts_ordered: 'bg-indigo-100 text-indigo-700',
  parts_delayed: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
}

const JOB_STATUS_OPTIONS = ['pending', 'confirmed', 'in_progress', 'parts_ordered', 'parts_delayed', 'completed', 'cancelled']

function timeAgo(str: string) {
  const diff = Date.now() - new Date(str).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function formatApptDate(str: string | null) {
  if (!str) return null
  return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function CommunicationsPage() {
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [commLog, setCommLog] = useState<CommLog[]>([])
  const [logLoading, setLogLoading] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [triggerFields, setTriggerFields] = useState<Record<string, Record<string, string>>>({})
  const [editingStatus, setEditingStatus] = useState<string | null>(null)
  const [techName, setTechName] = useState('')
  const [apptDate, setApptDate] = useState('')
  const [apptTime, setApptTime] = useState('')

  const headers = { 'x-admin-password': password }

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/customers', { headers })
      const json = await res.json()
      if (json.success) setCustomers(json.customers || [])
    } finally {
      setLoading(false)
    }
  }, [password])

  const loadCommLog = useCallback(async (customerId: string) => {
    setLogLoading(true)
    try {
      const res = await fetch(`/api/admin/communications?customerId=${customerId}`, { headers })
      const json = await res.json()
      if (json.success) setCommLog(json.comms || [])
    } finally {
      setLogLoading(false)
    }
  }, [password])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/customers', { headers: { 'x-admin-password': password } })
    if (res.ok) {
      setAuthorized(true)
      loadCustomers()
    }
  }

  const selectCustomer = (id: string) => {
    setSelectedId(id)
    setCommLog([])
    setSendResult(null)
    loadCommLog(id)
    const c = customers.find(x => x.id === id)
    setTechName(c?.technician_name || '')
    setApptDate(c?.appointment_date || '')
    setApptTime(c?.appointment_time || '')
    setEditingStatus(c?.job_status || 'pending')
  }

  const sendComm = async (triggerId: string) => {
    if (!selectedId) return
    setSending(triggerId)
    setSendResult(null)
    try {
      const extra = triggerFields[triggerId] || {}
      const customer = customers.find(c => c.id === selectedId)
      const res = await fetch('/api/admin/communications', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedId,
          trigger: triggerId,
          extra,
          jobStatus: editingStatus || undefined,
          technicianName: techName || undefined,
          appointmentDate: apptDate || undefined,
          appointmentTime: apptTime || undefined,
        }),
      })
      const json = await res.json()
      setSendResult({ ok: json.success, msg: json.success ? `Sent via ${json.channel}` : (json.error || 'Failed') })
      if (json.success) loadCommLog(selectedId)
    } finally {
      setSending(null)
    }
  }

  const saveStatusFields = async () => {
    if (!selectedId) return
    const res = await fetch('/api/admin/communications', {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: selectedId,
        job_status: editingStatus || undefined,
        technician_name: techName || undefined,
        appointment_date: apptDate || undefined,
        appointment_time: apptTime || undefined,
      }),
    })
    const json = await res.json()
    if (json.success) {
      setCustomers(prev => prev.map(c => c.id === selectedId
        ? { ...c, job_status: editingStatus, technician_name: techName, appointment_date: apptDate, appointment_time: apptTime }
        : c
      ))
      setSendResult({ ok: true, msg: 'Customer record saved' })
    }
  }

  const selectedCustomer = customers.find(c => c.id === selectedId) || null

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.brand_model || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || c.job_status === statusFilter
    return matchSearch && matchStatus
  })

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white rounded-xl border border-slate-200 shadow p-8 w-80">
          <h1 className="text-xl font-black text-slate-950 mb-6">Communication Hub</h1>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 mb-4"
          />
          <button type="submit" className="w-full bg-slate-950 text-white font-bold py-3 rounded-lg text-sm hover:bg-slate-800 transition-colors">
            Sign In
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-950">Communication Hub</h1>
            <p className="text-sm text-slate-500 mt-1">Keep every customer informed at every stage</p>
          </div>
          <button onClick={loadCustomers} className="text-sm text-slate-500 hover:text-slate-950 font-medium border border-slate-200 rounded-lg px-4 py-2 bg-white hover:border-slate-300 transition-colors">
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Customer list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-2">
              <input
                placeholder="Search customers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 bg-white"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All</option>
                {JOB_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="text-sm text-slate-400 py-8 text-center">Loading...</div>
            ) : (
              <div className="space-y-2">
                {filtered.map(c => (
                  <button
                    key={c.id}
                    onClick={() => selectCustomer(c.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedId === c.id
                        ? 'border-cyan-400 bg-cyan-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{c.name}</p>
                        <p className="text-xs text-slate-400 truncate">{c.brand_model || c.equipment_type || 'Equipment not specified'}</p>
                        {c.appointment_date && (
                          <p className="text-xs text-cyan-600 font-medium mt-0.5">{formatApptDate(c.appointment_date)}{c.appointment_time ? ` at ${c.appointment_time}` : ''}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {c.job_status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${JOB_STATUS_COLORS[c.job_status] || 'bg-slate-100 text-slate-600'}`}>
                            {c.job_status.replace(/_/g, ' ')}
                          </span>
                        )}
                        {c.last_comm_at && (
                          <span className="text-xs text-slate-400">{timeAgo(c.last_comm_at)}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">No customers match your search.</p>
                )}
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="lg:col-span-3">
            {!selectedCustomer ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <p className="text-slate-400 text-sm">Select a customer to manage their communications.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Customer header */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-950">{selectedCustomer.name}</h2>
                      <p className="text-sm text-slate-500">{selectedCustomer.email} &middot; {selectedCustomer.phone}</p>
                      <p className="text-sm text-slate-600 mt-1">{selectedCustomer.brand_model || selectedCustomer.equipment_type || 'Equipment not specified'}</p>
                    </div>
                    {sendResult && (
                      <div className={`text-xs px-3 py-2 rounded-lg font-medium ${sendResult.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {sendResult.msg}
                      </div>
                    )}
                  </div>

                  {/* Quick fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Job Status</label>
                      <select
                        value={editingStatus || ''}
                        onChange={e => setEditingStatus(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-cyan-400 bg-white"
                      >
                        {JOB_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Technician</label>
                      <input
                        value={techName}
                        onChange={e => setTechName(e.target.value)}
                        placeholder="Tech name"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Appointment Date</label>
                      <input
                        type="date"
                        value={apptDate}
                        onChange={e => setApptDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Appointment Time</label>
                      <input
                        value={apptTime}
                        onChange={e => setApptTime(e.target.value)}
                        placeholder="e.g. 9:00 AM"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                  </div>
                  <button
                    onClick={saveStatusFields}
                    className="mt-3 text-xs font-bold text-slate-600 hover:text-slate-950 border border-slate-200 rounded-lg px-4 py-2 hover:border-slate-300 transition-colors bg-slate-50"
                  >
                    Save Fields
                  </button>
                </div>

                {/* Send triggers */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-black text-slate-950 mb-4">Send Communication</h3>
                  <div className="space-y-3">
                    {TRIGGERS.map(t => (
                      <div key={t.id} className={`rounded-xl border p-4 ${t.color}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold">{t.icon} {t.label}</span>
                          <button
                            onClick={() => sendComm(t.id)}
                            disabled={sending === t.id}
                            className="text-xs font-black bg-slate-950 text-white px-4 py-1.5 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                          >
                            {sending === t.id ? 'Sending...' : 'Send'}
                          </button>
                        </div>
                        {t.fields && (
                          <div className="grid grid-cols-2 gap-2">
                            {t.fields.map(f => (
                              <input
                                key={f.key}
                                placeholder={f.placeholder || f.label}
                                value={triggerFields[t.id]?.[f.key] || ''}
                                onChange={e => setTriggerFields(prev => ({
                                  ...prev,
                                  [t.id]: { ...(prev[t.id] || {}), [f.key]: e.target.value },
                                }))}
                                className="border border-white/60 bg-white/80 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-200 text-slate-800 placeholder-slate-400"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comm log */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-black text-slate-950 mb-4">Communication History</h3>
                  {logLoading ? (
                    <p className="text-sm text-slate-400">Loading...</p>
                  ) : commLog.length === 0 ? (
                    <p className="text-sm text-slate-400">No messages sent yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {commLog.map(log => (
                        <div key={log.id} className={`rounded-lg border p-3 ${log.status === 'failed' ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${log.channel === 'sms' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {log.channel.toUpperCase()}
                              </span>
                              <span className="text-xs font-medium text-slate-600">{log.trigger_type.replace(/_/g, ' ')}</span>
                              {log.sent_by === 'admin' && <span className="text-xs text-slate-400">manual</span>}
                            </div>
                            <span className="text-xs text-slate-400">{timeAgo(log.sent_at)}</span>
                          </div>
                          {log.subject && <p className="text-xs font-bold text-slate-700 mb-1">{log.subject}</p>}
                          <p className="text-xs text-slate-600 line-clamp-2">{log.body}</p>
                          {log.status === 'failed' && log.status && (
                            <p className="text-xs text-red-600 mt-1 font-medium">Failed to send</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
