// app/page.tsx  ← replaces your current app/page.tsx

import type { Metadata } from 'next'
import HomePageClient from '@/app/HomePageClient'

export const metadata: Metadata = {
  title: 'Fitness Equipment Repair Dallas Fort Worth | 2EZ TEK',
  description:
    '2EZ TEK provides professional treadmill repair, elliptical repair, gym equipment assembly, and commercial fitness equipment maintenance across Dallas Fort Worth.',
  alternates: {
    canonical: 'https://www.2eztek.com',
  },
  openGraph: {
    title: 'Fitness Equipment Repair Dallas Fort Worth | 2EZ TEK',
    description:
      'Professional treadmill repair, elliptical repair, gym assembly, and commercial maintenance across DFW. Book 2EZ TEK today.',
    url: 'https://www.2eztek.com',
    siteName: '2EZ TEK',
    images: [{ url: 'https://www.2eztek.com/images/Tour_11.webp', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fitness Equipment Repair Dallas Fort Worth | 2EZ TEK',
    description:
      'Professional treadmill repair, elliptical repair, gym assembly, and commercial maintenance across DFW.',
    images: ['https://www.2eztek.com/images/Tour_11.webp'],
  },
}

export default function Page() {
  return <HomePageClient />
}
