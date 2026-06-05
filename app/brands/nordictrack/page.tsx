import BrandSupportPage from '@/components/BrandSupportPage'

export const metadata = {
  title: 'NordicTrack Repair Dallas TX | Treadmill & Elliptical Service',
  description:
    '2EZ TEK provides NordicTrack treadmill repair, black screen troubleshooting, incline repair, belt replacement, and onsite fitness equipment service in Dallas Fort Worth.',
}

export default function NordicTrackPage() {
  return (
    <BrandSupportPage
      eyebrow="NordicTrack Repair Experts"
      title="NordicTrack Repair Dallas"
      description="Professional NordicTrack treadmill repair, incline repair, software troubleshooting, black screen diagnostics, and preventative maintenance across Dallas Fort Worth."
      issues={[
        'Black screen after update',
        'Treadmill not powering on',
        'Incline calibration failure',
        'Belt slipping or stopping',
        'iFit loading issues',
        'Speed fluctuation problems',
        'Console freezing',
        'Clicking or grinding noises',
      ]}
      services={[
        'NordicTrack treadmill repair',
        'Elliptical repair',
        'Console diagnostics',
        'Software troubleshooting',
        'Belt replacement',
        'Preventative maintenance',
        'Commercial gym service',
        'Onsite diagnostics',
      ]}
      ctaTitle="Need NordicTrack Repair Fast?"
      ctaText="2EZ TEK provides professional onsite NordicTrack repair services throughout Dallas Fort Worth for residential and commercial gyms."
    />
  )
}
