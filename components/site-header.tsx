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
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="absolute left-1/2 top-full mt-3 w-72 -translate-x-1/2 rounded-[24px] border border-white/10 bg-[#07101D]/98 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
    >
      {group.items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          prefetch={false}
          target={isExternal(item.href) ? '_blank' : undefined}
          rel={isExternal(item.href) ? 'noopener noreferrer' : undefined}
          onClick={onClose}
          className="group flex items-start gap-3 rounded-2xl px-4 py-3 transition hover:bg-white/[0.06]"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white/85 transition group-hover:text-cyan-300">
                {item.label}
              </span>
              {item.badge && (
                <span className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-cyan-400">
                  {item.badge}
                </span>
              )}
              {isExternal(item.href) && (
                <span className="text-[10px] text-white/25">↗</span>
              )}
            </div>
            {item.desc && (
              <div className="mt-0.5 text-xs text-white/35 transition group-hover:text-white/50">
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
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        className={`flex items-center gap-1 text-xs font-semibold transition ${open ? 'text-cyan-300' : 'text-white/70 hover:text-cyan-300'}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {group.label}
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="h-3 w-3 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
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
    function handleScroll() {
      setScrolled(window.scrollY > 40)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className={`fixed left-3 right-3 top-3 z-[100] flex h-[82px] items-center justify-between rounded-3xl border px-4 transition-all duration-300 lg:left-10 lg:right-10 lg:h-[88px] lg:px-6 ${
          scrolled
            ? 'border-white/10 bg-[#07101D]/88 shadow-[0_18px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl'
            : 'border-white/10 bg-white/[0.06] backdrop-blur-xl'
        }`}
      >
        <Link href="/" prefetch={false} className="flex h-full items-center">
          <img
            src="/logo.png"
            alt="2EZ TEK"
            className="h-[76px] w-auto object-contain drop-shadow-[0_0_28px_rgba(34,211,238,0.32)] lg:h-[82px]"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 xl:flex">
          {navGroups.map((group) => (
            <NavDropdown key={group.label} group={group} />
          ))}
          <Link
            href="/contact"
            prefetch={false}
            className="ml-2 text-xs font-semibold text-white/70 transition hover:text-cyan-300"
          >
            Contact
          </Link>
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <a
            href={`tel:${PHONE_TEL}`}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
          >
            {PHONE_DISPLAY}
          </a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
            className="rounded-2xl bg-cyan-400 px-5 py-3 text-xs font-black text-black shadow-[0_0_35px_rgba(34,211,238,0.25)]"
          >
            Schedule Service
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((c) => !c)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white xl:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="fixed left-3 right-3 top-[102px] z-[99] max-h-[80vh] overflow-y-auto rounded-[28px] border border-white/10 bg-[#07101D]/97 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl xl:hidden"
          >
            <div className="space-y-2">
              {navGroups.map((group) => (
                <div key={group.label}>
                  <button
                    type="button"
                    onClick={() => setMobileGroup(mobileGroup === group.label ? null : group.label)}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-left text-sm font-black text-white/85 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.06]"
                  >
                    {group.label}
                    <motion.svg
                      animate={{ rotate: mobileGroup === group.label ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-3.5 w-3.5 opacity-50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
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
                        className="overflow-hidden"
                      >
                        <div className="mt-1 space-y-1 pl-2">
                          {group.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              prefetch={false}
                              target={isExternal(item.href) ? '_blank' : undefined}
                              rel={isExternal(item.href) ? 'noopener noreferrer' : undefined}
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white/70 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-white"
                            >
                              <span className="font-bold">{item.label}</span>
                              {item.badge && (
                                <span className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-cyan-400">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <Link
                href="/contact"
                prefetch={false}
                onClick={() => setMenuOpen(false)}
                className="block rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-black text-white/85 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.06]"
              >
                Contact
              </Link>

              <a
                href={`tel:${PHONE_TEL}`}
                className="block rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-black text-white/75 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
              >
                Call {PHONE_DISPLAY}
              </a>

              <button
                type="button"
                onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('open-booking-modal')) }}
                className="w-full rounded-2xl bg-cyan-400 px-5 py-4 text-sm font-black text-black transition hover:bg-cyan-300"
              >
                Schedule Service
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
