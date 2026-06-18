// app/blog/BlogClient.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1.0, delay, ease: EASE },
  }),
}

const staggerContainer = (stagger = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
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

const topics = [
  'Treadmill Repair',
  'Preventative Maintenance',
  'NordicTrack Issues',
  'Commercial Gym Service',
  'Assembly',
  'Diagnostics',
]

function getPostImage(post: BlogPost) {
  return post.hero_image_url || '/images/gym-equipment-repair-dallas.webp'
}

export default function BlogClient({
  posts,
  currentPage,
  totalPages,
  totalPosts,
}: {
  posts: BlogPost[]
  currentPage: number
  totalPages: number
  totalPosts: number
}) {
  const router = useRouter()
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const featuredPost = posts[0]

  const filteredPosts = activeFilter
    ? posts.filter((p) => p.category?.trim() === activeFilter.trim())
    : posts

  const categories = Array.from(
    new Set(posts.map((p) => p.category).filter(Boolean))
  ) as string[]

  function goToPage(page: number) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    router.push(`/blog?page=${page}`)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      {/* Hero, photo background, keep text-white */}
      <section
        ref={heroRef}
        className="relative overflow-hidden pb-28 pt-36 lg:pt-44"
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div style={{ y: heroY }} className="relative h-[115%] w-[112%]">
            <motion.div
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.2, ease: EASE }}
              className="h-full w-full"
            >
              <img
                src="/images/gym-equipment-repair-dallas.webp"
                alt="2EZ TEK blog"
                className="h-full w-full object-cover opacity-90"
                fetchPriority="high"
                loading="eager"
              />
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.55)_100%)]" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 px-6 lg:px-16"
        >
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1fr,380px] lg:items-start">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
                  style={{ originX: 0 }}
                  className="block h-px w-10 bg-cyan-400"
                />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.55 }}
                  className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300"
                >
                  2EZ TEK Knowledge Center
                </motion.span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.7 }}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black text-white/70 backdrop-blur-sm"
                >
                  {totalPosts} Articles
                </motion.span>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 56 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
                className="text-5xl font-black leading-[0.92] tracking-tight text-white md:text-7xl"
              >
                Fitness Equipment
                <span className="block text-cyan-400">Repair Intelligence.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
                className="mt-8 max-w-3xl text-lg leading-8 text-white/80 md:text-xl"
              >
                Expert insights, commercial maintenance knowledge, repair
                diagnostics, assembly guidance, SmartGymOps technology updates,
                and real-world fitness equipment service experience.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
                className="mt-8 flex flex-wrap gap-3"
              >
                {[
                  { label: 'Commercial Service', sub: 'Gyms · Apartments · Hotels · Studios' },
                  { label: 'SmartGymOps Powered', sub: 'AI-driven service workflows' },
                ].map((chip) => (
                  <div
                    key={chip.label}
                    className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm"
                  >
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                      {chip.label}
                    </div>
                    <div className="mt-1 text-sm text-white/70">{chip.sub}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
              className="rounded-[2rem] border border-white/15 bg-white/10 p-7 backdrop-blur-sm"
            >
              <div className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                Popular Topics
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/75"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                  Our Goal
                </div>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  Helping gym owners, residential customers, and fitness
                  facilities better understand equipment problems before they
                  become expensive failures.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {!featuredPost ? (
        <section className="bg-slate-50 px-6 py-28 lg:px-16">
          <div className="mx-auto max-w-7xl rounded-[3rem] border border-slate-200 bg-white p-14 text-center shadow-sm">
            <h2 className="text-4xl font-black text-slate-900">No blog posts yet.</h2>
            <p className="mt-4 text-slate-500">
              Publish your first article from the SmartGymOps blog CMS.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* Featured post, only on page 1 */}
          {currentPage === 1 && (
            <section className="border-t border-slate-200 bg-slate-50 px-6 py-28 lg:px-16">
              <div className="mx-auto max-w-7xl">
                <Reveal className="mb-12">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-px w-8 bg-cyan-400" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">
                      Featured Insight
                    </span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 md:text-5xl">
                    Latest Featured Article
                  </h2>
                </Reveal>

                <motion.div
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.9, ease: EASE }}
                >
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="group block overflow-hidden rounded-[3rem] border border-slate-200 bg-white shadow-[0_30px_120px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:border-cyan-300"
                  >
                    <div className="grid lg:grid-cols-[1.15fr,0.85fr]">
                      <div className="relative min-h-[400px] overflow-hidden bg-slate-100 lg:min-h-[520px]">
                        <img
                          src={getPostImage(featuredPost)}
                          alt={featuredPost.title}
                          className="absolute inset-0 h-full w-full object-cover transition duration-[2200ms] group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.65)_100%)]" />
                        <div className="absolute left-7 top-7">
                          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-5 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-600">
                            Featured
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center p-10 md:p-14">
                        <div className="mb-5 flex flex-wrap items-center gap-3">
                          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-600">
                            {featuredPost.category || '2EZ TEK Blog'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDate(featuredPost.created_at)}
                          </span>
                        </div>
                        <h2 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">
                          {featuredPost.title}
                        </h2>
                        {featuredPost.excerpt && (
                          <p className="mt-6 text-lg leading-8 text-slate-600">
                            {featuredPost.excerpt}
                          </p>
                        )}
                        <div className="mt-10 inline-flex w-fit items-center gap-3 rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-black transition group-hover:bg-cyan-300">
                          Read Full Article <span>→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </section>
          )}

          {/* Articles grid */}
          <section className="border-t border-slate-200 bg-white px-6 py-28 lg:px-16">
            <div className="mx-auto max-w-7xl">
              <Reveal className="mb-14">
                <div className="mb-6 flex items-center gap-3">
                  <span className="h-px w-8 bg-cyan-400" />
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">
                    Latest Articles
                  </span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 md:text-6xl">
                  Repair Knowledge
                  <span className="block text-slate-400">
                    Built From Real Experience.
                  </span>
                </h2>
              </Reveal>

              {categories.length > 0 && (
                <Reveal delay={0.1} className="mb-10 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveFilter(null)}
                    className={`rounded-full border px-5 py-2 text-xs font-black uppercase tracking-[0.15em] transition ${
                      !activeFilter
                        ? 'border-cyan-400 bg-cyan-50 text-cyan-600'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-cyan-300 hover:bg-cyan-50'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveFilter(cat)}
                      className={`max-w-[200px] truncate rounded-full border px-5 py-2 text-xs font-black uppercase tracking-[0.15em] transition ${
                        activeFilter === cat
                          ? 'border-cyan-400 bg-cyan-50 text-cyan-600'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-cyan-300 hover:bg-cyan-50'
                      }`}
                      title={cat}
                    >
                      {cat.length > 20 ? cat.slice(0, 20) + '…' : cat}
                    </button>
                  ))}
                </Reveal>
              )}

              {filteredPosts.length > 0 ? (
                <motion.div
                  key={activeFilter ?? 'all'}
                  variants={staggerContainer(0.07, 0.1)}
                  initial="hidden"
                  animate="show"
                  className="grid gap-8 md:grid-cols-2 xl:grid-cols-3"
                >
                  {filteredPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      variants={staggerItem}
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group block overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_25px_90px_rgba(0,0,0,0.07)] transition-colors duration-500 hover:border-cyan-300"
                      >
                        <div className="relative h-[260px] overflow-hidden bg-slate-100">
                          <img
                            src={getPostImage(post)}
                            alt={post.title}
                            className="absolute inset-0 h-full w-full object-cover transition duration-[1800ms] group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(0,0,0,0.82)_100%)]" />
                          <div className="absolute bottom-4 left-4">
                            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-600">
                              {post.category || '2EZ TEK Blog'}
                            </span>
                          </div>
                        </div>
                        <div className="p-7">
                          <div className="mb-4 text-xs text-slate-400">
                            {formatDate(post.created_at)}
                          </div>
                          <h3 className="text-2xl font-black leading-tight text-slate-900 transition-colors duration-300 group-hover:text-cyan-600">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-500">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400 transition-colors duration-300 group-hover:text-cyan-600">
                            Read More <span>→</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                  <p className="text-slate-500">No articles in this category yet.</p>
                  <button
                    onClick={() => setActiveFilter(null)}
                    className="mt-4 text-sm font-black text-cyan-600"
                  >
                    Clear filter
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Reveal delay={0.2} className="mt-16 flex items-center justify-center gap-3">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ← Prev
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`h-10 w-10 rounded-xl text-sm font-black transition ${
                          page === currentPage
                            ? 'bg-cyan-400 text-black'
                            : 'border border-slate-200 bg-white text-slate-500 hover:border-cyan-300 hover:bg-cyan-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Next →
                  </button>
                </Reveal>
              )}

              {/* Page info */}
              {totalPages > 1 && (
                <p className="mt-6 text-center text-xs text-slate-400">
                  Page {currentPage} of {totalPages} · {totalPosts} total articles
                </p>
              )}
            </div>
          </section>
        </>
      )}

      {/* Final CTA, dark for contrast */}
      <section className="border-t border-slate-200 bg-slate-900 px-6 py-28 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-cyan-400/20 bg-black/20 p-10 shadow-[0_30px_120px_rgba(0,0,0,0.38)] md:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr,320px] lg:items-center">
            <Reveal>
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-cyan-400" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">
                  Experience The Difference
                </span>
              </div>
              <h2 className="max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
                Let's Get Your Equipment
                <span className="block text-white/45">Running Again.</span>
              </h2>
              <div className="mt-8 grid gap-3 md:grid-cols-2">
                {[
                  'Fast response times',
                  'Experienced technicians',
                  'Commercial & residential service',
                  'Trusted across DFW',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-white/70">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-xs font-black text-black">
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.15} className="flex flex-col gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))} className="block rounded-2xl bg-cyan-400 px-7 py-5 text-center text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_35px_rgba(34,211,238,0.35)] transition hover:bg-cyan-300">Book Service</button>
              </motion.div>
              <a
                href="tel:9728077232"
                className="rounded-2xl border border-white/10 bg-white/5 px-7 py-5 text-center text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
              >
                Call (972) 807-7232
              </a>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}
