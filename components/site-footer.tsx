import Link from 'next/link'

const phoneDisplay = '(972) 807-7232'
const phoneHref = 'tel:9728077232'

const primaryEmail = 'support@2eztek.com'

const brandLinks = [
  {
    name: 'NordicTrack Repair',
    href: '/brands/nordictrack',
  },
  {
    name: 'ProForm Repair',
    href: '/brands/proform',
  },
  {
    name: 'Bowflex Repair',
    href: '/brands/bowflex',
  },
  {
    name: 'Peloton Repair',
    href: '/brands/peloton',
  },
  {
    name: 'Marcy Home Gym Repair',
    href: '/brands/marcy',
  },
]

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#03070D] px-6 py-16 text-white lg:px-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_32%)]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-5">
          {/* BRAND */}
          <div className="lg:col-span-2">
            <img
              src="/logo.png"
              alt="2EZ TEK"
              className="h-24 w-auto object-contain"
            />

            <p className="mt-6 max-w-md leading-7 text-slate-400">
              2EZ TEK provides professional fitness equipment repair,
              assembly, diagnostics, commercial gym maintenance,
              treadmill repair, and onsite fitness equipment service
              throughout Dallas Fort Worth.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={phoneHref}
                className="rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-black uppercase tracking-wide text-black transition hover:scale-105"
              >
                Call Now
              </a>

              <Link
                href="/request-service"
                className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/50"
              >
                Request Service
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.9)]" />

              <span className="text-sm font-semibold text-slate-300">
                SmartGymOps Powered
              </span>
            </div>
          </div>

          {/* SERVICES */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              Services
            </h3>

            <div className="mt-6 grid gap-4 text-sm text-slate-400">
              <Link
                href="/treadmill-repair-dallas"
                className="transition hover:text-cyan-300"
              >
                Treadmill Repair
              </Link>

              <Link
                href="/gym-equipment-repair-dallas"
                className="transition hover:text-cyan-300"
              >
                Gym Equipment Repair
              </Link>

              <Link
                href="/gym-equipment-assembly-dallas"
                className="transition hover:text-cyan-300"
              >
                Equipment Assembly
              </Link>

              <Link
                href="/commercial-gym-maintenance"
                className="transition hover:text-cyan-300"
              >
                Commercial Maintenance
              </Link>

              <Link
                href="/commercial-gym-installation-dallas"
                className="transition hover:text-cyan-300"
              >
                Commercial Installation
              </Link>

              <Link
                href="/tech-onsite"
                className="transition hover:text-cyan-300"
              >
                Onsite Diagnostics
              </Link>
            </div>
          </div>

          {/* BRANDS */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              Popular Brands
            </h3>

            <div className="mt-6 grid gap-4 text-sm text-slate-400">
              {brandLinks.map((brand) => (
                <Link
                  key={brand.name}
                  href={brand.href}
                  className="transition hover:text-cyan-300"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              Contact
            </h3>

            <div className="mt-6 grid gap-5 text-sm text-slate-400">
              <a
                href={phoneHref}
                className="transition hover:text-cyan-300"
              >
                {phoneDisplay}
              </a>

              <a
                href={`mailto:${primaryEmail}`}
                className="break-all transition hover:text-cyan-300"
              >
                {primaryEmail}
              </a>

              <div>
                <div>Dallas Fort Worth, TX</div>

                <div className="mt-1 text-slate-500">
                  Residential & Commercial Fitness Equipment Service
                </div>
              </div>

              <Link
                href="/brands"
                className="font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                View All Supported Brands →
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-16 flex flex-col gap-6 border-t border-white/10 pt-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <div>
            © 2026 2EZ TEK. All Rights Reserved.
          </div>

          <div className="flex flex-wrap gap-6">
            <Link
              href="/about-2ez-tek"
              className="transition hover:text-cyan-300"
            >
              About
            </Link>

            <Link
              href="/reviews"
              className="transition hover:text-cyan-300"
            >
              Reviews
            </Link>

            <Link
              href="/privacy-policy"
              className="transition hover:text-cyan-300"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms-of-service"
              className="transition hover:text-cyan-300"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}