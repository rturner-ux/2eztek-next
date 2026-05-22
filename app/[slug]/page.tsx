// app/[slug]/page.tsx
// Handles all service slugs at the root level:
// /treadmill-repair-dallas, /elliptical-repair-dallas, etc.

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getServiceBySlug, getAllServiceSlugs } from '@/lib/serviceData'
import ServicePageClient from '@/app/[slug]/ServicePageClient'

export function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const service = getServiceBySlug(params.slug)
  if (!service) return {}
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: {
      canonical: 'https://2eztek.com/' + service.slug,
    },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: 'https://2eztek.com/' + service.slug,
      siteName: '2EZ TEK',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: service.metaTitle,
      description: service.metaDescription,
    },
  }
}

export default function ServicePage({
  params,
}: {
  params: { slug: string }
}) {
  const service = getServiceBySlug(params.slug)

  if (!service) {
    notFound()
    return null
  }

  return <ServicePageClient service={service} />
}
