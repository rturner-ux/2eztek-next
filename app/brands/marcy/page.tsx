import BrandSupportPage from '@/components/BrandSupportPage'

export const metadata = {
  title: 'Marcy Home Gym Repair Dallas TX | Assembly & Cable Service',
  description:
    '2EZ TEK provides Marcy home gym repair, assembly, cable replacement, pulley service, and onsite fitness equipment support across Dallas Fort Worth.',
}

export default function MarcyPage() {
  return (
    <BrandSupportPage
      eyebrow="Marcy Home Gym Service"
      title="Marcy Home Gym Repair Dallas"
      description="Professional Marcy home gym assembly, cable replacement, pulley repair, weight stack troubleshooting, and onsite fitness equipment service across Dallas Fort Worth."
      issues={[
        'Cable fraying or snapping',
        'Pulley misalignment',
        'Weight stack sticking',
        'Bent guide rods',
        'Loose frame hardware',
        'Missing assembly parts',
        'Seat or pad replacement issues',
        'Incorrect home gym assembly',
      ]}
      services={[
        'Marcy home gym assembly',
        'Cable replacement',
        'Pulley replacement',
        'Weight stack alignment',
        'Frame inspection and tightening',
        'Preventative maintenance',
        'Owner manual support',
        'Onsite diagnostics',
      ]}
      ctaTitle="Need Marcy Home Gym Service?"
      ctaText="2EZ TEK helps homeowners and small gyms with Marcy home gym repair, assembly, cable replacement, and ongoing equipment support."
    />
  )
}
