import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RankRadar Dashboard',
  robots: { index: false, follow: false },
}

export default function RankRadarDashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
