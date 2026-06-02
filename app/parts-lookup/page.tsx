import type { Metadata } from 'next'
import PartsLookupClient from './PartsLookupClient'

export const metadata: Metadata = {
  title: 'Fitness Equipment Parts Lookup | 2EZ TEK Dallas Fort Worth',
  description: 'Identify fitness equipment parts by description or photo. AI-powered parts identification for treadmills, ellipticals, and commercial gym equipment in Dallas Fort Worth.',
}

export default function PartsLookupPage() {
  return <PartsLookupClient />
}
