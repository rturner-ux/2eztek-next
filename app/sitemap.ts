import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://2eztek.com'

  const routes = [
    '',
    '/about-2ez-tek',
    '/reviews',
    '/contact',
    '/request-service',
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
    '/manuals/nordictrack',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}