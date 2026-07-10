import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SITE = 'https://www.2eztek.com'
const PUBLICATION_NAME = '2EZ TEK'
const PUBLICATION_LANGUAGE = 'en'

function escapeXml(str: string) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Google News only indexes articles published within the last 2 days for the
  // news sitemap, but including up to 1000 recent articles is fine for crawling.
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, category, created_at')
    .eq('published', true)
    .gte('created_at', twoDaysAgo)
    .order('created_at', { ascending: false })
    .limit(1000)

  const urls = (posts || []).map((post) => {
    const pubDate = new Date(post.created_at).toISOString()
    return `
  <url>
    <loc>${SITE}/blog/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(PUBLICATION_NAME)}</news:name>
        <news:language>${PUBLICATION_LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
      <news:keywords>${escapeXml(post.category || 'fitness equipment repair, Dallas, DFW')}</news:keywords>
    </news:news>
  </url>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${urls || '<!-- No articles published in the last 2 days -->'}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=3600',
    },
  })
}
