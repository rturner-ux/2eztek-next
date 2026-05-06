import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
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

const businessPhone = '+19728077232'
const businessEmail = 'info@2eztek.com'

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://2eztek.com/#localbusiness',
  name: '2EZ TEK',
  url: 'https://2eztek.com',
  telephone: businessPhone,
  email: businessEmail,
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
      telephone: businessPhone,
      contactType: 'customer support',
      email: businessEmail,
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
  email: businessEmail,
  telephone: businessPhone,
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

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CRMMV275CX"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-CRMMV275CX');
          `}
        </Script>

        <Script id="posthog" strategy="afterInteractive">
          {`
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister reset get_distinct_id".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init("YOUR_POSTHOG_KEY_HERE", {
              api_host: "https://us.i.posthog.com",
              person_profiles: "identified_only",
              capture_pageview: true
            });
          `}
        </Script>
      </body>
    </html>
  )
}