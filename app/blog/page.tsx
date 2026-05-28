import { createClient } from '@supabase/supabase-js'
import BlogClient from './BlogClient'

export const dynamic = 'force-dynamic'

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string | null
  hero_image_url: string | null
  created_at: string
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

export default async function BlogPage() {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, hero_image_url, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('BLOG POSTS LOAD ERROR:', error)
  }

  const posts: BlogPost[] = (data || []).map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    hero_image_url: post.hero_image_url || null,
    created_at: post.created_at,
  }))

  return <BlogClient posts={posts} />
}