import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Used Fitness Equipment for Sale | Dallas Fort Worth',
  description:
    'Buy and sell used fitness equipment across Dallas Fort Worth. Treadmills, ellipticals, home gyms, benches, and commercial equipment listed through the 2EZ TEK marketplace.',
  alternates: { canonical: 'https://www.2eztek.com/equipment-for-sale' },
  openGraph: {
    title: 'Used Fitness Equipment for Sale | 2EZ TEK Marketplace',
    description:
      'Browse and list used treadmills, ellipticals, home gyms, and commercial fitness equipment across DFW.',
    url: 'https://www.2eztek.com/equipment-for-sale',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

export default function EquipmentForSaleLayout({ children }: { children: React.ReactNode }) {
  return children
}
