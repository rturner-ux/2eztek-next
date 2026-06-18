// app/api/cron/internal-linking/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type BlogPost = {
  id: string
  slug: string
  title: string
  content: string
  category: string | null
}

type LinkSuggestion = {
  anchor_text: string
  target_slug: string
  target_title: string
}

const LINKING_SYSTEM_PROMPT = `You are an SEO expert analyzing blog posts to add internal links for a fitness equipment repair website.

Rules for suggesting internal links:
- anchor_text must be an EXACT substring from the article content (copy it exactly)
- anchor_text should be 2-6 words, a natural phrase
- Only suggest links where topics genuinely overlap, never force links
- Never link to the same post twice
- If no good links exist, return an empty array []
- Return ONLY valid JSON array, no extra text`

async function findInternalLinks(
  post: BlogPost,
  allPosts: BlogPost[]
): Promise<LinkSuggestion[]> {
  const otherPosts = allPosts
    .filter((p) => p.id !== post.id && p.slug !== post.slug)
    .slice(0, 20)

  if (otherPosts.length === 0) return []

  const postList = otherPosts
    .map((p) => `- "${p.title}" → /blog/${p.slug}`)
    .join('\n')

  const userMessage = `Find 2-4 natural internal link opportunities in this article.

Current article title: "${post.title}"
Current article content (first 800 chars):
${post.content.slice(0, 800)}

Available posts to link to:
${postList}

Return ONLY valid JSON array:
[
  {
    "anchor_text": "exact text from the article to turn into a link",
    "target_slug": "slug-of-target-post",
    "target_title": "Title of target post"
  }
]`

  const outputText = await callClaude({
    system: LINKING_SYSTEM_PROMPT,
    userMessage,
    maxTokens: 512,
    temperature: 0.3,
  })

  try {
    const suggestions = JSON.parse(cleanJsonOutput(outputText))
    return suggestions.filter(
      (s: any) => s.anchor_text && s.target_slug && post.content.includes(s.anchor_text)
    )
  } catch {
    return []
  }
}

function applyInternalLinks(content: string, links: LinkSuggestion[]): string {
  let updated = content
  const applied = new Set<string>()

  for (const link of links) {
    if (applied.has(link.target_slug)) continue

    const linkPattern = new RegExp(`\\[.*?\\]\\(.*?${link.target_slug}.*?\\)`, 'i')
    if (linkPattern.test(updated)) continue

    const escaped = link.anchor_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`(?<!\\[)${escaped}(?![^\\[]*\\])`, '')
    const markdownLink = `[${link.anchor_text}](/blog/${link.target_slug})`

    if (pattern.test(updated)) {
      updated = updated.replace(pattern, markdownLink)
      applied.add(link.target_slug)
    }
  }

  return updated
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: allPosts, error } = await supabase
      .from('blog_posts')
      .select('id, slug, title, content, category')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error || !allPosts || allPosts.length < 2) {
      return NextResponse.json({ success: true, message: 'Not enough posts to link yet', linked: 0 })
    }

    const { data: recentlyLinked } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('published', true)
      .order('updated_at', { ascending: false })
      .limit(20)

    const recentIds = new Set((recentlyLinked || []).map((p) => p.id))

    const toProcess = allPosts.filter((p) => !recentIds.has(p.id)).slice(0, 8)
    const batch = toProcess.length >= 2 ? toProcess : allPosts.slice(0, 8)

    const results: Array<{
      post_title: string
      post_slug: string
      links_added: number
      link_details: LinkSuggestion[]
    }> = []

    for (const post of batch) {
      try {
        const suggestions = await findInternalLinks(post, allPosts)
        if (suggestions.length === 0) continue

        const updatedContent = applyInternalLinks(post.content, suggestions)
        if (updatedContent === post.content) continue

        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({ content: updatedContent, updated_at: new Date().toISOString() })
          .eq('id', post.id)

        if (!updateError) {
          results.push({
            post_title: post.title,
            post_slug: post.slug,
            links_added: suggestions.length,
            link_details: suggestions,
          })
        }

        await new Promise((r) => setTimeout(r, 400))
      } catch (err) {
        console.error(`Failed internal linking for: ${post.title}`, err)
      }
    }

    const totalLinksAdded = results.reduce((sum, r) => sum + r.links_added, 0)

    if (process.env.RESEND_API_KEY && results.length > 0) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: `Internal Linking Update: ${totalLinksAdded} links added across ${results.length} posts`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:600px">
              <h2 style="color:#0891B2">Weekly Internal Linking Report</h2>
              <p>Added <strong>${totalLinksAdded} internal links</strong> across <strong>${results.length} blog posts</strong>.</p>
              <h3 style="margin-top:24px">Posts Updated</h3>
              ${results.map((r) => `
                <div style="margin-bottom:16px;padding:12px;background:#f7f7f7;border-radius:8px">
                  <strong>${r.post_title}</strong>
                  <div style="margin-top:8px">
                    ${r.link_details.map((l) => `
                      <div style="font-size:13px;color:#444;margin-top:4px">
                        "${l.anchor_text}" → <a href="https://www.2eztek.com/blog/${l.target_slug}">${l.target_title}</a>
                      </div>
                    `).join('')}
                  </div>
                  <div style="margin-top:8px">
                    <a href="https://www.2eztek.com/blog/${r.post_slug}" style="font-size:13px">View Post →</a>
                  </div>
                </div>
              `).join('')}
              <hr style="margin-top:24px"/>
              <p style="color:#666;font-size:13px">Auto-generated by 2EZ TEK Internal Linking Engine (Claude Sonnet). Runs every Sunday at 9am UTC.</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({
      success: true,
      posts_processed: batch.length,
      posts_updated: results.length,
      links_added: totalLinksAdded,
      results,
    })
  } catch (error: any) {
    console.error('INTERNAL LINKING ERROR:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
