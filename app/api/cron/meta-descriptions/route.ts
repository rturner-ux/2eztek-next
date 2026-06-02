import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const META_SYSTEM = `You are an SEO specialist for 2EZ TEK, a fitness equipment repair company in Dallas Fort Worth, TX.

Write a compelling meta description (150-160 characters) for a blog post. Rules:
- Include the primary keyword naturally (equipment type + brand or issue)
- Mention Dallas Fort Worth or DFW at least once
- End with a soft CTA ("Learn more", "Find out why", "Get expert help")
- Exactly 150-160 characters including spaces
- Return ONLY the meta description text, nothing else`

type BlogPost = {
  id: string
  title: string
  excerpt: string
  seo_title: string
}

async function generateMetaDescription(post: BlogPost): Promise<string> {
  const userMessage = `Write a 150-160 character meta description for this blog post.

Title: ${post.seo_title || post.title}
Excerpt: ${post.excerpt || ''}

Return ONLY the meta description text.`

  const text = await callClaude({
    system: META_SYSTEM,
    userMessage,
    maxTokens: 100,
    temperature: 0.4,
  })

  return text.trim().replace(/^["']|["']$/g, '')
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

    // Find published posts missing seo_description, process up to 20 per run
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, excerpt, seo_title')
      .eq('published', true)
      .or('seo_description.is.null,seo_description.eq.')
      .limit(20)

    if (error) throw new Error(error.message)
    if (!posts || posts.length === 0) {
      return NextResponse.json({ success: true, message: 'All posts have meta descriptions', updated: 0 })
    }

    let updated = 0
    let failed = 0

    for (const post of posts as BlogPost[]) {
      try {
        const description = await generateMetaDescription(post)
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({ seo_description: description })
          .eq('id', post.id)

        if (updateError) {
          console.error('Meta description update failed:', post.title, updateError.message)
          failed++
        } else {
          updated++
        }
        await new Promise((r) => setTimeout(r, 300))
      } catch (err) {
        console.error('Meta description generation failed for:', post.title, err)
        failed++
      }
    }

    if (process.env.RESEND_API_KEY && updated > 0) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: `SEO: ${updated} meta descriptions filled`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:580px">
              <h2 style="color:#0891B2">Meta Description Update Complete</h2>
              <p>Filled <strong>${updated}</strong> missing SEO meta descriptions on blog posts.</p>
              ${failed > 0 ? `<p style="color:#e53e3e">${failed} failed.</p>` : ''}
              <p style="color:#666;font-size:13px">Runs Mondays at 6am UTC.</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true, updated, failed })
  } catch (error: unknown) {
    console.error('META DESCRIPTIONS CRON ERROR:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
