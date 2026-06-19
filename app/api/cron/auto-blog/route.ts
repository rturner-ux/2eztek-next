// app/api/cron/auto-blog/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput, makeSlug } from '@/lib/claude'
import {
  isFacebookAutoPostEnabled,
  publishFacebookPagePost,
} from '@/lib/facebook'
import { isDuplicateInList } from '@/lib/blog-dedup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const POPULAR_TOPICS = [
  // NordicTrack — high residential search volume
  { brand: 'NordicTrack', issue: 'belt slipping', equipment: 'treadmill' },
  { brand: 'NordicTrack', issue: 'incline not working', equipment: 'treadmill' },
  { brand: 'NordicTrack', issue: 'error code iFit', equipment: 'treadmill' },
  { brand: 'NordicTrack', issue: 'motor humming but not moving', equipment: 'treadmill' },
  { brand: 'NordicTrack', issue: 'resistance levels not changing', equipment: 'elliptical' },
  { brand: 'NordicTrack', issue: 'pedals making grinding noise', equipment: 'elliptical' },
  // ProForm — residential brand
  { brand: 'ProForm', issue: 'belt slipping under load', equipment: 'treadmill' },
  { brand: 'ProForm', issue: 'motor board failure', equipment: 'treadmill' },
  { brand: 'ProForm', issue: 'console not turning on', equipment: 'treadmill' },
  { brand: 'ProForm', issue: 'resistance not working', equipment: 'elliptical' },
  // Life Fitness — high search volume, residential and light commercial
  { brand: 'Life Fitness', issue: 'console not working', equipment: 'treadmill' },
  { brand: 'Life Fitness', issue: 'resistance not changing', equipment: 'elliptical' },
  { brand: 'Life Fitness', issue: 'belt slipping', equipment: 'treadmill' },
  { brand: 'Life Fitness', issue: 'power not turning on', equipment: 'treadmill' },
  { brand: 'Life Fitness', issue: 'stride length inconsistent', equipment: 'elliptical' },
  // Precor
  { brand: 'Precor', issue: 'error code', equipment: 'treadmill' },
  { brand: 'Precor', issue: 'incline motor failure', equipment: 'treadmill' },
  { brand: 'Precor', issue: 'cross ramp not adjusting', equipment: 'elliptical' },
  // Bowflex — purely residential
  { brand: 'Bowflex', issue: 'cable broken', equipment: 'home gym' },
  { brand: 'Bowflex', issue: 'resistance not working', equipment: 'elliptical' },
  { brand: 'Bowflex', issue: 'SelectTech cable snapped', equipment: 'adjustable dumbbells' },
  // Peloton — strong residential search
  { brand: 'Peloton', issue: 'touchscreen not working', equipment: 'bike' },
  { brand: 'Peloton', issue: 'resistance knob not adjusting', equipment: 'bike' },
  { brand: 'Peloton', issue: 'clunking noise while pedaling', equipment: 'bike' },
  { brand: 'Peloton', issue: 'tread belt slipping', equipment: 'treadmill' },
  // Matrix
  { brand: 'Matrix', issue: 'console error', equipment: 'treadmill' },
  { brand: 'Matrix', issue: 'belt worn out', equipment: 'treadmill' },
  // Cybex
  { brand: 'Cybex', issue: 'resistance failure', equipment: 'elliptical' },
  { brand: 'Cybex', issue: 'arc trainer resistance not working', equipment: 'arc trainer' },
  // StairMaster
  { brand: 'StairMaster', issue: 'steps not moving', equipment: 'stairmaster' },
  { brand: 'StairMaster', issue: 'speed not changing', equipment: 'stairmaster' },
  // Schwinn
  { brand: 'Schwinn', issue: 'resistance not working', equipment: 'bike' },
  { brand: 'Schwinn', issue: 'display not turning on', equipment: 'bike' },
  // Technogym
  { brand: 'Technogym', issue: 'console not responding', equipment: 'treadmill' },
  // TRUE Fitness
  { brand: 'TRUE Fitness', issue: 'belt slipping', equipment: 'treadmill' },
  // Nautilus
  { brand: 'Nautilus', issue: 'cable snapped', equipment: 'home gym' },
  { brand: 'Nautilus', issue: 'resistance not working', equipment: 'elliptical' },
  // Star Trac / FreeMotion / Hammer
  { brand: 'Star Trac', issue: 'belt worn and slipping', equipment: 'treadmill' },
  { brand: 'FreeMotion', issue: 'cable pulley broken', equipment: 'cable machine' },
  { brand: 'Hammer Strength', issue: 'weight stack problem', equipment: 'strength machine' },
  // Additional specific brands
  { brand: 'LifeFitness', issue: 'cross trainer stride problems', equipment: 'elliptical' },
  { brand: 'Precor', issue: 'resistance not working', equipment: 'elliptical' },
  { brand: 'StairMaster', issue: 'handrail sensors not working', equipment: 'stairmaster' },
  { brand: 'Peloton', issue: 'power outage reset loop', equipment: 'bike' },
]

const BLOG_SYSTEM_PROMPT = `You are a working fitness equipment repair technician at 2EZ TEK in Dallas Fort Worth, TX. You have years of hands-on experience diagnosing and fixing treadmills, ellipticals, bikes, and strength equipment for homeowners and commercial gyms across DFW.

Write a comprehensive repair guide — 900 to 1200 words — that genuinely helps someone understand what is wrong with their equipment and what to do about it. Use specific technical terms and real brand knowledge.

Format the content field as structured HTML using these exact tags: <h2>, <h3>, <ul>, <ol>, <li>, <p>, <strong>. Do not use <html>, <head>, or <body> tags.

Use this structure:
1. <p> Opening paragraph: Name the equipment and symptom in the first sentence. Address the problem directly with no fluff.
2. <h2>Common Symptoms</h2> <ul> with 5-7 <li> items. Bold the symptom name with <strong>, then explain it in a phrase.
3. <h2>Root Causes: What Is Actually Happening</h2> <ol> with 4-6 <li> items. Bold the cause with <strong>, then write 2-3 sentences explaining it in plain language with real component names.
4. <h2>What NOT to Do</h2> <ul> with 3-4 <li> items. Bold the mistake with <strong>, then explain why it makes things worse.
5. <h2>Professional [Equipment Type] Repair in Dallas Fort Worth</h2> 2-3 <p> paragraphs. Explain why 2EZ TEK is the right choice. Mention fast response, 500-plus five-star reviews, and that we service all major brands. Name brands like NordicTrack, ProForm, Life Fitness, Precor. Mention same-week service. In one sentence, naturally mention that 2EZ TEK also maintains a free manual library at 2eztek.com/manuals where owners can find assembly guides, service docs, and owner manuals for their equipment.
6. <h2>Frequently Asked Questions</h2> 2-3 <h3> questions with <p> answers. Questions should sound like real things a customer would ask before booking.
7. <h2>Get Your [Equipment] Running Again</h2> <p> 1-2 sentences with a direct CTA mentioning 2EZ TEK and Dallas Fort Worth.

Writing rules — follow these strictly:
- NO em dashes (—). Use commas or periods instead.
- NO phrases like: "it's worth noting", "furthermore", "moreover", "in conclusion", "delve into", "crucial", "vital", "it's important to", "let's explore", "when it comes to", "a testament to", "look no further"
- Use real component names: walking belt, drive motor, motor control board, reed switch, tension roller, incline actuator, flywheel, resistance magnet, eddy current brake
- Mention Dallas Fort Worth naturally where it fits
- Do not promise same-day service, say same-week
- Sound like a technician who has seen this problem a hundred times, not a content writer
- Write for RESIDENTIAL homeowners with personal fitness equipment in their home or garage gym, not facility managers. Most people searching "[brand] repair near me" have a machine at home. Many competitors ignore residential clients or focus only on commercial gyms. 2EZ TEK is different — we welcome homeowners. Make this clear naturally in the professional repair section.

Metadata rules:
- title: clear, searchable, problem-focused
- seo_title: max 60 characters
- seo_description: max 160 characters
- excerpt: 1-2 sentences that make someone click
- hero_image_url: leave as empty string ""
- Return ONLY valid JSON, no extra text`

async function fetchManualContext(brand: string, issue: string): Promise<string> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: manuals } = await supabase
      .from('equipment_manuals_v2')
      .select('slug, description, manual_type')
      .ilike('slug', `%${brand.toLowerCase().replace(/\s+/g, '-')}%`)
      .limit(6)

    if (!manuals || manuals.length === 0) return ''
    return `\nRelevant equipment documentation from 2EZ TEK manuals library:\n` +
      manuals.map((m) => `- ${m.slug} (${m.manual_type || 'Manual'}): ${m.description || 'Documentation available'}`).join('\n')
  } catch {
    return ''
  }
}

async function fetchPexelsImage(equipment: string): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY
  if (!key) return null

  const query = encodeURIComponent(`${equipment} gym fitness equipment`)
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=5&orientation=landscape`,
      { headers: { Authorization: key } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.photos?.length) return null
    const pick = data.photos[Math.floor(Math.random() * Math.min(data.photos.length, 5))]
    return (pick.src?.large as string) ?? null
  } catch {
    return null
  }
}

async function generateBlogPost(topic: typeof POPULAR_TOPICS[0], city = 'Dallas') {
  const finalTopic = `${topic.brand} ${topic.equipment} ${topic.issue} repair in ${city}`
  const manualContext = await fetchManualContext(topic.brand, topic.issue)

  const userMessage = `Generate a blog article for this specific repair topic: ${finalTopic}

TITLE REQUIREMENT: The title MUST include the brand name "${topic.brand}" AND the specific issue "${topic.issue}". Do NOT write a generic title like "Treadmill Repair Dallas" or "Elliptical Repair Dallas". Good format: "${topic.brand} ${topic.equipment.charAt(0).toUpperCase() + topic.equipment.slice(1)} ${topic.issue} in Dallas: [descriptive subtitle]"

Brand: ${topic.brand}
Issue: ${topic.issue}
Equipment: ${topic.equipment}
City: ${city}
${manualContext ? manualContext + '\n\nUse the above documentation to write a technically accurate article.' : ''}

Return ONLY valid JSON with this exact shape:
{
  "title": "",
  "category": "",
  "excerpt": "",
  "content": "",
  "seo_title": "",
  "seo_description": "",
  "hero_image_url": ""
}`

  const outputText = await callClaude({
    system: BLOG_SYSTEM_PROMPT,
    userMessage,
    maxTokens: 3000,
    temperature: 0.6,
  })

  const parsed = JSON.parse(cleanJsonOutput(outputText))
  const title = parsed.title || finalTopic
  const slug = makeSlug(title)

  const unsplashImage = await fetchPexelsImage(topic.equipment)

  return {
    title,
    slug,
    category: parsed.category || `${topic.brand} Repair`,
    excerpt: parsed.excerpt || '',
    content: parsed.content || '',
    seo_title: parsed.seo_title || `${title} | 2EZ TEK`,
    seo_description: parsed.seo_description || parsed.excerpt || '',
    hero_image_url: unsplashImage || parsed.hero_image_url || '/images/gym-equipment-repair-dallas.webp',
    gallery_images: [],
    published: false,
  }
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

    const { data: allPosts } = await supabase
      .from('blog_posts')
      .select('title, slug')
      .order('created_at', { ascending: false })
      .limit(300)

    const existing = allPosts || []

    // Filter out topics that already have semantic coverage in the blog
    const available = POPULAR_TOPICS.filter(t =>
      !isDuplicateInList(`${t.brand} ${t.equipment} ${t.issue}`, existing)
    )

    if (available.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All predefined topics already have blog coverage. Add new entries to POPULAR_TOPICS.',
        published: 0,
      })
    }

    const topic = available[Math.floor(Math.random() * available.length)]
    const post = await generateBlogPost(topic)

    // Reject posts where Claude ignored the brand-name title requirement
    if (!post.title.toLowerCase().includes(topic.brand.toLowerCase())) {
      return NextResponse.json({ success: true, message: `Generated title missing brand "${topic.brand}" — skipped`, published: 0 })
    }

    // Final semantic check on the generated title before saving
    if (isDuplicateInList(post.title, existing)) {
      return NextResponse.json({ success: true, message: 'Generated title too similar to existing post — skipped', published: 0 })
    }

    // Slug collision means a concurrent run just saved the same post — skip rather than rename
    const { data: slugConflict } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', post.slug)
      .maybeSingle()

    if (slugConflict) {
      return NextResponse.json({ success: true, message: 'Slug already exists (concurrent run) — skipped', published: 0 })
    }

    const { data: saved, error: saveError } = await supabase
      .from('blog_posts')
      .insert({
        title: post.title,
        slug: post.slug,
        category: post.category,
        excerpt: post.excerpt,
        content: post.content,
        seo_title: post.seo_title,
        seo_description: post.seo_description,
        hero_image_url: post.hero_image_url,
        gallery_images: [],
        published: false,
        created_at: new Date().toISOString(),
      })
      .select('id, slug')
      .single()

    if (saveError) throw new Error(saveError.message)

    const blogUrl = `https://www.2eztek.com/blog/${post.slug}`

    // Notify all active followers about the new post
    const { data: followers } = await supabase
      .from('blog_followers')
      .select('email, name')
      .eq('unsubscribed', false)
      .limit(500)

    if (process.env.RESEND_API_KEY && followers && followers.length > 0) {
      const { createHmac } = await import('crypto')
      const token = (email: string) =>
        createHmac('sha256', process.env.CRON_SECRET || 'fallback-secret')
          .update(email.toLowerCase())
          .digest('hex')
          .slice(0, 32)

      const batches: typeof followers[] = []
      for (let i = 0; i < followers.length; i += 50) batches.push(followers.slice(i, i + 50))

      for (const batch of batches) {
        await fetch('https://api.resend.com/emails/batch', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            batch.map((f) => {
              const firstName = f.name?.split(' ')[0] || null
              const unsubLink = `https://www.2eztek.com/api/blog/unsubscribe?email=${encodeURIComponent(f.email)}&token=${token(f.email)}`
              return {
                from: '2EZ TEK <support@2eztek.com>',
                to: [f.email],
                subject: post.title,
                html: `
                  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111;line-height:1.7">
                    <div style="background:#050e1e;padding:28px 32px 20px;border-radius:16px 16px 0 0">
                      <div style="font-size:10px;font-weight:900;letter-spacing:0.35em;text-transform:uppercase;color:#22d3ee">2EZ TEK &middot; New Article</div>
                    </div>
                    <div style="background:#fff;padding:32px;border:1px solid #eee;border-top:none;border-radius:0 0 16px 16px">
                      ${firstName ? `<p style="margin:0 0 12px;color:#666;font-size:14px">Hey ${firstName},</p>` : ''}
                      <h2 style="margin:0 0 16px;font-size:20px;color:#050e1e;line-height:1.3">${post.title}</h2>
                      <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7">${post.excerpt}</p>
                      <a href="${blogUrl}" style="display:inline-block;background:#0891B2;color:#fff;padding:14px 28px;text-decoration:none;border-radius:10px;font-weight:900;font-size:13px;letter-spacing:0.05em">Read the Article</a>
                      <hr style="margin:32px 0;border:none;border-top:1px solid #eee"/>
                      <p style="font-size:12px;color:#999;margin:0">
                        2EZ TEK &middot; Dallas Fort Worth, TX &middot; (972) 807-7232<br/>
                        You're receiving this because you follow 2EZ TEK.<br/>
                        <a href="${unsubLink}" style="color:#999">Unsubscribe</a>
                      </p>
                    </div>
                  </div>
                `,
              }
            })
          ),
        })
        await new Promise((r) => setTimeout(r, 200))
      }
    }

    let facebookPostId: string | null = null
    let facebookPostError: string | null = null

    if (isFacebookAutoPostEnabled()) {
      try {
        const facebookPost = await publishFacebookPagePost({
          message: `${post.title}\n\n${post.excerpt}\n\nRead more: ${blogUrl}\n\nNeed fitness equipment repair or maintenance in Dallas Fort Worth? Call 2EZ TEK at (972) 807-7232.`,
          link: blogUrl,
        })
        facebookPostId = facebookPost.id
      } catch (error) {
        facebookPostError = error instanceof Error ? error.message : 'Facebook autopost failed.'
        console.error('FACEBOOK AUTOPOST ERROR:', error)
      }
    }

    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: `Auto Blog Published: ${post.title}`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:600px">
              <h2 style="color:#0891B2">New Blog Post Auto-Published</h2>
              <p><strong>Title:</strong> ${post.title}</p>
              <p><strong>Category:</strong> ${post.category}</p>
              <p><strong>Excerpt:</strong> ${post.excerpt}</p>
              <p><strong>URL:</strong> <a href="${blogUrl}">${blogUrl}</a></p>
              <p><strong>Facebook:</strong> ${facebookPostId ? `Posted (${facebookPostId})` : facebookPostError || 'Autopost disabled'}</p>
              <p><strong>Published:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST</p>
              <hr/>
              <p style="color:#666;font-size:14px">This post was auto-generated by 2EZ TEK AI Blog Engine (Claude Sonnet).</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({
      success: true,
      post: { id: saved.id, slug: saved.slug, title: post.title },
      facebook: {
        enabled: isFacebookAutoPostEnabled(),
        postId: facebookPostId,
        error: facebookPostError,
      },
    })
  } catch (error: any) {
    console.error('AUTO BLOG ERROR:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Auto blog failed' },
      { status: 500 }
    )
  }
}
