import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { slug, name, comment } = await req.json()
    if (!slug || !name?.trim() || !comment?.trim()) {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.from('blog_comments').insert({
      post_slug: slug,
      name: name.trim().slice(0, 100),
      comment: comment.trim().slice(0, 2000),
    })

    if (error) throw error

    // Notify via email
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['rturner@2eztek.com'],
          subject: `New blog comment on: ${slug}`,
          html: `<p><strong>Post:</strong> /blog/${slug}</p><p><strong>Name:</strong> ${name}</p><p><strong>Comment:</strong></p><p>${comment}</p><p>Approve it in Supabase by setting <code>approved = true</code> on the blog_comments table.</p>`,
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
