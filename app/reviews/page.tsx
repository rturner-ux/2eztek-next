import Link from 'next/link'
import type { Metadata } from 'next'

const siteUrl = 'https://2eztek.com'
const businessName = '2EZ TEK'
const businessPhone = '+19728077232'
const businessPhoneDisplay = '(972) 807-7232'

export const metadata: Metadata = {
  title: 'Customer Reviews | 2EZ TEK Fitness Equipment Repair Dallas',
  description:
    'Read customer reviews for 2EZ TEK fitness equipment repair, treadmill repair, gym equipment assembly, preventive maintenance, and commercial gym service across Dallas Fort Worth.',
  openGraph: {
    title: 'Customer Reviews | 2EZ TEK',
    description:
      'Real customer experiences from homeowners, gyms, apartments, and commercial fitness facilities across Dallas Fort Worth.',
    url: `${siteUrl}/reviews`,
    siteName: businessName,
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '2EZ TEK Customer Reviews',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Customer Reviews | 2EZ TEK',
    description:
      'Trusted fitness equipment repair, assembly, and maintenance service across Dallas Fort Worth.',
    images: [`${siteUrl}/og-image.png`],
  },
}

const reviews = [
  {
    name: 'Commercial Fitness Client',
    role: 'Gym Operations Manager',
    title: 'Fast response and professional service',
    review:
      '2EZ TEK handled multiple treadmill and elliptical repairs for our facility quickly and professionally. Communication was excellent and downtime was minimized.',
  },
  {
    name: 'Residential Customer',
    role: 'Home Gym Owner',
    title: 'Excellent home gym assembly',
    review:
      'Our home gym installation was completed perfectly. Everything was organized, clean, and professionally assembled.',
  },
  {
    name: 'Apartment Fitness Center',
    role: 'Property Management',
    title: 'Reliable maintenance partner',
    review:
      'Preventive maintenance has helped keep our equipment running consistently. Very responsive and dependable service.',
  },
]

const stats = [
  ['500+', '5-Star Reviews'],
  ['10K+', 'Machines Serviced'],
  ['24/7', 'Emergency Support'],
  ['DFW', 'Coverage Area'],
]

const trustPoints = [
  'Fast response times',
  'Experienced technicians',
  'Commercial & residential service',
  'Trusted across Dallas Fort Worth',
]

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${siteUrl}/#localbusiness`,
  name: businessName,
  url: siteUrl,
  telephone: businessPhone,
  image: `${siteUrl}/og-image.png`,
  logo: `${siteUrl}/logo.png`,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'TX',
    addressCountry: 'US',
  },
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
    'Richardson',
    'Carrollton',
    'Addison',
    'Mesquite',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    reviewCount: reviews.length.toString(),
    bestRating: '5',
    worstRating: '1',
  },
  review: reviews.map((item) => ({
    '@type': 'Review',
    itemReviewed: {
      '@type': 'LocalBusiness',
      '@id': `${siteUrl}/#localbusiness`,
      name: businessName,
      url: siteUrl,
      telephone: businessPhone,
      address: {
        '@type': 'PostalAddress',
        addressRegion: 'TX',
        addressCountry: 'US',
      },
    },
    author: {
      '@type': 'Person',
      name: item.name,
    },
    name: item.title,
    reviewBody: item.review,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: '5',
      bestRating: '5',
      worstRating: '1',
    },
  })),
}

export default function ReviewsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />

      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/reviews-handshake.webp"
          alt="2EZ TEK customer review background"
          className="reviews-drift h-full w-[112%] max-w-none object-cover opacity-[0.82]"
        />
        <div className="absolute inset-0 bg-black/28" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,20,0.82)_0%,rgba(5,11,20,0.48)_45%,rgba(5,11,20,0.22)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_34%)]" />
      </div>

      <section className="relative z-10 px-6 pb-24 pt-32 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-xl">
              Verified Service Reputation
            </div>

            <h1 className="mt-7 text-5xl font-black leading-[0.92] tracking-tight md:text-7xl">
              Trusted By
              <span className="block text-cyan-300">
                Dallas Fort Worth.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/85 md:text-xl">
              Homeowners, gyms, apartments, and commercial fitness facilities
              trust 2EZ TEK for reliable repair, assembly, diagnostics, and
              preventive maintenance.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_40px_rgba(34,211,238,0.38)] transition hover:scale-[1.02] hover:bg-cyan-300"
              >
                Book Your Service
              </Link>

              <a
                href="tel:9728077232"
                className="rounded-2xl border border-white/15 bg-white/10 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Call {businessPhoneDisplay}
              </a>
            </div>
          </div>

          <div className="mt-20 grid gap-4 md:grid-cols-4">
            {stats.map(([stat, label]) => (
              <div
                key={label}
                className="rounded-[2rem] border border-white/10 bg-black/22 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              >
                <div className="text-5xl font-black text-cyan-300">
                  {stat}
                </div>

                <div className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-white/60">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                5-Star Service
              </div>

              <h2 className="mt-4 text-4xl font-black md:text-6xl">
                What Our Clients
                <span className="block text-white/55">
                  Are Saying
                </span>
              </h2>
            </div>

            <Link
              href="/contact"
              className="rounded-2xl border border-white/15 bg-white/10 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:bg-white/15"
            >
              Request Service
            </Link>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {reviews.map((item) => (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/24 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.30)] backdrop-blur-2xl transition duration-500 hover:-translate-y-2 hover:border-cyan-300/30"
              >
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),transparent_65%)] opacity-80 transition duration-500 group-hover:opacity-100" />

                <div className="relative">
                  <div
                    aria-label="5 out of 5 stars"
                    className="flex gap-1 text-cyan-300"
                  >
                    ★★★★★
                  </div>

                  <h3 className="mt-6 text-3xl font-black leading-tight">
                    {item.title}
                  </h3>

                  <p className="mt-6 leading-8 text-white/80">
                    “{item.review}”
                  </p>

                  <div className="mt-10 border-t border-white/10 pt-5">
                    <div className="font-black text-cyan-300">
                      {item.name}
                    </div>

                    <div className="mt-1 text-sm text-white/50">
                      {item.role}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-28 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-cyan-400/20 bg-black/22 p-10 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr,320px] lg:items-center">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                Experience The Difference
              </div>

              <h2 className="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                Let’s Get Your Equipment
                <span className="block text-white/55">
                  Running Again.
                </span>
              </h2>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {trustPoints.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-white/82"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300 text-xs font-black text-black">
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="/contact"
                className="rounded-2xl bg-cyan-400 px-7 py-5 text-center text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_35px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] hover:bg-cyan-300"
              >
                Book Your Service
              </Link>

              <a
                href="tel:9728077232"
                className="rounded-2xl border border-white/15 bg-white/10 px-7 py-5 text-center text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Call {businessPhoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}