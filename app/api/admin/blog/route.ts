import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, serviceKey)
}

function checkPassword(req: Request) {
  const password = req.headers.get('x-admin-password')
  return Boolean(password && password === process.env.ADMIN_BLOG_PASSWORD)
}

function makeSlug(title: string) {
  return String(title || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function GET(req: Request) {
  try {
    if (!checkPassword(req)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, posts: data || [] })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to load posts.' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    if (!checkPassword(req)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()

    if (!body.title) {
      return NextResponse.json(
        { success: false, message: 'Title is required.' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    const slug = body.slug || makeSlug(body.title)

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert({
        title: body.title,
        slug,
        excerpt: body.excerpt || '',
        content: body.content || '',
        category: body.category || 'General',
        cover_image: body.cover_image || null,
        published: body.published ?? true,
        author: body.author || '2EZ TEK',
        seo_title: body.seo_title || `${body.title} | 2EZ TEK`,
        seo_description: body.seo_description || body.excerpt || '',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, post: data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create post.' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
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

    if (!body.title) {
      return NextResponse.json(
        { success: false, message: 'Title is required.' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    const slug = body.slug || makeSlug(body.title)

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update({
        title: body.title,
        slug,
        excerpt: body.excerpt || '',
        content: body.content || '',
        category: body.category || 'General',
        cover_image: body.cover_image || null,
        published: body.published ?? true,
        seo_title: body.seo_title || `${body.title} | 2EZ TEK`,
        seo_description: body.seo_description || body.excerpt || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, post: data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update post.' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
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

    const supabaseAdmin = getSupabaseAdmin()

    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete post.' },
      { status: 500 }
    )
  }
}