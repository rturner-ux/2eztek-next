import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brands We Service | Fitness Equipment Repair DFW',
  description:
    'Brands 2EZ TEK repairs and services across Dallas Fort Worth, including NordicTrack, ProForm, Peloton, Bowflex, Life Fitness, Precor, Matrix, Cybex, Technogym, StairMaster, and more.',
  alternates: { canonical: 'https://www.2eztek.com/brands' },
  openGraph: {
    title: 'Brands We Service | 2EZ TEK Fitness Equipment Repair',
    description:
      'Onsite repair and maintenance for major residential and commercial fitness equipment brands across DFW.',
    url: 'https://www.2eztek.com/brands',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return children
}
