import Link from 'next/link'
import BookServiceButton from '@/components/BookServiceButton'

export const metadata = {
  title: 'Tonal Troubleshooting & Support | 2EZ TEK',
  description:
    'Tonal troubleshooting guides covering error messages, cable walk-out, cross-linked arms, WiFi issues, software updates, arm rotation, and more. 2EZ TEK serves Dallas Fort Worth.',
  alternates: {
    canonical: 'https://www.2eztek.com/manuals/tonal',
  },
}

const CATEGORIES = [
  {
    icon: '🔧',
    title: 'Accessories Troubleshooting',
    items: [
      'Smart handles not registering weight',
      'Rope attachment slipping or detaching',
      'Bar accessory connection issues',
      'Accessory pairing reset procedure',
    ],
  },
  {
    icon: '👤',
    title: 'Account & Membership',
    items: [
      'How to reset your Tonal password',
      'Manage your membership or billing',
      'Add or switch profiles on the device',
      'Link your account to the Tonal app',
    ],
  },
  {
    icon: '📱',
    title: 'Integrations & External Apps',
    items: [
      'Connect Tonal to Apple Health or Google Fit',
      'Strava and Garmin sync setup',
      'AirPods pairing and connection issues',
      'Bluetooth audio troubleshooting',
    ],
  },
  {
    icon: '⚠️',
    title: 'Error Messages',
    items: [
      'Cable tension error at startup',
      'Arm calibration failure codes',
      'Weight limit exceeded warnings',
      'Screen unresponsive after error',
    ],
  },
  {
    icon: '🔌',
    title: 'Cable Walk-Out',
    items: [
      'How to perform a cable walk-out',
      'Cable re-seating after jam',
      'Walk-out required at startup',
      'Preventing future cable jams',
    ],
  },
  {
    icon: '📷',
    title: 'Tonal 2 Camera',
    items: [
      'Camera not detecting movement',
      'Form feedback not activating',
      'Camera lens cleaning and care',
      'Privacy settings for the camera',
    ],
  },
  {
    icon: '🤳',
    title: 'Post-Workout Selfies',
    items: [
      'Selfie prompt not appearing',
      'Camera angle adjustment',
      'Sharing workout photos to social',
    ],
  },
  {
    icon: '📺',
    title: 'Smart View',
    items: [
      'Smart View mirror mode setup',
      'Display not mirroring correctly',
      'Smart View lag or connection drops',
    ],
  },
  {
    icon: '🌀',
    title: 'Troubleshooting Aero',
    items: [
      'Aero fan speed not adjusting',
      'Aero not pairing to Tonal',
      'Aero firmware update process',
    ],
  },
  {
    icon: '⬇️',
    title: 'Software & Firmware Updates',
    items: [
      'Checking your current software version',
      'How to trigger a manual update',
      'Update stuck or failed mid-install',
      'Rollback after a bad update',
    ],
  },
  {
    icon: '💪',
    title: 'Drop Sets',
    items: [
      'Drop set not triggering automatically',
      'Weight not decreasing as expected',
      'Programming custom drop sets',
    ],
  },
  {
    icon: '📶',
    title: 'WiFi',
    items: [
      'Tonal not connecting to WiFi',
      'Connect to a captive portal network',
      'Weak signal and connection drops',
      'Switching to a new router or network',
    ],
  },
  {
    icon: '🔋',
    title: 'Arm Batteries',
    items: [
      'How to change Tonal arm batteries',
      'Battery type and replacement interval',
      'Arms not responding after battery swap',
    ],
  },
  {
    icon: '🔄',
    title: 'Arm Rotation',
    items: [
      'How to troubleshoot arm rotation',
      'Arms stuck or not rotating freely',
      'Re-calibrating arm position sensors',
    ],
  },
  {
    icon: '🔦',
    title: 'Power & Startup',
    items: [
      'Tonal will not turn on',
      'Power cycle and reset procedure',
      'Checking wall outlet and power cord',
      'Supported power cord specifications',
    ],
  },
  {
    icon: '🆔',
    title: 'Device ID & General',
    items: [
      'Locating your Tonal Device ID',
      'General troubleshooting steps',
      'Factory reset your Tonal',
      'What to expect when you contact support',
    ],
  },
  {
    icon: '📲',
    title: 'App & Data',
    items: [
      'How to reset app data on Tonal',
      'Sync issues between device and app',
      'Workout history not showing',
    ],
  },
  {
    icon: '✖️',
    title: 'Cross-Linked Arms',
    items: [
      'How to troubleshoot cross-linked arms',
      'Arms reading reversed weights',
      'Re-pairing left and right arms after error',
    ],
  },
]

export default function TonalSupportPage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      {/* Hero */}
      <section className="border-b border-white/10 bg-gradient-to-b from-cyan-500/10 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-4xl">
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              Tonal Resource Center
            </div>
            <h1 className="text-5xl font-black leading-tight md:text-6xl">
              Tonal Troubleshooting & Support
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/70">
              Guides for Tonal error messages, cable walk-out, cross-linked arms,
              WiFi issues, software updates, arm rotation problems, and more.
              2EZ TEK also repairs Tonal systems in Dallas Fort Worth.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <BookServiceButton className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:scale-105" />
              <Link
                href="/manuals"
                className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/50"
              >
                All Manuals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Troubleshooting Grid */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-400/60">
            Tonal Support Topics
          </span>
          <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
            Troubleshooting Categories
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-7 transition hover:border-cyan-400/30 hover:bg-white/[0.07]"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <h3 className="text-base font-black text-white">{cat.title}</h3>
              </div>
              <ul className="space-y-2">
                {cat.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="mt-0.5 flex-shrink-0 text-cyan-400">›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 bg-white/5 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black text-white md:text-4xl">
            Can't fix it yourself?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/60">
            2EZ TEK technicians diagnose and repair Tonal systems across Dallas Fort Worth.
            Same-week appointments available.
          </p>
          <div className="mt-10">
            <BookServiceButton className="rounded-2xl bg-cyan-400 px-10 py-4 text-sm font-black uppercase tracking-widest text-black transition hover:scale-105" />
          </div>
        </div>
      </section>
    </main>
  )
}
