const contestantFacts = [
  ['Age', '27'],
  ['Location', 'Atlanta, GA'],
  ['Occupation', 'Entrepreneur'],
  ['Status', 'Single'],
  ['Looking For', 'Loyalty, ambition, emotional maturity'],
]

const rules = [
  'Read the blind profile.',
  'Vote Sipp or Spill based on description only.',
  'Unlock the reveal in stages.',
  'Stick with your vote or switch after the reveal.',
]

export default function SippOrSpillPage() {
  return (
    <main className="min-h-screen bg-[#070207] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070207]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-3">
            <img
              src="/images/sipp-or-spill-host-logo.png"
              alt="Sipp or Spill"
              className="h-14 w-auto object-contain"
            />
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-white/65 md:flex">
            <a href="#game" className="hover:text-white">The Game</a>
            <a href="#vote" className="hover:text-white">Vote Room</a>
            <a href="#submit" className="hover:text-white">Submit</a>
            <a href="#support" className="hover:text-white">Support</a>
          </nav>

          <a
            href="#support"
            className="rounded-full bg-[#d7a84f] px-5 py-2.5 text-sm font-black text-black shadow-[0_0_30px_rgba(215,168,79,.25)]"
          >
            Donate $1
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#421123_0%,#17050f_42%,#070207_100%)]" />
        <div className="absolute left-1/2 top-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#d7a84f]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-[#7a123d]/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="text-xs font-black tracking-[0.4em] text-[#d7a84f]">
              LIVE DATING EXPERIENCE
            </p>

            <h1 className="mt-5 font-serif text-6xl font-black leading-none md:text-8xl">
              Sipp or Spill
            </h1>

            <h2 className="mt-4 text-2xl font-black text-white/85 md:text-4xl">
              Judge the vibe before the face.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
              Contestants submit a blind dating profile. Judges vote Sipp if
              they would date them, or Spill if they would pass. Then the host
              reveals the contestant in sections.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#submit"
                className="rounded-full bg-[#d7a84f] px-8 py-4 text-center font-black text-black"
              >
                Submit Entry
              </a>

              <a
                href="#vote"
                className="rounded-full border border-white/15 bg-white/5 px-8 py-4 text-center font-black text-white"
              >
                Enter Vote Room
              </a>
            </div>

            <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-white/45">
              Live Daily • 4:30 PM to 6:30 PM CST
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[3rem] bg-[#d7a84f]/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[3rem] border border-[#d7a84f]/30 bg-black/40 p-6 shadow-2xl">
              <div className="rounded-[2.25rem] bg-[radial-gradient(circle_at_center,#4b1028,#11040b_65%,#050203)] p-8">
                <img
                  src="/images/sipp-or-spill-host-logo.png"
                  alt="Sipp or Spill Host"
                  className="mx-auto max-h-[420px] w-full object-contain drop-shadow-[0_0_55px_rgba(215,168,79,.25)]"
                />

                <div className="mt-6 rounded-3xl border border-white/10 bg-black/35 p-5 text-center">
                  <p className="text-xs font-black tracking-[0.35em] text-[#d7a84f]">
                    THE HOST
                  </p>
                  <h3 className="mt-2 font-serif text-3xl font-black">
                    The Face of the Show
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    She guides the blind vote, controls the reveal, and calls
                    out every switch up.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="vote" className="border-y border-white/10 bg-black/40 px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[330px_1fr_330px]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7a84f]">
              Blind Profile
            </p>

            <h2 className="mt-5 font-serif text-4xl font-black">
              Contestant #12
            </h2>

            <p className="mt-2 text-sm text-white/55">
              Photo locked until reveal.
            </p>

            <div className="mt-8 space-y-5">
              {contestantFacts.map(([label, value]) => (
                <div key={label} className="border-b border-white/10 pb-4">
                  <p className="text-xs font-black uppercase tracking-widest text-[#d7a84f]">
                    {label}
                  </p>
                  <p className="mt-1 text-white/85">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-black/30 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-[#d7a84f]">
                About Me
              </p>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Driven, family oriented, funny, and serious about building
                something real. Communication and loyalty matter most.
              </p>
            </div>
          </aside>

          <section className="text-center">
            <p className="text-xs font-black tracking-[0.4em] text-[#d7a84f]">
              REVEAL BOARD
            </p>

            <h2 className="mt-3 font-serif text-5xl font-black">
              Unlock the contestant.
            </h2>

            <div className="mx-auto mt-8 max-w-[540px] rounded-[2rem] border border-[#d7a84f]/40 bg-[#0b0708] p-4 shadow-[0_0_70px_rgba(215,168,79,.12)]">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
                <RevealBlock title="Face Locked" label="FACE" />
                <RevealBlock title="Torso Locked" label="TORSO" />
                <RevealBlock title="Lower Body Locked" label="LOWER BODY" />
              </div>
            </div>

            <div className="mx-auto mt-8 grid max-w-[540px] grid-cols-2 gap-4">
              <button className="rounded-2xl bg-[#d7a84f] px-6 py-4 text-xl font-black text-black">
                🍷 SIPP
              </button>
              <button className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-xl font-black text-white">
                SPILL
              </button>
            </div>

            <button className="mt-5 rounded-full border border-[#d7a84f]/40 px-8 py-3 text-sm font-black uppercase tracking-widest text-[#d7a84f]">
              Reveal Next Section
            </button>
          </section>

          <aside className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <h3 className="font-serif text-2xl font-black text-[#d7a84f]">
                How It Works
              </h3>

              <div className="mt-6 space-y-4">
                {rules.map((rule, index) => (
                  <div key={rule} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d7a84f]/50 text-sm font-black text-[#d7a84f]">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-white/70">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7a84f]">
                Pre Reveal Vote
              </p>

              <div className="mt-5 space-y-4">
                <VoteBar label="Sipp" value={72} />
                <VoteBar label="Spill" value={28} />
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7a84f]">
                Switch Up Meter
              </p>

              <h3 className="mt-4 font-serif text-5xl font-black">41%</h3>
              <p className="mt-2 text-sm text-white/60">
                Changed their answer after the reveal.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section id="game" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black tracking-[0.35em] text-[#d7a84f]">
            THE GAME FLOW
          </p>

          <h2 className="mt-4 max-w-3xl font-serif text-5xl font-black">
            Built for suspense, debate, and viral moments.
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              ['01', 'Submit', 'Contestants submit a blind profile and reveal media.'],
              ['02', 'Blind Vote', 'Judges vote Sipp or Spill before seeing them.'],
              ['03', 'Section Reveal', 'Face, torso, and lower body unlock in stages.'],
              ['04', 'Final Vote', 'Judges stand on business or switch after the reveal.'],
            ].map(([num, title, text]) => (
              <div
                key={num}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6"
              >
                <p className="font-serif text-4xl font-black text-[#d7a84f]">
                  {num}
                </p>
                <h3 className="mt-4 text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="submit" className="border-y border-white/10 bg-black/40 px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
          <p className="text-xs font-black tracking-[0.35em] text-[#d7a84f]">
            SUBMIT YOUR ENTRY
          </p>

          <h2 className="mt-4 font-serif text-5xl font-black">
            Build your blind profile.
          </h2>

          <form className="mt-8 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Full Name" />
              <Input placeholder="Email" />
              <Input placeholder="TikTok Handle" />
              <Input placeholder="City / State" />
            </div>

            <Textarea placeholder="Describe yourself without mentioning your looks." />
            <Textarea placeholder="What are you looking for?" />
            <Textarea placeholder="What would make someone spill on you?" />

            <div className="rounded-2xl border border-dashed border-[#d7a84f]/40 bg-black/30 p-6 text-center">
              <p className="font-black text-[#d7a84f]">
                Upload Reveal Photo or Video
              </p>
              <p className="mt-2 text-sm text-white/50">
                Hidden until the host triggers the reveal.
              </p>
            </div>

            <button className="rounded-full bg-[#d7a84f] px-8 py-4 font-black text-black">
              Submit Entry
            </button>
          </form>
        </div>
      </section>

      <section id="support" className="px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#d7a84f]/30 bg-[#d7a84f]/10 p-10 text-center">
          <p className="text-xs font-black tracking-[0.35em] text-[#d7a84f]">
            SUPPORT THE SHOW
          </p>

          <h2 className="mt-4 font-serif text-5xl font-black">Donate $1</h2>

          <p className="mx-auto mt-4 max-w-2xl text-white/65">
            Help support production, platform development, live events,
            giveaways, and future contestants.
          </p>

          <button className="mt-8 rounded-full bg-[#d7a84f] px-10 py-4 font-black text-black">
            Donate $1
          </button>
        </div>
      </section>
    </main>
  )
}

function RevealBlock({ title, label }: { title: string; label: string }) {
  return (
    <div className="flex h-44 items-center justify-center border-b border-white/10 bg-[#050505] last:border-b-0">
      <div className="text-center">
        <div className="font-serif text-7xl font-black text-[#d7a84f]">?</div>
        <p className="mt-1 text-xs font-black uppercase tracking-[0.3em] text-white/40">
          {label}
        </p>
        <p className="mt-2 text-sm font-bold text-white/55">{title}</p>
      </div>
    </div>
  )
}

function VoteBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-black">
        <span>{label}</span>
        <span className="text-[#d7a84f]">{value}%</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#d7a84f]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function Input({ placeholder }: { placeholder: string }) {
  return (
    <input
      placeholder={placeholder}
      className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-white/35 focus:border-[#d7a84f]/60"
    />
  )
}

function Textarea({ placeholder }: { placeholder: string }) {
  return (
    <textarea
      placeholder={placeholder}
      className="min-h-32 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-white/35 focus:border-[#d7a84f]/60"
    />
  )
}