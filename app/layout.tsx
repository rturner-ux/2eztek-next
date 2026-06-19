import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import BookingModalProvider from '@/components/BookingModalProvider'
import LeadCapturePopup from '@/components/LeadCapturePopup'



const siteUrl = 'https://www.2eztek.com'
const businessName = '2EZ TEK'
const businessPhone = '+19728077232'
const businessPhoneDisplay = '(972) 807-7232'
const businessEmail = 'info@2eztek.com'
const facebookAppId = process.env.FACEBOOK_APP_ID

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  verification: {
    google: '867Jt85yY3YjXl4s8_4DRD6rKP1A2kLIyE-CsZg5cjA',
  },
  title: {
    default:
      'Fitness Equipment Repair Dallas | Treadmill Repair & Gym Assembly | 2EZ TEK',
    template: '%s | 2EZ TEK',
  },
  description:
    '2EZ TEK provides professional fitness equipment repair in Dallas Fort Worth, including treadmill repair, elliptical repair, exercise bike repair, gym equipment assembly, onsite diagnostics, and commercial gym maintenance.',
  keywords: [
    'fitness equipment repair Dallas',
    'treadmill repair Dallas',
    'elliptical repair Dallas',
    'exercise bike repair Dallas',
    'gym equipment repair Dallas',
    'gym equipment assembly Dallas',
    'commercial gym maintenance Dallas',
    'fitness equipment service Dallas Fort Worth',
    'home gym assembly Dallas',
    'onsite fitness equipment repair',
    '2EZ TEK',
  ],
  applicationName: businessName,
  authors: [{ name: businessName, url: siteUrl }],
  creator: businessName,
  publisher: businessName,
  category: 'Fitness Equipment Repair',
  openGraph: {
    title:
      'Fitness Equipment Repair Dallas | Treadmill Repair & Gym Assembly | 2EZ TEK',
    description:
      'Professional fitness equipment repair, treadmill repair, gym equipment assembly, onsite diagnostics, and commercial gym maintenance across Dallas Fort Worth.',
    siteName: businessName,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '2EZ TEK Fitness Equipment Repair Dallas Fort Worth',
      },
    ],
  },
  facebook: facebookAppId ? { appId: facebookAppId } : undefined,
  twitter: {
    card: 'summary_large_image',
    title:
      'Fitness Equipment Repair Dallas | Treadmill Repair & Gym Assembly | 2EZ TEK',
    description:
      'Professional fitness equipment repair, treadmill repair, gym equipment assembly, and commercial gym maintenance across Dallas Fort Worth.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
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
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#050B14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const serviceAreas = [
  'Dallas',
  'Fort Worth',
  'Arlington',
  'Plano',
  'Frisco',
  'McKinney',
  'Denton',
  'Garland',
  'Irving',
  'Richardson',
  'Carrollton',
  'Addison',
  'Mesquite',
  'Dallas Fort Worth',
]

const services = [
  'Fitness Equipment Repair',
  'Treadmill Repair',
  'Elliptical Repair',
  'Exercise Bike Repair',
  'Gym Equipment Repair',
  'Gym Equipment Assembly',
  'Home Gym Installation',
  'Commercial Gym Maintenance',
  'Preventive Maintenance',
  'Onsite Fitness Equipment Diagnostics',
]

const schemaGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: businessName,
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      email: businessEmail,
      telephone: businessPhone,
      sameAs: [
        'https://www.instagram.com/2eztek/',
        'https://www.facebook.com/2eztek/',
        'https://www.youtube.com/@2eztek880',
        'https://www.linkedin.com/company/2ez-tek-llc',
      ],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: businessPhone,
          contactType: 'customer service',
          email: businessEmail,
          areaServed: 'US',
          availableLanguage: ['English'],
        },
      ],
    },
    {
      '@type': 'LocalBusiness',
      '@id': `${siteUrl}/#localbusiness`,
      name: businessName,
      url: siteUrl,
      telephone: businessPhone,
      email: businessEmail,
      image: `${siteUrl}/logo.png`,
      logo: `${siteUrl}/logo.png`,
      description:
        '2EZ TEK provides professional fitness equipment repair, treadmill repair, elliptical repair, gym equipment assembly, onsite diagnostics, and commercial gym maintenance across Dallas Fort Worth.',
      priceRange: '$$',
      parentOrganization: {
        '@id': `${siteUrl}/#organization`,
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dallas',
        addressRegion: 'TX',
        postalCode: '75287',
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 32.97,
        longitude: -96.836,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '500',
        bestRating: '5',
        worstRating: '1',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '18:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Saturday'],
          opens: '09:00',
          closes: '15:00',
        },
      ],
      areaServed: serviceAreas.map((area) => ({
        '@type': 'City',
        name: area,
      })),
      knowsAbout: services,
      makesOffer: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service,
          areaServed: 'Dallas Fort Worth, Texas',
          provider: {
            '@id': `${siteUrl}/#localbusiness`,
          },
        },
      })),
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: businessName,
      url: siteUrl,
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/manuals?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      url: siteUrl,
      name: '2EZ TEK, Fitness Equipment Repair Dallas Fort Worth',
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#localbusiness` },
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', 'h2', '[data-speakable]'],
      },
      description: '2EZ TEK provides professional fitness equipment repair, treadmill repair, elliptical repair, gym equipment assembly, and commercial gym maintenance across Dallas Fort Worth. Call (972) 807-7232.',
    },
    {
      '@type': 'Service',
      '@id': `${siteUrl}/#fitness-equipment-repair-service`,
      name: 'Fitness Equipment Repair and Assembly in Dallas Fort Worth',
      provider: {
        '@id': `${siteUrl}/#localbusiness`,
      },
      serviceType: services,
      areaServed: {
        '@type': 'Place',
        name: 'Dallas Fort Worth, Texas',
      },
      description:
        'Residential and commercial fitness equipment repair, treadmill repair, elliptical repair, gym equipment assembly, onsite diagnostics, and preventive maintenance.',
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#050B14] text-white antialiased">
        
        <script
          id="schema-graph"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaGraph),
          }}
        />

        <SiteHeader />
        <BookingModalProvider />
        <LeadCapturePopup />

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
            gtag('config', 'G-CRMMV275CX', {
              page_path: window.location.pathname
            });
          `}
        </Script>

        <Script
          src="https://cdn.ywxi.net/js/1.js"
          strategy="lazyOnload"
        />

        {process.env.NEXT_PUBLIC_POSTHOG_KEY ? (
          <Script id="posthog" strategy="afterInteractive">
            {`
              !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister reset get_distinct_id".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
              posthog.init("${process.env.NEXT_PUBLIC_POSTHOG_KEY}", {
                api_host: "https://us.i.posthog.com",
                person_profiles: "identified_only",
                capture_pageview: true
              });
            `}
          </Script>
        ) : null}       
      </body>
    </html>
  )
}
