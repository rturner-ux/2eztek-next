// app/terms-of-service/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | 2EZ TEK',
  description: 'Terms of service for 2EZ TEK fitness equipment repair and service company serving Dallas Fort Worth.',
  alternates: { canonical: 'https://www.2eztek.com/terms-of-service' },
  openGraph: {
    title: 'Terms of Service | 2EZ TEK',
    url: 'https://www.2eztek.com/terms-of-service',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-white px-6 py-32 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
          Legal
        </div>
        <h1 className="text-4xl font-black leading-tight md:text-6xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-white/45 text-sm">Last updated: May 2026</p>

        <div className="mt-12 space-y-10 text-white/70 leading-8">

          <section>
            <h2 className="text-2xl font-black text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using the 2EZ TEK website at 2eztek.com or requesting any services from 2EZ TEK LLC, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">2. Services</h2>
            <p>2EZ TEK LLC provides onsite fitness equipment repair, assembly, installation, maintenance, and diagnostics services across Dallas Fort Worth, Texas. Service availability is subject to technician scheduling and geographic coverage. All service appointments are subject to confirmation by our team.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">3. Service Requests and Appointments</h2>
            <p>Submitting a service request through our website or contact form does not constitute a confirmed appointment. A 2EZ TEK team member will contact you to confirm availability, pricing, and scheduling. Preferred service windows are not guaranteed and are subject to technician availability.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">4. Pricing and Payment</h2>
            <p>Service pricing is determined following an onsite diagnosis and inspection. We do not guarantee specific pricing prior to inspection. Final pricing will be communicated before work begins. Payment is due upon completion of service unless otherwise agreed in writing.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">5. Workmanship Warranty</h2>
            <p>2EZ TEK warrants our labor and workmanship on completed repairs for a period of 30 days from the date of service. This warranty covers defects in our workmanship only and does not cover parts, pre-existing conditions, misuse, or damage occurring after service is completed. Parts warranties are subject to manufacturer terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">6. Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law, 2EZ TEK LLC shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services or website. Our total liability for any claim related to our services shall not exceed the amount paid for the specific service giving rise to the claim.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">7. Customer Responsibilities</h2>
            <p>You agree to provide accurate information when submitting service requests. You are responsible for ensuring reasonable access to the equipment and service location. You agree to be present or have an authorized adult present during service visits.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">8. Intellectual Property</h2>
            <p>All content on the 2EZ TEK website, including text, images, logos, and design elements, is the property of 2EZ TEK LLC or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or use our content without written permission.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">9. Third-Party Links</h2>
            <p>Our website may contain links to third-party websites including SmartGymOps, equipment manufacturers, and other resources. We are not responsible for the content, privacy practices, or availability of third-party websites.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">10. Governing Law</h2>
            <p>These Terms of Service are governed by the laws of the State of Texas. Any disputes arising from these terms or our services shall be resolved in the courts of Dallas County, Texas.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">11. Changes to Terms</h2>
            <p>We reserve the right to update these Terms of Service at any time. Updated terms will be posted on this page with a revised date. Continued use of our website or services after changes are posted constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">12. Contact</h2>
            <p>For questions about these Terms of Service, contact us:</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-2">
              <p><span className="font-black text-white">2EZ TEK LLC</span></p>
              <p>Dallas Fort Worth, Texas</p>
              <p>Email: <a href="mailto:support@2eztek.com" className="text-cyan-400 hover:underline">support@2eztek.com</a></p>
              <p>Phone: <a href="tel:9728077232" className="text-cyan-400 hover:underline">(972) 807-7232</a></p>
            </div>
          </section>

        </div>

        <div className="mt-16 flex flex-wrap gap-4">
          <Link href="/privacy-policy" className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
            Privacy Policy
          </Link>
          <Link href="/contact" className="rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-cyan-300">
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  )
}
