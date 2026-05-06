import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params

  const { data } = await supabase
    .from('blog_posts')
    .select('title, seo_title, seo_description, excerpt')
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
  }
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (!post) notFound()

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src={post.cover_image || '/images/blog-gym-background.webp'}
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

        <div className="mt-8 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
          {post.category || '2EZ TEK Blog'}
        </div>

        <h1 className="mt-7 text-5xl font-black leading-tight md:text-7xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-7 text-xl leading-9 text-white/75">
            {post.excerpt}
          </p>
        )}

        <div className="mt-12 whitespace-pre-line text-lg leading-9 text-white/78">
          {post.content}
        </div>

        <div className="mt-16 rounded-[2rem] border border-cyan-400/20 bg-black/30 p-8 backdrop-blur-xl">
          <h2 className="text-3xl font-black">Need fitness equipment service?</h2>

          <p className="mt-4 text-white/70">
            2EZ TEK provides repair, assembly, installation, and maintenance
            across Dallas Fort Worth.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-2xl bg-cyan-400 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-black"
            >
              Request Service
            </Link>

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