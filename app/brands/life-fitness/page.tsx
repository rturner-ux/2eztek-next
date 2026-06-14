import BrandSupportPage from '@/components/BrandSupportPage'

export const metadata = {
  title: 'Life Fitness Repair Dallas TX | Commercial & Home Gym Service',
  description:
    '2EZ TEK provides Life Fitness and Hammer Strength repair, preventative maintenance, console diagnostics, and onsite service across Dallas Fort Worth.',
}

export default function LifeFitnessPage() {
  return (
    <BrandSupportPage
      eyebrow="Life Fitness & Hammer Strength Repair"
      title="Life Fitness Repair Dallas"
      description="Professional Life Fitness and Hammer Strength repair, preventative maintenance, console diagnostics, and onsite fitness equipment service for residential and commercial clients across Dallas Fort Worth."
      issues={[
        'Treadmill belt slipping or stopping',
        'Console not powering on or error codes',
        'Incline motor not responding',
        'Resistance issues on bikes and ellipticals',
        'Grinding or clicking noises',
        'Cable or pulley wear on Hammer Strength',
        'Weight stack issues',
        'Display or touchscreen failures',
      ]}
      services={[
        'Life Fitness treadmill repair',
        'Life Fitness elliptical repair',
        'Life Fitness exercise bike service',
        'Hammer Strength cable and pulley repair',
        'Console and display diagnostics',
        'Preventative maintenance programs',
        'Onsite commercial gym service',
        'Residential Life Fitness equipment repair',
      ]}
      ctaTitle="Need Life Fitness Service in Dallas Fort Worth?"
      ctaText="2EZ TEK provides professional onsite Life Fitness and Hammer Strength repair and maintenance for residential clients and commercial facilities across DFW."
      affiliateUrl="https://lifefitness.sjv.io/b36Ae6"
      affiliateBrand="Life Fitness"
    />
  )
}
