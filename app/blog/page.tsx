import { createClient } from '@supabase/supabase-js'
import BlogClient from './BlogClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fitness Equipment Repair Blog | Tips & Guides | 2EZ TEK',
  description: 'Expert fitness equipment repair guides, treadmill tips, commercial gym maintenance advice, and repair diagnostics from 2EZ TEK in Dallas Fort Worth.',
  alternates: { canonical: 'https://www.2eztek.com/blog' },
  openGraph: {
    title: 'Fitness Equipment Repair Blog | Tips & Guides | 2EZ TEK',
    description: 'Expert fitness equipment repair guides, treadmill tips, commercial gym maintenance advice, and repair diagnostics from 2EZ TEK in Dallas Fort Worth.',
    url: 'https://www.2eztek.com/blog',
    siteName: '2EZ TEK',
    type: 'website',
    images: [
      {
        url: '/images/gym-equipment-repair-dallas.webp',
        width: 1200,
        height: 630,
        alt: '2EZ TEK Fitness Equipment Repair Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fitness Equipment Repair Blog | Tips & Guides | 2EZ TEK',
    description: 'Expert fitness equipment repair guides, treadmill tips, and commercial gym maintenance advice from 2EZ TEK in Dallas Fort Worth.',
    images: ['/images/gym-equipment-repair-dallas.webp'],
  },
}

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string | null
  hero_image_url: string | null
  created_at: string
}

const PAGE_SIZE = 12

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10))
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = getSupabaseClient()

  const [{ data, error }, { count }] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, category, hero_image_url, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(from, to),

    supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', true),
  ])

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

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  return <BlogClient posts={posts} currentPage={currentPage} totalPages={totalPages} totalPosts={count || 0} />
}