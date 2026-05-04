import Link from 'next/link'

export const metadata = {
  title: 'SmartGymOps Features | 2EZ TEK',
  description:
    'Explore SmartGymOps features including AI diagnostics, GPS technician tracking, project management, QR reporting, service requests, maintenance history, and commercial gym operations tools.',
}

const features = [
  {
    title: 'AI Technician Assistant',
    text: 'Generate repair guidance, troubleshooting notes, equipment history summaries, and technician recommendations.',
  },
  {
    title: 'GPS Technician Tracking',
    text: 'Track technician location, job arrival, field progress, and active service coverage across the Dallas Fort Worth area.',
  },
  {
    title: 'Project Management',
    text: 'Manage commercial gym buildouts, installs, assembly projects, tasks, timelines, assignments, and completion stages.',
  },
  {
    title: 'QR Equipment Reporting',
    text: 'Allow gym staff and members to scan equipment QR codes and report issues instantly from the floor.',
  },
  {
    title: 'Service Request Workflow',
    text: 'Capture, organize, assign, and track every repair request from intake to completion.',
  },
  {
    title: 'Preventative Maintenance',
    text: 'Track maintenance schedules, recurring service, overdue machines, inspection history, and machine uptime.',
  },
  {
    title: 'Asset History',
    text: 'Store repair history, model information, serial numbers, machine locations, photos, and technician notes.',
  },
  {
    title: 'Client Portal',
    text: 'Give commercial clients visibility into requests, statuses, completed work, invoices, and maintenance activity.',
  },
]

const workflow = [
  'Issue Reported',
  'Request Created',
  'Technician Assigned',
  'GPS Check-In',
  'AI Repair Support',
  'Job Completed',
  'History Updated',
  'Maintenance Insight Saved',
]

export default function SmartGymOpsFeaturesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/Gym Build.webp"
          alt="SmartGymOps platform for gym equipment operations"
          className="hero-image h-full w-[112%] max-w-none object-cover opacity-[0.66]"
        />

        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,20,0.78)_0%,rgba(5,11,20,0.44)_45%,rgba(5,11,20,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.20),transparent_36%)]" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-xl">
              Powered By SmartGymOps
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[0.92] tracking-tight md:text-7xl">
              The Operating System
              <span className="block text-cyan-300">
                For Fitness Equipment Service.
              </span>
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-white/85 md:text-xl">
              SmartGymOps helps 2EZ TEK manage service requests, AI repair
              support, technician tracking, QR reporting, asset history,
              preventative maintenance, and commercial gym projects in one
              connected platform.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-2xl bg-cyan-400 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-black shadow-[0_0_45px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] hover:bg-cyan-300"
              >
                Request A Demo
              </Link>

              <Link
                href="https://smartgymops.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Visit SmartGymOps
              </Link>
            </div>
          </div>

          <div className="mt-20 grid gap-4 md:grid-cols-4">
            {[
              ['AI', 'Repair Support'],
              ['GPS', 'Tech Tracking'],
              ['QR', 'Issue Reporting'],
              ['PM', 'Maintenance Plans'],
            ].map(([stat, label]) => (
              <div
                key={label}
                className="rounded-[2rem] border border-white/10 bg-black/18 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              >
                <div className="text-5xl font-black text-cyan-300">
                  {stat}
                </div>

                <div className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-white/70">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
              Platform Features
            </div>

            <h2 className="mt-4 text-4xl font-black md:text-6xl">
              Everything Needed
              <span className="block text-white/60">
                To Run Smarter Service.
              </span>
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/18 p-7 shadow-[0_25px_90px_rgba(0,0,0,0.30)] backdrop-blur-2xl transition duration-500 hover:-translate-y-2 hover:border-cyan-300/30"
              >
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),transparent_65%)] opacity-80 transition duration-500 group-hover:opacity-100" />

                <div className="relative">
                  <div className="text-3xl font-black text-cyan-300">◆</div>

                  <h3 className="mt-6 text-2xl font-black leading-tight">
                    {feature.title}
                  </h3>

                  <p className="mt-5 leading-7 text-white/78">
                    {feature.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-cyan-400/20 bg-black/20 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-14">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                Live Product Flow
              </div>

              <h2 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
                From Problem
                <span className="block text-white/60">
                  To Resolution.
                </span>
              </h2>

              <p className="mt-7 text-lg leading-8 text-white/80">
                SmartGymOps connects the entire workflow, from a broken machine
                report to technician assignment, AI-supported repair, completion,
                and long-term equipment history.
              </p>
            </div>

            <div className="grid gap-4">
              {workflow.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-sm font-black text-black">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="text-lg font-black text-white/88">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-28 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-cyan-400/20 bg-black/20 p-10 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr,360px] lg:items-center">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                Built For Commercial Growth
              </div>

              <h2 className="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                Repair Service
                <span className="block text-white/60">
                  With Real Technology Behind It.
                </span>
              </h2>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/80">
                This is what separates 2EZ TEK from traditional repair vendors:
                smarter tracking, better communication, operational visibility,
                and service history that compounds over time.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="/contact"
                className="rounded-2xl bg-cyan-400 px-8 py-6 text-center shadow-[0_0_45px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] hover:bg-cyan-300"
              >
                <div className="text-xs font-black uppercase tracking-[0.28em] text-black/70">
                  Request Demo
                </div>

                <div className="mt-2 text-2xl font-black text-black">
                  SmartGymOps
                </div>
              </Link>

              <a
                href="tel:9728077232"
                className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Call (972) 807-7232
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}