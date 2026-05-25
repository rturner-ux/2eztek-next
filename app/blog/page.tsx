// app/blog/page.tsx
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import BlogClient from './BlogClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fitness Equipment Repair Blog Dallas',
  description:
    'Fitness equipment repair tips, preventative maintenance advice, treadmill diagnostics, gym assembly insights, and SmartGymOps technology updates from 2EZ TEK.',
  alternates: { canonical: 'https://2eztek.com/blog' },
  openGraph: {
    title: 'Fitness Equipment Repair Blog Dallas | 2EZ TEK',
    description:
      'Expert insights on fitness equipment repair, commercial maintenance, and SmartGymOps technology from 2EZ TEK.',
    url: 'https://2eztek.com/blog',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string | null
  cover_image: string | null
  created_at: string
}

export default async function BlogPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, cover_image, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const blogPosts = (posts || []) as BlogPost[]

  return <BlogClient posts={blogPosts} />
}
