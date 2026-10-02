import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RankRadar | Local Search Rank Tracking',
  description:
    'RankRadar tracks how your business ranks in local search, monitors competitors, and reports movement over time. Plans start at $49 per month with a free trial.',
  alternates: { canonical: 'https://www.2eztek.com/rankradar' },
  openGraph: {
    title: 'RankRadar | Local Search Rank Tracking by 2EZ TEK',
    description:
      'Track local search rankings, watch competitors, and see movement over time.',
    url: 'https://www.2eztek.com/rankradar',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

export default function RankRadarLayout({ children }: { children: React.ReactNode }) {
  return children
}
