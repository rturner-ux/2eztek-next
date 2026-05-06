import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Fitness Equipment Repair Blog Dallas | 2EZ TEK',
  description:
    'Fitness equipment repair tips, preventative maintenance advice, treadmill diagnostics, gym assembly insights, and SmartGymOps technology updates from 2EZ TEK.',
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string | null
  cover_image: string | null
  created_at: string
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, cover_image, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const blogPosts = (posts || []) as BlogPost[]
  const featuredPost = blogPosts[0]

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/blog-gym-background.webp"
          alt="2EZ TEK blog background"
          className="hero-image h-full w-[112%] max-w-none object-cover opacity-[0.5]"
        />

        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,20,0.42)_0%,rgba(5,11,20,0.96)_100%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_34%)]" />
      </div>

      <section className="relative z-10 px-6 pb-20 pt-32 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300 backdrop-blur-xl">
              2EZ TEK Knowledge Center
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/60">
              {blogPosts.length} Published Articles
            </div>
          </div>

          <div className="mt-10 grid gap-16 lg:grid-cols-[1fr,380px]">
            <div>
              <h1 className="text-5xl font-black leading-[0.92] tracking-tight md:text-7xl">
                Fitness Equipment
                <span className="block text-white/58">
                  Repair Intelligence.
                </span>
              </h1>

              <p className="mt-8 max-w-3xl text-lg leading-8 text-white/74 md:text-xl">
                Expert insights, commercial maintenance knowledge, repair
                diagnostics, assembly guidance, SmartGymOps technology updates,
                and real-world fitness equipment service experience from 2EZ TEK.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4 backdrop-blur-xl">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                    Commercial Service
                  </div>

                  <div className="mt-2 text-sm text-white/70">
                    Gyms • Apartments • Hotels • Studios
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4 backdrop-blur-xl">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                    SmartGymOps Powered
                  </div>

                  <div className="mt-2 text-sm text-white/70">
                    AI-driven service workflows
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/25 p-7 backdrop-blur-2xl">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                Popular Topics
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  'Treadmill Repair',
                  'Preventative Maintenance',
                  'NordicTrack Issues',
                  'Commercial Gym Service',
                  'Assembly',
                  'Diagnostics',
                ].map((topic) => (
                  <div
                    key={topic}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75"
                  >
                    {topic}
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-5">
                <div className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">
                  Goal
                </div>

                <p className="mt-3 text-sm leading-7 text-white/70">
                  Helping gym owners, residential customers, and fitness
                  facilities better understand equipment problems before they
                  become expensive failures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-28 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {!featuredPost ? (
            <div className="rounded-[3rem] border border-white/10 bg-black/25 p-14 text-center backdrop-blur-2xl">
              <h2 className="text-4xl font-black">No blog posts yet.</h2>

              <p className="mt-4 text-white/65">
                Publish your first article from the SmartGymOps blog CMS.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                    Featured Insight
                  </div>

                  <h2 className="mt-3 text-4xl font-black md:text-5xl">
                    Latest Featured Article
                  </h2>
                </div>
              </div>

              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group block overflow-hidden rounded-[3rem] border border-white/10 bg-black/22 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:border-cyan-300/25"
              >
                <div className="grid lg:grid-cols-[1.15fr,0.85fr]">
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        featuredPost.cover_image ||
                        '/images/blog-gym-background.webp'
                      }
                      alt={featuredPost.title}
                      className="h-full min-h-[520px] w-full object-cover transition duration-[2200ms] group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.68)_100%)]" />

                    <div className="absolute left-8 top-8 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-5 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-200 backdrop-blur-xl">
                      Featured
                    </div>
                  </div>

                  <div className="flex flex-col justify-center p-10 md:p-14">
                    <div className="inline-flex w-fit rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">
                      {featuredPost.category || '2EZ TEK Blog'}
                    </div>

                    <div className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
                      {formatDate(featuredPost.created_at)}
                    </div>

                    <h2 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
                      {featuredPost.title}
                    </h2>

                    {featuredPost.excerpt && (
                      <p className="mt-7 text-lg leading-8 text-white/74">
                        {featuredPost.excerpt}
                      </p>
                    )}

                    <div className="mt-10 inline-flex w-fit rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-black transition group-hover:bg-cyan-300">
                      Read Full Article
                    </div>
                  </div>
                </div>
              </Link>

              <div className="mt-28">
                <div className="mb-14">
                  <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                    Latest Articles
                  </div>

                  <h2 className="mt-4 text-4xl font-black md:text-6xl">
                    Repair Knowledge
                    <span className="block text-white/60">
                      Built From Real Experience.
                    </span>
                  </h2>
                </div>

                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {blogPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/22 shadow-[0_25px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition duration-500 hover:-translate-y-2 hover:border-cyan-300/20"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={
                            post.cover_image ||
                            '/images/blog-gym-background.webp'
                          }
                          alt={post.title}
                          className="h-[280px] w-full object-cover transition duration-[1800ms] group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(0,0,0,0.82)_100%)]" />
                      </div>

                      <div className="p-7">
                        <div className="flex items-center justify-between gap-4">
                          <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">
                            {post.category || '2EZ TEK Blog'}
                          </div>

                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
                            {formatDate(post.created_at)}
                          </div>
                        </div>

                        <h3 className="mt-6 text-3xl font-black leading-tight">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="mt-5 line-clamp-3 leading-7 text-white/65">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="mt-8 inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-xl transition group-hover:border-cyan-300/20 group-hover:bg-cyan-300/10 group-hover:text-cyan-200">
                          Read More
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}