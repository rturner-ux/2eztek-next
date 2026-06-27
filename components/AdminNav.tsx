'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/admin',                 label: 'Hub'            },
  { href: '/admin/customers',       label: 'Customers'      },
  { href: '/admin/blog',            label: 'Blog'           },
  { href: '/admin/search-insights', label: 'Search'         },
  { href: '/admin/competitor-intel',label: 'Keywords'       },
  { href: '/admin/backlinks',       label: 'Backlinks'      },
]

export default function AdminNav() {
  const pathname = usePathname()

  function signOut() {
    localStorage.removeItem('blogAdminPassword')
    window.location.href = '/admin'
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-6 px-6">
        {/* Brand */}
        <Link href="/admin" className="flex items-center gap-2 flex-shrink-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500 text-[10px] font-black text-white">2EZ</span>
          <span className="text-sm font-black text-slate-900 tracking-tight">Admin</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-3">
          <Link href="/" target="_blank" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
            View site ↗
          </Link>
          <button
            onClick={signOut}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
