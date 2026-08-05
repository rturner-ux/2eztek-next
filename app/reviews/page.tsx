// app/reviews/page.tsx
import type { Metadata } from 'next'
import ReviewsClient from './ReviewsClient'

const siteUrl = 'https://www.2eztek.com'

export const metadata: Metadata = {
  title: 'Customer Reviews | Fitness Equipment Repair Dallas',
  description:
    'Read customer reviews for 2EZ TEK fitness equipment repair, treadmill repair, gym equipment assembly, preventive maintenance, and commercial gym service across Dallas Fort Worth.',
  alternates: { canonical: `${siteUrl}/reviews` },
  openGraph: {
    title: 'Customer Reviews | 2EZ TEK',
    description:
      'Real customer experiences from homeowners, gyms, apartments, and commercial fitness facilities across Dallas Fort Worth.',
    url: `${siteUrl}/reviews`,
    siteName: '2EZ TEK',
    type: 'website',
  },
}

export default function ReviewsPage() {
  return <ReviewsClient />
}
