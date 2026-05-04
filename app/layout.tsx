import type { Metadata, Viewport } from 'next'
import './globals.css'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://2eztek.com'),
  title: {
    default: '2EZ TEK | Fitness Equipment Repair & Assembly',
    template: '%s | 2EZ TEK',
  },
  description:
    '2EZ TEK provides professional fitness equipment repair, assembly, installation, onsite service, and commercial gym maintenance across Dallas Fort Worth.',
  keywords: [
    'fitness equipment repair Dallas',
    'treadmill repair Dallas',
    'gym equipment assembly Dallas',
    'commercial gym maintenance Dallas',
    'exercise equipment repair Dallas Fort Worth',
    'onsite fitness equipment service',
    '2EZ TEK',
  ],
  applicationName: '2EZ TEK',
  authors: [{ name: '2EZ TEK' }],
  creator: '2EZ TEK',
  publisher: '2EZ TEK',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '2EZ TEK | Fitness Equipment Repair & Assembly',
    description:
      'Professional fitness equipment repair, assembly, installation, onsite service, and commercial gym maintenance across Dallas Fort Worth.',
    url: 'https://2eztek.com',
    siteName: '2EZ TEK',
    type: 'website',
    locale: 'en_US',
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
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#050B14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://2eztek.com/#localbusiness',
  name: '2EZ TEK',
  url: 'https://2eztek.com',
  telephone: '+19728077232',
  email: 'support@2eztek.com',
  image: 'https://2eztek.com/logo.png',
  logo: 'https://2eztek.com/logo.png',
  description:
    '2EZ TEK provides fitness equipment repair, assembly, installation, onsite diagnostics, and preventive maintenance services for residential and commercial clients.',
  priceRange: '$$',
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
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+19728077232',
      contactType: 'customer support',
      email: 'support@2eztek.com',
      areaServed: 'US',
      availableLanguage: 'English',
    },
    {
      '@type': 'ContactPoint',
      contactType: 'general inquiries',
      email: 'info@2eztek.com',
      areaServed: 'US',
      availableLanguage: 'English',
    },
    {
      '@type': 'ContactPoint',
      contactType: 'careers',
      email: 'jobs@2eztek.com',
      areaServed: 'US',
      availableLanguage: 'English',
    },
  ],
  serviceType: [
    'Fitness Equipment Repair',
    'Treadmill Repair',
    'Exercise Equipment Assembly',
    'Commercial Gym Maintenance',
    'Gym Equipment Installation',
    'Preventive Maintenance',
    'Onsite Fitness Equipment Service',
  ],
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://2eztek.com/#organization',
  name: '2EZ TEK',
  url: 'https://2eztek.com',
  logo: 'https://2eztek.com/logo.png',
  email: 'support@2eztek.com',
  telephone: '+19728077232',
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://2eztek.com/#website',
  name: '2EZ TEK',
  url: 'https://2eztek.com',
  publisher: {
    '@id': 'https://2eztek.com/#organization',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://2eztek.com/#service',
  name: 'Fitness Equipment Repair and Assembly',
  provider: {
    '@id': 'https://2eztek.com/#localbusiness',
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
  const schemas = [
    localBusinessSchema,
    organizationSchema,
    websiteSchema,
    serviceSchema,
  ]

  return (
    <html lang="en">
      <body className="bg-[#050B14] text-white antialiased">
        {schemas.map((schema) => (
          <script
            key={schema['@id'] || schema['@type']}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schema),
            }}
          />
        ))}

        <SiteHeader />

        {children}

        <SiteFooter />
      </body>
    </html>
  )
}