'use client'

import Link from 'next/link'
import Image from 'next/image'

const phoneDisplay = '(972) 807-7232'
const phoneHref = 'tel:9728077232'
const primaryEmail = 'support@2eztek.com'

const affiliates = [
  { label: 'Shop Bowflex', href: 'https://johnsonhealthtechretailinc.sjv.io/9VnjnY' },
  { label: 'Shop Life Fitness', href: 'https://lifefitness.sjv.io/b36Ae6' },
  { label: 'Shop Goalrilla', href: 'https://goalrilla.sjv.io/rELqLd' },
]

const columns = [
  {
    heading: 'Services',
    links: [
      { label: 'Treadmill Repair', href: '/treadmill-repair-dallas' },
      { label: 'Elliptical Repair', href: '/elliptical-repair-dallas' },
      { label: 'Exercise Bike Repair', href: '/exercise-bike-repair-dallas' },
      { label: 'Equipment Assembly', href: '/fitness-equipment-assembly-dallas' },
      { label: 'Home Gym Installation', href: '/home-gym-installation-dallas' },
      { label: 'Commercial Maintenance', href: '/commercial-gym-maintenance' },
      { label: 'Preventative Maintenance', href: '/preventative-maintenance-dallas' },
      { label: 'Strength Equipment Repair', href: '/strength-equipment-repair-dallas' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Book Service', href: '#', isBooking: true },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Parts Lookup', href: '/parts-lookup' },
      { label: 'Service Areas', href: '/areas' },
      { label: 'Manuals & Guides', href: '/manuals' },
      { label: 'Tech Onsite', href: '/tech-onsite' },
      { label: 'FAQs', href: '/faqs' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About 2EZ TEK', href: '/about-2ez-tek' },
      { label: 'Blog', href: '/blog' },
      { label: 'Reviews', href: '/reviews' },
      { label: 'Careers', href: '/careers-1' },
      { label: 'SmartGymOps', href: '/smartgymops-features' },
      { label: 'Equipment For Sale', href: '/equipment-for-sale' },
      { label: 'Brands We Service', href: '/brands' },
    ],
  },
]

const socials = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/2eztek/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/2eztek/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@2eztek',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@2eztek880',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/2ez-tek-llc',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
]

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0A0D14] text-white">

      {/* ── Main grid ── */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6">

          {/* Brand column, spans 2 on large screens */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Image src="/logo.png" alt="2EZ TEK" width={180} height={64} className="h-16 w-auto object-contain" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/45">
              Professional fitness equipment repair, assembly, maintenance, and gym construction across Dallas Fort Worth. Est. 2016.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/40 transition hover:border-white/25 hover:text-white/80"
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <div className="mt-5 space-y-1">
              <a href={phoneHref} className="block text-sm font-bold text-cyan-400 transition hover:text-cyan-300">
                {phoneDisplay}
              </a>
              <a href={`mailto:${primaryEmail}`} className="block text-sm text-white/40 transition hover:text-white/70">
                {primaryEmail}
              </a>
              <p className="text-sm text-white/30">Dallas Fort Worth, TX</p>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) =>
                  link.isBooking ? (
                    <li key="booking">
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                        className="text-sm text-white/55 transition hover:text-cyan-400"
                      >
                        Book Service
                      </button>
                    </li>
                  ) : (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-white/55 transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}

          {/* Shop & Partners column */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400/70">
              Shop & Partners
            </h3>
            <ul className="mt-4 space-y-2.5">
              {affiliates.map((a) => (
                <li key={a.href}>
                  <a
                    href={a.href}
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    className="flex items-center gap-1.5 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
                  >
                    <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    {a.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07] px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Authorized Affiliate</p>
              <p className="mt-1 text-[11px] leading-4 text-white/35">
                Bowflex, Life Fitness & Goalrilla. We earn a commission at no cost to you.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/[0.06] px-6 py-5 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-[11px] text-white/30">
          <span>© 2026 2EZ TEK LLC. All Rights Reserved. Dallas Fort Worth, TX.</span>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/privacy-policy" className="transition hover:text-white/70">Privacy Policy</Link>
            <Link href="/terms-of-service" className="transition hover:text-white/70">Terms of Service</Link>
            <Link href="/about-2ez-tek" className="transition hover:text-white/70">About</Link>
            <Link href="/brands" className="transition hover:text-white/70">Brands</Link>
          </div>
        </div>
      </div>

    </footer>
  )
}
