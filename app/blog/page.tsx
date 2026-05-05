import Link from 'next/link'

export const metadata = {
  title: 'Fitness Equipment Blog | 2EZ TEK',
  description:
    'Fitness equipment repair tips, preventative maintenance advice, gym installation insights, SmartGymOps technology updates, and commercial gym service content from 2EZ TEK.',
}

const featuredPost = {
  title: 'Why Preventative Maintenance Saves Commercial Gyms Thousands',
  category: 'Commercial Maintenance',
  image: '/images/rogue.webp',
  excerpt:
    'Preventative maintenance is one of the most overlooked ways to protect commercial fitness equipment, reduce downtime, and improve member retention.',
}

const blogPosts = [
  {
    title: '5 Signs Your Treadmill Needs Professional Repair',
    category: 'Treadmill Repair',
    image: '/images/gym-equipment-repair-dallas.webp',
  },
  {
    title: 'How SmartGymOps Is Changing Fitness Equipment Service',
    category: 'SmartGymOps',
    image: '/images/about-smartgymops-support.webp',
  },
  {
    title: 'Why Commercial Gyms Need Preventative Maintenance Plans',
    category: 'Commercial Maintenance',
    image: '/images/rogue.webp',
  },
  {
    title: 'Home Gym Installation Mistakes To Avoid',
    category: 'Assembly & Installation',
    image: '/images/Gym Build.webp',
  },
  {
    title: 'How To Extend The Life Of Your Fitness Equipment',
    category: 'Equipment Care',
    image: '/images/project-5.webp',
  },
  {
    title: 'What Causes Treadmill Belt Slipping?',
    category: 'Repair Diagnostics',
    image: '/images/project-4.webp',
  },
]

export default function BlogPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/about-smartgymops-support.webp"
          alt="2EZ TEK blog"
          className="hero-image h-full w-[112%] max-w-none object-cover opacity-[0.24]"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,20,0.72)_0%,rgba(5,11,20,0.94)_100%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%)]" />
      </div>

      <section className="relative z-10 px-6 pb-24 pt-32 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300 backdrop-blur-xl">
              2EZ TEK Blog
            </div>

            <h1 className="mt-7 text-5xl font-black leading-[0.92] tracking-tight md:text-7xl">
              Fitness Equipment
              <span className="block text-white/55">
                Insights & Service Knowledge.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/72 md:text-xl">
              Expert insights on treadmill repair, preventative maintenance,
              gym assembly, SmartGymOps technology, and commercial fitness
              equipment service across Dallas Fort Worth.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-2xl bg-cyan-400 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-black shadow-[0_0_40px_rgba(34,211,238,0.30)] transition hover:scale-[1.02] hover:bg-cyan-300"
              >
                Book Service
              </Link>

              <a
                href="tel:9728077232"
                className="rounded-2xl border border-white/10 bg-white/10 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Call (972) 807-7232
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-28 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[3rem] border border-white/10 bg-black/20 shadow-[0_30px_120px_rgba(0,0,0,0.40)] backdrop-blur-2xl">
            <div className="grid lg:grid-cols-[1.1fr,0.9fr]">
              <div className="relative overflow-hidden">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="h-full min-h-[420px] w-full object-cover"
                />

                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.65)_100%)]" />
              </div>

              <div className="flex flex-col justify-center p-10 md:p-14">
                <div className="inline-flex w-fit rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">
                  Featured Article
                </div>

                <h2 className="mt-6 text-4xl font-black leading-tight">
                  {featuredPost.title}
                </h2>

                <p className="mt-7 text-lg leading-8 text-white/75">
                  {featuredPost.excerpt}
                </p>

                <div className="mt-10">
                  <button className="rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-cyan-300">
                    Read Article
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24">
            <div className="mb-12">
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                Latest Articles
              </div>

              <h2 className="mt-4 text-4xl font-black md:text-6xl">
                Service Knowledge
                <span className="block text-white/60">
                  Built From Experience.
                </span>
              </h2>
            </div>

            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {blogPosts.map((post, index) => (
                <div
                  key={index}
                  className="group overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/20 shadow-[0_25px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition duration-500 hover:-translate-y-2 hover:border-cyan-300/20"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-[260px] w-full object-cover transition duration-[1800ms] group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(0,0,0,0.78)_100%)]" />
                  </div>

                  <div className="p-7">
                    <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">
                      {post.category}
                    </div>

                    <h3 className="mt-5 text-3xl font-black leading-tight">
                      {post.title}
                    </h3>

                    <div className="mt-8">
                      <button className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-xl transition hover:border-cyan-300/20 hover:bg-cyan-300/10 hover:text-cyan-200">
                        Read More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}