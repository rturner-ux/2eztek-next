import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

const baseUrl = 'https://2eztek.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
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

    '/services/treadmill-repair-dallas',
    '/services/elliptical-repair-dallas',
    '/services/exercise-bike-repair-dallas',
    '/services/fitness-equipment-assembly-dallas',
    '/services/home-gym-installation-dallas',
    '/services/preventative-maintenance-dallas',
    '/services/strength-equipment-repair-dallas',
    '/services/cable-machine-repair-dallas',

    '/gym-equipment-repair-dallas',
    '/commercial-gym-maintenance',
    '/commercial-gym-installation-dallas',
    '/tech-onsite',
    '/manuals',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
