// app/smartgymops-features/page.tsx
import type { Metadata } from 'next'
import SmartGymOpsClient from './SmartGymOpsClient'

export const metadata: Metadata = {
  title: 'SmartGymOps Features | 2EZ TEK',
  description:
    'Explore SmartGymOps features including AI diagnostics, GPS technician tracking, project management, QR reporting, service requests, maintenance history, and commercial gym operations tools.',
  alternates: {
    canonical: 'https://www.2eztek.com/smartgymops-features',
  },
  openGraph: {
    title: 'SmartGymOps Features | 2EZ TEK',
    description:
      'The operating system for fitness equipment service. AI repair support, GPS tracking, QR reporting, and maintenance plans.',
    url: 'https://www.2eztek.com/smartgymops-features',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

export default function SmartGymOpsFeaturesPage() {
  return <SmartGymOpsClient />
}
