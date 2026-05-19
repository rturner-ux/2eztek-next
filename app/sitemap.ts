import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const baseUrl = 'https://www.2eztek.com'

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

type ManualRecord = {
  slug: string | null
  created_at: string | null
}

function detectBrandFromSlug(slug: string) {
  const parts = slugify(slug).split('-')

  return parts[0] || 'manuals'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/about-2ez-tek',
    '/reviews',
    '/contact',
    '/brands',
    '/brands/nordictrack',
    '/brands/proform',
    '/brands/peloton',
    '/brands/bowflex',
    '/brands/marcy',
    '/treadmill-repair-dallas',
    '/gym-equipment-repair-dallas',
    '/gym-equipment-assembly-dallas',
    '/commercial-gym-maintenance',
    '/commercial-gym-installation-dallas',
    '/tech-onsite',
    '/manuals',
  ]

  const staticPages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return staticPages
  }

  const supabase = createClient(
    supabaseUrl,
    serviceRoleKey
  )

  const { data } = await supabase
    .from('equipment_manuals_v2')
    .select('slug, created_at')
    .not('slug', 'is', null)
    .limit(5000)

  const manuals = (data || []) as ManualRecord[]

  const manualPages: MetadataRoute.Sitemap =
    manuals.map((manual) => {
      const slug = slugify(manual.slug || '')
      const brand = detectBrandFromSlug(slug)

      return {
        url: `${baseUrl}/manuals/${brand}/${slug}.pdf`,
        lastModified: manual.created_at
          ? new Date(manual.created_at)
          : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      }
    })

  const uniqueBrands = Array.from(
    new Set(
      manuals.map((manual) =>
        detectBrandFromSlug(manual.slug || '')
      )
    )
  )

  const brandPages: MetadataRoute.Sitemap =
    uniqueBrands.map((brand) => ({
      url: `${baseUrl}/manuals/brands/${brand}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
    }))

  return [
    ...staticPages,
    ...brandPages,
    ...manualPages,
  ]
}