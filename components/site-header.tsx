'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const PHONE_DISPLAY = '(972) 807-7232'
const PHONE_TEL = '9728077232'

const navItems = [
  { label: 'Home Services', href: '/gym-equipment-repair-dallas' },
  { label: 'Commercial', href: '/commercial-gym-maintenance' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Careers', href: '/careers-1' },
  { label: 'Contact', href: '/contact' },
  { label: 'SmartGymOps', href: '/smartgymops-features' },
  { label: 'Brands', href: '/brands' },
  { label: 'Manuals', href: '/manuals' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about-2ez-tek' },
]

function linkTarget(href: string) {
  return href.startsWith('http') ? '_blank' : undefined
}

function linkRel(href: string) {
  return href.startsWith('http') ? 'noopener noreferrer' : undefined
}

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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

        <nav className="hidden items-center gap-5 text-xs font-semibold text-white/70 xl:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              target={linkTarget(item.href)}
              rel={linkRel(item.href)}
              className="transition hover:text-cyan-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <a
            href={`tel:${PHONE_TEL}`}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
          >
            {PHONE_DISPLAY}
          </a>

          <Link
            href="/contact"
            prefetch={false}
            className="rounded-2xl bg-cyan-400 px-5 py-3 text-xs font-black text-black shadow-[0_0_35px_rgba(34,211,238,0.25)]"
          >
            Schedule Service
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white xl:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="fixed left-3 right-3 top-[102px] z-[99] rounded-[28px] border border-white/10 bg-[#07101D]/95 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl xl:hidden"
          >
            <div className="grid gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  target={linkTarget(item.href)}
                  rel={linkRel(item.href)}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-left text-sm font-black text-white/75 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}

              <a
                href={`tel:${PHONE_TEL}`}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-black text-white/75 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
              >
                Call {PHONE_DISPLAY}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}