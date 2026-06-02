'use client'

import { useState } from 'react'

const BRAND_DOMAINS: Record<string, string> = {
  'life-fitness':    'lifefitness.com',
  'precor':          'precor.com',
  'matrix':          'matrixfitness.com',
  'technogym':       'technogym.com',
  'stairmaster':     'stairmaster.com',
  'nordictrack':     'nordictrack.com',
  'proform':         'proform.com',
  'bowflex':         'bowflex.com',
  'peloton':         'onepeloton.com',
  'true-fitness':    'truefitness.com',
  'schwinn':         'schwinnfitness.com',
  'nautilus':        'nautilus.com',
  'octane-fitness':  'octanefitness.com',
  'star-trac':       'startrac.com',
  'freemotion':      'freemotionfitness.com',
  'hammer-strength': 'hammerstrength.com',
  'sportsart':       'sportsartfitness.com',
  'marcy':           'marcy.com',
  'bodycraft':       'bodycraftfitness.com',
  'cybex':           'lifefitness.com', // Cybex is owned by Life Fitness
}

function initials(name: string) {
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function BrandLogo({
  slug,
  name,
  size = 'md',
}: {
  slug: string
  name: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const [failed, setFailed] = useState(false)
  const domain = BRAND_DOMAINS[slug]
  const dims = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-16 w-16' : 'h-12 w-12'
  const imgDims = size === 'sm' ? 24 : size === 'lg' ? 48 : 32

  return (
    <span className={`flex ${dims} items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xs font-black tracking-[0.08em] text-cyan-200 flex-shrink-0`}>
      {!failed && domain ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
          alt=""
          width={imgDims}
          height={imgDims}
          loading="lazy"
          onError={() => setFailed(true)}
          className="object-contain"
          style={{ width: imgDims, height: imgDims }}
        />
      ) : (
        initials(name)
      )}
    </span>
  )
}
