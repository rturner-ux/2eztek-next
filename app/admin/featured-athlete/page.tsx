'use client'

import { useState, useEffect } from 'react'

type Athlete = {
  id: string
  slug: string
  athlete_name: string
  tagline: string | null
  location: string | null
  gym_type: string
  gym_name: string | null
  content: string
  equipment_used: string | null
  workout_style: string | null
  quote: string | null
  hero_image_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  tiktok_url: string | null
  youtube_url: string | null
  featured_date: string
  published: boolean
}

const BLANK: Partial<Athlete> = {
  athlete_name: '',
  tagline: '',
  location: '',
  gym_type: 'home_gym',
  gym_name: '',
  content: '',
  equipment_used: '',
  workout_style: '',
  quote: '',
  hero_image_url: '',
  instagram_url: '',
  facebook_url: '',
  tiktok_url: '',
  youtube_url: '',
  featured_date: new Date().toISOString().slice(0, 10),
  published: false,
}

export default function AdminFeaturedAthletePage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [form, setForm] = useState<Partial<Athlete>>(BLANK)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [view, setView] = useState<'list' | 'form'>('list')

  useEffect(() => {
    const saved = localStorage.getItem('blogAdminPassword')
    if (saved) { setPassword(saved); setAuthed(true); load(saved) }
  }, [])

  async function load(pw = password) {
    const res = await fetch('/api/admin/featured-athlete', {
      headers: { 'x-admin-password': pw },
    })
    if (res.ok) {
      const d = await res.json()
      setAthletes(d.athletes ?? [])
    }
  }

  function login() {
    localStorage.setItem('blogAdminPassword', password)
    setAuthed(true)
    load()
  }

  function startNew() {
    setForm(BLANK)
    setEditing(null)
    setMsg('')
    setView('form')
  }

  function startEdit(a: Athlete) {
    setForm(a)
    setEditing(a.id)
    setMsg('')
    setView('form')
  }

  async function save() {
    setSaving(true)
    setMsg('')
    try {
      const isEdit = !!editing
      const res = await fetch('/api/admin/featured-athlete', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify(isEdit ? { ...form, id: editing } : form),
      })
      const d = await res.json()
      if (d.error) { setMsg('Error: ' + d.error) }
      else {
        setMsg(isEdit ? 'Saved!' : 'Published!')
        load()
        setView('list')
      }
    } catch (e: any) {
      setMsg('Error: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(a: Athlete) {
    await fetch('/api/admin/featured-athlete', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id: a.id, published: !a.published }),
    })
    load()
  }

  async function deleteAthlete(id: string) {
    if (!confirm('Delete this featured athlete?')) return
    await fetch(`/api/admin/featured-athlete?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password },
    })
    load()
  }

  const set = (k: keyof Athlete, v: any) => setForm(f => ({ ...f, [k]: v }))

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-black text-white mb-6 text-center">Admin Login</h1>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60 mb-4"
          />
          <button onClick={login} className="w-full rounded-full bg-cyan-400 py-3 font-black text-black hover:bg-cyan-300">
            Enter
          </button>
        </div>
      </div>
    )
  }

  if (view === 'form') {
    return (
      <div className="min-h-screen bg-[#050B14] px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black text-white">{editing ? 'Edit Athlete' : 'New Featured Athlete'}</h1>
            <button onClick={() => setView('list')} className="text-sm text-slate-400 hover:text-white">← Back</button>
          </div>

          <div className="space-y-5">
            {/* Basic info */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-cyan-400">Athlete Info</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Athlete Name *</label>
                  <input value={form.athlete_name ?? ''} onChange={e => set('athlete_name', e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Location</label>
                  <input value={form.location ?? ''} onChange={e => set('location', e.target.value)}
                    placeholder="Dallas, TX"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Tagline</label>
                <input value={form.tagline ?? ''} onChange={e => set('tagline', e.target.value)}
                  placeholder="e.g. 'Built a world-class garage gym on a teacher's salary'"
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Gym Type</label>
                  <select value={form.gym_type ?? 'home_gym'} onChange={e => set('gym_type', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50">
                    <option value="home_gym">🏠 Home Gym</option>
                    <option value="commercial_gym">🏢 Commercial Gym</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Gym Name (optional)</label>
                  <input value={form.gym_name ?? ''} onChange={e => set('gym_name', e.target.value)}
                    placeholder="Gold's Gym Plano"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Featured Date (Week of)</label>
                  <input type="date" value={form.featured_date ?? ''} onChange={e => set('featured_date', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Hero Photo URL</label>
                  <input value={form.hero_image_url ?? ''} onChange={e => set('hero_image_url', e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50" />
                </div>
              </div>
            </div>

            {/* Article */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-cyan-400">Article</h2>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Pull Quote (displayed prominently)</label>
                <textarea value={form.quote ?? ''} onChange={e => set('quote', e.target.value)}
                  rows={2} placeholder="Their most inspiring quote..."
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Article Content * (HTML supported)</label>
                <textarea value={form.content ?? ''} onChange={e => set('content', e.target.value)}
                  rows={16} placeholder="Write the full article here. Use <h2>, <p>, <strong>, <ul><li> tags for formatting..."
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 resize-y font-mono" />
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-cyan-400">Sidebar Details</h2>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Equipment Used</label>
                <textarea value={form.equipment_used ?? ''} onChange={e => set('equipment_used', e.target.value)}
                  rows={3} placeholder="Rogue rack, Assault bike, NordicTrack treadmill..."
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Training Style</label>
                <textarea value={form.workout_style ?? ''} onChange={e => set('workout_style', e.target.value)}
                  rows={3} placeholder="5/3/1 powerlifting program, 6 days/week..."
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 resize-none" />
              </div>
            </div>

            {/* Social */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-cyan-400">Social Media</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { key: 'instagram_url', label: '📸 Instagram URL' },
                  { key: 'tiktok_url',    label: '🎵 TikTok URL' },
                  { key: 'youtube_url',   label: '▶️ YouTube URL' },
                  { key: 'facebook_url',  label: '👤 Facebook URL' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-400 mb-1">{label}</label>
                    <input value={(form as any)[key] ?? ''} onChange={e => set(key as keyof Athlete, e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50" />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {msg && <p className="text-sm font-bold text-cyan-400">{msg}</p>}
            <div className="flex gap-3 items-center">
              <button onClick={() => { set('published', true); setTimeout(save, 50) }}
                disabled={saving}
                className="rounded-full bg-cyan-400 px-8 py-3 text-sm font-black text-black hover:bg-cyan-300 disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Save & Publish' : 'Publish Now'}
              </button>
              <button onClick={() => { set('published', false); setTimeout(save, 50) }}
                disabled={saving}
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-slate-300 hover:bg-white/5 disabled:opacity-50">
                Save as Draft
              </button>
              <button onClick={() => setView('list')} className="text-sm text-slate-500 hover:text-white ml-auto">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050B14] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Featured Athlete</h1>
            <p className="text-slate-500 text-sm mt-1">{athletes.length} total features</p>
          </div>
          <button onClick={startNew}
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-black text-black hover:bg-cyan-300">
            + New Feature
          </button>
        </div>

        {msg && <p className="mb-6 text-sm font-bold text-cyan-400">{msg}</p>}

        {athletes.length === 0 ? (
          <div className="text-center rounded-2xl border border-white/10 bg-white/5 p-16">
            <p className="text-4xl mb-4">🏆</p>
            <h2 className="text-xl font-black text-white">No features yet</h2>
            <p className="text-slate-400 mt-2 mb-6">Create your first featured athlete article.</p>
            <button onClick={startNew} className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-black text-black hover:bg-cyan-300">
              Write First Feature →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {athletes.map(a => (
              <div key={a.id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                {a.hero_image_url ? (
                  <img src={a.hero_image_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 text-2xl">🏋️</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-white">{a.athlete_name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${a.published ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                      {a.published ? 'Live' : 'Draft'}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                      {a.gym_type === 'home_gym' ? '🏠 Home' : '🏢 Commercial'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 truncate mt-0.5">{a.tagline || a.location || 'No tagline'}</p>
                  <p className="text-xs text-slate-600 mt-0.5">Week of {a.featured_date}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {a.published && (
                    <a href={`/featured-athlete/${a.slug}`} target="_blank"
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white">
                      View
                    </a>
                  )}
                  <button onClick={() => togglePublish(a)}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white">
                    {a.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => startEdit(a)}
                    className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-3 py-1.5 text-xs font-bold text-cyan-400 hover:bg-cyan-400/20">
                    Edit
                  </button>
                  <button onClick={() => deleteAthlete(a.id)}
                    className="rounded-full border border-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/10">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
