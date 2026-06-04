'use client'

export default function BookServiceButton({
  label = 'Book Service',
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
      className={className}
    >
      {label}
    </button>
  )
}
