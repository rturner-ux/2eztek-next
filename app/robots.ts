import type { MetadataRoute } from 'next'

// Single source of truth for /robots.txt.
//
// This used to live in two places: this file and public/robots.txt. Both claim
// the same route and they disagreed (the static file advertised only one
// sitemap and added a crawl delay), so whichever one Next served, the other
// silently did nothing. The static file has been removed and its full ruleset
// ported here, which is what the App Router docs recommend for static metadata
// files.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Legitimate search engines.
      {
        userAgent: ['Googlebot', 'Bingbot', 'DuckDuckBot', 'Slurp'],
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },

      // AI and answer-engine crawlers, deliberately allowed.
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: '/admin/',
      },
      {
        userAgent: [
          'Google-Extended',
          'PerplexityBot',
          'Claude-Web',
          'anthropic-ai',
          'cohere-ai',
          'YouBot',
        ],
        allow: '/',
      },

      // SEO audit tools, blocked.
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'MJ12bot',
          'DotBot',
          'RogerBot',
          'BLEXBot',
          'SiteAuditBot',
          'Sistrix',
          'linkdexbot',
          'Exabot',
          'ia_archiver',
        ],
        disallow: '/',
      },

      // Data harvesters and email scrapers, blocked.
      {
        userAgent: [
          'EmailCollector',
          'EmailSiphon',
          'WebEMailExtractor',
          'ExtractorPro',
          'Nutch',
          'NetAnts',
          'Teleport',
          'WebCopier',
          'WebZip',
          'HTTrack',
          'larbin',
        ],
        disallow: '/',
      },

      // Everything else.
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/api/cron/'],
        crawlDelay: 5,
      },
    ],

    sitemap: [
      'https://www.2eztek.com/sitemap.xml',
      'https://www.2eztek.com/manuals-sitemap.xml',
    ],
  }
}
