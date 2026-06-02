'use client'

import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import BookingModal from './BookingModal'

export default function BookingModalProvider() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('open-booking-modal', handler)
    return () => window.removeEventListener('open-booking-modal', handler)
  }, [])

  return (
    <AnimatePresence>
      {open && <BookingModal onClose={() => setOpen(false)} />}
    </AnimatePresence>
  )
}
