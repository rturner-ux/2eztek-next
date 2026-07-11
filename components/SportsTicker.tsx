'use client'

import { useCallback, useEffect, useState } from 'react'

type ScoreItem = {
  league: string
  home: string
  homeScore: string
  away: string
  awayScore: string
  status: 'live' | 'final' | 'scheduled'
  detail: string
}

const DISMISS_KEY = 'sports-ticker-dismissed'

export default function SportsTicker() {
  const [items, setItems] = useState<ScoreItem[]>([])
  const [dismissed, setDismissed] = useState(true)

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/sports/scores')
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.items)) setItems(data.items)
    } catch {
      // silently skip a failed refresh, the next interval tick will retry
    }
  }, [])

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) !== '1') setDismissed(false)
    fetchScores()
    const t = setInterval(fetchScores, 60000)
    return () => clearInterval(t)
  }, [fetchScores])

  function handleDismiss() {
    setDismissed(true)
    sessionStorage.setItem(DISMISS_KEY, '1')
  }

  if (dismissed || items.length === 0) return null

  const loop = [...items, ...items]
  const durationSeconds = Math.max(60, items.length * 8)

  return (
    <div className="fixed left-0 right-0 top-[72px] z-[97] flex h-9 items-center overflow-hidden border-b border-white/[0.08] bg-[#0b0c0e]">
      <div className="group flex flex-1 overflow-hidden">
        <div
          className="ticker-track flex flex-shrink-0 items-center gap-10 whitespace-nowrap pr-10 group-hover:[animation-play-state:paused]"
          style={{ animationDuration: `${durationSeconds}s` }}
        >
          {loop.map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-[11px] font-medium">
              <span
                className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                  item.status === 'live'
                    ? 'bg-red-500'
                    : item.status === 'scheduled'
                    ? 'bg-cyan-400'
                    : 'bg-white/25'
                }`}
              />
              <span className="uppercase tracking-[0.1em] text-white/35">{item.league}</span>
              <span className="text-white/85">
                {item.away} {item.awayScore}
                <span className="mx-1 text-white/25">–</span>
                {item.homeScore} {item.home}
              </span>
              <span className="text-white/35">{item.detail}</span>
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss sports ticker"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-l border-white/[0.08] text-white/40 transition-colors hover:text-white"
      >
        ×
      </button>

      <style jsx>{`
        .ticker-track {
          animation-name: ticker-scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          padding-left: 100%;
        }
        @keyframes ticker-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}
