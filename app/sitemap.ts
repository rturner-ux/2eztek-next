import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const baseUrl = 'https://www.2eztek.com'

const staticRoutes = [
  // Core
  { path: '', priority: 1.0 },
  { path: '/contact', priority: 1.0 },
  { path: '/reviews', priority: 0.9 },
  { path: '/about-2ez-tek', priority: 0.9 },

  // Main service pages
  { path: '/gym-equipment-repair-dallas', priority: 1.0 },
  { path: '/treadmill-repair-dallas', priority: 1.0 },
  { path: '/elliptical-repair-dallas', priority: 0.9 },
  { path: '/exercise-bike-repair-dallas', priority: 0.9 },
  { path: '/commercial-gym-maintenance', priority: 1.0 },
  { path: '/fitness-equipment-assembly-dallas', priority: 0.9 },
  { path: '/home-gym-installation-dallas', priority: 0.9 },
  { path: '/preventative-maintenance-dallas', priority: 0.9 },
  { path: '/strength-equipment-repair-dallas', priority: 0.9 },
  { path: '/cable-machine-repair-dallas', priority: 0.9 },
  { path: '/commercial-gym-installation-dallas', priority: 0.9 },

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
  { path: '/brands/nordictrack', priority: 0.9 },
  { path: '/brands/proform', priority: 0.9 },
  { path: '/brands/peloton', priority: 0.9 },
  { path: '/brands/bowflex', priority: 0.9 },
  { path: '/brands/life-fitness', priority: 0.9 },
  { path: '/brands/precor', priority: 0.9 },
  { path: '/brands/matrix', priority: 0.9 },
  { path: '/brands/stairmaster', priority: 0.9 },
  { path: '/brands/schwinn', priority: 0.8 },
  { path: '/brands/nautilus', priority: 0.8 },
  { path: '/brands/cybex', priority: 0.8 },
  { path: '/brands/technogym', priority: 0.8 },
  { path: '/brands/true-fitness', priority: 0.8 },
  { path: '/brands/star-trac', priority: 0.8 },
  { path: '/brands/freemotion', priority: 0.8 },
  { path: '/brands/hammer-strength', priority: 0.8 },

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

  const blogRoutes: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const base: MetadataRoute.Sitemap = staticRoutes.map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority,
  }))

  return [...base, ...blogRoutes]
}
