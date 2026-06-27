import BookServiceButton from '@/components/BookServiceButton'
import Link from 'next/link'
import { TONAL_ARTICLES } from './articles'

export const metadata = {
  title: 'Tonal Support Center | 2EZ TEK',
  description:
    'Tonal support guides for setup, getting started, troubleshooting, arm issues, WiFi, error messages, cable walk-out, and more. 2EZ TEK repairs Tonal systems in Dallas Fort Worth.',
  alternates: {
    canonical: 'https://www.2eztek.com/manuals/tonal',
  },
}

const CATEGORIES = [
  { id: 'installation', icon: '🔧', label: 'Installation' },
  { id: 'getting-started', icon: '▶️', label: 'Getting Started' },
  { id: 'features', icon: '⚙️', label: 'Features & Functions' },
  { id: 'account', icon: '👤', label: 'Account & Membership' },
  { id: 'troubleshooting', icon: '⚠️', label: 'Troubleshooting' },
  { id: 'relocation', icon: '📦', label: 'Relocation' },
  { id: 'partnerships', icon: '🤝', label: 'Partnerships & Perks' },
  { id: 'warranty', icon: '🛡️', label: 'Warranty & Legal' },
  { id: 'general', icon: '❓', label: 'General Questions' },
]

export default function TonalSupportPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* Hero */}
      <section className="bg-[#050B14] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                Tonal Resource Center
              </div>
              <h1 className="text-4xl font-black leading-tight md:text-5xl">
                Tonal Support Center
              </h1>
              <p className="mt-3 max-w-xl text-base text-white/60">
                Setup guides, troubleshooting articles, and feature walkthroughs for your Tonal.
                2EZ TEK also repairs Tonal systems across Dallas Fort Worth.
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-wrap gap-3">
              <BookServiceButton className="bg-cyan-400 px-7 py-3 text-sm font-black uppercase tracking-wide text-black transition hover:bg-cyan-300" />
              <Link
                href="/manuals"
                className="border border-white/15 bg-white/5 px-7 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/50"
              >
                All Manuals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Official manual download */}
      <section className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm text-slate-600">
            <span className="font-bold text-slate-900">Official Tonal User Manual (PDF)</span>
            {' — '}complete setup, installation, safety, and warranty guide
          </div>
          <a
            href="https://prod-www.tonal.com/docs/TonalGuide.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 border border-slate-300 bg-slate-50 px-5 py-2 text-xs font-black uppercase tracking-widest text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700"
          >
            View PDF ↗
          </a>
        </div>
      </section>

      {/* Category nav */}
      <section className="border-b border-slate-200 bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
            {CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center text-xs font-bold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
              >
                <span className="text-2xl">{cat.icon}</span>
                {cat.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Installation ─────────────────────────────────────────────────── */}
      <section id="installation" className="border-b border-slate-100 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tonal Support</div>
          <h2 className="mb-8 text-3xl font-black text-slate-900">Installation</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Tonal Installation Overview', desc: 'What to expect from your Tonal installation appointment, required wall clearances, and weight specifications.' },
              { title: 'Wall Mounting Requirements', desc: 'Stud placement, drywall anchor specs, and minimum wall depth required for a safe Tonal installation.' },
              { title: 'What to Do Before Your Install Appointment', desc: 'Clearing the space, confirming WiFi reach, and prep steps to ensure a smooth install day.' },
              { title: 'Power Requirements for Tonal', desc: 'Tonal requires a dedicated 120V outlet within 6 feet. Learn about acceptable outlet types and placement.' },
              { title: 'Can Tonal Be Mounted on Concrete or Brick?', desc: 'Installation on masonry walls requires different anchoring hardware. See what is needed and whether a professional installer is recommended.' },
              { title: 'Rescheduling or Canceling an Installation', desc: 'How to modify your installation appointment through the Tonal app or customer support.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-5">
                <span className="mt-0.5 text-lg text-slate-400">📄</span>
                <div>
                  <div className="font-bold text-slate-900">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Getting Started ───────────────────────────────────────────────── */}
      <section id="getting-started" className="border-b border-slate-100 bg-slate-50 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tonal Support</div>
          <h2 className="mb-8 text-3xl font-black text-slate-900">Getting Started</h2>

          {/* Article: Power on/off */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-7">
            <h3 className="text-xl font-black text-slate-900">How to Turn Tonal On, Off, or Put Tonal to Sleep</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p><strong>Turning Tonal On:</strong> Tonal powers on automatically when it detects motion near the screen or when you tap the screen. You can also press and hold the power button on the back of the unit for 2 seconds.</p>
              <p><strong>Putting Tonal to Sleep:</strong> Swipe down from the top of the screen and tap the sleep icon, or simply leave the screen idle for the duration set in your display settings. Sleep mode keeps Tonal connected to WiFi and ready to resume quickly.</p>
              <p><strong>Turning Tonal Off (full shutdown):</strong> Swipe down from the top of the screen, tap the power icon, then select "Power Off." A full shutdown is recommended if Tonal will not be used for an extended period or before unplugging for maintenance.</p>
              <p><strong>Force Restart:</strong> If the screen is unresponsive, press and hold the power button on the back for 10 seconds until the screen goes dark, then release and wait for the Tonal logo to reappear.</p>
            </div>
          </div>

          {/* Article: Screen Lock */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-7">
            <h3 className="text-xl font-black text-slate-900">Screen Lock</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Screen Lock is a safety setting that prevents any unintended access to your Tonal. With Screen Lock enabled, Tonal will require a password or QR code to sign in, even for account users who previously selected "Remember My Password."</p>
              <p>Screen Lock will also show a reminder to remove Smart Accessories and stow the arms after working out, and will automatically sign out any account user after 2 minutes of inactivity.</p>
              <p><strong>Key benefits of Screen Lock:</strong></p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Tonal will require a password or QR code login for access when you are not there, even for accounts with "Remember My Password" previously selected.</li>
                <li>Screen Lock will automatically log you out after any inactivity longer than 2 minutes, so your Tonal is always protected if you need to step away.</li>
                <li>You will be reminded to remove Smart Accessories and stow the arms after each workout.</li>
              </ul>
              <p><strong>How to enable Screen Lock:</strong> Go to Settings on your Tonal, select "Security," then toggle Screen Lock on. You can choose between a PIN or QR code login method.</p>
            </div>
          </div>

          {/* Article list */}
          <div className="grid gap-3 md:grid-cols-2">
            {TONAL_ARTICLES.filter((a) => a.category === 'Getting Started').map((article) => (
              <Link
                key={article.slug}
                href={`/manuals/tonal/${article.slug}`}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                <span className="text-slate-400">📄</span>
                <span className="text-sm font-medium text-slate-800">{article.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features & Functions ──────────────────────────────────────────── */}
      <section id="features" className="border-b border-slate-100 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tonal Support</div>
          <h2 className="mb-8 text-3xl font-black text-slate-900">Features & Functions</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {TONAL_ARTICLES.filter((a) => a.category === 'Features & Functions').map((article) => (
              <Link
                key={article.slug}
                href={`/manuals/tonal/${article.slug}`}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                <span className="text-slate-400">⚙️</span>
                <span className="text-sm font-medium text-slate-800">{article.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Account & Membership ──────────────────────────────────────────── */}
      <section id="account" className="border-b border-slate-100 bg-slate-50 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tonal Support</div>
          <h2 className="mb-8 text-3xl font-black text-slate-900">Account & Membership</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {TONAL_ARTICLES.filter((a) => a.category === 'Account & Membership').map((article) => (
              <Link
                key={article.slug}
                href={`/manuals/tonal/${article.slug}`}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                <span className="text-slate-400">👤</span>
                <span className="text-sm font-medium text-slate-800">{article.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Troubleshooting ───────────────────────────────────────────────── */}
      <section id="troubleshooting" className="border-b border-slate-100 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tonal Support</div>
          <h2 className="mb-8 text-3xl font-black text-slate-900">Troubleshooting</h2>

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            {/* Cable walk-out */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-black text-slate-900">Cable Walk-Out</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>A cable walk-out is required when the internal cable drum has unwound more than expected. Tonal will display a cable walk-out prompt on screen.</p>
                <p><strong>To perform a cable walk-out:</strong> Follow the on-screen instructions to slowly pull each cable arm fully extended, hold for 3 seconds, then return the arms to the stowed position. Tonal will automatically detect when the walk-out is complete.</p>
                <p>If the walk-out prompt reappears repeatedly, contact 2EZ TEK for a technician inspection, as this may indicate a cable drum or tension system issue.</p>
              </div>
            </div>
            {/* Cross-linked arms */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-black text-slate-900">Cross-Linked Arms</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>Cross-linked arms occur when Tonal's left and right arm sensors read reversed weights or mixed-up resistance values. This is typically a calibration or pairing error.</p>
                <p><strong>To troubleshoot:</strong> Perform a full restart. If the problem persists, go to Settings, then "Reset Arms" to re-pair the left and right arm sensors. A cable walk-out may also be prompted after re-pairing.</p>
                <p>If arms continue to read reversed, a hardware diagnostic by a certified Tonal technician is recommended.</p>
              </div>
            </div>
            {/* Error codes */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-black text-slate-900">Error Messages & Codes</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p><strong>Cable Tension Error at Startup:</strong> Indicates that Tonal cannot achieve calibrated tension in one or both arms. Perform a cable walk-out. If the error clears, resume normal use.</p>
                <p><strong>Arm Calibration Failure:</strong> The arm sensors could not complete their calibration cycle. Restart Tonal and retry. Persistent failures require service.</p>
                <p><strong>Weight Limit Exceeded:</strong> The combined load on the arms has exceeded the 200-lb maximum. Reduce the programmed weight and retry.</p>
                <p><strong>Screen Unresponsive After Error:</strong> Force restart by holding the rear power button for 10 seconds.</p>
              </div>
            </div>
            {/* WiFi */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-black text-slate-900">WiFi Connectivity</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p><strong>Tonal not connecting to WiFi:</strong> Ensure your router is broadcasting a 2.4 GHz or 5 GHz signal. Tonal does not support enterprise or captive-portal networks without special configuration.</p>
                <p><strong>Dropping connection during workouts:</strong> Move your router closer, or add a mesh node near the Tonal. Weak signal is the most common cause of streaming interruptions.</p>
                <p><strong>Switching to a new router:</strong> Go to Settings, then WiFi, forget the current network, and reconnect to the new network.</p>
              </div>
            </div>
          </div>

          {/* Remaining troubleshooting articles */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {TONAL_ARTICLES.filter((a) => a.category === 'Troubleshooting').map((article) => (
              <Link
                key={article.slug}
                href={`/manuals/tonal/${article.slug}`}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                <span className="text-slate-400">⚠️</span>
                <span className="text-sm font-medium text-slate-800">{article.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Relocation ───────────────────────────────────────────────────── */}
      <section id="relocation" className="border-b border-slate-100 bg-slate-50 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tonal Support</div>
          <h2 className="mb-8 text-3xl font-black text-slate-900">Relocation</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { title: 'Moving Tonal to a New Location', desc: 'How to safely unmount, transport, and reinstall Tonal in a new room or home. Tonal recommends professional reinstallation.' },
              { title: 'Tonal Relocation Service', desc: 'Tonal offers a paid relocation service through their installation partners. Schedule through the Tonal app under Account settings.' },
              { title: 'Can I Move Tonal Myself?', desc: 'While DIY relocation is possible, it requires two adults, proper anchoring tools, and knowledge of your wall structure. Improper mounting can void warranty.' },
              { title: 'Reinstallation After Moving', desc: 'After moving, Tonal must be recalibrated. Power on the device and follow the on-screen setup instructions to complete arm calibration and WiFi reconnection.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="font-black text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partnerships & Perks ─────────────────────────────────────────── */}
      <section id="partnerships" className="border-b border-slate-100 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tonal Support</div>
          <h2 className="mb-8 text-3xl font-black text-slate-900">Partnerships & Perks</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              'Tonal + Apple Health Integration',
              'Tonal + Strava Sync Setup',
              'Tonal + Garmin Connect',
              'Tonal + Amazon Alexa',
              'Tonal HSA/FSA Eligibility',
              'Corporate Wellness Programs',
              'Tonal for Business',
              'Referral Program',
              'Student & Military Discounts',
            ].map((title) => (
              <div key={title} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-slate-400">🤝</span>
                <span className="text-sm font-medium text-slate-800">{title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Warranty & Legal ─────────────────────────────────────────────── */}
      <section id="warranty" className="border-b border-slate-100 bg-slate-50 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tonal Support</div>
          <h2 className="mb-8 text-3xl font-black text-slate-900">Warranty & Legal</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-black text-slate-900">Tonal Warranty Coverage</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>Tonal hardware is covered by a <strong>1-year limited warranty</strong> from the date of installation covering defects in materials and workmanship.</p>
                <p>Warranty does not cover damage from improper installation, misuse, unauthorized modifications, or normal wear of consumable parts such as cables and grips.</p>
                <p>Extended protection plans may be purchased through Tonal at the time of purchase.</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-black text-slate-900">Out-of-Warranty Repairs</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>Tonal units that are out of warranty can still be repaired. 2EZ TEK offers diagnostics and repair for Tonal systems in the Dallas Fort Worth area.</p>
                <p>Common out-of-warranty repairs include cable replacement, arm sensor calibration, motor drive board service, and touchscreen replacement.</p>
                <p>Contact 2EZ TEK for a repair estimate before assuming your Tonal needs to be replaced.</p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              'How to File a Warranty Claim',
              'What Voids the Tonal Warranty',
              'Tonal Terms of Service',
              'Tonal Privacy Policy',
              'Return & Refund Policy',
            ].map((title) => (
              <div key={title} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
                <span className="text-slate-400">🛡️</span>
                <span className="text-sm font-medium text-slate-800">{title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── General Questions ────────────────────────────────────────────── */}
      <section id="general" className="border-b border-slate-100 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Tonal Support</div>
          <h2 className="mb-8 text-3xl font-black text-slate-900">General Questions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { q: 'How heavy is Tonal?', a: 'Tonal weighs approximately 150 lbs and requires wall studs rated for at least 300 lbs combined holding weight when fully loaded.' },
              { q: 'What is the maximum weight resistance?', a: 'Tonal offers up to 200 lbs of combined digital weight resistance, adjustable in 1-lb increments per arm.' },
              { q: 'Does Tonal work without a membership?', a: 'Tonal hardware requires an active membership for full functionality. Without a membership, access to workouts and coaching features is limited.' },
              { q: 'How often does Tonal need maintenance?', a: 'Tonal recommends inspecting cables and arm connections every 6 months. Cable walk-outs should be performed any time the system prompts you.' },
              { q: 'Can Tonal be used in a garage?', a: 'Yes, but temperature extremes and humidity can affect performance. Tonal is rated for indoor use between 50 and 95 degrees Fahrenheit.' },
              { q: 'What is the Device ID and where do I find it?', a: 'The Device ID is a unique identifier for your Tonal unit. Find it by swiping down from the top of the screen, then tapping Settings, then About.' },
            ].map((item) => (
              <div key={item.q} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="font-black text-slate-900">{item.q}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#050B14] px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black md:text-4xl">
            Can't fix it yourself?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            2EZ TEK technicians diagnose and repair Tonal systems across Dallas Fort Worth.
            Same-week appointments available for both in-warranty and out-of-warranty units.
          </p>
          <div className="mt-10">
            <BookServiceButton className="bg-cyan-400 px-10 py-4 text-sm font-black uppercase tracking-widest text-black transition hover:bg-cyan-300" />
          </div>
        </div>
      </section>

    </main>
  )
}
