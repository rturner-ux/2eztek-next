import { notFound } from 'next/navigation'
import Link from 'next/link'
import BookServiceButton from '@/components/BookServiceButton'
import { TONAL_ARTICLES, getArticleBySlug } from '../articles'

const CATEGORY_ANCHORS: Record<string, string> = {
  'Installation': 'installation',
  'Getting Started': 'getting-started',
  'Features & Functions': 'features',
  'Account & Membership': 'account',
  'Troubleshooting': 'troubleshooting',
  'Relocation': 'relocation',
  'Partnerships & Perks': 'partnerships',
  'Warranty & Legal': 'warranty',
  'General Questions': 'general',
}

export async function generateStaticParams() {
  return TONAL_ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}
  return {
    title: `${article.title} | Tonal Support | 2EZ TEK`,
    description: article.seoDescription,
    alternates: {
      canonical: `https://www.2eztek.com/manuals/tonal/${article.slug}`,
    },
  }
}

export default async function TonalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const relatedArticles = TONAL_ARTICLES.filter(
    (a) => a.category === article.category && a.slug !== article.slug
  ).slice(0, 4)

  const isTroubleshooting =
    article.category === 'Troubleshooting' || article.category === 'Getting Started'

  const categoryAnchor = CATEGORY_ANCHORS[article.category] ?? ''

  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* Breadcrumb */}
      <nav className="border-b border-slate-200 bg-slate-50 px-6 py-3">
        <div className="mx-auto max-w-4xl flex items-center gap-2 text-sm flex-wrap">
          <Link href="/manuals" className="font-medium text-cyan-600 hover:text-cyan-800 hover:underline">
            Manuals
          </Link>
          <span className="text-slate-400">›</span>
          <Link href="/manuals/tonal" className="font-medium text-cyan-600 hover:text-cyan-800 hover:underline">
            Tonal Support
          </Link>
          <span className="text-slate-400">›</span>
          <Link
            href={`/manuals/tonal#${categoryAnchor}`}
            className="font-medium text-cyan-600 hover:text-cyan-800 hover:underline"
          >
            {article.category}
          </Link>
          <span className="text-slate-400">›</span>
          <span className="text-slate-500">{article.title}</span>
        </div>
      </nav>

      {/* Article */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Tonal Support &rsaquo; {article.category}
        </div>
        <h1 className="text-3xl font-black leading-tight text-slate-900 md:text-4xl">
          {article.title}
        </h1>

        {/* Article content */}
        <div
          className="prose prose-slate mt-8 max-w-none
            prose-h2:text-2xl prose-h2:font-black prose-h2:text-slate-900 prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:font-black prose-h3:text-slate-800
            prose-p:text-slate-600 prose-p:leading-relaxed
            prose-ul:text-slate-600 prose-ol:text-slate-600
            prose-li:my-1
            prose-strong:text-slate-900"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Repair CTA for troubleshooting/mechanical articles */}
        {isTroubleshooting && (
          <div className="mt-12 border border-cyan-200 bg-cyan-50 p-8">
            <h2 className="text-xl font-black text-slate-900">
              Need professional Tonal service in Dallas Fort Worth?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              2EZ TEK technicians diagnose and repair Tonal systems across DFW.
              Same-week appointments available for both in-warranty and out-of-warranty units.
            </p>
            <div className="mt-6">
              <BookServiceButton className="bg-cyan-400 px-7 py-3 text-sm font-black uppercase tracking-wide text-black transition hover:bg-cyan-300" />
            </div>
          </div>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-4 text-lg font-black text-slate-900">
              More in {article.category}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/manuals/tonal/${rel.slug}`}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  <span className="mt-0.5 text-slate-400">📄</span>
                  <span className="text-sm font-medium text-slate-800">{rel.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-10 border-t border-slate-100 pt-6">
          <Link href="/manuals/tonal" className="text-sm font-bold text-cyan-600 hover:text-cyan-700">
            ← Back to Tonal Support Center
          </Link>
        </div>
      </div>

    </main>
  )
}
