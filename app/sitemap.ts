import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

const baseUrl = 'https://www.2eztek.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
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
    { path: '/tech-onsite', priority: 0.8 },

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
    { path: '/brands/marcy', priority: 0.8 },
    { path: '/brands/life-fitness', priority: 0.9 },
    { path: '/brands/precor', priority: 0.9 },
    { path: '/brands/matrix', priority: 0.9 },
    { path: '/brands/technogym', priority: 0.8 },
    { path: '/brands/cybex', priority: 0.8 },
    { path: '/brands/stairmaster', priority: 0.9 },
    { path: '/brands/true-fitness', priority: 0.8 },
    { path: '/brands/schwinn', priority: 0.8 },
    { path: '/brands/nautilus', priority: 0.8 },
    { path: '/brands/octane-fitness', priority: 0.8 },
    { path: '/brands/star-trac', priority: 0.8 },
    { path: '/brands/freemotion', priority: 0.8 },
    { path: '/brands/hammer-strength', priority: 0.8 },
    { path: '/brands/sportsart', priority: 0.8 },

    // Content
    { path: '/blog', priority: 0.8 },
    { path: '/manuals', priority: 0.9 },
    { path: '/smartgymops-features', priority: 0.8 },
    { path: '/careers-1', priority: 0.7 },
    { path: '/projects', priority: 0.7 },
    { path: '/facility-spotlight', priority: 0.7 },

    // Legal
    { path: '/privacy-policy', priority: 0.4 },
    { path: '/terms-of-service', priority: 0.4 },
  ]

  return routes.map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority,
  }))
}
