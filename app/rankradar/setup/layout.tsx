import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RankRadar Setup',
  robots: { index: false, follow: false },
}

export default function RankRadarSetupLayout({ children }: { children: React.ReactNode }) {
  return children
}
