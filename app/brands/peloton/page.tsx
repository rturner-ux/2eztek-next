import BrandSupportPage from '@/components/BrandSupportPage'

export const metadata = {
  title: 'Peloton Repair Dallas TX | Bike & Tread Service',
  description:
    '2EZ TEK provides Peloton bike repair, Peloton tread service, screen troubleshooting, calibration support, and onsite fitness equipment repair across Dallas Fort Worth.',
}

export default function PelotonPage() {
  return (
    <BrandSupportPage
      eyebrow="Peloton Repair Specialists"
      title="Peloton Repair Dallas"
      description="Professional Peloton bike repair, Peloton tread diagnostics, touchscreen troubleshooting, calibration service, and onsite fitness equipment repair throughout Dallas Fort Worth."
      issues={[
        'Peloton screen not turning on',
        'Resistance calibration problems',
        'Pedal or crank arm issues',
        'Belt slipping or noise',
        'Peloton tread error codes',
        'Connectivity and update issues',
        'Touchscreen freezing',
        'Clicking or grinding sounds',
      ]}
      services={[
        'Peloton bike repair',
        'Peloton tread service',
        'Screen diagnostics',
        'Resistance calibration',
        'Pedal and crank repair',
        'Preventative maintenance',
        'Belt inspection and adjustment',
        'Onsite diagnostics',
      ]}
      ctaTitle="Need Peloton Repair Fast?"
      ctaText="2EZ TEK provides professional onsite Peloton bike and tread repair services throughout Dallas Fort Worth."
    />
  )
}
