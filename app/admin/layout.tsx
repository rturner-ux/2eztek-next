import type { Metadata } from 'next'
import AdminNav from '@/components/AdminNav'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminNav />
      {/* Offset for fixed desktop sidebar */}
      <div className="flex-1 min-w-0 md:ml-64">
        {children}
      </div>
    </div>
  )
}
