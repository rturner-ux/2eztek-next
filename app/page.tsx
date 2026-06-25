// app/page.tsx  ← replaces your current app/page.tsx

import type { Metadata } from 'next'
import HomePageClient from '@/app/HomePageClient'

export const metadata: Metadata = {
  title: 'Fitness Equipment Repair Dallas Fort Worth | 2EZ TEK',
  description:
    'Same-day onsite repair for treadmills, ellipticals, exercise bikes, and cable machines across DFW. 500+ five-star reviews. Repairs from $100. No haul-away, we come to you.',
  alternates: {
    canonical: 'https://www.2eztek.com',
  },
  openGraph: {
    title: 'Fitness Equipment Repair Dallas Fort Worth | 2EZ TEK',
    description:
      'Same-day onsite repair for treadmills, ellipticals, exercise bikes, and cable machines across DFW. 500+ five-star reviews. Repairs from $100.',
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
