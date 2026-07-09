'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'Command Center', href: '/admin/projects' },
  { label: 'All Jobs', href: '/admin/projects/list' },
  { label: 'Board', href: '/admin/projects/board' },
  { label: 'Dispatch', href: '/admin/projects/dispatch' },
  { label: 'Quotes', href: '/admin/projects/quotes' },
  { label: '+ New Job', href: '/admin/projects/new', accent: true },
]

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin/projects') return pathname === '/admin/projects'
    return pathname.startsWith(href)
  }

  return (
    <div>
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              MISSION — 2EZ TEK
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">Project Planner</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                  item.accent
                    ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                    : isActive(item.href)
                    ? 'bg-slate-950 text-white'
                    : 'border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-950'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="px-6 py-6">{children}</div>
    </div>
  )
}
