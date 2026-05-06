'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminBlogPage() {
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')

  async function publishPost() {
    try {
      setLoading(true)

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')

      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title,
          slug,
          excerpt,
          content,
          category,
          cover_image: coverImage,
          published: true,
          seo_title: `${title} | 2EZ TEK`,
          seo_description: excerpt,
        })

      if (error) {
        alert(error.message)
        return
      }

      alert('Blog post published successfully.')

      setTitle('')
      setCategory('')
      setCoverImage('')
      setExcerpt('')
      setContent('')
    } catch (err) {
      console.error(err)
      alert('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
            SmartGymOps CMS
          </div>

          <h1 className="mt-6 text-5xl font-black">
            Blog Admin Dashboard
          </h1>

          <p className="mt-4 text-lg text-white/65">
            Publish SEO articles directly to the 2EZ TEK website.
          </p>
        </div>

        <div className="space-y-8 rounded-[2rem] border border-white/10 bg-black/25 p-8 backdrop-blur-2xl">
          <div>
            <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
              Blog Title
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: 5 Signs Your Treadmill Needs Repair"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
              Category
            </label>

            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Treadmill Repair"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
              Cover Image URL
            </label>

            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="/images/gym-equipment-repair-dallas.webp"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
              Excerpt
            </label>

            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={4}
              placeholder="Short article summary..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
              Article Content
            </label>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              placeholder="Write full article here..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
            />
          </div>

          <button
            onClick={publishPost}
            disabled={loading}
            className="rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Article'}
          </button>
        </div>
      </div>
    </main>
  )
}