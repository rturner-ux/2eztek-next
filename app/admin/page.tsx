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
    title: 'Backlink Tracker',
    description: 'Track citation submissions, manufacturer listings, press outreach, and live backlinks.',
    href: '/admin/backlinks',
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
  Content:  'border-cyan-200 bg-cyan-50 text-cyan-700',
  CRM:      'border-emerald-200 bg-emerald-50 text-emerald-700',
  Manuals:  'border-violet-200 bg-violet-50 text-violet-700',
  SEO:      'border-amber-200 bg-amber-50 text-amber-700',
  Sales:    'border-orange-200 bg-orange-50 text-orange-700',
  Ads:      'border-pink-200 bg-pink-50 text-pink-700',
  Personal: 'border-slate-200 bg-slate-100 text-slate-500',
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
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-cyan-600">2EZ TEK</div>
          <h1 className="text-xl font-black text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your admin password to access all tools.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') login() }}
            placeholder="Admin password"
            autoFocus
            className="mt-6 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 placeholder:text-slate-400"
          />
          {authError && <p className="mt-2 text-sm text-red-600">{authError}</p>}
          <button
            onClick={login}
            disabled={authLoading}
            className="mt-4 w-full rounded-lg bg-cyan-500 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-600 disabled:opacity-50"
          >
            {authLoading ? 'Checking…' : 'Sign in'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="px-6 pb-20 pt-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">All tools in one place. Select a section to get started.</p>
        </div>

        {/* Section grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TAG_COLORS[section.tag]}`}>
                  {section.tag}
                </span>
                <svg
                  className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-cyan-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-slate-900">{section.title}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">{section.description}</p>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}
