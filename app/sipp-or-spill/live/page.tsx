import Link from 'next/link'

export const metadata = {
  title: 'Live | Sipp or Spill',
  description: 'Watch Sipp or Spill live from the official live show page.',
}

export default function SippOrSpillLivePage() {
  return (
    <main className="min-h-screen bg-[#05030a] text-white">
      <section className="relative overflow-hidden px-6 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ff4fd8_0%,transparent_35%),radial-gradient(circle_at_bottom,#7c3aed_0%,transparent_35%)] opacity-30" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link
              href="/sipp-or-spill"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Back to Sipp or Spill
            </Link>

            <div className="rounded-full border border-red-400/40 bg-red-500/15 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-red-200">
              Live
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
            <section className="rounded-[2rem] border border-white/10 bg-black/40 p-4 shadow-2xl shadow-fuchsia-500/10 backdrop-blur">
              <div className="aspect-video overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
                <iframe
                  src="https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID"
                  title="Sipp or Spill Live"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </section>

            <aside className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-fuchsia-200">
                Now Streaming
              </p>

              <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                Sipp or Spill Live
              </h1>

              <p className="mt-4 text-base leading-7 text-white/70">
                Tap in for live conversations, hot topics, reactions, and the
                moments everybody will be talking about.
              </p>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5">
                <p className="text-sm font-bold text-white">Live Player</p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  When the show is live on YouTube, the stream will appear here
                  automatically.
                </p>
              </div>

              <Link
                href="/sipp-or-spill"
                className="mt-6 block rounded-2xl bg-fuchsia-400 px-5 py-4 text-center text-sm font-black text-black hover:bg-fuchsia-300"
              >
                Return to Show Page
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}