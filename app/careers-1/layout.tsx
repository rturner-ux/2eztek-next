import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers | Fitness Equipment Technician Jobs in DFW',
  description:
    'Join 2EZ TEK as a fitness equipment technician in Dallas Fort Worth. See open positions, what the work involves, and apply online.',
  alternates: { canonical: 'https://www.2eztek.com/careers-1' },
  openGraph: {
    title: 'Careers at 2EZ TEK | Fitness Equipment Technician Jobs, DFW',
    description:
      'Open technician roles at a veteran-owned fitness equipment repair company serving Dallas Fort Worth.',
    url: 'https://www.2eztek.com/careers-1',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children
}
