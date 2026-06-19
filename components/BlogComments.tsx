'use client'

import { useState } from 'react'

type Comment = {
  id: string
  name: string
  comment: string
  created_at: string
}

type Props = {
  slug: string
  initialComments: Comment[]
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

export default function BlogComments({ slug, initialComments }: Props) {
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !comment.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/blog/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name: name.trim(), comment: comment.trim() }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="blog-comments" className="mt-12 border-t border-slate-200 pt-10">
      <h2 className="text-2xl font-black text-white">Responses</h2>

      {/* Existing approved comments */}
      {initialComments.length > 0 && (
        <div className="mt-6 space-y-6">
          {initialComments.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-xs font-black text-black">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{c.name}</div>
                  <div className="text-xs text-white/40">{timeAgo(c.created_at)}</div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/70">{c.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <div className="mt-8">
        {submitted ? (
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6 text-center">
            <div className="text-lg font-black text-white">Thank you for your response.</div>
            <p className="mt-2 text-sm text-white/55">Your comment will appear after review.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="text-sm font-bold text-white/60 uppercase tracking-widest">What are your thoughts?</div>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none"
            />
            <textarea
              placeholder="Write a response..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none resize-none"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-cyan-400 px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Publish response'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
