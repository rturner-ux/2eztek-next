import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://2eztek.com'),
  title: {
    default: '2EZ TEK | Fitness Equipment Repair & Assembly',
    template: '%s | 2EZ TEK',
  },
  description:
    '2EZ TEK provides professional fitness equipment repair, assembly, installation, and commercial gym maintenance across Dallas Fort Worth.',
  keywords: [
    'fitness equipment repair Dallas',
    'treadmill repair Dallas',
    'gym equipment assembly',
    'commercial gym maintenance',
    'exercise equipment repair',
    '2EZ TEK',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '2EZ TEK | Fitness Equipment Repair & Assembly',
    description:
      'Professional fitness equipment repair, assembly, installation, and commercial gym maintenance across Dallas Fort Worth.',
    url: 'https://2eztek.com',
    siteName: '2EZ TEK',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: '2EZ TEK Fitness Equipment Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '2EZ TEK | Fitness Equipment Repair & Assembly',
    description:
      'Professional fitness equipment repair, assembly, installation, and commercial gym maintenance across Dallas Fort Worth.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: '2EZ TEK',
  url: 'https://2eztek.com',
  telephone: '+19728077232',
  email: 'rturner@2eztek.com',
  image: 'https://2eztek.com/logo.png',
  description:
    '2EZ TEK provides fitness equipment repair, assembly, installation, and preventive maintenance services for residential and commercial clients.',
  areaServed: [
    'Dallas',
    'Fort Worth',
    'Arlington',
    'Plano',
    'Frisco',
    'McKinney',
    'Denton',
    'Garland',
    'Irving',
    'Dallas Fort Worth',
  ],
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'TX',
    addressCountry: 'US',
  },
  serviceType: [
    'Fitness Equipment Repair',
    'Treadmill Repair',
    'Exercise Equipment Assembly',
    'Commercial Gym Maintenance',
    'Gym Equipment Installation',
    'Preventive Maintenance',
  ],
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '2EZ TEK',
  url: 'https://2eztek.com',
  logo: 'https://2eztek.com/logo.png',
  email: 'rturner@2eztek.com',
  telephone: '+19728077232',
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Fitness Equipment Repair and Assembly',
  provider: {
    '@type': 'LocalBusiness',
    name: '2EZ TEK',
    url: 'https://2eztek.com',
    telephone: '+19728077232',
  },
  areaServed: {
    '@type': 'Place',
    name: 'Dallas Fort Worth, Texas',
  },
  serviceType: [
    'Treadmill Repair',
    'Gym Equipment Repair',
    'Fitness Equipment Assembly',
    'Commercial Gym Maintenance',
    'Onsite Fitness Equipment Service',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceSchema),
          }}
        />

        {children}
      </body>
    </html>
  )
}