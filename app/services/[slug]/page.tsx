// app/services/[slug]/page.tsx

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getServiceBySlug, getAllServiceSlugs } from '@/lib/serviceData'
import ServiceContent from './ServiceContent'

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

  return <ServiceContent service={service} />
}
