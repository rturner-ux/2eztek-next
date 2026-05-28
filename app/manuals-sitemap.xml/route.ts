import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const baseUrl = 'https://2eztek.com'

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

const knownBrands = [
  'nordictrack',
  'proform',
  'peloton',
  'bowflex',
  'marcy',
  'matrix',
  'precor',
  'cybex',
  'rogue',
  'technogym',
  'life-fitness',
  'hammer-strength',
  'sole',
  'schwinn',
  'stairmaster',
  'sportsart',
  'woodway',
  'octane',
  'keiser',
  'landice',
  'freemotion',
  'star-trac',
  'true-fitness',
  'body-solid',
  'expresso',
  'jacobs-ladder',
  'versa-climber',
]

function detectBrandFromSlug(slug: string) {
  const cleanSlug = slugify(slug)

  return (
    knownBrands.find((brand) =>
      cleanSlug.startsWith(brand)
    ) || null
  )
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return new NextResponse('', {
      status: 500,
      headers: {
        'Content-Type': 'application/xml',
      },
    })
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

  const manuals = (
    (data || []) as ManualRecord[]
  ).filter((manual) => {
    const slug = slugify(manual.slug || '')
    const brand = detectBrandFromSlug(slug)

    return slug.length > 2 && brand !== null
  })

  const uniqueBrands = Array.from(
    new Set(
      manuals
        .map((manual) =>
          detectBrandFromSlug(manual.slug || '')
        )
        .filter(Boolean)
    )
  )

  const brandUrls = uniqueBrands.map((brand) => ({
    url: `${baseUrl}/manuals/brands/${brand}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: '0.7',
  }))

  const manualUrls = manuals.map((manual) => {
    const slug = slugify(manual.slug || '')
    const brand = detectBrandFromSlug(slug)

    return {
      url: `${baseUrl}/manuals/${brand}/${slug}.pdf`,
      lastModified: manual.created_at
        ? new Date(manual.created_at).toISOString()
        : new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: '0.6',
    }
  })

  const urls = [
    ...brandUrls,
    ...manualUrls,
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `  <url>
    <loc>${xmlEscape(item.url)}</loc>
    <lastmod>${item.lastModified}</lastmod>
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
