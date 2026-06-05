'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

export default function BeforeAfterSlider({
  before,
  after,
  alt = '',
  initialPosition = 45,
}: {
  before: string
  after: string
  alt?: string
  initialPosition?: number
}) {
  const [position, setPosition] = useState(initialPosition)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(4, Math.min(clientX - rect.left, rect.width - 4))
    setPosition((x / rect.width) * 100)
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    e.preventDefault()
  }, [])

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragging.current) updatePosition(e.clientX)
    },
    [updatePosition]
  )

  const stopDrag = useCallback(() => {
    dragging.current = false
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragging.current = true
    updatePosition(e.touches[0].clientX)
  }, [updatePosition])

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (dragging.current) updatePosition(e.touches[0].clientX)
    },
    [updatePosition]
  )

  useEffect(() => {
    const up = () => { dragging.current = false }
    window.addEventListener('mouseup', up)
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchend', up)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-col-resize select-none overflow-hidden"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={stopDrag}
      aria-label={`Before and after comparison: ${alt}`}
      role="img"
    >
      {/* After (base layer) */}
      <img
        src={after}
        alt={`After: ${alt}`}
        draggable={false}
        className="h-full w-full object-cover"
      />

      {/* Before (clipped layer) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        aria-hidden="true"
      >
        <img
          src={before}
          alt={`Before: ${alt}`}
          draggable={false}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Divider line */}
      <div
        className="pointer-events-none absolute inset-y-0 w-[2px] bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        aria-hidden="true"
      >
        {/* Drag handle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-4 3 4 3M16 9l4 3-4 3" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div
        className="pointer-events-none absolute left-3 top-3 rounded-lg bg-black/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-sm"
        aria-hidden="true"
      >
        Before
      </div>
      <div
        className="pointer-events-none absolute right-3 top-3 rounded-lg bg-cyan-400/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-black backdrop-blur-sm"
        aria-hidden="true"
      >
        After
      </div>
    </div>
  )
}
