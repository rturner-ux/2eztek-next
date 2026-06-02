'use client'

import Link from 'next/link'
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

function DropdownMenu({ group, onClose }: { group: NavGroup; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className="absolute left-1/2 top-full mt-0 w-64 -translate-x-1/2 border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl"
    >
      {group.items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          prefetch={false}
          target={isExternal(item.href) ? '_blank' : undefined}
          rel={isExternal(item.href) ? 'noopener noreferrer' : undefined}
          onClick={onClose}
          className="group flex items-start gap-3 border-b border-white/[0.06] px-5 py-3.5 transition last:border-0 hover:bg-white/[0.05]"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/80 transition group-hover:text-cyan-300">
                {item.label}
              </span>
              {item.badge && (
                <span className="border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-cyan-400">
                  {item.badge}
                </span>
              )}
              {isExternal(item.href) && (
                <span className="text-[10px] text-white/25">↗</span>
              )}
            </div>
            {item.desc && (
              <div className="mt-0.5 text-[11px] text-white/35 transition group-hover:text-white/50">
                {item.desc}
              </div>
            )}
          </div>
        </Link>
      ))}
    </motion.div>
  )
}

function NavDropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleEnter() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpen(true)
  }

  function handleLeave() {
    timerRef.current = setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <div ref={ref} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em] transition ${open ? 'text-white' : 'text-white/65 hover:text-white'}`}
      >
        {group.label}
        <svg
          className={`h-2.5 w-2.5 transition-transform duration-200 opacity-60 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {open && <DropdownMenu group={group} onClose={() => setOpen(false)} />}
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
        className={`fixed left-0 right-0 top-0 z-[100] transition-all duration-300 ${
          scrolled
            ? 'bg-[#050B14]/90 shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="flex h-20 items-center justify-between px-6 lg:px-12">

          {/* Logo */}
          <Link href="/" prefetch={false} className="flex-shrink-0">
            <img
              src="/logo.png"
              alt="2EZ TEK"
              className="h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav — center */}
          <nav className="hidden items-center gap-7 xl:flex">
            <Link
              href="/"
              prefetch={false}
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/65 transition hover:text-white"
            >
              Home
            </Link>
            {navGroups.map((group) => (
              <NavDropdown key={group.label} group={group} />
            ))}
            <Link
              href="/contact"
              prefetch={false}
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/65 transition hover:text-white"
            >
              Contact
            </Link>
          </nav>

          {/* Right side — phone + book */}
          <div className="hidden items-center gap-6 xl:flex">
            <a
              href={`tel:${PHONE_TEL}`}
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-400 transition hover:text-cyan-300"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              {PHONE_DISPLAY}
            </a>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
              className="border border-cyan-400/40 px-5 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300 transition hover:border-cyan-400 hover:text-cyan-200"
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
            className="fixed left-0 right-0 top-20 z-[99] max-h-[80vh] overflow-y-auto bg-[#050B14]/97 backdrop-blur-xl xl:hidden"
          >
            <div className="border-t border-white/10 px-6 py-4 space-y-1">
              <Link
                href="/"
                prefetch={false}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 transition hover:text-white"
              >
                Home
              </Link>
              {navGroups.map((group) => (
                <div key={group.label}>
                  <button
                    type="button"
                    onClick={() => setMobileGroup(mobileGroup === group.label ? null : group.label)}
                    className="flex w-full items-center justify-between py-3 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 transition hover:text-white"
                  >
                    {group.label}
                    <motion.svg
                      animate={{ rotate: mobileGroup === group.label ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-3 w-3 opacity-50"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
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
                        className="overflow-hidden border-l border-white/10 ml-2 pl-4"
                      >
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            prefetch={false}
                            target={isExternal(item.href) ? '_blank' : undefined}
                            rel={isExternal(item.href) ? 'noopener noreferrer' : undefined}
                            onClick={() => setMenuOpen(false)}
                            className="block py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/55 transition hover:text-white"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <div className="border-t border-white/10 pt-4 mt-2 space-y-3">
                <Link
                  href="/contact"
                  prefetch={false}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 transition hover:text-white"
                >
                  Contact
                </Link>
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="flex items-center gap-2 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-400"
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  {PHONE_DISPLAY}
                </a>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('open-booking-modal')) }}
                  className="w-full border border-cyan-400/40 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300 transition hover:border-cyan-400 hover:text-cyan-200"
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
