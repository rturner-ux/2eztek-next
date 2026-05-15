import Link from 'next/link'

export const metadata = {
  title: 'Facility Spotlight | Trusted Fitness Facilities | 2EZ TEK',
  description:
    'Explore featured gyms, fitness studios, apartment fitness centers, hotels, schools, and commercial facilities trusted by 2EZ TEK for fitness equipment repair, maintenance, and assembly services across Dallas Fort Worth.',
}

const featuredFacilities = [
  {
    id: 1,
    name: 'Elite Strength Dallas',
    city: 'Dallas, Texas',
    type: 'Private Training Facility',
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop',
    description:
      'A high-performance training facility focused on strength development, athlete conditioning, and premium member experience.',
    services: [
      'Preventative Maintenance',
      'Treadmill Repair',
      'Cable Machine Service',
      'Quarterly Equipment Inspections',
    ],
    uptimeAward: true,
  },
  {
    id: 2,
    name: 'North Dallas Wellness Club',
    city: 'Plano, Texas',
    type: 'Commercial Fitness Center',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop',
    description:
      'A full-service commercial fitness facility maintaining a strong focus on equipment uptime and member satisfaction.',
    services: [
      'Elliptical Repair',
      'Bike Service',
      'Strength Equipment Maintenance',
      'Emergency Service Calls',
    ],
    uptimeAward: true,
  },
  {
    id: 3,
    name: 'Iron House Athletics',
    city: 'Fort Worth, Texas',
    type: 'Strength & Conditioning Gym',
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1600&auto=format&fit=crop',
    description:
      'An intense training environment built for athletes, personal trainers, and fitness enthusiasts seeking elite performance.',
    services: [
      'Functional Trainer Repair',
      'Assembly Services',
      'Preventative Maintenance',
      'Equipment Diagnostics',
    ],
    uptimeAward: false,
  },
]

export default function FacilitySpotlightPage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_34%),linear-gradient(180deg,rgba(34,211,238,0.08),transparent_45%)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-32">
          <div className="max-w-5xl">
            <div className="mb-6 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              2EZ TEK Facility Spotlight
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              Facilities That Prioritize
              <span className="block text-cyan-300">
                Equipment Uptime.
              </span>
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-white/70">
              Highlighting gyms, training facilities, apartment fitness centers,
              wellness clubs, and commercial fitness spaces that trust 2EZ TEK
              for professional fitness equipment repair, maintenance, assembly,
              and operational support.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black shadow-[0_0_35px_rgba(34,211,238,0.22)] transition hover:scale-105 hover:bg-cyan-300"
              >
                Request Service
              </Link>

              <a
                href="tel:9728077232"
                className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
              >
                Call 972-807-7232
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              Featured Facilities
            </div>

            <h2 className="text-4xl font-black md:text-5xl">
              Trusted By Fitness Facilities Across DFW
            </h2>
          </div>

          <div className="max-w-xl text-white/60">
            These facilities demonstrate a commitment to equipment care,
            preventative maintenance, and member experience.
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {featuredFacilities.map((facility) => (
            <div
              key={facility.id}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/[0.03]"
            >
              <div className="relative h-[260px] overflow-hidden">
                <img
                  src={facility.image}
                  alt={facility.name}
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/20 to-transparent" />

                <div className="absolute left-5 top-5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-xl">
                  {facility.type}
                </div>

                {facility.uptimeAward && (
                  <div className="absolute bottom-5 right-5 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 backdrop-blur-xl">
                    SmartGymOps Uptime Award
                  </div>
                )}
              </div>

              <div className="p-7">
                <div className="text-sm font-bold uppercase tracking-wide text-cyan-300">
                  {facility.city}
                </div>

                <h3 className="mt-3 text-3xl font-black leading-tight">
                  {facility.name}
                </h3>

                <p className="mt-5 leading-7 text-white/65">
                  {facility.description}
                </p>

                <div className="mt-7 flex flex-wrap gap-2">
                  {facility.services.map((service) => (
                    <div
                      key={service}
                      className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-black uppercase tracking-wide text-white/70"
                    >
                      {service}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black uppercase tracking-wide text-black transition hover:scale-[1.03]">
                    View Facility
                  </button>

                  <button className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/30">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-black/20">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                SmartGymOps Uptime Award
              </div>

              <h2 className="text-4xl font-black md:text-5xl">
                Recognizing Facilities That Stay Operational.
              </h2>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                The SmartGymOps Uptime Award highlights fitness facilities that
                demonstrate strong equipment maintenance practices, proactive
                service scheduling, and commitment to member experience.
              </p>
            </div>

            <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-10 backdrop-blur-xl">
              <div className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                Award Benefits
              </div>

              <div className="mt-8 space-y-5">
                {[
                  'Featured placement on 2EZ TEK website',
                  'Social media spotlight opportunities',
                  'Priority maintenance recognition',
                  'Professional facility credibility boost',
                  'Enhanced member trust and presentation',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="mt-1 h-3 w-3 rounded-full bg-cyan-300" />

                    <div className="text-white/75">
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}