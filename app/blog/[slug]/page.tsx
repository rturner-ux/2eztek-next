import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import BookServiceButton from '@/components/BookServiceButton'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  category: string | null
  hero_image_url: string | null
  gallery_images: string[] | null
  published: boolean
  seo_title: string | null
  seo_description: string | null
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

function formatDate(value?: string | null) {
  if (!value) return ''

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function renderContent(content: string) {
  return content.split('\n').map((line, index) => {
    const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/)

    if (imageMatch) {
      const alt = imageMatch[1] || 'Blog image'
      const src = imageMatch[2]

      return (
        <div key={index} className="my-10 overflow-hidden rounded-[2rem] border border-white/10 bg-black/30">
          <img
            src={src}
            alt={alt}
            className="w-full object-cover"
          />
        </div>
      )
    }

    if (line.startsWith('## ')) {
      return (
        <h2 key={index} className="mb-5 mt-12 text-3xl font-black text-white md:text-4xl">
          {line.replace('## ', '')}
        </h2>
      )
    }

    if (line.startsWith('# ')) {
      return null
    }

    if (line.startsWith('- ')) {
      return (
        <p key={index} className="ml-4 text-lg leading-9 text-white/78">
          • {line.replace('- ', '')}
        </p>
      )
    }

    if (!line.trim()) {
      return <div key={index} className="h-5" />
    }

    return (
      <p key={index} className="text-lg leading-9 text-white/78">
        {line}
      </p>
    )
  })
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = getSupabaseClient()

  const { data } = await supabase
    .from('blog_posts')
    .select('title, seo_title, seo_description, excerpt, hero_image_url')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (!data) {
    return {
      title: 'Blog Article | 2EZ TEK',
    }
  }

  return {
    title: data.seo_title || `${data.title} | 2EZ TEK`,
    description: data.seo_description || data.excerpt || '',
    openGraph: {
      title: data.seo_title || `${data.title} | 2EZ TEK`,
      description: data.seo_description || data.excerpt || '',
      images: data.hero_image_url ? [data.hero_image_url] : ['/images/blog-gym-background.webp'],
    },
  }
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = getSupabaseClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select(
      'id, title, slug, excerpt, content, category, hero_image_url, gallery_images, published, seo_title, seo_description, created_at'
    )
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle<BlogPost>()

  if (!post) {
    notFound()
  }

  const heroImage = post.hero_image_url || '/images/blog-gym-background.webp'
  const galleryImages = Array.isArray(post.gallery_images) ? post.gallery_images : []

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src={heroImage}
          alt={post.title}
          className="hero-image h-full w-[112%] max-w-none object-cover opacity-[0.45]"
        />

        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,20,0.62)_0%,rgba(5,11,20,0.96)_100%)]" />
      </div>

      <article className="relative z-10 mx-auto max-w-4xl px-6 pb-28 pt-32">
        <Link href="/blog" className="text-sm font-bold text-cyan-300">
          ← Back to Blog
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
            {post.category || '2EZ TEK Blog'}
          </div>

          {post.created_at && (
            <div className="text-sm font-bold text-white/45">
              {formatDate(post.created_at)}
            </div>
          )}
        </div>

        <h1 className="mt-7 text-5xl font-black leading-tight md:text-7xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-7 text-xl leading-9 text-white/75">
            {post.excerpt}
          </p>
        )}

        <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 shadow-2xl">
          <img
            src={heroImage}
            alt={post.title}
            className="max-h-[520px] w-full object-cover"
          />
        </div>

        {galleryImages.length > 0 && (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {galleryImages.map((image) => (
              <div
                key={image}
                className="overflow-hidden rounded-2xl border border-white/10 bg-black/30"
              >
                <img
                  src={image}
                  alt={post.title}
                  className="h-44 w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 space-y-2">
          {renderContent(post.content)}
        </div>

        <div className="mt-16 rounded-[2rem] border border-cyan-400/20 bg-black/30 p-8 backdrop-blur-xl">
          <h2 className="text-3xl font-black">
            Need fitness equipment service?
          </h2>

          <p className="mt-4 text-white/70">
            2EZ TEK provides repair, assembly, installation, and maintenance across Dallas Fort Worth.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <BookServiceButton
              label="Request Service"
              className="rounded-2xl bg-cyan-400 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-black"
            />

            <a
              href="tel:9728077232"
              className="rounded-2xl border border-white/15 bg-white/10 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-white"
            >
              Call (972) 807-7232
            </a>
          </div>
        </div>
      </article>
    </main>
  )
}