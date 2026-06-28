import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function auth(req: Request) {
  const pw = req.headers.get('x-admin-password')
  return pw === process.env.ADMIN_BLOG_PASSWORD
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function GET(req: Request) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await db()
    .from('featured_athletes')
    .select('*')
    .order('featured_date', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ athletes: data })
}

export async function POST(req: Request) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const {
    athlete_name, tagline, location, gym_type, gym_name,
    content, equipment_used, workout_style, quote,
    hero_image_url, instagram_url, facebook_url, tiktok_url, youtube_url,
    featured_date, published,
  } = body

  if (!athlete_name || !content) {
    return NextResponse.json({ error: 'athlete_name and content are required' }, { status: 400 })
  }

  const slug = slugify(athlete_name) + '-' + (featured_date ?? new Date().toISOString().slice(0, 10))

  const { data, error } = await db()
    .from('featured_athletes')
    .insert({
      slug, athlete_name, tagline, location, gym_type: gym_type || 'home_gym',
      gym_name, content, equipment_used, workout_style, quote,
      hero_image_url, instagram_url, facebook_url, tiktok_url, youtube_url,
      featured_date: featured_date || new Date().toISOString().slice(0, 10),
      published: published ?? false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, athlete: data })
}

export async function PUT(req: Request) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, ...fields } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { data, error } = await db()
    .from('featured_athletes')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, athlete: data })
}

export async function DELETE(req: Request) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await db().from('featured_athletes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
