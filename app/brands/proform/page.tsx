import BrandSupportPage from '@/components/BrandSupportPage'

export const metadata = {
  title: 'ProForm Repair Dallas TX | Treadmill & Elliptical Service',
  description:
    '2EZ TEK provides ProForm treadmill repair, elliptical service, console troubleshooting, incline diagnostics, and onsite fitness equipment repair across Dallas Fort Worth.',
}

export default function ProFormPage() {
  return (
    <BrandSupportPage
      eyebrow="ProForm Repair Experts"
      title="ProForm Repair Dallas"
      description="Professional ProForm treadmill repair, elliptical diagnostics, incline troubleshooting, black screen repair, and onsite fitness equipment service throughout Dallas Fort Worth."
      issues={[
        'Black screen or frozen console',
        'Treadmill not powering on',
        'Incline not working properly',
        'Belt slipping or stopping',
        'iFit software update problems',
        'Resistance issues on ellipticals',
        'Speed fluctuation problems',
        'Loud squeaking or grinding noises',
      ]}
      services={[
        'ProForm treadmill repair',
        'Elliptical diagnostics',
        'Console troubleshooting',
        'Software and iFit support',
        'Belt replacement and adjustment',
        'Preventative maintenance',
        'Commercial gym service',
        'Onsite diagnostics',
      ]}
      ctaTitle="Need ProForm Repair Fast?"
      ctaText="2EZ TEK provides professional onsite ProForm repair services for residential and commercial fitness clients across Dallas Fort Worth."
    />
  )
}
