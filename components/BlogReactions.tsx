'use client'

import { useState, useEffect } from 'react'

type Props = {
  slug: string
  initialLikes: number
  initialDislikes: number
}

export default function BlogReactions({ slug, initialLikes, initialDislikes }: Props) {
  function onRespond() {
    document.getElementById('blog-comments')?.scrollIntoView({ behavior: 'smooth' })
  }
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [voted, setVoted] = useState<'like' | 'dislike' | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(`blog-vote-${slug}`)
    if (stored === 'like' || stored === 'dislike') setVoted(stored)
  }, [slug])

  async function vote(type: 'like' | 'dislike') {
    if (voted || loading) return
    setLoading(true)
    if (type === 'like') setLikes((l) => l + 1)
    else setDislikes((d) => d + 1)
    setVoted(type)
    localStorage.setItem(`blog-vote-${slug}`, type)
    try {
      await fetch('/api/blog/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type }),
      })
    } catch {
      if (type === 'like') setLikes((l) => l - 1)
      else setDislikes((d) => d - 1)
      setVoted(null)
      localStorage.removeItem(`blog-vote-${slug}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1 border-b border-t border-slate-200 py-3">
      {/* Thumbs up */}
      <button
        onClick={() => vote('like')}
        disabled={!!voted}
        className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
          voted === 'like'
            ? 'bg-cyan-50 text-cyan-600'
            : voted
            ? 'cursor-not-allowed text-slate-300'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
        }`}
        aria-label="Like"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill={voted === 'like' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
        {likes > 0 && <span>{likes}</span>}
      </button>

      {/* Thumbs down */}
      <button
        onClick={() => vote('dislike')}
        disabled={!!voted}
        className={`flex items-center rounded-full p-2 text-sm transition-colors ${
          voted === 'dislike'
            ? 'bg-slate-100 text-slate-700'
            : voted
            ? 'cursor-not-allowed text-slate-300'
            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
        }`}
        aria-label="Dislike"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill={voted === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
        </svg>
      </button>

      <div className="mx-2 h-5 w-px bg-slate-200" />

      {/* Start a conversation */}
      <button
        onClick={onRespond}
        className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>Respond</span>
      </button>
    </div>
  )
}
