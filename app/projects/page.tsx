<section className="relative z-10 px-6 py-28 lg:px-16">
  <div className="mx-auto max-w-7xl">
    <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300 backdrop-blur-xl">
          Featured Projects
        </div>

        <h2 className="mt-6 text-5xl font-black leading-[0.92] tracking-tight md:text-7xl">
          Real Installations.
          <span className="block text-white/55">
            Premium Results.
          </span>
        </h2>

        <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72">
          Explore luxury residential gym builds, commercial equipment
          installations, cable systems, functional trainers, and complete
          fitness room transformations completed by 2EZ TEK.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <a
          href="tel:9728077232"
          className="rounded-2xl bg-cyan-400 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-black shadow-[0_0_40px_rgba(34,211,238,0.30)] transition hover:scale-[1.02] hover:bg-cyan-300"
        >
          Call (972) 807-7232
        </a>

        <Link
          href="/contact"
          className="rounded-2xl border border-white/10 bg-white/10 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition hover:bg-white/15"
        >
          Request A Quote
        </Link>
      </div>
    </div>

    <div className="mt-20 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
      {[
        {
          image: '/images/project-1.webp',
          title: 'Luxury Functional Trainer Build',
          category: 'Residential Installation',
        },
        {
          image: '/images/project-2.webp',
          title: 'PRx Space Saving System',
          category: 'Garage Gym Conversion',
        },
        {
          image: '/images/project-3.webp',
          title: 'Commercial Strength Setup',
          category: 'Performance Facility',
        },
        {
          image: '/images/project-4.webp',
          title: 'StairMaster Cardio Installation',
          category: 'Commercial Cardio',
        },
        {
          image: '/images/project-5.webp',
          title: 'Modern Home Fitness Room',
          category: 'Luxury Home Gym',
        },
        {
          image: '/images/project-6.webp',
          title: 'Multi-Station Cable System',
          category: 'Custom Equipment Install',
        },
      ].map((project, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-[2.7rem] border border-white/10 bg-black/20 shadow-[0_30px_120px_rgba(0,0,0,0.40)] backdrop-blur-2xl"
        >
          <div className="relative overflow-hidden">
            <img
              src={project.image}
              alt={project.title}
              className="h-[420px] w-full object-cover transition duration-[1800ms] group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.18)_45%,rgba(0,0,0,0.82)_100%)]" />

            <div className="absolute inset-0 bg-cyan-400/0 transition duration-700 group-hover:bg-cyan-400/5" />

            <div className="absolute bottom-0 left-0 right-0 p-7">
              <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200 backdrop-blur-xl">
                {project.category}
              </div>

              <h3 className="mt-5 text-3xl font-black leading-tight text-white">
                {project.title}
              </h3>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/55">
                  2EZ TEK PROJECT
                </div>

                <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-xl transition group-hover:border-cyan-300/20 group-hover:bg-cyan-300/10 group-hover:text-cyan-200">
                  View Project
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>