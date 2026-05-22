// app/brands/page.tsx  ← server component, no 'use client'

import type { Metadata } from 'next'
import BrandsIndexClient from '@/app/brands/BrandsIndexClient'

export const metadata: Metadata = {
  title: 'Fitness Equipment Brands We Service | 2EZ TEK',
  description:
    'Browse all fitness equipment brands serviced by 2EZ TEK across Dallas Fort Worth. Life Fitness, Precor, Matrix, Technogym, Cybex, and more.',
  alternates: {
    canonical: 'https://2eztek.com/brands',
  },
  openGraph: {
    title: 'Fitness Equipment Brands We Service | 2EZ TEK',
    description:
      'All major fitness equipment brands repaired and maintained by 2EZ TEK across Dallas Fort Worth.',
    url: 'https://2eztek.com/brands',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

export default function BrandsPage() {
  return <BrandsIndexClient />
}
