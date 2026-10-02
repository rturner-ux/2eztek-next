import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Service Areas | Fitness Equipment Repair Across DFW',
  description:
    'Cities 2EZ TEK covers for fitness equipment repair, including Dallas, Fort Worth, Plano, Frisco, Irving, Arlington, Richardson, McKinney, Garland, Mesquite, Carrollton, and Addison.',
  alternates: { canonical: 'https://www.2eztek.com/areas' },
  openGraph: {
    title: 'Service Areas | 2EZ TEK Fitness Equipment Repair',
    description:
      'Onsite fitness equipment repair across the Dallas Fort Worth metroplex. Find your city and book a technician.',
    url: 'https://www.2eztek.com/areas',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

export default function AreasLayout({ children }: { children: React.ReactNode }) {
  return children
}
