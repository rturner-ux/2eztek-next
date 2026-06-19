import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { slug, type } = await req.json()
    if (!slug || !['like', 'dislike'].includes(type)) {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const field = type === 'like' ? 'likes' : 'dislikes'

    const { data } = await supabase
      .from('blog_posts')
      .select(field)
      .eq('slug', slug)
      .maybeSingle()

    if (!data) return NextResponse.json({ success: false }, { status: 404 })

    await supabase
      .from('blog_posts')
      .update({ [field]: ((data as Record<string, number>)[field] || 0) + 1 })
      .eq('slug', slug)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
