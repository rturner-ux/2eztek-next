import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function checkPassword(req: Request) {
  const password = req.headers.get('x-admin-password')
  return password && password === process.env.ADMIN_BLOG_PASSWORD
}

function makeSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function GET(req: Request) {
  if (!checkPassword(req)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, posts: data })
}

export async function POST(req: Request) {
  if (!checkPassword(req)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const body = await req.json()

  const slug = body.slug || makeSlug(body.title)

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .insert({
      title: body.title,
      slug,
      excerpt: body.excerpt,
      content: body.content,
      category: body.category,
      cover_image: body.cover_image,
      published: body.published ?? true,
      author: body.author || '2EZ TEK',
      seo_title: body.seo_title || `${body.title} | 2EZ TEK`,
      seo_description: body.seo_description || body.excerpt,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, post: data })
}

export async function PUT(req: Request) {
  if (!checkPassword(req)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const body = await req.json()

  if (!body.id) {
    return NextResponse.json(
      { success: false, message: 'Post ID is required.' },
      { status: 400 }
    )
  }

  const slug = body.slug || makeSlug(body.title)

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .update({
      title: body.title,
      slug,
      excerpt: body.excerpt,
      content: body.content,
      category: body.category,
      cover_image: body.cover_image,
      published: body.published,
      seo_title: body.seo_title || `${body.title} | 2EZ TEK`,
      seo_description: body.seo_description || body.excerpt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', body.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, post: data })
}

export async function DELETE(req: Request) {
  if (!checkPassword(req)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { id } = await req.json()

  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Post ID is required.' },
      { status: 400 }
    )
  }

  const { error } = await supabaseAdmin
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}