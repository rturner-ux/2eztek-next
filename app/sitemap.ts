import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getAllBrandSlugs } from '@/lib/brandData'

export const dynamic = 'force-dynamic'

const baseUrl = 'https://www.2eztek.com'

// Brands that exist only as hand-built pages under app/brands/, so they are not
// in brandData. Keep in sync with those directories.
const staticBrandSlugs = ['proform', 'goalrilla', 'marcy']

// Brand URLs are derived rather than hand-listed so the sitemap cannot drift out
// of sync with the brand data the way it did before.
const brandPriority: Record<string, number> = {
  nordictrack: 0.9,
  proform: 0.9,
  peloton: 0.9,
  bowflex: 0.9,
  'life-fitness': 0.9,
  precor: 0.9,
  matrix: 0.9,
  stairmaster: 0.9,
}

function brandRoutes() {
  const slugs = Array.from(new Set([...getAllBrandSlugs(), ...staticBrandSlugs])).sort()
  return slugs.map((slug) => ({
    path: `/brands/${slug}`,
    priority: brandPriority[slug] ?? 0.8,
  }))
}

const staticRoutes = [
  // Core
  { path: '', priority: 1.0 },
  { path: '/contact', priority: 1.0 },
  { path: '/reviews', priority: 0.9 },
  { path: '/about-2ez-tek', priority: 0.9 },

  // Main service pages (canonical URLs are /services/[slug])
  { path: '/gym-equipment-repair-dallas', priority: 1.0 },
  { path: '/commercial-gym-maintenance', priority: 1.0 },
  { path: '/services/treadmill-repair-dallas', priority: 1.0 },
  { path: '/services/elliptical-repair-dallas', priority: 0.9 },
  { path: '/services/exercise-bike-repair-dallas', priority: 0.9 },
  { path: '/services/fitness-equipment-assembly-dallas', priority: 0.9 },
  { path: '/services/home-gym-installation-dallas', priority: 0.9 },
  { path: '/services/preventative-maintenance-dallas', priority: 0.9 },
  { path: '/services/strength-equipment-repair-dallas', priority: 0.9 },
  { path: '/services/cable-machine-repair-dallas', priority: 0.9 },
  { path: '/services/commercial-gym-installation-dallas', priority: 0.9 },

  // Areas
  { path: '/areas', priority: 0.9 },
  { path: '/areas/dallas', priority: 1.0 },
  { path: '/areas/fort-worth', priority: 0.9 },
  { path: '/areas/plano', priority: 0.9 },
  { path: '/areas/frisco', priority: 0.9 },
  { path: '/areas/irving', priority: 0.9 },
  { path: '/areas/arlington', priority: 0.9 },
  { path: '/areas/richardson', priority: 0.9 },
  { path: '/areas/mckinney', priority: 0.9 },
  { path: '/areas/garland', priority: 0.9 },
  { path: '/areas/mesquite', priority: 0.9 },
  { path: '/areas/carrollton', priority: 0.9 },
  { path: '/areas/addison', priority: 0.9 },

  // Brands
  { path: '/brands', priority: 0.8 },

  // Content
  { path: '/blog', priority: 0.8 },
  { path: '/manuals', priority: 0.9 },

  // Legal
  { path: '/privacy-policy', priority: 0.4 },
  { path: '/terms-of-service', priority: 0.4 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

  // Include the 500 most-recently-added manual detail pages so Google knows
  // /manuals/[slug] is the canonical indexable URL for each manual.
  const { data: manuals } = await supabase
    .from('equipment_manuals_v2')
    .select('slug, created_at')
    .not('slug', 'is', null)
    .order('created_at', { ascending: false })
    .limit(500)

  const blogRoutes: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const base: MetadataRoute.Sitemap = [...staticRoutes, ...brandRoutes()].map(
    ({ path, priority }) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority,
    })
  )

  const manualRoutes: MetadataRoute.Sitemap = (manuals || [])
    .filter((m) => m.slug)
    .map((m) => ({
      url: `${baseUrl}/manuals/${m.slug}`,
      lastModified: m.created_at ? new Date(m.created_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

  return [...base, ...blogRoutes, ...manualRoutes]
}
