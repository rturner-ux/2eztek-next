import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAreaBySlug, getAllAreaSlugs } from '@/lib/areaData'
import AreaContent from './AreaContent'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

function stripBrand(title: string) {
  return title.replace(/\s*\|\s*2EZ TEK\s*$/i, '').trim()
}

export function generateStaticParams() {
  return getAllAreaSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const area = getAreaBySlug(slug)
  if (!area) return {}
  const title = stripBrand(area.metaTitle)
  return {
    title,
    description: area.metaDescription,
    alternates: { canonical: 'https://www.2eztek.com/areas/' + area.slug },
    openGraph: {
      title,
      description: area.metaDescription,
      url: 'https://www.2eztek.com/areas/' + area.slug,
      siteName: '2EZ TEK',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: area.metaDescription,
    },
  }
}

export default async function AreaPage({ params }: PageProps) {
  const { slug } = await params
  const area = getAreaBySlug(slug)
  if (!area) {
    notFound()
    return null
  }
  return <AreaContent area={area} />
}