import type { Metadata } from 'next'
// Simple fallback ProjectsClient component to avoid missing module error.
function ProjectsClient() {
  return (
    <section>
      <h1>Projects</h1>
      <p>Project gallery is unavailable.</p>
    </section>
  )
}

export const metadata: Metadata = {
  title: 'Before & After Projects | 2EZ TEK',
  description:
    'See real before and after results from 2EZ TEK fitness equipment installations, repairs, and gym builds across Dallas Fort Worth. Drag the slider to compare.',
  alternates: { canonical: 'https://www.2eztek.com/projects' },
  openGraph: {
    title: 'Before & After Projects | 2EZ TEK',
    description: 'Real before and after fitness equipment transformations across Dallas Fort Worth.',
    url: 'https://www.2eztek.com/projects',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

export default function ProjectsPage() {
  return <ProjectsClient />
}
