import BrandSupportPage from '@/components/BrandSupportPage'

export const metadata = {
  title: 'Goalrilla Basketball Hoops Dallas TX | 2EZ TEK',
  description:
    '2EZ TEK offers Goalrilla basketball hoop assembly and installation across Dallas Fort Worth. Professional setup, anchoring, and backboard alignment.',
}

export default function GoalrillaPage() {
  return (
    <BrandSupportPage
      eyebrow="Goalrilla Assembly & Installation"
      title="Goalrilla Basketball Hoop Installation Dallas"
      description="Professional Goalrilla basketball hoop assembly and installation across Dallas Fort Worth. We handle anchor system setup, pole assembly, backboard mounting, and rim alignment so your hoop is level, safe, and ready to use."
      issues={[
        'Hoop not level after installation',
        'Anchor system setup',
        'Backboard cracking or damage',
        'Rim alignment issues',
        'Pole wobble or instability',
        'Net replacement',
        'Height adjustment mechanism issues',
        'Relocation of existing hoop',
      ]}
      services={[
        'Goalrilla hoop assembly',
        'In-ground anchor installation',
        'Backboard and rim mounting',
        'Leveling and alignment',
        'Net installation',
        'Height adjustment setup',
        'Hoop relocation',
        'Post-installation inspection',
      ]}
      ctaTitle="Need Goalrilla Installation in Dallas Fort Worth?"
      ctaText="2EZ TEK provides professional Goalrilla basketball hoop assembly and installation for homeowners across Dallas Fort Worth."
      affiliateUrl="https://goalrilla.sjv.io/rELqLd"
      affiliateBrand="Goalrilla"
    />
  )
}
