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
  // Posts generated with old prompts contain HTML tags, render them natively
  if (/<(h[1-6]|ul|ol|li|p|div|strong|em|br)\b/i.test(content)) {
    return (
      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return content.split('\n').map((line, index) => {
    const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/)

    if (imageMatch) {
      const alt = imageMatch[1] || 'Blog image'
      const src = imageMatch[2]

      return (
        <div key={index} className="my-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50">
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
        <h2 key={index} className="mb-5 mt-12 text-3xl font-black text-slate-900 md:text-4xl">
          {line.replace('## ', '')}
        </h2>
      )
    }

    if (line.startsWith('# ')) {
      return null
    }

    if (line.startsWith('- ')) {
      return (
        <p key={index} className="ml-4 text-lg leading-9 text-slate-700">
          • {line.replace('- ', '')}
        </p>
      )
    }

    if (!line.trim()) {
      return <div key={index} className="h-5" />
    }

    return (
      <p key={index} className="text-lg leading-9 text-slate-700">
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
    alternates: {
      canonical: `https://www.2eztek.com/blog/${slug}`,
    },
    openGraph: {
      title: data.seo_title || `${data.title} | 2EZ TEK`,
      description: data.seo_description || data.excerpt || '',
      url: `https://www.2eztek.com/blog/${slug}`,
      siteName: '2EZ TEK',
      type: 'article',
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

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seo_description || post.excerpt || '',
    image: heroImage.startsWith('http') ? heroImage : `https://www.2eztek.com${heroImage}`,
    datePublished: post.created_at,
    dateModified: post.created_at,
    author: {
      '@type': 'Person',
      name: 'Robby Turner',
      jobTitle: 'Founder & CEO',
      url: 'https://www.2eztek.com/about-2ez-tek',
      worksFor: {
        '@type': 'Organization',
        name: '2EZ TEK',
        url: 'https://www.2eztek.com',
      },
    },
    publisher: {
      '@type': 'Organization',
      name: '2EZ TEK',
      logo: { '@type': 'ImageObject', url: 'https://www.2eztek.com/images/2eztek-logo.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.2eztek.com/blog/${post.slug}` },
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* Fixed hero image, dark overlay keeps text readable */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src={heroImage}
          alt={post.title}
          className="hero-image h-full w-[112%] max-w-none object-cover opacity-[0.45]"
        />

        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,20,0.62)_0%,rgba(5,11,20,0.96)_100%)]" />
      </div>

      {/* Article content, light background card over the dark fixed bg */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-28 pt-32">
        <Link href="/blog" className="text-sm font-bold text-cyan-400">
          ← Back to Blog
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-600">
            {post.category || '2EZ TEK Blog'}
          </div>

          {post.created_at && (
            <div className="text-sm font-bold text-white/45">
              {formatDate(post.created_at)}
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="h-7 w-7 overflow-hidden rounded-full border border-white/20">
              <img src="/images/profile-image.jpg" alt="Robby Turner" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <span className="text-sm text-white/50">
              By <span className="font-bold text-white/75">Robby Turner</span>, Founder & CEO
            </span>
          </div>
        </div>

        <h1 className="mt-7 text-5xl font-black leading-tight text-white md:text-7xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-7 text-xl leading-9 text-white/75">
            {post.excerpt}
          </p>
        )}

        <div className="mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-2xl">
          <img
            src={heroImage}
            alt={post.title}
            className="max-h-[520px] w-full object-cover"
            fetchPriority="high"
            loading="eager"
          />
        </div>

        {galleryImages.length > 0 && (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {galleryImages.map((image) => (
              <div
                key={image}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
              >
                <img
                  src={image}
                  alt={post.title}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 space-y-2 rounded-[2rem] bg-white px-8 py-10 shadow-sm">
          {renderContent(post.content)}
        </div>

        {/* Manual finder callout */}
        {(() => {
          const BRANDS = [
            'NordicTrack','ProForm','Life Fitness','Precor','Schwinn','Bowflex',
            'Peloton','Matrix','Cybex','Nautilus','FreeMotion','StairMaster',
            'Marcy','Body-Solid','Hammer Strength','Sole','Horizon','Rogue',
          ]
          const brand = BRANDS.find(b => post.title.toLowerCase().includes(b.toLowerCase())) ?? null
          return (
            <div className="mt-10 rounded-[2rem] border border-cyan-400/20 bg-[#050e1e] p-8">
              <div className="flex gap-5">
                <span className="text-3xl">📄</span>
                <div>
                  <h3 className="text-xl font-black text-white">
                    {brand ? `Looking for your ${brand} manual?` : 'Looking for your equipment manual?'}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-white/55">
                    {brand
                      ? `Browse the full ${brand} manual library, owner manuals, assembly guides, and service docs for every model we service.`
                      : 'Browse our manual library, owner manuals, assembly guides, and service docs for hundreds of models.'}
                  </p>
                  <Link
                    href="/manuals"
                    className="mt-5 inline-flex rounded-xl bg-cyan-400 px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-cyan-300"
                  >
                    Browse {brand ? `${brand} ` : ''}Manuals →
                  </Link>
                </div>
              </div>
            </div>
          )
        })()}

        {/* End-of-article CTA, dark for contrast */}
        <div className="mt-16 rounded-[2rem] bg-slate-900 p-8">
          <h2 className="text-3xl font-black text-white">
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
              className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-white"
            >
              Call (972) 807-7232
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
