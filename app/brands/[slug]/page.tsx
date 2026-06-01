// app/brands/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBrandBySlug, getAllBrandSlugs } from '@/lib/brandData'
import BrandPageClient from './BrandPageClient'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

function stripBrand(title: string) {
  return title.replace(/\s*\|\s*2EZ TEK\s*$/i, '').trim()
}

export function generateStaticParams() {
  return getAllBrandSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const brand = getBrandBySlug(slug)
  if (!brand) return {}
  const title = stripBrand(brand.metaTitle)
  return {
    title,
    description: brand.metaDescription,
    alternates: {
      canonical: 'https://www.2eztek.com/brands/' + brand.slug,
    },
    openGraph: {
      title,
      description: brand.metaDescription,
      url: 'https://www.2eztek.com/brands/' + brand.slug,
      siteName: '2EZ TEK',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: brand.metaDescription,
    },
  }
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params
  const brand = getBrandBySlug(slug)
  if (!brand) {
    notFound()
    return null
  }
  return <BrandPageClient brand={brand} />
}