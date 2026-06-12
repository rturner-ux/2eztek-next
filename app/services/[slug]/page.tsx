// app/services/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getServiceBySlug, getAllServiceSlugs } from '@/lib/serviceData'
import ServiceContent from './ServiceContent'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

function stripBrand(title: string) {
  return title.replace(/\s*\|\s*2EZ TEK\s*$/i, '').trim()
}

export function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) return {}
  const title = stripBrand(service.metaTitle)
  return {
    title,
    description: service.metaDescription,
    alternates: {
      canonical: 'https://www.2eztek.com/services/' + service.slug,
    },
    openGraph: {
      title,
      description: service.metaDescription,
      url: 'https://www.2eztek.com/services/' + service.slug,
      siteName: '2EZ TEK',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: service.metaDescription,
    },
  }
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) {
    notFound()
    return null
  }
  return <ServiceContent service={service} />
}