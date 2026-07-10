import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SITE = 'https://www.2eztek.com'
const TITLE = '2EZ TEK Fitness Equipment Repair Blog'
const DESCRIPTION = 'Expert repair guides, maintenance tips, and fitness equipment insights from the DFW area\'s leading fitness equipment repair company.'
const AUTHOR = '2EZ TEK'

function escapeXml(str: string) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripHtml(html: string) {
  return (html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, excerpt, content, category, created_at, hero_image_url')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(50)

  const items = (posts || []).map((post) => {
    const url = `${SITE}/blog/${post.slug}`
    const pubDate = new Date(post.created_at).toUTCString()
    const description = post.excerpt || stripHtml(post.content || '').slice(0, 300)
    const imageTag = post.hero_image_url
      ? `<enclosure url="${escapeXml(post.hero_image_url)}" type="image/jpeg" length="0"/>`
      : ''

    return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
      <category>${escapeXml(post.category || 'Repair Guides')}</category>
      <author>support@2eztek.com (${AUTHOR})</author>
      ${imageTag}
    </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(TITLE)}</title>
    <link>${SITE}/blog</link>
    <description>${escapeXml(DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE}/images/2eztek-logo.webp</url>
      <title>${escapeXml(TITLE)}</title>
      <link>${SITE}/blog</link>
    </image>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
