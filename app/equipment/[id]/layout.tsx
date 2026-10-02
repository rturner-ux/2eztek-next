import type { Metadata } from 'next'

// Per-unit service records reached by QR code. These carry customer details and
// must never enter a search index.
export const metadata: Metadata = {
  title: 'Equipment Record',
  robots: { index: false, follow: false },
}

export default function EquipmentRecordLayout({ children }: { children: React.ReactNode }) {
  return children
}
