'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const SECTIONS = [
  {
    title: 'Blog',
    description: 'Write, publish, and AI-generate blog posts. Manage SEO and content calendar.',
    href: '/admin/blog',
    tag: 'Content',
  },
  {
    title: 'Leads',
    description: 'View and manage incoming customer service requests and job inquiries.',
    href: '/admin/leads',
    tag: 'CRM',
  },
  {
    title: 'Lead Scout',
    description: 'AI-powered lead discovery and outreach campaign builder.',
    href: '/admin/leads/scout',
    tag: 'CRM',
  },
  {
    title: 'Customers',
    description: 'Customer database, history, and contact management.',
    href: '/admin/customers',
    tag: 'CRM',
  },
  {
    title: 'Manuals — Upload',
    description: 'Upload a single PDF manual directly to the equipment manuals library.',
    href: '/admin/manuals',
    tag: 'Manuals',
  },
  {
    title: 'Manuals — Import',
    description: 'Parse manufacturer HTML or JSON to bulk-import manuals from brand sites.',
    href: '/admin/manuals/import',
    tag: 'Manuals',
  },
  {
    title: 'Manuals — Mirror',
    description: 'Mirror external PDFs to Supabase storage so links never go dead.',
    href: '/admin/manuals/mirror',
    tag: 'Manuals',
  },
  {
    title: 'Manuals — Edit',
    description: 'Search and edit existing manuals. Fix brand, model, category, or type on any imported record.',
    href: '/admin/manuals/edit',
    tag: 'Manuals',
  },
  {
    title: 'Manuals — Bulk Upload',
    description: 'Batch-upload multiple PDF files directly to the manuals library.',
    href: '/admin/manuals/bulk',
    tag: 'Manuals',
  },
  {
    title: 'Facility Spotlight',
    description: 'Create and manage commercial facility showcase pages.',
    href: '/admin/facility-spotlight',
    tag: 'Content',
  },
  {
    title: 'Search Insights',
    description: 'See what customers searched before booking. Spot FAQ gaps and generate answers with AI.',
    href: '/admin/search-insights',
    tag: 'SEO',
  },
  {
    title: 'Competitor Intel',
    description: 'Track keyword rankings and monitor competitor positions over time.',
    href: '/admin/competitor-intel',
    tag: 'SEO',
  },
  {
    title: 'Marketplace',
    description: 'List and manage used fitness equipment for sale.',
    href: '/admin/marketplace',
    tag: 'Sales',
  },
  {
    title: 'Thumbtack Campaign',
    description: 'Monitor and manage Thumbtack ad performance and leads.',
    href: '/admin/thumbtack-campaign',
    tag: 'Ads',
  },
  {
    title: 'Credit Repair',
    description: 'Dispute letter generator and credit bureau tracking.',
    href: '/admin/credit-repair',
    tag: 'Personal',
  },
]

const TAG_COLORS: Record<string, string> = {
  Content:  'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
  CRM:      'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  Manuals:  'border-violet-400/30 bg-violet-400/10 text-violet-300',
  SEO:      'border-amber-400/30 bg-amber-400/10 text-amber-300',
  Sales:    'border-orange-400/30 bg-orange-400/10 text-orange-300',
  Ads:      'border-pink-400/30 bg-pink-400/10 text-pink-300',
  Personal: 'border-white/20 bg-white/5 text-white/50',
}

export default function AdminHubPage() {
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('blogAdminPassword')
    if (saved) setPassword(saved)
  }, [])

  async function login() {
    if (!password) { setAuthError('Enter the admin password.'); return }
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        localStorage.setItem('blogAdminPassword', password)
        setAuthorized(true)
      } else {
        setAuthError('Incorrect password.')
      }
    } catch {
      setAuthError('Could not connect.')
    } finally {
      setAuthLoading(false)
    }
  }

  function signOut() {
    localStorage.removeItem('blogAdminPassword')
    setPassword('')
    setAuthorized(false)
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050B14] px-6">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.15),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_32%)]" />
        <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-black/50 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mb-5 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
            2EZ TEK Admin
          </div>
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
          <p className="mt-2 text-white/50">Enter your admin password to access all tools.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') login() }}
            placeholder="Admin password"
            autoFocus
            className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400 placeholder:text-white/30"
          />
          {authError && <p className="mt-3 text-sm text-red-400">{authError}</p>}
          <button
            onClick={login}
            disabled={authLoading}
            className="mt-4 w-full rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {authLoading ? 'Checking…' : 'Enter'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 pb-24 pt-28 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              2EZ TEK Admin
            </div>
            <h1 className="text-5xl font-black">Admin Dashboard</h1>
            <p className="mt-3 text-white/50">All tools in one place. Select a section to get started.</p>
          </div>
          <button
            onClick={signOut}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/50 transition hover:border-red-400/30 hover:text-red-400"
          >
            Sign Out
          </button>
        </div>

        {/* Section grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex flex-col rounded-[1.5rem] border border-white/[0.07] bg-white/[0.03] p-6 transition hover:border-cyan-400/25 hover:bg-white/[0.06]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] ${TAG_COLORS[section.tag]}`}>
                  {section.tag}
                </span>
                <svg
                  className="h-4 w-4 text-white/20 transition group-hover:text-cyan-400/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </div>
              <h2 className="text-base font-black text-white">{section.title}</h2>
              <p className="mt-1.5 text-sm leading-6 text-white/45">{section.description}</p>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}
