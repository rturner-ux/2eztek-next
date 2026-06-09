import type { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About 2EZ TEK | Robby Turner, Founder | Fitness Equipment Repair DFW',
  description:
    'Meet Robby Turner, Founder and CEO of 2EZ TEK. Dallas Fort Worth fitness equipment repair, assembly, and commercial maintenance since 2016. 500+ five-star Google reviews.',
  alternates: {
    canonical: 'https://www.2eztek.com/about-2ez-tek',
  },
  openGraph: {
    title: 'About 2EZ TEK | Robby Turner, Founder | Fitness Equipment Repair DFW',
    description:
      'Meet Robby Turner, Founder and CEO of 2EZ TEK. Professional fitness equipment repair across Dallas Fort Worth since 2016.',
    url: 'https://www.2eztek.com/about-2ez-tek',
    siteName: '2EZ TEK',
    type: 'profile',
    images: ['/images/profile-image.jpg'],
  },
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Robby Turner',
  jobTitle: 'Founder & CEO',
  url: 'https://www.2eztek.com/about-2ez-tek',
  image: 'https://www.2eztek.com/images/profile-image.jpg',
  sameAs: ['https://www.linkedin.com/in/robbyturner'],
  worksFor: {
    '@type': 'Organization',
    name: '2EZ TEK',
    url: 'https://www.2eztek.com',
  },
  knowsAbout: [
    'Fitness Equipment Repair',
    'Treadmill Repair',
    'Commercial Gym Maintenance',
    'Process Improvement',
    'Six Sigma',
    'Scrum',
    'Asset Management',
  ],
  hasCredential: [
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'certification', name: 'Sports Nutritionist', recognizedBy: { '@type': 'Organization', name: 'ISSA' } },
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'certification', name: 'CPR & AED', recognizedBy: { '@type': 'Organization', name: 'ISSA' } },
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'certification', name: 'Certified Personal Trainer NCCPT-CPT', recognizedBy: { '@type': 'Organization', name: 'ISSA' } },
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'certification', name: 'Six Sigma Black Belt (CSSBB)', recognizedBy: { '@type': 'Organization', name: 'International Six Sigma Institute' } },
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'certification', name: 'Six Sigma Green Belt (CSSGB)', recognizedBy: { '@type': 'Organization', name: 'International Six Sigma Institute' } },
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'certification', name: 'Certified ScrumMaster (CSM)', recognizedBy: { '@type': 'Organization', name: 'Scrum.org' } },
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'certification', name: 'Scrum Master Certified (SMC)', recognizedBy: { '@type': 'Organization', name: 'International Six Sigma Institute' } },
  ],
}

export default function About2EZTEKPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <AboutClient />
    </>
  )
}
