// app/about-2ez-tek/page.tsx
// Server component — exports metadata, renders client component

import type { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About 2EZ TEK | Fitness Equipment Repair & Assembly in DFW',
  description:
    'Learn about 2EZ TEK, a Dallas Fort Worth fitness equipment repair, assembly, installation, and maintenance company serving residential and commercial clients.',
  alternates: {
    canonical: 'https://2eztek.com/about-2ez-tek',
  },
  openGraph: {
    title: 'About 2EZ TEK | Fitness Equipment Repair & Assembly in DFW',
    description:
      'Professional fitness equipment repair, assembly, and commercial maintenance across Dallas Fort Worth. Powered by SmartGymOps.',
    url: 'https://2eztek.com/about-2ez-tek',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

export default function About2EZTEKPage() {
  return <AboutClient />
}
