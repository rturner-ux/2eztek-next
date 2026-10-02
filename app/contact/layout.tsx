import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Fitness Equipment Repair Dallas Fort Worth',
  description:
    'Contact 2EZ TEK for fitness equipment repair across Dallas Fort Worth. Call, text, or send a service request for treadmills, ellipticals, exercise bikes, and strength equipment.',
  alternates: { canonical: 'https://www.2eztek.com/contact' },
  openGraph: {
    title: 'Contact 2EZ TEK | Fitness Equipment Repair Dallas Fort Worth',
    description:
      'Reach 2EZ TEK for onsite fitness equipment repair, assembly, and commercial gym maintenance across DFW.',
    url: 'https://www.2eztek.com/contact',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
