import type { Metadata } from 'next'
import RepairOrReplaceClient from './RepairOrReplaceClient'

export const metadata: Metadata = {
  title: 'Repair or Replace Fitness Equipment? AI Calculator | 2EZ TEK',
  description: 'Not sure whether to repair or replace your treadmill, elliptical, or gym equipment? Get a free AI-powered recommendation from 2EZ TEK, Dallas Fort Worth fitness equipment experts.',
  alternates: {
    canonical: 'https://www.2eztek.com/tools/repair-or-replace',
  },
  openGraph: {
    title: 'Repair or Replace Fitness Equipment? AI Calculator | 2EZ TEK',
    description: 'Enter your equipment details and get an instant scored recommendation from our AI, trained on real fitness equipment service data across Dallas Fort Worth.',
    url: 'https://www.2eztek.com/tools/repair-or-replace',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

export default function Page() {
  return <RepairOrReplaceClient />
}
