import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],

    sitemap: [
      'https://2eztek.com/sitemap.xml',
      'https://2eztek.com/manuals-sitemap.xml',
    ],

    host: 'https://2eztek.com',
  }
}
