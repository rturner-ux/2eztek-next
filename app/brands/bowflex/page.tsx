import BrandSupportPage from '@/components/BrandSupportPage'

export const metadata = {
  title: 'Bowflex Repair Dallas TX | Home Gym & Treadmill Service',
  description:
    '2EZ TEK provides Bowflex repair, treadmill troubleshooting, home gym assembly, cable replacement, and onsite fitness equipment service in Dallas Fort Worth.',
}

export default function BowflexPage() {
  return (
    <BrandSupportPage
      eyebrow="Bowflex Repair & Assembly"
      title="Bowflex Repair Dallas"
      description="Professional Bowflex treadmill repair, home gym assembly, cable replacement, resistance issue diagnostics, and onsite fitness equipment service across Dallas Fort Worth."
      issues={[
        'Treadmill not powering on',
        'Belt slipping or stopping',
        'Console error messages',
        'Resistance not changing',
        'Cable or pulley problems',
        'Loose frame or hardware',
        'Assembly alignment issues',
        'Squeaking or grinding noises',
      ]}
      services={[
        'Bowflex treadmill repair',
        'Bowflex home gym assembly',
        'Cable and pulley inspection',
        'Resistance troubleshooting',
        'Belt adjustment and replacement',
        'Preventative maintenance',
        'Onsite diagnostics',
        'Residential fitness equipment service',
      ]}
      ctaTitle="Need Bowflex Service in Dallas Fort Worth?"
      ctaText="2EZ TEK provides professional onsite Bowflex repair, assembly, and maintenance service for residential and light commercial customers."
      affiliateUrl="https://johnsonhealthtechretailinc.sjv.io/9VnjnY"
      affiliateBrand="Bowflex"
    />
  )
}
