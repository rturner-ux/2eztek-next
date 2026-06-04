'use client'

import Script from 'next/script'

export default function GoogleProgrammableSearch() {
  return (
    <>
      <Script
        src="https://cse.google.com/cse.js?cx=717a3949b0ada4d1d"
        strategy="afterInteractive"
      />
      <div className="gcse-search" />
    </>
  )
}
