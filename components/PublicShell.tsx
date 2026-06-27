'use client'

import { usePathname } from 'next/navigation'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import BookingModalProvider from '@/components/BookingModalProvider'
import LeadCapturePopup from '@/components/LeadCapturePopup'

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
    <>
      <SiteHeader />
      <BookingModalProvider />
      <LeadCapturePopup />
      {children}
      <SiteFooter />
    </>
  )
}
