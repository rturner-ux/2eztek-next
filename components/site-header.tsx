'use client'

import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const PHONE_DISPLAY = '(972) 807-7232'
const PHONE_TEL = '9728077232'

type NavItem = { label: string; href: string; desc?: string; badge?: string }
type NavGroup = { label: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: 'Services',
    items: [
      { label: 'Home Services', href: '/gym-equipment-repair-dallas', desc: 'Treadmill, elliptical, bike & home gym repair' },
      { label: 'Commercial Gyms', href: '/commercial-gym-maintenance', desc: 'Facilities, hotels, apartments, corporate gyms' },
      { label: 'Brands We Service', href: '/brands', desc: 'NordicTrack, Life Fitness, Precor, and 50+ more' },
      { label: 'Service Areas', href: '/areas', desc: 'Dallas, Plano, Frisco, Fort Worth & all DFW' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Manuals & Troubleshooting', href: '/manuals', desc: 'Search service manuals for 50+ brands' },
      { label: 'Site Search', href: '/search', desc: 'Google-powered search across 2EZ TEK' },
      { label: 'Parts Lookup', href: '/parts-lookup', desc: 'AI identifies your part from a photo or description' },
      { label: 'Repair or Replace?', href: '/tools/repair-or-replace', desc: 'AI-scored recommendation in seconds', badge: 'New' },
      { label: 'FAQs', href: '/faqs', desc: 'Common fitness equipment repair questions' },
    ],
  },
  {
    label: 'Buy & Sell',
    items: [
      { label: 'Browse Marketplace', href: '/equipment-for-sale/listings', desc: 'Local DFW fitness equipment for sale' },
      { label: 'Sell Your Equipment', href: '/equipment-for-sale/new', desc: 'List treadmills, bikes, and gym equipment' },
      { label: 'Shop', href: 'https://shop.2eztek.com', desc: 'Parts, accessories, and gear' },
    ],
  },
  {
    label: 'Company',
    items: [
      { label: 'Blog', href: '/blog', desc: 'Repair guides, tips, and DFW fitness news' },
      { label: 'Reviews', href: '/reviews', desc: '500+ five-star reviews across DFW' },
      { label: 'SmartGymOps', href: '/smartgymops-features', desc: 'Our service tracking and reporting platform' },
      { label: 'Facility Spotlight', href: '/facility-spotlight', desc: 'Featured gyms and fitness facilities' },
      { label: 'About 2EZ TEK', href: '/about-2ez-tek', desc: 'Our story, team, and mission' },
      { label: 'Careers', href: '/careers-1', desc: 'Join the 2EZ TEK team' },
    ],
  },
]

function isExternal(href: string) {
  return href.startsWith('http')
}

function MegaMenu({
  group,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  group: NavGroup
  onClose: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const cols = group.items.length >= 5 ? 'grid-cols-3' : 'grid-cols-2'

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed left-0 right-0 top-[72px] z-[99] border-t border-white/[0.08] bg-[#111214] shadow-[0_24px_64px_rgba(0,0,0,0.65)]"
    >
      <div className="mx-auto max-w-6xl px-12 py-8">
        <div className="mb-6 flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
            {group.label}
          </span>
          <div className="h-px flex-1 bg-white/[0.08]" />
        </div>
        <div className={`grid ${cols} gap-x-6 gap-y-1 pb-2`}>
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              target={isExternal(item.href) ? '_blank' : undefined}
              rel={isExternal(item.href) ? 'noopener noreferrer' : undefined}
              onClick={onClose}
              className="group flex items-start rounded-xl px-4 py-3.5 transition-colors hover:bg-white/[0.06]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-white/80 transition-colors group-hover:text-white">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="rounded bg-cyan-400/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-cyan-400">
                      {item.badge}
                    </span>
                  )}
                  {isExternal(item.href) && (
                    <span className="text-[10px] text-white/20">↗</span>
                  )}
                </div>
                {item.desc && (
                  <p className="mt-0.5 text-xs leading-5 text-white/35 transition-colors group-hover:text-white/55">
                    {item.desc}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function NavDropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleEnter() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpen(true)
  }

  function handleLeave() {
    timerRef.current = setTimeout(() => setOpen(false), 180)
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex items-center gap-1.5 text-[12px] font-medium tracking-wide transition-colors ${
          open ? 'text-white' : 'text-white/55 hover:text-white'
        }`}
      >
        {group.label}
        <svg
          className={`h-2.5 w-2.5 opacity-40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <MegaMenu
            group={group}
            onClose={() => setOpen(false)}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileGroup, setMobileGroup] = useState<string | null>(null)

  useEffect(() => {
    function handleScroll() { setScrolled(window.scrollY > 20) }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-[100] transition-[background-color] duration-[400ms] ${
          scrolled ? 'bg-[#111214]' : 'bg-transparent'
        }`}
      >
        <div className="flex h-[72px] items-center justify-between px-6 lg:px-12">

          {/* Logo */}
          <Link href="/" prefetch={false} className="flex flex-shrink-0 items-center gap-3">
            <Image
              src="/logo.png"
              alt="2EZ TEK"
              width={180}
              height={96}
              priority
              className="h-14 w-auto object-contain sm:h-16"
            />
            <span className="hidden border-l border-white/15 pl-3 leading-tight sm:block">
              <span className="block text-sm font-black tracking-[0.08em] text-white">
                Fitness Treadmill Repair
              </span>
              <span className="mt-0.5 block text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
                Professional Service
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 xl:flex">
            <Link
              href="/"
              prefetch={false}
              className="text-[12px] font-medium tracking-wide text-white/55 transition-colors hover:text-white"
            >
              Home
            </Link>
            {navGroups.map((group) => (
              <NavDropdown key={group.label} group={group} />
            ))}
            <Link
              href="/contact"
              prefetch={false}
              className="text-[12px] font-medium tracking-wide text-white/55 transition-colors hover:text-white"
            >
              Contact
            </Link>
          </nav>

          {/* Right side — phone + CTA */}
          <div className="hidden items-center gap-6 xl:flex">
            <a
              href={`tel:${PHONE_TEL}`}
              className="flex items-center gap-2 text-[12px] font-medium text-white/55 transition-colors hover:text-white"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              {PHONE_DISPLAY}
            </a>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
              className="bg-cyan-400 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-cyan-300"
            >
              Book Service
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((c) => !c)}
            className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] xl:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="block h-px w-6 bg-white"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="block h-px w-6 bg-white"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="block h-px w-6 bg-white"
            />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 right-0 top-[72px] z-[99] max-h-[80vh] overflow-y-auto border-t border-white/[0.08] bg-[#111214] shadow-[0_24px_80px_rgba(0,0,0,0.5)] xl:hidden"
          >
            <div className="px-6 py-4 space-y-1">
              <Link
                href="/"
                prefetch={false}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-[12px] font-medium tracking-wide text-white/60 transition-colors hover:text-white"
              >
                Home
              </Link>
              {navGroups.map((group) => (
                <div key={group.label}>
                  <button
                    type="button"
                    onClick={() => setMobileGroup(mobileGroup === group.label ? null : group.label)}
                    className="flex w-full items-center justify-between py-3 text-left text-[12px] font-medium tracking-wide text-white/60 transition-colors hover:text-white"
                  >
                    {group.label}
                    <motion.svg
                      animate={{ rotate: mobileGroup === group.label ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-3 w-3 opacity-40"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {mobileGroup === group.label && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-l border-white/[0.08] ml-2 pl-4"
                      >
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            prefetch={false}
                            target={isExternal(item.href) ? '_blank' : undefined}
                            rel={isExternal(item.href) ? 'noopener noreferrer' : undefined}
                            onClick={() => setMenuOpen(false)}
                            className="block py-2.5 text-[12px] font-medium text-white/45 transition-colors hover:text-white"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <div className="border-t border-white/[0.08] pt-4 mt-2 space-y-3">
                <Link
                  href="/contact"
                  prefetch={false}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-[12px] font-medium tracking-wide text-white/60 transition-colors hover:text-white"
                >
                  Contact
                </Link>
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="flex items-center gap-2 py-2 text-[12px] font-medium text-cyan-400"
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  {PHONE_DISPLAY}
                </a>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('open-booking-modal')) }}
                  className="w-full bg-cyan-400 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-cyan-300"
                >
                  Book Service
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
